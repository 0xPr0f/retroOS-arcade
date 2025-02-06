export interface Vector2 {
  x: number
  y: number
}

export interface Player {
  position: Vector2
  rotation: number
  health: number
  speed: number
}

export interface Enemy {
  id: string
  position: Vector2
  rotation: number
  health: number
  speed: number
}

export interface Bullet {
  id: string
  position: Vector2
  velocity: Vector2
  damage: number
}

export interface GameState {
  player: Player
  enemies: Enemy[]
  bullets: Bullet[]
  score: number
}
