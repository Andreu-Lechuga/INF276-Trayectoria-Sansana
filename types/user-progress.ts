// Tipos para el progreso del usuario y almacenamiento local

export interface UserProgress {
  carrera: string;
  version: string;
  lastModified: string;
  semestres: {
    [semestreId: string]: SemestreData;
  };
  reprobaciones: ReprobacionRecord[];
  ravUsados: number;                  // Contador global de RAV usados
  ravDisponibles: number;             // RAV disponibles para esta carrera
}

export interface SemestreData {
  cursos: UserCourse[];
}

export interface UserCourse {
  cursoId: number;                    // ID del curso original en data_INF.ts
  instanceId: string;                 // ID único para esta instancia específica
  estado: CourseStatus;
  vtr: number;                        // Veces tomado el ramo
  fechaAsignacion: string;
  esCopiaPorReprobacion?: boolean;    // true si es una copia generada por reprobación
  cursoOriginalInstanceId?: string;   // ID de la instancia original (para copias)
  originalCursoId?: number;           // ID del curso original (para copias RAV)
}

export interface ReprobacionRecord {
  cursoId: number;                    // ID del curso original
  instanciasCreadas: string[];        // IDs de todas las instancias (original + copias)
  ultimoVtr: number;                  // Último VTR asignado
  semestreOriginal: number;           // Semestre donde se tomó originalmente
}

export type CourseStatus = 'en-curso' | 'aprobado' | 'reprobado' | 'rav';


// Configuración del almacenamiento
export interface StorageConfig {
  storageKey: string;
  version: string;
  autoSaveInterval: number; // en milisegundos
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  storageKey: 'trayectoria-sansana-progress',
  version: '1.0',
  autoSaveInterval: 1000, // 1 segundo
};

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Tipos para operaciones de cursos
export interface CourseOperation {
  type: 'add' | 'remove' | 'update' | 'approve' | 'fail';
  courseId: number;
  instanceId?: string;
  targetSemester?: number;
  metadata?: Record<string, any>;
}

export interface CourseOperationResult {
  success: boolean;
  message: string;
  affectedInstances?: string[];
  newInstances?: UserCourse[];
}
