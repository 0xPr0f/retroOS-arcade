import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  const cx = process.env.NEXT_PUBLIC_GOOGLE_CX_KEY
  if (req.method === 'GET') {
    try {
      const searchQuery = req.query
      const response1 = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${searchQuery.q}&start=${searchQuery.start}&key=${apiKey}&cx=${cx}`
      )
      const data1 = await response1.json()
      const response2 = await fetch(
        `https://www.googleapis.com/customsearch/v1?q=${
          searchQuery.q
        }&start=${11}&key=${apiKey}&cx=${cx}`
      )
      const data2 = await response2.json()
      const combinedItems = [...data1.items, ...data2.items]
      res.json({ ...data1, items: combinedItems })
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
