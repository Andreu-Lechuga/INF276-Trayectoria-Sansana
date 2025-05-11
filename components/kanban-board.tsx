"use client"

import { useState, useEffect, useRef } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import Column from "./column"
import TaskDetailSidebar from "./task-detail-sidebar"
import AutomationRules from "./automation-rules"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Task, Column as ColumnType, Rule } from "@/types/kanban"
import { generateId } from "@/lib/utils"
// Import courses data
// import coursesData from "@/data/courses.json" // Removed coursesData import
import { ThemeToggle } from "@/components/theme-toggle"

// Importar los datos de carreras
import carrerasData from "@/data/carreras.json"

interface KanbanBoardProps {
  initialTasks?: Task[]
  onTaskSelect?: (task: Task | null) => void
  selectedTask?: Task | null
  onTasksChange?: (tasks: Task[]) => void
}

export default function KanbanBoard({
  initialTasks = [],
  onTaskSelect,
  selectedTask: externalSelectedTask,
  onTasksChange,
}: KanbanBoardProps) {
  const { toast } = useToast()
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])
  const [activeTab, setActiveTab] = useState("board")

  // Use a ref to track initialization
  const isInitialized = useRef(false)

  // Use external selected task if provided
  useEffect(() => {
    if (externalSelectedTask) {
      setSelectedTask(externalSelectedTask)
    }
  }, [externalSelectedTask])

  // Actualizar la función de inicialización para cargar los datos de los cursos
  useEffect(() => {
    if (isInitialized.current || initialTasks.length > 0) return

    // Si ya tenemos tareas iniciales, usarlas
    if (initialTasks.length > 0) {
      const tasksByStatus: { [key: string]: Task[] } = {}

      initialTasks.forEach((task) => {
        if (!tasksByStatus[task.status]) {
          tasksByStatus[task.status] = []
        }
        tasksByStatus[task.status].push(task)
      })

      const initialColumns: ColumnType[] = [
        {
          id: "column-1",
          title: "To Do",
          tasks: tasksByStatus["To Do"] || [],
          color: "bg-blue-50 dark:bg-blue-900/30",
        },
        {
          id: "column-2",
          title: "In Progress",
          tasks: tasksByStatus["In Progress"] || [],
          color: "bg-yellow-50 dark:bg-yellow-900/30",
        },
        {
          id: "column-3",
          title: "Blocked",
          tasks: tasksByStatus["Blocked"] || [],
          color: "bg-red-50 dark:bg-red-900/30",
        },
        {
          id: "column-4",
          title: "Completed",
          tasks: tasksByStatus["Completed"] || [],
          color: "bg-green-50 dark:bg-green-900/30",
        },
      ]

      setColumns(initialColumns)
    } else {
      // Cargar los datos de la primera carrera por defecto
      const defaultCarrera = carrerasData.carreras[0]

      // Usar fetch en lugar de import dinámico
      fetch(`/data/data_${defaultCarrera.link}.json`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          const cursos = data.cursos

          // Convertir los cursos a tareas
          const tasks: Task[] = cursos.map((curso: any) => ({
            id: `curso-${curso.codigo}`,
            title: curso.nombre,
            nombre: curso.nombre,
            codigo: curso.codigo,
            creditos: curso.creditos,
            horas: curso.horas,
            departamento: curso.departamento,
            prerrequisitos: curso.prerrequisitos || [],
            periodo: curso.periodo || "",
            semestre: curso.semestre,
            description: "",
            status: "To Do", // Estado por defecto
            dueDate: null,
            subtasks: [],
            customFields: [],
            createdAt: new Date().toISOString(),
          }))

          // Distribuir los cursos en las columnas según el semestre
          const tasksByStatus: { [key: string]: Task[] } = {
            "To Do": [],
            "In Progress": [],
            Blocked: [],
            Completed: [],
          }

          tasks.forEach((task) => {
            if (task.semestre <= 2) {
              tasksByStatus["To Do"].push(task)
            } else if (task.semestre <= 6) {
              tasksByStatus["In Progress"].push(task)
            } else if (task.semestre <= 9) {
              tasksByStatus["Blocked"].push(task)
            } else {
              tasksByStatus["Completed"].push(task)
            }
          })

          const initialColumns: ColumnType[] = [
            {
              id: "column-1",
              title: "To Do",
              tasks: tasksByStatus["To Do"] || [],
              color: "bg-blue-50 dark:bg-blue-900/30",
            },
            {
              id: "column-2",
              title: "In Progress",
              tasks: tasksByStatus["In Progress"] || [],
              color: "bg-yellow-50 dark:bg-yellow-900/30",
            },
            {
              id: "column-3",
              title: "Blocked",
              tasks: tasksByStatus["Blocked"] || [],
              color: "bg-red-50 dark:bg-red-900/30",
            },
            {
              id: "column-4",
              title: "Completed",
              tasks: tasksByStatus["Completed"] || [],
              color: "bg-green-50 dark:bg-green-900/30",
            },
          ]

          setColumns(initialColumns)

          // Notificar al componente padre sobre los cambios en las tareas
          if (onTasksChange) {
            onTasksChange(tasks)
          }
        })
        .catch((error) => {
          console.error("Error loading course data:", error)
        })

      // Add sample automation rules
      setRules([
        {
          id: `rule-${generateId()}`,
          name: "Move overdue tasks to Blocked",
          condition: {
            type: "due-date",
            operator: "is-overdue",
          },
          action: {
            type: "move-to-column",
            targetColumnId: "column-3", // Blocked column
          },
          enabled: true,
        },
        {
          id: `rule-${generateId()}`,
          name: "Move completed tasks when all subtasks done",
          condition: {
            type: "subtasks-completed",
            operator: "all-completed",
          },
          action: {
            type: "move-to-column",
            targetColumnId: "column-4", // Completed column
          },
          enabled: true,
        },
      ])
    }

    isInitialized.current = true
  }, [initialTasks, onTasksChange])

  // Notify parent of task changes when columns change
  useEffect(() => {
    if (!isInitialized.current || !onTasksChange) return

    const allTasks = columns.flatMap((column) => column.tasks.map((task) => ({ ...task })))

    onTasksChange(allTasks)
  }, [columns, onTasksChange])

  // Process automation rules
  useEffect(() => {
    if (rules.length === 0 || !isInitialized.current) return

    // Only process enabled rules
    const enabledRules = rules.filter((rule) => rule.enabled)
    if (enabledRules.length === 0) return

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
    }
  }, [columns, rules, selectedTask, toast, onTaskSelect])

  const handleDragEnd = (result: DropResult) => {
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

    toast({
      title: "Task moved",
      description: `"${task.title}" moved to ${destColumn.title}`,
    })
  }

  const addTask = (columnId: string, task: Task) => {
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

    toast({
      title: "Task created",
      description: `"${task.title}" added to ${columns.find((col) => col.id === columnId)?.title}`,
    })
  }

  const updateTask = (updatedTask: Task) => {
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

    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated`,
    })
  }

  const deleteTask = (taskId: string) => {
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
  }

  const duplicateTask = (task: Task, columnId?: string) => {
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
  }

  const addColumn = () => {
    if (!newColumnTitle.trim()) {
      toast({
        title: "Error",
        description: "Column title cannot be empty",
        variant: "destructive",
      })
      return
    }

    const newColumn: ColumnType = {
      id: `column-${generateId()}`,
      title: newColumnTitle,
      tasks: [],
    }

    setColumns([...columns, newColumn])
    setNewColumnTitle("")
    setIsAddingColumn(false)
    toast({
      title: "Column added",
      description: `"${newColumnTitle}" column has been added`,
    })
  }

  const updateColumn = (columnId: string, updates: Partial<ColumnType>) => {
    const newColumns = columns.map((column) => (column.id === columnId ? { ...column, ...updates } : column))
    setColumns(newColumns)
  }

  const deleteColumn = (columnId: string) => {
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
  }

  const addRule = (rule: Rule) => {
    setRules([...rules, rule])
    toast({
      title: "Rule created",
      description: `"${rule.name}" has been added`,
    })
  }

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    const newRules = rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    setRules(newRules)
  }

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter((rule) => rule.id !== ruleId))
    toast({
      title: "Rule deleted",
      description: "The automation rule has been deleted",
    })
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
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={addTask}
            onTaskClick={handleTaskClick}
            onDeleteColumn={() => deleteColumn(column.id)}
            onUpdateColumn={updateColumn}
            onDuplicateTask={duplicateTask}
          />
        ))}

        <div className="shrink-0 w-72">
          {isAddingColumn ? (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border dark:border-gray-700">
              <Label htmlFor="column-title" className="dark:text-gray-200">
                Column Title
              </Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
                className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addColumn}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingColumn(false)}
                  className="dark:border-gray-600 dark:text-gray-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-dashed border-2 w-full h-12 dark:border-gray-700 dark:text-gray-300"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
          )}
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

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Kanban Board</h1>
          <ThemeToggle />
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
    </div>
  )
}
