import type { NextPage } from 'next'
import { useState, useEffect, useCallback } from 'react'
import { useInterval } from 'react-use'

const MinesweeperApp: NextPage = () => {
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

  useEffect(() => {
    resetGame()
  }, [])

  useInterval(() => {
    if (hasStarted && !gameOver && !gameWon) {
      setTime((prevTime) => prevTime + 1)
    }
  }, 1000)

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

  return (
    <div>
      <div>
        Time: {time}s | Bombs: {NUM_BOMBS}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)`,
          pointerEvents: isInputEnabled ? 'auto' : 'none',
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => handleCellClick(x, y)}
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: revealed[y][x]
                  ? cell === -1
                    ? 'red'
                    : 'lightgrey'
                  : 'grey',
                border: '1px solid black',
              }}
            >
              {revealed[y][x]
                ? cell === -1
                  ? '💣'
                  : cell > 0
                  ? cell
                  : ''
                : ''}
            </button>
          ))
        )}
      </div>
      {(gameOver || gameWon) && (
        <div className="absolute mt-12 inset-0 bg-black/50 flex items-center justify-center">
          <div className=" p-6 rounded-lg shadow-lg text-center">
            <p style={{ color: 'white', fontSize: '2rem' }}>
              {gameOver ? 'Game Over!' : 'You Won!'}
            </p>
            <button
              onClick={resetGame}
              style={{
                backgroundColor: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MinesweeperApp
