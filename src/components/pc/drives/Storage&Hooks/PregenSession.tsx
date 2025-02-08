import { PregenWalletData } from '@/pages/api/apps/drivers/db/create'
import React, { createContext, useContext, useMemo } from 'react'
import { useSessionStorage } from 'react-use'

interface PregenContextType {
  pregenWalletSession: PregenWalletData | null
  isLoginPregenSession: boolean
  setPregenWalletSession: (value: PregenWalletData | null) => void
  pregenAddress: string | undefined
  pregenEncryptedKeyShare: string | undefined
  pregenWalletId: string | undefined
}

const PregenContext = createContext<PregenContextType | undefined>(undefined)

export function PregenProvider({ children }: { children: React.ReactNode }) {
  const [pregenWalletSession, setPregenWalletSession] =
    useSessionStorage<PregenWalletData | null>(
      'retro:pregen.wallet.session',
      null
    )

  // Memoize derived values
  const pregenAddress = useMemo(
    () => pregenWalletSession?.wallet_address,
    [pregenWalletSession]
  )

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
      pregenEncryptedKeyShare,
      pregenWalletId,
    }),
    [
      pregenWalletSession,
      isLoginPregenSession,
      pregenAddress,
      pregenEncryptedKeyShare,
      pregenWalletId,
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
