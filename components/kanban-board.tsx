"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import Column from "./column"
import TaskDetailModal from "./task-detail-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Task, Column as ColumnType } from "@/types/kanban"
import type { UserProgress, CourseOperationResult } from "@/types/user-progress"
import YearGroup from "./year-group"
import SemesterNavigation from "./semester-navigation"

interface KanbanBoardProps {
  columns: ColumnType[]
  onColumnsChange: (columns: ColumnType[]) => void
  onTaskSelect?: (task: Task | null) => void
  selectedTask?: Task | null
  onTaskMoveToSidebar?: (taskId: string) => void
  toggleSidebar?: () => void
  onStartEditingSemester?: (columnId: string) => void
  draggedTaskSemestre?: number | null
  editingColumnId?: string | null
  allTasks?: Task[]
  // Nuevas props para el sistema de progreso
  userProgress?: UserProgress | null
  onMarkAsApproved?: (instanceId: string) => Promise<CourseOperationResult>
  onMarkAsFailed?: (instanceId: string) => Promise<CourseOperationResult>
  onMarkAsPending?: (instanceId: string) => Promise<CourseOperationResult>
  onMarkAsRav?: (instanceId: string) => Promise<CourseOperationResult>
  isLatestInstance?: (instanceId: string) => boolean
}

export default function KanbanBoard({
  columns,
  onColumnsChange,
  onTaskSelect,
  selectedTask,
  onTaskMoveToSidebar,
  toggleSidebar,
  onStartEditingSemester,
  draggedTaskSemestre,
  editingColumnId,
  allTasks = [],
  userProgress,
  onMarkAsApproved,
  onMarkAsFailed,
  onMarkAsPending,
  onMarkAsRav,
  isLatestInstance,
}: KanbanBoardProps) {
  const { toast } = useToast()
  const [localSelectedTask, setLocalSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState("board")

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    console.log(`[KanbanBoard] ${message}`, data || "")
  }

  // Función para generar ID de columna basado en el número de semestre
  const generateColumnId = (semesterNumber: number): string => {
    return `column-${semesterNumber}`
  }

  // Sincronizar tarea seleccionada
  useEffect(() => {
    if (selectedTask) {
      setLocalSelectedTask(selectedTask)
    }
  }, [selectedTask])

  const getAllTasks = useCallback(() => {
    return columns.flatMap((column) => column.tasks.map((task) => ({ ...task })))
  }, [columns])

  const addTask = useCallback(
    (columnId: string, task: Task) => {
      debugLog("Añadiendo tarea", { columnId, taskId: task.id })

      const newColumns = columns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [...column.tasks, task],
          }
        }
        return column
      })

      onColumnsChange(newColumns)

      toast({
        title: "Tarea creada",
        description: `"${task.title}" añadida a ${columns.find((col) => col.id === columnId)?.title}`,
      })
    },
    [columns, onColumnsChange, toast],
  )

  const updateTask = useCallback(
    (updatedTask: Task) => {
      debugLog("Actualizando tarea", { taskId: updatedTask.id })

      const newColumns = columns.map((column) => {
        return {
          ...column,
          tasks: column.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        }
      })

      onColumnsChange(newColumns)
      setLocalSelectedTask(updatedTask)

      if (onTaskSelect) {
        onTaskSelect(updatedTask)
      }

      toast({
        title: "Tarea actualizada",
        description: `"${updatedTask.title}" ha sido actualizada`,
      })
    },
    [columns, onColumnsChange, onTaskSelect, toast],
  )

  const deleteTask = useCallback(
    (taskId: string) => {
      debugLog("Eliminando tarea", { taskId })

      const newColumns = columns.map((column) => {
        return {
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        }
      })

      onColumnsChange(newColumns)
      setLocalSelectedTask(null)

      if (onTaskSelect) {
        onTaskSelect(null)
      }

      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada",
      })
    },
    [columns, onColumnsChange, onTaskSelect, toast],
  )

  const addColumn = useCallback(() => {
    debugLog("Añadiendo columna")

    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
    const nextIndex = columns.length
    const nextRomanNumeral = romanNumerals[nextIndex] || `${nextIndex + 1}`
    const nextSemesterNumber = nextIndex + 1

    const newColumn: ColumnType = {
      id: generateColumnId(nextSemesterNumber),
      title: nextRomanNumeral,
      tasks: [],
    }

    console.log("🆔 Nueva columna manual creada con ID:", newColumn.id)

    onColumnsChange([...columns, newColumn])

    toast({
      title: "Semestre añadido",
      description: `Semestre ${nextRomanNumeral} ha sido añadido`,
    })
  }, [columns, onColumnsChange, toast])

  const updateColumn = useCallback(
    (columnId: string, updates: Partial<ColumnType>) => {
      debugLog("Actualizando columna", { columnId, updates })

      const newColumns = columns.map((column) => (column.id === columnId ? { ...column, ...updates } : column))
      onColumnsChange(newColumns)
    },
    [columns, onColumnsChange],
  )

  const deleteColumn = useCallback(
    (columnId: string) => {
      debugLog("Eliminando columna", { columnId })

      const column = columns.find((col) => col.id === columnId)
      if (!column) {
        toast({
          title: "Error",
          description: "No se encontró el semestre a eliminar",
          variant: "destructive",
        })
        return
      }

      // Verificar que el semestre esté vacío
      if (column.tasks.length > 0) {
        toast({
          title: "No se puede eliminar el semestre",
          description: "Por favor mueve o elimina todas las materias de este semestre primero",
          variant: "destructive",
        })
        return
      }

      // Verificar que solo se pueda eliminar el último semestre
      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
      const currentSemesterIndex = romanNumerals.indexOf(column.title)
      const maxSemesterIndex = Math.max(...columns.map(col => romanNumerals.indexOf(col.title)))

      if (currentSemesterIndex !== maxSemesterIndex) {
        toast({
          title: "No se puede eliminar este semestre",
          description: `Solo se puede eliminar el último semestre (${romanNumerals[maxSemesterIndex]}) para mantener la coherencia en la numeración`,
          variant: "destructive",
        })
        return
      }

      onColumnsChange(columns.filter((col) => col.id !== columnId))

      toast({
        title: "Semestre eliminado",
        description: `El semestre "${column.title}" ha sido eliminado`,
      })
    },
    [columns, onColumnsChange, toast],
  )

  const handleTaskClick = useCallback(
    (task: Task) => {
      debugLog("Tarea clickeada", { taskId: task.id })
      setLocalSelectedTask(task)
      if (onTaskSelect) {
        onTaskSelect(task)
      }
    },
    [onTaskSelect],
  )

  // Función para obtener los datos del usuario para un curso específico
  const getUserCourseData = useCallback((task: Task) => {
    if (!userProgress || !task.instanceId) {
      return undefined
    }

    // Buscar el curso en los semestres del progreso del usuario
    for (const [semestreId, semestreData] of Object.entries(userProgress.semestres)) {
      const userCourse = semestreData.cursos.find(c => c.instanceId === task.instanceId)
      if (userCourse) {
        return {
          estado: userCourse.estado,
          instanceId: userCourse.instanceId,
          vtr: userCourse.vtr
        }
      }
    }

    return undefined
  }, [userProgress])

  const renderBoardContent = () => (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      {(() => {
        const yearGroups: { year: number; columns: ColumnType[] }[] = []

        for (let i = 0; i < columns.length; i += 2) {
          const yearColumns = columns.slice(i, i + 2)
          const yearNumber = Math.floor(i / 2) + 1
          yearGroups.push({ year: yearNumber, columns: yearColumns })
        }

        return yearGroups.map((yearGroup) => (
          <YearGroup key={`year-${yearGroup.year}`} year={yearGroup.year} columns={yearGroup.columns}>
            {yearGroup.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={addTask}
                onTaskClick={handleTaskClick}
                onDeleteColumn={() => deleteColumn(column.id)}
                onUpdateColumn={updateColumn}
                toggleSidebar={
                  onStartEditingSemester ? () => onStartEditingSemester(column.id) : toggleSidebar || (() => {})
                }
                onMoveTaskToSidebar={onTaskMoveToSidebar}
                draggedTaskSemestre={draggedTaskSemestre}
                editingColumnId={editingColumnId}
                allTasks={allTasks}
                getUserCourseData={getUserCourseData}
              />
            ))}
          </YearGroup>
        ))
      })()}

      <div className="shrink-0 w-52">
        <Button
          variant="outline"
          className="border-dashed border-2 w-full h-12 dark:border-gray-700 dark:text-gray-300"
          onClick={addColumn}
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir Semestre
        </Button>
      </div>
    </div>
  )

  const renderAutomationContent = () => (
    <div className="max-w-4xl mx-auto">
      <SemesterNavigation
        columns={columns}
        allTasks={getAllTasks()}
        onSelectSemester={(columnId) => {
          debugLog("Semestre seleccionado", { columnId })
        }}
        onTaskClick={handleTaskClick}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="board">Malla Personal</TabsTrigger>
              <TabsTrigger value="automation">Notas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="board" className="mt-4">
            {renderBoardContent()}
          </TabsContent>

          <TabsContent value="automation" className="mt-4">
            {renderAutomationContent()}
          </TabsContent>
        </Tabs>
      </header>

      {localSelectedTask && (
        <TaskDetailModal
          task={localSelectedTask}
          onClose={() => {
            setLocalSelectedTask(null)
            if (onTaskSelect) {
              onTaskSelect(null)
            }
          }}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onDuplicate={() => {}}
          columns={columns}
          userCourseData={getUserCourseData(localSelectedTask)}
          onMarkAsApproved={onMarkAsApproved}
          onMarkAsFailed={onMarkAsFailed}
          onMarkAsPending={onMarkAsPending}
          onMarkAsRav={onMarkAsRav}
          isLatestInstance={isLatestInstance}
          ravUsados={userProgress?.ravUsados}
          ravDisponibles={userProgress?.ravDisponibles}
        />
      )}
    </div>
  )
}
