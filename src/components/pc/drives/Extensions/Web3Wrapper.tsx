'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  http,
  createConfig,
  WagmiProvider,
  CreateConfigParameters,
} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { paraConnector } from '@getpara/wagmi-v2-integration'
import { OAuthMethod } from '@getpara/web-sdk'
import PcDesktop from '../..'
import { injected } from 'wagmi/connectors'
import { PregenProvider } from '../Storage/PregenSession'
import para from '../Authentication/para'

const connector = paraConnector({
  para: para,
  chains: [sepolia],
  appName: 'RetroOS Arcade',
  options: {},
  nameOverride: 'Para',
  idOverride: 'para',
  oAuthMethods: [OAuthMethod.GOOGLE, OAuthMethod.TWITTER],
  disableEmailLogin: false,
  disablePhoneLogin: false,
  onRampTestMode: true,
})

export const config: CreateConfigParameters = {
  chains: [sepolia, mainnet],
  connectors: [connector, injected()],
  transports: {
    [sepolia.id]: http(
      'https://sepolia.infura.io/v3/5843244e30ef4b68b2a0cede1813a327'
    ),
    [mainnet.id]: http(),
  },
}

export const wagmiConfig = createConfig(config)
export const queryClient = new QueryClient()

const Web3Wrapper: React.FC = () => {
  return (
    <div suppressHydrationWarning>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <PregenProvider>
            <PcDesktop />
          </PregenProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default Web3Wrapper
