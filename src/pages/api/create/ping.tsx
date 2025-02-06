import type { NextApiRequest, NextApiResponse } from 'next'

interface PingResponse {
  success: boolean
  timestamp: number
  serverLoad?: {
    uptime: number
    memory: {
      free: number
      total: number
      percentUsed: number
    }
  }
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PingResponse>
) {
  try {
    const timestamp = Date.now()

    // Basic server metrics
    const serverLoad = {
      uptime: process.uptime(),
      memory: {
        free: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentUsed:
          (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) *
          100,
      },
    }

    res.status(200).json({
      success: true,
      timestamp,
      serverLoad,
      message: 'pong',
    })
  } catch (error) {
    console.error('Ping error:', error)
    res.status(500).json({
      success: false,
      timestamp: Date.now(),
      message: 'Failed to ping',
    })
  }
}
