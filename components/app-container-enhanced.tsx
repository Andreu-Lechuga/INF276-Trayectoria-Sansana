"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  Upload, 
  RefreshCw, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  BookOpen,
  GraduationCap
} from "lucide-react"

// Importar componentes
import KanbanBoard from "./kanban-board"
import EnhancedSidebar from "./enhanced-sidebar"
import HorizontalCourseSelector from "./horizontal-course-selector"

// Importar hooks y datos
import { useUserProgress } from "@/hooks/use-user-progress"
import { cursos } from "@/data/data_INF"
import { progressCacheManager } from "@/lib/progress-cache-manager"

// Tipos
import type { Task, Column as ColumnType } from "@/types/kanban"

interface AppContainerEnhancedProps {
  carrera?: 'INF' | 'MAT' | 'FIS'
}

export default function AppContainerEnhanced({ 
  carrera = 'INF' 
}: AppContainerEnhancedProps) {
  const { toast } = useToast()
  
  // Estado del selector horizontal (antes sidebar)
  const [horizontalSelectorOpen, setHorizontalSelectorOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)

  // Hook principal de progreso del usuario
  const {
    columns,
    sidebarTasks,
    userProgress,
    isLoading,
    error,
    addCourseToSemester,
    markCourseAsFailed,
    markCourseAsApproved,
    markCourseAsPending,
    removeCourseWithCascade,
    moveCourse,
    refreshData,
    resetProgress,
    exportProgress,
    importProgress,
    getProgressStats,
    checkPrerequisites,
    getSuggestedCourses,
  } = useUserProgress(cursos, carrera)

  // Estadísticas del progreso
  const stats = getProgressStats()

  // Manejar cambios en las columnas del kanban
  const handleColumnsChange = useCallback((newColumns: ColumnType[]) => {
    // El kanban board maneja los cambios internamente
    // Aquí podríamos agregar lógica adicional si es necesario
    console.log('Columnas actualizadas:', newColumns.length)
  }, [])

  // Manejar selección de tarea desde el sidebar
  const handleSidebarTaskSelect = useCallback((task: Task) => {
    setSelectedTask(task)
    console.log('Tarea seleccionada desde sidebar:', task.title)
  }, [])

  // Manejar inicio de arrastre desde el sidebar
  const handleSidebarTaskDragStart = useCallback((task: Task) => {
    setDraggedTask(task)
    console.log('Iniciando arrastre de tarea:', task.title)
  }, [])

  // Manejar movimiento de tarea al sidebar
  const handleTaskMoveToSidebar = useCallback((taskId: string) => {
    // Lógica para mover tarea de vuelta al sidebar
    console.log('Moviendo tarea al sidebar:', taskId)
  }, [])

  // Manejar inicio de edición de semestre
  const handleStartEditingSemester = useCallback((columnId: string) => {
    setEditingColumnId(columnId)
    setHorizontalSelectorOpen(true)
    console.log('Iniciando edición de semestre:', columnId)
  }, [])

  // Funciones de importación/exportación
  const handleExport = useCallback(() => {
    const backup = exportProgress()
    if (backup) {
      // Crear y descargar archivo
      const blob = new Blob([backup], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trayectoria-${carrera}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Progreso exportado",
        description: "El archivo se ha descargado exitosamente",
      })
    }
  }, [exportProgress, carrera, toast])

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        const success = importProgress(content)
        if (success) {
          toast({
            title: "Progreso importado",
            description: "Los datos se han cargado exitosamente",
          })
        }
      }
    }
    reader.readAsText(file)
    
    // Limpiar el input
    event.target.value = ''
  }, [importProgress, toast])

  const handleReset = useCallback(() => {
    if (confirm('¿Estás seguro de que quieres reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
      const success = resetProgress()
      if (success) {
        toast({
          title: "Progreso reiniciado",
          description: "Se ha reiniciado todo el progreso del usuario",
        })
      }
    }
  }, [resetProgress, toast])

  // Obtener semestre del curso arrastrado
  const draggedTaskSemestre = draggedTask?.semestre || null

  // Manejar drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result

    console.log('Drag end', { destination, source, draggableId })

    // Limpiar el estado de drag
    setDraggedTask(null)

    // Si no hay destino, cancelar
    if (!destination) {
      console.log('Drag cancelado - sin destino')
      return
    }

    // Si se suelta en el mismo lugar, no hacer nada
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('Drag cancelado - mismo lugar')
      return
    }

    // Aquí se manejaría la lógica de drag and drop
    // Por ahora solo logueamos
    console.log('Drag completado', { from: source, to: destination })
  }, [])

  const handleDragStart = useCallback((start: any) => {
    console.log('Drag iniciado:', start.draggableId)
    
    // Encontrar la tarea que se está arrastrando
    const allTasks = [...sidebarTasks, ...columns.flatMap(col => col.tasks)]
    const draggedTask = allTasks.find(task => task.id === start.draggableId)
    
    if (draggedTask) {
      console.log('Tarea encontrada:', draggedTask.title, 'Semestre:', draggedTask.semestre)
      setDraggedTask(draggedTask)
    } else {
      console.log('Tarea no encontrada:', start.draggableId)
      setDraggedTask(null)
    }
  }, [sidebarTasks, columns])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error al cargar datos</p>
          <p className="text-sm">{error}</p>
          <Button onClick={refreshData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Trayectoria Sansana
              </h1>
              <Badge variant="outline" className="ml-2">
                {carrera}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Estadísticas rápidas */}
              <div className="hidden md:flex items-center gap-4 mr-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Aprobados</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {stats.cursosAprobados}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pendientes</p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {stats.cursosPendientes}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reprobados</p>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {stats.cursosReprobados}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </header>

        {/* Contenido principal - Layout vertical */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Kanban Board */}
          <div className="flex-1 overflow-hidden">
            <KanbanBoard
              columns={columns}
              onColumnsChange={handleColumnsChange}
              onTaskSelect={setSelectedTask}
              selectedTask={selectedTask}
              onTaskMoveToSidebar={handleTaskMoveToSidebar}
              toggleSidebar={() => setHorizontalSelectorOpen(!horizontalSelectorOpen)}
              onStartEditingSemester={handleStartEditingSemester}
              draggedTaskSemestre={draggedTaskSemestre}
              editingColumnId={editingColumnId}
              allTasks={[...sidebarTasks, ...columns.flatMap(col => col.tasks)]}
            />
          </div>

          {/* Selector Horizontal de Cursos */}
          <HorizontalCourseSelector
            tasks={sidebarTasks}
            onTaskSelect={handleSidebarTaskSelect}
            onTaskDragStart={handleSidebarTaskDragStart}
            checkPrerequisites={checkPrerequisites}
            isOpen={horizontalSelectorOpen}
            onClose={() => setHorizontalSelectorOpen(false)}
          />
        </div>

        {/* Footer con información adicional */}
        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                {stats.totalCursos} cursos totales
              </span>
              <span>
                {stats.totalSemestres} semestres activos
              </span>
              {stats.totalReprobaciones > 0 && (
                <span className="text-orange-600 dark:text-orange-400">
                  {stats.totalReprobaciones} reprobaciones
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span>
                Última actualización: {userProgress?.lastModified ? 
                  new Date(userProgress.lastModified).toLocaleString() : 
                  'Nunca'
                }
              </span>
            </div>
          </div>
        </footer>
      </div>
    </DragDropContext>
  )
}
