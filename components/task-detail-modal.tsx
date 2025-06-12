"use client"

import { useState, useRef, useEffect } from "react"
import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Task, Column } from "@/types/kanban"
import type { CourseStatus, CourseOperationResult } from "@/types/user-progress"
import EmbeddedGradeCalculator from "./embedded-grade-calculator"
import type { GradeData } from "./grade-calculator"

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onDuplicate: (task: Task) => void
  columns: Column[]
  // Nuevas props para el sistema de progreso
  userCourseData?: {
    estado: CourseStatus
    instanceId: string
    vtr: number
  }
  onMarkAsApproved?: (instanceId: string) => Promise<CourseOperationResult>
  onMarkAsFailed?: (instanceId: string) => Promise<CourseOperationResult>
  onMarkAsPending?: (instanceId: string) => Promise<CourseOperationResult>
  onMarkAsRav?: (instanceId: string) => Promise<CourseOperationResult>
  isLatestInstance?: (instanceId: string) => boolean
  ravUsados?: number
  ravDisponibles?: number
}

export default function TaskDetailModal({
  task,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  columns,
  userCourseData,
  onMarkAsApproved,
  onMarkAsFailed,
  onMarkAsPending,
  onMarkAsRav,
  isLatestInstance,
  ravUsados,
  ravDisponibles,
}: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task })
  const [showGradeCalculator, setShowGradeCalculator] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
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

  // Función para manejar cambios de estado usando el sistema de progreso
  const handleStatusChange = async (newStatus: CourseStatus) => {
    if (!userCourseData?.instanceId) {
      console.warn('No se encontró instanceId para el curso')
      // Fallback al sistema anterior si no hay datos del usuario
      handleLegacyStatusChange(newStatus)
      return
    }

    setIsUpdatingStatus(true)
    
    try {
      let result: CourseOperationResult | undefined

      switch (newStatus) {
        case 'aprobado':
          if (onMarkAsApproved) {
            result = await onMarkAsApproved(userCourseData.instanceId)
          }
          break
        case 'reprobado':
          if (onMarkAsFailed) {
            result = await onMarkAsFailed(userCourseData.instanceId)
          }
          break
        case 'en-curso':
          if (onMarkAsPending) {
            result = await onMarkAsPending(userCourseData.instanceId)
          }
          break
      }

      if (result?.success) {
        console.log('Estado actualizado exitosamente:', result.message)
        // El hook useUserProgress se encarga de actualizar la UI automáticamente
      } else if (result) {
        console.error('Error al actualizar estado:', result.message)
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error('Error al cambiar estado del curso:', error)
      alert('Error al cambiar el estado del curso')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Función de fallback para el sistema anterior (sin progreso del usuario)
  const handleLegacyStatusChange = (newStatus: CourseStatus) => {
    let aprobadoValue: boolean | undefined

    switch (newStatus) {
      case 'aprobado':
        aprobadoValue = true
        break
      case 'reprobado':
        aprobadoValue = false
        break
      case 'en-curso':
        aprobadoValue = undefined
        break
    }

    const updatedTask = { ...editedTask, aprobado: aprobadoValue }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  // Función para determinar el estado actual basado en los datos del usuario
  const getCurrentStatus = (): CourseStatus => {
    if (userCourseData) {
      return userCourseData.estado
    }
    
    // Si existe el estado directamente en la tarea, usarlo
    if (editedTask.estado) {
      return editedTask.estado
    }
    
    // Fallback al sistema anterior solo para casos específicos
    if (editedTask.aprobado === true) return 'aprobado'
    
    // Por defecto, los cursos están en curso (no reprobados)
    return 'en-curso'
  }

  const currentStatus = getCurrentStatus()

  // Verificar si es la última instancia para habilitar/deshabilitar botones
  const isLatest = userCourseData?.instanceId && isLatestInstance 
    ? isLatestInstance(userCourseData.instanceId) 
    : true // Si no hay función o datos, permitir cambios (fallback)

  // Verificar si se puede usar RAV
  const canUseRav = (ravUsados || 0) < (ravDisponibles || 5)

  // Función para manejar el toggle de RAV
  const handleRavToggle = async () => {
    if (!userCourseData?.instanceId || !onMarkAsRav) {
      console.warn('No se encontró instanceId o función onMarkAsRav')
      return
    }

    setIsUpdatingStatus(true)
    
    try {
      const result = await onMarkAsRav(userCourseData.instanceId)
      
      if (result?.success) {
        console.log('RAV aplicado exitosamente:', result.message)
        // El hook useUserProgress se encarga de actualizar la UI automáticamente
      } else if (result) {
        console.error('Error al aplicar RAV:', result.message)
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error('Error al aplicar RAV:', error)
      alert('Error al aplicar RAV al curso')
    } finally {
      setIsUpdatingStatus(false)
    }
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

            {/* Información del VTR si existe */}
            {userCourseData && userCourseData.vtr > 1 && (
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg px-4 py-2">
                  <span className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                    VTR: {userCourseData.vtr} (Veces tomado el ramo)
                  </span>
                </div>
              </div>
            )}

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
            <div className="flex flex-col items-center mb-6">
              <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => handleStatusChange('aprobado')}
                  disabled={isUpdatingStatus || !isLatest}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ease-in-out disabled:opacity-50 ${
                    currentStatus === 'aprobado'
                      ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  } ${!isLatest ? 'cursor-not-allowed' : ''}`}
                >
                  {isUpdatingStatus && currentStatus === 'aprobado' ? 'Actualizando...' : 'Aprobado'}
                </button>
                <button
                  onClick={() => handleStatusChange('en-curso')}
                  disabled={isUpdatingStatus || !isLatest}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ease-in-out disabled:opacity-50 ${
                    currentStatus === 'en-curso'
                      ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  } ${!isLatest ? 'cursor-not-allowed' : ''}`}
                >
                  {isUpdatingStatus && currentStatus === 'en-curso' ? 'Actualizando...' : 'En Curso'}
                </button>
                <button
                  onClick={() => handleStatusChange('reprobado')}
                  disabled={isUpdatingStatus || !isLatest}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ease-in-out disabled:opacity-50 ${
                    currentStatus === 'reprobado'
                      ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  } ${!isLatest ? 'cursor-not-allowed' : ''}`}
                >
                  {isUpdatingStatus && currentStatus === 'reprobado' ? 'Actualizando...' : 'Reprobado'}
                </button>
              </div>
              
              {/* Mensaje informativo cuando no es la última instancia */}
              {!isLatest && userCourseData && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg px-3 py-2">
                    ⚠️ Solo se puede cambiar el estado de la última instancia del curso
                  </p>
                </div>
              )}
            </div>

            {/* Botón RAV independiente */}
            {userCourseData && (
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Rebaja Académica Voluntaria (RAV)
                  </span>
                  <button
                    onClick={() => handleRavToggle()}
                    disabled={isUpdatingStatus || !isLatest || !canUseRav}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentStatus === 'rav' 
                        ? 'bg-gray-400' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    } ${!canUseRav ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentStatus === 'rav' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                {/* Contador de RAV */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  RAV usados: {ravUsados || 0}/{ravDisponibles || 5}
                </div>
              </div>
            )}

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

                  {/* Información adicional del sistema de progreso */}
                  {userCourseData && (
                    <div className="flex items-center gap-2 justify-center pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        Estado del sistema: <span className="font-medium text-gray-700 dark:text-gray-200">{userCourseData.estado}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        ID: <span className="font-mono text-gray-700 dark:text-gray-200">{userCourseData.instanceId}</span>
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        </div>
      </div>
    </div>
  )
}
