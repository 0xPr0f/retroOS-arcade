import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const GRID_SIZE = 20
const CELL_SIZE = 20
const BASE_SPEED = 200
const MIN_SPEED = 50
const SPEED_DECREASE_PER_FOOD = 5
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [direction, setDirection] = useState<{ x: number; y: number }>(
    INITIAL_DIRECTION
  )
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [foodEaten, setFoodEaten] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const directionRef = useRef(INITIAL_DIRECTION)

  const generateFood = useCallback(() => {
    let newFood: { x: number; y: number }
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    )
    return newFood
  }, [snake])

  const checkCollision = useCallback(
    (head: { x: number; y: number }) => {
      return (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE ||
        snake
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      )
    },
    [snake]
  )

  const gameLoop = useCallback(() => {
    if (isGameOver || !isStarted) return

    const currentDirection = directionRef.current
    const head = {
      x: snake[0].x + currentDirection.x,
      y: snake[0].y + currentDirection.y,
    }

    if (checkCollision(head)) {
      setIsGameOver(true)
      return
    }

    const newSnake = [head, ...snake]

    if (head.x === food.x && head.y === food.y) {
      setFood(generateFood())
      setFoodEaten((prev) => prev + 1)
    } else {
      newSnake.pop()
    }

    setSnake(newSnake)
  }, [snake, food, isGameOver, isStarted, checkCollision, generateFood])

  useEffect(() => {
    if (!isStarted || isGameOver) return

    const speed = Math.max(
      MIN_SPEED,
      BASE_SPEED - foodEaten * SPEED_DECREASE_PER_FOOD
    )
    const intervalId = setInterval(gameLoop, speed)

    return () => clearInterval(intervalId)
  }, [isStarted, isGameOver, foodEaten, gameLoop])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const keyDirections = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      }

      const newDirection =
        keyDirections[event.key as keyof typeof keyDirections]
      if (!newDirection) return

      if (!isStarted && !isGameOver) {
        setIsStarted(true)
      }

      // Prevent 180-degree turns
      const currentDirection = directionRef.current
      if (
        currentDirection.x !== -newDirection.x &&
        currentDirection.y !== -newDirection.y
      ) {
        setDirection(newDirection)
        directionRef.current = newDirection
      }
    },
    [isStarted, isGameOver]
  )

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setFood({ x: 15, y: 15 })
    setFoodEaten(0)
    setIsGameOver(false)
    setIsStarted(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const speedMultiplier = Math.round(
    BASE_SPEED /
      Math.max(MIN_SPEED, BASE_SPEED - foodEaten * SPEED_DECREASE_PER_FOOD)
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent>
        <div className="flex justify-between items-center mt-3 mb-4 px-4">
          <div className="text-lg font-bold">Score: {foodEaten}</div>
          <div>
            <div className="text-sm text-gray-500">
              Controls: Arrow keys or WASD
            </div>
            <div className="text-sm text-right">Speed: {speedMultiplier}x</div>
          </div>
        </div>
        <div
          className="relative border-4 border-gray-800 bg-black"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`absolute ${
                index === 0 ? 'bg-green-400' : 'bg-green-500'
              }`}
              style={{
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                borderRadius: index === 0 ? '4px' : '0',
              }}
            />
          ))}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
            }}
          />
          {(isGameOver || !isStarted) && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
              {isGameOver ? (
                <>
                  <p className="text-red-500 text-2xl font-bold mb-2">
                    Game Over!
                  </p>
                  <p className="text-white mb-4">Score: {foodEaten}</p>
                  <button
                    onClick={resetGame}
                    className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 font-bold"
                  >
                    Play Again
                  </button>
                </>
              ) : (
                <p className="text-white text-xl">
                  Press any arrow key or WASD to start
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SnakeGame
