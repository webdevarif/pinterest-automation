import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const statusSchema = z.object({
  userId: z.string(),
  pinId: z.string().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { userId, pinId } = statusSchema.parse(req.query)

    const where: any = { userId }
    if (pinId) {
      where.id = pinId
    }

    const pins = await prisma.pinQueue.findMany({
      where,
      include: {
        pinterestAccount: true,
        board: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.status(200).json({
      success: true,
      pins: pins.map(pin => ({
        id: pin.id,
        title: pin.title,
        description: pin.description,
        imageUrl: pin.imageUrl,
        link: pin.link,
        scheduledAt: pin.scheduledAt,
        posted: pin.posted,
        postedAt: pin.postedAt,
        errorMessage: pin.errorMessage,
        retryCount: pin.retryCount,
        boardName: pin.board?.name,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors })
    }
    console.error('Error fetching pin status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
