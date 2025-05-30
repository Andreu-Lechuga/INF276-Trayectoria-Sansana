"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Plus, X, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Task } from "@/types/kanban"

interface EmbeddedGradeCalculatorProps {
  task: Task
  onSave?: (gradeData: GradeData) => void
  initialData?: GradeData
}

export interface GradeData {
  grades: Record<string, Record<number, string | number>>
  columnTitles: Record<string, string>
  intermediateCalculations: Array<{ label: string; value: string | number; formula?: string }>
  finalGrade: string | number
  formula?: string
  textBoxes: Array<{ content: string; borderColor: string }>
}

// Función para generar letras de columnas (A, B, C, ..., Z, AA, AB, ...)
const getColumnLabel = (index: number): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  if (index < 26) {
    return letters[index]
  }

  const firstChar = letters[Math.floor(index / 26) - 1]
  const secondChar = letters[index % 26]
  return `${firstChar}${secondChar}`
}

// Ancho fijo para toda la columna - reducido para embedded
const COLUMN_WIDTH = 80

export default function EmbeddedGradeCalculator({ task, onSave, initialData }: EmbeddedGradeCalculatorProps) {
  // Estado para las notas (estructura similar a Excel)
  const [grades, setGrades] = useState<Record<string, Record<number, string | number>>>({
    A: { 1: "" },
  })

  // Estado para los títulos de columnas
  const [columnTitles, setColumnTitles] = useState<Record<string, string>>({
    A: "",
  })

  // Estado para controlar qué tooltip está en modo edición
  const [editingTooltipIndex, setEditingTooltipIndex] = useState<number | null>(null)

  // Estado para el texto temporal del tooltip durante la edición
  const [tempTooltipText, setTempTooltipText] = useState<string>("")

  // Estado para los cálculos intermedios
  const [intermediateCalculations, setIntermediateCalculations] = useState<
    Array<{ label: string; value: string | number; formula?: string; tooltipText?: string }>
  >([{ label: "PC", value: "", formula: "", tooltipText: "" }])

  // Estado para las casillas de texto
  const [textBoxes, setTextBoxes] = useState<Array<{ content: string; borderColor: string }>>([])

  // Estado para controlar qué casilla está en modo edición
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Estado para la fórmula temporal durante la edición
  const [tempFormula, setTempFormula] = useState<string>("")

  // Estado para controlar qué etiqueta está en modo edición
  const [editingLabelIndex, setEditingLabelIndex] = useState<number | null>(null)

  // Estado para la etiqueta temporal durante la edición
  const [tempLabel, setTempLabel] = useState<string>("")

  // Ref para el input de fórmula
  const formulaInputRef = useRef<HTMLInputElement>(null)

  // Estado para controlar qué selector de color está abierto
  const [openColorSelector, setOpenColorSelector] = useState<number | null>(null)

  // Cargar datos iniciales si existen
  useEffect(() => {
    if (initialData) {
      setGrades(initialData.grades)
      setColumnTitles(initialData.columnTitles || {})
      setIntermediateCalculations(initialData.intermediateCalculations)
      setTextBoxes(initialData.textBoxes || [])
    }
  }, [initialData])

  // Enfocar el input de fórmula cuando entra en modo edición
  useEffect(() => {
    if (editingIndex !== null && formulaInputRef.current) {
      formulaInputRef.current.focus()
    }
  }, [editingIndex])

  // Efecto para cerrar el selector de color al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openColorSelector !== null) {
        setOpenColorSelector(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openColorSelector])

  // Añadir una nueva casilla de texto
  const addTextBox = () => {
    setTextBoxes([...textBoxes, { content: "", borderColor: "gray" }])
  }

  // Eliminar una casilla de texto
  const removeTextBox = (index: number) => {
    const newTextBoxes = textBoxes.filter((_, i) => i !== index)
    setTextBoxes(newTextBoxes)
  }

  // Actualizar el contenido de una casilla de texto
  const updateTextBoxContent = (index: number, content: string) => {
    const newTextBoxes = [...textBoxes]
    newTextBoxes[index].content = content
    setTextBoxes(newTextBoxes)
  }

  // Actualizar el color del borde de una casilla de texto
  const updateTextBoxColor = (index: number, color: string) => {
    const newTextBoxes = [...textBoxes]
    newTextBoxes[index].borderColor = color
    setTextBoxes(newTextBoxes)
  }

  // Función para obtener todas las filas que existen en una columna específica
  const getColumnRowNumbers = (columnId: string): number[] => {
    const columnRows = Object.keys(grades[columnId] || {}).map(Number)
    return columnRows.sort((a, b) => a - b)
  }

  // Añadir una nueva fila a una columna específica
  const addRowToColumn = (columnId: string) => {
    const newGrades = { ...grades }
    const columnRows = Object.keys(newGrades[columnId]).map(Number)
    const maxRowInColumn = columnRows.length > 0 ? Math.max(...columnRows) : 0

    newGrades[columnId][maxRowInColumn + 1] = ""
    setGrades(newGrades)
  }

  // Eliminar una fila específica de una columna específica (solo la última)
  const removeRowFromColumn = (columnId: string, rowNumber: number) => {
    const columnRows = getColumnRowNumbers(columnId)
    const lastRow = columnRows[columnRows.length - 1]

    if (rowNumber !== lastRow) {
      return
    }

    const newGrades = { ...grades }
    delete newGrades[columnId][rowNumber]
    setGrades(newGrades)
  }

  // Verificar si una fila se puede eliminar (solo la última de cada columna)
  const canDeleteRow = (columnId: string, rowNumber: number): boolean => {
    const columnRows = getColumnRowNumbers(columnId)
    const lastRow = columnRows[columnRows.length - 1]
    return rowNumber === lastRow
  }

  // Añadir una nueva columna
  const addColumn = () => {
    const columns = Object.keys(grades)
    const lastColIndex = columns.length - 1
    const newColLabel = getColumnLabel(lastColIndex + 1)

    const newGrades = { ...grades }
    newGrades[newColLabel] = { 1: "" }

    setGrades(newGrades)

    setColumnTitles((prev) => ({
      ...prev,
      [newColLabel]: "",
    }))
  }

  // Eliminar una columna (solo la última)
  const removeColumn = (colLabel: string) => {
    const columns = Object.keys(grades)
    const lastColumn = columns[columns.length - 1]

    if (colLabel !== lastColumn || colLabel === "A") {
      return
    }

    const newGrades = { ...grades }
    delete newGrades[colLabel]

    const newColumnTitles = { ...columnTitles }
    delete newColumnTitles[colLabel]

    setGrades(newGrades)
    setColumnTitles(newColumnTitles)
  }

  // Verificar si una columna se puede eliminar
  const canDeleteColumn = (colLabel: string): boolean => {
    const columns = Object.keys(grades)
    const lastColumn = columns[columns.length - 1]
    return colLabel === lastColumn && colLabel !== "A"
  }

  // Actualizar el título de una columna
  const updateColumnTitle = (col: string, title: string) => {
    const limitedTitle = title.slice(0, 15) // Reducido para embedded
    setColumnTitles((prev) => ({
      ...prev,
      [col]: limitedTitle,
    }))
  }

  // Añadir un nuevo cálculo intermedio
  const addIntermediateCalculation = () => {
    setIntermediateCalculations([...intermediateCalculations, { label: "", value: "", formula: "", tooltipText: "" }])
  }

  // Actualizar el valor de una celda
  const updateCellValue = (col: string, row: number, value: string) => {
    const newGrades = { ...grades }
    const numValue = !isNaN(Number.parseFloat(value)) ? Number.parseFloat(value) : value
    newGrades[col][row] = numValue
    setGrades(newGrades)
  }

  // Actualizar el valor de un cálculo intermedio
  const updateIntermediateValue = (index: number, value: string) => {
    const newCalcs = [...intermediateCalculations]
    const numValue = !isNaN(Number.parseFloat(value)) ? Number.parseFloat(value) : value
    newCalcs[index].value = numValue
    setIntermediateCalculations(newCalcs)
  }

  // Actualizar la etiqueta de un cálculo intermedio
  const updateIntermediateLabel = (index: number, label: string) => {
    const newCalcs = [...intermediateCalculations]
    newCalcs[index].label = label
    setIntermediateCalculations(newCalcs)
  }

  // Funciones de edición de fórmula
  const startFormulaEditing = (index: number) => {
    setEditingIndex(index)
    setTempFormula(intermediateCalculations[index].formula || "")
  }

  const finishFormulaEditing = () => {
    if (editingIndex !== null) {
      const newCalcs = [...intermediateCalculations]
      newCalcs[editingIndex].formula = tempFormula

      if (tempFormula.trim()) {
        newCalcs[editingIndex].value = "Resultado"
      } else {
        newCalcs[editingIndex].value = ""
      }

      setIntermediateCalculations(newCalcs)
    }

    setEditingIndex(null)
    setTempFormula("")
  }

  const handleFormulaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      finishFormulaEditing()
    } else if (e.key === "Escape") {
      setEditingIndex(null)
      setTempFormula("")
    }
  }

  // Funciones de edición de etiqueta
  const startLabelEditing = (index: number) => {
    setEditingLabelIndex(index)
    setTempLabel(intermediateCalculations[index].label || "")
  }

  const finishLabelEditing = () => {
    if (editingLabelIndex !== null) {
      const newCalcs = [...intermediateCalculations]
      newCalcs[editingLabelIndex].label = tempLabel
      setIntermediateCalculations(newCalcs)
    }

    setEditingLabelIndex(null)
    setTempLabel("")
  }

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      finishLabelEditing()
    } else if (e.key === "Escape") {
      setEditingLabelIndex(null)
      setTempLabel("")
    }
  }

  // Funciones de edición de tooltip
  const startTooltipEditing = (index: number) => {
    setEditingTooltipIndex(index)
    setTempTooltipText(intermediateCalculations[index].tooltipText || "")
  }

  const finishTooltipEditing = () => {
    if (editingTooltipIndex !== null) {
      const newCalcs = [...intermediateCalculations]
      newCalcs[editingTooltipIndex].tooltipText = tempTooltipText
      setIntermediateCalculations(newCalcs)
    }

    setEditingTooltipIndex(null)
    setTempTooltipText("")
  }

  const handleTooltipKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      finishTooltipEditing()
    } else if (e.key === "Escape") {
      setEditingTooltipIndex(null)
      setTempTooltipText("")
    }
  }

  // Guardar los datos
  const handleSave = () => {
    if (onSave) {
      onSave({
        grades,
        columnTitles,
        intermediateCalculations,
        textBoxes,
        finalGrade: "",
      })
    }
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Sección 1: Tabla de Notas centrada - versión compacta */}
      <div className="mb-4">
        <div className="flex justify-center">
          <div className="flex gap-2" id="grades-container">
            {Object.keys(grades).map((col) => {
              const columnRows = getColumnRowNumbers(col)

              return (
                <div key={col} className="flex flex-col items-center">
                  {/* Botón de eliminar columna - más pequeño */}
                  <div className="h-6 flex items-center justify-center mb-1">
                    {canDeleteColumn(col) && (
                      <button
                        onClick={() => removeColumn(col)}
                        className="text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border border-red-200 dark:border-red-800 opacity-0 hover:opacity-100 transition-all duration-200"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    )}
                  </div>

                  {/* Header de columna - más pequeño */}
                  <div className="mb-2">
                    <div
                      className="h-6 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md px-1"
                      style={{ width: `${COLUMN_WIDTH}px` }}
                    >
                      {col}
                    </div>
                  </div>

                  {/* Título de columna - más pequeño */}
                  <div className="mb-1">
                    <Input
                      type="text"
                      value={columnTitles[col] || ""}
                      onChange={(e) => updateColumnTitle(col, e.target.value)}
                      className="h-8 text-center text-xs border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 px-1"
                      style={{ width: `${COLUMN_WIDTH}px` }}
                      placeholder="Título"
                      maxLength={15}
                    />
                  </div>

                  {/* Celdas de la columna - más compactas */}
                  <div className="flex flex-col gap-1">
                    {columnRows.map((rowNumber) => (
                      <div key={`${col}-${rowNumber}`} className="relative flex items-center gap-1 group">
                        {/* Número de fila - más pequeño */}
                        <div
                          className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
                          style={{ width: "20px" }}
                        >
                          {rowNumber}
                        </div>

                        {/* Celda de datos - más pequeña */}
                        <div className="relative flex items-center">
                          <Input
                            type="text"
                            value={grades[col][rowNumber] || ""}
                            onChange={(e) => updateCellValue(col, rowNumber, e.target.value)}
                            className="h-8 text-center border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 px-1"
                            style={{ width: `${COLUMN_WIDTH - 25}px` }}
                            placeholder="0"
                          />
                          {canDeleteRow(col, rowNumber) && (
                            <button
                              onClick={() => removeRowFromColumn(col, rowNumber)}
                              className="absolute -right-1 -top-1 text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border border-red-200 dark:border-red-800 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Botón para añadir fila - más pequeño */}
                    <div className="flex items-center gap-1">
                      <div className="h-8 flex items-center justify-center" style={{ width: "20px" }}>
                        {/* Espacio vacío */}
                      </div>
                      <button
                        onClick={() => addRowToColumn(col)}
                        className="h-8 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md transition-colors hover:border-gray-500 dark:hover:border-gray-400 flex items-center justify-center"
                        style={{ width: `${COLUMN_WIDTH - 25}px` }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Botón para añadir columna - más pequeño */}
            <div className="flex flex-col items-center">
              <div className="h-6 mb-1"></div>
              <button
                onClick={addColumn}
                className="h-6 w-12 mb-2 flex items-center justify-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md transition-colors hover:border-gray-500 dark:hover:border-gray-400"
              >
                <Plus className="h-3 w-3" />
              </button>
              <div className="h-8 w-12 mb-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Separador más pequeño */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        <div className="mx-2 bg-transparent p-0.5">
          <img
            src="/images/university-coat-of-arms.svg"
            alt="Escudo Universitario"
            className="h-10 w-10 text-gray-500 dark:text-gray-400"
          />
        </div>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* Contenedor dividido - más compacto */}
      <div className="flex mb-4 relative">
        {/* Mitad izquierda - Cálculos Intermedios */}
        <div className="w-1/2 flex justify-center pr-3">
          <div className="flex flex-col items-center">
            {intermediateCalculations.map((calc, index) => (
              <div key={index} className="relative flex items-center gap-2 h-8 mb-1 group">
                {/* Globo de información */}
                <div className="relative">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => startTooltipEditing(index)}
                        >
                          <Info className="h-3 w-3 stroke-2" />
                        </button>
                      </TooltipTrigger>
                      {editingTooltipIndex !== index && (
                        <TooltipContent>
                          <p className="text-xs">{calc.tooltipText || "Click para añadir descripción"}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {editingTooltipIndex === index && (
                    <div className="absolute bottom-full left-0 mb-1 z-50">
                      <input
                        type="text"
                        value={tempTooltipText}
                        onChange={(e) => setTempTooltipText(e.target.value)}
                        onBlur={finishTooltipEditing}
                        onKeyDown={handleTooltipKeyDown}
                        className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none px-2 py-0.5 rounded-md"
                        style={{ minWidth: "150px" }}
                        placeholder="Ej: Promedio Certámenes"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden h-8">
                  {/* Casilla izquierda - más pequeña */}
                  <div
                    className="w-12 flex items-center justify-center border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-pointer rounded-l-md"
                    onClick={() => startLabelEditing(index)}
                  >
                    {editingLabelIndex === index ? (
                      <Input
                        type="text"
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        onBlur={finishLabelEditing}
                        onKeyDown={handleLabelKeyDown}
                        className="h-6 text-xs"
                        placeholder="PC"
                        maxLength={8}
                        autoFocus
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{calc.label}</span>
                    )}
                  </div>

                  {/* Casilla derecha - más pequeña */}
                  <div
                    className="w-12 flex items-center justify-center bg-white dark:bg-gray-700 cursor-pointer"
                    onClick={() => startFormulaEditing(index)}
                  >
                    <span className="text-xs text-gray-700 dark:text-gray-200">{calc.value || "0"}</span>
                  </div>
                </div>

                {/* Botón para eliminar - más pequeño */}
                <button
                  onClick={() => {
                    const newCalcs = intermediateCalculations.filter((_, i) => i !== index)
                    setIntermediateCalculations(newCalcs)
                  }}
                  className="text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border border-red-200 dark:border-red-800 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="h-2 w-2" />
                </button>

                {/* Casilla de edición de fórmula - ajustada */}
                {editingIndex === index && (
                  <div className="absolute left-0 top-0 z-50">
                    <Input
                      ref={formulaInputRef}
                      type="text"
                      value={tempFormula}
                      onChange={(e) => setTempFormula(e.target.value)}
                      onBlur={finishFormulaEditing}
                      onKeyDown={handleFormulaKeyDown}
                      className="h-8 text-xs border-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 px-2 shadow-lg bg-white"
                      style={{ width: "200px", marginLeft: "120px" }}
                      placeholder="Ingresar formula.."
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Botón para añadir cálculo - más pequeño */}
            <div className="relative flex items-center gap-2 h-8 mb-1">
              <button
                onClick={addIntermediateCalculation}
                className="h-8 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md transition-colors hover:border-gray-500 dark:hover:border-gray-400 flex items-center justify-center"
                style={{ width: "100px" }}
              >
                <span className="flex items-center">
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="text-xs">Cálculo</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Línea separadora vertical */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2"></div>

        {/* Mitad derecha - Casillas de texto */}
        <div className="w-1/2 pl-3">
          <div className="flex flex-col items-center">
            {textBoxes.map((textBox, index) => (
              <div key={index} className="relative flex items-center gap-1 h-8 mb-1 group w-full">
                {/* Botón de bandera - más pequeño */}
                <div className="relative">
                  <button
                    onClick={() => setOpenColorSelector(openColorSelector === index ? null : index)}
                    className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                  </button>

                  {/* Selector de colores - más pequeño */}
                  {openColorSelector === index && (
                    <div className="absolute top-6 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-1">
                      <div className="flex gap-1">
                        {["gray", "red", "yellow", "blue"].map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              updateTextBoxColor(index, color)
                              setOpenColorSelector(null)
                            }}
                            className={`w-4 h-4 rounded-full border hover:scale-110 transition-transform ${
                              color === "gray"
                                ? "border-gray-400 bg-gray-100"
                                : color === "red"
                                  ? "border-red-400 bg-red-100"
                                  : color === "yellow"
                                    ? "border-yellow-400 bg-yellow-100"
                                    : "border-blue-400 bg-blue-100"
                            } ${textBox.borderColor === color ? "ring-1 ring-offset-1 ring-gray-400" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Casilla de texto - más pequeña */}
                <Input
                  type="text"
                  value={textBox.content}
                  onChange={(e) => updateTextBoxContent(index, e.target.value)}
                  className={`h-8 text-xs rounded-md focus:ring-1 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 px-2 flex-1 ${
                    textBox.borderColor === "gray"
                      ? "border-gray-300 dark:border-gray-600"
                      : textBox.borderColor === "red"
                        ? "border-red-400 dark:border-red-500"
                        : textBox.borderColor === "yellow"
                          ? "border-yellow-400 dark:border-yellow-500"
                          : "border-blue-400 dark:border-blue-500"
                  }`}
                  placeholder="Escribir texto..."
                />

                {/* Botón para eliminar - más pequeño */}
                <button
                  onClick={() => removeTextBox(index)}
                  className="text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm border border-red-200 dark:border-red-800 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            ))}

            {/* Botón para añadir nueva casilla - más pequeño */}
            <button
              onClick={addTextBox}
              className="h-8 w-32 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md transition-colors hover:border-gray-500 dark:hover:border-gray-400 flex items-center justify-center"
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="text-xs">Recordatorio</span>
            </button>
          </div>
        </div>
      </div>

      {/* NUEVA SECCIÓN: Casilla numérica centrada */}
      <div className="flex flex-col items-center mb-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nota Final</div>
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden h-8 w-16 bg-white dark:bg-gray-700">
          <Input
            type="number"
            placeholder="0.0"
            className="h-full text-center text-sm border-0 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="1.0"
            max="7.0"
            step="0.1"
          />
        </div>
      </div>
    </div>
  )
}
