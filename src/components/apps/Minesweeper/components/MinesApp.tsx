import { useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'

const MinesweeperApp = () => {
  const GRID_SIZE = 10
  const NUM_BOMBS = 10

  const [grid, setGrid] = useState<number[][]>([])
  const [revealed, setRevealed] = useState<boolean[][]>([])
  const [flags, setFlags] = useState<boolean[][]>([])
  const [time, setTime] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isInputEnabled, setIsInputEnabled] = useState(true)
  const [flagsPlaced, setFlagsPlaced] = useState(0)

  useEffect(() => {
    resetGame()
  }, [])

  useInterval(() => {
    if (hasStarted && !gameOver && !gameWon) {
      setTime((prevTime) => prevTime + 1)
    }
  }, 1000)

  // Format time function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const checkWinCondition = useCallback(() => {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x] !== -1 && !revealed[y][x]) {
          return false
        }
      }
    }
    return true
  }, [grid, revealed])

  const resetGame = () => {
    // Create a new grid filled with zeros
    const newGrid = Array(GRID_SIZE)
      .fill(0)
      .map(() => Array(GRID_SIZE).fill(0))
    const newRevealed = Array(GRID_SIZE)
      .fill(false)
      .map(() => Array(GRID_SIZE).fill(false))
    const newFlags = Array(GRID_SIZE)
      .fill(false)
      .map(() => Array(GRID_SIZE).fill(false))

    let bombsPlaced = 0
    while (bombsPlaced < NUM_BOMBS) {
      const x = Math.floor(Math.random() * GRID_SIZE)
      const y = Math.floor(Math.random() * GRID_SIZE)
      if (newGrid[y][x] !== -1) {
        newGrid[y][x] = -1 // -1 represents a bomb
        bombsPlaced++
      }
    }

    // Count bombs around each cell
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (newGrid[y][x] !== -1) {
          let count = 0
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx,
                ny = y + dy
              if (
                nx >= 0 &&
                nx < GRID_SIZE &&
                ny >= 0 &&
                ny < GRID_SIZE &&
                newGrid[ny][nx] === -1
              ) {
                count++
              }
            }
          }
          newGrid[y][x] = count
        }
      }
    }
    setGrid(newGrid)
    setRevealed(newRevealed)
    setFlags(newFlags)
    setTime(0)
    setGameOver(false)
    setGameWon(false)
    setHasStarted(false)
    setIsInputEnabled(true)
    setFlagsPlaced(0)
  }

  // Reveal cells
  const revealCell = useCallback(
    (x: number, y: number) => {
      if (
        x < 0 ||
        x >= GRID_SIZE ||
        y < 0 ||
        y >= GRID_SIZE ||
        revealed[y][x] ||
        flags[y][x] ||
        !isInputEnabled
      ) {
        return
      }

      const newRevealed = [...revealed]
      newRevealed[y][x] = true
      setRevealed(newRevealed)

      if (grid[y][x] === -1) {
        setGameOver(true)
        setIsInputEnabled(false)
        // Reveal all bombs
        for (let yy = 0; yy < GRID_SIZE; yy++) {
          for (let xx = 0; xx < GRID_SIZE; xx++) {
            if (grid[yy][xx] === -1) {
              newRevealed[yy][xx] = true
            }
          }
        }
        setRevealed(newRevealed)
      } else if (grid[y][x] === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            revealCell(x + dx, y + dy)
          }
        }
      }

      // Check win condition after revealing cell
      if (checkWinCondition()) {
        setGameWon(true)
        setIsInputEnabled(false)
      }
    },
    [grid, revealed, flags, gameOver, isInputEnabled, checkWinCondition]
  )

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (!hasStarted) {
        setHasStarted(true)
      }
      revealCell(x, y)
    },
    [revealCell, hasStarted]
  )

  const handleRightClick = useCallback(
    (e: React.MouseEvent, x: number, y: number) => {
      e.preventDefault()
      if (
        x < 0 ||
        x >= GRID_SIZE ||
        y < 0 ||
        y >= GRID_SIZE ||
        revealed[y][x] ||
        !isInputEnabled
      ) {
        return
      }

      const newFlags = [...flags]
      newFlags[y][x] = !newFlags[y][x]
      setFlags(newFlags)
      setFlagsPlaced((prev) => (newFlags[y][x] ? prev + 1 : prev - 1))
    },
    [flags, revealed, isInputEnabled]
  )

  // Get cell color based on number
  const getCellColor = (num: number) => {
    const colors = [
      '', // Empty cell
      'text-blue-500',
      'text-green-500',
      'text-red-500',
      'text-purple-700',
      'text-red-700',
      'text-cyan-600',
      'text-black',
      'text-gray-600',
    ]
    return colors[num] || ''
  }

  return (
    <div className="min-h-full bg-gray-900 text-white">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          {/* Game header */}
          <div className="flex justify-between items-center mb-6">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-gray-800/70 px-4 py-2 rounded-lg border border-gray-700/50 text-center">
                <div className="text-xs text-gray-400 uppercase">Time</div>
                <div className="text-xl font-bold text-purple-400">
                  {formatTime(time)}
                </div>
              </div>
              <div className="bg-gray-800/70 px-3 py-2 rounded-lg border border-gray-700/50 text-center">
                <div className="text-xs text-gray-400 uppercase">Bombs</div>
                <div className="text-xl font-bold text-red-400">
                  {NUM_BOMBS - flagsPlaced}
                </div>
              </div>
            </div>
          </div>

          {/* Game grid */}
          <div className="flex justify-center">
            <div
              className="grid gap-1 bg-gray-800/70 p-2 rounded-lg border border-gray-700/70 shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)`,
                pointerEvents: isInputEnabled ? 'auto' : 'none',
              }}
            >
              {grid.map((row, y) =>
                row.map((cell, x) => (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    onContextMenu={(e) => handleRightClick(e, x, y)}
                    className={`
                      flex items-center justify-center font-bold text-sm
                      transition-all w-7 h-7 border rounded-sm
                      ${
                        revealed[y][x]
                          ? cell === -1
                            ? 'bg-red-900/70 border-red-800'
                            : 'bg-gray-700/70 border-gray-600/50'
                          : 'bg-gray-700/40 hover:bg-gray-700/70 border-gray-600/30 hover:shadow-md'
                      }
                      ${revealed[y][x] && cell > 0 ? getCellColor(cell) : ''}
                    `}
                  >
                    {revealed[y][x]
                      ? cell === -1
                        ? '💣'
                        : cell > 0
                        ? cell
                        : ''
                      : flags[y][x]
                      ? '🚩'
                      : ''}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game over modal */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-x-0 bottom-0 top-12 bg-black/40 flex items-center justify-center">
          <div className="p-6 rounded-lg shadow-lg bg-gray-800 border border-gray-700 text-center max-w-sm">
            <p
              className={`text-3xl font-bold mb-4 ${
                gameWon ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {gameWon ? '🏆 You Won!' : '💥 Game Over!'}
            </p>
            <p className="text-gray-300 mb-4">Time: {formatTime(time)}</p>
            <button
              onClick={resetGame}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MinesweeperApp
