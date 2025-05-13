"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, FileJson, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function VerifyJsonPaths() {
  const [results, setResults] = useState<{ path: string; success: boolean; message: string; content?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState("")

  useEffect(() => {
    // Intentar determinar la URL base
    setPublicUrl(window.location.origin)
  }, [])

  const testPaths = async () => {
    setLoading(true)
    setResults([])
    setExpanded(null)

    // Probar diferentes variaciones de rutas
    const paths = [
      "/data/carreras.json",
      "/data/data_FIS.json",
      "/data/data_INF.json",
      "/data/data_MAT.json",
      "./data/carreras.json",
      "data/carreras.json",
      "public/data/carreras.json",
      "../public/data/carreras.json",
      "/public/data/carreras.json",
    ]

    const newResults = []

    for (const path of paths) {
      try {
        const response = await fetch(path, {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        })

        const contentType = response.headers.get("content-type")
        const status = response.status
        const statusText = response.statusText

        newResults.push({
          path,
          success: response.ok && contentType?.includes("application/json"),
          message: response.ok
            ? `Status: ${status} ${statusText}, Content-Type: ${contentType}`
            : `Error HTTP: ${status} ${statusText}, Content-Type: ${contentType || "no especificado"}`,
          content: response.ok ? await response.text().then((text) => text.substring(0, 200) + "...") : undefined,
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
          Verificación avanzada de rutas JSON
        </CardTitle>
        <CardDescription>
          Verifica si los archivos JSON se están cargando correctamente y muestra información detallada sobre las
          respuestas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              URL base detectada: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{publicUrl}</code>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Esta herramienta probará múltiples variaciones de rutas para encontrar la correcta.
            </p>
          </div>

          <Button onClick={testPaths} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Probando rutas...
              </>
            ) : (
              "Verificar rutas JSON"
            )}
          </Button>

          {results.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="results">
                <AccordionTrigger>
                  Resultados ({results.filter((r) => r.success).length} exitosos / {results.length} total)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-gray-500">
        <p className="mb-2">
          <strong>Solución recomendada:</strong> Si ninguna ruta funciona, asegúrate de que:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Los archivos JSON estén en la carpeta{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">public/data/</code>
          </li>
          <li>
            Los archivos tengan la extensión{" "}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">.json</code>
          </li>
          <li>El contenido de los archivos sea JSON válido</li>
          <li>El servidor esté configurado para servir archivos JSON con el tipo MIME correcto</li>
        </ol>
      </CardFooter>
    </Card>
  )
}
