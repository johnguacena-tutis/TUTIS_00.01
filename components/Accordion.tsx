'use client'

import { useRef, useEffect, useState } from 'react'

export default function Accordion({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    if (!open) { setHeight(0); return }

    // Use ResizeObserver so height updates whenever inner content changes
    const observer = new ResizeObserver(() => {
      if (ref.current) setHeight(ref.current.scrollHeight)
    })
    observer.observe(ref.current)
    setHeight(ref.current.scrollHeight)

    return () => observer.disconnect()
  }, [open])

  return (
    <div
      style={{
        height: `${height}px`,
        overflow: 'hidden',
        transition: 'height 0.25s ease',
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  )
}
