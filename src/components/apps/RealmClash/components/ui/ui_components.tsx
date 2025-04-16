import React, { useState, useRef, useEffect } from 'react'

export const InventoryItem: React.FC<{ name: string; rarity: string }> = ({
  name,
  rarity,
}) => (
  <div className="bg-gray-900/50 p-2 rounded border border-gray-700/30">
    <p className="text-white text-sm">{name}</p>
    <p
      className={`text-xs ${
        rarity === 'Legendary' ? 'text-yellow-500' : 'text-purple-500'
      }`}
    >
      {rarity}
    </p>
  </div>
)

export const SettingToggle: React.FC<{
  label: string
  defaultOn?: boolean
  onChange?: (isOn: boolean) => void
}> = ({ label, defaultOn, onChange }) => {
  const [isOn, setIsOn] = useState(defaultOn)

  const toggleSwitch = () => {
    const newState = !isOn
    setIsOn(newState)
    onChange?.(newState)
  }

  return (
    <div className="flex items-center justify-between group select-none">
      <span className="text-white">{label}</span>
      <button
        onClick={toggleSwitch}
        className={`
          w-12 h-6 rounded-full p-1 cursor-pointer
          transition-colors duration-200
          ${isOn ? 'bg-blue-600' : 'bg-gray-700'}
          hover:${isOn ? 'bg-blue-500' : 'bg-gray-600'}
        `}
        aria-checked={isOn}
        role="switch"
      >
        <div
          className={`
            w-4 h-4 rounded-full 
            transition-all duration-200 ease-in-out
            ${isOn ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gray-200'}
          `}
        />
      </button>
    </div>
  )
}

export const StatBar: React.FC<{
  label: string
  value: number
  min?: number
  max?: number
}> = ({ label, value, min = 0, max = 255 }) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export const BooleanStat: React.FC<{
  label: string
  value: boolean
}> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span
        className={`font-medium ${value ? 'text-green-500' : 'text-red-500'}`}
      >
        {value ? 'True' : 'False'}
      </span>
    </div>
  )
}

export const ValueStat: React.FC<{
  label: string
  value: number | string
}> = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}

export const StatCard: React.FC<{ title: string; value: string }> = ({
  title,
  value,
}) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/30">
    <h3 className="text-gray-400 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
)

interface SliderProps {
  min?: number
  max?: number
  defaultValue?: number
  label?: string
  onChange?: (value: number) => void
  disabled?: boolean
  percentage?: boolean
  viewValue?: boolean
  styles?: {
    container?: string
    label?: string
    valueText?: string
    track?: string
    fill?: string
    thumb?: string
    thumbActive?: string
  }
  colors?: {
    track?: string
    fill?: string
    thumb?: string
    thumbDisabled?: string
    fillDisabled?: string
  }
}
export const Slider: React.FC<
  SliderProps & { backwardOnly?: boolean; value?: number }
> = ({
  min = 0,
  max = 150,
  defaultValue = 75,
  label,
  onChange,
  disabled = false,
  percentage = false,
  backwardOnly = false,
  viewValue = true,
  value: controlledValue,
  styles = {},
  colors = {},
}) => {
  const [internalValue, setInternalValue] = useState(
    Math.min(Math.max(defaultValue, min), max)
  )
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const value = controlledValue ?? internalValue

  const calculatePercentage = (value: number) => {
    const boundedValue = Math.min(Math.max(value, min), max)
    return ((boundedValue - min) / (max - min)) * 100
  }

  const calculateValue = (percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min)
    return Math.min(Math.max(Math.round(rawValue), min), max)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.min(
      Math.max(((event.clientX - rect.left) / rect.width) * 100, 0),
      100
    )
    const newValue = calculateValue(percentage)

    if (backwardOnly && newValue > value) return

    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return
    event.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !sliderRef.current || disabled) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.min(
        Math.max(((event.clientX - rect.left) / rect.width) * 100, 0),
        100
      )
      const newValue = calculateValue(percentage)

      if (backwardOnly && newValue > value) return

      setInternalValue(newValue)
      onChange?.(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, min, max, onChange, disabled, value, backwardOnly])

  return (
    <div
      className={`relative ${disabled ? 'opacity-60' : ''} ${
        styles.container || ''
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label
            className={`block text-white mb-2 ${
              disabled ? 'cursor-not-allowed' : ''
            } ${styles.label || ''}`}
          >
            {label}
          </label>
        )}
        {viewValue && (
          <span className={`text-white text-sm ${styles.valueText || ''}`}>
            {percentage ? `${value}%` : value}
          </span>
        )}
      </div>
      <div
        ref={sliderRef}
        className={`
          w-full h-2 rounded-full relative
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${styles.track || ''}
          ${colors.track || 'bg-gray-700'}
        `}
        onClick={handleClick}
      >
        <div
          className={`
            absolute h-full rounded-full transition-all duration-75
            ${styles.fill || ''}
            ${
              disabled
                ? colors.fillDisabled || 'bg-gray-500'
                : colors.fill || 'bg-gradient-to-r from-blue-500 to-purple-500'
            }
          `}
          style={{ width: `${calculatePercentage(value)}%` }}
        />
        <div
          className={`
            absolute w-4 h-4 rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-75
            ${styles.thumb || ''}
            ${
              disabled
                ? `${colors.thumbDisabled || 'bg-gray-400'} cursor-not-allowed`
                : `${colors.thumb || 'bg-white'} cursor-grab hover:scale-110`
            }
            ${
              isDragging && !disabled
                ? styles.thumbActive || 'cursor-grabbing'
                : ''
            }
          `}
          style={{
            left: `${calculatePercentage(value)}%`,
            top: '50%',
            transform: `translateX(-50%) translateY(-50%)`,
          }}
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}
