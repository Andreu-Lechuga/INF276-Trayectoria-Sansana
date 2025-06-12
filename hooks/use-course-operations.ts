// Hook para operaciones específicas de cursos

import { useCallback } from 'react';
import { Task } from '@/types/kanban';
import { UserCourse } from '@/types/user-progress';
import { dataManager } from '@/lib/data-manager';
import { useToast } from '@/hooks/use-toast';

interface UseCourseOperationsReturn {
  // Operaciones principales
  addCourseToCurrentSemester: (task: Task, editingColumnId: string | null) => Promise<boolean>;
  handleCourseStatusChange: (instanceId: string, newStatus: 'aprobado' | 'reprobado') => Promise<boolean>;
  handleCourseRemoval: (instanceId: string) => Promise<boolean>;
  
  // Validaciones
  canAddCourse: (cursoId: number) => { canAdd: boolean; reason?: string };
  validatePrerequisites: (cursoId: number) => { valid: boolean; missingCourses: string[] };
  
  // Utilidades
  getCourseInfo: (cursoId: number) => any;
  getNextAvailableSemester: () => number;
  getSemesterFromColumnId: (columnId: string) => number;
}

export function useCourseOperations(): UseCourseOperationsReturn {
  const { toast } = useToast();

  // Convierte ID de columna a número de semestre
  const getSemesterFromColumnId = useCallback((columnId: string): number => {
    const match = columnId.match(/column-(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }, []);

  // Obtiene el siguiente semestre disponible
  const getNextAvailableSemester = useCallback((): number => {
    const progress = dataManager.getUserProgress();
    if (!progress) return 1;

    const semesterNumbers = Object.keys(progress.semestres).map(Number);
    return semesterNumbers.length > 0 ? Math.max(...semesterNumbers) + 1 : 1;
  }, []);

  // Añade un curso al semestre actual (considerando modo de edición)
  const addCourseToCurrentSemester = useCallback(async (
    task: Task, 
    editingColumnId: string | null
  ): Promise<boolean> => {
    try {
      if (!task.cursoId) {
        toast({
          title: "Error",
          description: "ID de curso no válido",
          variant: "destructive",
        });
        return false;
      }

      let targetSemester: number;

      if (editingColumnId) {
        // Modo edición: añadir al semestre que se está editando
        targetSemester = getSemesterFromColumnId(editingColumnId);
        console.log(`Modo edición: añadiendo al semestre ${targetSemester}`);
      } else {
        // Modo normal: añadir al semestre natural del curso
        targetSemester = task.semestre;
        console.log(`Modo normal: añadiendo al semestre natural ${targetSemester}`);
      }

      // Verificar prerrequisitos
      const prereqCheck = dataManager.checkPrerequisites(task.cursoId);
      if (!prereqCheck.canAdd) {
        const missingCourses = prereqCheck.missingPrereqs.map((c: any) => c.nombre).join(', ');
        toast({
          title: "Prerrequisitos no cumplidos",
          description: `Faltan: ${missingCourses}`,
          variant: "destructive",
        });
        return false;
      }

      // Añadir el curso
      const result = await dataManager.addCourseToSemester(task.cursoId, targetSemester);
      
      if (result.success) {
        toast({
          title: "Curso añadido",
          description: `"${task.nombre}" añadido al semestre ${targetSemester}`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error al añadir curso:', error);
      toast({
        title: "Error",
        description: "Error inesperado al añadir el curso",
        variant: "destructive",
      });
      return false;
    }
  }, [getSemesterFromColumnId, toast]);

  // Maneja cambios de estado de curso (aprobado/reprobado)
  const handleCourseStatusChange = useCallback(async (
    instanceId: string, 
    newStatus: 'aprobado' | 'reprobado'
  ): Promise<boolean> => {
    try {
      let result;
      
      if (newStatus === 'aprobado') {
        result = await dataManager.markCourseAsApproved(instanceId);
      } else {
        result = await dataManager.markCourseAsFailed(instanceId);
      }

      if (result.success) {
        const statusText = newStatus === 'aprobado' ? 'aprobado' : 'reprobado';
        toast({
          title: `Curso ${statusText}`,
          description: result.message,
        });
        
        // Si es reprobación, informar sobre la copia creada
        if (newStatus === 'reprobado' && result.newInstances && result.newInstances.length > 0) {
          toast({
            title: "Copia creada",
            description: "Se ha creado una copia del curso en el siguiente semestre",
          });
        }
        
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error al cambiar estado del curso:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cambiar el estado del curso",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Maneja la eliminación de cursos
  const handleCourseRemoval = useCallback(async (instanceId: string): Promise<boolean> => {
    try {
      const result = await dataManager.removeCourseWithCascade(instanceId);
      
      if (result.success) {
        const affectedCount = result.affectedInstances?.length || 1;
        const message = affectedCount > 1 
          ? `Curso eliminado junto con ${affectedCount - 1} copia(s)`
          : 'Curso eliminado';
          
        toast({
          title: "Eliminación exitosa",
          description: message,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el curso",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Verifica si se puede añadir un curso
  const canAddCourse = useCallback((cursoId: number): { canAdd: boolean; reason?: string } => {
    const progress = dataManager.getUserProgress();
    if (!progress) {
      return { canAdd: false, reason: 'No hay progreso inicializado' };
    }

    // Verificar si el curso está disponible
    const instances = dataManager.getCourseInstances(progress, cursoId);
    const hasApprovedInstance = instances.some((instance: UserCourse) => instance.estado === 'aprobado');
    
    if (hasApprovedInstance) {
      return { canAdd: false, reason: 'El curso ya está aprobado' };
    }

    // Verificar prerrequisitos
    const prereqCheck = dataManager.checkPrerequisites(cursoId);
    if (!prereqCheck.canAdd) {
      const missingCourses = prereqCheck.missingPrereqs.map((c: any) => c.nombre).join(', ');
      return { canAdd: false, reason: `Faltan prerrequisitos: ${missingCourses}` };
    }

    return { canAdd: true };
  }, []);

  // Valida prerrequisitos de un curso
  const validatePrerequisites = useCallback((cursoId: number): { valid: boolean; missingCourses: string[] } => {
    const prereqCheck = dataManager.checkPrerequisites(cursoId);
    
    return {
      valid: prereqCheck.canAdd,
      missingCourses: prereqCheck.missingPrereqs.map((c: any) => c.nombre)
    };
  }, []);

  // Obtiene información de un curso
  const getCourseInfo = useCallback((cursoId: number) => {
    const progress = dataManager.getUserProgress();
    if (!progress) return null;

    const instances = dataManager.getCourseInstances(progress, cursoId);
    const prereqCheck = dataManager.checkPrerequisites(cursoId);
    const canAdd = canAddCourse(cursoId);

    return {
      instances,
      canAdd: canAdd.canAdd,
      reason: canAdd.reason,
      prerequisites: prereqCheck,
      totalInstances: instances.length,
      approvedInstances: instances.filter((i: UserCourse) => i.estado === 'aprobado').length,
      failedInstances: instances.filter((i: UserCourse) => i.estado === 'reprobado').length,
      pendingInstances: instances.filter((i: UserCourse) => i.estado === 'pendiente').length
    };
  }, [canAddCourse]);

  return {
    // Operaciones principales
    addCourseToCurrentSemester,
    handleCourseStatusChange,
    handleCourseRemoval,
    
    // Validaciones
    canAddCourse,
    validatePrerequisites,
    
    // Utilidades
    getCourseInfo,
    getNextAvailableSemester,
    getSemesterFromColumnId,
  };
}
