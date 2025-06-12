// Servicio de almacenamiento local para el progreso del usuario

import { UserProgress, StorageConfig, DEFAULT_STORAGE_CONFIG, ValidationResult } from '@/types/user-progress';
import { getAllCarreras } from '@/data/carreras';

export class StorageService {
  private config: StorageConfig;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(config: StorageConfig = DEFAULT_STORAGE_CONFIG) {
    this.config = config;
  }

  /**
   * Genera clave específica por carrera
   */
  private getStorageKey(carreraLink?: string): string {
    if (carreraLink) {
      return `${this.config.storageKey}-${carreraLink}`;
    }
    return this.config.storageKey; // Fallback para compatibilidad
  }

  /**
   * Obtiene el progreso del usuario desde localStorage por carrera
   */
  getUserProgress(carreraLink?: string): UserProgress | null {
    try {
      if (typeof window === 'undefined') {
        return null; // SSR safety
      }

      const storageKey = this.getStorageKey(carreraLink);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as UserProgress;
      
      // Validar consistencia si se especificó carrera
      if (carreraLink && parsed.carrera !== carreraLink) {
        console.warn(`Inconsistencia: esperaba ${carreraLink}, encontró ${parsed.carrera}`);
        return null;
      }
      
      // Validar datos antes de usar
      const validation = this.validateUserProgress(parsed);
      if (!validation.isValid) {
        console.warn('Datos corruptos detectados, migrando...', validation.errors);
        return this.migrateData(parsed);
      }
      
      // Validar versión
      if (parsed.version !== this.config.version) {
        console.warn('Versión de datos incompatible, migrando...');
        return this.migrateData(parsed);
      }

      return parsed;
    } catch (error) {
      console.error(`Error cargando progreso de ${carreraLink || 'usuario'}:`, error);
      return null;
    }
  }

  /**
   * Guarda el progreso del usuario en localStorage
   */
  saveUserProgress(progress: UserProgress): boolean {
    try {
      if (typeof window === 'undefined') {
        return false; // SSR safety
      }

      // Actualizar timestamp
      progress.lastModified = new Date().toISOString();
      progress.version = this.config.version;

      // Validar datos antes de guardar
      const validation = this.validateUserProgress(progress);
      if (!validation.isValid) {
        console.error('Datos inválidos:', validation.errors);
        return false;
      }

      const storageKey = this.getStorageKey(progress.carrera);
      localStorage.setItem(storageKey, JSON.stringify(progress));
      
      console.log(`Progreso guardado: ${storageKey}`);
      return true;
    } catch (error) {
      console.error('Error al guardar progreso:', error);
      return false;
    }
  }

  /**
   * Inicializa un nuevo progreso para una carrera
   */
  initializeUserProgress(carrera: string): UserProgress {
    const newProgress: UserProgress = {
      carrera,
      version: this.config.version,
      lastModified: new Date().toISOString(),
      semestres: {},
      reprobaciones: [],
      ravUsados: 0,
      ravDisponibles: 5
    };

    this.saveUserProgress(newProgress);
    return newProgress;
  }

  /**
   * Valida la estructura del progreso del usuario
   */
  private validateUserProgress(progress: UserProgress): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones básicas
    if (!progress.carrera) {
      errors.push('Carrera es requerida');
    }

    if (!progress.version) {
      errors.push('Versión es requerida');
    }

    if (!progress.lastModified) {
      errors.push('Fecha de modificación es requerida');
    }

    if (!progress.semestres || typeof progress.semestres !== 'object') {
      errors.push('Semestres debe ser un objeto');
    }

    if (!Array.isArray(progress.reprobaciones)) {
      errors.push('Reprobaciones debe ser un array');
    }

    // Validar estructura de semestres
    Object.entries(progress.semestres).forEach(([semestreId, semestreData]) => {
      if (!Array.isArray(semestreData.cursos)) {
        errors.push(`Semestre ${semestreId}: cursos debe ser un array`);
      }

      semestreData.cursos.forEach((curso, index) => {
        if (!curso.cursoId || typeof curso.cursoId !== 'number') {
          errors.push(`Semestre ${semestreId}, curso ${index}: cursoId inválido`);
        }

        if (!curso.instanceId || typeof curso.instanceId !== 'string') {
          errors.push(`Semestre ${semestreId}, curso ${index}: instanceId inválido`);
        }

        if (!['en-curso', 'aprobado', 'reprobado', 'rav'].includes(curso.estado)) {
          errors.push(`Semestre ${semestreId}, curso ${index}: estado inválido`);
        }

        if (!curso.vtr || curso.vtr < 1) {
          errors.push(`Semestre ${semestreId}, curso ${index}: vtr debe ser >= 1`);
        }
      });
    });

    // Validar reprobaciones
    progress.reprobaciones.forEach((reprobacion, index) => {
      if (!reprobacion.cursoId || typeof reprobacion.cursoId !== 'number') {
        errors.push(`Reprobación ${index}: cursoId inválido`);
      }

      if (!Array.isArray(reprobacion.instanciasCreadas)) {
        errors.push(`Reprobación ${index}: instanciasCreadas debe ser un array`);
      }

      if (!reprobacion.ultimoVtr || reprobacion.ultimoVtr < 1) {
        errors.push(`Reprobación ${index}: ultimoVtr debe ser >= 1`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Migra datos de versiones anteriores
   */
  private migrateData(oldData: any): UserProgress | null {
    try {
      console.log('Migrando datos de versión anterior...');
      
      if (!oldData.carrera) {
        return null;
      }

      // Migrar estados de 'pendiente' a 'en-curso'
      if (oldData.semestres) {
        Object.values(oldData.semestres).forEach((semestreData: any) => {
          if (Array.isArray(semestreData.cursos)) {
            semestreData.cursos.forEach((curso: any) => {
              if (curso.estado === 'pendiente') {
                curso.estado = 'en-curso';
                console.log(`Migrado estado de 'pendiente' a 'en-curso' para curso ${curso.cursoId}`);
              }
            });
          }
        });
      }

      // Actualizar versión
      oldData.version = this.config.version;
      oldData.lastModified = new Date().toISOString();

      // Validar datos migrados
      const validation = this.validateUserProgress(oldData);
      if (validation.isValid) {
        console.log('Migración exitosa');
        return oldData;
      } else {
        console.warn('Datos migrados aún tienen errores, inicializando nuevos:', validation.errors);
        return this.initializeUserProgress(oldData.carrera);
      }
    } catch (error) {
      console.error('Error en migración de datos:', error);
      if (oldData.carrera) {
        return this.initializeUserProgress(oldData.carrera);
      }
      return null;
    }
  }

  /**
   * Crea un backup del progreso actual
   */
  createBackup(): string | null {
    try {
      const progress = this.getUserProgress();
      if (!progress) {
        return null;
      }

      const backup = {
        ...progress,
        backupDate: new Date().toISOString()
      };

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Error al crear backup:', error);
      return null;
    }
  }

  /**
   * Restaura desde un backup
   */
  restoreFromBackup(backupData: string): boolean {
    try {
      const parsed = JSON.parse(backupData);
      
      // Remover metadatos del backup
      delete parsed.backupDate;
      
      const validation = this.validateUserProgress(parsed);
      if (!validation.isValid) {
        console.error('Backup inválido:', validation.errors);
        return false;
      }

      return this.saveUserProgress(parsed);
    } catch (error) {
      console.error('Error al restaurar backup:', error);
      return false;
    }
  }

  /**
   * Limpia el progreso de una carrera específica
   */
  clearUserProgress(carreraLink?: string): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      if (carreraLink) {
        const storageKey = this.getStorageKey(carreraLink);
        localStorage.removeItem(storageKey);
        console.log(`Progreso eliminado: ${storageKey}`);
      } else {
        // Limpiar todas las carreras registradas
        getAllCarreras().forEach(carrera => {
          const key = this.getStorageKey(carrera.link);
          localStorage.removeItem(key);
        });
        // También limpiar la clave antigua por compatibilidad
        localStorage.removeItem(this.config.storageKey);
        console.log('Progreso de todas las carreras eliminado');
      }
      
      return true;
    } catch (error) {
      console.error(`Error eliminando progreso de ${carreraLink || 'todas las carreras'}:`, error);
      return false;
    }
  }

  /**
   * Obtiene todos los LINKs con progreso
   */
  getLinksWithProgress(): string[] {
    if (typeof window === 'undefined') return [];

    const linksWithProgress: string[] = [];
    
    getAllCarreras().forEach(carrera => {
      const progress = this.getUserProgress(carrera.link);
      if (progress) {
        linksWithProgress.push(carrera.link);
      }
    });

    return linksWithProgress;
  }

  /**
   * Migra datos existentes de la clave antigua a las nuevas claves específicas
   */
  migrateExistingData(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      // Buscar datos en la clave antigua
      const oldData = localStorage.getItem(this.config.storageKey);
      if (!oldData) return true; // No hay datos que migrar

      const parsed = JSON.parse(oldData);
      if (!parsed.carrera) return false;

      // Guardar en la nueva clave específica
      const newKey = this.getStorageKey(parsed.carrera);
      localStorage.setItem(newKey, oldData);

      // Eliminar la clave antigua
      localStorage.removeItem(this.config.storageKey);

      console.log(`Datos migrados de ${this.config.storageKey} a ${newKey}`);
      return true;
    } catch (error) {
      console.error('Error en migración:', error);
      return false;
    }
  }

  /**
   * Inicia el auto-guardado
   */
  startAutoSave(saveCallback: () => void): void {
    this.stopAutoSave();
    
    this.autoSaveTimer = setInterval(() => {
      saveCallback();
    }, this.config.autoSaveInterval);
  }

  /**
   * Detiene el auto-guardado
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Obtiene estadísticas del almacenamiento
   */
  getStorageStats(): { size: number; lastModified: string | null } {
    try {
      if (typeof window === 'undefined') {
        return { size: 0, lastModified: null };
      }

      const stored = localStorage.getItem(this.config.storageKey);
      const progress = this.getUserProgress();

      return {
        size: stored ? new Blob([stored]).size : 0,
        lastModified: progress?.lastModified || null
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { size: 0, lastModified: null };
    }
  }

  /**
   * Fuerza la limpieza de datos corruptos y reinicializa
   */
  forceCleanAndReinitialize(carreraLink: string): UserProgress {
    console.log(`Forzando limpieza de datos corruptos para ${carreraLink}`);
    
    // Limpiar localStorage
    this.clearUserProgress(carreraLink);
    
    // Crear nuevo progreso limpio
    return this.initializeUserProgress(carreraLink);
  }
}

// Instancia singleton del servicio
export const storageService = new StorageService();
