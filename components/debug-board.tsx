"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Bug } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Task } from "@/types/kanban"

interface DebugBoardProps {
  initialTasks?: Task[]
  columns?: any[]
}

export default function DebugBoard({ initialTasks = [], columns = [] }: DebugBoardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState({
    totalTasks: 0,
    primerSemestreTasks: 0,
    tasksInColumns: 0,
    columnsCount: 0,
  })

  useEffect(() => {
    if (initialTasks && columns) {
      const primerSemestreTasks = initialTasks.filter((task) => task.semestre === 1)
      const tasksInColumns = columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0)

      setStats({
        totalTasks: initialTasks.length,
        primerSemestreTasks: primerSemestreTasks.length,
        tasksInColumns: tasksInColumns,
        columnsCount: columns.length,
      })
    }
  }, [initialTasks, columns])

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4 mr-2" /> Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center">
            <Bug className="h-4 w-4 mr-2" /> Depuración del Tablero
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
            &times;
          </Button>
        </div>
        <CardDescription className="text-xs">Información de diagnóstico para desarrolladores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <Alert variant={stats.primerSemestreTasks > 0 ? "default" : "destructive"} className="py-2">
          <div className="flex items-start">
            {stats.primerSemestreTasks > 0 ? (
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2" />
            )}
            <div>
              <AlertTitle className="text-xs font-medium">Cursos del primer semestre</AlertTitle>
              <AlertDescription className="text-xs">{stats.primerSemestreTasks} cursos encontrados</AlertDescription>
            </div>
          </div>
        </Alert>

        <Alert variant={stats.tasksInColumns > 0 ? "default" : "destructive"} className="py-2">
          <div className="flex items-start">
            {stats.tasksInColumns > 0 ? (
              <CheckCircle className="h-4 w-4 mt-0.5 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2" />
            )}
            <div>
              <AlertTitle className="text-xs font-medium">Cursos en columnas</AlertTitle>
              <AlertDescription className="text-xs">
                {stats.tasksInColumns} cursos asignados a columnas
              </AlertDescription>
            </div>
          </div>
        </Alert>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="text-xs font-medium">Total de cursos</div>
            <div className="text-sm">{stats.totalTasks}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="text-xs font-medium">Columnas</div>
            <div className="text-sm">{stats.columnsCount}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => console.log({ initialTasks, columns })}
        >
          Log datos en consola
        </Button>
      </CardFooter>
    </Card>
  )
}
