import React, { useState, useEffect } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useWatchContractEvent,
  useChainId,
} from 'wagmi'
import { Button, Button2 } from '@/app/components/pc/drives/UI/UI_Components.v1'
import { GameStatus, TransactionState } from './types'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './abidetails'
import {
  copyToClipboard,
  shortenText,
} from '@/app/components/pc/drives/Extensions/utils'
import { Check, Copy, X, Circle, Clock, Trophy, Loader2 } from 'lucide-react'
import { cn } from '@/app/components/library/utils'
import { usePregenTransaction } from '@/app/components/pc/drives/Storage&Hooks/PregenInteractions'
import { usePregenSession } from '@/app/components/pc/drives/Storage&Hooks/PregenSession'
import { useNotifications } from '@/app/components/pc/drives/Extensions/ToastNotifs'
import { zeroAddress, zeroHash } from 'viem'

const TicTacToeMP = () => {
  const { address: playerAddress, isConnected } = useAccount()
  const chainId = useChainId()
  const { isLoginPregenSession, pregenActiveAddress, isSmartAccount } =
    usePregenSession()

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
  const [lastMove, setLastMove] = useState<number | null>(null) // Track last move for animation

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
  const { isLoading: isWaitingForExitMatchT } = useWaitForTransactionReceipt({
    hash: isConnected ? exitMatchData : exitMatchDataPregen,
  })

  const isWaitingForExitMatch = isSmartAccount ? false : isWaitingForExitMatchT
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
  const { isLoading: isWaitingForJoinQueueT } = useWaitForTransactionReceipt({
    hash: isConnected ? joinQueueData : joinQueueDataPregen,
  })

  const isWaitingForJoinQueue = isSmartAccount ? false : isWaitingForJoinQueueT

  // Wait for leaveQueue transaction
  const { isLoading: isWaitingForLeaveQueueT } = useWaitForTransactionReceipt({
    hash: isConnected ? leaveQueueData : leaveQueueDataPregen,
  })
  const isWaitingForLeaveQueue = isSmartAccount
    ? false
    : isWaitingForLeaveQueueT

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

  const { isLoading } = useWaitForTransactionReceipt({
    hash: isConnected ? moveData : moveDataPregen,
  })
  const isWaitingForMove = isSmartAccount ? false : isLoading

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
      currentGame !== zeroHash
    ) {
      setGameId(currentGame)
      refetchGameState()
    }
  }, [currentGame])

  useEffect(() => {
    if (gameState) {
      setBoard(gameState[4])
      if (gameState[2] !== zeroAddress) {
        setGameStatus(GameStatus.FINISHED)
      } else if (gameState[1] !== zeroAddress) {
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
    setLastMove(position) // Track the last move for animation
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
      addNotification({
        title: `Error making move`,
        message: `Something went wrong. Please try again. or Refresh the page.`,
        type: 'error',
      })
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

  // Get the winning line for highlighting
  const getWinningLine = () => {
    if (gameStatus !== GameStatus.FINISHED || leftGame) return null

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
      if (board[a] > 0 && board[a] === board[b] && board[a] === board[c]) {
        return line
      }
    }

    return null
  }

  const renderBoard = () => {
    const winningLine = getWinningLine()

    return (
      <div className="grid grid-cols-3 gap-2 w-72 h-72">
        {board.map((value, index) => {
          const isWinningCell = winningLine?.includes(index)
          const isLastMoveCell = lastMove === index
          const canPlay =
            gameState?.[1] &&
            gameStatus === GameStatus.PLAYING &&
            value === 0 &&
            !(
              (isConnected ? isMakingMove : isMakingMovePregen) ||
              isWaitingForMove
            ) &&
            (gameState?.[5] // isXNext
              ? gameState?.[0].toLowerCase() === address // playerX
              : gameState?.[1].toLowerCase() === address) // playerO

          return (
            <div
              key={index}
              className={`relative bg-gray-800/40 rounded-lg border ${
                isWinningCell
                  ? value === 1
                    ? 'border-blue-500/70'
                    : 'border-red-500/70'
                  : 'border-gray-700/30'
              } transition-all duration-300`}
            >
              <button
                onClick={() => handleMove(index)}
                disabled={!canPlay}
                className={`
                  w-full h-full flex items-center justify-center rounded-lg 
                  ${canPlay ? 'hover:bg-gray-700/50' : ''}
                  ${
                    (isConnected ? isMakingMove : isMakingMovePregen) ||
                    isWaitingForMove
                      ? 'cursor-wait'
                      : ''
                  }
                  transition-colors
                `}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {value === 1 && (
                    <div
                      className={`${
                        isLastMoveCell ? 'animate-pulse-once' : ''
                      }`}
                    >
                      <X className="h-10 w-10 text-blue-500" strokeWidth={3} />
                    </div>
                  )}
                  {value === 2 && (
                    <div
                      className={`${
                        isLastMoveCell ? 'animate-pulse-once' : ''
                      }`}
                    >
                      <Circle
                        className="h-9 w-9 text-red-500"
                        strokeWidth={3}
                      />
                    </div>
                  )}
                </div>
                {(isConnected ? isMakingMove : isMakingMovePregen) &&
                  lastMove === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                      <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                    </div>
                  )}
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  const renderGameInfo = () => {
    if (!gameId) return null

    return (
      <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Game ID</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-mono text-gray-300">
              {shortenText(gameId, 6, 6)}
            </span>
            {copied.gameId ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy
                className="w-3.5 h-3.5 cursor-pointer text-gray-500 hover:text-gray-300 transition-colors"
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
        </div>

        {gameState && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-400">
              {gameState[0]?.toLowerCase() !== address
                ? 'Opponent (X)'
                : 'Opponent (O)'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-mono text-gray-300">
                {shortenText(
                  gameState[0]?.toLowerCase() !== address
                    ? gameState[0]
                    : gameState[1],
                  5,
                  5
                )}
              </span>
              {copied.opponent ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy
                  className="w-3.5 h-3.5 cursor-pointer text-gray-500 hover:text-gray-300 transition-colors"
                  onClick={() => {
                    copyToClipboard(
                      gameState[0].toLowerCase() !== address
                        ? gameState[0]
                        : gameState[1]
                    )
                    setCopied((prev) => ({ ...prev, opponent: true }))
                    setTimeout(
                      () => setCopied((prev) => ({ ...prev, opponent: false })),
                      2000
                    )
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderGameStatus = () => {
    if (queuePosition > 0) {
      return (
        <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 mb-3">
          <Clock className="w-4 h-4" />
          <span>In Queue - Position: {queuePosition}</span>
        </div>
      )
    }

    switch (gameStatus) {
      case GameStatus.WAITING:
        return (
          <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 mb-3">
            <Clock className="w-4 h-4" />
            <span>Waiting for opponent...</span>
          </div>
        )
      case GameStatus.PLAYING:
        const isYourTurn = gameState?.[5]
          ? gameState?.[0].toLowerCase() === address
          : gameState?.[1].toLowerCase() === address
        return (
          <div className="space-y-2 mb-3">
            <div
              className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              ${
                gameState?.[5]
                  ? 'bg-blue-500/20 border border-blue-500/50'
                  : 'bg-red-500/20 border border-red-500/50'
              }
              ${
                (isConnected ? isMakingMove : isMakingMovePregen) ||
                isWaitingForMove
                  ? 'animate-pulse'
                  : ''
              }
            `}
            >
              <div
                className={`
                w-4 h-4 rounded-full flex items-center justify-center
                ${gameState?.[5] ? 'text-blue-500' : 'text-red-500'}
              `}
              >
                {gameState?.[5] ? <X size={14} /> : <Circle size={12} />}
              </div>
              <span className="font-medium text-sm">
                {(isConnected ? isMakingMove : isMakingMovePregen) ||
                isWaitingForMove
                  ? 'Processing move...'
                  : `${gameState?.[5] ? 'X' : 'O'}'s turn`}
              </span>
            </div>

            <div
              className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              ${
                isYourTurn
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-gray-700/30 border border-gray-600/30 text-gray-400'
              }
            `}
            >
              <span className="font-medium text-sm">
                {isYourTurn ? 'Your turn to play!' : "Opponent's turn to play"}
              </span>
            </div>
          </div>
        )
      case GameStatus.FINISHED:
        return (
          <div className="space-y-2 mb-3">
            <div
              className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              ${
                leftGame
                  ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                  : gameState?.[2].toLowerCase() === address
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }
            `}
            >
              {leftGame ? (
                <span className="font-medium text-sm">
                  You forfeited the game!
                </span>
              ) : gameState?.[2].toLowerCase() === address ? (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-sm">You won!</span>
                </div>
              ) : (
                <span className="font-medium text-sm">Opponent won!</span>
              )}
            </div>

            <button
              onClick={handleResetGame}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm"
            >
              <span>Start New Game</span>
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Game info */}
      {gameId && renderGameInfo()}

      {/* Status */}
      {renderGameStatus()}

      <div className="flex justify-center">{renderBoard()}</div>

      {/* Action buttons */}
      {!gameId ? (
        <div className="flex flex-col gap-2 w-full mt-4">
          <button
            onClick={handleJoinQueue}
            disabled={
              (isConnected ? isJoiningQueue : isJoiningQueuePregen) ||
              isWaitingForJoinQueue ||
              queuePosition > 0
            }
            className={`
              w-full flex items-center justify-center gap-2
              py-2 px-4 rounded-lg transition-colors
              ${
                queuePosition > 0
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } 
              text-white font-medium
              ${
                (isConnected ? isJoiningQueue : isJoiningQueuePregen) ||
                isWaitingForJoinQueue
                  ? 'opacity-70 cursor-wait'
                  : ''
              }
            `}
          >
            {(isConnected ? isJoiningQueue : isJoiningQueuePregen) ||
            isWaitingForJoinQueue ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Joining Queue...</span>
              </>
            ) : queuePosition > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                <span>In Queue - Position {queuePosition}</span>
              </>
            ) : (
              <span>Join Queue</span>
            )}
          </button>

          {queuePosition > 0 && (
            <button
              onClick={handleLeaveQueue}
              disabled={
                (isConnected ? isLeavingQueue : isLeavingQueuePregen) ||
                isWaitingForLeaveQueue
              }
              className={`
                w-full flex items-center justify-center gap-2
                py-2 px-4 rounded-lg transition-colors
                bg-red-600 hover:bg-red-700 text-white font-medium
                ${
                  (isConnected ? isLeavingQueue : isLeavingQueuePregen) ||
                  isWaitingForLeaveQueue
                    ? 'opacity-70 cursor-wait'
                    : ''
                }
              `}
            >
              {(isConnected ? isLeavingQueue : isLeavingQueuePregen) ||
              isWaitingForLeaveQueue ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Leaving Queue...</span>
                </>
              ) : (
                <span>Leave Queue</span>
              )}
            </button>
          )}
        </div>
      ) : gameStatus === GameStatus.PLAYING ? (
        <button
          disabled={
            (isConnected ? isExitingMatch : isExitingMatchPregen) ||
            isWaitingForExitMatch
          }
          onClick={handleExitMatch}
          className={`
            w-full flex items-center justify-center gap-2
            py-2 px-4 rounded-lg transition-colors
            bg-red-600 hover:bg-red-700 text-white font-medium mt-4
            ${
              (isConnected ? isExitingMatch : isExitingMatchPregen) ||
              isWaitingForExitMatch
                ? 'opacity-70 cursor-wait'
                : ''
            }
          `}
        >
          {(isConnected ? isExitingMatch : isExitingMatchPregen) ||
          isWaitingForExitMatch ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Leaving Match...</span>
            </>
          ) : (
            <span>Leave Match</span>
          )}
        </button>
      ) : null}

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

export default TicTacToeMP
