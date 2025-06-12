"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import KanbanBoard from "./kanban-board"
import HorizontalCourseSelector from "./horizontal-course-selector"
import CareerSelectionModal from "./career-selection-modal"
import NewCareerConfirmationModal from "./new-career-confirmation-modal"
import { Button } from "@/components/ui/button"
import { GraduationCap, Trash2, RotateCcw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Task, Column as ColumnType } from "@/types/kanban"
import { useToast } from "@/hooks/use-toast"
import { carreras, getCarreraByLink } from "@/data/carreras"
import { getCarreraData } from "../data/data-loader"
import ColorLegend from "./color-legend"
import { carreraStateManager } from "@/lib/carrera-state-manager"
import { progressCacheManager } from "@/lib/progress-cache-manager"
import { CarreraType } from "@/types/carrera-state"
import { useUserProgress } from "@/hooks/use-user-progress"

export default function AppContainer() {
  const { toast } = useToast()
  
  // Estados para el nuevo sistema de gestión de carreras
  const [currentCarrera, setCurrentCarrera] = useState<CarreraType | null>(null)
  const [showCareerSelector, setShowCareerSelector] = useState(false)
  const [showNewCareerConfirmation, setShowNewCareerConfirmation] = useState(false)
  const [pendingCarrera, setPendingCarrera] = useState<CarreraType | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Estados del sistema anterior (mantenidos para compatibilidad)
  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState<string>("todos")
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [draggedTaskSemestre, setDraggedTaskSemestre] = useState<number | null>(null)
  const [departmentColors, setDepartmentColors] = useState<Record<string, [string, string]>>({})
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // Obtener ID de carrera para el hook
  const currentCarreraId = currentCarrera ? getCarreraByLink(currentCarrera)?.id : undefined;

  // Hook del sistema de progreso del usuario
  const {
    columns,
    sidebarTasks: availableTasks,
    userProgress,
    isLoading: loading,
    error,
    addCourseToSemester: addCourseToSemesterHook,
    markCourseAsFailed,
    markCourseAsApproved,
    markCourseAsInProgress,
    markCourseAsRav,
    addSemester,
    deleteSemester,
    refreshData,
    resetProgress,
    isLatestInstance,
    checkPrerequisites,
    removeCourseWithCascade
  } = useUserProgress(
    currentCarrera ? getCarreraData(currentCarrera)?.cursos || [] : [],
    currentCarreraId || 0
  )
  
  // Estados derivados
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  // Función para asegurar que siempre haya columnas mínimas
  const ensureMinimumColumns = useCallback((cols: ColumnType[]): ColumnType[] => {
    if (!currentCarrera) return cols
    
    // Si no hay columnas o están vacías, crear las columnas básicas
    if (!cols || cols.length === 0) {
      return [
        {
          id: "column-1",
          title: "I",
          tasks: []
        },
        {
          id: "column-2", 
          title: "II",
          tasks: []
        }
      ]
    }
    
    return cols
  }, [currentCarrera])

  // Columnas con garantía mínima
  const displayColumns = ensureMinimumColumns(columns)

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    console.log(`[AppContainer] ${message}`, data || "")
  }

  // Inicialización del sistema al cargar la aplicación
  useEffect(() => {
    const initializeApp = () => {
      try {
        const systemState = carreraStateManager.initializeSystem()
        
        if (systemState.shouldShowCareerSelector) {
          // No hay progreso existente, mostrar selector de carrera
          setShowCareerSelector(true)
        } else if (systemState.activeCarrera) {
          // Hay una carrera activa, cargarla
          setCurrentCarrera(systemState.activeCarrera)
        }
        
        setIsInitialized(true)
        debugLog("Sistema inicializado", systemState)
      } catch (error) {
        console.error("Error inicializando sistema:", error)
        setShowCareerSelector(true)
        setIsInitialized(true)
      }
    }

    initializeApp()
  }, [])

  // Cargar los colores de departamentos
  useEffect(() => {
    const loadDepartmentColors = async () => {
      try {
        const response = await fetch("/data/colors_INF.json")
        if (!response.ok) {
          throw new Error(`Error cargando colores: ${response.status}`)
        }
        const data = await response.json()
        setDepartmentColors(data)
      } catch (error) {
        console.error("Error cargando colores de departamentos:", error)
      }
    }

    loadDepartmentColors()
  }, [])

  // Actualizar el efecto de filtrado
  useEffect(() => {
    let filtered = availableTasks

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task: Task) =>
          (task.nombre && task.nombre.toLowerCase().includes(query)) ||
          (task.codigo && task.codigo.toLowerCase().includes(query)),
      )
    }

    if (courseFilter !== "todos") {
      // Implementar otros filtros aquí si es necesario
    }

    setFilteredTasks(filtered)
  }, [searchQuery, courseFilter, availableTasks])

  // Manejar selección de carrera inicial
  const handleCareerSelection = useCallback(async (carrera: CarreraType) => {
    try {
      debugLog("Seleccionando carrera inicial", { carrera })
      
      // Convertir LINK a ID
      const carreraInfo = getCarreraByLink(carrera);
      if (!carreraInfo) {
        throw new Error(`Carrera ${carrera} no encontrada`);
      }
      
      // Inicializar progreso para la carrera seleccionada
      const progress = progressCacheManager.initializeCarrera(carreraInfo.id)
      
      // Marcar como carrera activa
      carreraStateManager.setActiveCarrera(carrera)
      
      // Actualizar estado local
      setCurrentCarrera(carrera)
      setShowCareerSelector(false)
      
      toast({
        title: "Carrera iniciada",
        description: `Se ha iniciado la trayectoria para ${carrera}`,
      })
      
      debugLog("Carrera seleccionada exitosamente", { carrera, progress })
    } catch (error) {
      console.error("Error seleccionando carrera:", error)
      toast({
        title: "Error",
        description: "No se pudo inicializar la carrera seleccionada",
        variant: "destructive",
      })
    }
  }, [toast])

  // Manejar cambio de carrera
  const handleCareerChange = useCallback((nuevaCarrera: CarreraType) => {
    try {
      debugLog("Cambiando carrera", { actual: currentCarrera, nueva: nuevaCarrera })
      
      // Convertir LINK a ID para verificar progreso
      const nuevaCarreraInfo = getCarreraByLink(nuevaCarrera);
      if (!nuevaCarreraInfo) {
        throw new Error(`Carrera ${nuevaCarrera} no encontrada`);
      }
      
      // Verificar si ya tiene progreso
      const hasProgress = progressCacheManager.hasProgressForCarrera(nuevaCarreraInfo.id)
      
      if (hasProgress) {
        // Cargar progreso existente
        const progress = progressCacheManager.switchCarrera(nuevaCarreraInfo.id)
        carreraStateManager.setActiveCarrera(nuevaCarrera)
        setCurrentCarrera(nuevaCarrera)
        
        toast({
          title: "Carrera cambiada",
          description: `Se ha cargado el progreso existente de ${nuevaCarrera}`,
        })
        
        debugLog("Carrera cambiada a existente", { nuevaCarrera, progress })
      } else {
        // Mostrar confirmación para nueva carrera
        setPendingCarrera(nuevaCarrera)
        setShowNewCareerConfirmation(true)
        
        debugLog("Solicitando confirmación para nueva carrera", { nuevaCarrera })
      }
    } catch (error) {
      console.error("Error cambiando carrera:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar la carrera",
        variant: "destructive",
      })
    }
  }, [currentCarrera, toast])

  // Confirmar nueva carrera
  const handleNewCareerConfirmation = useCallback(() => {
    if (!pendingCarrera) return
    
    try {
      debugLog("Confirmando nueva carrera", { carrera: pendingCarrera })
      
      // Convertir LINK a ID
      const pendingCarreraInfo = getCarreraByLink(pendingCarrera);
      if (!pendingCarreraInfo) {
        throw new Error(`Carrera ${pendingCarrera} no encontrada`);
      }
      
      // Inicializar progreso para la nueva carrera
      const progress = progressCacheManager.initializeCarrera(pendingCarreraInfo.id)
      carreraStateManager.setActiveCarrera(pendingCarrera)
      
      // Actualizar estado local
      setCurrentCarrera(pendingCarrera)
      setShowNewCareerConfirmation(false)
      setPendingCarrera(null)
      
      toast({
        title: "Nueva carrera iniciada",
        description: `Se ha iniciado una nueva trayectoria para ${pendingCarrera}`,
      })
      
      debugLog("Nueva carrera confirmada", { carrera: pendingCarrera, progress })
    } catch (error) {
      console.error("Error confirmando nueva carrera:", error)
      toast({
        title: "Error",
        description: "No se pudo inicializar la nueva carrera",
        variant: "destructive",
      })
    }
  }, [pendingCarrera, toast])

  // Cancelar nueva carrera
  const handleNewCareerCancel = useCallback(() => {
    setShowNewCareerConfirmation(false)
    setPendingCarrera(null)
    debugLog("Cancelada nueva carrera")
  }, [])

  // Limpiar solo la carrera actual (resetear al primer semestre)
  const handleClearCarrera = useCallback(async () => {
    if (!currentCarrera) return
    
    try {
      debugLog("Limpiando carrera actual", { carrera: currentCarrera })
      
      // Resetear la carrera actual al primer semestre
      const newProgress = progressCacheManager.resetCurrentCarreraToFirstSemester(currentCarrera)
      
      // Refrescar los datos para que el hook se actualice
      refreshData()
      
      toast({
        title: "Carrera reiniciada",
        description: `Se ha reiniciado ${currentCarrera} al primer semestre`,
      })
      
      debugLog("Carrera reiniciada exitosamente", { carrera: currentCarrera, newProgress })
    } catch (error) {
      console.error("Error reiniciando carrera:", error)
      toast({
        title: "Error",
        description: "No se pudo reiniciar la carrera",
        variant: "destructive",
      })
    }
  }, [currentCarrera, refreshData, toast])

  // Limpiar todo el cache del sistema
  const handleClearCache = useCallback(async () => {
    if (!currentCarrera) return
    
    try {
      debugLog("Limpiando todo el cache del sistema", { carrera: currentCarrera })
      
      // Limpiar todo el progreso del sistema y reinicializar la carrera actual
      const newProgress = progressCacheManager.clearAllProgressAndReinitializeCurrent(currentCarrera)
      
      // Refrescar los datos para que el hook se actualice
      refreshData()
      
      toast({
        title: "Cache completo limpiado",
        description: `Se ha eliminado todo el progreso. ${currentCarrera} reiniciada al primer semestre`,
      })
      
      debugLog("Cache completo limpiado exitosamente", { carrera: currentCarrera, newProgress })
    } catch (error) {
      console.error("Error limpiando cache completo:", error)
      toast({
        title: "Error",
        description: "No se pudo limpiar el cache completo",
        variant: "destructive",
      })
    }
  }, [currentCarrera, refreshData, toast])

  // Función para añadir curso usando el hook
  const addCourseToSemester = useCallback(
    async (taskId: string) => {
      if (!availableTasks) return
      
      // Encontrar la tarea en los cursos disponibles
      const task = availableTasks.find((t) => t.id === taskId)
      if (!task || !task.cursoId) {
        debugLog("Tarea no encontrada o sin cursoId", { taskId })
        return
      }

      try {
        let targetSemester = task.semestre

        // Si estamos en modo de edición, usar el semestre que se está editando
        if (editingColumnId) {
          const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
          const targetColumn = columns.find((col) => col.id === editingColumnId)
          if (targetColumn) {
            targetSemester = romanNumerals.indexOf(targetColumn.title) + 1
          }
        }

        // Usar el hook para añadir el curso
        await addCourseToSemesterHook(task.cursoId, targetSemester)
        
        debugLog("Curso añadido exitosamente", { taskId, cursoId: task.cursoId, targetSemester })
      } catch (error) {
        console.error("Error añadiendo curso:", error)
        toast({
          title: "Error",
          description: "No se pudo añadir el curso",
          variant: "destructive",
        })
      }
    },
    [availableTasks, columns, editingColumnId, addCourseToSemesterHook, toast],
  )

  // Función para encontrar una tarea por ID en todas las fuentes
  const findTaskById = useCallback(
    (taskId: string): Task | null => {
      // Buscar en cursos disponibles
      const availableTask = availableTasks.find((task) => task.id === taskId)
      if (availableTask) return availableTask

      // Buscar en columnas
      for (const column of columns) {
        const columnTask = column.tasks.find((task) => task.id === taskId)
        if (columnTask) return columnTask
      }

      return null
    },
    [availableTasks, columns],
  )

  // Manejar drag and drop global
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result

      debugLog("Drag end", { destination, source, draggableId })

      // Limpiar el estado de drag
      setDraggedTaskSemestre(null)

      // Si no hay destino, cancelar
      if (!destination) {
        debugLog("Drag cancelado - sin destino")
        return
      }

      // Si se suelta en el mismo lugar, no hacer nada
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        debugLog("Drag cancelado - mismo lugar")
        return
      }

      // Por ahora, solo permitir drag desde sidebar a columnas
      if (source.droppableId === "sidebar" && destination.droppableId !== "sidebar") {
        // Añadir curso al semestre destino
        addCourseToSemester(draggableId)
      }
    },
    [addCourseToSemester],
  )

  // Función para iniciar edición de semestre
  const startEditingSemester = useCallback((columnId: string) => {
    debugLog("Iniciando edición de semestre", { columnId })
    setEditingColumnId(columnId)
  }, [])

  // Función para terminar edición de semestre
  const finishEditingSemester = useCallback(() => {
    debugLog("Terminando edición de semestre", { editingColumnId })
    setEditingColumnId(null)
  }, [editingColumnId])

  // Función para mover curso de vuelta al sidebar (eliminar del semestre)
  const handleMoveTaskToSidebar = useCallback(async (taskId: string) => {
    try {
      debugLog("Moviendo curso de vuelta al sidebar", { taskId })
      
      // Encontrar la tarea en las columnas para obtener su instanceId
      let taskToRemove: Task | null = null
      for (const column of displayColumns) {
        const foundTask = column.tasks.find(task => task.id === taskId)
        if (foundTask) {
          taskToRemove = foundTask
          break
        }
      }
      
      if (!taskToRemove || !taskToRemove.instanceId) {
        debugLog("Tarea no encontrada o sin instanceId", { taskId })
        toast({
          title: "Error",
          description: "No se pudo encontrar el curso a eliminar",
          variant: "destructive",
        })
        return
      }
      
      // Usar la función del hook para eliminar el curso
      await removeCourseWithCascade(taskToRemove.instanceId)
      
      debugLog("Curso movido al sidebar exitosamente", { taskId, instanceId: taskToRemove.instanceId })
    } catch (error) {
      console.error("Error moviendo curso al sidebar:", error)
      toast({
        title: "Error",
        description: "No se pudo mover el curso de vuelta al sidebar",
        variant: "destructive",
      })
    }
  }, [displayColumns, removeCourseWithCascade, toast])

  // Función para manejar cambios en las columnas (añadir/eliminar semestres)
  const handleColumnsChange = useCallback(async (newColumns: ColumnType[]) => {
    debugLog("Cambios en columnas", { newColumns })
    
    // Comparar con las columnas actuales para determinar qué cambió
    const currentColumnIds = displayColumns.map(col => col.id)
    const newColumnIds = newColumns.map(col => col.id)
    
    // Detectar si se añadió una columna
    const addedColumns = newColumnIds.filter(id => !currentColumnIds.includes(id))
    if (addedColumns.length > 0) {
      debugLog("Columna añadida detectada")
      await addSemester()
      return
    }
    
    // Detectar si se eliminó una columna
    const removedColumns = currentColumnIds.filter(id => !newColumnIds.includes(id))
    if (removedColumns.length > 0) {
      debugLog("Columna eliminada detectada", { removedColumns })
      for (const columnId of removedColumns) {
        await deleteSemester(columnId)
      }
      return
    }
    
    debugLog("No se detectaron cambios de estructura en las columnas")
  }, [displayColumns, addSemester, deleteSemester])

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Inicializando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={(start) => {
          console.log("🚀 Drag iniciado:", start.draggableId)

          // Encontrar la tarea que se está arrastrando
          const draggedTask = findTaskById(start.draggableId)
          if (draggedTask) {
            console.log("📚 Tarea encontrada:", draggedTask.nombre, "Semestre:", draggedTask.semestre)
            setDraggedTaskSemestre(draggedTask.semestre)
          } else {
            console.log("❌ Tarea no encontrada:", start.draggableId)
            setDraggedTaskSemestre(null)
          }
        }}
      >
        <div className="flex h-screen bg-slate-50 dark:bg-gray-950">
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <GraduationCap className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                </div>
                {currentCarrera && (
                  <select
                    className="ml-4 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    value={currentCarrera}
                    onChange={(e) => handleCareerChange(e.target.value as CarreraType)}
                    disabled={loading}
                  >
                    {carreras.map((carrera) => (
                      <option key={carrera.link} value={carrera.link}>
                        {carrera.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Título centrado */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Trayectoria Sansana</h1>
              </div>
              
              {/* Botones de control */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {currentCarrera && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearCarrera}
                      className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Limpiar Carrera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearCache}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpiar Cache
                    </Button>
                  </>
                )}
              </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 flex flex-col overflow-hidden">
              {error ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error al cargar los datos</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md px-4">{error}</p>
                  <Button onClick={refreshData}>Reintentar</Button>
                </div>
              ) : (
                <>
                  {/* Kanban Board */}
                  <div className="flex-1 overflow-auto">
                    <KanbanBoard
                      columns={displayColumns}
                      onColumnsChange={handleColumnsChange}
                      onTaskSelect={setSelectedTask}
                      selectedTask={selectedTask}
                      onTaskMoveToSidebar={handleMoveTaskToSidebar}
                      onStartEditingSemester={startEditingSemester}
                      draggedTaskSemestre={draggedTaskSemestre}
                      editingColumnId={editingColumnId}
                      allTasks={[]} // No necesario con el nuevo sistema
                      userProgress={userProgress}
                      onMarkAsApproved={markCourseAsApproved}
                      onMarkAsFailed={markCourseAsFailed}
                      onMarkAsPending={markCourseAsInProgress}
                      onMarkAsRav={markCourseAsRav}
                      isLatestInstance={isLatestInstance}
                    />
                  </div>

                  {/* Selector Horizontal de Cursos */}
                  <HorizontalCourseSelector
                    tasks={filteredTasks}
                    onTaskSelect={(task) => {
                      console.log("🖱️ Click en HorizontalCourseSelector, taskId:", task.id)
                      addCourseToSemester(task.id)
                    }}
                    onTaskDragStart={(task) => {
                      console.log("🚀 Drag iniciado desde HorizontalCourseSelector:", task.id)
                      setDraggedTaskSemestre(task.semestre)
                    }}
                    checkPrerequisites={checkPrerequisites}
                    isOpen={editingColumnId !== null}
                    onClose={finishEditingSemester}
                  />
                </>
              )}
            </main>

            {/* Leyenda de colores */}
            <div className="px-4 py-2">
              {departmentColors && Object.keys(departmentColors).length > 0 && <ColorLegend colors={departmentColors} />}
            </div>

            {/* Footer */}
            <footer className="h-12 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex items-center justify-center px-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Trayectoria Sansana. Todos los derechos reservados.
              </p>
            </footer>
          </div>
        </div>
      </DragDropContext>

      {/* Modales */}
      <CareerSelectionModal
        isOpen={showCareerSelector}
        onCareerSelect={handleCareerSelection}
        onClose={() => setShowCareerSelector(false)}
      />

      <NewCareerConfirmationModal
        isOpen={showNewCareerConfirmation}
        carrera={pendingCarrera}
        onConfirm={handleNewCareerConfirmation}
        onCancel={handleNewCareerCancel}
      />
    </>
  )
}
