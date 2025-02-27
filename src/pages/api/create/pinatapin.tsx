import type { NextApiRequest, NextApiResponse } from 'next'

// This is currently not working as expected.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    console.log(req.body)
  } catch (error) {
    console.error('Pinata pin error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to pin file',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
