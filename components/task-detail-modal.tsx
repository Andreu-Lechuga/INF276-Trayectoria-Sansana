"use client"

import { useState, useRef, useEffect } from "react"
import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Task, Column } from "@/types/kanban"
import EmbeddedGradeCalculator from "./embedded-grade-calculator"
import type { GradeData } from "./grade-calculator"

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onDuplicate: (task: Task) => void
  columns: Column[]
}

export default function TaskDetailModal({
  task,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  columns,
}: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task })
  const [showGradeCalculator, setShowGradeCalculator] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Cerrar el modal al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Cerrar el modal con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [onClose])

  const handleDeleteTask = () => {
    onDelete(task.id)
  }

  const handleGenerateTemplate = () => {
    setShowGradeCalculator(true)
  }

  const handleSaveGradeData = (gradeData: GradeData) => {
    // Actualizar la tarea con los datos de notas
    const updatedTask = {
      ...editedTask,
      gradeData: gradeData,
    }

    setEditedTask(updatedTask)
    onUpdate(updatedTask)

    // Mostrar mensaje de éxito o feedback
    alert("Datos de notas guardados correctamente")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-gray-200">Detalles del Curso</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <>
            {/* Título del curso */}
            <h3 className="text-xl font-medium text-center mb-6 dark:text-gray-200">
              {editedTask.nombre || editedTask.title}
            </h3>

            {/* Contenedor principal con botón de generar plantilla o calculadora embebida */}
            <div className="mb-8">
              {!showGradeCalculator ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Button size="lg" onClick={handleGenerateTemplate} className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generar Plantilla de Notas
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Crea una plantilla para registrar y calcular tus notas en este curso
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <EmbeddedGradeCalculator
                    task={task}
                    onSave={handleSaveGradeData}
                    initialData={editedTask.gradeData}
                  />
                </div>
              )}
            </div>

            {/* Toggle Aprobado/En Curso/Reprobado - SIEMPRE VISIBLE */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => {
                    const updatedTask = { ...editedTask, aprobado: true }
                    setEditedTask(updatedTask)
                    onUpdate(updatedTask)
                  }}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ease-in-out ${
                    editedTask.aprobado === true
                      ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  }`}
                >
                  Aprobado
                </button>
                <button
                  onClick={() => {
                    const updatedTask = { ...editedTask, aprobado: undefined }
                    setEditedTask(updatedTask)
                    onUpdate(updatedTask)
                  }}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ease-in-out ${
                    editedTask.aprobado === undefined
                      ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  }`}
                >
                  En&nbsp;Curso
                </button>
                <button
                  onClick={() => {
                    const updatedTask = { ...editedTask, aprobado: false }
                    setEditedTask(updatedTask)
                    onUpdate(updatedTask)
                  }}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ease-in-out ${
                    editedTask.aprobado === false
                      ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  }`}
                >
                  Reprobado
                </button>
              </div>
            </div>

            {/* Información resumida - SIEMPRE VISIBLE */}
            <Card className="mt-6">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2 text-sm">
                  {/* Primera línea: toda la información excepto prerrequisitos */}
                  <div className="flex flex-wrap gap-x-4 items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">
                      Código: <span className="font-medium text-gray-700 dark:text-gray-200">{editedTask.codigo}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Créditos:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">{editedTask.creditos}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Departamento:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">{editedTask.departamento}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Status: <span className="font-medium text-gray-700 dark:text-gray-200">{editedTask.status}</span>
                    </span>
                  </div>

                  {/* Segunda línea: prerrequisitos */}
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Prerrequisitos:</span>
                    <div className="flex flex-wrap gap-1">
                      {editedTask.prerrequisitos && editedTask.prerrequisitos.length > 0 ? (
                        editedTask.prerrequisitos.map((prereq, index) => (
                          <span key={index} className="bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded text-xs">
                            {prereq}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">No tiene prerrequisitos</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        </div>
      </div>
    </div>
  )
}
