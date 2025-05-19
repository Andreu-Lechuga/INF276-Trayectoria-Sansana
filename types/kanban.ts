export interface Task {
  id: string
  title: string
  description?: string
  status: string
  dueDate: string | null
  subtasks: Subtask[]
  customFields: CustomField[]
  createdAt: string
  // Campos actualizados para cursos
  nombre: string
  codigo: string
  creditos: number
  horas: number
  departamento: string
  color?: string // Añadido campo color opcional
  prerrequisitos: number[] // Cambiado de string[] a number[]
  periodo: string
  semestre: number
  cursoId?: number // Nuevo campo para el ID numérico del curso
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface CustomField {
  id: string
  name: string
  value: string
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
  color?: string
}

// Add new Rule interfaces for automation
export interface Rule {
  id: string
  name: string
  condition: RuleCondition
  action: RuleAction
  enabled: boolean
}

export interface RuleCondition {
  type: "due-date" | "subtasks-completed" | "custom-field"
  field?: string
  operator:
    | "equals"
    | "not-equals"
    | "contains"
    | "greater-than"
    | "less-than"
    | "is-empty"
    | "is-not-empty"
    | "is-overdue"
    | "all-completed"
  value?: string
}

export interface RuleAction {
  type: "move-to-column"
  targetColumnId: string
}
