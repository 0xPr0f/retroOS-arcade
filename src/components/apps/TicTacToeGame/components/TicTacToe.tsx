import React, { useState, useEffect } from 'react'
import {
  Button,
  StyledInput,
  TabsTrigger,
  TabsList,
  Tabs,
  Button2,
} from '@/components/pc/drives/UI/UI_Components.v1'
import TicTacToeMP from './onchain/Toe'
import { RefreshCw, Trophy, X, Circle } from 'lucide-react'

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [mode, setMode] = useState('local')
  const [lobbyCode, setLobbyCode] = useState('')
  const [playerAddress, setPlayerAddress] = useState('')
  const [moveCount, setMoveCount] = useState(0)
  const [stats, setStats] = useState({
    xWins: 0,
    oWins: 0,
    draws: 0,
  })
  const [lastMove, setLastMove] = useState<number | null>(null)

  const handleClick = (index: number) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = xIsNext ? 'X' : 'O'

    setBoard(newBoard)
    setXIsNext(!xIsNext)
    setMoveCount(moveCount + 1)
    setLastMove(index)
    checkWinner(newBoard)
  }

  const checkWinner = (board: string[]) => {
    const winLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (let line of winLines) {
      const [a, b, c] = line
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a])
        updateStats(board[a])
        return
      }
    }

    if (board.every((square: string) => square)) {
      setWinner('Draw')
      updateStats('Draw')
    }
  }

  const updateStats = (result: string) => {
    if (result === 'X') {
      setStats((prev) => ({ ...prev, xWins: prev.xWins + 1 }))
    } else if (result === 'O') {
      setStats((prev) => ({ ...prev, oWins: prev.oWins + 1 }))
    } else if (result === 'Draw') {
      setStats((prev) => ({ ...prev, draws: prev.draws + 1 }))
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
    setWinner(null)
    setMoveCount(0)
    setLastMove(null)
  }

  const renderBoard = () => (
    <div className="grid grid-cols-3 gap-2 w-72 h-72">
      {board.map((square, index) => {
        const isWinningCell =
          winner && winner !== 'Draw' && getWinningLine()?.includes(index)
        const isLastMove = lastMove === index

        return (
          <div
            key={index}
            className={`relative bg-gray-800/40 rounded-lg border ${
              isWinningCell
                ? square === 'X'
                  ? 'border-blue-500/70'
                  : 'border-red-500/70'
                : 'border-gray-700/30'
            } transition-all duration-300 ${isLastMove ? 'shadow-md' : ''}`}
          >
            <button
              onClick={() => handleClick(index)}
              disabled={!!square || !!winner}
              className={`
                w-full h-full flex items-center justify-center rounded-lg
                ${!square ? 'hover:bg-gray-700/50' : ''}
                transition-colors
              `}
            >
              <div className="w-12 h-12 flex items-center justify-center">
                {square === 'X' && (
                  <div
                    className={`text-blue-500 ${
                      isLastMove ? 'animate-pulse-once' : ''
                    }`}
                  >
                    <X size={42} strokeWidth={3} />
                  </div>
                )}
                {square === 'O' && (
                  <div
                    className={`text-red-500 ${
                      isLastMove ? 'animate-pulse-once' : ''
                    }`}
                  >
                    <Circle size={42} strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )

  // Get the winning line for highlighting
  const getWinningLine = () => {
    if (!winner || winner === 'Draw') return null

    const winLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (let line of winLines) {
      const [a, b, c] = line
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return line
      }
    }

    return null
  }

  return (
    <div className="min-h-full bg-gray-900 text-white px-4 py-2 md:py-2">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl px-5 py-3 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          <Tabs
            defaultValue="local"
            value={mode}
            onValueChange={setMode}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/70 rounded-lg mb-2 p-1">
              <TabsTrigger
                className={`rounded-md py-2 px-4 transition-all ${
                  mode === 'local'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                value="local"
              >
                Local Play
              </TabsTrigger>
              <TabsTrigger
                className={`rounded-md py-2 px-4 transition-all ${
                  mode === 'multiplayer'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                value="multiplayer"
              >
                Multiplayer
              </TabsTrigger>
            </TabsList>

            {mode === 'local' ? (
              <div className="mt-3">
                {/* Game stats */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-gray-800/40 rounded-lg p-2 border border-gray-700/30 text-center">
                    <div className="text-xs text-gray-400 uppercase">
                      X Wins
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                      {stats.xWins}
                    </div>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-2 border border-gray-700/30 text-center">
                    <div className="text-xs text-gray-400 uppercase">Draws</div>
                    <div className="text-xl font-bold text-gray-200">
                      {stats.draws}
                    </div>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-2 border border-gray-700/30 text-center">
                    <div className="text-xs text-gray-400 uppercase">
                      O Wins
                    </div>
                    <div className="text-xl font-bold text-red-400">
                      {stats.oWins}
                    </div>
                  </div>
                </div>

                {/* Game status */}
                <div className="flex justify-center mb-5">
                  {winner ? (
                    <div
                      className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      ${
                        winner === 'X'
                          ? 'bg-blue-500/20 border border-blue-500/50'
                          : winner === 'O'
                          ? 'bg-red-500/20 border border-red-500/50'
                          : 'bg-gray-700/30 border border-gray-500/50'
                      }
                    `}
                    >
                      {winner === 'Draw' ? (
                        <span className="font-bold">Game Tied!</span>
                      ) : (
                        <>
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="font-bold">
                            {winner === 'X' ? 'X Wins!' : 'O Wins!'}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      ${
                        xIsNext
                          ? 'bg-blue-500/20 border border-blue-500/50'
                          : 'bg-red-500/20 border border-red-500/50'
                      }
                    `}
                    >
                      <div
                        className={`
                        w-5 h-5 rounded-full flex items-center justify-center
                        ${xIsNext ? 'text-blue-500' : 'text-red-500'}
                      `}
                      >
                        {xIsNext ? <X size={16} /> : <Circle size={14} />}
                      </div>
                      <span className="font-medium">
                        {xIsNext ? 'X Turn' : 'O Turn'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Game board */}
                <div className="flex justify-center mb-4">{renderBoard()}</div>

                {/* Reset button */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={resetGame}
                    className={`
                      flex items-center justify-center gap-2
                      px-5 py-2.5 rounded-lg transition-colors
                      ${
                        winner
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }
                    `}
                  >
                    <RefreshCw size={16} />
                    <span>{winner ? 'Play Again' : 'Reset Game'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <TicTacToeMP />
              </div>
            )}
          </Tabs>
        </div>
      </div>

      <style>{`
        @keyframes pulse-once {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-once {
          animation: pulse-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default TicTacToe
