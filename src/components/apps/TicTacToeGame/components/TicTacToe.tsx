import React, { useState } from 'react'
import {
  Button,
  StyledInput,
  TabsTrigger,
  TabsList,
  Tabs,
  Button2,
} from '@/components/pc/drives/UI/UI_Components.v1'

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [mode, setMode] = useState('local')
  const [lobbyCode, setLobbyCode] = useState('')
  const [playerAddress, setPlayerAddress] = useState('')

  const handleClick = (index: number) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = xIsNext ? 'X' : 'O'

    setBoard(newBoard)
    setXIsNext(!xIsNext)
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
        return
      }
    }

    if (board.every((square: string) => square)) {
      setWinner('Draw')
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
    setWinner(null)
  }

  const renderBoard = () => (
    <div className="grid border border-red-500 grid-cols-3 gap-2 w-64 h-64">
      {board.map((square, index) => (
        <div
          key={index}
          className="w-20 h-20 border-2 border-gray-300 flex items-center justify-center"
        >
          <button
            onClick={() => handleClick(index)}
            className={`
              w-full h-full text-5xl font-bold 
              ${square === 'X' ? 'text-blue-500' : 'text-red-500'}
              hover:bg-gray-100 transition-colors
            `}
          >
            {square}
          </button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col items-center overflow-auto">
      <Tabs
        defaultValue="local"
        value={mode}
        onValueChange={setMode}
        className="w-full max-w-md"
      >
        <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-md">
          <TabsTrigger className="" value="local">
            Local
          </TabsTrigger>
          <TabsTrigger value="multiplayer">Multiplayer</TabsTrigger>
        </TabsList>

        <div className="text-2xl my-3 text-center">
          {winner
            ? winner === 'Draw'
              ? 'Draw!'
              : `Winner: ${winner}`
            : `Next Player: ${xIsNext ? 'X' : 'O'}`}
        </div>
        <div className="flex border justify-center border-red-500">
          {renderBoard()}
        </div>
        <div className="flex justify-center">
          {winner && (
            <Button
              onClick={resetGame}
              className="mt-2 w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
            >
              Reset Game
            </Button>
          )}
        </div>

        {mode === 'multiplayer' && (
          <div className="mt-2 flex flex-col space-y-2">
            <Button2
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
              variant="outline"
            >
              Enter Lobby
            </Button2>
            <div className="flex space-x-2">
              <StyledInput
                placeholder="Enter Player Address"
                value={playerAddress}
                onChange={(e: any) => setPlayerAddress(e.target.value)}
              />
              <Button2
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
                variant="outline"
              >
                Connect
              </Button2>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  )
}

export default TicTacToe
