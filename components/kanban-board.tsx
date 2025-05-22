"use client"

import { useState, useEffect, useRef } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { Plus, AlertCircle } from "lucide-react"
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
  initialTasks?: Task[]
  onTaskSelect?: (task: Task | null) => void
  selectedTask?: Task | null
  onTasksChange?: (tasks: Task[]) => void
  toggleSidebar?: () => void
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
  const [rules, setRules] = useState<Rule[]>([])
  const [activeTab, setActiveTab] = useState("board")
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState(true)

  // Referencias para evitar bucles
  const isInitialized = useRef(false)
  const lastTasksStringRef = useRef("")

  // Inicialización simple - solo una vez
  useEffect(() => {
    if (!isInitialized.current) {
      const initialColumns: ColumnType[] = [
        {
          id: "column-1",
          title: "I",
          tasks: [],
        },
        {
          id: "column-2",
          title: "II",
          tasks: [],
        },
      ]

      setColumns(initialColumns)
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
            targetColumnId: "column-2",
          },
          enabled: true,
        },
      ])

      isInitialized.current = true
    }
  }, [])

  // Manejar tareas iniciales - simplificado
  useEffect(() => {
    if (!isInitialized.current || !initialTasks) return

    const tasksString = JSON.stringify(initialTasks)

    // Solo procesar si las tareas han cambiado realmente
    if (tasksString !== lastTasksStringRef.current && initialTasks.length > 0) {
      lastTasksStringRef.current = tasksString

      const primerSemestreTasks = initialTasks.filter((task) => task.semestre === 1)

      if (primerSemestreTasks.length > 0) {
        setColumns((prevColumns) => {
          const newColumns = [...prevColumns]

          // Limpiar todas las columnas
          newColumns.forEach((col, index) => {
            newColumns[index] = { ...col, tasks: [] }
          })

          // Asignar tareas del primer semestre a la primera columna
          if (newColumns.length > 0) {
            newColumns[0] = {
              ...newColumns[0],
              tasks: [...primerSemestreTasks],
            }
          }

          return newColumns
        })
      }
    }
  }, [initialTasks])

  // Usar tarea externa seleccionada
  useEffect(() => {
    if (externalSelectedTask) {
      setSelectedTask(externalSelectedTask)
    }
  }, [externalSelectedTask])

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    setColumns((prevColumns) => {
      const sourceColumn = prevColumns.find((col) => col.id === source.droppableId)
      const destColumn = prevColumns.find((col) => col.id === destination.droppableId)

      if (!sourceColumn || !destColumn) return prevColumns

      const newColumns = [...prevColumns]
      const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId)
      const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId)

      const task = sourceColumn.tasks.find((t) => t.id === draggableId)
      if (!task) return prevColumns

      // Remover de la columna origen
      newColumns[sourceColIndex] = {
        ...sourceColumn,
        tasks: sourceColumn.tasks.filter((t) => t.id !== draggableId),
      }

      // Añadir a la columna destino
      const updatedTask = { ...task, status: destColumn.title }
      newColumns[destColIndex] = {
        ...destColumn,
        tasks: [
          ...destColumn.tasks.slice(0, destination.index),
          updatedTask,
          ...destColumn.tasks.slice(destination.index),
        ],
      }

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

      return newColumns
    })
  }

  const addTask = (columnId: string, task: Task) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [...column.tasks, task],
          }
        }
        return column
      }),
    )

    toast({
      title: "Task created",
      description: `"${task.title}" added`,
    })
  }

  const updateTask = (updatedTask: Task) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      })),
    )

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
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      })),
    )

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
    const duplicatedTask: Task = {
      ...JSON.parse(JSON.stringify(task)),
      id: `task-${generateId()}`,
      title: `${task.title} (Copy)`,
      nombre: `${task.nombre} (Copy)`,
      createdAt: new Date().toISOString(),
    }

    const targetColumnId = columnId || columns.find((col) => col.tasks.some((t) => t.id === task.id))?.id

    if (targetColumnId) {
      addTask(targetColumnId, duplicatedTask)
    }
  }

  const addColumn = () => {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
    const nextIndex = columns.length
    const nextRomanNumeral = romanNumerals[nextIndex] || `${nextIndex + 1}`

    const newColumn: ColumnType = {
      id: `column-${generateId()}`,
      title: nextRomanNumeral,
      tasks: [],
    }

    setColumns((prevColumns) => [...prevColumns, newColumn])
    toast({
      title: "Semestre añadido",
      description: `Semestre ${nextRomanNumeral} ha sido añadido`,
    })
  }

  const updateColumn = (columnId: string, updates: Partial<ColumnType>) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => (column.id === columnId ? { ...column, ...updates } : column)),
    )
  }

  const deleteColumn = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (column && column.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "Please move or delete all tasks in this column first",
        variant: "destructive",
      })
      return
    }

    setColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId))
    toast({
      title: "Column deleted",
      description: `"${column?.title}" column has been deleted`,
    })
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    if (onTaskSelect) {
      onTaskSelect(task)
    }
  }

  const getAllTasks = () => {
    return columns.flatMap((column) => column.tasks)
  }

  // Board content
  const renderBoardContent = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
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

  // Automation content
  const renderAutomationContent = () => (
    <div className="max-w-4xl mx-auto">
      <SemesterNavigation
        columns={columns}
        allTasks={getAllTasks()}
        onSelectSemester={(columnId) => {
          console.log(`Semestre seleccionado: ${columnId}`)
        }}
      />
    </div>
  )

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

      {selectedTask && (
        <TaskDetailModal
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
