import { PrepareAndSignTransactionWithPregenWalletServerProps } from './pregentransaction'

import { AlchemyPrepareAndSignSponsoredTransactionWith7702 } from '@/components/pc/drives/Interactions'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function alchemyEip7702SignHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
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

  const txHash = await AlchemyPrepareAndSignSponsoredTransactionWith7702({
    session: userShare,
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
    data: txHash,
  })
}
