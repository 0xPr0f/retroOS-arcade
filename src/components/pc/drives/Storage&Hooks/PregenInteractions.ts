import { useEffect, useState } from 'react'
import axios from 'axios'
import { useChainId, usePublicClient } from 'wagmi'
import { usePregenSession } from './PregenSession'
import { useTypedValue } from '..'
import { UserSettings } from '@/components/apps/ControlPanel/components/Setting&Metrics'

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
  const [userControlSettingsValue] = useTypedValue<UserSettings>(
    'userControlSettings'
  )
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

    setState((prev) => ({ ...prev, isPending: true, data: undefined }))

    try {
      let response
      if (!userControlSettingsValue?.use_smart_account) {
        response = await axios.post(
          'api/create/pregentransaction',
          {
            abi,
            toAddress: toAddress || address,
            functionName,
            args,
            chainId,
            userShare: pregenEncryptedKeyShare,
            walletId: pregenWalletId,
            value,
          },
          {
            timeout: 600000,
          }
        )
      } else {
        response = await axios.post(
          'api/create/pregensponsoredtx',
          {
            abi,
            toAddress: toAddress || address,
            functionName,
            args,
            chainId,
            userShare: pregenEncryptedKeyShare,
            walletId: pregenWalletId,
            value,
          },
          {
            timeout: 600000,
          }
        )
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Transaction failed')
      }

      const txHash = response.data.data as `0x${string}`
      if (!txHash || !txHash.startsWith('0x')) {
        throw new Error('Invalid transaction hash received')
      }

      setState((prev) => ({
        ...prev,
        isPending: false,
        data: txHash,
        error: null,
      }))

      mutation?.onSuccess?.(txHash)
      return txHash
    } catch (error) {
      console.error('Transaction error:', error)
      setState((prev) => ({
        ...prev,
        isPending: false,
        data: undefined,
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
/*
export function useCustomWaitForTransactionReceipt({
  hash,
}: {
  hash?: `0x${string}`
}) {
  const [isLoading, setIsLoading] = useState(false)
  const publicClient = usePublicClient()
  const chainId = useChainId()

  const kernelClient = createKernelClientWithPaymaster({
    chainId: chainId,
  })
  const [userControlSettingsValue] = useTypedValue<UserSettings>(
    'userControlSettings'
  )

  useEffect(() => {
    if (!hash) return

    const waitForReceipt = async () => {
      setIsLoading(true)
      try {
        if (!userControlSettingsValue?.use_smart_account) {
          if (!publicClient) throw new Error('Public client not available')
          await publicClient.waitForTransactionReceipt({ hash })
        } else {
          if (!kernelClient) throw new Error('Kernel client not available')
          await (await kernelClient).waitForUserOperationReceipt({ hash })
        }
      } catch (error) {
        console.error('Error waiting for receipt:', error)
      } finally {
        setIsLoading(false)
      }
    }

    waitForReceipt()
  }, [
    hash,
    publicClient,
    kernelClient,
    userControlSettingsValue?.use_smart_account,
  ])

  return { isLoading }
}
*/
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

  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: data
  })

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
