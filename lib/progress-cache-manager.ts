// Gestor centralizado de cache de progreso para todas las carreras
// Sincroniza entre localStorage y archivos userprogress_X.ts

import { UserProgress } from '@/types/user-progress';
import { storageService } from './storage-service';
import { carreraStateManager } from './carrera-state-manager';
import { CarreraType } from '@/types/carrera-state';
import { getCarreraById, idToLink } from '@/data/carreras';

// Importar funciones de cache por carrera
import {
  userProgressINF,
  initializeINFProgress,
  updateINFProgress,
  getINFProgress,
  clearINFProgress,
  isINFProgressInitialized,
  getINFProgressStats,
  exportINFProgress,
  importINFProgress
} from '@/data/userprogress_INF';

import {
  userProgressMAT,
  initializeMATProgress,
  updateMATProgress,
  getMATProgress,
  clearMATProgress,
  isMATProgressInitialized
} from '@/data/userprogress_MAT';

import {
  userProgressFIS,
  initializeFISProgress,
  updateFISProgress,
  getFISProgress,
  clearFISProgress,
  isFISProgressInitialized
} from '@/data/userprogress_FIS';

export class ProgressCacheManager {
  private currentCarreraId: number | null = null;
  private currentCarreraLink: string | null = null;

  /**
   * Verifica si existe progreso para una carrera por ID
   */
  hasProgressForCarrera(carreraId: number): boolean {
    // 1. ID → LINK
    const carreraLink = idToLink(carreraId);
    if (!carreraLink) return false;

    // 2. LINK → Verificar cache
    const hasCache = this.hasCacheByLink(carreraLink);
    if (hasCache) return true;

    // 3. LINK → Verificar storage
    const progress = storageService.getUserProgress(carreraLink);
    return progress !== null;
  }

  /**
   * Inicializa el cache para una carrera específica por ID
   */
  initializeCarrera(carreraId: number): UserProgress {
    // 1. ID → Carrera Info
    const carrera = getCarreraById(carreraId);
    if (!carrera) {
      throw new Error(`Carrera con ID ${carreraId} no encontrada`);
    }

    if (!carrera.activa) {
      throw new Error(`Carrera ${carrera.nombre} (ID: ${carreraId}) no está activa`);
    }

    // 2. Extraer LINK
    const carreraLink = carrera.link;
    
    // 3. Usar LINK para operaciones internas
    this.currentCarreraId = carreraId;
    this.currentCarreraLink = carreraLink;

    // 4. LINK → Storage
    let storedProgress = storageService.getUserProgress(carreraLink);
    
    if (storedProgress && storedProgress.carrera === carreraLink) {
      // Sincronizar con cache usando LINK
      this.updateCacheByLink(carreraLink, storedProgress);
      carreraStateManager.setActiveCarrera(carreraLink as CarreraType);
      carreraStateManager.markCarreraWithProgress(carreraLink as CarreraType);
      return storedProgress;
    }

    // 5. LINK → Inicialización (o limpieza forzada si hay datos corruptos)
    let newProgress: UserProgress;
    
    try {
      newProgress = this.createNewProgressByLink(carreraLink);
      storageService.saveUserProgress(newProgress);
    } catch (error) {
      console.warn('Error al crear progreso inicial, forzando limpieza:', error);
      newProgress = storageService.forceCleanAndReinitialize(carreraLink);
    }
    
    this.updateCacheByLink(carreraLink, newProgress);
    carreraStateManager.setActiveCarrera(carreraLink as CarreraType);
    carreraStateManager.markCarreraWithProgress(carreraLink as CarreraType);
    
    return newProgress;
  }

  /**
   * Cambia entre carreras por ID sin perder datos
   */
  switchCarrera(carreraId: number): UserProgress {
    // 1. ID → Carrera Info
    const carrera = getCarreraById(carreraId);
    if (!carrera) {
      throw new Error(`Carrera con ID ${carreraId} no encontrada`);
    }

    // 2. Guardar progreso actual si existe
    if (this.currentCarreraLink) {
      const currentProgress = this.getProgressByLink(this.currentCarreraLink);
      if (currentProgress) {
        storageService.saveUserProgress(currentProgress);
      }
    }

    // 3. Cambiar a nueva carrera
    return this.initializeCarrera(carreraId);
  }

  /**
   * Verifica si existe cache por LINK
   */
  private hasCacheByLink(carreraLink: string): boolean {
    switch (carreraLink) {
      case 'INF': return isINFProgressInitialized();
      case 'MAT': return isMATProgressInitialized();
      case 'FIS': return isFISProgressInitialized();
      default: return false;
    }
  }

  /**
   * Actualiza cache por LINK
   */
  private updateCacheByLink(carreraLink: string, progress: UserProgress): void {
    switch (carreraLink) {
      case 'INF': updateINFProgress(progress); break;
      case 'MAT': updateMATProgress(progress); break;
      case 'FIS': updateFISProgress(progress); break;
      default: throw new Error(`Cache no implementado para ${carreraLink}`);
    }
  }

  /**
   * Crea nuevo progreso por LINK
   */
  private createNewProgressByLink(carreraLink: string): UserProgress {
    switch (carreraLink) {
      case 'INF': return initializeINFProgress();
      case 'MAT': return initializeMATProgress();
      case 'FIS': return initializeFISProgress();
      default: throw new Error(`Inicialización no implementada para ${carreraLink}`);
    }
  }

  /**
   * Obtiene progreso por LINK
   */
  private getProgressByLink(carreraLink: string): UserProgress | null {
    switch (carreraLink) {
      case 'INF': return getINFProgress();
      case 'MAT': return getMATProgress();
      case 'FIS': return getFISProgress();
      default: return null;
    }
  }

  /**
   * Obtiene el progreso actual de una carrera
   */
  getProgress(carrera: CarreraType): UserProgress | null {
    switch (carrera) {
      case 'INF':
        return getINFProgress();
      case 'MAT':
        return getMATProgress();
      case 'FIS':
        return getFISProgress();
      default:
        return null;
    }
  }

  /**
   * Actualiza el progreso de una carrera en cache y localStorage
   */
  updateProgress(carrera: CarreraType, progress: UserProgress): boolean {
    try {
      // Validar que la carrera coincida
      if (progress.carrera !== carrera) {
        throw new Error(`Carrera del progreso (${progress.carrera}) no coincide con la esperada (${carrera})`);
      }

      // Actualizar cache local
      this.updateCache(carrera, progress);

      // Guardar en localStorage
      const success = storageService.saveUserProgress(progress);
      
      if (!success) {
        console.error('Error al guardar en localStorage');
        return false;
      }

      console.log(`Progreso de ${carrera} actualizado exitosamente`);
      return true;
    } catch (error) {
      console.error(`Error al actualizar progreso de ${carrera}:`, error);
      return false;
    }
  }

  /**
   * Actualiza el cache local para una carrera específica
   */
  private updateCache(carrera: CarreraType, progress: UserProgress): void {
    switch (carrera) {
      case 'INF':
        updateINFProgress(progress);
        break;
      case 'MAT':
        updateMATProgress(progress);
        break;
      case 'FIS':
        updateFISProgress(progress);
        break;
      default:
        throw new Error(`Carrera no soportada: ${carrera}`);
    }
  }

  /**
   * Verifica si una carrera está inicializada
   */
  isCarreraInitialized(carrera: CarreraType): boolean {
    switch (carrera) {
      case 'INF':
        return isINFProgressInitialized();
      case 'MAT':
        return isMATProgressInitialized();
      case 'FIS':
        return isFISProgressInitialized();
      default:
        return false;
    }
  }

  /**
   * Limpia el progreso de una carrera
   */
  clearProgress(carrera: CarreraType): boolean {
    try {
      // Limpiar cache local
      switch (carrera) {
        case 'INF':
          clearINFProgress();
          break;
        case 'MAT':
          clearMATProgress();
          break;
        case 'FIS':
          clearFISProgress();
          break;
        default:
          throw new Error(`Carrera no soportada: ${carrera}`);
      }

      // Limpiar localStorage si es la carrera actual
      const storedProgress = storageService.getUserProgress();
      if (storedProgress && storedProgress.carrera === carrera) {
        storageService.clearUserProgress();
      }

      console.log(`Progreso de ${carrera} limpiado exitosamente`);
      return true;
    } catch (error) {
      console.error(`Error al limpiar progreso de ${carrera}:`, error);
      return false;
    }
  }

  /**
   * Sincroniza el cache con localStorage
   */
  syncWithStorage(carrera: CarreraType): boolean {
    try {
      const storedProgress = storageService.getUserProgress();
      
      if (!storedProgress || storedProgress.carrera !== carrera) {
        console.log(`No hay datos en localStorage para ${carrera}`);
        return false;
      }

      this.updateCache(carrera, storedProgress);
      console.log(`Cache de ${carrera} sincronizado con localStorage`);
      return true;
    } catch (error) {
      console.error(`Error al sincronizar cache de ${carrera}:`, error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de progreso (solo disponible para INF por ahora)
   */
  getProgressStats(carrera: CarreraType) {
    switch (carrera) {
      case 'INF':
        return getINFProgressStats();
      case 'MAT':
      case 'FIS':
        // Placeholder para futuras implementaciones
        return {
          totalSemestres: 0,
          totalCursos: 0,
          cursosAprobados: 0,
          cursosReprobados: 0,
          cursosPendientes: 0,
          totalReprobaciones: 0
        };
      default:
        return null;
    }
  }

  /**
   * Exporta el progreso de una carrera
   */
  exportProgress(carrera: CarreraType): string | null {
    switch (carrera) {
      case 'INF':
        return exportINFProgress();
      case 'MAT':
      case 'FIS':
        // Para MAT y FIS, usar el método genérico
        const progress = this.getProgress(carrera);
        if (!progress) return null;
        
        return JSON.stringify({
          ...progress,
          exportDate: new Date().toISOString()
        }, null, 2);
      default:
        return null;
    }
  }

  /**
   * Importa progreso para una carrera
   */
  importProgress(carrera: CarreraType, jsonData: string): boolean {
    switch (carrera) {
      case 'INF':
        const success = importINFProgress(jsonData);
        if (success) {
          // Sincronizar con localStorage
          const progress = getINFProgress();
          if (progress) {
            storageService.saveUserProgress(progress);
          }
        }
        return success;
      case 'MAT':
      case 'FIS':
        // Implementación genérica para MAT y FIS
        try {
          const parsed = JSON.parse(jsonData);
          
          if (parsed.carrera !== carrera) {
            console.error(`Los datos importados no son para la carrera ${carrera}`);
            return false;
          }

          delete parsed.exportDate;
          
          if (!parsed.version || !parsed.semestres || !Array.isArray(parsed.reprobaciones)) {
            console.error('Estructura de datos inválida');
            return false;
          }

          return this.updateProgress(carrera, parsed);
        } catch (error) {
          console.error(`Error al importar progreso de ${carrera}:`, error);
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Obtiene el ID de la carrera actualmente activa
   */
  getCurrentCarreraId(): number | null {
    return this.currentCarreraId;
  }

  /**
   * Obtiene el LINK de la carrera actualmente activa
   */
  getCurrentCarreraLink(): string | null {
    return this.currentCarreraLink;
  }

  /**
   * Obtiene el progreso actual
   */
  getCurrentProgress(): UserProgress | null {
    if (!this.currentCarreraLink) return null;
    return this.getProgressByLink(this.currentCarreraLink);
  }

  /**
   * Limpia progreso por ID
   */
  clearProgressById(carreraId: number): boolean {
    // 1. ID → Carrera Info
    const carrera = getCarreraById(carreraId);
    if (!carrera) {
      console.error(`Carrera con ID ${carreraId} no encontrada`);
      return false;
    }

    // 2. LINK → Limpiar cache
    const carreraLink = carrera.link;
    try {
      switch (carreraLink) {
        case 'INF': clearINFProgress(); break;
        case 'MAT': clearMATProgress(); break;
        case 'FIS': clearFISProgress(); break;
        default: 
          console.warn(`Cache no implementado para ${carreraLink}`);
      }

      // 3. LINK → Limpiar storage
      const success = storageService.clearUserProgress(carreraLink);
      
      if (success) {
        console.log(`Progreso de ${carrera.nombre} (${carreraLink}) limpiado`);
      }
      
      return success;
    } catch (error) {
      console.error(`Error limpiando progreso de ${carrera.nombre}:`, error);
      return false;
    }
  }

  /**
   * Resetea la carrera actual al estado inicial (solo primer semestre)
   */
  resetCurrentCarreraToFirstSemester(carrera: CarreraType): UserProgress {
    try {
      console.log(`Reseteando carrera ${carrera} al primer semestre`);
      
      // 1. Limpiar cache actual
      this.clearProgress(carrera);
      
      // 2. Convertir LINK a ID para reinicializar
      const carreraInfo = getCarreraById(carrera === 'INF' ? 1 : carrera === 'MAT' ? 2 : 3);
      if (!carreraInfo) {
        throw new Error(`Carrera ${carrera} no encontrada`);
      }
      
      // 3. Reinicializar con cursos del primer semestre
      const newProgress = this.createNewProgressByLink(carrera);
      
      // 4. Guardar en storage
      storageService.saveUserProgress(newProgress);
      
      // 5. Actualizar cache
      this.updateCacheByLink(carrera, newProgress);
      
      // 6. Actualizar estado del sistema
      carreraStateManager.setActiveCarrera(carrera);
      carreraStateManager.markCarreraWithProgress(carrera);
      
      console.log(`Carrera ${carrera} reseteada exitosamente al primer semestre`);
      return newProgress;
    } catch (error) {
      console.error(`Error reseteando carrera ${carrera}:`, error);
      throw error;
    }
  }

  /**
   * Limpia todo el progreso del sistema y reinicializa la carrera actual
   */
  clearAllProgressAndReinitializeCurrent(currentCarrera: CarreraType): UserProgress {
    try {
      console.log(`Limpiando todo el cache del sistema, manteniendo ${currentCarrera}`);
      
      // 1. Limpiar todos los caches
      clearINFProgress();
      clearMATProgress();
      clearFISProgress();
      
      // 2. Limpiar todo el localStorage (todas las carreras)
      storageService.clearUserProgress(); // Sin parámetro limpia todas
      
      // 3. Reinicializar solo la carrera actual
      const carreraInfo = getCarreraById(currentCarrera === 'INF' ? 1 : currentCarrera === 'MAT' ? 2 : 3);
      if (!carreraInfo) {
        throw new Error(`Carrera ${currentCarrera} no encontrada`);
      }
      
      const newProgress = this.createNewProgressByLink(currentCarrera);
      
      // 4. Guardar en storage
      storageService.saveUserProgress(newProgress);
      
      // 5. Actualizar cache
      this.updateCacheByLink(currentCarrera, newProgress);
      
      // 6. Actualizar estado del sistema
      carreraStateManager.setActiveCarrera(currentCarrera);
      carreraStateManager.markCarreraWithProgress(currentCarrera);
      
      // 7. Limpiar estado de otras carreras en el manager
      const allCarreras: CarreraType[] = ['INF', 'MAT', 'FIS'];
      allCarreras.forEach(carrera => {
        if (carrera !== currentCarrera) {
          carreraStateManager.clearCarreraProgress(carrera);
        }
      });
      
      console.log(`Cache completo limpiado, ${currentCarrera} reinicializada`);
      return newProgress;
    } catch (error) {
      console.error(`Error limpiando cache completo:`, error);
      throw error;
    }
  }
}

// Instancia singleton del gestor de cache
export const progressCacheManager = new ProgressCacheManager();
