'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { lightRed, lightBlue, darkBlue } from './colors'

const TimeWidget = () => {
  const [time, setTime] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const widgetRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !(widgetRef.current as HTMLDivElement).contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getFormattedDate = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    const day = days[time.getDay()]
    const month = months[time.getMonth()]
    const dayNum = time.getDate()
    const hours = time.getHours()
    const minutes = time.getMinutes().toString().padStart(2, '0')

    return `${day} ${month} ${dayNum} ${hours}:${minutes}`
  }

  const getTimeWithSeconds = () => {
    const hours = time.getHours()
    const minutes = time.getMinutes().toString().padStart(2, '0')
    const seconds = time.getSeconds()
    return `${hours}:${minutes} s-${seconds}`
  }

  return (
    <div className="relative" ref={widgetRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[17px] hover:opacity-70 transition-opacity"
      >
        {getFormattedDate()}
      </button>

      {isOpen && (
        <div
          className={`bg-gray-800/10 backdrop-blur-sm rounded-lg p-4 w-40 shadow-lg border border-white/10 absolute right-1 top-full mt-3 bg-[${darkBlue}] rounded-lg shadow-lg p-4 min-w-[145px] z-auto`}
        >
          <div className="">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center text-white gap-2">
                <CalendarDays className="w-4 h-4" />
                <div className="text-xl font-mono">{time.getDate()}</div>
              </div>

              <div className="text-black uppercase font-bold text-xs">
                {time.toLocaleString('default', { weekday: 'long' })}
              </div>

              <div className="pt-1 font-mono text-sm text-white">
                {getTimeWithSeconds()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeWidget
