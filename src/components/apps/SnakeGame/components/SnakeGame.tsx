import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  GameType,
  useGameScores,
  usePregenSession,
} from '@/components/pc/drives'
import { useAccount } from 'wagmi'
const GRID_SIZE = 20
const CELL_SIZE = 20
const BASE_SPEED = 200
const MIN_SPEED = 50
const SPEED_DECREASE_PER_FOOD = 5
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }

const AuraEffect = ({
  children,
  type = 'blue',
}: {
  children: React.ReactNode
  type?: 'blue' | 'purple' | 'green' | 'red'
}) => {
  return (
    <div className="relative">
      <div
        className="absolute -inset-1 rounded-lg bg-gradient-to-r blur-sm animate-pulse"
        style={{
          backgroundImage: `linear-gradient(to right, ${
            type === 'blue'
              ? '#3b82f620, #1d4ed820'
              : type === 'purple'
              ? '#8b5cf620, #6d28d920'
              : type === 'green'
              ? '#10b98120, #04785720'
              : '#ef444420, #b9190520'
          })`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [direction, setDirection] = useState<{ x: number; y: number }>(
    INITIAL_DIRECTION
  )
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [foodEaten, setFoodEaten] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showMobileControls, setShowMobileControls] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('snakeHighScore')
      return saved ? parseInt(saved) : 0
    }
    return 0
  })
  const { submitScore } = useGameScores()
  const directionRef = useRef(INITIAL_DIRECTION)
  const { isLoginPregenSession, pregenActiveAddress } = usePregenSession()
  const { isConnected, address: playerAddress } = useAccount()
  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  // Track game stats
  const [gameStats, setGameStats] = useState({
    timePlayed: 0,
    gamesPlayed: 0,
    foodEaten: 0,
  })

  // Timer for game duration
  const [gameTime, setGameTime] = useState(0)
  const gameTimeRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
    if (isGameOver || !isStarted || isPaused) return

    const currentDirection = directionRef.current
    const head = {
      x: snake[0].x + currentDirection.x,
      y: snake[0].y + currentDirection.y,
    }

    if (checkCollision(head)) {
      setIsGameOver(true)
      if (foodEaten > 0) {
        submitScore(address, foodEaten, GameType.SNAKE)
      }
      // Update high score if needed
      if (foodEaten > highScore) {
        setHighScore(foodEaten)
        if (typeof window !== 'undefined') {
          localStorage.setItem('snakeHighScore', String(foodEaten))
        }
      }

      // Update stats
      setGameStats((prev) => ({
        timePlayed: prev.timePlayed + gameTimeRef.current,
        gamesPlayed: prev.gamesPlayed + 1,
        foodEaten: prev.foodEaten + foodEaten,
      }))

      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

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
  }, [
    snake,
    food,
    isGameOver,
    isStarted,
    isPaused,
    checkCollision,
    generateFood,
    foodEaten,
    highScore,
  ])

  useEffect(() => {
    if (!isStarted || isGameOver || isPaused) return

    const speed = Math.max(
      MIN_SPEED,
      BASE_SPEED - foodEaten * SPEED_DECREASE_PER_FOOD
    )
    const intervalId = setInterval(gameLoop, speed)

    return () => clearInterval(intervalId)
  }, [isStarted, isGameOver, isPaused, foodEaten, gameLoop])

  // Timer effect
  useEffect(() => {
    if (isStarted && !isGameOver && !isPaused) {
      timerRef.current = setInterval(() => {
        gameTimeRef.current += 1
        setGameTime((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isStarted, isGameOver, isPaused])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'p') {
        if (isStarted && !isGameOver) {
          setIsPaused((prev) => !prev)
          return
        }
      }

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
        timerRef.current = setInterval(() => {
          gameTimeRef.current += 1
          setGameTime((prev) => prev + 1)
        }, 1000)
      } else if (isPaused) {
        setIsPaused(false)
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
    [isStarted, isGameOver, isPaused]
  )

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setFood({ x: 15, y: 15 })
    setFoodEaten(0)
    setIsGameOver(false)
    setIsStarted(false)
    setIsPaused(false)
    setGameTime(0)
    gameTimeRef.current = 0
  }, [])

  // Format time function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

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

  // Mobile controls
  const handleTouchControl = (direction: { x: number; y: number }) => {
    if (!isStarted && !isGameOver) {
      setIsStarted(true)
      timerRef.current = setInterval(() => {
        gameTimeRef.current += 1
        setGameTime((prev) => prev + 1)
      }, 1000)
    } else if (isPaused) {
      setIsPaused(false)
    }

    // Prevent 180-degree turns
    const currentDirection = directionRef.current
    if (
      currentDirection.x !== -direction.x &&
      currentDirection.y !== -direction.y
    ) {
      setDirection(direction)
      directionRef.current = direction
    }
  }

  return (
    <div className="min-h-full bg-gray-900 text-white px-4 pt-4">
      <div className="max-w-lg mx-auto">
        {/*} For simplicity
        <div className="mb-6 flex justify-end items-center">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-gray-800 rounded-lg text-sm">
              High Score: {highScore}
            </div>

            <button
              onClick={resetGame}
              className="px-2 py-1 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
*/}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          {/* Game stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 text-center">
              <div className="text-xs text-gray-400 uppercase">Score</div>
              <div className="text-xl font-bold text-green-400">
                {foodEaten}
              </div>
            </div>

            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 text-center">
              <div className="text-xs text-gray-400 uppercase">Speed</div>
              <div className="text-xl font-bold text-blue-400">
                {speedMultiplier}x
              </div>
            </div>

            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 text-center">
              <div className="text-xs text-gray-400 uppercase">Time</div>
              <div className="text-xl font-bold text-purple-400">
                {formatTime(gameTime)}
              </div>
            </div>
          </div>

          {/* Game board */}
          <div className="relative mb-6 mx-auto">
            <AuraEffect
              type={isGameOver ? 'red' : isStarted ? 'green' : 'blue'}
            >
              <div
                className="relative border-2 border-gray-700 rounded-lg bg-gray-900 overflow-hidden mx-auto"
                style={{
                  width: GRID_SIZE * CELL_SIZE,
                  height: GRID_SIZE * CELL_SIZE,
                }}
              >
                {/* Grid background */}
                <div className="absolute inset-0">
                  {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex">
                      {Array.from({ length: GRID_SIZE }).map((_, colIndex) => (
                        <div
                          key={`cell-${rowIndex}-${colIndex}`}
                          className="border border-gray-800/20"
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Snake */}
                {snake.map((segment, index) => (
                  <div
                    key={`${segment.x}-${segment.y}-${index}`}
                    className={`absolute ${
                      index === 0
                        ? 'bg-gradient-to-br from-green-400 to-green-500'
                        : index % 3 === 0
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-green-600 to-green-700'
                    } shadow-lg`}
                    style={{
                      width: CELL_SIZE - 2,
                      height: CELL_SIZE - 2,
                      left: segment.x * CELL_SIZE + 1,
                      top: segment.y * CELL_SIZE + 1,
                      borderRadius: index === 0 ? '4px' : '2px',
                      transition: 'all 0.05s ease-in-out',
                    }}
                  />
                ))}

                {/* Food */}
                <div
                  className="absolute bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-md animate-pulse"
                  style={{
                    width: CELL_SIZE - 6,
                    height: CELL_SIZE - 6,
                    left: food.x * CELL_SIZE + 3,
                    top: food.y * CELL_SIZE + 3,
                  }}
                />

                {/* Game overlays */}
                {(isGameOver || !isStarted || isPaused) && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex flex-col items-center justify-center">
                    {isGameOver ? (
                      <>
                        <p className="text-red-500 text-2xl font-bold mb-2">
                          Game Over!
                        </p>
                        <p className="text-white mb-4">
                          Final Score: {foodEaten}
                        </p>
                        {foodEaten > highScore && (
                          <p className="text-yellow-400 font-bold mb-4">
                            New High Score!
                          </p>
                        )}
                        <button
                          onClick={resetGame}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors font-bold shadow-lg"
                        >
                          Play Again
                        </button>
                      </>
                    ) : isPaused ? (
                      <>
                        <p className="text-blue-400 text-2xl font-bold mb-2">
                          Paused
                        </p>
                        <p className="text-white mb-4">
                          Press 'P' or ESC to resume
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setIsPaused(false)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-bold shadow-lg"
                          >
                            Resume
                          </button>
                          <button
                            onClick={resetGame}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-colors font-bold shadow-lg"
                          >
                            Restart
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-white text-2xl font-bold mb-4">
                          Snake Game
                        </p>
                        <p className="text-gray-300 mb-6 text-center max-w-xs">
                          Use arrow keys or WASD to start.
                          <br />
                          Press P or ESC to pause.
                        </p>
                        <button
                          onClick={() => {
                            setIsStarted(true)
                            timerRef.current = setInterval(() => {
                              gameTimeRef.current += 1
                              setGameTime((prev) => prev + 1)
                            }, 1000)
                          }}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-bold shadow-lg"
                        >
                          Start Game
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </AuraEffect>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <label className="inline-flex items-center cursor-pointer">
              <span className="mr-2 text-sm font-medium text-gray-300">
                Controls
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showMobileControls}
                  onChange={() => setShowMobileControls(!showMobileControls)}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-sm text-gray-300 hover:text-white"
            >
              {showInstructions ? 'Hide Rules' : 'Show Rules'}
            </button>

            {/*} <button
              onClick={() => setShowStats(!showStats)}
              className="text-sm text-gray-300 hover:text-white"
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button> */}
          </div>

          {/* Mobile controls */}
          {showMobileControls && (
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6 transition-all duration-300 ease-in-out">
              <div className=""></div>
              <button
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center border border-gray-700 transition-colors"
                onClick={() => handleTouchControl({ x: 0, y: -1 })}
              >
                <span className="text-2xl">⬆️</span>
              </button>
              <div className=""></div>

              <button
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center border border-gray-700 transition-colors"
                onClick={() => handleTouchControl({ x: -1, y: 0 })}
              >
                <span className="text-2xl">⬅️</span>
              </button>
              <button
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center border border-gray-700 transition-colors"
                onClick={() => handleTouchControl({ x: 0, y: 1 })}
              >
                <span className="text-2xl">⬇️</span>
              </button>
              <button
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center border border-gray-700 transition-colors"
                onClick={() => handleTouchControl({ x: 1, y: 0 })}
              >
                <span className="text-2xl">➡️</span>
              </button>
            </div>
          )}

          {/* Game Instructions - Collapsible */}
          {showInstructions && (
            <div className="mt-4 text-gray-400 text-sm bg-gray-800/30 p-3 rounded-lg border border-gray-700/30 transition-all duration-300">
              <h3 className="text-gray-300 font-medium mb-2">How to Play:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use <span className="text-white">arrow keys</span> or{' '}
                  <span className="text-white">WASD</span> to control the snake
                </li>
                <li>
                  Eat the <span className="text-red-400">red food</span> to grow
                  longer and earn points
                </li>
                <li>Avoid hitting the walls or yourself</li>
                <li>
                  Press <span className="text-white">P</span> or{' '}
                  <span className="text-white">ESC</span> to pause the game
                </li>
                <li>The snake speeds up as you eat more food</li>
              </ul>
            </div>
          )}
        </div>

        {/* Game Stats - Collapsible */}
        {/*} {showStats && (
          <div className="mt-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30 shadow-lg transition-all duration-300">
            <h3 className="text-lg font-medium text-gray-300 mb-3">
              Game Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-700/20">
                <div className="text-xs text-gray-400">Games Played</div>
                <div className="font-bold">{gameStats.gamesPlayed}</div>
              </div>
              <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-700/20">
                <div className="text-xs text-gray-400">Total Score</div>
                <div className="font-bold">{gameStats.foodEaten}</div>
              </div>
              <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-700/20">
                <div className="text-xs text-gray-400">Time Played</div>
                <div className="font-bold">
                  {formatTime(gameStats.timePlayed)}
                </div>
              </div>
            </div>
          </div>
        )}*/}
      </div>
    </div>
  )
}

export default SnakeGame
