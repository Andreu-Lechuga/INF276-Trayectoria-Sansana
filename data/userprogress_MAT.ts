// Cache de progreso del usuario para Ingeniería Civil Matemática
// Este archivo actúa como cache local y se sincroniza con localStorage
// PLACEHOLDER - Para implementación futura

import { UserProgress } from '@/types/user-progress';

/**
 * Cache inicial para el progreso de MAT
 * Se inicializa vacío y se carga desde localStorage
 */
export let userProgressMAT: UserProgress | null = null;

/**
 * Inicializa el cache de progreso para MAT con cursos del primer semestre
 */
export function initializeMATProgress(): UserProgress {
  // Importar cursos de MAT para obtener los del primer semestre
  const { cursos } = require('./data_MAT');
  
  // Filtrar cursos del primer semestre
  const primerSemestreCursos = cursos.filter((curso: any) => curso.semestre === 1);
  
  // Crear instancias de usuario para cada curso del primer semestre
  const cursosUsuario = primerSemestreCursos.map((curso: any) => ({
    cursoId: curso.id,
    instanceId: `${curso.codigo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    estado: 'en-curso' as const,
    vtr: 1,
    fechaAsignacion: new Date().toISOString(),
    esCopiaPorReprobacion: false
  }));

  const initialProgress: UserProgress = {
    carrera: 'MAT',
    version: '1.0',
    lastModified: new Date().toISOString(),
    semestres: {
      '1': {
        cursos: cursosUsuario
      }
    },
    reprobaciones: [],
    ravUsados: 0,
    ravDisponibles: 5
  };

  userProgressMAT = initialProgress;
  return initialProgress;
}

/**
 * Actualiza el cache de progreso para MAT
 */
export function updateMATProgress(progress: UserProgress): void {
  if (progress.carrera !== 'MAT') {
    throw new Error('El progreso debe ser para la carrera MAT');
  }
  
  userProgressMAT = {
    ...progress,
    lastModified: new Date().toISOString()
  };
}

/**
 * Obtiene el progreso actual de MAT desde el cache
 */
export function getMATProgress(): UserProgress | null {
  return userProgressMAT;
}

/**
 * Limpia el cache de progreso para MAT
 */
export function clearMATProgress(): void {
  userProgressMAT = null;
}

/**
 * Verifica si el cache está inicializado
 */
export function isMATProgressInitialized(): boolean {
  return userProgressMAT !== null;
}
