import React, { useState, useEffect } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useWatchContractEvent,
} from 'wagmi'
import { Button2 } from '@/components/pc/drives/UI/UI_Components.v1'
import { GameStatus, TransactionState } from './types'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './abidetails'
import { lightBlue } from '@/components/pc/drives/Extensions/colors'

const TicTacToeMP = () => {
  const { address } = useAccount()
  const [gameId, setGameId] = useState<string | null>(null)
  const [board, setBoard] = useState<number[]>(Array(9).fill(0))
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING)
  const [queuePosition, setQueuePosition] = useState<number>(0)
  const [transactions, setTransactions] = useState<
    Record<string, TransactionState>
  >({})

  // Helper: update transaction state globally
  const updateTransactionState = (
    txType: string,
    update: Partial<TransactionState>
  ) => {
    setTransactions((prev) => ({
      ...prev,
      [txType]: {
        ...prev[txType],
        ...update,
      },
    }))
  }

  // Read queue position
  const { data: playerQueuePosition, refetch: refetchQueuePosition } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getPlayerQueuePosition',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && !gameId,
        refetchInterval: 4000, // Poll more frequently when in queue
      },
    })

  // Read current game
  const { data: currentGame, refetch: refetchCurrentGame } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCurrentGame',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 4000, // Poll more frequently
    },
  })

  // Join Queue Contract Write
  const {
    writeContract: writeJoinQueue,
    data: joinQueueData,
    isPending: isJoiningQueue,
    error: joinQueueError,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {
        updateTransactionState('joinQueue', { status: 'error', error })
      },
      onSuccess: (txHash: any) => {
        updateTransactionState('joinQueue', { status: 'success' })
        refetchQueuePosition()
        refetchCurrentGame() // Refetch current game after joining queue
      },
    },
  })

  // Leave Queue Contract Write
  const {
    writeContract: writeLeaveQueue,
    data: leaveQueueData,
    isPending: isLeavingQueue,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {
        updateTransactionState('leaveQueue', { status: 'error', error })
      },
      onSuccess: (txHash: any) => {
        updateTransactionState('leaveQueue', { status: 'success' })
        refetchQueuePosition()
        refetchCurrentGame()
      },
    },
  })

  // Wait for joinQueue transaction
  const { isLoading: isWaitingForJoinQueue } = useWaitForTransactionReceipt({
    hash: joinQueueData,
  })

  // Wait for leaveQueue transaction
  const { isLoading: isWaitingForLeaveQueue } = useWaitForTransactionReceipt({
    hash: leaveQueueData,
  })

  // Read Game State
  const { data: gameState, refetch: refetchGameState } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getGameState',
    args: gameId ? [gameId.toString()] : undefined,
    query: {
      enabled: !!gameId,
      refetchInterval: 4000, // Poll more frequently during game
    },
  })

  // Make Move Contract Write
  const {
    writeContract: writeMakeMove,
    data: moveData,
    isPending: isMakingMove,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {
        updateTransactionState('makeMove', { status: 'error', error })
      },
      onSuccess: (txHash: any) => {
        updateTransactionState('makeMove', { status: 'success' })
        refetchGameState()
      },
    },
  })

  // Wait for move transaction
  const { isLoading: isWaitingForMove } = useWaitForTransactionReceipt({
    hash: moveData,
  })

  // Watch for both PlayersMatched and PlayerJoinedQueue events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PlayersMatched',
    onLogs(logs: any) {
      const [player1, player2, matchedGameId] = logs[0].args
      console.log('Players matched:', logs)
      if (player1 === address || player2 === address) {
        setGameId(matchedGameId.toString())
        setGameStatus(GameStatus.PLAYING)
        setQueuePosition(0)
        refetchGameState()
        refetchCurrentGame()
      }
    },
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PlayerJoinedQueue',
    onLogs() {
      // Refetch queue position when anyone joins queue
      refetchQueuePosition()
      refetchCurrentGame()
    },
  })

  // Effect to handle game state updates
  useEffect(() => {
    if (
      currentGame &&
      typeof currentGame === 'string' &&
      currentGame !==
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    ) {
      console.log('Current game updated:', currentGame)
      setGameId(currentGame)
      refetchGameState()
    }
  }, [currentGame])

  useEffect(() => {
    if (gameState) {
      setBoard(gameState[4])
      if (gameState[2] !== '0x0000000000000000000000000000000000000000') {
        setGameStatus(GameStatus.FINISHED)
      } else if (
        gameState[1] !== '0x0000000000000000000000000000000000000000'
      ) {
        setGameStatus(GameStatus.PLAYING)
      }
    }
  }, [gameState])

  useEffect(() => {
    if (playerQueuePosition !== undefined) {
      setQueuePosition(Number(playerQueuePosition))
      // If queue position is 1, we should actively check for game updates
      if (Number(playerQueuePosition) === 1) {
        refetchCurrentGame()
      }
    }
  }, [playerQueuePosition])

  const handleMove = async (position: number) => {
    if (!gameId || !gameState?.[1]) return
    updateTransactionState('makeMove', { status: 'loading' })
    try {
      await writeMakeMove({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'makeMove',
        args: [gameId.toString(), position],
      })
    } catch (error) {
      console.error('Error making move:', error)
    }
  }

  const handleResetGame = () => {
    setGameId(null)
    setBoard(Array(9).fill(0))
    setGameStatus(GameStatus.WAITING)
    setQueuePosition(0)
  }

  const renderBoard = () => (
    <div className="grid grid-cols-3 gap-2 w-64 h-64">
      {board.map((value, index) => (
        <div
          key={index}
          className="w-20 h-20 border-2 border-gray-300 flex items-center justify-center"
        >
          <button
            onClick={() => handleMove(index)}
            disabled={
              !gameState?.[1] ||
              value !== 0 ||
              isMakingMove ||
              isWaitingForMove ||
              (gameState?.[5] // isXNext
                ? gameState?.[0] !== address // playerX
                : gameState?.[1] !== address) // playerO
            }
            className={`
              w-full h-full text-5xl font-bold
              ${
                value === 1
                  ? 'text-blue-500'
                  : value === 2
                  ? 'text-red-500'
                  : ''
              }
              ${
                isMakingMove || isWaitingForMove
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }
              hover:bg-gray-100 transition-colors
            `}
          >
            {value === 1 ? 'X' : value === 2 ? 'O' : ''}
          </button>
        </div>
      ))}
    </div>
  )

  const renderGameStatus = () => {
    if (queuePosition > 0) {
      return (
        <div className="text-yellow-500">
          In Queue - Position: {queuePosition}
        </div>
      )
    }

    switch (gameStatus) {
      case GameStatus.WAITING:
        return <div className="text-yellow-500">Waiting for opponent...</div>
      case GameStatus.PLAYING:
        const isYourTurn = gameState?.[5]
          ? gameState?.[0] === address
          : gameState?.[1] === address
        return (
          <div className="space-y-2">
            <div
              className={`text-blue-500 ${
                isMakingMove || isWaitingForMove ? 'animate-pulse' : ''
              }`}
            >
              {gameState?.[5] ? 'X' : 'O'}'s turn
              {(isMakingMove || isWaitingForMove) && ' (Processing...)'}
            </div>
            <div
              className={`font-bold ${
                isYourTurn ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isYourTurn ? 'Your turn to play!' : "Opponent's turn to play"}
            </div>
          </div>
        )
      case GameStatus.FINISHED:
        return (
          <div className="space-y-2">
            <div className="text-green-500">
              Game Over -{' '}
              {gameState?.[2] === address ? 'You won!' : 'Opponent won!'}
            </div>
            <Button2
              onClick={handleResetGame}
              className="w-full text-white py-2 rounded-md"
              style={{ backgroundColor: lightBlue }}
            >
              Start New Game
            </Button2>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center overflow-auto">
      <div className="mt-4 space-y-4">
        {!gameId ? (
          <div className="space-y-2">
            <Button2
              style={{
                backgroundColor: lightBlue,
                transition: 'background-color 0.2s',
              }}
              onClick={() =>
                writeJoinQueue({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'joinQueue',
                  args: [],
                })
              }
              disabled={
                isJoiningQueue || isWaitingForJoinQueue || queuePosition > 0
              }
              className={`w-full text-white py-2 mb-0 rounded-md transition duration-200 ${
                isJoiningQueue || isWaitingForJoinQueue ? 'opacity-50' : ''
              }`}
              variant="outline"
            >
              {isJoiningQueue || isWaitingForJoinQueue
                ? 'Joining Queue...'
                : queuePosition > 0
                ? `In Queue - Position ${queuePosition}`
                : 'Join Queue'}
            </Button2>
            {queuePosition > 0 && (
              <Button2
                style={{
                  backgroundColor: '#ef4444', // Red color
                  transition: 'background-color 0.2s',
                }}
                onClick={() =>
                  writeLeaveQueue({
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: 'leaveQueue',
                    args: [],
                  })
                }
                disabled={isLeavingQueue || isWaitingForLeaveQueue}
                className={`w-full text-white py-2 mb-0 rounded-md transition duration-200 ${
                  isLeavingQueue || isWaitingForLeaveQueue ? 'opacity-50' : ''
                }`}
                variant="outline"
              >
                {isLeavingQueue || isWaitingForLeaveQueue
                  ? 'Leaving Queue...'
                  : 'Leave Queue'}
              </Button2>
            )}
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="font-medium">Game ID: {gameId}</p>
            <p className="text-sm text-gray-500">Your Address: {address}</p>
            {renderGameStatus()}
          </div>
        )}
      </div>
      <div className="flex justify-center mt-4">{renderBoard()}</div>
    </div>
  )
}

export default TicTacToeMP
