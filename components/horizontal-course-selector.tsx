"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TaskCard from "./task-card"
import type { Task } from "@/types/kanban"

interface HorizontalCourseSelectorProps {
  tasks: Task[]
  onTaskSelect?: (task: Task) => void
  onTaskDragStart?: (task: Task) => void
  checkPrerequisites?: (cursoId: number) => { canAdd: boolean; missingPrereqs: any[] }
  isOpen: boolean
  onClose: () => void
  className?: string
}

const departmentNames: Record<string, string> = {
  'FI': 'Fundamentos de Informática',
  'PC': 'Plan Común',
  'HUM': 'Humanistas, Libres y Deportes',
  'TIN': 'Transversal e Integración',
  'SD': 'Sistemas de Decisión Informática',
  'IS': 'Ingeniería de Software',
  'TIC': 'Infraestructura TIC',
  'AN': 'Análisis Numérico',
  'IND': 'Industrias',
  'ELEC': 'Electivos Informática'
};

export default function HorizontalCourseSelector({
  tasks,
  onTaskSelect,
  onTaskDragStart,
  checkPrerequisites,
  isOpen,
  onClose,
  className = ""
}: HorizontalCourseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  // Filtrar cursos según criterios de búsqueda
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtro por término de búsqueda
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.departamento?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por departamento
      const matchesDepartment = selectedDepartment === "all" || 
        task.departamento === selectedDepartment;

      // Filtro por semestre
      const matchesSemester = selectedSemester === "all" || 
        task.semestre?.toString() === selectedSemester;

      // Filtro por disponibilidad (prerrequisitos)
      let matchesAvailability = true;
      if (showOnlyAvailable && checkPrerequisites && task.cursoId) {
        const { canAdd } = checkPrerequisites(task.cursoId);
        matchesAvailability = canAdd;
      }

      return matchesSearch && matchesDepartment && matchesSemester && matchesAvailability;
    });
  }, [tasks, searchTerm, selectedDepartment, selectedSemester, showOnlyAvailable, checkPrerequisites]);

  // Obtener departamentos únicos para el filtro
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    tasks.forEach(task => {
      if (task.departamento) {
        deptSet.add(task.departamento);
      }
    });
    return Array.from(deptSet).sort();
  }, [tasks]);

  // Obtener semestres únicos para el filtro
  const semesters = useMemo(() => {
    const semesterSet = new Set<number>();
    tasks.forEach(task => {
      if (task.semestre) {
        semesterSet.add(task.semestre);
      }
    });
    return Array.from(semesterSet).sort((a, b) => a - b);
  }, [tasks]);

  const handleTaskClick = (task: Task) => {
    // Verificar prerrequisitos antes de permitir la selección
    const prereqStatus = getPrerequisiteStatus(task);
    
    if (!prereqStatus.canAdd) {
      // No hacer nada si el curso no cumple prerrequisitos
      return;
    }
    
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("application/json", JSON.stringify(task));
    if (onTaskDragStart) {
      onTaskDragStart(task);
    }
  };

  const getPrerequisiteStatus = (task: Task) => {
    if (!checkPrerequisites || !task.cursoId) {
      return { canAdd: true, missingPrereqs: [] };
    }
    return checkPrerequisites(task.cursoId);
  };

  // Limpiar filtros al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedDepartment("all");
      setSelectedSemester("all");
      setShowOnlyAvailable(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg transition-all duration-300 ${className}`}>
      {/* Barra de controles superior */}
      <div className="px-4 py-2 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por departamento */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los departamentos</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {departmentNames[dept] || dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por semestre */}
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por semestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los semestres</SelectItem>
              {semesters.map(sem => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semestre {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Checkbox solo disponibles */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available-only-horizontal"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="available-only-horizontal" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Solo disponibles
            </label>
          </div>

          {/* Botón terminar - movido al extremo derecho */}
          <div className="flex-1"></div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 ml-auto"
          >
            <X className="h-4 w-4" />
            Terminar Edición
          </Button>
        </div>

        {/* Contador de cursos */}
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {filteredTasks.length} curso{filteredTasks.length !== 1 ? 's' : ''} encontrado{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista horizontal de cursos */}
      <div className="px-4 py-1">
        <div 
          className="w-full overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex gap-3 pb-1">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => {
                const prereqStatus = getPrerequisiteStatus(task);
                
                return (
                  <div
                    key={task.id}
                    className="shrink-0 w-48"
                    draggable={prereqStatus.canAdd}
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => handleTaskClick(task)}
                      onDuplicate={() => {}}
                      showHoverPlus={true}
                      className={`${!prereqStatus.canAdd ? 'opacity-40 grayscale-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      allTasks={tasks}
                    />
                    
                    {/* Indicador de prerrequisitos faltantes */}
                    {!prereqStatus.canAdd && prereqStatus.missingPrereqs.length > 0 && (
                      <div className="mt-1 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                        <p className="text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                          Prerrequisitos faltantes:
                        </p>
                        <div className="space-y-1">
                          {prereqStatus.missingPrereqs.slice(0, 2).map((prereq: any, index: number) => (
                            <p key={index} className="text-yellow-600 dark:text-yellow-400 truncate">
                              • {prereq.codigo}
                            </p>
                          ))}
                          {prereqStatus.missingPrereqs.length > 2 && (
                            <p className="text-yellow-600 dark:text-yellow-400">
                              +{prereqStatus.missingPrereqs.length - 2} más...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex-1 text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No se encontraron cursos</p>
                <p className="text-xs mt-1">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
