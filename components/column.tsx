"use client"

import { useState } from "react"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { MoreHorizontal, Trash2, Edit, Palette, ArrowLeft } from "lucide-react"
import TaskCard from "./task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Task, Column as ColumnType } from "@/types/kanban"
import { generateId } from "@/lib/utils"

const COLUMN_COLORS = [
  { name: "Default", value: "bg-white dark:bg-gray-800" },
  { name: "Blue", value: "bg-blue-50 dark:bg-blue-900/30" },
  { name: "Green", value: "bg-green-50 dark:bg-green-900/30" },
  { name: "Yellow", value: "bg-yellow-50 dark:bg-yellow-900/30" },
  { name: "Purple", value: "bg-purple-50 dark:bg-purple-900/30" },
  { name: "Pink", value: "bg-pink-50 dark:bg-pink-900/30" },
  { name: "Orange", value: "bg-orange-50 dark:bg-orange-900/30" },
  { name: "Cyan", value: "bg-cyan-50 dark:bg-cyan-900/30" },
]

interface ColumnProps {
  column: ColumnType
  onAddTask: (columnId: string, task: Task) => void
  onTaskClick: (task: Task) => void
  onDeleteColumn: () => void
  onUpdateColumn: (columnId: string, updates: Partial<ColumnType>) => void
  toggleSidebar: () => void
  onMoveTaskToSidebar?: (taskId: string) => void
}

export default function Column({
  column,
  onAddTask,
  onTaskClick,
  onDeleteColumn,
  onUpdateColumn,
  toggleSidebar,
  onMoveTaskToSidebar,
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task-${generateId()}`,
      title: newTaskTitle,
      nombre: newTaskTitle,
      codigo: "",
      creditos: 0,
      horas: 0,
      departamento: "",
      prerrequisitos: [],
      periodo: "",
      semestre: 0,
      description: newTaskDescription,
      status: column.title,
      dueDate: null,
      subtasks: [],
      customFields: [],
      createdAt: new Date().toISOString(),
    }

    onAddTask(column.id, newTask)
    setNewTaskTitle("")
    setNewTaskDescription("")
    setIsAddingTask(false)
  }

  const handleColorChange = (color: string) => {
    if (color === "bg-white dark:bg-gray-800") {
      onUpdateColumn(column.id, { color: undefined })
    } else {
      onUpdateColumn(column.id, { color })
    }
  }

  const handleMoveToSidebar = (taskId: string) => {
    if (onMoveTaskToSidebar) {
      onMoveTaskToSidebar(taskId)
    }
  }

  const headerColorClass = column.color || "bg-white dark:bg-gray-800"

  return (
    <div className="shrink-0 w-52 flex flex-col bg-gray-50 dark:bg-gray-900 rounded-md shadow-sm">
      <div className={`p-3 flex items-center border-b rounded-t-md ${headerColorClass}`}>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
          {column.tasks.length}
        </span>

        <h3 className="flex-1 font-semibold text-base text-gray-700 dark:text-gray-200 text-center mx-2">
          {column.title}
        </h3>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-auto">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2">
            <div className="space-y-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-left">
                    <Palette className="mr-2 h-4 w-4" />
                    Cambiar Color
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 dark:bg-gray-800 dark:border-gray-700">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm dark:text-gray-200">Column Color</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {COLUMN_COLORS.map((color) => (
                        <button
                          key={color.value}
                          className={`h-8 w-full rounded-md ${color.value} border dark:border-gray-700 hover:opacity-80 transition-opacity`}
                          onClick={() => handleColorChange(color.value)}
                          aria-label={`Set column color to ${color.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left text-red-600 dark:text-red-400"
                onClick={onDeleteColumn}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto min-h-[200px] ${
              snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-300 dark:ring-blue-600" : ""
            }`}
            data-is-droppable="true"
          >
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 ${snapshot.isDragging ? "dragging-item" : ""}`}
                    style={{
                      ...provided.draggableProps.style,
                    }}
                    data-is-dragging={snapshot.isDragging ? "true" : "false"}
                  >
                    <div className="relative group">
                      <TaskCard task={task} onClick={() => onTaskClick(task)} onDuplicate={() => {}} />
                      {/* Botón para devolver al sidebar */}
                      {onMoveTaskToSidebar && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveToSidebar(task.id)
                          }}
                          title="Devolver a cursos disponibles"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Indicador visual cuando está vacía */}
            {column.tasks.length === 0 && (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Arrastra cursos aquí</p>
              </div>
            )}

            {isAddingTask ? (
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border dark:border-gray-700">
                <Label htmlFor="task-title" className="dark:text-gray-200">
                  Título de la tarea
                </Label>
                <Input
                  id="task-title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ingresa el título de la tarea"
                  className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <Label htmlFor="task-description" className="dark:text-gray-200">
                  Descripción (opcional)
                </Label>
                <Textarea
                  id="task-description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Ingresa la descripción de la tarea"
                  className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddTask}>
                    Añadir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingTask(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full mt-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 justify-start"
                onClick={toggleSidebar}
              >
                <Edit className="mr-2 h-4 w-4" /> Editar Semestre
              </Button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
