import React, { useState, useEffect } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useWatchContractEvent,
  useChainId,
} from 'wagmi'
import { Button, Button2 } from '@/components/pc/drives/UI/UI_Components.v1'
import { GameStatus, TransactionState } from './types'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './abidetails'
import {
  defaultBlueBG,
  lightBlue,
} from '@/components/pc/drives/Extensions/colors'
import {
  copyToClipboard,
  shortenText,
} from '@/components/pc/drives/Extensions/utils'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/components/library/utils'
import { usePregenTransaction } from '@/components/pc/drives/Storage&Hooks/PregenInteractions'
import { usePregenSession } from '@/components/pc/drives/Storage&Hooks/PregenSession'
import { useNotifications } from '@/components/pc/drives/Extensions/ToastNotifs'

const TicTacToeMP = () => {
  const { address: playerAddress } = useAccount()

  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { isLoginPregenSession, pregenActiveAddress } = usePregenSession()

  const [gameId, setGameId] = useState<string | null>(null)
  const [board, setBoard] = useState<number[]>(Array(9).fill(0))
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING)
  const [queuePosition, setQueuePosition] = useState<number>(0)
  const [isOnChain, setIsOnChain] = useState<boolean>(false)
  const availableChainIds = ['84532']
  const [copied, setCopied] = useState<{
    gameId: boolean
    opponent: boolean
  }>({
    gameId: false,
    opponent: false,
  })
  const [transactions, setTransactions] = useState<
    Record<string, TransactionState>
  >({})
  const [leftGame, setLeftGame] = useState<boolean>(false)

  const { addNotification } = useNotifications()

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
  const address = isConnected
    ? playerAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined
  // Read queue position
  const { data: playerQueuePosition, refetch: refetchQueuePosition } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getPlayerQueuePosition',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && !gameId,
        refetchInterval: 5000,
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
      refetchInterval: 5000,
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
        refetchCurrentGame()
      },
    },
  })

  // Pregen Join Queue Contract Write
  const {
    writeContract: writeJoinQueuePregen,
    data: joinQueueDataPregen,
    isPending: isJoiningQueuePregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {
        updateTransactionState('joinQueue', { status: 'error', error })
      },
      onSuccess: (txHash: any) => {
        updateTransactionState('joinQueue', { status: 'success' })
        refetchQueuePosition()
        refetchCurrentGame()
      },
    },
  })

  // Exit match Contract Write
  const {
    writeContract: writeExitMatch,
    data: exitMatchData,
    isPending: isExitingMatch,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {
        updateTransactionState('leaveGame', { status: 'error', error })
      },
      onSuccess: (txHash: any) => {
        updateTransactionState('leaveGame', { status: 'success' })
        setLeftGame(true)
        setGameStatus(GameStatus.FINISHED)
      },
    },
  })

  // Pregen Exit match Contract Write
  const {
    writeContract: writeExitMatchPregen,
    data: exitMatchDataPregen,
    isPending: isExitingMatchPregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {
        updateTransactionState('leaveGame', { status: 'error', error })
      },
      onSuccess: (txHash: any) => {
        updateTransactionState('leaveGame', { status: 'success' })
        setLeftGame(true)
        setGameStatus(GameStatus.FINISHED)
      },
    },
  })

  // Wait for exitMatch transaction
  const { isLoading: isWaitingForExitMatch } = useWaitForTransactionReceipt({
    hash: isConnected ? exitMatchData : exitMatchDataPregen,
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

  // Pregen Leave Queue Contract Write
  const {
    writeContract: writeLeaveQueuePregen,
    data: leaveQueueDataPregen,
    isPending: isLeavingQueuePregen,
  } = usePregenTransaction({
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
    hash: isConnected ? joinQueueData : joinQueueDataPregen,
  })

  // Wait for leaveQueue transaction
  const { isLoading: isWaitingForLeaveQueue } = useWaitForTransactionReceipt({
    hash: isConnected ? leaveQueueData : leaveQueueDataPregen,
  })

  // Read Game State
  const { data: gameState, refetch: refetchGameState } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getGameState',
    args: gameId ? [gameId.toString()] : undefined,
    query: {
      enabled: !!gameId,
      refetchInterval: 3000,
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

  // Pregen Make Move Contract Write
  const {
    writeContract: writeMakeMovePregen,
    data: moveDataPregen,
    isPending: isMakingMovePregen,
  } = usePregenTransaction({
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
    hash: isConnected ? moveData : moveDataPregen,
  })

  // Only watch PlayersMatched event since it's needed for game initialization
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'PlayersMatched',
    onLogs(logs: any) {
      const { gameId, player1, player2 } = logs[0].args
      if (player1 === address || player2 === address) {
        setGameId(gameId.toString())
        setGameStatus(GameStatus.PLAYING)
        setQueuePosition(0)
        setLeftGame(false)
        refetchGameState()
        refetchCurrentGame()
      }
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
    if (!isOnChain) {
      return
    }
    if (!gameId || !gameState?.[1]) return
    updateTransactionState('makeMove', { status: 'loading' })
    try {
      if (isConnected) {
        await writeMakeMove({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'makeMove',
          args: [gameId.toString(), position],
        })
      } else if (isLoginPregenSession) {
        await writeMakeMovePregen({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'makeMove',
          args: [gameId.toString(), position],
        })
      }
    } catch (error) {
      console.error('Error making move:', error)
    }
  }

  const handleResetGame = () => {
    setGameId(null)
    setBoard(Array(9).fill(0))
    setGameStatus(GameStatus.WAITING)
    setQueuePosition(0)
    setLeftGame(false)
  }

  const handleJoinQueue = async () => {
    if (!isOnChain) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (isConnected) {
      await writeJoinQueue({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'joinQueue',
        args: [],
      })
    } else if (isLoginPregenSession) {
      await writeJoinQueuePregen({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'joinQueue',
        args: [],
      })
    }
  }

  const handleLeaveQueue = async () => {
    if (!isOnChain) {
      return
    }
    if (isConnected) {
      await writeLeaveQueue({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'leaveQueue',
        args: [],
      })
    } else if (isLoginPregenSession) {
      await writeLeaveQueuePregen({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'leaveQueue',
        args: [],
      })
    }
  }

  const handleExitMatch = async () => {
    if (!isOnChain) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
      })
      return
    }
    if (isConnected) {
      await writeExitMatch({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'leaveGame',
        args: [],
      })
    } else if (isLoginPregenSession) {
      await writeExitMatchPregen({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'leaveGame',
        args: [],
      })
    }
  }

  useEffect(() => {
    const isChainUnavailable = !availableChainIds.some(
      (chain) => Number(chain) === chainId
    )
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
      })
    }
    setIsOnChain(!isChainUnavailable)
  }, [chainId])

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
              gameStatus === GameStatus.FINISHED ||
              value !== 0 ||
              (isConnected ? isMakingMove : isMakingMovePregen) ||
              isWaitingForMove ||
              //Lower case the comparison
              (gameState?.[5] // isXNext
                ? gameState?.[0].toLowerCase() !== address // playerX
                : gameState?.[1].toLowerCase() !== address) // playerO
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
                (isConnected ? isMakingMove : isMakingMovePregen) ||
                isWaitingForMove
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
          ? gameState?.[0].toLowerCase() === address
          : gameState?.[1].toLowerCase() === address
        return (
          <div className="mt-1">
            <div
              className={`text-blue-500 ${
                (isConnected ? isMakingMove : isMakingMovePregen) ||
                isWaitingForMove
                  ? 'animate-pulse'
                  : ''
              }`}
            >
              {gameState?.[5] ? 'X' : 'O'}'s turn
              {((isConnected ? isMakingMove : isMakingMovePregen) ||
                isWaitingForMove) &&
                ' (Processing...)'}
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
          <div className="space-y-2 mt-1">
            <div
              className={`text-green-500 ${
                leftGame
                  ? 'text-red-500'
                  : gameState?.[2].toLowerCase() === address
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              Game Over -{' '}
              {leftGame
                ? 'You forfeited the game!'
                : gameState?.[2].toLowerCase() === address
                ? 'You won!'
                : 'Opponent won!'}
            </div>
            <Button2
              onClick={handleResetGame}
              className="w-full text-white py-2 rounded-sm bg-[#2563eb] hover:bg-[#1e4388]"
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
    <div className="flex flex-col items-center">
      <div className="mt-1 mb-1">
        {!gameId ? (
          <div className="flex flex-col mt-2 gap-2 items-center">
            <Button
              onClick={handleJoinQueue}
              className={cn(
                'w-full text-white py-2 mb-0 mt-2 rounded-sm transition duration-200',
                `${
                  (isConnected ? isJoiningQueue : isJoiningQueuePregen) ||
                  isWaitingForJoinQueue
                    ? 'opacity-50'
                    : ''
                }`
              )}
              style={{
                backgroundColor: lightBlue,
                transition: 'all 0.2s',
              }}
              disabled={
                (isConnected ? isJoiningQueue : isJoiningQueuePregen) ||
                isWaitingForJoinQueue ||
                queuePosition > 0
              }
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  defaultBlueBG)
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  lightBlue)
              }
            >
              {(isConnected ? isJoiningQueue : isJoiningQueuePregen) ||
              isWaitingForJoinQueue
                ? 'Joining Queue...'
                : queuePosition > 0
                ? `In Queue - Position ${queuePosition}`
                : 'Join Queue'}
            </Button>

            {queuePosition > 0 && (
              <Button
                onClick={handleLeaveQueue}
                disabled={
                  (isConnected ? isLeavingQueue : isLeavingQueuePregen) ||
                  isWaitingForLeaveQueue
                }
                className={`w-full text-white py-2 mb-0 rounded-sm transition-colors duration-200 bg-[#ef4444] hover:bg-red-300 ${
                  (isConnected ? isLeavingQueue : isLeavingQueuePregen) ||
                  isWaitingForLeaveQueue
                    ? 'opacity-50'
                    : ''
                }`}
              >
                <span className="transition-all duration-200 block">
                  {(isConnected ? isLeavingQueue : isLeavingQueuePregen) ||
                  isWaitingForLeaveQueue
                    ? 'Leaving Queue...'
                    : 'Leave Queue'}
                </span>
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 hover:bg-gray-100 rounded-sm transition-colors duration-200">
              <span className="font-medium">
                Game ID: {shortenText(gameId, 7, 7)}
              </span>
              {copied.gameId ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => {
                    copyToClipboard(gameId)

                    setCopied((prev) => ({ ...prev, gameId: true }))
                    setTimeout(
                      () => setCopied((prev) => ({ ...prev, gameId: false })),
                      2000
                    )
                  }}
                />
              )}
            </div>
            <div className="flex font-medium items-center justify-center gap-2 hover:bg-gray-100 rounded-sm transition-colors duration-200">
              {gameState && (
                <>
                  {gameState[0]?.toLowerCase() !== address ? (
                    <>Opponent (X): {shortenText(gameState[0], 5, 5)}</>
                  ) : gameState[1]?.toLowerCase() !== address ? (
                    <>Opponent (O): {shortenText(gameState[1], 5, 5)}</>
                  ) : null}
                  {copied.opponent ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => {
                        copyToClipboard(
                          gameState[0].toLowerCase() !== address
                            ? gameState[0]
                            : gameState[1]
                        )
                        setCopied((prev) => ({ ...prev, opponent: true }))
                        setTimeout(
                          () =>
                            setCopied((prev) => ({ ...prev, opponent: false })),
                          2000
                        )
                      }}
                    />
                  )}
                </>
              )}
            </div>
            {renderGameStatus()}
          </div>
        )}
      </div>
      <div className="flex justify-center mt-3">{renderBoard()}</div>
      {gameId && gameStatus === GameStatus.PLAYING && (
        <div>
          <Button2
            disabled={
              (isConnected ? isExitingMatch : isExitingMatchPregen) ||
              isWaitingForExitMatch
            }
            onClick={handleExitMatch}
            className={`w-full mt-4 text-white py-2 rounded-sm bg-[#2563eb] hover:bg-[#1e4388] ${
              (isConnected ? isExitingMatch : isExitingMatchPregen) ||
              isWaitingForExitMatch
                ? 'opacity-50'
                : ''
            }`}
          >
            {(isConnected ? isExitingMatch : isExitingMatchPregen) ||
            isWaitingForExitMatch
              ? 'Leaving Match...'
              : 'Leave Match'}
          </Button2>
        </div>
      )}
    </div>
  )
}

export default TicTacToeMP
