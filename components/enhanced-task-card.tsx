"use client"
import { useState } from "react"
import TaskCard from "./task-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/types/kanban"
import type { CourseStatus } from "@/types/user-progress"

interface EnhancedTaskCardProps {
  task: Task
  onClick?: () => void
  onDuplicate?: () => void
  className?: string
  showHoverPlus?: boolean
  editingMode?: boolean
  onRemove?: () => void
  allTasks?: Task[]
  // Props específicas para el sistema de progreso
  userCourseData?: {
    estado: CourseStatus
    vtr: number
    instanceId: string
  }
  // Funciones para cambiar estado
  onStatusChange?: (instanceId: string, newStatus: CourseStatus) => void
  showActions?: boolean // Para mostrar botones de aprobar/reprobar
}

export default function EnhancedTaskCard({
  task,
  onClick = () => {},
  onDuplicate = () => {},
  className = "",
  showHoverPlus = false,
  editingMode = false,
  onRemove,
  allTasks = [],
  userCourseData,
  onStatusChange,
  showActions = false,
}: EnhancedTaskCardProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const handleStatusChange = async (newStatus: CourseStatus) => {
    if (!userCourseData?.instanceId || !onStatusChange) return
    
    setIsChangingStatus(true)
    try {
      await onStatusChange(userCourseData.instanceId, newStatus)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleCardClick = () => {
    if (showActions && !editingMode) {
      // Si estamos en modo de acciones, no ejecutar el click normal
      return
    }
    onClick()
  }

  return (
    <div className="relative">
      {/* TaskCard base con datos del usuario */}
      <TaskCard
        task={task}
        onClick={handleCardClick}
        onDuplicate={onDuplicate}
        className={className}
        showHoverPlus={showHoverPlus}
        editingMode={editingMode}
        onRemove={onRemove}
        allTasks={allTasks}
        userCourseData={userCourseData}
      />

      {/* Badges de estado y información adicional */}
      {userCourseData && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-30">
          {/* Badge de estado */}
          <Badge 
            variant={
              userCourseData.estado === 'aprobado' ? 'default' :
              userCourseData.estado === 'reprobado' ? 'destructive' :
              'secondary'
            }
            className="text-xs"
          >
            {userCourseData.estado === 'aprobado' ? 'Aprobado' :
             userCourseData.estado === 'reprobado' ? 'Reprobado' :
             'Pendiente'}
          </Badge>

          {/* Badge de VTR si es > 1 */}
          {userCourseData.vtr > 1 && (
            <Badge variant="outline" className="text-xs">
              VTR {userCourseData.vtr}
            </Badge>
          )}
        </div>
      )}

      {/* Botones de acción para cambiar estado */}
      {showActions && userCourseData && !editingMode && (
        <div className="absolute bottom-2 right-2 flex gap-1 z-30">
          {userCourseData.estado !== 'aprobado' && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange('aprobado')
              }}
              disabled={isChangingStatus}
            >
              ✓ Aprobar
            </Button>
          )}
          
          {userCourseData.estado !== 'reprobado' && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs bg-red-50 hover:bg-red-100 border-red-200"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange('reprobado')
              }}
              disabled={isChangingStatus}
            >
              ✗ Reprobar
            </Button>
          )}
        </div>
      )}

      {/* Indicador de carga */}
      {isChangingStatus && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-md flex items-center justify-center z-40">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
