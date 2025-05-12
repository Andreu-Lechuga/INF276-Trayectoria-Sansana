"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, FileJson } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugJsonPaths() {
  const [results, setResults] = useState<{ path: string; success: boolean; message: string; content?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const testPaths = async () => {
    setLoading(true)
    setResults([])
    setExpanded(null)

    const paths = ["/data/carreras.json", "/data/data_FIS.json", "/data/data_INF.json", "/data/data_MAT.json"]

    const newResults = []

    for (const path of paths) {
      try {
        const response = await fetch(path)
        const contentType = response.headers.get("content-type")

        if (!response.ok) {
          newResults.push({
            path,
            success: false,
            message: `Error HTTP: ${response.status} ${response.statusText}`,
          })
          continue
        }

        if (!contentType || !contentType.includes("application/json")) {
          newResults.push({
            path,
            success: false,
            message: `Tipo de contenido incorrecto: ${contentType}`,
          })
          continue
        }

        // Intentar parsear el JSON
        const jsonData = await response.json()
        const contentPreview = JSON.stringify(jsonData, null, 2).substring(0, 200) + "..."

        newResults.push({
          path,
          success: true,
          message: "Archivo JSON cargado correctamente",
          content: contentPreview,
        })
      } catch (error) {
        newResults.push({
          path,
          success: false,
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }

    setResults(newResults)
    setLoading(false)
  }

  const toggleExpand = (path: string) => {
    if (expanded === path) {
      setExpanded(null)
    } else {
      setExpanded(path)
    }
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Depuración de rutas JSON
        </CardTitle>
        <CardDescription>
          Verifica si los archivos JSON se están cargando correctamente desde la carpeta /public/data/
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={testPaths} disabled={loading} className="w-full">
            {loading ? "Probando..." : "Probar rutas JSON"}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2 mt-4">
              {results.map((result) => (
                <Alert key={result.path} variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2">
                      {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <AlertTitle>{result.path}</AlertTitle>
                      <AlertDescription>
                        <p>{result.message}</p>
                        {result.success && (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-xs mt-1"
                            onClick={() => toggleExpand(result.path)}
                          >
                            {expanded === result.path ? "Ocultar contenido" : "Ver contenido"}
                          </Button>
                        )}
                        {expanded === result.path && result.content && (
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                            {result.content}
                          </pre>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Nota: Si los archivos no se cargan correctamente, verifica que estén en la carpeta /public/data/ y que tengan el
        formato JSON correcto.
      </CardFooter>
    </Card>
  )
}
