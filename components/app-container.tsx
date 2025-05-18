"use client"

import { useState, useEffect } from "react"
import { ThemeToggle } from "./theme-toggle"
import KanbanBoard from "./kanban-board"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import type { Task } from "@/types/kanban"
import { useToast } from "@/hooks/use-toast"
import { carreras } from "@/data/carreras"
// Importar el cargador de datos con la ruta correcta
import { getCarreraData } from "../data/data-loader"

export default function AppContainer() {
  const { toast } = useToast()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado para la carrera seleccionada
  const [selectedCarrera, setSelectedCarrera] = useState<{ nombre: string; link: string } | null>(null)

  // Estado para el filtro de departamento
  const [departmentFilter, setDepartmentFilter] = useState<string>("")
  const [departments, setDepartments] = useState<string[]>([])

  // Inicializar la carrera seleccionada
  useEffect(() => {
    if (carreras.length > 0) {
      setSelectedCarrera(carreras[0])
    }
  }, [])

  // Reemplazar la función loadCarreraData completa con esta implementación:
  const loadCarreraData = async (carreraLink: string) => {
    if (!carreraLink) return

    setLoading(true)
    setError(null)

    try {
      // Usar la función getCarreraData en lugar de importación dinámica
      const dataModule = getCarreraData(carreraLink)

      if (!dataModule || !dataModule.cursos || !Array.isArray(dataModule.cursos)) {
        throw new Error("Formato de datos inválido: no se encontraron cursos")
      }

      const cursos = dataModule.cursos

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

      // Extraer departamentos únicos
      const uniqueDepartments = Array.from(new Set(tasks.map((task) => task.departamento)))
        .filter(Boolean)
        .sort()
      setDepartments(uniqueDepartments)

      setAllTasks(tasks)
      setFilteredTasks(tasks)
      setLoading(false)
    } catch (error) {
      console.error("Error loading carrera data:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar los datos")
      setLoading(false)

      // Mostrar un mensaje de error al usuario
      toast({
        title: "Error al cargar datos",
        description: `No se pudieron cargar los datos de la carrera: ${error instanceof Error ? error.message : error}`,
        variant: "destructive",
      })

      // Establecer tareas vacías para evitar errores en la interfaz
      setAllTasks([])
      setFilteredTasks([])
    }
  }

  // Cargar los datos de la carrera seleccionada cuando cambie
  useEffect(() => {
    if (selectedCarrera) {
      loadCarreraData(selectedCarrera.link)
    }
  }, [selectedCarrera])

  // Actualizar el efecto de filtrado para incluir el filtro de departamento
  useEffect(() => {
    let filtered = allTasks

    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          (task.nombre && task.nombre.toLowerCase().includes(query)) ||
          (task.codigo && task.codigo.toLowerCase().includes(query)),
      )
    }

    // Aplicar filtro de departamento
    if (departmentFilter) {
      filtered = filtered.filter((task) => task.departamento === departmentFilter)
    }

    setFilteredTasks(filtered)
  }, [searchQuery, departmentFilter, allTasks])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Update tasks when they change in the KanbanBoard
  const handleTasksChange = (updatedTasks: Task[]) => {
    // Solo actualizar si hay tareas actualizadas y son diferentes de las actuales
    if (updatedTasks.length > 0 && JSON.stringify(updatedTasks) !== JSON.stringify(allTasks)) {
      setAllTasks(updatedTasks)
    }
  }

  // Si no hay carrera seleccionada aún, mostrar un indicador de carga
  if (!selectedCarrera) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Cargando carreras...</p>
        </div>
      </div>
    )
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

          {/* Selector de departamento */}
          <div className="mt-4">
            <select
              className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">Todos los departamentos</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task cards container */}
        <div
          className={`flex-1 p-2 overflow-auto ${isSidebarOpen ? "" : "hidden lg:block"}`}
          style={{ maxHeight: "calc(100vh - 140px)" }}
        >
          {loading ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">Cargando cursos...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500 dark:text-red-400 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 mb-2" />
              <p>Error al cargar los cursos</p>
              <p className="text-xs mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => selectedCarrera && loadCarreraData(selectedCarrera.link)}
              >
                Reintentar
              </Button>
            </div>
          ) : (
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{task.codigo}</p>
                    {task.departamento && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.departamento}</p>
                    )}
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && !loading && !error && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No se encontraron cursos" : "No hay cursos disponibles"}
                </div>
              )}
            </div>
          )}
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
              value={selectedCarrera?.link || ""}
              onChange={(e) => {
                const carrera = carreras.find((c) => c.link === e.target.value)
                if (carrera) {
                  setSelectedCarrera(carrera)
                }
              }}
              disabled={loading}
            >
              {carreras.map((carrera) => (
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
          {error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error al cargar los datos</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md px-4">{error}</p>
              <Button onClick={() => selectedCarrera && loadCarreraData(selectedCarrera.link)}>Reintentar</Button>
            </div>
          ) : (
            <KanbanBoard
              initialTasks={allTasks}
              onTaskSelect={setSelectedTask}
              selectedTask={selectedTask}
              onTasksChange={handleTasksChange}
            />
          )}
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
