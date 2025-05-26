"use client"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus } from "lucide-react"
import type { Task } from "@/types/kanban"

interface TaskCardProps {
  task: Task
  onClick: () => void
  onDuplicate: () => void
  className?: string
  showHoverPlus?: boolean // Para sidebar - efecto hover con "+"
  editingMode?: boolean // Para malla personal - modo edición
  onRemove?: () => void // Función para remover en modo edición
  allTasks?: Task[] // Lista completa de cursos para obtener colores de prerrequisitos
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
}: TaskCardProps) {
  // Usar el color del departamento si está disponible
  const headerStyle = task.color
    ? { backgroundColor: task.color, color: isLightColor(task.color) ? "#000" : "#fff" }
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
    return prereqCourse?.color || "#6B7280" // Color gris por defecto si no se encuentra
  }

  // Función para obtener el estilo de un prerrequisito con borde de color y fondo blanco
  const getPrerequisiteStyle = (prereqId: number) => {
    const color = getPrerequisiteColor(prereqId)
    return {
      backgroundColor: "#ffffff",
      borderColor: color,
      borderWidth: "1px",
      borderStyle: "solid",
      color: "#374151", // Texto gris oscuro para buena legibilidad sobre fondo blanco
    }
  }

  return (
    <div
      className={`mb-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group overflow-hidden relative ${className}`}
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
      <div className="absolute top-1 right-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full font-mono z-20">
        {task.cursoId || task.id.split("-")[1] || "?"}
      </div>

      {/* Prerrequisitos en la esquina inferior izquierda - Solo si existen */}
      {hasPrerequisitos && (
        <div className="absolute bottom-1 left-1 flex gap-1 z-20">
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

      {/* Footer - Container cuadrado para estado aprobado/reprobado */}
      <div className="p-1.5 bg-gray-50 dark:bg-gray-750 flex justify-end items-center">
        <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
          {/* Contenido del container se definirá más adelante */}
        </div>
      </div>
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
