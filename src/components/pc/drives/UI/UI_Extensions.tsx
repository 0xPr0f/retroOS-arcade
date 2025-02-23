import React, { useRef, useEffect, useState, ReactNode } from 'react'

interface AutoGridProps {
  children: ReactNode
  minItemWidth?: number
  gap?: number
  className?: string
}

export const AutoGrid: React.FC<AutoGridProps> = ({
  children,
  minItemWidth = 250,
  gap = 16,
  className = '',
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(1)

  useEffect(() => {
    if (!gridRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        const newColumns = Math.floor(width / (minItemWidth + gap))
        if (newColumns > 0 && newColumns !== columns) {
          setColumns(newColumns)
        }
      }
    })

    resizeObserver.observe(gridRef.current)
    return () => resizeObserver.disconnect()
  }, [minItemWidth, gap, columns])

  return (
    <div
      ref={gridRef}
      style={{
        display: 'grid',
        gap: `${gap}px`,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: 'minmax(200px, auto)',
        gridAutoFlow: 'dense',
      }}
      className={className}
    >
      {children}
    </div>
  )
}

interface GridItemProps {
  children: ReactNode
  className?: string
  colspan?: number
  rowspan?: number
  onClick?: () => void
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  className = '',
  colspan = 1,
  rowspan = 1,
  onClick = () => {},
}) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])
  if (loading) {
    return <div className="static-placeholder"></div>
  }
  return (
    <div
      onClick={onClick}
      style={{
        gridColumn: `span ${colspan}`,
        gridRow: `span ${rowspan}`,
      }}
      className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 
                  rounded-lg border border-gray-700/50 shadow-xl 
                  overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}
