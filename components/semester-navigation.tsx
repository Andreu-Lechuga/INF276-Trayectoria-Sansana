"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Column as ColumnType, Task } from "@/types/kanban"
import TaskCard from "./task-card"

interface SemesterNavigationProps {
  columns: ColumnType[]
  onSelectSemester?: (columnId: string) => void
  allTasks: Task[] // Todos los cursos disponibles
  onTaskClick: (task: Task) => void // Añadir esta prop para manejar el clic en un curso
}

export default function SemesterNavigation({
  columns,
  onSelectSemester,
  allTasks,
  onTaskClick,
}: SemesterNavigationProps) {
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)

  // Agrupar columnas por años (2 columnas por año)
  const yearGroups: { year: number; columns: ColumnType[] }[] = []

  for (let i = 0; i < columns.length; i += 2) {
    const yearColumns = columns.slice(i, i + 2)
    const yearNumber = Math.floor(i / 2) + 1
    yearGroups.push({ year: yearNumber, columns: yearColumns })
  }

  // Obtener los cursos del semestre seleccionado
  const selectedColumn = columns.find((col) => col.id === selectedColumnId)
  const semesterCourses = selectedColumn ? selectedColumn.tasks : []

  // Manejar la selección de semestre
  const handleSelectSemester = (columnId: string) => {
    setSelectedColumnId(columnId)
    if (onSelectSemester) {
      onSelectSemester(columnId)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">Navegación por Semestres</h2>

      <div className="space-y-4">
        {/* Fila de años */}
        <div className="flex justify-center">
          {yearGroups.map((yearGroup) => (
            <div
              key={`year-${yearGroup.year}`}
              className="text-center font-medium text-gray-700 dark:text-gray-300"
              style={{ width: `${yearGroup.columns.length * 100}px` }}
            >
              Año {yearGroup.year}
            </div>
          ))}
        </div>

        {/* Fila de semestres */}
        <div className="flex justify-center">
          {yearGroups.flatMap((yearGroup) =>
            yearGroup.columns.map((column) => (
              <Button
                key={column.id}
                variant={selectedColumnId === column.id ? "default" : "outline"}
                className="w-[100px] mx-1"
                onClick={() => handleSelectSemester(column.id)}
              >
                {column.title}
              </Button>
            )),
          )}
        </div>
      </div>

      {/* Información del semestre seleccionado */}
      <div className="mt-12">
        {selectedColumnId ? (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Cursos en Semestre {selectedColumn?.title}
            </h3>

            {semesterCourses.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {semesterCourses.map((course) => (
                  <div key={course.id} className="w-[200px]">
                    <TaskCard
                      task={course}
                      onClick={() => onTaskClick(course)} // Pasar la función onTaskClick
                      onDuplicate={() => {}}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No hay cursos asignados a este semestre.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Puedes arrastrar cursos desde la barra lateral al semestre en la vista de Malla Personal.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">Selecciona un semestre para ver los cursos asignados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
