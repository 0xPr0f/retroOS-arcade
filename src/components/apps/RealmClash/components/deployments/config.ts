import { http, createConfig, webSocket } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: webSocket(
      'wss://base-sepolia.blastapi.io/ad59226d-7bf0-4950-8679-6b399d842227'
    ),
  },
})
