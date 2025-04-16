import React, { useState, useEffect } from 'react'
import {
  useGameScores,
  GameType,
  usePregenSession,
  usePregenTransaction,
  useNotifications,
} from '@/app/components/pc/drives'
import { useAccount, useChainId, useWriteContract } from 'wagmi'
import { SCORE_VERIFIER_ABI, SCORE_VERIFIER_ADDRESS } from './onchain/details'

interface GameScore {
  id: string
  player: string
  score: number
  gameType: typeof GameType
  timestamp: number
  signature: string
}

const GameScoreContent = () => {
  const {
    getAllScores,
    getScoresByAddress,
    removeScore,
    formatScoresForContract,
    clearAllScores,
  } = useGameScores()

  const [filteredScores, setFilteredScores] = useState<GameScore[]>([])
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [scoreToRemove, setScoreToRemove] = useState<GameScore | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const { isLoginPregenSession, pregenActiveAddress } = usePregenSession()
  const { address: UserAddress, isConnected } = useAccount()

  const currentAddress = isConnected
    ? UserAddress?.toLowerCase()
    : isLoginPregenSession
    ? pregenActiveAddress?.toLowerCase()
    : undefined

  const chainId = useChainId()
  const [viewAddress, setViewAddress] = useState(currentAddress)
  const { addNotification } = useNotifications()
  // Get scores for the current address
  useEffect(() => {
    if (viewAddress) {
      setFilteredScores(getScoresByAddress(viewAddress))
    } else {
      setFilteredScores(getAllScores())
    }
  }, [viewAddress, getAllScores, getScoresByAddress])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewAddress(e.target.value)
  }

  const handleRemoveClick = (score: GameScore) => {
    setScoreToRemove(score)
    setShowRemoveConfirm(true)
  }

  const confirmRemove = () => {
    if (scoreToRemove) {
      removeScore(scoreToRemove.id)
      setShowRemoveConfirm(false)
      setScoreToRemove(null)
      if (viewAddress) {
        setFilteredScores(getScoresByAddress(viewAddress))
      } else {
        setFilteredScores(getAllScores())
      }
    }
  }

  const handleClearClick = () => {
    setShowClearConfirm(true)
  }

  const confirmClear = () => {
    const addressScores = getScoresByAddress(viewAddress)

    addressScores.forEach((score: GameScore) => {
      removeScore(score.id)
    })

    setShowClearConfirm(false)
    setFilteredScores([])
  }

  const formatGameType = (type: number) => {
    switch (type) {
      case GameType.SNAKE:
        return 'Snake Game'
      case GameType.TETRIS:
        return 'Tetris Game'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const availableChainIds = ['84532']
  const isChainUnavailable = !availableChainIds.some(
    (chain) => Number(chain) === chainId
  )

  const {
    writeContract: writeSyncScore,
    data: syncScoreData,
    isPending: isSyncScore,
    error: syncScoreError,
  } = useWriteContract({
    mutation: {
      onError: (error: any) => {
        console.log(error)
      },
      onSuccess: (txHash: any) => {
        confirmClear()
      },
    },
  })

  // Pregen Join Queue Contract Write
  const {
    writeContract: writeSyncScorePregen,
    data: syncScoreDataPregen,
    isPending: isSyncScorePregen,
  } = usePregenTransaction({
    mutation: {
      onError: (error: any) => {
        console.log(error)
      },
      onSuccess: (txHash: any) => {
        confirmClear()
      },
    },
  })

  const handleSyncScoreToBlockchain = async (scoreData: any) => {
    if (isChainUnavailable) {
      addNotification({
        title: `Chain Unavailable`,
        message: `This chain is not available. Please use base sepolia.`,
        type: 'error',
        duration: 10000,
      })
      return
    }
    if (isConnected) {
      await writeSyncScore({
        address: SCORE_VERIFIER_ADDRESS,
        abi: SCORE_VERIFIER_ABI,
        functionName: 'batchSubmitScores',
        args: [
          scoreData.player,
          scoreData.scores,
          scoreData.gameTypes,
          scoreData.signatures,
        ],
      })
    } else if (isLoginPregenSession) {
      await writeSyncScorePregen({
        address: SCORE_VERIFIER_ADDRESS,
        abi: SCORE_VERIFIER_ABI,
        functionName: 'batchSubmitScores',
        args: [
          scoreData.player,
          scoreData.scores,
          scoreData.gameTypes,
          scoreData.signatures,
        ],
      })
    }
  }

  const handleSyncToBlockchain = () => {
    try {
      let contractData = formatScoresForContract(viewAddress)

      if (contractData.player[0].length > 1) {
        contractData.player = contractData.player[0]
      }
      setSyncSuccess(true)
      console.log(contractData)
      handleSyncScoreToBlockchain(contractData)
      setTimeout(() => setSyncSuccess(false), 3000)
    } catch (error) {
      console.log(error)
      addNotification({
        title: `Error`,
        message: `Error syncing scores to blockchain. Please try again.`,
        type: 'error',
        duration: 10000,
      })
    }
  }

  return (
    <div className="min-h-full bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-purple-400">
            Game Scores
          </h1>

          {/* Address Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Filter by Player Address
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={viewAddress}
                onChange={handleAddressChange}
                placeholder="Enter player address (0x...)"
                className="flex-1 bg-gray-800/70 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {viewAddress && (
                <button
                  onClick={() => setViewAddress('')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Scores List */}
          <div className="bg-gray-800/70 rounded-lg border border-gray-700/50 overflow-hidden mb-6">
            {filteredScores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Player
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Score
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Game Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredScores.map((score) => (
                      <tr key={score.id} className="hover:bg-gray-700/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-300">
                            {score.player.substring(0, 6)}...
                            {score.player.substring(score.player.length - 4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xl font-bold text-green-400">
                            {score.score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-blue-400">
                            {formatGameType(Number(score.gameType))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(score.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveClick(score)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                {viewAddress ? (
                  <p>No scores found for this address.</p>
                ) : (
                  <p>No scores found. Play some games first!</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-end">
            {viewAddress && filteredScores.length > 0 && (
              <button
                onClick={handleClearClick}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg"
              >
                Clear All for This Address
              </button>
            )}

            {filteredScores.length > 0 && (
              <button
                onClick={handleSyncToBlockchain}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors shadow-lg"
              >
                Sync to Blockchain
              </button>
            )}
          </div>

          {syncSuccess && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-400 text-center animate-pulse">
              Scores ready for blockchain synchronization!
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg shadow-lg bg-gray-800 border border-gray-700 text-center max-w-sm">
            <p className="text-xl font-bold mb-4 text-red-400">Remove Score</p>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove this score?
              <br />
              <span className="text-green-400 font-bold">
                {scoreToRemove?.score}
              </span>{' '}
              points on{' '}
              {scoreToRemove?.timestamp
                ? formatDate(scoreToRemove.timestamp)
                : ''}
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg shadow-lg bg-gray-800 border border-gray-700 text-center max-w-sm">
            <p className="text-xl font-bold mb-4 text-red-400">
              Clear All Scores
            </p>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove all scores for address:
              <br />
              <span className="text-blue-400 font-medium break-all">
                {viewAddress}
              </span>
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameScoreContent
