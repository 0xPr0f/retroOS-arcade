export interface WalletModalTheme {
  background?: string
  textColor?: string
  accentColor?: string
  borderRadius?: string
  hoverBackground?: string
}

export interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (wallet: any) => void
  theme?: WalletModalTheme
  walletOptions?: any[]
  handleWalletConnect?: (wallet: any) => void
  onErrorFunction?: () => void
}
