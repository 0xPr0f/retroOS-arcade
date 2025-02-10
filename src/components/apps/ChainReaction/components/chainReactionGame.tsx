import React, { useState } from 'react'

const ChainReactionGame = () => {
  const gridSize = 6

  interface Cell {
    count: number
    player: number | null
  }
  const neighborOffsets: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
  const createInitialGrid = (): Cell[][] => {
    const grid: Cell[][] = new Array(gridSize)
    for (let i = 0; i < gridSize; i++) {
      grid[i] = new Array(gridSize)
      for (let j = 0; j < gridSize; j++) {
        grid[i][j] = { count: 0, player: null }
      }
    }
    return grid
  }

  const initialGrid = createInitialGrid()

  const getCriticalMass = (row: number, col: number): number => {
    if (
      (row === 0 || row === gridSize - 1) &&
      (col === 0 || col === gridSize - 1)
    )
      return 2
    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1)
      return 3
    return 4
  }

  const getNeighbors = (row: number, col: number): [number, number][] => {
    const neighbors: [number, number][] = []
    for (let i = 0; i < neighborOffsets.length; i++) {
      const [dr, dc] = neighborOffsets[i]
      const nr = row + dr,
        nc = col + dc
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        neighbors.push([nr, nc])
      }
    }
    return neighbors
  }

  const checkWinner = (
    currentGrid: Cell[][],
    gameStarted: boolean
  ): number | null => {
    if (!gameStarted) return null
    let totalOccupied = 0,
      player0Count = 0,
      player1Count = 0
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = currentGrid[row][col]
        if (cell.player !== null) {
          totalOccupied++
          cell.player === 0 ? player0Count++ : player1Count++
        }
      }
    }
    if (totalOccupied > 0) {
      if (player0Count === totalOccupied) return 0
      if (player1Count === totalOccupied) return 1
    }
    return null
  }

  const processChainReactions = (
    grid: Cell[][],
    startRow: number,
    startCol: number
  ): Cell[][] => {
    // We use a simple array as a queue.
    const queue: [number, number][] = [[startRow, startCol]]

    while (queue.length > 0) {
      const [r, c] = queue.shift()!
      const cell = grid[r][c]
      const critical = getCriticalMass(r, c)
      if (cell.count >= critical) {
        // "Explode" this cell.
        const player = cell.player
        cell.count = 0
        cell.player = null
        // Propagate to all valid neighbors.
        const neighbors = getNeighbors(r, c)
        for (let i = 0; i < neighbors.length; i++) {
          const [nr, nc] = neighbors[i]
          const neighbor = grid[nr][nc]
          neighbor.count++
          neighbor.player = player
          if (neighbor.count >= getCriticalMass(nr, nc)) {
            queue.push([nr, nc])
          }
        }
      }
    }
    return grid
  }

  const [grid, setGrid] = useState<Cell[][]>(initialGrid)
  const [currentPlayer, setCurrentPlayer] = useState<number>(0)
  const [winner, setWinner] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const players = ['red', 'blue']

  const handleCellClick = (row: number, col: number) => {
    if (winner !== null || !grid[row]?.[col]) return
    if (!gameStarted) setGameStarted(true)

    if (
      grid[row][col].player !== null &&
      grid[row][col].player !== currentPlayer
    )
      return

    const newGrid = structuredClone(grid) as Cell[][]
    newGrid[row][col].count++
    newGrid[row][col].player = currentPlayer

    const finalGrid = processChainReactions(newGrid, row, col)
    setGrid(finalGrid)

    const result = checkWinner(finalGrid, gameStarted)
    if (result !== null) {
      setWinner(result)
    } else {
      setCurrentPlayer((currentPlayer + 1) % 2)
    }
  }

  const getCellContent = (
    count: number,
    player: number
  ): React.ReactNode | null => {
    if (count === 0) return null
    const baseClass = 'absolute rounded-full transition-all duration-300'
    const color = player === 0 ? 'bg-red-500' : 'bg-blue-500'
    const dots: React.ReactNode[] = []
    switch (count) {
      case 1:
        dots.push(
          <div
            key="1"
            className={`${baseClass} ${color} w-3 h-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
          />
        )
        break
      case 2:
        dots.push(
          <div
            key="1"
            className={`${baseClass} ${color} w-3 h-3 top-1/4 left-1/2 -translate-x-1/2`}
          />,
          <div
            key="2"
            className={`${baseClass} ${color} w-3 h-3 bottom-1/4 left-1/2 -translate-x-1/2`}
          />
        )
        break
      case 3:
        dots.push(
          <div
            key="1"
            className={`${baseClass} ${color} w-3 h-3 top-1/4 left-1/4`}
          />,
          <div
            key="2"
            className={`${baseClass} ${color} w-3 h-3 top-1/4 right-1/4`}
          />,
          <div
            key="3"
            className={`${baseClass} ${color} w-3 h-3 bottom-1/4 left-1/2 -translate-x-1/2`}
          />
        )
        break
      default:
        // For counts higher than 3, you might simply render a number.
        dots.push(
          <div
            key="default"
            className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs"
          >
            {count}
          </div>
        )
    }
    return dots
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-xl font-bold mt-2 mb-2">
        {winner === null ? (
          <>
            Current Player:
            <span
              className={currentPlayer === 0 ? 'text-red-500' : 'text-blue-500'}
            >
              {players[currentPlayer]}
            </span>
          </>
        ) : (
          <span className={winner === 0 ? 'text-red-500' : 'text-blue-500'}>
            {players[winner]} Wins!
          </span>
        )}
      </div>

      <div className="grid gap-1 bg-gray-200 p-2 rounded-lg">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <button
                key={colIndex}
                className="w-16 h-16 bg-white rounded-lg relative hover:bg-gray-50 transition-colors"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={winner !== null}
              >
                {getCellContent(cell.count!, cell.player!)}
              </button>
            ))}
          </div>
        ))}
      </div>
      {winner !== null && (
        <div className="absolute mt-12 inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {winner === 0 ? 'Red' : 'Blue'} Player Wins! 🎉
            </h2>
            <button
              onClick={() => {
                setGrid(initialGrid)
                setCurrentPlayer(0)
                setWinner(null)
                setGameStarted(false)
              }}
              className="bg-white text-blue-500 hover:bg-gray-100 py-2 px-4 rounded font-semibold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChainReactionGame
