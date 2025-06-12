// Gestor de datos principal - Combina datos originales con progreso del usuario

import { Task, Column as ColumnType } from '@/types/kanban';
import { 
  UserProgress, 
  UserCourse,
  CourseOperationResult 
} from '@/types/user-progress';
import { storageService } from './storage-service';
import { courseStateManager } from './course-state-manager';
import { progressCacheManager } from './progress-cache-manager';
import { CarreraType } from '@/types/carrera-state';
import { getCarreraById } from '@/data/carreras';

interface OriginalCourse {
  id: number;
  nombre: string;
  codigo: string;
  creditos: number;
  horas: number;
  departamento: string;
  color?: string;
  prerrequisitos: number[];
  periodo: string;
  semestre: number;
  vtr: number;
}

export class DataManager {
  private originalData: OriginalCourse[] = [];
  private userProgress: UserProgress | null = null;
  private carreraId: number | null = null;
  private carreraLink: string | null = null;

  /**
   * Inicializa el gestor con los datos originales de una carrera por ID
   */
  initialize(originalCourses: OriginalCourse[], carreraId: number): void {
    // 1. ID → Carrera Info
    const carrera = getCarreraById(carreraId);
    if (!carrera) {
      throw new Error(`Carrera con ID ${carreraId} no encontrada`);
    }

    // 2. Extraer LINK
    this.originalData = originalCourses;
    this.carreraId = carreraId;
    this.carreraLink = carrera.link;
    
    // 3. ID → Inicialización
    if (['INF', 'MAT', 'FIS'].includes(carrera.link)) {
      this.userProgress = progressCacheManager.initializeCarrera(carreraId);
    } else {
      throw new Error(`Carrera ${carrera.nombre} no implementada`);
    }
  }

  /**
   * Obtiene info de carrera actual
   */
  getCurrentCarreraInfo() {
    if (!this.carreraId) return null;
    return getCarreraById(this.carreraId);
  }

  /**
   * Obtiene el progreso actual del usuario
   */
  getUserProgress(): UserProgress | null {
    return this.userProgress;
  }

  /**
   * Guarda el progreso del usuario
   */
  saveProgress(): boolean {
    if (!this.userProgress || !this.carreraLink) {
      return false;
    }

    // Usar el nuevo sistema de cache si es una carrera soportada
    if (['INF', 'MAT', 'FIS'].includes(this.carreraLink)) {
      return progressCacheManager.updateProgress(
        this.carreraLink as CarreraType, 
        this.userProgress
      );
    }

    // Fallback al sistema anterior
    return storageService.saveUserProgress(this.userProgress);
  }

  /**
   * Convierte número de semestre a título romano
   */
  private toRoman(num: number): string {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romanNumerals[num - 1] || num.toString();
  }

  /**
   * Genera ID de columna basado en el número de semestre
   */
  private generateColumnId(semesterNumber: number): string {
    return `column-${semesterNumber}`;
  }

  /**
   * Combina datos originales con progreso del usuario para generar tareas del kanban
   */
  getCombinedKanbanData(): { columns: ColumnType[], sidebarTasks: Task[] } {
    if (!this.userProgress) {
      return { columns: [], sidebarTasks: [] };
    }

    const columns: ColumnType[] = [];
    const usedCourseIds = new Set<number>();

    // Procesar semestres del usuario
    const semesterNumbers = Object.keys(this.userProgress.semestres)
      .map(Number)
      .sort((a, b) => a - b);

    for (const semesterNum of semesterNumbers) {
      const semestreData = this.userProgress.semestres[semesterNum.toString()];
      const tasks: Task[] = [];

      for (const userCourse of semestreData.cursos) {
        const originalCourse = this.originalData.find(c => c.id === userCourse.cursoId);
        if (originalCourse) {
          const enhancedTask = this.createEnhancedTask(originalCourse, userCourse, semesterNum);
          tasks.push(enhancedTask);
          usedCourseIds.add(userCourse.cursoId);
        }
      }

      columns.push({
        id: this.generateColumnId(semesterNum),
        title: this.toRoman(semesterNum),
        tasks: tasks
      });
    }

    // Generar tareas del sidebar (cursos disponibles)
    const sidebarTasks: Task[] = [];
    for (const originalCourse of this.originalData) {
      // Verificar si el curso está disponible (considera RAV, reprobaciones, etc.)
      const isAvailable = courseStateManager.isCourseAvailable(this.userProgress, originalCourse.id);
      
      if (isAvailable) {
        const task = this.createTaskFromOriginal(originalCourse);
        sidebarTasks.push(task);
      }
    }

    return { columns, sidebarTasks };
  }

  /**
   * Crea una tarea mejorada combinando datos originales y del usuario
   */
  private createEnhancedTask(
    originalCourse: OriginalCourse, 
    userCourse: UserCourse, 
    currentSemester: number
  ): Task {
    return {
      // Datos originales
      nombre: originalCourse.nombre,
      codigo: originalCourse.codigo,
      creditos: originalCourse.creditos,
      horas: originalCourse.horas,
      departamento: originalCourse.departamento,
      color: originalCourse.color,
      prerrequisitos: originalCourse.prerrequisitos,
      periodo: originalCourse.periodo,
      semestre: originalCourse.semestre, // Semestre original del curso
      
      // Datos del kanban
      id: userCourse.instanceId,
      title: originalCourse.nombre,
      description: `${originalCourse.codigo} - ${originalCourse.creditos} créditos`,
      status: this.toRoman(currentSemester),
      dueDate: null,
      subtasks: [],
      customFields: [],
      createdAt: userCourse.fechaAsignacion,
      
      // Datos del usuario
      cursoId: originalCourse.id,
      instanceId: userCourse.instanceId,
      vtr: userCourse.vtr,
      aprobado: userCourse.estado === 'aprobado',
      estado: userCourse.estado,
      esCopiaPorReprobacion: userCourse.esCopiaPorReprobacion,
      cursoOriginalInstanceId: userCourse.cursoOriginalInstanceId
    };
  }

  /**
   * Crea una tarea básica desde datos originales (para sidebar)
   */
  private createTaskFromOriginal(originalCourse: OriginalCourse): Task {
    return {
      id: `curso-${originalCourse.codigo}`,
      title: originalCourse.nombre,
      nombre: originalCourse.nombre,
      codigo: originalCourse.codigo,
      creditos: originalCourse.creditos,
      horas: originalCourse.horas,
      departamento: originalCourse.departamento,
      color: originalCourse.color,
      prerrequisitos: originalCourse.prerrequisitos,
      periodo: originalCourse.periodo,
      semestre: originalCourse.semestre,
      vtr: 1,
      description: `${originalCourse.codigo} - ${originalCourse.creditos} créditos`,
      status: "Available",
      dueDate: null,
      subtasks: [],
      customFields: [],
      createdAt: new Date().toISOString(),
      cursoId: originalCourse.id
    };
  }

  /**
   * Añade un curso a un semestre específico
   */
  addCourseToSemester(cursoId: number, targetSemester: number): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const result = courseStateManager.addCourseToSemester(
      this.userProgress,
      cursoId,
      targetSemester
    );

    if (result.success) {
      this.saveProgress();
    }

    return result;
  }

  /**
   * Marca un curso como reprobado
   */
  markCourseAsFailed(instanceId: string): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const result = courseStateManager.markCourseAsFailed(this.userProgress, instanceId);

    if (result.success) {
      this.saveProgress();
    }

    return result;
  }

  /**
   * Marca un curso como aprobado
   */
  markCourseAsApproved(instanceId: string): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const result = courseStateManager.markCourseAsApproved(this.userProgress, instanceId);

    if (result.success) {
      this.saveProgress();
    }

    return result;
  }

  /**
   * Marca un curso como en curso
   */
  markCourseAsInProgress(instanceId: string): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const result = courseStateManager.markCourseAsInProgress(this.userProgress, instanceId);

    if (result.success) {
      this.saveProgress();
    }

    return result;
  }

  /**
   * Marca un curso como RAV (Rebaja Académica Voluntaria)
   */
  markCourseAsRav(instanceId: string): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const result = courseStateManager.markCourseAsRav(this.userProgress, instanceId);

    if (result.success) {
      this.saveProgress();
    }

    return result;
  }

  /**
   * Elimina un curso con cascada
   */
  removeCourseWithCascade(instanceId: string): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const result = courseStateManager.removeCourseWithCascade(this.userProgress, instanceId);

    if (result.success) {
      this.saveProgress();
    }

    return result;
  }

  /**
   * Mueve un curso entre semestres
   */
  moveCourse(instanceId: string, targetSemester: number): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const result = courseStateManager.moveCourse(this.userProgress, instanceId, targetSemester);

    if (result.success) {
      this.saveProgress();
    }

    return result;
  }

  /**
   * Obtiene todas las instancias de un curso específico
   */
  getCourseInstances(progress: UserProgress, cursoId: number): UserCourse[] {
    return courseStateManager.getCourseInstances(progress, cursoId);
  }

  /**
   * Obtiene estadísticas del progreso
   */
  getProgressStats() {
    if (!this.userProgress) {
      return {
        totalCursos: 0,
        cursosAprobados: 0,
        cursosReprobados: 0,
        cursosPendientes: 0,
        totalReprobaciones: 0
      };
    }

    return courseStateManager.getProgressStats(this.userProgress);
  }

  /**
   * Verifica si un curso cumple con los prerrequisitos
   */
  checkPrerequisites(cursoId: number): { canAdd: boolean; missingPrereqs: OriginalCourse[] } {
    if (!this.userProgress) {
      return { canAdd: false, missingPrereqs: [] };
    }

    const course = this.originalData.find(c => c.id === cursoId);
    if (!course) {
      return { canAdd: false, missingPrereqs: [] };
    }

    const missingPrereqs: OriginalCourse[] = [];

    for (const prereqId of course.prerrequisitos) {
      // Verificar si el prerrequisito está aprobado
      const instances = courseStateManager.getCourseInstances(this.userProgress, prereqId);
      const hasApprovedInstance = instances.some((instance: UserCourse) => instance.estado === 'aprobado');

      if (!hasApprovedInstance) {
        const prereqCourse = this.originalData.find(c => c.id === prereqId);
        if (prereqCourse) {
          missingPrereqs.push(prereqCourse);
        }
      }
    }

    return {
      canAdd: missingPrereqs.length === 0,
      missingPrereqs
    };
  }

  /**
   * Obtiene cursos sugeridos para el siguiente semestre
   */
  getSuggestedCourses(): OriginalCourse[] {
    if (!this.userProgress) {
      return [];
    }

    const suggested: OriginalCourse[] = [];

    for (const course of this.originalData) {
      // Verificar si el curso está disponible
      const isAvailable = courseStateManager.isCourseAvailable(this.userProgress, course.id);
      if (!isAvailable) {
        continue;
      }

      // Verificar prerrequisitos
      const { canAdd } = this.checkPrerequisites(course.id);
      if (canAdd) {
        suggested.push(course);
      }
    }

    return suggested;
  }

  /**
   * Reinicia el progreso del usuario
   */
  resetProgress(): boolean {
    if (!this.carreraLink) {
      return false;
    }

    this.userProgress = storageService.initializeUserProgress(this.carreraLink);
    return true;
  }

  /**
   * Exporta el progreso como JSON
   */
  exportProgress(): string | null {
    return storageService.createBackup();
  }

  /**
   * Importa progreso desde JSON
   */
  importProgress(backupData: string): boolean {
    const success = storageService.restoreFromBackup(backupData);
    if (success) {
      this.userProgress = storageService.getUserProgress();
    }
    return success;
  }

  /**
   * Añade un nuevo semestre vacío
   */
  addSemester(): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    // Encontrar el siguiente número de semestre disponible
    const existingSemesters = Object.keys(this.userProgress.semestres).map(Number);
    const nextSemester = existingSemesters.length > 0 ? Math.max(...existingSemesters) + 1 : 1;

    // Crear el nuevo semestre vacío
    this.userProgress.semestres[nextSemester.toString()] = {
      cursos: []
    };

    // Guardar el progreso
    const saved = this.saveProgress();

    if (saved) {
      return {
        success: true,
        message: `Semestre ${this.toRoman(nextSemester)} añadido exitosamente`
      };
    } else {
      return {
        success: false,
        message: 'Error al guardar el nuevo semestre'
      };
    }
  }

  /**
   * Elimina un semestre específico (solo si está vacío y es el último)
   */
  deleteSemester(semesterNumber: number): CourseOperationResult {
    if (!this.userProgress) {
      return {
        success: false,
        message: 'No hay progreso del usuario inicializado'
      };
    }

    const semesterKey = semesterNumber.toString();
    const semestreData = this.userProgress.semestres[semesterKey];

    if (!semestreData) {
      return {
        success: false,
        message: 'El semestre no existe'
      };
    }

    // Verificar que el semestre esté vacío
    if (semestreData.cursos.length > 0) {
      return {
        success: false,
        message: 'No se puede eliminar un semestre que contiene materias. Mueve o elimina todas las materias primero.'
      };
    }

    // Verificar que solo se pueda eliminar el último semestre
    const existingSemesters = Object.keys(this.userProgress.semestres).map(Number).sort((a, b) => a - b);
    const lastSemester = Math.max(...existingSemesters);

    if (semesterNumber !== lastSemester) {
      return {
        success: false,
        message: `Solo se puede eliminar el último semestre (${this.toRoman(lastSemester)}) para mantener la coherencia en la numeración`
      };
    }

    // Eliminar el semestre
    delete this.userProgress.semestres[semesterKey];

    // Guardar el progreso
    const saved = this.saveProgress();

    if (saved) {
      return {
        success: true,
        message: `Semestre ${this.toRoman(semesterNumber)} eliminado exitosamente`
      };
    } else {
      return {
        success: false,
        message: 'Error al guardar los cambios'
      };
    }
  }

  /**
   * Verifica si una instancia es la última creada para un curso específico
   */
  isLatestInstance(instanceId: string): boolean {
    if (!this.userProgress) {
      return false;
    }

    return courseStateManager.isLatestInstance(this.userProgress, instanceId);
  }

  /**
   * Obtiene el número de semestre desde un ID de columna
   */
  getSemesterFromColumnId(columnId: string): number | null {
    const match = columnId.match(/^column-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }
}

// Instancia singleton del gestor de datos
export const dataManager = new DataManager();
