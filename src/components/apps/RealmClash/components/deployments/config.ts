import { http, createConfig, webSocket } from 'wagmi'
import { baseSepolia, monadTestnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [baseSepolia, monadTestnet],
  transports: {
    [baseSepolia.id]: webSocket(
      'wss://base-sepolia.g.alchemy.com/v2/ciapmrXJjS296dSkAKWAdz__y7mSLKdP'
    ),
    [monadTestnet.id]: webSocket(
      'wss://monad-testnet.g.alchemy.com/v2/ciapmrXJjS296dSkAKWAdz__y7mSLKdP'
    ),
  },
})
