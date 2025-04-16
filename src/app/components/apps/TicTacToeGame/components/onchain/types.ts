export type GameState = {
  playerX: string
  playerO: string
  winner: string
  isActive: boolean
  board: number[]
  isXNext: boolean
}

export type GameEvent = {
  gameId: string
  player: string
  position?: number
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export type TransactionState = {
  isLoading: boolean
  error: Error | null
  status: 'idle' | 'loading' | 'success' | 'error'
}
