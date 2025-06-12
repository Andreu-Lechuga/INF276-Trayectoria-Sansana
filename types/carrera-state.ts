// Tipos para la gestión del estado de carreras activas

export type CarreraType = 'INF' | 'MAT' | 'FIS';

export interface CarreraInfo {
  carrera: CarreraType;
  hasProgress: boolean;
  lastModified: string;
  isActive: boolean;
}

export interface CarreraState {
  activeCarrera: CarreraType | null;
  availableCarreras: CarreraInfo[];
  lastAccessed: string;
  version: string;
}

export const DEFAULT_CARRERA_STATE: CarreraState = {
  activeCarrera: null,
  availableCarreras: [],
  lastAccessed: new Date().toISOString(),
  version: '1.0'
};

// Configuración para el almacenamiento del estado de carreras
export const CARRERA_STATE_STORAGE_KEY = 'trayectoria-sansana-carrera-state';
