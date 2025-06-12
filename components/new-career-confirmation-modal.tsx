"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, BookOpen, Calculator, Atom } from "lucide-react"
import { CarreraType } from "@/types/carrera-state"

interface NewCareerConfirmationModalProps {
  isOpen: boolean
  carrera: CarreraType | null
  onConfirm: () => void
  onCancel: () => void
}

const carreraIcons = {
  INF: BookOpen,
  MAT: Calculator,
  FIS: Atom,
}

const carreraNames = {
  INF: "Ingeniería Civil Informática",
  MAT: "Ingeniería Civil Matemática", 
  FIS: "Licenciatura en Física",
}

export default function NewCareerConfirmationModal({ 
  isOpen, 
  carrera,
  onConfirm, 
  onCancel 
}: NewCareerConfirmationModalProps) {
  if (!carrera) return null

  const Icon = carreraIcons[carrera]
  const carreraName = carreraNames[carrera]

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Comenzar Nueva Carrera
          </DialogTitle>
          <DialogDescription>
            Estás a punto de comenzar una nueva trayectoria para {carreraName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Se creará un nuevo progreso para <strong>{carrera}</strong> comenzando con los cursos del primer semestre.
              Podrás cambiar entre carreras en cualquier momento.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Comenzar {carrera}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
