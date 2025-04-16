'use client'

import React from 'react'
import { lightBlue, weirdBlue, lightRed } from '../Extensions/colors'

const Loading = () => {
  const circles = [
    { x: 120, y: 80, size: 4, color: lightBlue },
    { x: 300, y: 150, size: 3, color: weirdBlue },
    { x: 500, y: 200, size: 7, color: lightRed },
    { x: 700, y: 300, size: 4, color: lightBlue },
    { x: 200, y: 400, size: 5, color: weirdBlue },
    { x: 900, y: 100, size: 3, color: lightRed },
    { x: 400, y: 500, size: 5, color: lightBlue },
    { x: 600, y: 250, size: 4, color: weirdBlue },
    { x: 800, y: 450, size: 3, color: lightRed },
    { x: 100, y: 600, size: 4, color: lightBlue },

    { x: 150, y: 700, size: 5, color: weirdBlue },
    { x: 350, y: 650, size: 4, color: lightRed },
    { x: 550, y: 750, size: 4, color: lightBlue },
    { x: 750, y: 650, size: 3, color: weirdBlue },
    { x: 950, y: 700, size: 7, color: lightRed },
    { x: 850, y: 500, size: 5, color: lightBlue },
    { x: 650, y: 100, size: 4, color: weirdBlue },
    { x: 450, y: 50, size: 4, color: lightRed },
    { x: 250, y: 20, size: 3, color: lightBlue },
    { x: 50, y: 50, size: 5, color: weirdBlue },

    { x: 100, y: 100, size: 3, color: lightRed },
    { x: 200, y: 120, size: 4, color: lightBlue },
    { x: 300, y: 100, size: 4, color: weirdBlue },
    { x: 400, y: 120, size: 5, color: lightRed },
    { x: 500, y: 100, size: 3, color: lightBlue },
    { x: 600, y: 120, size: 5, color: weirdBlue },
    { x: 700, y: 100, size: 3, color: lightRed },
    { x: 800, y: 120, size: 4, color: lightBlue },
    { x: 900, y: 100, size: 4, color: weirdBlue },
    { x: 100, y: 200, size: 5, color: lightRed },

    { x: 200, y: 250, size: 7, color: lightBlue },
    { x: 300, y: 300, size: 3, color: weirdBlue },
    { x: 400, y: 350, size: 4, color: lightRed },
    { x: 500, y: 400, size: 5, color: lightBlue },
    { x: 600, y: 450, size: 4, color: weirdBlue },
    { x: 700, y: 500, size: 5, color: lightRed },
    { x: 800, y: 550, size: 3, color: lightBlue },
    { x: 900, y: 600, size: 4, color: weirdBlue },
    { x: 100, y: 650, size: 5, color: lightRed },
    { x: 200, y: 700, size: 4, color: lightBlue },

    { x: 300, y: 750, size: 5, color: weirdBlue },
    { x: 400, y: 800, size: 3, color: lightRed },
    { x: 500, y: 750, size: 4, color: lightBlue },
    { x: 600, y: 700, size: 5, color: weirdBlue },
    { x: 700, y: 650, size: 4, color: lightRed },
    { x: 800, y: 600, size: 5.5, color: lightBlue },
    { x: 900, y: 550, size: 3.5, color: weirdBlue },
    { x: 50, y: 750, size: 4.5, color: lightRed },
    { x: 150, y: 800, size: 5.0, color: lightBlue },
    { x: 250, y: 750, size: 4.0, color: weirdBlue },

    { x: 350, y: 700, size: 5.5, color: lightRed },
    { x: 450, y: 650, size: 3.5, color: lightBlue },
    { x: 550, y: 600, size: 4.5, color: weirdBlue },
    { x: 650, y: 550, size: 5.0, color: lightRed },
    { x: 750, y: 500, size: 4.0, color: lightBlue },
    { x: 850, y: 450, size: 5.5, color: weirdBlue },
    { x: 950, y: 400, size: 3.5, color: lightRed },
    { x: 50, y: 350, size: 4.5, color: lightBlue },
    { x: 150, y: 300, size: 5.0, color: weirdBlue },
    { x: 250, y: 250, size: 4.0, color: lightRed },
    { x: 1050, y: 100, size: 4.5, color: lightBlue },
    { x: 1150, y: 150, size: 3.0, color: weirdBlue },
    { x: 1250, y: 200, size: 6.0, color: lightRed },
    { x: 1350, y: 250, size: 4.0, color: lightBlue },
    { x: 1100, y: 300, size: 5.5, color: weirdBlue },
    { x: 1200, y: 350, size: 3.5, color: lightRed },
    { x: 1300, y: 400, size: 5.0, color: lightBlue },
    { x: 1400, y: 450, size: 4.5, color: weirdBlue },
    { x: 1050, y: 500, size: 3.0, color: lightRed },
    { x: 1150, y: 550, size: 4.0, color: lightBlue },
    { x: 1250, y: 600, size: 5.0, color: weirdBlue },
    { x: 1350, y: 650, size: 6.0, color: lightRed },
    { x: 1100, y: 700, size: 4.5, color: lightBlue },
    { x: 1200, y: 750, size: 3.0, color: weirdBlue },
    { x: 1300, y: 800, size: 7.0, color: lightRed },
  ]

  return (
    <div className="fixed inset-0 bg-gray-900">
      {circles.map((circle, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: circle.x,
            top: circle.y,
            width: circle.size,
            height: circle.size,
            backgroundColor: circle.color,
            opacity: 1,
          }}
        />
      ))}
    </div>
  )
}

export default Loading
