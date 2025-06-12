// Gestor del estado de carreras activas
// Maneja qué carrera está activa y cuáles tienen progreso guardado

import { CarreraState, CarreraInfo, CarreraType, DEFAULT_CARRERA_STATE, CARRERA_STATE_STORAGE_KEY } from '@/types/carrera-state';

export class CarreraStateManager {
  private state: CarreraState = DEFAULT_CARRERA_STATE;
  private isClient: boolean = false;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.loadState();
    }
  }

  /**
   * Carga el estado desde localStorage
   */
  private loadState(): void {
    if (!this.isClient) return;
    
    try {
      const stored = localStorage.getItem(CARRERA_STATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validar estructura básica
        if (parsed.version && Array.isArray(parsed.availableCarreras)) {
          this.state = { ...DEFAULT_CARRERA_STATE, ...parsed };
        }
      }
    } catch (error) {
      console.error('Error cargando estado de carreras:', error);
      this.state = DEFAULT_CARRERA_STATE;
    }
  }

  /**
   * Guarda el estado en localStorage
   */
  private saveState(): boolean {
    if (!this.isClient) return false;
    
    try {
      this.state.lastAccessed = new Date().toISOString();
      localStorage.setItem(CARRERA_STATE_STORAGE_KEY, JSON.stringify(this.state));
      return true;
    } catch (error) {
      console.error('Error guardando estado de carreras:', error);
      return false;
    }
  }

  /**
   * Obtiene la carrera actualmente activa
   */
  getActiveCarrera(): CarreraType | null {
    return this.state.activeCarrera;
  }

  /**
   * Marca una carrera como activa
   */
  setActiveCarrera(carrera: CarreraType): boolean {
    try {
      // Desmarcar todas las carreras como activas
      this.state.availableCarreras = this.state.availableCarreras.map(info => ({
        ...info,
        isActive: false
      }));

      // Marcar la nueva carrera como activa
      let carreraInfo = this.state.availableCarreras.find(info => info.carrera === carrera);
      
      if (!carreraInfo) {
        // Si no existe, crearla
        carreraInfo = {
          carrera,
          hasProgress: false,
          lastModified: new Date().toISOString(),
          isActive: true
        };
        this.state.availableCarreras.push(carreraInfo);
      } else {
        // Si existe, marcarla como activa
        carreraInfo.isActive = true;
        carreraInfo.lastModified = new Date().toISOString();
      }

      this.state.activeCarrera = carrera;
      return this.saveState();
    } catch (error) {
      console.error('Error estableciendo carrera activa:', error);
      return false;
    }
  }

  /**
   * Verifica si existe progreso para una carrera
   */
  hasProgressForCarrera(carrera: CarreraType): boolean {
    // Verificar en el estado local
    const carreraInfo = this.state.availableCarreras.find(info => info.carrera === carrera);
    if (carreraInfo && carreraInfo.hasProgress) {
      return true;
    }

    // Verificar en localStorage directamente (solo en el cliente)
    if (this.isClient) {
      try {
        const progressKey = `trayectoria-sansana-progress`;
        const stored = localStorage.getItem(progressKey);
        if (stored) {
          const progress = JSON.parse(stored);
          return progress.carrera === carrera;
        }
      } catch (error) {
        console.error('Error verificando progreso en localStorage:', error);
      }
    }

    return false;
  }

  /**
   * Marca que una carrera tiene progreso guardado
   */
  markCarreraWithProgress(carrera: CarreraType): boolean {
    try {
      let carreraInfo = this.state.availableCarreras.find(info => info.carrera === carrera);
      
      if (!carreraInfo) {
        carreraInfo = {
          carrera,
          hasProgress: true,
          lastModified: new Date().toISOString(),
          isActive: false
        };
        this.state.availableCarreras.push(carreraInfo);
      } else {
        carreraInfo.hasProgress = true;
        carreraInfo.lastModified = new Date().toISOString();
      }

      return this.saveState();
    } catch (error) {
      console.error('Error marcando carrera con progreso:', error);
      return false;
    }
  }

  /**
   * Obtiene todas las carreras disponibles con su estado
   */
  getAvailableCarreras(): CarreraInfo[] {
    // Actualizar el estado de progreso verificando localStorage
    const carreras: CarreraType[] = ['INF', 'MAT', 'FIS'];
    
    for (const carrera of carreras) {
      const hasProgress = this.hasProgressForCarrera(carrera);
      let carreraInfo = this.state.availableCarreras.find(info => info.carrera === carrera);
      
      if (!carreraInfo && hasProgress) {
        // Si tiene progreso pero no está en el estado, añadirla
        this.state.availableCarreras.push({
          carrera,
          hasProgress: true,
          lastModified: new Date().toISOString(),
          isActive: false
        });
      } else if (carreraInfo) {
        // Actualizar el estado de progreso
        carreraInfo.hasProgress = hasProgress;
      }
    }

    return [...this.state.availableCarreras];
  }

  /**
   * Obtiene la carrera que se usó más recientemente
   */
  getMostRecentCarrera(): CarreraType | null {
    const carreras = this.getAvailableCarreras()
      .filter(info => info.hasProgress)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return carreras.length > 0 ? carreras[0].carrera : null;
  }

  /**
   * Limpia el progreso de una carrera específica
   */
  clearCarreraProgress(carrera: CarreraType): boolean {
    try {
      // Actualizar el estado local
      const carreraInfo = this.state.availableCarreras.find(info => info.carrera === carrera);
      if (carreraInfo) {
        carreraInfo.hasProgress = false;
        carreraInfo.lastModified = new Date().toISOString();
      }

      // Si era la carrera activa, desactivarla
      if (this.state.activeCarrera === carrera) {
        this.state.activeCarrera = null;
      }

      return this.saveState();
    } catch (error) {
      console.error('Error limpiando progreso de carrera:', error);
      return false;
    }
  }

  /**
   * Inicializa el sistema detectando carreras existentes
   */
  initializeSystem(): {
    hasExistingProgress: boolean;
    activeCarrera: CarreraType | null;
    availableCarreras: CarreraInfo[];
    shouldShowCareerSelector: boolean;
  } {
    const availableCarreras = this.getAvailableCarreras();
    const hasExistingProgress = availableCarreras.some(info => info.hasProgress);
    
    let activeCarrera = this.getActiveCarrera();
    
    // Si no hay carrera activa pero hay progreso, usar la más reciente
    if (!activeCarrera && hasExistingProgress) {
      activeCarrera = this.getMostRecentCarrera();
      if (activeCarrera) {
        this.setActiveCarrera(activeCarrera);
      }
    }

    const shouldShowCareerSelector = !hasExistingProgress;

    return {
      hasExistingProgress,
      activeCarrera,
      availableCarreras,
      shouldShowCareerSelector
    };
  }

  /**
   * Obtiene estadísticas del estado actual
   */
  getStateStats() {
    const availableCarreras = this.getAvailableCarreras();
    return {
      totalCarreras: availableCarreras.length,
      carrerasConProgreso: availableCarreras.filter(info => info.hasProgress).length,
      carreraActiva: this.state.activeCarrera,
      ultimoAcceso: this.state.lastAccessed
    };
  }

  /**
   * Resetea completamente el estado de carreras
   */
  resetState(): boolean {
    if (!this.isClient) return false;
    
    try {
      this.state = { ...DEFAULT_CARRERA_STATE };
      localStorage.removeItem(CARRERA_STATE_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error reseteando estado de carreras:', error);
      return false;
    }
  }
}

// Instancia singleton del gestor de estado de carreras
export const carreraStateManager = new CarreraStateManager();
