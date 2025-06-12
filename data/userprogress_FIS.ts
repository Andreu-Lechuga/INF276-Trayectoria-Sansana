// Cache de progreso del usuario para Ingeniería Civil Física
// Este archivo actúa como cache local y se sincroniza con localStorage
// PLACEHOLDER - Para implementación futura

import { UserProgress } from '@/types/user-progress';

/**
 * Cache inicial para el progreso de FIS
 * Se inicializa vacío y se carga desde localStorage
 */
export let userProgressFIS: UserProgress | null = null;

/**
 * Inicializa el cache de progreso para FIS con cursos del primer semestre
 */
export function initializeFISProgress(): UserProgress {
  // Importar cursos de FIS para obtener los del primer semestre
  const { cursos } = require('./data_FIS');
  
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
    carrera: 'FIS',
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

  userProgressFIS = initialProgress;
  return initialProgress;
}

/**
 * Actualiza el cache de progreso para FIS
 */
export function updateFISProgress(progress: UserProgress): void {
  if (progress.carrera !== 'FIS') {
    throw new Error('El progreso debe ser para la carrera FIS');
  }
  
  userProgressFIS = {
    ...progress,
    lastModified: new Date().toISOString()
  };
}

/**
 * Obtiene el progreso actual de FIS desde el cache
 */
export function getFISProgress(): UserProgress | null {
  return userProgressFIS;
}

/**
 * Limpia el cache de progreso para FIS
 */
export function clearFISProgress(): void {
  userProgressFIS = null;
}

/**
 * Verifica si el cache está inicializado
 */
export function isFISProgressInitialized(): boolean {
  return userProgressFIS !== null;
}
