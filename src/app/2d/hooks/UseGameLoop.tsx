import { useEffect, useRef } from 'react'

export default function useGameLoop(callback: () => void) {
  const requestRef = useRef<number>(null)

  const animate = () => {
    callback()
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])
}
