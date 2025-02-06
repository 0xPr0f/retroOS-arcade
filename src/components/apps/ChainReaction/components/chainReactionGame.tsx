import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/pc/drives/UI/UI_Components.v2'
import React, { useState, useEffect } from 'react'

const ChainReactionGame = () => {
  const gridSize = 6
  const initialGrid = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({ count: 0, player: null }))
    )

  const [grid, setGrid] = useState(initialGrid)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [winner, setWinner] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const players = ['red', 'blue']

  const getCriticalMass = (row: any, col: any) => {
    if (
      (row === 0 || row === gridSize - 1) &&
      (col === 0 || col === gridSize - 1)
    )
      return 2
    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1)
      return 3
    return 4
  }

  const getNeighbors = (row: any, col: any) => {
    const neighbors = []
    if (row > 0) neighbors.push([row - 1, col])
    if (row < gridSize - 1) neighbors.push([row + 1, col])
    if (col > 0) neighbors.push([row, col - 1])
    if (col < gridSize - 1) neighbors.push([row, col + 1])
    return neighbors
  }

  // Enhanced win condition check
  const checkWinner = (currentGrid: any) => {
    if (!gameStarted) return

    let player0Cells = 0
    let player1Cells = 0
    let totalOccupiedCells = 0

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (currentGrid[row][col].player !== null) {
          totalOccupiedCells++
          if (currentGrid[row][col].player === 0) {
            player0Cells++
          } else {
            player1Cells++
          }
        }
      }
    }

    // Only check for winner if there are occupied cells
    if (totalOccupiedCells > 0) {
      if (player0Cells === totalOccupiedCells) {
        setWinner(0)
      } else if (player1Cells === totalOccupiedCells) {
        setWinner(1)
      }
    }
  }

  // Process chain reactions
  const processChainReactions = (
    newGrid: any,
    startRow: any,
    startCol: any
  ) => {
    let explosions = [[startRow, startCol]]
    let processingComplete = false

    while (!processingComplete) {
      processingComplete = true
      const newExplosions: any[] = []

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const cell = newGrid[row][col]
          if (cell.count >= getCriticalMass(row, col)) {
            processingComplete = false
            cell.count = 0
            const player = cell.player
            cell.player = null

            getNeighbors(row, col).forEach(([nr, nc]) => {
              newGrid[nr][nc].count++
              newGrid[nr][nc].player = player
            })
          }
        }
      }

      if (!processingComplete) {
        explosions = newExplosions
      }
    }

    return newGrid
  }

  const handleCellClick = (row: any, col: any) => {
    if (winner || !grid[row]?.[col]) return
    if (!gameStarted) setGameStarted(true)

    // Check if cell belongs to opponent
    if (
      grid[row][col].player !== null &&
      grid[row][col].player !== currentPlayer
    )
      return

    const newGrid = JSON.parse(JSON.stringify(grid))
    newGrid[row][col].count++
    newGrid[row][col].player = currentPlayer

    // Process any chain reactions
    const finalGrid = processChainReactions(newGrid, row, col)

    setGrid(finalGrid)
    checkWinner(finalGrid)

    // Only change player if game hasn't been won
    if (winner === null) {
      setCurrentPlayer((currentPlayer + 1) % 2)
    }
  }

  const getCellContent = (count: number, player: number) => {
    if (count === 0) return null

    const baseClass = 'absolute rounded-full transition-all duration-300'
    const dots = []
    const color = player === 0 ? 'bg-red-500' : 'bg-blue-500'

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
    }
    return dots
  }

  if (!grid) return null

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
