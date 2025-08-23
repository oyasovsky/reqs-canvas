'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

interface ResizableLayoutProps {
  children: [React.ReactNode, React.ReactNode, React.ReactNode] // [Sidebar, Canvas, RightPane]
  initialSizes?: [number, number, number] // percentages that sum to 100
  minSizes?: [number, number, number] // minimum percentages
  className?: string
}

export default function ResizableLayout({ 
  children, 
  initialSizes = [25, 50, 25], 
  minSizes = [15, 30, 15],
  className = ''
}: ResizableLayoutProps) {
  const { isCanvasCollapsed } = useAppStore()
  const [sizes, setSizes] = useState(initialSizes)
  const [isDragging, setIsDragging] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef(0)
  const startSizesRef = useRef<[number, number, number]>([0, 0, 0])

  const handleMouseDown = useCallback((dividerIndex: number, e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(dividerIndex)
    startPosRef.current = e.clientX
    startSizesRef.current = [...sizes]
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [sizes])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging === null || !containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const deltaX = e.clientX - startPosRef.current
    const deltaPercent = (deltaX / containerWidth) * 100

    const newSizes: [number, number, number] = [...startSizesRef.current]

    if (isDragging === 0) {
      // Dragging first divider (between sidebar and canvas)
      const newLeftSize = Math.max(minSizes[0], Math.min(80, startSizesRef.current[0] + deltaPercent))
      const newMiddleSize = Math.max(minSizes[1], startSizesRef.current[1] - deltaPercent)
      
      if (newLeftSize >= minSizes[0] && newMiddleSize >= minSizes[1]) {
        newSizes[0] = newLeftSize
        newSizes[1] = newMiddleSize
      }
    } else if (isDragging === 1) {
      // Dragging second divider (between canvas and right pane)
      const newMiddleSize = Math.max(minSizes[1], Math.min(70, startSizesRef.current[1] + deltaPercent))
      const newRightSize = Math.max(minSizes[2], startSizesRef.current[2] - deltaPercent)
      
      if (newMiddleSize >= minSizes[1] && newRightSize >= minSizes[2]) {
        newSizes[1] = newMiddleSize
        newSizes[2] = newRightSize
      }
    }

    setSizes(newSizes)
  }, [isDragging, minSizes])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div 
      ref={containerRef}
      className={`flex h-full ${className}`}
    >
      {/* Sidebar */}
      <div 
        style={{ width: `${sizes[0]}%` }}
        className="flex-shrink-0"
      >
        {children[0]}
      </div>

      {/* First Resize Handle */}
      <div
        className="w-1 bg-gradient-to-b from-blue-200/50 to-indigo-200/50 hover:bg-gradient-to-b hover:from-blue-300/70 hover:to-indigo-300/70 cursor-col-resize transition-all duration-200 flex-shrink-0 group relative"
        onMouseDown={(e) => handleMouseDown(0, e)}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20 transition-colors duration-200" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Canvas */}
      <div 
        style={{ width: `${sizes[1]}%` }}
        className="flex-shrink-0"
      >
        {children[1]}
      </div>

      {/* Second Resize Handle */}
      <div
        className="w-1 bg-gradient-to-b from-blue-200/50 to-indigo-200/50 hover:bg-gradient-to-b hover:from-blue-300/70 hover:to-indigo-300/70 cursor-col-resize transition-all duration-200 flex-shrink-0 group relative"
        onMouseDown={(e) => handleMouseDown(1, e)}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20 transition-colors duration-200" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Right Pane */}
      <div 
        style={{ width: `${sizes[2]}%` }}
        className="flex-shrink-0"
      >
        {children[2]}
      </div>
    </div>
  )
}
