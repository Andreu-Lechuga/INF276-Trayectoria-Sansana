"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { Plus, AlertCircle } from "lucide-react"
import Column from "./column"
import TaskDetailSidebar from "./task-detail-sidebar"
import AutomationRules from "./automation-rules"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Task, Column as ColumnType, Rule } from "@/types/kanban"
import { generateId } from "@/lib/utils"
import YearGroup from "./year-group"
import DebugBoard from "./debug-board"

interface KanbanBoardProps {
  initialTasks?: Task[]
  onTaskSelect?: (task: Task | null) => void
  selectedTask?: Task | null
  onTasksChange?: (tasks: Task[]) => void
  toggleSidebar?: () => void // Nueva prop para activar el sidebar
}

export default function KanbanBoard({
  initialTasks = [],
  onTaskSelect,
  selectedTask: externalSelectedTask,
  onTasksChange,
  toggleSidebar,
}: KanbanBoardProps) {
  const { toast } = useToast()
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])
  const [activeTab, setActiveTab] = useState("board")
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState(true)

  // Usar refs para evitar bucles infinitos
  const isInitialized = useRef(false)
  const processedInitialRules = useRef(false)
  const processedInitialTasks = useRef(false)

  // Use external selected task if provided
  useEffect(() => {
    if (externalSelectedTask) {
      setSelectedTask(externalSelectedTask)
    }
  }, [externalSelectedTask])

  // Inicializar solo las columnas vacías, sin tareas iniciales
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        // Crear solo la columna del primer semestre
        const initialColumns: ColumnType[] = [
          {
            id: "column-1",
            title: "I",
            tasks: [],
            color: "bg-blue-50 dark:bg-blue-900/30",
          },
        ]

        setColumns(initialColumns)

        // Add sample automation rules
        setRules([
          {
            id: `rule-${generateId()}`,
            name: "Move overdue tasks to 2025-2",
            condition: {
              type: "due-date",
              operator: "is-overdue",
            },
            action: {
              type: "move-to-column",
              targetColumnId: "column-2", // 2025-2 column
            },
            enabled: true,
          },
          {
            id: `rule-${generateId()}`,
            name: "Move completed tasks to 2025-2",
            condition: {
              type: "subtasks-completed",
              operator: "all-completed",
            },
            action: {
              type: "move-to-column",
              targetColumnId: "column-2", // 2025-2 column
            },
            enabled: true,
          },
        ])

        isInitialized.current = true
        setError(null)
      } catch (err) {
        console.error("Error initializing kanban board:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al inicializar el tablero")

        // Crear columnas vacías en caso de error
        const initialColumns: ColumnType[] = [
          {
            id: "column-1",
            title: "I",
            tasks: [],
            color: "bg-blue-50 dark:bg-blue-900/30",
          },
        ]

        setColumns(initialColumns)
        isInitialized.current = true
      }
    }
  }, [])

  // Memoizar la función getAllTasks para evitar recrearla en cada renderizado
  const getAllTasks = useCallback(() => {
    return columns.flatMap((column) => column.tasks.map((task) => ({ ...task })))
  }, [columns])

  // Memoizar la función para procesar reglas
  const processRules = useCallback(() => {
    try {
      // Only process enabled rules
      const enabledRules = rules.filter((rule) => rule.enabled)
      if (enabledRules.length === 0) return false

      const tasksToMove: { taskId: string; sourceColumnId: string; targetColumnId: string }[] = []

      // Check each task against each rule
      columns.forEach((column) => {
        column.tasks.forEach((task) => {
          enabledRules.forEach((rule) => {
            const { condition, action } = rule
            let conditionMet = false

            // Check if condition is met
            if (condition.type === "due-date" && condition.operator === "is-overdue") {
              conditionMet = Boolean(task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed")
            } else if (condition.type === "subtasks-completed" && condition.operator === "all-completed") {
              conditionMet = task.subtasks.length > 0 && task.subtasks.every((subtask) => subtask.completed)
            } else if (condition.type === "custom-field" && condition.field) {
              const field = task.customFields.find((f) => f.name === condition.field)
              if (field) {
                if (condition.operator === "equals") {
                  conditionMet = field.value === condition.value
                } else if (condition.operator === "not-equals") {
                  conditionMet = field.value !== condition.value
                } else if (condition.operator === "contains") {
                  conditionMet = field.value.includes(condition.value || "")
                }
              }
            }

            // If condition is met and task is not already in the target column
            if (conditionMet && action.type === "move-to-column") {
              const targetColumn = columns.find((col) => col.id === action.targetColumnId)
              if (targetColumn && task.status !== targetColumn.title) {
                tasksToMove.push({
                  taskId: task.id,
                  sourceColumnId: column.id,
                  targetColumnId: action.targetColumnId,
                })
              }
            }
          })
        })
      })

      // Apply the moves
      if (tasksToMove.length > 0) {
        const newColumns = [...columns]

        tasksToMove.forEach(({ taskId, sourceColumnId, targetColumnId }) => {
          const sourceColIndex = newColumns.findIndex((col) => col.id === sourceColumnId)
          const targetColIndex = newColumns.findIndex((col) => col.id === targetColumnId)

          if (sourceColIndex !== -1 && targetColIndex !== -1) {
            const sourceCol = newColumns[sourceColIndex]
            const taskIndex = sourceCol.tasks.findIndex((t) => t.id === taskId)

            if (taskIndex !== -1) {
              const task = { ...sourceCol.tasks[taskIndex], status: newColumns[targetColIndex].title }

              // Remove from source
              newColumns[sourceColIndex] = {
                ...sourceCol,
                tasks: sourceCol.tasks.filter((t) => t.id !== taskId),
              }

              // Add to target
              newColumns[targetColIndex] = {
                ...newColumns[targetColIndex],
                tasks: [...newColumns[targetColIndex].tasks, task],
              }

              // Update selected task if it's being moved
              if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(task)
                if (onTaskSelect) {
                  onTaskSelect(task)
                }
              }

              toast({
                title: "Task moved automatically",
                description: `"${task.title}" moved to ${newColumns[targetColIndex].title} by rule: ${rules.find((r) => r.action.targetColumnId === targetColumnId)?.name}`,
              })
            }
          }
        })

        setColumns(newColumns)
        return true
      }

      return false
    } catch (err) {
      console.error("Error processing automation rules:", err)
      return false
    }
  }, [columns, rules, selectedTask, toast, onTaskSelect])

  // Notify parent of task changes when columns change
  useEffect(() => {
    // No notificar durante la inicialización o si no hay función de callback
    if (!isInitialized.current || !onTasksChange) return

    // No notificar si las columnas están vacías (durante la inicialización)
    const allCurrentTasks = getAllTasks()
    if (allCurrentTasks.length === 0 && initialTasks && initialTasks.length > 0) return

    try {
      onTasksChange(allCurrentTasks)
    } catch (err) {
      console.error("Error notifying task changes:", err)
    }
  }, [columns, onTasksChange, getAllTasks, initialTasks])

  // Process automation rules
  useEffect(() => {
    if (rules.length === 0 || !isInitialized.current) return

    // Solo procesar las reglas una vez durante la inicialización
    if (!processedInitialRules.current) {
      processRules()
      processedInitialRules.current = true
    }
  }, [rules, processRules])

  // Efecto para manejar las tareas iniciales que vienen de AppContainer
  useEffect(() => {
    if (isInitialized.current && initialTasks && initialTasks.length > 0) {
      // Solo procesar las tareas iniciales una vez
      if (!processedInitialTasks.current) {
        try {
          // Filtrar las tareas del primer semestre
          const primerSemestreTasks = initialTasks.filter((task) => task.semestre === 1)

          if (primerSemestreTasks.length > 0 && columns.length > 0) {
            // Asignar las tareas del primer semestre a la primera columna
            const newColumns = [...columns]
            const firstColumnIndex = 0 // La primera columna siempre es la del primer semestre

            newColumns[firstColumnIndex] = {
              ...newColumns[firstColumnIndex],
              tasks: [...primerSemestreTasks],
            }

            setColumns(newColumns)
            console.log("Cursos del primer semestre cargados:", primerSemestreTasks.length)
          } else {
            console.log("No hay cursos del primer semestre o no hay columnas inicializadas")
          }

          processedInitialTasks.current = true
        } catch (err) {
          console.error("Error al procesar tareas iniciales:", err)
        }
      }
    }
  }, [initialTasks, columns])

  const handleDragEnd = (result: DropResult) => {
    try {
      const { destination, source, draggableId } = result

      // If there's no destination or the item is dropped in the same place
      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return
      }

      // Find the source and destination columns
      const sourceColumn = columns.find((col) => col.id === source.droppableId)
      const destColumn = columns.find((col) => col.id === destination.droppableId)

      if (!sourceColumn || !destColumn) return

      // Create new arrays for the columns
      const newColumns = [...columns]
      const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId)
      const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId)

      // Find the task being moved
      const task = sourceColumn.tasks.find((t) => t.id === draggableId)
      if (!task) return

      // Remove the task from the source column
      newColumns[sourceColIndex] = {
        ...sourceColumn,
        tasks: sourceColumn.tasks.filter((t) => t.id !== draggableId),
      }

      // Add the task to the destination column with updated status
      const updatedTask = { ...task, status: destColumn.title }
      newColumns[destColIndex] = {
        ...destColumn,
        tasks: [
          ...destColumn.tasks.slice(0, destination.index),
          updatedTask,
          ...destColumn.tasks.slice(destination.index),
        ],
      }

      setColumns(newColumns)

      // Update selected task if it's the one being moved
      if (selectedTask && selectedTask.id === draggableId) {
        setSelectedTask(updatedTask)
        if (onTaskSelect) {
          onTaskSelect(updatedTask)
        }
      }

      // Procesar reglas después de mover una tarea
      setTimeout(() => processRules(), 0)

      toast({
        title: "Task moved",
        description: `"${task.title}" moved to ${destColumn.title}`,
      })
    } catch (err) {
      console.error("Error handling drag end:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al mover la tarea",
        variant: "destructive",
      })
    }
  }

  const addTask = (columnId: string, task: Task) => {
    try {
      const newColumns = columns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [...column.tasks, task],
          }
        }
        return column
      })
      setColumns(newColumns)

      // Procesar reglas después de añadir una tarea
      setTimeout(() => processRules(), 0)

      toast({
        title: "Task created",
        description: `"${task.title}" added to ${columns.find((col) => col.id === columnId)?.title}`,
      })
    } catch (err) {
      console.error("Error adding task:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al añadir la tarea",
        variant: "destructive",
      })
    }
  }

  const updateTask = (updatedTask: Task) => {
    try {
      const newColumns = columns.map((column) => {
        return {
          ...column,
          tasks: column.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        }
      })
      setColumns(newColumns)
      setSelectedTask(updatedTask)
      if (onTaskSelect) {
        onTaskSelect(updatedTask)
      }

      // Procesar reglas después de actualizar una tarea
      setTimeout(() => processRules(), 0)

      toast({
        title: "Task updated",
        description: `"${updatedTask.title}" has been updated`,
      })
    } catch (err) {
      console.error("Error updating task:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la tarea",
        variant: "destructive",
      })
    }
  }

  const deleteTask = (taskId: string) => {
    try {
      const newColumns = columns.map((column) => {
        return {
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        }
      })
      setColumns(newColumns)
      setSelectedTask(null)
      if (onTaskSelect) {
        onTaskSelect(null)
      }

      toast({
        title: "Task deleted",
        description: "The task has been deleted",
      })
    } catch (err) {
      console.error("Error deleting task:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la tarea",
        variant: "destructive",
      })
    }
  }

  const duplicateTask = (task: Task, columnId?: string) => {
    try {
      // Create a deep copy of the task with a new ID
      const duplicatedTask: Task = {
        ...JSON.parse(JSON.stringify(task)),
        id: `task-${generateId()}`,
        title: `${task.title} (Copy)`,
        nombre: `${task.nombre} (Copy)`,
        createdAt: new Date().toISOString(),
      }

      // If columnId is provided, add to that column, otherwise add to the same column as the original
      const targetColumnId = columnId || columns.find((col) => col.tasks.some((t) => t.id === task.id))?.id

      if (targetColumnId) {
        addTask(targetColumnId, duplicatedTask)
        toast({
          title: "Task duplicated",
          description: `"${duplicatedTask.title}" created`,
        })
      }
    } catch (err) {
      console.error("Error duplicating task:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al duplicar la tarea",
        variant: "destructive",
      })
    }
  }

  const addColumn = () => {
    try {
      // Determinar el número romano para la nueva columna
      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
      const nextIndex = columns.length
      const nextRomanNumeral = romanNumerals[nextIndex] || `${nextIndex + 1}`

      const newColumn: ColumnType = {
        id: `column-${generateId()}`,
        title: nextRomanNumeral,
        tasks: [],
      }

      setColumns([...columns, newColumn])
      toast({
        title: "Semestre añadido",
        description: `Semestre ${nextRomanNumeral} ha sido añadido`,
      })
    } catch (err) {
      console.error("Error adding column:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al añadir el semestre",
        variant: "destructive",
      })
    }
  }

  const updateColumn = (columnId: string, updates: Partial<ColumnType>) => {
    try {
      const newColumns = columns.map((column) => (column.id === columnId ? { ...column, ...updates } : column))
      setColumns(newColumns)
    } catch (err) {
      console.error("Error updating column:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la columna",
        variant: "destructive",
      })
    }
  }

  const deleteColumn = (columnId: string) => {
    try {
      // Check if column has tasks
      const column = columns.find((col) => col.id === columnId)
      if (column && column.tasks.length > 0) {
        toast({
          title: "Cannot delete column",
          description: "Please move or delete all tasks in this column first",
          variant: "destructive",
        })
        return
      }

      setColumns(columns.filter((col) => col.id !== columnId))
      toast({
        title: "Column deleted",
        description: `"${column?.title}" column has been deleted`,
      })
    } catch (err) {
      console.error("Error deleting column:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la columna",
        variant: "destructive",
      })
    }
  }

  const addRule = (rule: Rule) => {
    try {
      setRules([...rules, rule])
      toast({
        title: "Rule created",
        description: `"${rule.name}" has been added`,
      })
    } catch (err) {
      console.error("Error adding rule:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al añadir la regla",
        variant: "destructive",
      })
    }
  }

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    try {
      const newRules = rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
      setRules(newRules)
    } catch (err) {
      console.error("Error updating rule:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la regla",
        variant: "destructive",
      })
    }
  }

  const deleteRule = (ruleId: string) => {
    try {
      setRules(rules.filter((rule) => rule.id !== ruleId))
      toast({
        title: "Rule deleted",
        description: "The automation rule has been deleted",
      })
    } catch (err) {
      console.error("Error deleting rule:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar la regla",
        variant: "destructive",
      })
    }
  }

  // Handle task selection
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    if (onTaskSelect) {
      onTaskSelect(task)
    }
  }

  // Board content for the "board" tab
  const renderBoardContent = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {/* Agrupar columnas por año */}
        {(() => {
          // Organizar columnas por años (2 columnas por año)
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
                  onDuplicateTask={duplicateTask}
                  toggleSidebar={toggleSidebar || (() => {})}
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
    </DragDropContext>
  )

  // Automation content for the "automation" tab
  const renderAutomationContent = () => (
    <div className="max-w-4xl mx-auto">
      <AutomationRules
        rules={rules}
        columns={columns}
        onAddRule={addRule}
        onUpdateRule={updateRule}
        onDeleteRule={deleteRule}
      />
    </div>
  )

  // Render error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-gray-950 p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error en el tablero Kanban</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Kanban Board</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            {renderBoardContent()}
          </TabsContent>

          <TabsContent value="automation" className="mt-4">
            {renderAutomationContent()}
          </TabsContent>
        </Tabs>
      </header>

      {selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null)
            if (onTaskSelect) {
              onTaskSelect(null)
            }
          }}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onDuplicate={duplicateTask}
          columns={columns}
        />
      )}

      {debug && <DebugBoard initialTasks={initialTasks} columns={columns} />}
    </div>
  )
}
