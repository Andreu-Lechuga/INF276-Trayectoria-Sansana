import type { GradeData as GData } from "@/components/grade-calculator"

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
  gradeData?: GData // Nuevo campo para almacenar datos de notas
  // Campos del sistema de progreso
  estado?: 'en-curso' | 'aprobado' | 'reprobado' | 'rav'
  instanceId?: string
  esCopiaPorReprobacion?: boolean
  cursoOriginalInstanceId?: string
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

export interface GradeData {
  grades: Record<string, Record<number, string | number>>
  columnTitles: Record<string, string>
  intermediateCalculations: Array<{ label: string; value: string | number; formula?: string }>
  textBoxes?: Array<{ content: string; borderColor: string }>
  finalGrade: string | number
  formula?: string
}
