'use client'
import React from 'react'

import '@getpara/react-sdk/styles.css'

import { subtleTheme, WalletModal } from '../Extensions/LoginModal/Modal'

export const acceptedConnections = [
  'para',
  'com.okex.wallet',
  'io.metamask',
  'io.rabby',
  'injected',
]

const Authentication = ({
  ParaModalOpen,
  setParaModalOpen,
  setGuestLogin,
  login,
  pregenModal = false,
  closeGuestLogin,
}: {
  ParaModalOpen: boolean
  setParaModalOpen: (value: boolean) => void
  setGuestLogin: (value: boolean) => void
  login: () => void
  pregenModal?: boolean
  closeGuestLogin: () => void
}) => {
  return (
    <>
      <div>
        <WalletModal
          onConnect={(wallet) => {
            console.log('Connecting to', wallet.name)
          }}
          theme={subtleTheme}
          isOpen={ParaModalOpen}
          onClose={() => {
            closeGuestLogin()
            setParaModalOpen(false)
          }}
          pregenModal={pregenModal}
        />
      </div>
    </>
  )
}

export default Authentication
