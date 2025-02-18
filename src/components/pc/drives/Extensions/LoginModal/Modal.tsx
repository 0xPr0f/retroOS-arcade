'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, Loader2 } from 'lucide-react'
import type { WalletModalProps, WalletModalTheme } from './types/modal-types'
import { useConnect } from 'wagmi'
import {
  Button,
  StyledInput,
  StyledInputAdvanced,
} from '../../UI/UI_Components.v1'
import { acceptedConnections } from '../../Authentication'
import { LearnMoreView, LearnMoreViewPregen } from './LearnMore'
import { useLocalStorage, useSessionStorage } from 'react-use'

import axios from 'axios'
import { usePregenSession } from '../../Storage&Hooks/PregenSession'

const customTheme = {
  background: 'linear-gradient(to left, #dc2626, #2563eb)',
  textColor: '#ffffff',
  accentColor: '#22d3ee',
  borderRadius: '20px',
  hoverBackground: 'rgba(255, 255, 255, 0.1)',
}

const subtleTheme = {
  background: 'background-color: rgba(255, 0, 0, 0.1)',
  textColor: '#ffffff',
  accentColor: '#22d3ee',
  borderRadius: '20px',
  hoverBackground: 'rgba(255, 255, 255, 0.1)',
}

const darkTheme = {
  background: '#0f172a',
  textColor: '#ffffff',
  accentColor: '#dc2626',
  borderRadius: '20px',
  hoverBackground:
    'linear-gradient(to left, rgba(220, 38, 38, 0.1), rgba(37, 99, 235, 0.1))',
}

//const defaultTheme: WalletModalTheme = customTheme
const defaultTheme: WalletModalTheme = subtleTheme

const WalletModal = ({
  isOpen,
  onClose,
  onConnect,
  theme = {},
  walletOptions,
  pregenModal = false,
}: WalletModalProps & { pregenModal?: boolean }) => {
  const [recentWallet, setRecentWallet] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<any>(null)
  const [loadingState, setLoadingState] = useState<string>('')
  const [error, setError] = useState<boolean>(false)
  const finalTheme = { ...defaultTheme, ...theme }
  const { connect, connectors } = useConnect({
    mutation: {
      onSuccess: () => {
        setLoadingState('')
        onConnect(selectedWallet)
        setSelectedWallet(null)
        onClose()
      },
      onError: () => {
        setLoadingState('')
        setError(true)
      },
    },
  })
  const [learnMoreView, setLearnMoreView] = useState<boolean>(false)
  const [generatePregenIdentifier, setGeneratePregenIdentifier] =
    useState<string>('')
  const [generatePregenIdentifierError, setGeneratePregenIdentifierError] =
    useState<string>('')
  const [loadingPregen, setLoadingPregen] = useState<boolean>(false)

  const [pregenWalletStorage, setPregenWalletStorage] = useLocalStorage(
    'pregenWalletStorage'
  )
  const { setPregenWalletSession } = usePregenSession()

  const handleWalletConnect = (wallet: any) => {
    connect({ connector: wallet })
  }

  useEffect(() => {
    const recent = sessionStorage.getItem('recentWallet')
    if (recent) setRecentWallet(recent)
  }, [])

  const handleConnect = async (wallet: any) => {
    setError(false)
    setSelectedWallet(wallet)
    setLearnMoreView(false)
    setLoadingState('Opening...')
    try {
      handleWalletConnect(wallet)
    } catch (e) {
      console.log('error', e)
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await new Promise((resolve) => setTimeout(resolve, 2000))
    sessionStorage.setItem('recentWallet', wallet.id)
    setRecentWallet(wallet.id)
  }
  const handleBack = () => {
    setLearnMoreView(false)
    setSelectedWallet(null)
    setLoadingState('')
    setLoadingPregen(false)
  }
  useEffect(() => {
    console.log('pregenModal', pregenModal)
  }, [pregenModal])

  useEffect(() => {
    if (
      generatePregenIdentifier.length > 0 &&
      generatePregenIdentifier.length < 5
    ) {
      setGeneratePregenIdentifierError('Input must be at least 5 characters')
    } else {
      setGeneratePregenIdentifierError('')
    }
  }, [generatePregenIdentifier])

  const handleChange = (newValue: string) => {
    setGeneratePregenIdentifier(newValue)
  }

  const handlePregenGenerationLogin = async () => {
    if (generatePregenIdentifier.length < 5 || loadingPregen) return
    try {
      setLoadingPregen(true)
      const response = await axios.post(`/api/create/pregen`, {
        identifier: generatePregenIdentifier,
      })
      const result = response.data
      console.log('result pregen wallet:', result)
      if (!result.success) {
        setLoadingPregen(false)
        return
      }
      // setPregenWalletStorage(result)
      setPregenWalletSession(result)
      setLoadingPregen(false)
    } catch (e) {
      console.log('error', e)
      setLoadingPregen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {!pregenModal ? (
        <div
          className="w-full max-w-[330px] overflow-hidden fixed-height backdrop-blur-sm"
          style={{
            background: finalTheme.background,
            borderRadius: finalTheme.borderRadius,
          }}
        >
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative p-4 flex flex-col h-[450px]">
            <div className="flex justify-center items-center mb-4 relative">
              {(selectedWallet !== null || learnMoreView) && (
                <button
                  onClick={() => {
                    handleBack()
                  }}
                  className="absolute left-0 rounded-full p-1 transition-all duration-200 hover:scale-105"
                  style={{
                    background: finalTheme.hoverBackground,
                    color: finalTheme.textColor,
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              <h2
                className="text-xl font-bold tracking-tight"
                style={{ color: finalTheme.textColor }}
              >
                {!(selectedWallet === null)
                  ? `Connect ${selectedWallet.name}`
                  : !learnMoreView
                  ? 'Connect a Wallet'
                  : 'Learn About Wallets'}
              </h2>
              <button
                onClick={() => {
                  onClose()
                  setSelectedWallet(null)
                  setLearnMoreView(false)
                  setLoadingState('')
                }}
                className="absolute right-0 rounded-full p-1 transition-all duration-200 hover:scale-105"
                style={{
                  background: finalTheme.hoverBackground,
                  color: finalTheme.textColor,
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {!!selectedWallet ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16">
                  {selectedWallet.icon && (
                    <img
                      src={selectedWallet.icon}
                      alt="Wallet Icon"
                      className="w-full rounded-lg h-full object-contain"
                    />
                  )}
                </div>
                <div className="text-center">
                  <p
                    className="text-xl font-semibold mb-2"
                    style={{ color: finalTheme.textColor }}
                  >
                    Opening {selectedWallet.name}...
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: finalTheme.textColor }}
                  >
                    Confirm connection in the extension
                  </p>
                  {error && (
                    <div className="w-full mt-4">
                      <Button
                        type="submit"
                        onClick={() => {
                          handleConnect(selectedWallet)
                        }}
                        className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition duration-200"
                      >
                        Try again
                      </Button>
                    </div>
                  )}
                </div>
                {loadingState === 'Opening...' && (
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: finalTheme.accentColor }}
                  />
                )}
              </div>
            ) : (
              <>
                {!learnMoreView ? (
                  <div className="space-y-6 flex-1 overflow-auto custom-scrollbar pr-2">
                    <div className="space-y-2">
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: finalTheme.accentColor }}
                      >
                        Social Login [Email | Phone | X]
                      </h3>
                      {connectors
                        .filter((connector) =>
                          acceptedConnections.includes(connector.id)
                        )
                        .filter((connector) => connector.id === 'para')
                        .map((wallet) => (
                          <button
                            key={wallet.id}
                            onClick={() => {
                              handleConnect(wallet)
                            }}
                            className="max-h-12 min-h-12 w-full flex items-center space-x-3 p-1.5 rounded-xl transition-all duration-200 hover:scale-[1.02] relative overflow-hidden group"
                            style={{
                              background: finalTheme.hoverBackground,
                              color: finalTheme.textColor,
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              style={{
                                background:
                                  'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                              }}
                            />
                            <div className="relative z-10 flex items-center space-x-3 w-full">
                              <div className="w-8 rounded-lg h-8">
                                {wallet.icon && (
                                  <img
                                    src={wallet.icon}
                                    alt="Wallet Icon"
                                    className="w-full rounded-lg h-full object-contain"
                                  />
                                )}
                              </div>
                              <div className="text-left flex-1">
                                <div className="font-medium text-sm">
                                  {wallet.name}
                                </div>
                                {recentWallet === wallet.id && (
                                  <div
                                    className="text-xs font-medium"
                                    style={{ color: finalTheme.accentColor }}
                                  >
                                    Recent
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: finalTheme.accentColor }}
                      >
                        Installed
                      </h3>
                      {connectors
                        .filter((connector) =>
                          acceptedConnections.includes(connector.id)
                        )
                        .filter((connector) => !(connector.id === 'para'))
                        .map((wallet) => (
                          <button
                            key={wallet.id}
                            onClick={() => {
                              handleConnect(wallet)
                            }}
                            className="max-h-12 min-h-12 w-full flex items-center space-x-3 p-1.5 rounded-xl transition-all duration-200 hover:scale-[1.02] relative overflow-hidden group"
                            style={{
                              background: finalTheme.hoverBackground,
                              color: finalTheme.textColor,
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              style={{
                                background:
                                  'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                              }}
                            />
                            <div className="relative z-10 flex items-center space-x-3 w-full">
                              <div className="w-8 h-8">
                                {wallet.icon && (
                                  <img
                                    src={wallet.icon}
                                    alt="Wallet Icon"
                                    className="w-full rounded-lg h-full object-contain"
                                  />
                                )}
                              </div>
                              <div className="text-left flex-1">
                                <div className="font-medium text-sm">
                                  {wallet.name}
                                </div>
                                {recentWallet === wallet.id && (
                                  <div
                                    className="text-xs font-medium"
                                    style={{ color: finalTheme.accentColor }}
                                  >
                                    Recent
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <LearnMoreView theme={finalTheme} />
                )}
              </>
            )}

            {!selectedWallet && (
              <div
                className="mt-4 flex justify-between items-center pt-3 relative"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                <span
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  className="text-sm"
                >
                  New to Ethereum wallets?
                </span>
                <a
                  onClick={() => {
                    setLearnMoreView(true)
                  }}
                  className="text-sm cursor-pointer font-medium transition-all duration-200 hover:scale-105"
                  style={{ color: finalTheme.accentColor }}
                >
                  Learn More
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="w-full max-w-[330px] overflow-hidden h-[320px] backdrop-blur-sm"
          style={{
            background: finalTheme.background,
            borderRadius: finalTheme.borderRadius,
          }}
        >
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative p-4 flex flex-col h-[320px]">
            <div className="flex justify-center items-center mb-4 relative">
              {learnMoreView && (
                <button
                  onClick={() => {
                    handleBack()
                  }}
                  className="absolute left-0 rounded-full p-1 transition-all duration-200 hover:scale-105"
                  style={{
                    background: finalTheme.hoverBackground,
                    color: finalTheme.textColor,
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              <h2
                className="text-xl font-bold tracking-tight"
                style={{ color: finalTheme.textColor }}
              >
                {!learnMoreView
                  ? 'Pregenerated Wallets'
                  : 'Learn About Pregens'}
              </h2>
              <button
                onClick={() => {
                  onClose()
                  setLearnMoreView(false)
                  setLoadingPregen(false)
                }}
                className="absolute right-0 rounded-full p-1 transition-all duration-200 hover:scale-105"
                style={{
                  background: finalTheme.hoverBackground,
                  color: finalTheme.textColor,
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {!learnMoreView ? (
              <div className="space-y-6 flex-1 overflow-auto custom-scrollbar p-2">
                <div className="space-y-2">
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: finalTheme.accentColor }}
                  >
                    Pregen Wallets Login
                  </h3>
                  <StyledInputAdvanced
                    label="Identifier [Email | Phone | Username]"
                    value={generatePregenIdentifier}
                    onChange={handleChange}
                    placeholder="[dapptester | tester@gmail.com]"
                    error={generatePregenIdentifierError}
                    required
                  />
                  <button
                    onClick={() => {
                      handlePregenGenerationLogin()
                    }}
                    className="max-h-12 min-h-12 w-full rounded-xl transition-all duration-200 hover:scale-[1.02] relative overflow-hidden group"
                    style={{
                      background: finalTheme.hoverBackground,
                      color: finalTheme.textColor,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background:
                          'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                      }}
                    />

                    <div className="w-full h-full font-medium text-sm">
                      {loadingPregen ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        'Generate Pregen Wallet'
                      )}
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <LearnMoreViewPregen theme={finalTheme} />
            )}

            <div
              className="mt-4 flex justify-between items-center pt-3 relative"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <span
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                className="text-sm"
              >
                New to Pregenerated wallets?
              </span>
              <a
                onClick={() => {
                  setLearnMoreView(true)
                }}
                className="text-sm cursor-pointer font-medium transition-all duration-200 hover:scale-105"
                style={{ color: finalTheme.accentColor }}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .fixed-height {
          height: 450px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}

export { WalletModal, customTheme, subtleTheme, darkTheme }
