'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import { paraConnector } from '@getpara/wagmi-v2-integration'
import { OAuthMethod } from '@getpara/web-sdk'
import {
  createConfig,
  CreateConfigParameters,
  http,
  WagmiProvider,
  webSocket,
} from 'wagmi'
import { baseSepolia, mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import PcDesktop from '../..'
import para from '../Authentication/para'
import { PregenProvider } from '../Storage&Hooks/PregenSession'
import { NotificationProvider } from './ToastNotifs'
import { DispatchWindowProvider } from '../UI/dispatchWindow'
import { NavbarProvider } from '../Storage&Hooks/NavbarApi'
import { ValueProvider } from '../Storage&Hooks/ValueProvider'

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
  chains: [baseSepolia, sepolia, mainnet],
  connectors: [connector, injected()],
  transports: {
    [baseSepolia.id]: webSocket(
      `wss://base-sepolia.blastapi.io/${process.env.NEXT_PUBLIC_BLAST_API_KEY}`
    ),
    [sepolia.id]: http(
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
    ),
    [mainnet.id]: http(),
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
    <div>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ValueProvider>
            <PregenProvider>
              <NotificationProvider>
                <DispatchWindowProvider>
                  <NavbarProvider>
                    <PcDesktop />
                  </NavbarProvider>
                </DispatchWindowProvider>
              </NotificationProvider>
            </PregenProvider>
          </ValueProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default Web3Wrapper
