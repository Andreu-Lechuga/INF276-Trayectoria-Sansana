"use client"

import { useState } from "react"
import { useUserProgress } from "@/hooks/use-user-progress"
import TaskDetailModal from "./task-detail-modal"
import TaskCard from "./task-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cursos } from "@/data/data_INF"
import type { Task } from "@/types/kanban"
import type { CourseStatus } from "@/types/user-progress"

export default function IntegratedModalExample() {
  const [selectedCarrera] = useState('INF')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // Usar el hook principal del sistema de progreso
  const {
    columns,
    sidebarTasks,
    userProgress,
    isLoading,
    error,
    markCourseAsFailed,
    markCourseAsApproved,
    markCourseAsPending,
    addCourseToSemester,
  } = useUserProgress(cursos, selectedCarrera)

  // Función para obtener datos del usuario para una tarea específica
  const getUserCourseData = (task: Task) => {
    if (!userProgress) return undefined

    // Buscar en todos los semestres
    for (const semestreId in userProgress.semestres) {
      const semestre = userProgress.semestres[semestreId]
      const userCourse = semestre.cursos.find(
        curso => curso.cursoId === task.cursoId
      )
      
      if (userCourse) {
        return {
          estado: userCourse.estado,
          vtr: userCourse.vtr,
          instanceId: userCourse.instanceId,
        }
      }
    }
    
    return undefined
  }

  // Función para añadir curso desde sidebar
  const handleAddCourse = async (task: Task) => {
    try {
      // Añadir al primer semestre disponible
      const targetSemester = 1
      const cursoId = task.cursoId || 0
      const result = await addCourseToSemester(cursoId, targetSemester)
      
      if (result?.success) {
        console.log('Curso añadido exitosamente:', result.message)
      }
    } catch (error) {
      console.error('Error al añadir curso:', error)
    }
  }

  // Función para abrir el modal de detalles
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedTask(null)
  }

  // Función para actualizar tarea (fallback para compatibilidad)
  const handleUpdateTask = (updatedTask: Task) => {
    console.log('Tarea actualizada (modo legacy):', updatedTask)
    // En el sistema integrado, las actualizaciones se manejan automáticamente
  }

  // Función para eliminar tarea (fallback para compatibilidad)
  const handleDeleteTask = (taskId: string) => {
    console.log('Eliminar tarea:', taskId)
    // Implementar lógica de eliminación si es necesario
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo de Modal Integrado - {selectedCarrera}</CardTitle>
          <CardDescription>
            Demostración de cómo los botones del modal se conectan con el sistema de progreso
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar con cursos disponibles */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cursos Disponibles</CardTitle>
              <CardDescription>
                Click para añadir a tu malla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {sidebarTasks.slice(0, 5).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleAddCourse(task)}
                  onDuplicate={() => {}}
                  showHoverPlus={true}
                  allTasks={sidebarTasks}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Kanban con semestres */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {columns.map((column) => (
              <Card key={column.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{column.title}</CardTitle>
                  <CardDescription>
                    {column.tasks.length} curso{column.tasks.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {column.tasks.map((task) => {
                    const userCourseData = getUserCourseData(task)
                    
                    return (
                      <div
                        key={task.id}
                        className="cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                      >
                        <TaskCard
                          task={task}
                          onClick={() => handleTaskClick(task)}
                          onDuplicate={() => {}}
                          allTasks={column.tasks}
                          userCourseData={userCourseData}
                        />
                      </div>
                    )
                  })}
                  
                  {column.tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No hay cursos en este semestre</p>
                      <p className="text-xs mt-1">
                        Añade cursos desde el sidebar
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de detalles integrado */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onDuplicate={() => {}}
          columns={columns}
          // Props del sistema de progreso
          userCourseData={getUserCourseData(selectedTask)}
          onMarkAsApproved={markCourseAsApproved}
          onMarkAsFailed={markCourseAsFailed}
          onMarkAsPending={markCourseAsPending}
        />
      )}

      {/* Instrucciones */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> Añade cursos desde el sidebar haciendo click en ellos</p>
            <p><strong>2.</strong> Click en cualquier curso en los semestres para abrir el modal de detalles</p>
            <p><strong>3.</strong> Usa los botones "Aprobado", "En Curso", "Reprobado" en el modal</p>
            <p><strong>4.</strong> Los cambios se guardan automáticamente en localStorage</p>
            <p><strong>5.</strong> Los cursos reprobados crean automáticamente copias en el siguiente semestre</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
