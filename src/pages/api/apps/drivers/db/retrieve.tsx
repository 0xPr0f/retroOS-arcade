import clientPromise from '@/app/components/library/mongoclient'
import type { NextApiRequest, NextApiResponse } from 'next'
import { PregenWalletData } from './create'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Validate that identifier is provided in query params
    const { identifier } = req.query

    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Identifier is required and must be a string',
      })
    }

    const client = await clientPromise
    const db = await client.db('RetroOS_Arcade')
    const collection = await db.collection('PregenWalletData')

    // Find the document by identifier
    const data = (await collection.findOne({
      identifier,
    })) as PregenWalletData | null

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'No wallet data found for the given identifier',
      })
    }

    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: 'Failed to retrieve data' })
  }
}
