"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import Column from "./column"
import TaskDetailModal from "./task-detail-modal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Task, Column as ColumnType, Rule } from "@/types/kanban"
import { generateId } from "@/lib/utils"
import YearGroup from "./year-group"
import DebugBoard from "./debug-board"
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
  allTasks?: Task[] // Añadir esta prop
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
  allTasks = [], // Añadir esta prop con valor por defecto
}: KanbanBoardProps) {
  const { toast } = useToast()
  const [localSelectedTask, setLocalSelectedTask] = useState<Task | null>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [activeTab, setActiveTab] = useState("board")
  const [debug, setDebug] = useState(true)

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

  // Inicializar reglas de automatización
  useEffect(() => {
    setRules([
      {
        id: `rule-${generateId()}`,
        name: "Move overdue tasks to II",
        condition: {
          type: "due-date",
          operator: "is-overdue",
        },
        action: {
          type: "move-to-column",
          targetColumnId: "column-2",
        },
        enabled: false, // Deshabilitado por defecto
      },
    ])
  }, [])

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
      id: generateColumnId(nextSemesterNumber), // Usar ID consistente
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
      if (column && column.tasks.length > 0) {
        toast({
          title: "No se puede eliminar la columna",
          description: "Por favor mueve o elimina todas las tareas de esta columna primero",
          variant: "destructive",
        })
        return
      }

      onColumnsChange(columns.filter((col) => col.id !== columnId))

      toast({
        title: "Columna eliminada",
        description: `La columna "${column?.title}" ha sido eliminada`,
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
                allTasks={allTasks} // Pasar allTasks
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Trayectoria Sansana</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="board">Malla Personal</TabsTrigger>
            <TabsTrigger value="automation">Notas</TabsTrigger>
          </TabsList>

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
        />
      )}

      {debug && <DebugBoard initialTasks={getAllTasks()} columns={columns} />}
    </div>
  )
}
