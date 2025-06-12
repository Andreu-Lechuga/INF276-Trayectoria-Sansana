"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, BookOpen, Clock, Users, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Task } from "@/types/kanban"

interface EnhancedSidebarProps {
  tasks: Task[]
  onTaskSelect?: (task: Task) => void
  onTaskDragStart?: (task: Task) => void
  checkPrerequisites?: (cursoId: number) => { canAdd: boolean; missingPrereqs: any[] }
  className?: string
}

interface CourseGroup {
  departamento: string;
  color: string;
  cursos: Task[];
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

export default function EnhancedSidebar({
  tasks,
  onTaskSelect,
  onTaskDragStart,
  checkPrerequisites,
  className = ""
}: EnhancedSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['FI', 'PC']))

  // Agrupar cursos por departamento
  const courseGroups = useMemo(() => {
    const groups: Record<string, CourseGroup> = {};

    tasks.forEach(task => {
      const dept = task.departamento || 'OTHER';
      if (!groups[dept]) {
        groups[dept] = {
          departamento: dept,
          color: task.color || '#gray',
          cursos: []
        };
      }
      groups[dept].cursos.push(task);
    });

    // Ordenar cursos dentro de cada grupo por semestre
    Object.values(groups).forEach(group => {
      group.cursos.sort((a, b) => (a.semestre || 0) - (b.semestre || 0));
    });

    return groups;
  }, [tasks]);

  // Filtrar cursos según criterios de búsqueda
  const filteredGroups = useMemo(() => {
    const filtered: Record<string, CourseGroup> = {};

    Object.entries(courseGroups).forEach(([dept, group]) => {
      const filteredCourses = group.cursos.filter(task => {
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

      if (filteredCourses.length > 0) {
        filtered[dept] = {
          ...group,
          cursos: filteredCourses
        };
      }
    });

    return filtered;
  }, [courseGroups, searchTerm, selectedDepartment, selectedSemester, showOnlyAvailable, checkPrerequisites]);

  // Obtener departamentos únicos para el filtro
  const departments = useMemo(() => {
    return Object.keys(courseGroups).sort();
  }, [courseGroups]);

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

  const toggleGroup = (dept: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept);
    } else {
      newExpanded.add(dept);
    }
    setExpandedGroups(newExpanded);
  };

  const handleTaskClick = (task: Task) => {
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

  const totalCourses = Object.values(filteredGroups).reduce((sum, group) => sum + group.cursos.length, 0);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Cursos Disponibles
          </h2>
        </div>

        {/* Búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="space-y-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full">
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

          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full">
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available-only"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="available-only" className="text-sm text-gray-600 dark:text-gray-400">
              Solo cursos disponibles
            </label>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {totalCourses} curso{totalCourses !== 1 ? 's' : ''} encontrado{totalCourses !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de cursos */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {Object.entries(filteredGroups).map(([dept, group]) => (
            <Collapsible
              key={dept}
              open={expandedGroups.has(dept)}
              onOpenChange={() => toggleGroup(dept)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="font-medium text-sm">
                      {departmentNames[dept] || dept}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {group.cursos.length}
                    </Badge>
                  </div>
                  {expandedGroups.has(dept) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-2 mt-2">
                {group.cursos.map(task => {
                  const prereqStatus = getPrerequisiteStatus(task);
                  
                  return (
                    <Card
                      key={task.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !prereqStatus.canAdd ? 'opacity-60' : ''
                      }`}
                      draggable={prereqStatus.canAdd}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                              {task.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {task.codigo}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs ml-2"
                            style={{ borderColor: task.color, color: task.color }}
                          >
                            S{task.semestre}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {task.creditos} créditos
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.horas}h
                          </div>
                        </div>

                        {!prereqStatus.canAdd && prereqStatus.missingPrereqs.length > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                            <p className="text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                              Prerrequisitos faltantes:
                            </p>
                            <div className="space-y-1">
                              {prereqStatus.missingPrereqs.map((prereq: any, index: number) => (
                                <p key={index} className="text-yellow-600 dark:text-yellow-400">
                                  • {prereq.codigo} - {prereq.nombre}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.prerrequisitos && task.prerrequisitos.length > 0 && prereqStatus.canAdd && (
                          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                            ✓ Prerrequisitos cumplidos
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}

          {totalCourses === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No se encontraron cursos</p>
              <p className="text-xs mt-1">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
