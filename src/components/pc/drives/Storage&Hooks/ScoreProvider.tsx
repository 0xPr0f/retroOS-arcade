import axios from 'axios'
import React, { createContext, useContext, useState, useEffect } from 'react'

const GameType = {
  SNAKE: 0,
  TETRIS: 1,
}

const GameScoreContext = createContext<any>(null)

export const GameScoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scoreData, setScoreData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedScores = localStorage.getItem('gameScores')
    if (storedScores) {
      try {
        setScoreData(JSON.parse(storedScores))
      } catch (err) {
        console.error('Error parsing stored scores:', err)
        localStorage.removeItem('gameScores')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('gameScores', JSON.stringify(scoreData))
  }, [scoreData])

  const submitScore = async (
    player: string,
    score: number,
    gameType: number
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const scoreData = {
        player,
        score,
        gameType,
        timestamp: Date.now(),
      }

      const response = await axios.post('/api/verify/score', scoreData)

      if (response.status !== 200) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        )
      }

      const result = response.data

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign score')
      }

      const newScoreEntry = {
        id: Date.now().toString(),
        player,
        score,
        gameType,
        signature: result.signature,
        timestamp: Date.now(),
      }

      setScoreData((prevData) => [...prevData, newScoreEntry])

      setIsLoading(false)
      return {
        success: true,
        id: newScoreEntry.id,
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error submitting score:', err)
      setError(errorMessage)
      setIsLoading(false)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const getAllScores = () => {
    return scoreData
  }

  const getScoresByAddress = (address: string) => {
    if (!address) return []

    return scoreData.filter(
      (item) =>
        item.player && item.player.toLowerCase() === address.toLowerCase()
    )
  }

  const removeScore = (id: string) => {
    setScoreData((prevData) => prevData.filter((item) => item.id !== id))
    return true
  }

  const clearAllScores = () => {
    setScoreData([])
    localStorage.removeItem('gameScores')
    return true
  }

  const formatScoresForContract = (address: string | null = null) => {
    const filteredScores = address ? getScoresByAddress(address) : scoreData

    const players: string[] = []
    const scores: number[] = []
    const gameTypes: number[] = []
    const signatures: string[] = []

    filteredScores.forEach((item) => {
      players.push(item.player)
      scores.push(item.score)
      gameTypes.push(item.gameType)
      signatures.push(item.signature)
    })

    return {
      player: players,
      scores,
      gameTypes,
      signatures,
    }
  }

  const value = {
    submitScore,
    getAllScores,
    getScoresByAddress,
    removeScore,
    clearAllScores,
    formatScoresForContract,
    scoreData,
    isLoading,
    error,
  }

  return (
    <GameScoreContext.Provider value={value}>
      {children}
    </GameScoreContext.Provider>
  )
}

export const useGameScores = () => {
  const context = useContext(GameScoreContext)
  if (!context) {
    throw new Error('useGameScores must be used within a GameScoreProvider')
  }
  return context
}

export { GameType }
