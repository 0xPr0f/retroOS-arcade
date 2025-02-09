import React, { useState } from 'react'

const ChainReactionGame = () => {
  // --- Types and Constants ---

  const gridSize = 6

  interface Cell {
    count: number
    player: number | null
  }

  // Precomputed neighbor offsets: up, down, left, right.
  const neighborOffsets: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]

  // Build the initial grid using for-loops.
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

  // --- Game Logic Functions ---

  // Critical mass depends on the cell's position.
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

  // Return valid neighbors using precomputed offsets.
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

  // Check if all occupied cells belong to one player.
  // Returns 0 or 1 if one player occupies every occupied cell; otherwise, null.
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

  // Process chain reactions using a BFS/queue approach.
  // Only cells that reach or exceed critical mass are processed.
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

  // --- React Component State and Handlers ---

  // Assume these React state hooks are inside your component.
  const [grid, setGrid] = useState<Cell[][]>(initialGrid)
  const [currentPlayer, setCurrentPlayer] = useState<number>(0)
  const [winner, setWinner] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const players = ['red', 'blue']

  // Handle a cell click event.
  const handleCellClick = (row: number, col: number) => {
    // Ignore if a winner exists or if cell is out of bounds.
    if (winner !== null || !grid[row]?.[col]) return
    if (!gameStarted) setGameStarted(true)

    // Prevent playing on an opponent's cell.
    if (
      grid[row][col].player !== null &&
      grid[row][col].player !== currentPlayer
    )
      return

    // Use structuredClone (or a custom deep clone) for an efficient deep copy.
    const newGrid = structuredClone(grid) as Cell[][] // Modern browsers only.
    newGrid[row][col].count++
    newGrid[row][col].player = currentPlayer

    // Process chain reactions starting from the clicked cell.
    const finalGrid = processChainReactions(newGrid, row, col)
    setGrid(finalGrid)

    // Check for a win.
    const result = checkWinner(finalGrid, gameStarted)
    if (result !== null) {
      setWinner(result)
    } else {
      // Switch players if no win.
      setCurrentPlayer((currentPlayer + 1) % 2)
    }
  }

  // Return JSX for a cell based on its count and player.
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
