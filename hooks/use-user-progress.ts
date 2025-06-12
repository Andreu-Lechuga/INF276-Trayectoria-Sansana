// Hook para gestionar el progreso del usuario

import { useState, useEffect, useCallback } from 'react';
import { Task, Column as ColumnType } from '@/types/kanban';
import { UserProgress, CourseOperationResult } from '@/types/user-progress';
import { dataManager } from '@/lib/data-manager';
import { useToast } from '@/hooks/use-toast';

interface UseUserProgressReturn {
  // Estado
  columns: ColumnType[];
  sidebarTasks: Task[];
  userProgress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
  
  // Operaciones de cursos
  addCourseToSemester: (cursoId: number, targetSemester: number) => Promise<CourseOperationResult>;
  markCourseAsFailed: (instanceId: string) => Promise<CourseOperationResult>;
  markCourseAsApproved: (instanceId: string) => Promise<CourseOperationResult>;
  markCourseAsInProgress: (instanceId: string) => Promise<CourseOperationResult>;
  markCourseAsRav: (instanceId: string) => Promise<CourseOperationResult>;
  removeCourseWithCascade: (instanceId: string) => Promise<CourseOperationResult>;
  moveCourse: (instanceId: string, targetSemester: number) => Promise<CourseOperationResult>;
  
  // Operaciones de semestres
  addSemester: () => Promise<CourseOperationResult>;
  deleteSemester: (columnId: string) => Promise<CourseOperationResult>;
  
  // Utilidades
  refreshData: () => void;
  resetProgress: () => boolean;
  exportProgress: () => string | null;
  importProgress: (backupData: string) => boolean;
  getProgressStats: () => any;
  checkPrerequisites: (cursoId: number) => any;
  getSuggestedCourses: () => any[];
  isLatestInstance: (instanceId: string) => boolean;
}

export function useUserProgress(
  originalCourses: any[] = [],
  carreraId: number
): UseUserProgressReturn {
  const { toast } = useToast();
  
  // Estado local
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [sidebarTasks, setSidebarTasks] = useState<Task[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para actualizar los datos del kanban
  const refreshData = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      if (originalCourses.length > 0 && carreraId) {
        // Inicializar el data manager
        dataManager.initialize(originalCourses, carreraId);
        
        // Obtener datos combinados
        const { columns: newColumns, sidebarTasks: newSidebarTasks } = dataManager.getCombinedKanbanData();
        
        setColumns(newColumns);
        setSidebarTasks(newSidebarTasks);
        setUserProgress(dataManager.getUserProgress());
        
        console.log('Datos actualizados:', {
          columns: newColumns.length,
          sidebarTasks: newSidebarTasks.length
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al actualizar datos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [originalCourses, carreraId]);

  // Inicializar datos cuando cambien las dependencias
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Función helper para manejar operaciones y mostrar toasts
  const handleOperation = useCallback(async (
    operation: () => CourseOperationResult,
    successTitle: string
  ): Promise<CourseOperationResult> => {
    try {
      const result = operation();
      
      if (result.success) {
        toast({
          title: successTitle,
          description: result.message,
        });
        
        // Actualizar datos después de la operación exitosa
        refreshData();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      const errorResult: CourseOperationResult = {
        success: false,
        message: errorMessage
      };
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return errorResult;
    }
  }, [toast, refreshData]);

  // Operaciones de cursos
  const addCourseToSemester = useCallback(async (
    cursoId: number, 
    targetSemester: number
  ): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.addCourseToSemester(cursoId, targetSemester),
      "Curso añadido"
    );
  }, [handleOperation]);

  const markCourseAsFailed = useCallback(async (
    instanceId: string
  ): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.markCourseAsFailed(instanceId),
      "Curso marcado como reprobado"
    );
  }, [handleOperation]);

  const markCourseAsApproved = useCallback(async (
    instanceId: string
  ): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.markCourseAsApproved(instanceId),
      "Curso marcado como aprobado"
    );
  }, [handleOperation]);

  const markCourseAsInProgress = useCallback(async (
    instanceId: string
  ): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.markCourseAsInProgress(instanceId),
      "Curso marcado como en curso"
    );
  }, [handleOperation]);

  const markCourseAsRav = useCallback(async (
    instanceId: string
  ): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.markCourseAsRav(instanceId),
      "RAV aplicado exitosamente"
    );
  }, [handleOperation]);

  const removeCourseWithCascade = useCallback(async (
    instanceId: string
  ): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.removeCourseWithCascade(instanceId),
      "Curso eliminado"
    );
  }, [handleOperation]);

  const moveCourse = useCallback(async (
    instanceId: string, 
    targetSemester: number
  ): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.moveCourse(instanceId, targetSemester),
      "Curso movido"
    );
  }, [handleOperation]);

  // Utilidades
  const resetProgress = useCallback((): boolean => {
    try {
      const success = dataManager.resetProgress();
      if (success) {
        refreshData();
        toast({
          title: "Progreso reiniciado",
          description: "Se ha reiniciado el progreso del usuario",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo reiniciar el progreso",
          variant: "destructive",
        });
      }
      return success;
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al reiniciar el progreso",
        variant: "destructive",
      });
      return false;
    }
  }, [refreshData, toast]);

  const exportProgress = useCallback((): string | null => {
    try {
      const backup = dataManager.exportProgress();
      if (backup) {
        toast({
          title: "Progreso exportado",
          description: "El progreso se ha exportado exitosamente",
        });
      }
      return backup;
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al exportar el progreso",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const importProgress = useCallback((backupData: string): boolean => {
    try {
      const success = dataManager.importProgress(backupData);
      if (success) {
        refreshData();
        toast({
          title: "Progreso importado",
          description: "El progreso se ha importado exitosamente",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo importar el progreso",
          variant: "destructive",
        });
      }
      return success;
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al importar el progreso",
        variant: "destructive",
      });
      return false;
    }
  }, [refreshData, toast]);

  const getProgressStats = useCallback(() => {
    return dataManager.getProgressStats();
  }, []);

  const checkPrerequisites = useCallback((cursoId: number) => {
    return dataManager.checkPrerequisites(cursoId);
  }, []);

  const getSuggestedCourses = useCallback(() => {
    return dataManager.getSuggestedCourses();
  }, []);

  const isLatestInstance = useCallback((instanceId: string): boolean => {
    return dataManager.isLatestInstance(instanceId);
  }, []);

  // Operaciones de semestres
  const addSemester = useCallback(async (): Promise<CourseOperationResult> => {
    return handleOperation(
      () => dataManager.addSemester(),
      "Semestre añadido"
    );
  }, [handleOperation]);

  const deleteSemester = useCallback(async (columnId: string): Promise<CourseOperationResult> => {
    const semesterNumber = dataManager.getSemesterFromColumnId(columnId);
    if (!semesterNumber) {
      return {
        success: false,
        message: 'ID de columna inválido'
      };
    }

    return handleOperation(
      () => dataManager.deleteSemester(semesterNumber),
      "Semestre eliminado"
    );
  }, [handleOperation]);

  return {
    // Estado
    columns,
    sidebarTasks,
    userProgress,
    isLoading,
    error,
    
    // Operaciones de cursos
    addCourseToSemester,
    markCourseAsFailed,
    markCourseAsApproved,
    markCourseAsInProgress,
    markCourseAsRav,
    removeCourseWithCascade,
    moveCourse,
    
    // Operaciones de semestres
    addSemester,
    deleteSemester,
    
    // Utilidades
    refreshData,
    resetProgress,
    exportProgress,
    importProgress,
    getProgressStats,
    checkPrerequisites,
    getSuggestedCourses,
    isLatestInstance,
  };
}
