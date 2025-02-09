import { categorizeIdentifier } from '@/components/pc/drives/Extensions/utils'
import { encrypt } from '@/components/library/utils/encryption-utils'
import {
  Para as ParaServer,
  Environment,
  WalletType,
} from '@getpara/server-sdk'

import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { PregenWalletData } from '../apps/drivers/db/create'

export default async function createPregenWalletHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const { identifier } = req.body as { identifier?: string }
    if (!identifier) {
      res
        .status(400)
        .send(
          'Provide `identifier` in the request body to create a pre-generated wallet.'
        )
      return
    }
    const PARA_API_KEY = process.env.PARA_API_KEY
    if (!PARA_API_KEY) {
      res
        .status(500)
        .send('Set PARA_API_KEY in the environment before using this handler.')
      return
    }
    const paraServer = new ParaServer(Environment.BETA, PARA_API_KEY)
    const walletExists = await paraServer.hasPregenWallet({
      pregenIdentifier: identifier,
      pregenIdentifierType: categorizeIdentifier(identifier),
    })
    if (walletExists) {
      const host = req.headers.host
      const protocol = req.headers['x-forwarded-proto'] || 'http'
      const dbStoreUrl = `${protocol}://${host}/api/apps/drivers/db/retrieve?identifier=${identifier}`
      const result = await axios.get(dbStoreUrl)
      res.status(200).json({
        success: true,
        identifier: identifier,
        wallet_address: result.data.data.wallet_address,
        pregen_wallet_id: result.data.data.pregen_wallet_id,
        encryptedKeyShare: result.data.data.encryptedKeyShare,
      } satisfies PregenWalletData & { success: boolean })
      return
    }
    const wallet = await paraServer.createPregenWallet({
      type: WalletType.EVM,
      pregenIdentifier: identifier,
      pregenIdentifierType: categorizeIdentifier(identifier),
    })
    if (!wallet) {
      res
        .status(500)
        .send(
          'Failed to create pre-generated wallet. Check your Para configuration and try again.'
        )
      return
    }

    const keyShare = paraServer.getUserShare()
    if (!keyShare) {
      res
        .status(500)
        .send(
          'Failed to retrieve user share from the Para client. Confirm wallet creation steps.'
        )
      return
    }

    const encryptedKeyShare = encrypt(keyShare)

    const host = req.headers.host
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const dbStoreUrl = `${protocol}://${host}/api/apps/drivers/db/create`
    await axios.post(dbStoreUrl, {
      identifier,
      wallet_address: wallet.address!,
      pregen_wallet_id: wallet.id,
      encryptedKeyShare: encryptedKeyShare,
    } satisfies PregenWalletData)

    res.status(201).json({
      success: true,
      identifier: identifier,
      wallet_address: wallet.address!,
      pregen_wallet_id: wallet.id,
      encryptedKeyShare: encryptedKeyShare,
    } satisfies PregenWalletData & { success: boolean })
  } catch (error) {
    console.error('Error creating pre-generated wallet:', error)
    res.status(500).send('Error creating pre-generated wallet')
  }
}
