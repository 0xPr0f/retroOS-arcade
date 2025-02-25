import React, { useState, useEffect } from 'react'
import { Zap, Trophy, RotateCcw } from 'lucide-react'

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

  // Game state
  const [grid, setGrid] = useState<Cell[][]>(initialGrid)
  const [currentPlayer, setCurrentPlayer] = useState<number>(0)
  const [winner, setWinner] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [moveCount, setMoveCount] = useState<number>(0)
  const [playerStats, setPlayerStats] = useState<{ [key: number]: number }>({
    0: 0, // Player Red wins
    1: 0, // Player Blue wins
  })
  const [lastExplosion, setLastExplosion] = useState<[number, number] | null>(
    null
  )

  const players = [
    {
      name: 'Red',
      color: 'from-red-400 to-red-600',
      textColor: 'text-red-500',
      bgColor: 'bg-red-500',
    },
    {
      name: 'Blue',
      color: 'from-blue-400 to-blue-600',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-500',
    },
  ]

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

    setLastExplosion([row, col])

    const finalGrid = processChainReactions(newGrid, row, col)
    setGrid(finalGrid)
    setMoveCount(moveCount + 1)

    const result = checkWinner(finalGrid, gameStarted)
    if (result !== null) {
      setWinner(result)
      setPlayerStats((prev) => ({
        ...prev,
        [result]: prev[result] + 1,
      }))
    } else {
      setCurrentPlayer((currentPlayer + 1) % 2)
    }
  }

  const resetGame = () => {
    setGrid(createInitialGrid())
    setCurrentPlayer(0)
    setWinner(null)
    setGameStarted(false)
    setMoveCount(0)
    setLastExplosion(null)
  }

  const getCellContent = (
    count: number,
    player: number | null,
    row: number,
    col: number
  ): React.ReactNode => {
    if (count === 0) return null

    const isLastExploded =
      lastExplosion && lastExplosion[0] === row && lastExplosion[1] === col
    const baseClass = 'absolute rounded-full transition-transform duration-300'
    const color = player === 0 ? players[0].bgColor : players[1].bgColor
    const dots: React.ReactNode[] = []

    switch (count) {
      case 1:
        dots.push(
          <div
            key="1"
            className={`${baseClass} ${color} w-3 h-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
              isLastExploded ? 'animate-pulse' : ''
            }`}
          />
        )
        break
      case 2:
        dots.push(
          <div
            key="1"
            className={`${baseClass} ${color} w-3 h-3 top-1/4 left-1/2 -translate-x-1/2 ${
              isLastExploded ? 'animate-pulse' : ''
            }`}
          />,
          <div
            key="2"
            className={`${baseClass} ${color} w-3 h-3 bottom-1/4 left-1/2 -translate-x-1/2 ${
              isLastExploded ? 'animate-pulse' : ''
            }`}
          />
        )
        break
      case 3:
        dots.push(
          <div
            key="1"
            className={`${baseClass} ${color} w-3 h-3 top-1/4 left-1/4 ${
              isLastExploded ? 'animate-pulse' : ''
            }`}
          />,
          <div
            key="2"
            className={`${baseClass} ${color} w-3 h-3 top-1/4 right-1/4 ${
              isLastExploded ? 'animate-pulse' : ''
            }`}
          />,
          <div
            key="3"
            className={`${baseClass} ${color} w-3 h-3 bottom-1/4 left-1/2 -translate-x-1/2 ${
              isLastExploded ? 'animate-pulse' : ''
            }`}
          />
        )
        break
      default:
        // For counts higher than 3, show a number
        dots.push(
          <div
            key="default"
            className={`absolute inset-0 flex items-center justify-center text-white font-bold text-xs ${
              isLastExploded ? 'animate-pulse' : ''
            }`}
          >
            {count}
          </div>
        )
    }
    return dots
  }

  return (
    <div className="min-h-full h-fit bg-gray-900 text-white py-2 md:p-2">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          {/* Game stats */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-400 w-5 h-5" />
              <span className="text-gray-300">Moves: {moveCount}</span>
            </div>

            <div className="flex gap-4">
              <div className="bg-gray-800/40 px-3 py-1 rounded-lg border border-red-500/30 flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-300 text-sm">
                  Red: {playerStats[0]}
                </span>
              </div>
              <div className="bg-gray-800/40 px-3 py-1 rounded-lg border border-blue-500/30 flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300 text-sm">
                  Blue: {playerStats[1]}
                </span>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="bg-gray-800/40 p-2 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Player turn indicator */}
          <div className="mb-4 flex justify-center">
            {winner === null ? (
              <div
                className={`px-4 py-2 rounded-lg bg-gradient-to-r ${players[currentPlayer].color} flex items-center gap-2`}
              >
                <div className={`w-4 h-4 rounded-full bg-white`}></div>
                <span className="font-bold text-white">
                  {players[currentPlayer].name}'s Turn
                </span>
              </div>
            ) : (
              <div
                className={`px-4 py-2 rounded-lg bg-gradient-to-r ${players[winner].color} flex items-center gap-2`}
              >
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-white">
                  {players[winner].name} Wins!
                </span>
              </div>
            )}
          </div>

          {/* Game grid */}
          <div className="flex justify-center mb-3">
            <div className="grid gap-1.5 bg-gray-800/30 p-2 rounded-lg border border-gray-700/50">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1.5">
                  {row.map((cell, colIndex) => {
                    const criticalMass = getCriticalMass(rowIndex, colIndex)
                    const progress =
                      cell.count > 0 ? (cell.count / criticalMass) * 100 : 0
                    const isBorderCell =
                      rowIndex === 0 ||
                      rowIndex === gridSize - 1 ||
                      colIndex === 0 ||
                      colIndex === gridSize - 1
                    const isCornerCell =
                      (rowIndex === 0 || rowIndex === gridSize - 1) &&
                      (colIndex === 0 || colIndex === gridSize - 1)

                    return (
                      <button
                        key={colIndex}
                        className={`w-14 h-14 bg-gray-700/50 rounded-lg relative hover:bg-gray-700 transition-colors border border-gray-600/30 overflow-hidden ${
                          cell.player !== null
                            ? cell.player === 0
                              ? 'hover:border-red-500/50'
                              : 'hover:border-blue-500/50'
                            : 'hover:border-gray-500/50'
                        }`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        disabled={winner !== null}
                      >
                        {/* Border indicators for critical mass */}
                        {isBorderCell && !isCornerCell && (
                          <div className="absolute inset-0 border-2 border-yellow-500/20 rounded-lg pointer-events-none"></div>
                        )}
                        {isCornerCell && (
                          <div className="absolute inset-0 border-2 border-green-500/20 rounded-lg pointer-events-none"></div>
                        )}

                        {/* Progress bar for critical mass */}
                        {cell.player !== null && (
                          <div
                            className={`absolute bottom-0 left-0 h-1 transition-all ${
                              cell.player === 0
                                ? 'bg-red-500/70'
                                : 'bg-blue-500/70'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        )}

                        {/* Cell content (dots) */}
                        {getCellContent(
                          cell.count,
                          cell.player,
                          rowIndex,
                          colIndex
                        )}

                        {/* Critical mass hint (only show on hover) */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 text-xs">
                          {criticalMass}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Game instructions - simplified */}
          <div className="text-gray-400 text-sm max-w-md mx-auto">
            <p className="text-center">
              {!gameStarted ? (
                <span className="text-blue-400">Click any cell to start!</span>
              ) : (
                <>Add atoms to cells and create chain reactions</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Winner overlay */}
      {winner !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div
            className={`max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-${players[
              winner
            ].name.toLowerCase()}-500/50`}
          >
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${players[winner].color} flex items-center justify-center`}
            >
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2
              className={`text-2xl font-bold mb-2 text-center ${players[winner].textColor}`}
            >
              {players[winner].name} Player Wins!
            </h2>

            <p className="text-gray-400 text-center mb-6">
              Game completed in {moveCount} moves
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-colors text-white font-bold py-3 px-6 rounded-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChainReactionGame
