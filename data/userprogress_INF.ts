// Cache de progreso del usuario para Ingeniería Civil Informática
// Este archivo actúa como cache local y se sincroniza con localStorage

import { UserProgress } from '@/types/user-progress';

/**
 * Cache inicial para el progreso de INF
 * Se inicializa vacío y se carga desde localStorage
 */
export let userProgressINF: UserProgress | null = null;

/**
 * Inicializa el cache de progreso para INF con cursos del primer semestre
 */
export function initializeINFProgress(): UserProgress {
  // Importar cursos de INF para obtener los del primer semestre
  const { cursos } = require('./data_INF');
  
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
    carrera: 'INF',
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

  userProgressINF = initialProgress;
  return initialProgress;
}

/**
 * Actualiza el cache de progreso para INF
 */
export function updateINFProgress(progress: UserProgress): void {
  if (progress.carrera !== 'INF') {
    throw new Error('El progreso debe ser para la carrera INF');
  }
  
  userProgressINF = {
    ...progress,
    lastModified: new Date().toISOString()
  };
}

/**
 * Obtiene el progreso actual de INF desde el cache
 */
export function getINFProgress(): UserProgress | null {
  return userProgressINF;
}

/**
 * Limpia el cache de progreso para INF
 */
export function clearINFProgress(): void {
  userProgressINF = null;
}

/**
 * Verifica si el cache está inicializado
 */
export function isINFProgressInitialized(): boolean {
  return userProgressINF !== null;
}

/**
 * Obtiene estadísticas del progreso de INF
 */
export function getINFProgressStats() {
  if (!userProgressINF) {
    return {
      totalSemestres: 0,
      totalCursos: 0,
      cursosAprobados: 0,
      cursosReprobados: 0,
      cursosEnCurso: 0,
      cursosRav: 0,
      totalReprobaciones: 0,
      ravUsados: 0,
      ravDisponibles: 0
    };
  }

  let totalCursos = 0;
  let cursosAprobados = 0;
  let cursosReprobados = 0;
  let cursosEnCurso = 0;
  let cursosRav = 0;

  Object.values(userProgressINF.semestres).forEach(semestre => {
    semestre.cursos.forEach(curso => {
      totalCursos++;
      switch (curso.estado) {
        case 'aprobado':
          cursosAprobados++;
          break;
        case 'reprobado':
          cursosReprobados++;
          break;
        case 'en-curso':
          cursosEnCurso++;
          break;
        case 'rav':
          cursosRav++;
          break;
      }
    });
  });

  return {
    totalSemestres: Object.keys(userProgressINF.semestres).length,
    totalCursos,
    cursosAprobados,
    cursosReprobados,
    cursosEnCurso,
    cursosRav,
    totalReprobaciones: userProgressINF.reprobaciones.length,
    ravUsados: userProgressINF.ravUsados || 0,
    ravDisponibles: userProgressINF.ravDisponibles || 0
  };
}

/**
 * Exporta el progreso de INF como JSON string
 */
export function exportINFProgress(): string | null {
  if (!userProgressINF) {
    return null;
  }

  return JSON.stringify({
    ...userProgressINF,
    exportDate: new Date().toISOString()
  }, null, 2);
}

/**
 * Importa progreso de INF desde JSON string
 */
export function importINFProgress(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    
    // Validar que sea para INF
    if (parsed.carrera !== 'INF') {
      console.error('Los datos importados no son para la carrera INF');
      return false;
    }

    // Remover metadatos de exportación
    delete parsed.exportDate;

    // Validar estructura básica
    if (!parsed.version || !parsed.semestres || !Array.isArray(parsed.reprobaciones)) {
      console.error('Estructura de datos inválida');
      return false;
    }

    updateINFProgress(parsed);
    return true;
  } catch (error) {
    console.error('Error al importar progreso de INF:', error);
    return false;
  }
}
