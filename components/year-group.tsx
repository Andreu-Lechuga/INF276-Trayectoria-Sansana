import type React from "react"
import type { Column as ColumnType } from "@/types/kanban"

interface YearGroupProps {
  year: number
  columns: ColumnType[]
  children: React.ReactNode
}

export default function YearGroup({ year, columns, children }: YearGroupProps) {
  return (
    <div className="flex flex-col shrink-0">
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-t-md mb-2 px-4 py-2 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Año {year}</h2>
      </div>
      <div className="flex gap-4">{children}</div>
    </div>
  )
}
