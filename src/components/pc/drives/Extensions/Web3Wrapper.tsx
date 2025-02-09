'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  http,
  createConfig,
  WagmiProvider,
  CreateConfigParameters,
  webSocket,
} from 'wagmi'
import { baseSepolia, mainnet, sepolia } from 'wagmi/chains'
import { paraConnector } from '@getpara/wagmi-v2-integration'
import { OAuthMethod } from '@getpara/web-sdk'
import PcDesktop from '../..'
import { injected } from 'wagmi/connectors'
import { PregenProvider } from '../Storage&Hooks/PregenSession'
import para from '../Authentication/para'
import { Toaster } from 'react-hot-toast'
import { NotificationProvider } from './ToastNotifs'

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
  chains: [sepolia, mainnet, baseSepolia],
  connectors: [connector, injected()],
  transports: {
    [sepolia.id]: http(
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
    ),
    [mainnet.id]: http(),
    [baseSepolia.id]: webSocket(
      `wss://base-sepolia.blastapi.io/${process.env.NEXT_PUBLIC_BLAST_API_KEY}`
    ),
  },
}

export const RPC_URL = {
  infura: {
    sepolia_http: 'https://sepolia.infura.io/v3',
    base_sepolia_http: 'https://base-mainnet.infura.io/v3',
  },
  blast_api: {
    base_sepolia_wss: 'wss://base-sepolia.blastapi.io',
  },
}

export const wagmiConfig = createConfig(config)
export const queryClient = new QueryClient()

const Web3Wrapper: React.FC = () => {
  return (
    <div suppressHydrationWarning>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <PregenProvider>
              <PcDesktop />
            </PregenProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default Web3Wrapper
