import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PinterestAPI } from '@/lib/pinterest-api'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get user's Pinterest credentials and access token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        pinterestAccessToken: true,
        pinterestClientId: true,
        pinterestClientSecret: true,
      }
    })

    if (!user?.pinterestAccessToken) {
      return res.status(401).json({ message: 'Please setup your Pinterest API first' })
    }

    const pinterestAPI = new PinterestAPI(
      user.pinterestAccessToken,
      user.pinterestClientId || undefined,
      user.pinterestClientSecret || undefined
    )
    const boards = await pinterestAPI.getBoards()

    res.status(200).json(boards)
  } catch (error) {
    console.error('Error fetching boards:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
