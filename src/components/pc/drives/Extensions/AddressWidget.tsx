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
import { usePregenSession } from '../Storage&Hooks/PregenSession'
import {
  ParaModal,
  useCreateGuestWalletsState,
  useModal,
} from '@getpara/react-sdk'
import { useDispatchWindows } from '../UI/dispatchWindow'
import { useRouter } from 'next/navigation'
import { useMouse } from 'react-use'
import { smartAccountAddress } from '../Interactions'
import { useSmartAccount } from '../Storage&Hooks/SmartAccountHook'

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
  const { openModal } = useModal()
  const router = useRouter()
  const { createDispatchWindow } = useDispatchWindows()
  const containerRef = useRef<HTMLDivElement>(null)

  const [copied, setCopied] = useState(false)
  const { setPregenWalletSession, pregenAddress } = usePregenSession()

  function disconnectInstance() {
    disconnect()
    if (isGuestMode) {
      disconnectPregenPopUp()
    }
  }

  function disconnectPregenPopUp() {
    createDispatchWindow({
      title: 'Disconnect',
      content: () => (
        <div>
          <div
            className=" text-black"
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <p style={{ color: 'red' }}>
              You will lose your guest wallet if you disconnect.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '1.5rem',
              }}
            >
              <button
                onClick={() => {}}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      ),
      initialPosition: {
        x: 450,
        y: 300,
      },
      initialSize: { width: 250, height: 200 },
    })
  }

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

  const {
    baseAddress,
    smartAddress,
    activeAddress: ActiveAddress,
    isSmartAccountToggled,
    isGuestMode,
  } = useSmartAccount()

  const handleCopy = async () => {
    if (copied) return
    console.log(ActiveAddress)
    try {
      if (isConnected) {
        copyToClipboard(ActiveAddress as string)
      }

      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="relative" ref={widgetRef}>
      <div ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[17px] flex items-center hover:opacity-70 transition-opacity"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1"></div>[
          {!isConnected
            ? shortenText(ActiveAddress as string)
            : shortenText(ActiveAddress as string)}
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

                <div className="text-white text-sm font-medium mb-1 flex items-center gap-2">
                  <div>
                    {!isConnected
                      ? shortenText(ActiveAddress as string)
                      : shortenText(ActiveAddress as string)}
                  </div>
                  <div className="cursor-pointer" onClick={handleCopy}>
                    {copied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </div>
                </div>

                <div className="text-gray-300 text-xs mb-4">
                  {formatBalance(balance?.formatted)}{' '}
                  {chains.find((chain) => chain.id === chainId)?.nativeCurrency
                    .symbol || 'ETH'}
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={() => openModal()}
                    className={`bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-md flex items-center justify-center gap-1 text-xs transition-colors duration-200  ${
                      copied ? 'bg-green-500/20 hover:bg-green-500/30' : ''
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => {
                      disconnectInstance()
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
    </div>
  )
}

export default AddressWidget
