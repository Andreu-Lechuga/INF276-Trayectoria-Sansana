"use client"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Check, X, Ban } from "lucide-react"
import { useTheme } from "next-themes"
import type { Task } from "@/types/kanban"
import type { CourseStatus } from "@/types/user-progress"

interface TaskCardProps {
  task: Task
  onClick: () => void
  onDuplicate: () => void
  className?: string
  showHoverPlus?: boolean // Para sidebar - efecto hover con "+"
  editingMode?: boolean // Para malla personal - modo edición
  onRemove?: () => void // Función para remover en modo edición
  allTasks?: Task[] // Lista completa de cursos para obtener colores de prerrequisitos
  // Nuevas props para el sistema de progreso local
  userCourseData?: {
    estado: CourseStatus
    vtr: number
    instanceId: string
  }
}

export default function TaskCard({
  task,
  onClick,
  onDuplicate,
  className = "",
  showHoverPlus = false,
  editingMode = false,
  onRemove,
  allTasks = [],
  userCourseData,
}: TaskCardProps) {
  const { theme, resolvedTheme } = useTheme()
  
  // Función para ajustar colores según el tema
  const getAdaptiveColor = (originalColor: string) => {
    if (!originalColor) return originalColor
    
    const isDark = resolvedTheme === 'dark'
    
    if (isDark) {
      // En modo oscuro, hacer los colores más brillantes y saturados
      return lightenColor(originalColor, 0.3)
    } else {
      // En modo claro, usar el color original
      return originalColor
    }
  }
  
  // Usar el color del departamento adaptado al tema
  const adaptiveColor = getAdaptiveColor(task.color || '')
  const headerStyle = adaptiveColor
    ? { backgroundColor: adaptiveColor, color: isLightColor(adaptiveColor) ? "#000" : "#fff" }
    : {}

  const handleClick = () => {
    if (editingMode && onRemove) {
      // En modo edición, el click principal remueve el curso
      onRemove()
    } else {
      // En modo normal, el click abre los detalles
      onClick()
    }
  }

  // Verificar si tiene prerrequisitos
  const hasPrerequisitos = task.prerrequisitos && task.prerrequisitos.length > 0

  // Función para obtener el color de un prerrequisito basado en su ID
  const getPrerequisiteColor = (prereqId: number) => {
    const prereqCourse = allTasks.find((course) => course.cursoId === prereqId)
    const originalColor = prereqCourse?.color || "#6B7280"
    return getAdaptiveColor(originalColor)
  }

  // Función para obtener el estilo de un prerrequisito con borde negro y fondo adaptativo
  const getPrerequisiteStyle = (prereqId: number) => {
    const isDark = resolvedTheme === 'dark'
    
    return {
      backgroundColor: isDark ? "#374151" : "#ffffff",
      borderColor: "black",
      borderWidth: "1px",
      borderStyle: "solid",
      color: isDark ? "#f3f4f6" : "#374151",
    }
  }

  // Función para determinar el estilo de fondo basado en el estado
  const getCardBackgroundClass = () => {
    return 'bg-white dark:bg-gray-800 border dark:border-gray-700'
  }

  // Función para obtener la clase de línea diagonal basada en el estado
  const getCrossedClass = () => {
    if (!userCourseData?.estado) return ''
    
    switch (userCourseData.estado) {
      case 'aprobado':
        return 'task-card-approved'
      case 'reprobado':
        return 'task-card-failed'
      case 'rav':
        return 'task-card-rav'
      default:
        return '' // 'en-curso' no tiene línea
    }
  }

  // Función para obtener el color de fondo del VTR
  const getVtrBackgroundColor = (vtr: number) => {
    if (vtr >= 3) {
      return 'bg-red-400 dark:bg-red-500'
    }
    return 'bg-white dark:bg-gray-700' // VTR = 1 y 2 (por defecto)
  }

  // Función para obtener el color del texto del VTR
  const getVtrTextColor = (vtr: number) => {
    if (vtr >= 3) {
      return 'text-white' // Texto blanco sobre rojo
    }
    return 'text-gray-600 dark:text-gray-300' // Color original para VTR = 1 y 2
  }

  return (
    <div
      className={`mb-2 ${getCardBackgroundClass()} ${getCrossedClass()} rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden relative ${className}`}
      onClick={handleClick}
    >
      {/* Hover overlay with plus icon - SOLO para sidebar */}
      {showHoverPlus && (
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <Plus className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      )}

      {/* Hover overlay with minus icon - SOLO para malla personal en modo edición */}
      {editingMode && (
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-12 h-12 bg-red-400 dark:bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <Minus className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* ID del curso en la esquina superior derecha */}
      <div className="absolute top-1 right-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full font-mono z-30 border border-black">
        {task.cursoId || task.id.split("-")[1] || "?"}
      </div>

      {/* Prerrequisitos en la esquina inferior izquierda - Solo si existen */}
      {hasPrerequisitos && (
        <div className="absolute bottom-1 left-1 flex gap-1 z-30">
          {task.prerrequisitos.map((prereq, index) => (
            <div
              key={index}
              className="text-xs px-1.5 py-0.5 rounded-full font-mono"
              style={getPrerequisiteStyle(prereq)}
            >
              {prereq}
            </div>
          ))}
        </div>
      )}

      {/* Header - Sigla del ramo con color de departamento */}
      <div className="flex justify-between items-center p-1.5" style={headerStyle}>
        <div className="font-mono text-sm font-medium">{task.codigo}</div>
      </div>

      {/* Separador entre header y contenido */}
      <Separator className="w-full bg-gray-200 dark:bg-gray-700" />

      {/* Contenido - Nombre del ramo centrado */}
      <div className="p-3 text-center">
        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{task.nombre || task.title}</h4>
      </div>

      {/* Separador entre contenido y footer */}
      <Separator className="w-full bg-gray-200 dark:bg-gray-700" />

      {/* Footer - VTR y estado */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center relative">
        {/* Espaciador */}
        <div></div>
        
        {/* Container cuadrado para estado */}
        <div className={`absolute right-1.5 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border border-gray-300 dark:border-gray-600 ${getVtrBackgroundColor(userCourseData?.vtr || 1)} flex items-center justify-center`}>
          <span className={`text-xs font-mono ${getVtrTextColor(userCourseData?.vtr || 1)}`}>
            {userCourseData?.vtr || 1}
          </span>
        </div>
      </div>

      {/* Check icon para cursos aprobados NEGRO*/}
      {userCourseData?.estado === 'aprobado' && (
        <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 z-29 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" strokeWidth={5} style={{ color: 'black' }} />
      )}

      {/* Check icon para cursos aprobados VERDE*/}
      {userCourseData?.estado === 'aprobado' && (
        <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 z-30 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" strokeWidth={4} style={{ color: '#5FCC7A' }} />
      )}

      {/* X icon para cursos reprobados */}
      {userCourseData?.estado === 'reprobado' && (
        <X className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-red-600 z-29 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" strokeWidth={5} style={{ color: 'black' }} />
      )}
      
      {/* X icon para cursos reprobados */}
      {userCourseData?.estado === 'reprobado' && (
        <X className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-red-600 z-30 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" strokeWidth={4} />
      )}

      {/* Ban icon para cursos RAV NEGRO (borde) */}
      {userCourseData?.estado === 'rav' && (
        <Ban className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 z-29 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" strokeWidth={5} style={{ color: 'black' }} />
      )}

      {/* Ban icon para cursos RAV NEGRO (principal) */}
      {userCourseData?.estado === 'rav' && (
        <Ban className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 z-30 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" strokeWidth={4} style={{ color: 'black' }} />
      )}

    </div>
  )
}

// Función para determinar si un color es claro u oscuro
function isLightColor(color: string): boolean {
  // Convertir color hexadecimal a RGB
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  // Calcular luminosidad (fórmula estándar)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Si la luminosidad es mayor a 0.5, es un color claro
  return luminance > 0.5
}

// Función para aclarar un color (para modo oscuro)
function lightenColor(color: string, amount: number): string {
  if (!color || !color.startsWith('#')) return color
  
  // Convertir color hexadecimal a RGB
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)

  // Aclarar cada componente RGB
  const newR = Math.min(255, Math.round(r + (255 - r) * amount))
  const newG = Math.min(255, Math.round(g + (255 - g) * amount))
  const newB = Math.min(255, Math.round(b + (255 - b) * amount))

  // Convertir de vuelta a hexadecimal
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}
