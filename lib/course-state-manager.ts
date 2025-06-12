// Gestor de estado de cursos - Maneja reprobaciones, copias y operaciones

import { 
  UserProgress, 
  UserCourse, 
  ReprobacionRecord, 
  CourseOperation, 
  CourseOperationResult,
  CourseStatus 
} from '@/types/user-progress';

export class CourseStateManager {
  
  /**
   * Genera un ID único para una instancia de curso
   */
  generateInstanceId(cursoId: number, vtr: number): string {
    return `curso-${cursoId}-vtr-${vtr}`;
  }

  /**
   * Añade un curso a un semestre específico
   */
  addCourseToSemester(
    progress: UserProgress,
    cursoId: number,
    targetSemester: number,
    vtr: number = 1
  ): CourseOperationResult {
    try {
      // Verificar si ya existe una instancia de este curso en el semestre
      const semestreData = progress.semestres[targetSemester.toString()];
      if (semestreData) {
        const existingCourse = semestreData.cursos.find(c => c.cursoId === cursoId);
        if (existingCourse) {
          return {
            success: false,
            message: `El curso ya existe en el semestre ${targetSemester}`
          };
        }
      }

      // Crear la nueva instancia del curso
      const instanceId = this.generateInstanceId(cursoId, vtr);
      const newCourse: UserCourse = {
        cursoId,
        instanceId,
        estado: 'en-curso',
        vtr,
        fechaAsignacion: new Date().toISOString()
      };

      // Asegurar que existe la estructura del semestre
      if (!progress.semestres[targetSemester.toString()]) {
        progress.semestres[targetSemester.toString()] = { cursos: [] };
      }

      // Añadir el curso al semestre
      progress.semestres[targetSemester.toString()].cursos.push(newCourse);

      return {
        success: true,
        message: `Curso añadido al semestre ${targetSemester}`,
        newInstances: [newCourse]
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al añadir curso: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Verifica si una instancia es la última creada para un curso específico
   */
  isLatestInstance(progress: UserProgress, instanceId: string): boolean {
    // Encontrar el curso
    let targetCourse: UserCourse | null = null;

    for (const semestreData of Object.values(progress.semestres)) {
      const course = semestreData.cursos.find(c => c.instanceId === instanceId);
      if (course) {
        targetCourse = course;
        break;
      }
    }

    if (!targetCourse) {
      return false;
    }

    // Obtener todas las instancias del mismo curso
    const allInstances = this.getCourseInstances(progress, targetCourse.cursoId);
    
    // Encontrar la instancia con el VTR más alto
    const maxVtr = Math.max(...allInstances.map(instance => instance.vtr));
    
    return targetCourse.vtr === maxVtr;
  }

  /**
   * Marca un curso como reprobado y crea las copias necesarias
   */
  markCourseAsFailed(
    progress: UserProgress,
    instanceId: string
  ): CourseOperationResult {
    try {
      // Verificar si es la última instancia
      if (!this.isLatestInstance(progress, instanceId)) {
        return {
          success: false,
          message: 'Solo se puede cambiar el estado de la última instancia del curso. Las instancias intermedias reprobadas no pueden modificarse.'
        };
      }

      // Encontrar el curso en los semestres
      let targetCourse: UserCourse | null = null;
      let targetSemester: number | null = null;

      for (const [semestreId, semestreData] of Object.entries(progress.semestres)) {
        const course = semestreData.cursos.find(c => c.instanceId === instanceId);
        if (course) {
          targetCourse = course;
          targetSemester = parseInt(semestreId);
          break;
        }
      }

      if (!targetCourse || targetSemester === null) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Verificar si ya está reprobado para evitar crear copias duplicadas
      if (targetCourse.estado === 'reprobado') {
        return {
          success: false,
          message: 'El curso ya está marcado como reprobado'
        };
      }

      // Marcar como reprobado
      targetCourse.estado = 'reprobado';

      // Buscar o crear registro de reprobación
      let reprobacionRecord = progress.reprobaciones.find(r => r.cursoId === targetCourse.cursoId);
      
      if (!reprobacionRecord) {
        // Primera reprobación - crear registro
        reprobacionRecord = {
          cursoId: targetCourse.cursoId,
          instanciasCreadas: [instanceId],
          ultimoVtr: targetCourse.vtr,
          semestreOriginal: targetSemester
        };
        progress.reprobaciones.push(reprobacionRecord);
      } else {
        // Actualizar registro existente
        if (!reprobacionRecord.instanciasCreadas.includes(instanceId)) {
          reprobacionRecord.instanciasCreadas.push(instanceId);
        }
      }

      // Crear copia en el siguiente semestre solo si no existe ya
      const nextSemester = targetSemester + 1;
      const nextVtr = reprobacionRecord.ultimoVtr + 1;
      
      // Verificar si ya existe una copia en el siguiente semestre
      const existingCopyInNextSemester = progress.semestres[nextSemester.toString()]?.cursos.find(
        c => c.cursoId === targetCourse.cursoId
      );

      if (existingCopyInNextSemester) {
        // Ya existe una copia, no crear otra
        return {
          success: true,
          message: `Curso marcado como reprobado. Ya existe una copia en semestre ${nextSemester}`,
          affectedInstances: [instanceId]
        };
      }
      
      const copyResult = this.addCourseToSemester(progress, targetCourse.cursoId, nextSemester, nextVtr);
      
      if (copyResult.success && copyResult.newInstances) {
        const newCopy = copyResult.newInstances[0];
        
        // Marcar como copia por reprobación
        newCopy.esCopiaPorReprobacion = true;
        newCopy.cursoOriginalInstanceId = instanceId;
        
        // Actualizar registro de reprobación
        reprobacionRecord.instanciasCreadas.push(newCopy.instanceId);
        reprobacionRecord.ultimoVtr = nextVtr;

        return {
          success: true,
          message: `Curso marcado como reprobado. Copia creada en semestre ${nextSemester}`,
          affectedInstances: [instanceId],
          newInstances: [newCopy]
        };
      } else {
        return {
          success: false,
          message: `Error al crear copia: ${copyResult.message}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al marcar como reprobado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Marca un curso como aprobado
   */
  markCourseAsApproved(
    progress: UserProgress,
    instanceId: string
  ): CourseOperationResult {
    try {
      // Verificar si es la última instancia
      if (!this.isLatestInstance(progress, instanceId)) {
        return {
          success: false,
          message: 'Solo se puede cambiar el estado de la última instancia del curso. Las instancias intermedias reprobadas no pueden modificarse.'
        };
      }

      // Encontrar el curso
      let targetCourse: UserCourse | null = null;

      for (const semestreData of Object.values(progress.semestres)) {
        const course = semestreData.cursos.find(c => c.instanceId === instanceId);
        if (course) {
          targetCourse = course;
          break;
        }
      }

      if (!targetCourse) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Marcar como aprobado
      targetCourse.estado = 'aprobado';

      return {
        success: true,
        message: 'Curso marcado como aprobado',
        affectedInstances: [instanceId]
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al marcar como aprobado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Marca un curso como en curso
   */
  markCourseAsInProgress(
    progress: UserProgress,
    instanceId: string
  ): CourseOperationResult {
    try {
      // Verificar si es la última instancia
      if (!this.isLatestInstance(progress, instanceId)) {
        return {
          success: false,
          message: 'Solo se puede cambiar el estado de la última instancia del curso. Las instancias intermedias reprobadas no pueden modificarse.'
        };
      }

      // Encontrar el curso
      let targetCourse: UserCourse | null = null;

      for (const semestreData of Object.values(progress.semestres)) {
        const course = semestreData.cursos.find(c => c.instanceId === instanceId);
        if (course) {
          targetCourse = course;
          break;
        }
      }

      if (!targetCourse) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Marcar como en curso
      targetCourse.estado = 'en-curso';

      return {
        success: true,
        message: 'Curso marcado como en curso',
        affectedInstances: [instanceId]
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al marcar como en curso: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Marca un curso como RAV (Rebaja Académica Voluntaria)
   * Crea una copia con estado RAV en el mismo semestre y elimina la instancia original
   */
  markCourseAsRav(
    progress: UserProgress,
    instanceId: string
  ): CourseOperationResult {
    try {
      // Verificar límite de RAV
      if (progress.ravUsados >= progress.ravDisponibles) {
        return {
          success: false,
          message: `Has agotado tus RAV disponibles (${progress.ravDisponibles})`
        };
      }

      // Verificar si es la última instancia
      if (!this.isLatestInstance(progress, instanceId)) {
        return {
          success: false,
          message: 'Solo se puede cambiar el estado de la última instancia del curso.'
        };
      }

      // Encontrar el curso y su semestre
      let targetCourse: UserCourse | null = null;
      let targetSemester: number | null = null;

      for (const [semestreId, semestreData] of Object.entries(progress.semestres)) {
        const course = semestreData.cursos.find(c => c.instanceId === instanceId);
        if (course) {
          targetCourse = course;
          targetSemester = parseInt(semestreId);
          break;
        }
      }

      if (!targetCourse || targetSemester === null) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Contar cuántas copias RAV ya existen para este curso para generar ID único
      const existingRavCopies = progress.semestres[targetSemester.toString()].cursos.filter(
        c => c.cursoId === targetCourse.cursoId && c.estado === 'rav'
      );
      const ravNumber = existingRavCopies.length + 1;

      // Crear copia con estado RAV en el mismo semestre (mantiene todos los valores originales)
      const ravCopyId = `${targetCourse.instanceId}-rav-${ravNumber}`;
      const ravCopy: UserCourse = {
        cursoId: targetCourse.cursoId, // Mantener ID original
        instanceId: ravCopyId,
        estado: 'rav',
        vtr: targetCourse.vtr,
        fechaAsignacion: targetCourse.fechaAsignacion, // Mantener fecha original
        esCopiaPorReprobacion: false, // Es una copia por RAV, no por reprobación
        cursoOriginalInstanceId: targetCourse.instanceId
      };

      // Añadir la copia RAV al mismo semestre
      progress.semestres[targetSemester.toString()].cursos.push(ravCopy);

      // Eliminar la instancia original del semestre (misma lógica que botón "-")
      progress.semestres[targetSemester.toString()].cursos = 
        progress.semestres[targetSemester.toString()].cursos.filter(c => c.instanceId !== instanceId);

      // Incrementar contador de RAV usados
      progress.ravUsados++;

      return {
        success: true,
        message: `RAV aplicado. El curso vuelve a estar disponible para inscripción. RAV usados: ${progress.ravUsados}/${progress.ravDisponibles}`,
        affectedInstances: [instanceId],
        newInstances: [ravCopy]
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al marcar como RAV: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Elimina un curso y todas sus copias (eliminación en cascada)
   */
  removeCourseWithCascade(
    progress: UserProgress,
    instanceId: string
  ): CourseOperationResult {
    try {
      // Encontrar el curso
      let targetCourse: UserCourse | null = null;
      let targetSemester: string | null = null;

      for (const [semestreId, semestreData] of Object.entries(progress.semestres)) {
        const courseIndex = semestreData.cursos.findIndex(c => c.instanceId === instanceId);
        if (courseIndex !== -1) {
          targetCourse = semestreData.cursos[courseIndex];
          targetSemester = semestreId;
          break;
        }
      }

      if (!targetCourse || !targetSemester) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      const affectedInstances: string[] = [];

      // Buscar registro de reprobación
      const reprobacionRecord = progress.reprobaciones.find(r => 
        r.instanciasCreadas.includes(instanceId)
      );

      if (reprobacionRecord) {
        // Eliminar todas las instancias relacionadas
        for (const instId of reprobacionRecord.instanciasCreadas) {
          this.removeInstanceFromSemesters(progress, instId);
          affectedInstances.push(instId);
        }

        // Eliminar el registro de reprobación
        progress.reprobaciones = progress.reprobaciones.filter(r => 
          r.cursoId !== reprobacionRecord.cursoId
        );
      } else {
        // Es un curso sin reprobaciones, eliminar solo esta instancia
        this.removeInstanceFromSemesters(progress, instanceId);
        affectedInstances.push(instanceId);
      }

      return {
        success: true,
        message: `Curso eliminado${affectedInstances.length > 1 ? ' junto con sus copias' : ''}`,
        affectedInstances
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al eliminar curso: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Elimina una instancia específica de todos los semestres
   */
  private removeInstanceFromSemesters(progress: UserProgress, instanceId: string): void {
    for (const semestreData of Object.values(progress.semestres)) {
      semestreData.cursos = semestreData.cursos.filter(c => c.instanceId !== instanceId);
    }
  }

  /**
   * Mueve un curso de un semestre a otro
   */
  moveCourse(
    progress: UserProgress,
    instanceId: string,
    targetSemester: number
  ): CourseOperationResult {
    try {
      // Encontrar y remover el curso del semestre actual
      let targetCourse: UserCourse | null = null;
      let sourceSemester: string | null = null;

      for (const [semestreId, semestreData] of Object.entries(progress.semestres)) {
        const courseIndex = semestreData.cursos.findIndex(c => c.instanceId === instanceId);
        if (courseIndex !== -1) {
          targetCourse = semestreData.cursos.splice(courseIndex, 1)[0];
          sourceSemester = semestreId;
          break;
        }
      }

      if (!targetCourse) {
        return {
          success: false,
          message: 'Curso no encontrado'
        };
      }

      // Verificar que no exista ya en el semestre destino
      const targetSemestreData = progress.semestres[targetSemester.toString()];
      if (targetSemestreData) {
        const existingCourse = targetSemestreData.cursos.find(c => c.cursoId === targetCourse!.cursoId);
        if (existingCourse) {
          // Restaurar el curso al semestre original
          if (sourceSemester) {
            progress.semestres[sourceSemester].cursos.push(targetCourse);
          }
          return {
            success: false,
            message: `El curso ya existe en el semestre ${targetSemester}`
          };
        }
      }

      // Asegurar que existe la estructura del semestre destino
      if (!progress.semestres[targetSemester.toString()]) {
        progress.semestres[targetSemester.toString()] = { cursos: [] };
      }

      // Añadir al semestre destino
      progress.semestres[targetSemester.toString()].cursos.push(targetCourse);

      return {
        success: true,
        message: `Curso movido del semestre ${sourceSemester} al semestre ${targetSemester}`,
        affectedInstances: [instanceId]
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al mover curso: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtiene todas las instancias de un curso específico
   */
  getCourseInstances(progress: UserProgress, cursoId: number): UserCourse[] {
    const instances: UserCourse[] = [];

    for (const semestreData of Object.values(progress.semestres)) {
      const courseInstances = semestreData.cursos.filter(c => c.cursoId === cursoId);
      instances.push(...courseInstances);
    }

    return instances;
  }

  /**
   * Verifica si un curso está disponible para ser añadido (no tiene copias pendientes)
   */
  isCourseAvailable(progress: UserProgress, cursoId: number): boolean {
    const instances = this.getCourseInstances(progress, cursoId);
    
    // Filtrar copias RAV de las instancias (no cuentan para disponibilidad)
    const activeInstances = instances.filter(instance => instance.estado !== 'rav');
    
    // Si no hay instancias activas, está disponible
    if (activeInstances.length === 0) {
      return true;
    }

    // Si hay alguna instancia aprobada, no está disponible
    const hasApprovedInstance = activeInstances.some(instance => instance.estado === 'aprobado');
    if (hasApprovedInstance) {
      return false;
    }

    // Si todas las instancias activas están reprobadas, está disponible para una nueva copia
    const allFailed = activeInstances.every(instance => instance.estado === 'reprobado');
    return allFailed;
  }

  /**
   * Obtiene estadísticas del progreso del usuario
   */
  getProgressStats(progress: UserProgress): {
    totalCursos: number;
    cursosAprobados: number;
    cursosReprobados: number;
    cursosEnCurso: number;
    cursosRav: number;
    totalReprobaciones: number;
    ravUsados: number;
    ravDisponibles: number;
  } {
    let totalCursos = 0;
    let cursosAprobados = 0;
    let cursosReprobados = 0;
    let cursosEnCurso = 0;
    let cursosRav = 0;

    for (const semestreData of Object.values(progress.semestres)) {
      for (const curso of semestreData.cursos) {
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
      }
    }

    return {
      totalCursos,
      cursosAprobados,
      cursosReprobados,
      cursosEnCurso,
      cursosRav,
      totalReprobaciones: progress.reprobaciones.length,
      ravUsados: progress.ravUsados || 0,
      ravDisponibles: progress.ravDisponibles || 0
    };
  }
}

// Instancia singleton del gestor
export const courseStateManager = new CourseStateManager();
