/*import type { NextApiRequest, NextApiResponse } from 'next'
import { pinata } from '@/components/pc/drives/Interactions/pinata'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    const uuid = crypto.randomUUID()
    const keyData = await pinata.keys.create({
      keyName: uuid.toString(),
      permissions: {
        admin: true,
        endpoints: {
          pinning: {
            pinFileToIPFS: true,
          },
        },
      },
      maxUses: 2,
    })
    return res.status(200).json({
      success: true,
      data: keyData,
    })
  } catch (error) {
    console.error('Pinata key creation error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error creating API Key',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
*/

import type { NextApiRequest, NextApiResponse } from 'next'
import { pinata } from '@/components/pc/drives/Interactions/pinata'

export const dynamic = 'force-dynamic' // Ensures no static caching at route level

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 60,
    })

    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    return res.status(200).json({ url: url, status: 200 })
  } catch (error) {
    console.error('Error creating signed URL:', error)
    return res
      .status(500)
      .json({ text: 'Error creating signed URL', status: 500 })
  }
}
