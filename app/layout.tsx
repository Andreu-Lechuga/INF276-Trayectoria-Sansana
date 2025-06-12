'use client'

import type { Metadata } from 'next'
import { useEffect } from 'react'
import './globals.css'
import { initializeMigration } from '@/lib/migration-service'
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Inicializar migración al cargar la aplicación
  useEffect(() => {
    initializeMigration()
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
