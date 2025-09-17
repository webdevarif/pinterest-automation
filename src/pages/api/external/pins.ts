import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const externalPinSchema = z.object({
  userId: z.string(),
  boardId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  imageUrl: z.string().url(),
  link: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const body = externalPinSchema.parse(req.body)
    const { userId, boardId, title, description, imageUrl, link, scheduledAt } = body

    // Verify user exists and has Pinterest setup
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        pinterestAccessToken: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!user.pinterestAccessToken) {
      return res.status(404).json({ message: 'No Pinterest account linked' })
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date()

    // Create pin in queue
    const pinQueue = await prisma.pinQueue.create({
      data: {
        userId,
        boardId,
        title,
        description,
        imageUrl,
        link,
        scheduledAt: scheduledDate,
      },
    })

    res.status(201).json({
      success: true,
      pinId: pinQueue.id,
      message: 'Pin added to queue successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors })
    }
    console.error('Error creating external pin:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
