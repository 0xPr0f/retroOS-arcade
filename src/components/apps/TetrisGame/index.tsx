import { useDispatchWindows, useNavbar } from '@/components/pc/drives'
import { Button2 } from '@/components/pc/drives/UI/UI_Components.v1'
import React, { useEffect } from 'react'

const TetrisGame = ({
  onBlur,
  onFocus,
}: {
  onBlur?: (id: number) => void
  onFocus?: (id: number) => void
}) => {
  const { createDispatchWindow } = useDispatchWindows()
  const { setNavbarContent } = useNavbar()

  useEffect(() => {
    if (onFocus) {
      console.log('focus', 2)
    }
  }, [onFocus])

  const helpDispatchWindow = () => {
    createDispatchWindow({
      title: 'Tetris Game Info',
      content: (
        <div className="text-black">
          <div className="p-2 max-w-2xl mx-auto bg-gray-100 rounded shadow-lg">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Tetris Rules
            </h1>

            <p className="mb-4">
              Tetris is a classic tile-matching puzzle game where falling
              tetrominoes must be arranged to form complete horizontal lines.
              When a line is completed, it disappears and the player earns
              points.
            </p>

            <h2 className="text-2xl font-semibold mb-2">Objective</h2>
            <p className="mb-4">
              The goal is to clear as many lines as possible by strategically
              placing and rotating the tetrominoes. The game speeds up as you
              clear more lines, and the challenge increases with each level.
            </p>

            <h2 className="text-2xl font-semibold mb-2">Gameplay</h2>
            <ol className="list-decimal list-inside mb-4">
              <li>
                <strong>Falling Pieces:</strong> Tetrominoes fall from the top
                of the screen. You can move them left or right and rotate them
                to fit into gaps.
              </li>
              <li>
                <strong>Line Clearing:</strong> When a complete horizontal line
                is formed, that line is cleared, and any blocks above it drop
                down.
              </li>
              <li>
                <strong>Scoring:</strong> Points are awarded based on the number
                of lines cleared at once. Clearing multiple lines simultaneously
                results in a higher score.
              </li>
              <li>
                <strong>Levels:</strong> As you clear lines, the game increases
                in level, causing the tetrominoes to fall faster.
              </li>
              <li>
                <strong>Game Over:</strong> The game ends when there is no space
                to place a new tetromino.
              </li>
            </ol>

            <h2 className="text-2xl font-semibold mb-2">Controls</h2>
            <ul className="list-disc list-inside mb-4">
              <li>
                <strong>Left/Right Arrow:</strong> Move the tetromino left or
                right.
              </li>
              <li>
                <strong>Up Arrow:</strong> Rotate the tetromino.
              </li>
              <li>
                <strong>Down Arrow:</strong> Soft drop (increase the falling
                speed).
              </li>
              <li>
                <strong>Spacebar:</strong> Hard drop (instantly place the
                tetromino).
              </li>
            </ul>

            <p className="text-center text-gray-600">
              Enjoy the challenge of Tetris and aim for the highest score!
            </p>
          </div>
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
      <div className="flex items-center space-x-4 border gap-4 border-black">
        <span className="text-lg font-extrabold">Tetris Game</span>
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
    <div>
      TetrisGame
      <Button2
        onClick={async () => {
          console.log('click')
          setNavbarContent(<div>THis is a 2 test</div>)
        }}
      >
        Test on chain
      </Button2>
    </div>
  )
}

export default TetrisGame
