"use client"

import * as React from "react"

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`relative overflow-auto ${className || ""}`} {...props}>
      {children}
    </div>
  ),
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`absolute right-0 top-0 h-full w-2 bg-transparent ${className || ""}`} {...props} />
  ),
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
