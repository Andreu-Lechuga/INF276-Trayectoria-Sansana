"use client"

import type React from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Task } from "@/types/kanban"

interface TaskCardProps {
  task: Task
  onClick: () => void
  onDuplicate: () => void
  className?: string
}

export default function TaskCard({ task, onClick, onDuplicate, className = "" }: TaskCardProps) {
  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate()
  }

  // Usar el color del departamento si está disponible
  const headerStyle = task.color
    ? { backgroundColor: task.color, color: isLightColor(task.color) ? "#000" : "#fff" }
    : {}

  return (
    <div
      className={`mb-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Header - Sigla del ramo con color de departamento */}
      <div className="flex justify-between items-center p-1.5" style={headerStyle}>
        <div className="font-mono text-sm font-medium">{task.codigo}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDuplicate}
          title="Duplicar curso"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      {/* Separador entre header y contenido */}
      <Separator className="w-full bg-gray-200 dark:bg-gray-700" />

      {/* Contenido - Nombre del ramo centrado */}
      <div className="p-3 text-center">
        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{task.nombre || task.title}</h4>
      </div>

      {/* Separador entre contenido y footer */}
      <Separator className="w-full bg-gray-200 dark:bg-gray-700" />

      {/* Footer - Departamento y créditos */}
      <div className="p-1.5 bg-gray-50 dark:bg-gray-750 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{task.departamento}</span>
        {task.creditos > 0 && <span>{task.creditos} cr.</span>}
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
