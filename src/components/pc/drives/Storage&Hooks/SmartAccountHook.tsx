'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useTypedValue } from './ValueProvider'
import { smartAccountAddress } from '../Interactions'
import { useAccount as useParaAccount } from '@getpara/react-sdk'

interface SmartAccountContextType {
  baseAddress?: `0x${string}`
  smartAddress?: string
  activeAddress?: string
  isSmartAccountToggled: boolean
  isGuestMode: boolean
}

const SmartAccountContext = createContext<SmartAccountContextType | undefined>(
  undefined
)

export function SmartAccountProvider({ children }: { children: ReactNode }) {
  const { address: baseAddress } = useAccount()
  const chainId = useChainId()
  const { embedded: paraAccountData } = useParaAccount()

  const [smartAddress, setSmartAddress] = useState<string | undefined>(
    undefined
  )
  const [activeAddress, setActiveAddress] = useState<string | undefined>(
    undefined
  )

  const [userControlSettingsValue] = useTypedValue<{
    use_smart_account?: boolean
  }>('userControlSettings')
  const isSmartAccountToggled = Boolean(
    userControlSettingsValue?.use_smart_account
  )

  const isGuestMode = Boolean(paraAccountData?.isGuestMode)

  useEffect(() => {
    if (!baseAddress) {
      setSmartAddress(undefined)
      return
    }
    const fetchSmartAddress = async () => {
      try {
        const value = await smartAccountAddress(
          baseAddress as `0x${string}`,
          chainId
        )
        setSmartAddress(value)
      } catch {
        setSmartAddress(undefined)
      }
    }
    fetchSmartAddress()
  }, [baseAddress, chainId])

  useEffect(() => {
    if (!isGuestMode) {
      setActiveAddress(baseAddress)
    } else if (isSmartAccountToggled) {
      setActiveAddress(smartAddress)
    } else {
      setActiveAddress(baseAddress)
    }
  }, [isGuestMode, isSmartAccountToggled, baseAddress, smartAddress])

  const contextValue = useMemo(
    () => ({
      baseAddress,
      smartAddress,
      activeAddress,
      isSmartAccountToggled,
      isGuestMode,
    }),
    [
      baseAddress,
      smartAddress,
      activeAddress,
      isSmartAccountToggled,
      isGuestMode,
    ]
  )

  return (
    <SmartAccountContext.Provider value={contextValue}>
      {children}
    </SmartAccountContext.Provider>
  )
}

export function useSmartAccount() {
  const context = useContext(SmartAccountContext)
  if (!context) {
    throw new Error(
      'useSmartAccount must be used within a SmartAccountProvider'
    )
  }
  return context
}
