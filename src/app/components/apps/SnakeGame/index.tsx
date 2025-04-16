import React, { useEffect } from 'react'
import SnakeGameApp from './components/SnakeGame'
import { useNavbar, useDispatchWindows } from '@/app/components/pc/drives'

const SnakeGame = ({
  onBlur,
  onFocus,
}: {
  onBlur?: (id: number) => void
  onFocus?: (id: number) => void
}) => {
  const { createDispatchWindow } = useDispatchWindows()
  const { setNavbarContent } = useNavbar()

  const helpDispatchWindow = () => {
    createDispatchWindow({
      title: 'Snake Game Info',
      content: (
        <div className="p-2 max-w-2xl mx-auto text-black bg-gray-100  shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Snake Game Rules
          </h1>

          <p className="mb-4">
            The classic Snake game challenges you to control a snake as it moves
            around the screen, eating food and growing longer with each bite.
            The objective is to collect as much food as possible without
            colliding with the walls or the snake’s own body.
          </p>

          <h2 className="text-2xl font-semibold mb-2">Objective</h2>
          <p className="mb-4">
            Your goal is to eat the food that appears on the screen. Each time
            the snake eats, it grows longer, and your score increases. The
            challenge is to survive as long as possible while your snake becomes
            longer and harder to maneuver.
          </p>

          <h2 className="text-2xl font-semibold mb-2">Gameplay</h2>
          <ol className="list-decimal list-inside mb-4">
            <li>
              <strong>Movement:</strong> Use the arrow keys (or swipe gestures
              on mobile) to control the direction of the snake.
            </li>
            <li>
              <strong>Food Consumption:</strong> When the snake’s head touches
              the food, it eats the food, grows in length, and you earn points.
            </li>
            <li>
              <strong>Collision:</strong> The game ends if the snake collides
              with the boundary of the play area or its own body.
            </li>
            <li>
              <strong>Increasing Difficulty:</strong> As your score increases,
              the snake’s speed increases, making the game progressively more
              challenging.
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mb-2">Controls</h2>
          <ul className="list-disc list-inside mb-4">
            <li>
              <strong>Arrow Keys:</strong> Change the snake’s direction.
            </li>
          </ul>

          <p className="text-center text-gray-700">
            Guide your snake wisely, eat as much food as possible, and try to
            beat your high score!
          </p>
        </div>
      ),
      initialPosition: { x: 100, y: 50 },
      initialSize: { width: 220, height: 350 },
      onClose: () => console.log('Window closed'),
    })
  }

  useEffect(() => {
    // Set custom navbar content when the window opens.
    setNavbarContent(
      <div className="flex items-center space-x-4 gap-4">
        <span className="text-lg font-extrabold">Snake Game</span>
        <button
          className="hover:underline h-full "
          onClick={helpDispatchWindow}
        >
          Info
        </button>
      </div>
    )
    return () => {
      setNavbarContent(null)
      return undefined
    }
  }, [setNavbarContent])

  return (
    <div className="text-black overflow-auto h-full w-full">
      <SnakeGameApp />
    </div>
  )
}

export default SnakeGame
