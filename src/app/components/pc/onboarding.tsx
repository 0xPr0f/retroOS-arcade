import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const OnboardingTour = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const steps = [
    {
      target: '#navbar-content',
      title: 'Navigation Bar',
      content:
        'This is where the Account information, Time and Notifications are displayed.',
      position: 'bottom',
    },
    {
      target: '#start_menu',
      title: 'Start Menu',
      content: 'Access popular system apps and programs here.',
      position: 'top',
    },
    {
      target: '#start_menu_dock',
      title: 'Menu Dock',
      content: 'Show all open windows here.',
      position: 'bottom',
    },
    {
      target: '#app_drawer_dock',
      title: 'App Drawer',
      content: 'Display all installed apps here.',
      position: 'bottom',
    },
    {
      target: '#documents',
      title: 'Library App',
      content:
        'Manage and customize your installed applications. Enable or disable apps as needed.',
      position: 'bottom',
    },
    {
      target: '#wallet',
      title: 'Wallet App',
      content:
        'View your crypto wallet details including addresses, balances, transaction history and wallet settings.',
      position: 'bottom',
    },
    {
      target: '#control',
      title: 'Control Panel App',
      content:
        'Configure system settings and preferences through an easy-to-use control panel interface.',
      position: 'bottom',
    },
    {
      target: '#tetris',
      title: 'Tetris Game',
      content: 'Play the classic Tetris game directly from your desktop.',
      position: 'bottom',
    },
    {
      target: '#feedback',
      title: 'Feedback App',
      content:
        'Provide feedback and suggestions to the developers. Your input helps improve the system.',
      position: 'right',
    },
    {
      target: '#chain_selector',
      title: 'Chain Selector',
      content: 'Switch between different chains here.',
      position: 'bottom',
    },
    {
      target: '#connected_address',
      title: 'Connected Address',
      content: 'Display your connected address here.',
      position: 'bottom',
    },
    {
      target: '#time_widget',
      title: 'Time Widget',
      content: 'Display the current time here.',
      position: 'bottom',
    },
    {
      target: '#notifications_area',
      title: 'Notifications',
      content:
        'Display all notifications popus here and open Notifications center.',
      position: 'bottom',
    },
  ]

  useEffect(() => {
    const updatePosition = () => {
      const currentTargetElement = document.querySelector(
        steps[currentStep].target
      )
      if (currentTargetElement) {
        const rect = currentTargetElement.getBoundingClientRect()
        const position = steps[currentStep].position
        const margin = 12

        let newPosition = { top: 0, left: 0 }

        switch (position) {
          case 'bottom':
            newPosition = {
              top: rect.bottom + margin,
              left: rect.left + (rect.width - 320) / 2, // Center horizontally
            }
            break
          case 'top':
            newPosition = {
              top: rect.top - 220 - margin, // Account for tooltip height
              left: rect.left + (rect.width - 320) / 2,
            }
            break
          case 'left':
            newPosition = {
              top: rect.top + (rect.height - 200) / 2, // Center vertically
              left: rect.left - 320 - margin,
            }
            break
          case 'right':
            newPosition = {
              top: rect.top + (rect.height - 200) / 2,
              left: rect.right + margin,
            }
            break
        }

        // Ensure tooltip stays within viewport
        newPosition.left = Math.max(
          margin,
          Math.min(newPosition.left, window.innerWidth - 320 - margin)
        )
        newPosition.top = Math.max(
          margin,
          Math.min(newPosition.top, window.innerHeight - 220 - margin)
        )

        setPosition(newPosition)
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [currentStep])

  if (!isVisible) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsVisible(false)
      localStorage.setItem('retro:welcome:window', 'true')
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
    localStorage.setItem('retro:welcome:window', 'true')
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentTargetElement = document.querySelector(steps[currentStep].target)
  const rect = currentTargetElement?.getBoundingClientRect() || {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  }

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
        {/* Clear area for target element */}
        <div
          style={{
            position: 'absolute',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            backgroundColor: 'transparent',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Highlight current element */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: '2px solid #3b82f6',
          borderRadius: '4px',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-50 w-80 bg-white rounded-lg shadow-lg p-4"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>

        <div className="mb-4">
          <h3 className="text-lg text-gray-500 font-semibold mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600">{steps[currentStep].content}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm hover:bg-gray-800 bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>

          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </>
  )
}

export default OnboardingTour
