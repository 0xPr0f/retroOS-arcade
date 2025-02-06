'use client'
import { useEffect, useRef, useState } from 'react'
import { GameState, Vector2 } from '../types'
import useGameLoop from '../hooks/UseGameLoop'

const INITIAL_STATE: GameState = {
  player: {
    position: { x: 400, y: 300 },
    rotation: 0,
    health: 100,
    speed: 5,
  },
  enemies: [],
  bullets: [],
  score: 0,
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [mousePos, setMousePos] = useState<Vector2>({ x: 0, y: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => new Set(prev).add(e.key))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key)
        return newKeys
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useGameLoop(() => {
    updateGame()
    renderGame()
  })

  const updateGame = () => {
    setGameState((prev: any) => {
      const newState = { ...prev }

      // Update player position based on input
      const moveX = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0)
      const moveY = (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0)

      if (moveX !== 0 || moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY)
        newState.player.position.x += (moveX / length) * newState.player.speed
        newState.player.position.y += (moveY / length) * newState.player.speed
      }

      // Update player rotation based on mouse position
      const dx = mousePos.x - newState.player.position.x
      const dy = mousePos.y - newState.player.position.y
      newState.player.rotation = Math.atan2(dy, dx)

      // Update enemies
      if (Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2
        const distance = 500
        newState.enemies.push({
          id: Math.random().toString(),
          position: {
            x: newState.player.position.x + Math.cos(angle) * distance,
            y: newState.player.position.y + Math.sin(angle) * distance,
          },
          rotation: 0,
          health: 100,
          speed: 2,
        })
      }

      // Update enemy positions and rotations
      newState.enemies = newState.enemies.map((enemy: any) => {
        const dx = newState.player.position.x - enemy.position.x
        const dy = newState.player.position.y - enemy.position.y
        const angle = Math.atan2(dy, dx)

        return {
          ...enemy,
          position: {
            x: enemy.position.x + Math.cos(angle) * enemy.speed,
            y: enemy.position.y + Math.sin(angle) * enemy.speed,
          },
          rotation: angle,
        }
      })

      // Update bullets
      newState.bullets = newState.bullets
        .map((bullet: any) => ({
          ...bullet,
          position: {
            x: bullet.position.x + bullet.velocity.x,
            y: bullet.position.y + bullet.velocity.y,
          },
        }))
        .filter((bullet: any) => {
          // Remove bullets that are too far from player
          const dx = bullet.position.x - newState.player.position.x
          const dy = bullet.position.y - newState.player.position.y
          return Math.sqrt(dx * dx + dy * dy) < 1000
        })

      // Check bullet collisions with enemies
      newState.enemies = newState.enemies.filter((enemy: any) => {
        let isAlive = true
        newState.bullets = newState.bullets.filter((bullet: any) => {
          const dx = bullet.position.x - enemy.position.x
          const dy = bullet.position.y - enemy.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 20) {
            isAlive = false
            return false
          }
          return true
        })
        return isAlive
      })

      return newState
    })
  }

  const renderGame = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw player
    ctx.save()
    ctx.translate(gameState.player.position.x, gameState.player.position.y)
    ctx.rotate(gameState.player.rotation)
    ctx.fillStyle = '#4ade80'
    ctx.beginPath()
    ctx.moveTo(20, 0)
    ctx.lineTo(-10, -10)
    ctx.lineTo(-10, 10)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Draw enemies
    gameState.enemies.forEach((enemy: any) => {
      ctx.save()
      ctx.translate(enemy.position.x, enemy.position.y)
      ctx.rotate(enemy.rotation)
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(15, 0)
      ctx.lineTo(-7.5, -7.5)
      ctx.lineTo(-7.5, 7.5)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    })

    // Draw bullets
    ctx.fillStyle = '#fde047'
    gameState.bullets.forEach((bullet: any) => {
      ctx.beginPath()
      ctx.arc(bullet.position.x, bullet.position.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-gray-700 rounded-lg"
      onClick={() => {
        // Shoot on click
        setGameState((prev: any) => ({
          ...prev,
          bullets: [
            ...prev.bullets,
            {
              id: Math.random().toString(),
              position: { ...prev.player.position },
              velocity: {
                x: Math.cos(prev.player.rotation) * 10,
                y: Math.sin(prev.player.rotation) * 10,
              },
              damage: 10,
            },
          ],
        }))
      }}
    />
  )
}
