"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Calculator, Atom } from "lucide-react"
import { CarreraType } from "@/types/carrera-state"

interface CareerSelectionModalProps {
  isOpen: boolean
  onCareerSelect: (carrera: CarreraType) => void
  onClose?: () => void
}

const carreraIcons = {
  INF: BookOpen,
  MAT: Calculator,
  FIS: Atom,
}

const carreraDescriptions = {
  INF: "Desarrolla software, sistemas y soluciones tecnológicas innovadoras",
  MAT: "Aplica matemáticas avanzadas para resolver problemas complejos",
  FIS: "Explora los fundamentos de la naturaleza y el universo",
}

const carreraNames = {
  INF: "Ingeniería Civil Informática",
  MAT: "Ingeniería Civil Matemática", 
  FIS: "Licenciatura en Física",
}

export default function CareerSelectionModal({ 
  isOpen, 
  onCareerSelect, 
  onClose 
}: CareerSelectionModalProps) {
  const [selectedCarrera, setSelectedCarrera] = useState<CarreraType | null>(null)

  const handleConfirm = () => {
    if (selectedCarrera) {
      onCareerSelect(selectedCarrera)
    }
  }

  const handleCareerClick = (carrera: CarreraType) => {
    setSelectedCarrera(carrera)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="h-6 w-6" />
            Selecciona tu Carrera
          </DialogTitle>
          <DialogDescription>
            Elige la carrera para la cual deseas planificar tu trayectoria académica.
            Podrás cambiar entre carreras más adelante.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {(Object.keys(carreraNames) as CarreraType[]).map((carrera) => {
            const Icon = carreraIcons[carrera]
            const isSelected = selectedCarrera === carrera

            return (
              <Card
                key={carrera}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCareerClick(carrera)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <Icon className={`h-8 w-8 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <CardTitle className="text-lg">
                    {carrera}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-sm">
                    {carreraNames[carrera]}
                  </CardDescription>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {carreraDescriptions[carrera]}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button 
            onClick={handleConfirm}
            disabled={!selectedCarrera}
            className="min-w-[120px]"
          >
            Comenzar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
