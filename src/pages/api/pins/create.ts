import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PinterestAPI } from '@/lib/pinterest-api'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPinSchema = z.object({
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
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const body = createPinSchema.parse(req.body)
    const { boardId, title, description, imageUrl, link, scheduledAt } = body

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

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date()

    // If scheduled for immediate posting
    if (scheduledDate <= new Date()) {
      try {
        const pinterestAPI = new PinterestAPI(
          user.pinterestAccessToken,
          user.pinterestClientId || undefined,
          user.pinterestClientSecret || undefined
        )
        const pin = await pinterestAPI.createPin({
          board_id: boardId,
          title,
          description,
          link,
          media_source: {
            source_type: 'image_url',
            url: imageUrl,
          },
        })

        // Store in database as posted
        const pinQueue = await prisma.pinQueue.create({
          data: {
            userId: session.user.id,
            boardId,
            title,
            description,
            imageUrl,
            link,
            scheduledAt: scheduledDate,
            posted: true,
            postedAt: new Date(),
          },
        })

        res.status(201).json({ pin, pinQueue })
      } catch (error) {
        console.error('Error creating pin:', error)
        res.status(500).json({ message: 'Failed to create pin' })
      }
    } else {
      // Schedule for later
      const pinQueue = await prisma.pinQueue.create({
        data: {
          userId: session.user.id,
          boardId,
          title,
          description,
          imageUrl,
          link,
          scheduledAt: scheduledDate,
        },
      })

      res.status(201).json({ pinQueue, message: 'Pin scheduled for later posting' })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors })
    }
    console.error('Error creating pin:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
