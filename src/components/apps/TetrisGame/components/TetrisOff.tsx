import React, { useState, useEffect, useCallback, useRef } from 'react'

import { Pause, Play } from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/pc/drives/UI/UI_Components.v1'

const BOARD_WIDTH = 12
const BOARD_HEIGHT = 16
const INITIAL_SPEED = 800
const MIN_SPEED = 100
const SPEED_DECREASE_RATE = 50
const PREVIEW_COUNT = 1

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T
  [
    [1, 1, 1],
    [1, 0, 0],
  ], // L
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // J
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z
]

const COLORS = [
  'bg-cyan-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
]

interface Position {
  x: number
  y: number
}

interface GamePiece {
  shape: number[][]
  index: number
}

interface GameState {
  board: number[][]
  currentPiece: number[][] | null
  currentPosition: Position
  currentShapeIndex: number
  gameOver: boolean
  isPaused: boolean
  score: number
}

const TetrisOffChainGame = () => {
  const [board, setBoard] = useState<number[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<number[][] | null>(null)
  const [currentPosition, setCurrentPosition] = useState<Position>({
    x: 0,
    y: 0,
  })
  const [currentShapeIndex, setCurrentShapeIndex] = useState<number>(0)
  const [nextPieces, setNextPieces] = useState<GamePiece[]>([])
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(true) // Start paused

  const gameStateRef = useRef<GameState>({
    board,
    currentPiece,
    currentPosition,
    currentShapeIndex,
    gameOver,
    isPaused,
    score,
  })

  useEffect(() => {
    gameStateRef.current = {
      board,
      currentPiece,
      currentPosition,
      currentShapeIndex,
      gameOver,
      isPaused,
      score,
    }
  }, [
    board,
    currentPiece,
    currentPosition,
    currentShapeIndex,
    gameOver,
    isPaused,
    score,
  ])

  const getGameSpeed = useCallback(() => {
    const speedDecrease = Math.floor(score / 1000) * SPEED_DECREASE_RATE
    return Math.max(MIN_SPEED, INITIAL_SPEED - speedDecrease)
  }, [score])

  const generateNewPieces = useCallback((): GamePiece[] => {
    return Array(PREVIEW_COUNT)
      .fill(null)
      .map(() => ({
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)].map((row) => [
          ...row,
        ]),
        index: Math.floor(Math.random() * SHAPES.length),
      }))
  }, [])

  const isValidMove = useCallback(
    (piece: number[][], position: Position): boolean => {
      if (!piece) return false

      for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
          if (piece[y][x]) {
            const newX = position.x + x
            const newY = position.y + y

            if (
              newX < 0 ||
              newX >= BOARD_WIDTH ||
              newY >= BOARD_HEIGHT ||
              (newY >= 0 && gameStateRef.current.board[newY][newX])
            ) {
              return false
            }
          }
        }
      }
      return true
    },
    []
  )

  const createNewPiece = useCallback(() => {
    if (nextPieces.length < PREVIEW_COUNT) {
      setNextPieces([...nextPieces, ...generateNewPieces()])
      return
    }

    const [nextPiece, ...remainingPieces] = nextPieces
    const newPosition = {
      x: Math.floor((BOARD_WIDTH - nextPiece.shape[0].length) / 2),
      y: 0,
    }

    if (!isValidMove(nextPiece.shape, newPosition)) {
      setGameOver(true)
      return
    }

    setCurrentShapeIndex(nextPiece.index)
    setCurrentPiece(nextPiece.shape)
    setCurrentPosition(newPosition)
    setNextPieces([...remainingPieces, ...generateNewPieces()])
  }, [nextPieces, isValidMove, generateNewPieces])

  const rotatePiece = useCallback(() => {
    if (
      !gameStateRef.current.currentPiece ||
      gameStateRef.current.isPaused ||
      gameStateRef.current.gameOver
    )
      return

    const rotated = gameStateRef.current.currentPiece[0].map(
      (_: number, i: number) =>
        gameStateRef.current.currentPiece!.map((row) => row[row.length - 1 - i])
    )

    if (isValidMove(rotated, gameStateRef.current.currentPosition)) {
      setCurrentPiece(rotated)
    }
  }, [isValidMove])

  const movePiece = useCallback(
    (dx: number, dy: number): boolean => {
      if (
        !gameStateRef.current.currentPiece ||
        gameStateRef.current.gameOver ||
        gameStateRef.current.isPaused
      )
        return false

      const newPosition = {
        x: gameStateRef.current.currentPosition.x + dx,
        y: gameStateRef.current.currentPosition.y + dy,
      }

      if (isValidMove(gameStateRef.current.currentPiece, newPosition)) {
        setCurrentPosition(newPosition)
        return true
      }
      return false
    },
    [isValidMove]
  )

  const mergePiece = useCallback(() => {
    const { currentPiece, currentPosition, currentShapeIndex } =
      gameStateRef.current
    if (!currentPiece) return

    const newBoard = gameStateRef.current.board.map((row) => [...row])

    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          const boardY = currentPosition.y + y
          if (boardY >= 0) {
            newBoard[boardY][currentPosition.x + x] = currentShapeIndex + 1
          }
        }
      }
    }

    let completedLines = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== 0)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        completedLines++
      }
    }

    if (completedLines > 0) {
      setScore((prev) => prev + completedLines * 100)
    }

    setBoard(newBoard)
    setCurrentPiece(null)
  }, [])

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      createNewPiece()
    }
  }, [currentPiece, createNewPiece, gameOver])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current.gameOver) return

      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'arrowright':
        case 'd':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'arrowdown':
        case 's':
          e.preventDefault()
          movePiece(0, 1)
          break
        case 'arrowup':
        case 'w':
          e.preventDefault()
          rotatePiece()
          break
        case ' ':
          e.preventDefault()
          setIsPaused((prev) => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [movePiece, rotatePiece])

  useEffect(() => {
    if (gameOver || isPaused) return

    const gameLoop = setInterval(() => {
      if (!movePiece(0, 1)) {
        mergePiece()
      }
    }, getGameSpeed())

    return () => clearInterval(gameLoop)
  }, [gameOver, isPaused, movePiece, mergePiece, getGameSpeed])

  const resetGame = () => {
    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0))
    )
    setCurrentPiece(null)
    setNextPieces(generateNewPieces())
    setGameOver(false)
    setScore(0)
    setIsPaused(true) // Reset to paused state
  }

  const renderPreview = (piece: GamePiece, index: number) => {
    const previewBoard = Array(4)
      .fill(null)
      .map(() => Array(4).fill(0))
    const shape = piece.shape
    const offsetY = Math.floor((4 - shape.length) / 2)
    const offsetX = Math.floor((4 - shape[0].length) / 2)

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          previewBoard[y + offsetY][x + offsetX] = piece.index + 1
        }
      }
    }

    return (
      <div key={index} className="mb-2">
        {previewBoard.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-4 h-4 border border-gray-300 ${
                  cell ? COLORS[cell - 1] : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    if (currentPiece) {
      for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
          if (currentPiece[y][x]) {
            const boardY = currentPosition.y + y
            if (boardY >= 0) {
              displayBoard[boardY][currentPosition.x + x] =
                currentShapeIndex + 1
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`w-6 h-6 border border-gray-800 ${
              cell ? COLORS[cell - 1] : 'bg-gray-900'
            }`}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2 flex flex-col items-center">
      <Tabs
        defaultValue="offchain"
        className="w-full bg-gray-100 rounded-lg shadow-lg"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="offchain">Off-chain Tetris</TabsTrigger>
          <TabsTrigger value="onchain">On-chain Tetris</TabsTrigger>
        </TabsList>
        <TabsContent value="offchain" className="p-4">
          <div className="flex flex-col items-center">
            <div className="flex justify-between w-full max-w-lg mb-1">
              <div className="text-2xl font-bold text-gray-800">
                Score: {score}
              </div>
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                {isPaused ? <Play size={28} /> : <Pause size={28} />}
              </button>
            </div>
            <div className="flex gap-4">
              <div className="border-2 border-gray-800 bg-gray-900 p-2 rounded-lg shadow-xl relative">
                {renderBoard()}
                {(gameOver || isPaused) && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-3xl font-bold text-white">
                      {gameOver ? 'Game Over!' : 'Paused'}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-3 text-gray-800">
                    Next Piece:
                  </h3>
                  <div className="bg-white p-3 rounded-lg">
                    {nextPieces.map((piece, index) =>
                      renderPreview(piece, index)
                    )}
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
                >
                  {gameOver ? 'New Game' : 'Reset'}
                </button>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-600 bg-gray-200 p-3 rounded-lg">
              Controls: Arrow keys or WASD to move/rotate • Space to pause
            </div>
          </div>
        </TabsContent>
        <TabsContent value="onchain" className="p-4">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">On-chain Tetris coming soon!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TetrisOffChainGame
