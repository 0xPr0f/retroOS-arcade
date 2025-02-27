import { decrypt } from '@/components/library/utils/encryption-utils'
import {
  PrepareAndSignTransactionWithPregenWalletServer,
  UpdateAndClaimPregenWallet,
} from '@/components/pc/drives/Interactions'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface UpdateAndClaimPregenWalletProps {
  newPregenIdentifier: string
  userShare: string
  walletId: string
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
    const { userShare, walletId, newPregenIdentifier } =
      req.body as UpdateAndClaimPregenWalletProps
    console.log(
      'User share',
      walletId,
      newPregenIdentifier,
      'This API was called'
    )
    const [decryptedKeyShare, _] = await Promise.all([
      decrypt(userShare!),
      new Promise((resolve) => setTimeout(resolve, 100)),
    ])

    const recoverySecret = await UpdateAndClaimPregenWallet({
      pregenIdentifier: newPregenIdentifier,
      walletId: walletId,
      userShare: decryptedKeyShare.data,
    })
    console.log(recoverySecret)
    return res.status(200).json({
      success: true,
      data: recoverySecret,
    })
  } catch (error) {
    console.error('Update and Claim Pregen Wallet Error', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update and claim pregen wallet'
    console.log(error)
    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
}
