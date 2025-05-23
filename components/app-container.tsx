"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd"
import KanbanBoard from "./kanban-board"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, ChevronLeft, ChevronRight, AlertCircle, GraduationCap } from "lucide-react"
import type { Task, Column as ColumnType } from "@/types/kanban"
import { useToast } from "@/hooks/use-toast"
import { carreras } from "@/data/carreras"
import { getCarreraData } from "../data/data-loader"
import TaskCard from "./task-card"
import ColorLegend from "./color-legend"

// Añadir este estilo global después de la declaración de AppContainer
export default function AppContainer() {
  // Reemplazar todo el bloque useEffect para los estilos globales con esta versión más simple
  useEffect(() => {
    // Crear un elemento de estilo
    const styleElement = document.createElement("style")
    styleElement.innerHTML = `
    /* Estilos básicos para mantener la visibilidad durante el arrastre */
    .dragging-item {
      opacity: 0.8 !important;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
      z-index: 9999 !important;
    }
    
    /* Forzar visibilidad para elementos arrastrados */
    [data-rbd-draggable-id] {
      visibility: visible !important;
    }
    
    /* Asegurar que el elemento arrastrado permanezca visible */
    [data-rbd-drag-handle-draggable-id][data-rbd-dragging="true"] {
      visibility: visible !important;
      opacity: 0.8 !important;
    }
    
    /* Estilo específico para el sidebar */
    [data-rbd-droppable-id="sidebar"] [data-rbd-draggable-id] {
      transition: transform 0.2s ease;
    }
  `

    // Añadir el elemento de estilo al head
    document.head.appendChild(styleElement)

    // Limpiar al desmontar
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  const { toast } = useToast()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [sidebarTasks, setSidebarTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departmentColors, setDepartmentColors] = useState<Record<string, [string, string]>>({})
  const [selectedCarrera, setSelectedCarrera] = useState<{ nombre: string; link: string } | null>(null)
  const [courseFilter, setCourseFilter] = useState<string>("todos")

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    console.log(`[AppContainer] ${message}`, data || "")
  }

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

  // Inicializar la carrera seleccionada
  useEffect(() => {
    if (carreras.length > 0) {
      setSelectedCarrera(carreras[0])
    }
  }, [])

  const loadCarreraData = async (carreraLink: string) => {
    if (!carreraLink) return

    setLoading(true)
    setError(null)

    try {
      const dataModule = getCarreraData(carreraLink)

      if (!dataModule || !dataModule.cursos || !Array.isArray(dataModule.cursos)) {
        throw new Error("Formato de datos inválido: no se encontraron cursos")
      }

      const cursos = dataModule.cursos

      const tasks: Task[] = cursos.map((curso: any) => {
        let colorValue = null
        if (curso.color) {
          colorValue = curso.color
        } else if (departmentColors && curso.departamento && departmentColors[curso.departamento]) {
          colorValue = departmentColors[curso.departamento][0]
        }

        return {
          id: `curso-${curso.codigo}`,
          title: curso.nombre,
          nombre: curso.nombre,
          codigo: curso.codigo,
          creditos: curso.creditos,
          horas: curso.horas,
          departamento: curso.departamento,
          color: colorValue,
          prerrequisitos: curso.prerrequisitos || [],
          periodo: curso.periodo || "",
          semestre: curso.semestre,
          description: "",
          status: "Available",
          dueDate: null,
          subtasks: [],
          customFields: [],
          createdAt: new Date().toISOString(),
          cursoId: curso.id,
        }
      })

      // Separar los cursos del primer semestre para el tablero
      const primerSemestreTasks = tasks.filter((task) => task.semestre === 1)
      // Los cursos restantes van al sidebar
      const remainingTasks = tasks.filter((task) => task.semestre !== 1)

      setAllTasks(tasks)
      setSidebarTasks(remainingTasks)

      // Inicializar columnas con cursos del primer semestre
      const initialColumns: ColumnType[] = [
        {
          id: "column-1",
          title: "I",
          tasks: primerSemestreTasks,
        },
        {
          id: "column-2",
          title: "II",
          tasks: [],
        },
      ]

      setColumns(initialColumns)
      setLoading(false)

      debugLog("Datos cargados", {
        totalTasks: tasks.length,
        sidebarTasks: remainingTasks.length,
        primerSemestreTasks: primerSemestreTasks.length,
        columns: initialColumns.length,
      })
    } catch (error) {
      console.error("Error loading carrera data:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar los datos")
      setLoading(false)

      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los datos de la carrera: ${error instanceof Error ? error.message : error}`,
        variant: "destructive",
      })

      setAllTasks([])
      setSidebarTasks([])
      setColumns([])
    }
  }

  // Cargar los datos de la carrera seleccionada cuando cambie
  useEffect(() => {
    if (selectedCarrera) {
      loadCarreraData(selectedCarrera.link)
    }
  }, [selectedCarrera, departmentColors])

  // Actualizar el efecto de filtrado
  useEffect(() => {
    let filtered = sidebarTasks

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          (task.nombre && task.nombre.toLowerCase().includes(query)) ||
          (task.codigo && task.codigo.toLowerCase().includes(query)),
      )
    }

    if (courseFilter !== "todos") {
      // Implementar otros filtros aquí si es necesario
    }

    setFilteredTasks(filtered)
  }, [searchQuery, courseFilter, sidebarTasks])

  // Función para mover una tarea desde el sidebar a una columna
  const moveTaskFromSidebarToColumn = useCallback(
    (taskId: string, targetColumnId: string, targetIndex: number) => {
      debugLog("Moviendo tarea desde sidebar a columna", { taskId, targetColumnId, targetIndex })

      // Encontrar la tarea en el sidebar
      const taskToMove = sidebarTasks.find((task) => task.id === taskId)
      if (!taskToMove) {
        debugLog("Tarea no encontrada en sidebar", { taskId })
        return
      }

      // Encontrar la columna destino
      const targetColumn = columns.find((col) => col.id === targetColumnId)
      if (!targetColumn) {
        debugLog("Columna destino no encontrada", { targetColumnId })
        return
      }

      // Crear la tarea actualizada con el nuevo status
      const updatedTask = {
        ...taskToMove,
        status: targetColumn.title,
      }

      // Actualizar el estado de forma atómica
      setSidebarTasks((prevSidebarTasks) => {
        const newSidebarTasks = prevSidebarTasks.filter((task) => task.id !== taskId)
        debugLog("Sidebar actualizado", { removedTaskId: taskId, remainingTasks: newSidebarTasks.length })
        return newSidebarTasks
      })

      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.id === targetColumnId) {
            const newTasks = [...column.tasks]
            newTasks.splice(targetIndex, 0, updatedTask)
            debugLog("Columna actualizada", { columnId: targetColumnId, newTasksCount: newTasks.length })
            return {
              ...column,
              tasks: newTasks,
            }
          }
          return column
        })
        return newColumns
      })

      toast({
        title: "Curso añadido",
        description: `"${taskToMove.nombre}" añadido al semestre ${targetColumn.title}`,
      })

      debugLog("Tarea movida exitosamente", { taskId, from: "sidebar", to: targetColumnId })
    },
    [sidebarTasks, columns, toast],
  )

  // Función para mover una tarea desde una columna al sidebar
  const moveTaskFromColumnToSidebar = useCallback(
    (taskId: string) => {
      debugLog("Moviendo tarea desde columna a sidebar", { taskId })

      let taskToMove: Task | null = null
      let sourceColumnId: string | null = null

      // Encontrar la tarea en las columnas
      for (const column of columns) {
        const task = column.tasks.find((t) => t.id === taskId)
        if (task) {
          taskToMove = task
          sourceColumnId = column.id
          break
        }
      }

      if (!taskToMove || !sourceColumnId) {
        debugLog("Tarea no encontrada en columnas", { taskId })
        return
      }

      // Crear la tarea actualizada para el sidebar
      const updatedTask = {
        ...taskToMove,
        status: "Available",
      }

      // Actualizar el estado de forma atómica
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            }
          }
          return column
        })
        debugLog("Columnas actualizadas", { removedTaskId: taskId, fromColumn: sourceColumnId })
        return newColumns
      })

      setSidebarTasks((prevSidebarTasks) => {
        const newSidebarTasks = [...prevSidebarTasks, updatedTask]
        debugLog("Sidebar actualizado", { addedTaskId: taskId, totalTasks: newSidebarTasks.length })
        return newSidebarTasks
      })

      toast({
        title: "Curso devuelto",
        description: `"${taskToMove.nombre}" devuelto a cursos disponibles`,
      })

      debugLog("Tarea movida exitosamente", { taskId, from: sourceColumnId, to: "sidebar" })
    },
    [columns, toast],
  )

  // Función para mover tareas entre columnas
  const moveTaskBetweenColumns = useCallback(
    (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
      debugLog("Moviendo tarea entre columnas", { taskId, sourceColumnId, targetColumnId, targetIndex })

      const sourceColumn = columns.find((col) => col.id === sourceColumnId)
      const targetColumn = columns.find((col) => col.id === targetColumnId)

      if (!sourceColumn || !targetColumn) {
        debugLog("Columna no encontrada", { sourceColumnId, targetColumnId })
        return
      }

      const taskToMove = sourceColumn.tasks.find((task) => task.id === taskId)
      if (!taskToMove) {
        debugLog("Tarea no encontrada en columna origen", { taskId, sourceColumnId })
        return
      }

      // Crear la tarea actualizada
      const updatedTask = {
        ...taskToMove,
        status: targetColumn.title,
      }

      // Actualizar columnas
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.id === sourceColumnId) {
            // Remover de la columna origen
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            }
          } else if (column.id === targetColumnId) {
            // Añadir a la columna destino
            const newTasks = [...column.tasks]
            newTasks.splice(targetIndex, 0, updatedTask)
            return {
              ...column,
              tasks: newTasks,
            }
          }
          return column
        })
        debugLog("Columnas actualizadas para movimiento entre columnas")
        return newColumns
      })

      // Actualizar tarea seleccionada si es necesario
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask)
      }

      toast({
        title: "Curso movido",
        description: `"${taskToMove.nombre}" movido a semestre ${targetColumn.title}`,
      })

      debugLog("Tarea movida exitosamente entre columnas", { taskId, from: sourceColumnId, to: targetColumnId })
    },
    [columns, selectedTask, toast],
  )

  // Manejar drag and drop global
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result

      debugLog("Drag end", { destination, source, draggableId })

      // Si no hay destino o se suelta en el mismo lugar, no hacer nada
      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        debugLog("Drag cancelado - sin destino o mismo lugar")
        return
      }

      // Si el origen es el sidebar, no permitir el arrastre
      if (source.droppableId === "sidebar") {
        debugLog("Drag cancelado - no se permite arrastrar desde sidebar")
        return
      }

      try {
        // Caso 1: Mover desde columna a sidebar
        if (source.droppableId !== "sidebar" && destination.droppableId === "sidebar") {
          moveTaskFromColumnToSidebar(draggableId)
        }
        // Caso 2: Mover entre columnas
        else if (source.droppableId !== "sidebar" && destination.droppableId !== "sidebar") {
          moveTaskBetweenColumns(draggableId, source.droppableId, destination.droppableId, destination.index)
        }
      } catch (error) {
        console.error("Error en handleDragEnd:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al mover el curso",
          variant: "destructive",
        })
      }
    },
    [moveTaskFromColumnToSidebar, moveTaskBetweenColumns, toast],
  )

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Función para actualizar las columnas desde KanbanBoard
  const handleColumnsUpdate = useCallback((updatedColumns: ColumnType[]) => {
    debugLog("Actualizando columnas desde KanbanBoard", { columnsCount: updatedColumns.length })
    setColumns(updatedColumns)
  }, [])

  if (!selectedCarrera) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Cargando carreras...</p>
        </div>
      </div>
    )
  }

  return (
    <DragDropContext
      onDragEnd={handleDragEnd}
      onDragStart={(start) => {
        // Añadir una clase al elemento que se está arrastrando para asegurar que permanezca visible
        const draggableElement = document.querySelector(`[data-rbd-draggable-id="${start.draggableId}"]`)
        if (draggableElement) {
          draggableElement.classList.add("task-drag-preview")
        }

        // Añadir una clase al body para indicar que se está arrastrando
        document.body.classList.add("is-dragging")
      }}
      onDragUpdate={(update) => {
        // Actualizar la posición del elemento arrastrado si es necesario
      }}
    >
      <div className="flex flex-row-reverse h-screen bg-slate-50 dark:bg-gray-950">
        {/* Sidebar - Mobile overlay */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />}

        {/* Sidebar */}
        <aside
          className={`fixed lg:relative inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700 transform transition-all duration-200 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-right">Cursos ({filteredTasks.length})</div>
          </div>

          {/* Search bar at the top */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 bg-gray-100 dark:bg-gray-700 border-0 rounded-full transition-all ${
                  isSidebarOpen ? "w-full" : "w-0 p-0 opacity-0 lg:hidden"
                }`}
              />
            </div>

            <div className="mt-4">
              <select
                className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="sugeridos">Sugeridos</option>
                <option value="sin-desbloquear">Sin Desbloquear</option>
              </select>
            </div>
          </div>

          {/* Task cards container - Área droppable */}
          <Droppable droppableId="sidebar">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-2 overflow-auto ${isSidebarOpen ? "" : "hidden lg:block"} ${
                  snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                style={{ maxHeight: "calc(100vh - 140px)" }}
                data-is-droppable="true"
              >
                {loading ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">Cargando cursos...</div>
                ) : error ? (
                  <div className="text-center py-4 text-red-500 dark:text-red-400 flex flex-col items-center">
                    <AlertCircle className="h-6 w-6 mb-2" />
                    <p>Error al cargar los cursos</p>
                    <p className="text-xs mt-1">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => selectedCarrera && loadCarreraData(selectedCarrera.link)}
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`${selectedTask?.id === task.id ? "ring-2 ring-blue-500 rounded-md" : ""}`}
                      >
                        <TaskCard
                          task={task}
                          onClick={() => setSelectedTask(task)}
                          onDuplicate={() => {}}
                          className="mb-2"
                        />
                      </div>
                    ))}
                    {provided.placeholder}
                    {filteredTasks.length === 0 && !loading && !error && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        {searchQuery ? "No se encontraron cursos" : "No hay cursos disponibles"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Toggle button outside sidebar */}
          <div className="absolute top-3 right-0 z-50 lg:block hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="rounded-full shadow-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mr-2"
            >
              {isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Header */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <GraduationCap className="h-6 w-6 text-gray-800 dark:text-gray-200" />
              </div>
              <select
                className="ml-4 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={selectedCarrera?.link || ""}
                onChange={(e) => {
                  const carrera = carreras.find((c) => c.link === e.target.value)
                  if (carrera) {
                    setSelectedCarrera(carrera)
                  }
                }}
                disabled={loading}
              >
                {carreras.map((carrera) => (
                  <option key={carrera.link} value={carrera.link}>
                    {carrera.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error al cargar los datos</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md px-4">{error}</p>
                <Button onClick={() => selectedCarrera && loadCarreraData(selectedCarrera.link)}>Reintentar</Button>
              </div>
            ) : (
              <KanbanBoard
                columns={columns}
                onColumnsChange={handleColumnsUpdate}
                onTaskSelect={setSelectedTask}
                selectedTask={selectedTask}
                onTaskMoveToSidebar={moveTaskFromColumnToSidebar}
                toggleSidebar={() => setIsSidebarOpen(true)}
              />
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
  )
}
