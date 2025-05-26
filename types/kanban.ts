export interface Task {
  id: string
  title: string
  description?: string
  status: string
  dueDate: string | null
  subtasks: Subtask[]
  customFields: CustomField[]
  createdAt: string
  // Campos para cursos
  nombre: string
  codigo: string
  creditos: number
  horas: number
  departamento: string
  color?: string
  prerrequisitos: number[]
  periodo: string
  semestre: number
  vtr: number // Nuevo campo añadido
  aprobado?: boolean
  cursoId?: number
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
