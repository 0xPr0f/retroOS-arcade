export const loadExternalURL = (url: string, newpage = true) => {
  if (newpage == true) {
    window.open(url, '_blank')
  } else if (newpage == false) {
    window.open(url, '_self')
  }
}
const unsecuredCopyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('Unable to copy to clipboard', err)
  }
  document.body.removeChild(textArea)
}

/**
 * Copies the text passed as param to the system clipboard
 * Check if using HTTPS and navigator.clipboard is available
 * Then uses standard clipboard API, otherwise uses fallback
 */
export const copyToClipboard = (content: string) => {
  if (window.isSecureContext && navigator.clipboard) {
    navigator.clipboard.writeText(content)
  } else {
    unsecuredCopyToClipboard(content)
  }
}

export const shortenText = (str: string, n1 = 6, n2 = 4) => {
  if (str) {
    return `${str.slice(0, n1)}...${str.slice(str.length - n2)}`
  }
  return ''
}
export function isValidAddress(address: string) {
  // Regular expression pattern for Ethereum addresses
  const pattern = /^(0x)?[0-9a-fA-F]{40}$/

  // Check if the address matches the pattern
  return pattern.test(address)
}
export function categorizeIdentifier(identifier: string) {
  // Email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Phone regex pattern (simple example - can be modified for your needs)
  const phonePattern = /^\+?[\d\s-]{10,}$/

  if (emailPattern.test(identifier)) {
    return 'EMAIL'
  }

  if (phonePattern.test(identifier)) {
    return 'PHONE'
  }
  return 'CUSTOM_ID'
}

export const BLAST_MAINNETSCAN_URL = 'https://blastscan.io/'
export const BLAST_TESTNETSCAN_URL = 'https://sepolia.blastscan.io/'
// api down
export const BLAST_TESTNET_API_URL = 'https://waitlist-api.develop.testblast.io'
export const BLAST_MAINNET_API_URL = 'https://waitlist-api.prod.blast.io'

export const DEFAULT_CHAIN_ID = '168587773'
