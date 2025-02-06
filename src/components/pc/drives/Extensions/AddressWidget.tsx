'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Check, Copy, LogOut } from 'lucide-react'
import { lightRed, lightBlue, darkBlue } from './colors'
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { copyToClipboard, shortenText } from './utils'
import { usePregenSession } from '../Storage/PregenSession'

const AddressWidget = () => {
  const [time, setTime] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
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
  const formatBalance = (balance: any) => {
    if (!balance || Number(balance) === 0) {
      return '0'
    }
    return Number(balance).toFixed(3)
  }

  const [copied, setCopied] = useState(false)
  const { setPregenWalletSession, pregenAddress } = usePregenSession()

  const handleCopy = async () => {
    if (copied) return // Prevent copying while in copied state

    try {
      if (isConnected) {
        copyToClipboard(address as string)
      } else {
        copyToClipboard(pregenAddress as string)
      }

      setCopied(true)
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="relative" ref={widgetRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[17px] flex items-center hover:opacity-70 transition-opacity"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1"></div>[
        {!isConnected
          ? shortenText(pregenAddress as string)
          : shortenText(address as string)}
        ]
      </button>

      {isOpen && (
        <div
          className={`absolute right-1 top-full mt-3 bg-[${darkBlue}] rounded-lg shadow-lg min-w-[145px] bg-gray-800/10 backdrop-blur-sm p-3 w-64 border border-white/10  z-20`}
        >
          <div className="">
            <div className="flex flex-col items-center">
              {/* Emoji circle */}
              {/*} <div className="w-12 h-12 rounded-full bg-[#2563eb] flex items-center justify-center mb-3">
                <span className="text-xl">🤑</span>
              </div> */}

              {/* Address */}
              <div className="text-white text-sm font-medium mb-1">
                {!isConnected
                  ? shortenText(pregenAddress as string)
                  : shortenText(address as string)}
              </div>

              {/* Balance */}
              <div className="text-gray-300 text-xs mb-4">
                {formatBalance(balance?.formatted)}{' '}
                {chains.find((chain) => chain.id === chainId)?.nativeCurrency
                  .symbol || 'ETH'}
              </div>
              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={handleCopy}
                  className={`bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-md flex items-center justify-center gap-1 text-xs transition-colors duration-200  ${
                    copied ? 'bg-green-500/20 hover:bg-green-500/30' : ''
                  }`}
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    disconnect()
                    setPregenWalletSession(null)
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-md flex items-center justify-center gap-1 text-xs transition-colors duration-200"
                >
                  <LogOut className="w-3 h-3" />
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressWidget
