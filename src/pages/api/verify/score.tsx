import type { NextApiRequest, NextApiResponse } from 'next'
import { privateKeyToAccount } from 'viem/accounts'
import { keccak256 } from 'viem'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { player, score, gameType, timestamp } = req.body

    // Validate inputs
    if (!player || typeof score !== 'number' || typeof gameType !== 'number') {
      return res.status(400).json({
        success: false,
        error:
          'Invalid input. Required: player (address), score (number), gameType (number)',
      })
    }
    /*const message = ethers.utils.solidityKeccak256(
      ['address', 'uint256', 'uint8'],
      [player, score, gameType]
    )*/
    const serverSigner = process.env.SERVER_SIGNER_KEY
    if (!serverSigner) {
      throw new Error('Signer private key not configured')
    }

    const account = privateKeyToAccount(`0x${serverSigner}`)

    const messageHash = keccak256(
      Buffer.from([player, score, gameType].join(''))
    )
    console.log(messageHash)
    console.log(Buffer.from([player, score, gameType].join('')))

    const signature = await account.signMessage({
      message: { raw: messageHash },
    })

    return res.status(200).json({
      success: true,
      signature,
      // message: message,
    })
  } catch (error) {
    console.error('Error signing score:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to sign score: ' + (error as any).message,
    })
  }
}
