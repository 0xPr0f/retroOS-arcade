import { PregenWalletData } from '@/pages/api/apps/drivers/db/create'
import React, { createContext, useContext, useMemo } from 'react'
import { useSessionStorage } from 'react-use'
import { useTypedValue } from './ValueProvider'
import { UserSettings } from '@/components/apps/ControlPanel/components/Setting&Metrics'

interface PregenContextType {
  pregenWalletSession: PregenWalletData | null
  isLoginPregenSession: boolean
  setPregenWalletSession: (value: PregenWalletData | null) => void
  pregenAddress: string | undefined
  pregenSmartAccountAddress: string | undefined
  pregenActiveAddress: string | undefined
  pregenEncryptedKeyShare: string | undefined
  pregenWalletId: string | undefined
  isSmartAccount: boolean | undefined
}

const PregenContext = createContext<PregenContextType | undefined>(undefined)

export function PregenProvider({ children }: { children: React.ReactNode }) {
  const [pregenWalletSession, setPregenWalletSession] =
    useSessionStorage<PregenWalletData | null>(
      'retro:pregen.wallet.session',
      null
    )
  const [userControlSettingsValue] = useTypedValue<UserSettings>(
    'userControlSettings'
  )

  const pregenAddress = useMemo(
    () => pregenWalletSession?.wallet_address,
    [pregenWalletSession]
  )

  const pregenSmartAccountAddress = useMemo(
    () => pregenWalletSession?.smart_account_address,
    [pregenWalletSession]
  )

  const pregenActiveAddress = useMemo(() => {
    if (userControlSettingsValue?.use_smart_account) {
      return pregenSmartAccountAddress
    }
    return pregenAddress
  }, [userControlSettingsValue?.use_smart_account, pregenAddress])

  const isSmartAccount = useMemo(() => {
    return userControlSettingsValue?.use_smart_account
  }, [userControlSettingsValue?.use_smart_account])

  const pregenEncryptedKeyShare = useMemo(
    () => pregenWalletSession?.encryptedKeyShare,
    [pregenWalletSession]
  )
  const pregenWalletId = useMemo(
    () => pregenWalletSession?.pregen_wallet_id,
    [pregenWalletSession]
  )
  const isLoginPregenSession = useMemo(() => {
    if (!pregenWalletSession) return false

    return (
      pregenAddress?.length! > 40 &&
      pregenEncryptedKeyShare?.length! > 10000 &&
      pregenWalletId?.length! > 20
    )
  }, [
    pregenWalletSession,
    pregenAddress,
    pregenEncryptedKeyShare,
    pregenWalletId,
  ])

  // Memoize the context value
  const value = useMemo(
    () => ({
      pregenWalletSession,
      isLoginPregenSession,
      setPregenWalletSession,
      pregenAddress,
      pregenSmartAccountAddress,
      pregenActiveAddress,
      pregenEncryptedKeyShare,
      pregenWalletId,
      isSmartAccount,
    }),
    [
      pregenWalletSession,
      isLoginPregenSession,
      pregenAddress,
      pregenSmartAccountAddress,
      pregenActiveAddress,
      pregenEncryptedKeyShare,
      pregenWalletId,
      isSmartAccount,
    ]
  )

  return (
    <PregenContext.Provider value={value}>{children}</PregenContext.Provider>
  )
}

// Custom hook that selects only needed values
export function usePregenSession() {
  const context = useContext(PregenContext)
  if (context === undefined) {
    throw new Error('usePregenSession must be used within a PregenProvider')
  }
  return context
}
