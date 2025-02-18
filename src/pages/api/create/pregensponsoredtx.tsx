import { decrypt } from '@/components/library/utils/encryption-utils'
import { PrepareAndSignSponsoredTransactionWithPregenWalletServer } from '@/components/pc/drives/Interactions'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface PrepareAndSignTransactionWithPregenWalletServerProps {
  chainId: number
  userShare: string
  walletId: string
  abi: any[]
  toAddress: `0x${string}`
  functionName: string
  args: any[]
  value?: string
}

interface ApiResponse {
  success: boolean
  data?: string // txHash
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const {
      chainId,
      userShare,
      walletId,
      abi,
      toAddress,
      functionName,
      args,
      value,
    } = req.body as PrepareAndSignTransactionWithPregenWalletServerProps
    const decryptedKeyShare = decrypt(userShare!)
    const txHash =
      await PrepareAndSignSponsoredTransactionWithPregenWalletServer({
        userShare: decryptedKeyShare.data,
        walletId: walletId,
        abi: abi,
        toAddress: toAddress,
        chainId: chainId,
        value: value,
        functionName: functionName,
        args: args,
      })
    return res.status(200).json({
      success: true,
      data: txHash!,
    })
  } catch (error) {
    console.error('Transaction Error', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process transaction'
    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
}
