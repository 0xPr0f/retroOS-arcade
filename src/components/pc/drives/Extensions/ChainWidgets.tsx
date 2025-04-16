'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import { lightRed, lightBlue, darkBlue } from './colors'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { shortenText } from './utils'
interface Network {
  id: string
  name: string
  isConnected: boolean
}

const networks: Network[] = [
  { id: 'blast-sepolia', name: 'Blast Sepolia', isConnected: true },
  { id: 'blast', name: 'Blast', isConnected: false },
  { id: 'sepolia', name: 'Sepolia', isConnected: false },
]
const ChainWidget = () => {
  const [time, setTime] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useAccount()
  const { chains, switchChain } = useSwitchChain()
  const chainId = useChainId()
  const widgetRef = useRef(null)

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
  const [activeNetwork, setActiveNetwork] = useState(chainId)

  return (
    <div className="relative" ref={widgetRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          console.log(chainId)
        }}
        className="text-[17px] hover:opacity-70 transition-opacity"
      >
        [
        {chains.find((chain) => chain.id === chainId)?.name ||
          'Incorrect Chain'}
        ]
      </button>

      {isOpen && (
        <div
          className={` bg-gray-800/10 backdrop-blur-sm rounded-lg p-3 w-60 shadow-lg border border-white/10 absolute right-1 top-full mt-3 bg-[${darkBlue}] rounded-lg shadow-lg p-4 min-w-[145px] z-20`}
        >
          <div className="">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white text-sm font-medium">
                  Switch Networks
                </h3>
              </div>

              <div className="space-y-1">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => {
                      setActiveNetwork(chain.id)
                      switchChain({ chainId: chain.id })
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors duration-200 ${
                      activeNetwork === chain.id
                        ? 'bg-[#2563eb] text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{chain.name}</span>
                    {!(chainId === chain.id) && activeNetwork === chain.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-orange-400">
                          Confirm in wallet
                        </span>
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      </div>
                    )}

                    {chainId === chain.id && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400">
                          Connected
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChainWidget
