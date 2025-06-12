"use client"
import { useEffect, useState } from "react"
import { useUserProgress } from "@/hooks/use-user-progress"
import { useCourseOperations } from "@/hooks/use-course-operations"
import EnhancedTaskCard from "./enhanced-task-card"
import TaskCard from "./task-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cursos } from "@/data/data_INF" // Ajustar según tu estructura
import type { Task } from "@/types/kanban"
import type { CourseStatus } from "@/types/user-progress"

export default function ExampleIntegration() {
  const [selectedCarrera] = useState('INF')
  
  // Usar el hook principal del sistema de progreso
  const {
    columns,
    sidebarTasks,
    userProgress,
    isLoading,
    error,
    refreshData,
    markCourseAsFailed,
    markCourseAsApproved,
    addCourseToSemester,
  } = useUserProgress(cursos, selectedCarrera)

  // Hook para operaciones específicas
  const {
    handleCourseStatusChange,
    addCourseToCurrentSemester,
  } = useCourseOperations()

  // Función para manejar cambios de estado
  const handleStatusChange = async (instanceId: string, newStatus: CourseStatus) => {
    try {
      let result
      if (newStatus === 'aprobado') {
        result = await markCourseAsApproved(instanceId)
      } else if (newStatus === 'reprobado') {
        result = await markCourseAsFailed(instanceId)
      }
      
      if (result?.success) {
        console.log('Estado cambiado exitosamente:', result.message)
        // refreshData se llama automáticamente en los hooks
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    }
  }

  // Función para añadir curso desde sidebar
  const handleAddCourse = async (task: Task) => {
    try {
      // Añadir al primer semestre disponible (puedes personalizar la lógica)
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
          <CardContent>
            <Button onClick={refreshData} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con información del progreso */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Progreso Académico - {selectedCarrera}</CardTitle>
          <CardDescription>
            Gestión local de progreso con funcionalidad de reprobaciones y VTR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Badge variant="outline">
              Semestres: {Object.keys(userProgress?.semestres || {}).length}
            </Badge>
            <Badge variant="outline">
              Cursos en progreso: {
                Object.values(userProgress?.semestres || {})
                  .reduce((total, semestre) => total + semestre.cursos.length, 0)
              }
            </Badge>
            <Badge variant="outline">
              Reprobaciones: {userProgress?.reprobaciones?.length || 0}
            </Badge>
          </div>
        </CardContent>
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
              {sidebarTasks.slice(0, 10).map((task) => (
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
                      <EnhancedTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => console.log('Abrir detalles:', task.nombre)}
                        onDuplicate={() => {}}
                        allTasks={column.tasks}
                        userCourseData={userCourseData}
                        onStatusChange={handleStatusChange}
                        showActions={true}
                      />
                    )
                  })}
                  
                  {column.tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No hay cursos en este semestre</p>
                      <p className="text-xs mt-1">
                        Arrastra cursos desde el sidebar
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de debug (opcional) */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Debug - Datos del Sistema</CardTitle>
          <CardDescription>
            Información técnica del estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Progreso del Usuario:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(userProgress, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Columnas del Kanban:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(
                  columns.map(col => ({
                    id: col.id,
                    title: col.title,
                    taskCount: col.tasks.length
                  })),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              Refrescar Datos
            </Button>
            <Button 
              onClick={() => {
                localStorage.removeItem('trayectoria-sansana-progress')
                refreshData()
              }} 
              variant="outline" 
              size="sm"
            >
              Limpiar Progreso
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
