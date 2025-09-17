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
    if (!session?.accessToken) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const pinterestAPI = new PinterestAPI(session.accessToken)
    const boards = await pinterestAPI.getBoards()

    // Store boards in database
    const pinterestAccount = await prisma.pinterestAccount.findFirst({
      where: { pinterestId: session.pinterestId },
    })

    if (pinterestAccount) {
      for (const board of boards) {
        await prisma.pinterestBoard.upsert({
          where: {
            pinterestAccountId_boardId: {
              pinterestAccountId: pinterestAccount.id,
              boardId: board.id,
            },
          },
          update: {
            name: board.name,
            description: board.description,
            url: board.url,
            pinCount: board.pin_count,
          },
          create: {
            pinterestAccountId: pinterestAccount.id,
            boardId: board.id,
            name: board.name,
            description: board.description,
            url: board.url,
            pinCount: board.pin_count,
          },
        })
      }
    }

    res.status(200).json(boards)
  } catch (error) {
    console.error('Error fetching boards:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
