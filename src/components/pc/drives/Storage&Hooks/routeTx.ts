import axios from 'axios'

interface RouteTransactionParams {
  abi?: any
  address?: string
  functionName?: string
  args?: any[]
  value?: string
  toAddress?: string
  chainId?: number
  session?: string
  pregenWalletId?: string
}

export async function routeTransaction({
  abi,
  address,
  functionName,
  args,
  value,
  toAddress,
  chainId,
  session,
  pregenWalletId,
}: RouteTransactionParams = {}) {
  try {
    const txResponse = await axios.post(
      'api/create/pregensponsoredtx',
      {
        abi,
        toAddress: toAddress || address,
        functionName,
        args,
        chainId,
        userShare: session,
        walletId: pregenWalletId,
        value,
      },
      {
        timeout: 60000,
      }
    )
    console.log(txResponse)
    if (!txResponse.data.success) {
      throw new Error(txResponse.data.error || 'Transaction failed')
    }

    const txHash = txResponse.data.data
    if (!txHash || !txHash.startsWith('0x')) {
      throw new Error('Invalid transaction hash received')
    }

    return txHash
  } catch (error) {
    console.error('Error fetching transaction data:', error)
    throw error
  }
}
