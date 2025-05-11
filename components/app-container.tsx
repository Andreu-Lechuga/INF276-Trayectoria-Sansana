"use client"

import { useState, useEffect } from "react"
import { ThemeToggle } from "./theme-toggle"
import KanbanBoard from "./kanban-board"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { Task } from "@/types/kanban"

// Importar los datos de carreras
import carrerasData from "@/data/carreras.json"

export default function AppContainer() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Agregar estado para la carrera seleccionada
  const [selectedCarrera, setSelectedCarrera] = useState(carrerasData.carreras[0])

  // Initialize tasks from courses data
  // useEffect(() => {
  //   // Convert courses data to Task objects
  //   const tasks: Task[] = coursesData.map((course: any) => ({
  //     id: course.id,
  //     title: course.nombre,
  //     description: "",
  //     status: course.status,
  //     dueDate: null,
  //     subtasks: [],
  //     customFields: [],
  //     createdAt: new Date().toISOString(),
  //     nombre: course.nombre,
  //     sigla: course.sigla,
  //     creditos: course.creditos,
  //     categoria: course.categoria,
  //     prerequisitos: course.prerequisitos,
  //     semestre: course.semestre,
  //   }))

  //   setAllTasks(tasks)
  //   setFilteredTasks(tasks)
  // }, [])

  // Función para cargar los datos de una carrera
  const loadCarreraData = async (carreraLink: string) => {
    try {
      // Usar fetch en lugar de import dinámico
      const response = await fetch(`/data/data_${carreraLink}.json`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const cursos = data.cursos

      // Convertir los cursos a tareas
      const tasks: Task[] = cursos.map((curso: any) => ({
        id: `curso-${curso.codigo}`,
        title: curso.nombre,
        nombre: curso.nombre,
        codigo: curso.codigo,
        creditos: curso.creditos,
        horas: curso.horas,
        departamento: curso.departamento,
        prerrequisitos: curso.prerrequisitos || [],
        periodo: curso.periodo || "",
        semestre: curso.semestre,
        description: "",
        status: "To Do", // Estado por defecto
        dueDate: null,
        subtasks: [],
        customFields: [],
        createdAt: new Date().toISOString(),
      }))

      setAllTasks(tasks)
      setFilteredTasks(tasks)
    } catch (error) {
      console.error("Error loading carrera data:", error)
    }
  }

  // Cargar los datos de la carrera seleccionada al inicio
  useEffect(() => {
    loadCarreraData(selectedCarrera.link)
  }, [selectedCarrera])

  // Filter tasks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(allTasks)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allTasks.filter(
      (task) =>
        (task.nombre && task.nombre.toLowerCase().includes(query)) ||
        (task.sigla && task.sigla.toLowerCase().includes(query)),
    )
    setFilteredTasks(filtered)
  }, [searchQuery, allTasks])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Update tasks when they change in the KanbanBoard
  const handleTasksChange = (updatedTasks: Task[]) => {
    // Only update if the tasks have actually changed
    if (JSON.stringify(updatedTasks) !== JSON.stringify(allTasks)) {
      setAllTasks(updatedTasks)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950">
      {/* Sidebar - Mobile overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-all duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <div className="flex-1"></div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search bar at the top */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 bg-gray-100 dark:bg-gray-700 border-0 rounded-full transition-all ${
                isSidebarOpen ? "w-full" : "w-0 p-0 opacity-0 lg:hidden"
              }`}
            />
          </div>
        </div>

        {/* Task cards container */}
        <div
          className={`flex-1 p-2 overflow-auto ${isSidebarOpen ? "" : "hidden lg:block"}`}
          style={{ maxHeight: "calc(100vh - 140px)" }}
        >
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`cursor-pointer ${selectedTask?.id === task.id ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-1">
                    {task.nombre || task.title}
                  </h3>
                  {task.sigla && <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{task.sigla}</p>}
                  {task.categoria && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.categoria}</p>}
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {searchQuery ? "No se encontraron cursos" : "No hay cursos disponibles"}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle button outside sidebar */}
        <div className="absolute top-3 left-0 z-50 lg:block hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full shadow-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 ml-2"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
          {/* Agregar selector de carreras en el header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Trayectoria Sansana</h1>
            <select
              className="ml-4 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={selectedCarrera.link}
              onChange={(e) => {
                const carrera = carrerasData.carreras.find((c) => c.link === e.target.value)
                if (carrera) {
                  setSelectedCarrera(carrera)
                }
              }}
            >
              {carrerasData.carreras.map((carrera) => (
                <option key={carrera.link} value={carrera.link}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <KanbanBoard
            initialTasks={allTasks}
            onTaskSelect={setSelectedTask}
            selectedTask={selectedTask}
            onTasksChange={handleTasksChange}
          />
        </main>

        {/* Footer */}
        <footer className="h-12 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex items-center justify-center px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Trayectoria Sansana. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  )
}
