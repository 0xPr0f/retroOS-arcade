import clientPromise from '@/components/library/mongoclient'
import type { NextApiRequest, NextApiResponse } from 'next'

export interface PregenWalletData {
  identifier: string
  wallet_address: string
  pregen_wallet_id: string
  encryptedKeyShare: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise
    const db = await client.db('RetroOS_Arcade')
    const collection = await db.collection('PregenWalletData')
    const data = await collection.insertOne(req.body as PregenWalletData)
    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Failed to fetch data' })
  }
}
