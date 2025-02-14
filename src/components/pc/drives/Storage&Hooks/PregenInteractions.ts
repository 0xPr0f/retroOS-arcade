import { useState } from 'react'
import axios from 'axios'
import { useChainId } from 'wagmi'
import { usePregenSession } from './PregenSession'

interface PregenTransactionParams {
  abi?: any
  address?: string
  functionName?: string
  args?: any[]
  value?: string
  toAddress?: `0x${string}`
}

interface MutationOptions {
  onSuccess?: (txHash: string) => void
  onError?: (error: any) => void
  onSettled?: () => void
}

interface UsePregenTransactionProps {
  mutation?: MutationOptions
}

interface TransactionState {
  isPending: boolean
  error: Error | null
  data: `0x${string}` | undefined
}

export function usePregenTransaction({
  mutation,
}: UsePregenTransactionProps = {}) {
  const { pregenEncryptedKeyShare, pregenWalletId, isLoginPregenSession } =
    usePregenSession()

  const chainId = useChainId()

  const [state, setState] = useState<TransactionState>({
    isPending: false,
    error: null,
    data: undefined,
  })

  const writeContract = async ({
    abi,
    address,
    functionName,
    args,
    value,
    toAddress,
  }: PregenTransactionParams) => {
    if (!isLoginPregenSession) {
      throw new Error('Pregen session not initialized')
    }

    if (!pregenEncryptedKeyShare || !pregenWalletId) {
      throw new Error('Missing required Pregen credentials')
    }

    setState((prev) => ({ ...prev, isPending: true }))

    try {
      const response = await axios.post('api/create/pregentransaction', {
        // const response = await axios.post('api/create/pregensponsoredtx', {
        abi,
        toAddress: toAddress || address,
        functionName,
        args,
        chainId,
        userShare: pregenEncryptedKeyShare,
        walletId: pregenWalletId,
        value,
      })

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Transaction failed')
      }

      const txHash = response.data.data

      setState((prev) => ({
        ...prev,
        isPending: false,
        data: txHash,
        error: null,
      }))

      mutation?.onSuccess?.(txHash)
      return txHash
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isPending: false,
        error: error as Error,
      }))

      mutation?.onError?.(error)
      throw error
    } finally {
      mutation?.onSettled?.()
    }
  }

  return {
    writeContract,
    data: state.data,
    error: state.error,
    isPending: state.isPending,
    isReady:
      isLoginPregenSession && !!pregenEncryptedKeyShare && !!pregenWalletId,
  }
}

// Usage example:
/*
const ExampleComponent = () => {
  const {
    writeContract,
    data,
    error,
    isLoading,
    isReady
  } = usePregenTransaction()

  const handleTransaction = async () => {
    try {
      await writeContract({
        abi: TESTABI,
        toAddress: testaddress,
        functionName: 'callData',
        args: [2]
      })
      // Handle success
    } catch (error) {
      // Handle error
    }
  }

  return null // JSX
}*/
