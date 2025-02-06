import type { NextApiRequest, NextApiResponse } from 'next'
import { privateKeyToAccount } from 'viem/accounts'
import { keccak256 } from 'viem'

export default async function verifyScoreHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { player, score, gameType } = req.body as {
        player?: string
        score?: string
        gameType?: string
      }
      if (!player || !score || !gameType) {
        res
          .status(400)
          .send('Provide `player`, `score` or `gameType` in the request body.')
        return
      }

      const serverSigner = process.env.SERVER_SIGNER_KEY
      const account = privateKeyToAccount(serverSigner as `0x{string}`)
      const messageHash = keccak256(
        Buffer.from([player, score, gameType].join(''))
      )
      const signature = await account.signMessage({
        message: { raw: messageHash },
      })
      return signature
    } catch (error) {
      // Handle errors
      res
        .status((error as any)?.response?.status || 500)
        .json({ message: (error as any)?.response?.message })
    }
  } else {
    // Handle any non-POST requests
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
