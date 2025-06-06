import { http, createConfig, webSocket } from 'wagmi'
import { baseSepolia, monadTestnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [baseSepolia, monadTestnet],
  transports: {
    [baseSepolia.id]: webSocket(
      'wss://base-mainnet.g.alchemy.com/v2/ciapmrXJjS296dSkAKWAdz__y7mSLKdP'
    ),
    [monadTestnet.id]: http(
      'wss://monad-testnet.g.alchemy.com/v2/ciapmrXJjS296dSkAKWAdz__y7mSLKdP'
    ),
  },
})
