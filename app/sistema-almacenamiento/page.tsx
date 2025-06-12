"use client"

import { Suspense } from "react"
import AppContainerEnhanced from "@/components/app-container-enhanced"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

export default function SistemaAlmacenamientoPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando sistema de almacenamiento...</p>
            </div>
          </div>
        }>
          <AppContainerEnhanced carrera="INF" />
        </Suspense>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
