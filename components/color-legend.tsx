"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ColorLegendProps {
  colors: Record<string, [string, string]>
}

export default function ColorLegend({ colors }: ColorLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Si colors es undefined o vacío, no renderizar nada
  if (!colors || Object.keys(colors).length === 0) {
    return null
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader
        className="py-2 px-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-sm font-medium flex items-center">
          <HelpCircle className="h-4 w-4 mr-2" />
          Leyenda de Departamentos
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 pb-2 px-4">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <TooltipProvider>
              {Object.entries(colors).map(([dept, [color, description]]) => (
                <Tooltip key={dept}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
                      <span className="text-xs font-medium truncate">{dept}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
