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
import { baseSepolia, mainnet, sepolia, monadTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import PcDesktop from '../..'
import para from '../Authentication/para'
import {
  GameScoreProvider,
  PregenProvider,
  NotificationProvider,
  NavbarProvider,
  ValueProvider,
  DispatchWindowProvider,
} from '@/components/pc/drives'

import { Environment, ParaProvider } from '@getpara/react-sdk'

import '@getpara/react-sdk/styles.css'
import { SmartAccountProvider } from '../Storage&Hooks/SmartAccountHook'

export const RPC_URL = {
  infura: {
    sepolia_http: 'https://sepolia.infura.io/v3',
    base_sepolia_http: 'https://base-mainnet.infura.io/v3',
  },
  blast_api: {
    base_sepolia_wss: 'wss://base-sepolia.blastapi.io',
  },
}

//export const wagmiConfig = createConfig(config)
export const queryClient = new QueryClient()

/*
const connector = paraConnector({
  para: para,
  chains: [sepolia, monadTestnet, baseSepolia],
  appName: 'RetroOS Arcade',
  options: {},
  queryClient: queryClient,
  nameOverride: 'Para',
  idOverride: 'para',
  oAuthMethods: [OAuthMethod.GOOGLE, OAuthMethod.TWITTER],
  disableEmailLogin: false,
  disablePhoneLogin: false,
  onRampTestMode: true,
})
*/

/*
export const config: CreateConfigParameters = {
  chains: [baseSepolia, sepolia, monadTestnet, mainnet],
  connectors: [connector injected()],
  transports: {
    [baseSepolia.id]: webSocket(
      `wss://base-sepolia.blastapi.io/${process.env.NEXT_PUBLIC_BLAST_API_KEY}`
    ),
    [sepolia.id]: http(
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
    ),
    [monadTestnet.id]: http(`wss://monad-testnet.drpc.org`), //Not seeing a personal one
    [mainnet.id]: http(),
  },
}
*/

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={para}
        paraModalConfig={{
          isGuestModeEnabled: true,
        }}
        config={{
          appName: 'Retro Arcade',
        }}
        externalWalletConfig={{
          evmConnector: {
            config: {
              chains: [baseSepolia, monadTestnet, sepolia, mainnet],
            },
          },
          wallets: ['METAMASK', 'RABBY', 'PHANTOM', 'WALLETCONNECT'],
          walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
          },
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  )
}

const Web3Wrapper: React.FC = () => {
  return (
    <div>
      {/*} <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}> */}
      <Providers>
        <ValueProvider>
          <SmartAccountProvider>
            <PregenProvider>
              <NotificationProvider>
                <DispatchWindowProvider>
                  <NavbarProvider>
                    <GameScoreProvider>
                      <PcDesktop />
                    </GameScoreProvider>
                  </NavbarProvider>
                </DispatchWindowProvider>
              </NotificationProvider>
            </PregenProvider>
          </SmartAccountProvider>
        </ValueProvider>
      </Providers>
      {/*}  </QueryClientProvider>
      </WagmiProvider> */}
    </div>
  )
}

export default Web3Wrapper
