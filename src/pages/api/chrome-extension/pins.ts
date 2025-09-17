import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const chromePinSchema = z.object({
  extensionId: z.string(),
  userId: z.string(),
  boardId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  imageUrl: z.string().url(),
  link: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
  signature: z.string(), // HMAC signature for security
})

// Generate HMAC signature for request validation
function generateSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

function verifySignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = generateSignature(data, secret)
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const body = chromePinSchema.parse(req.body)
    const { extensionId, userId, boardId, title, description, imageUrl, link, scheduledAt, signature } = body

    // Verify extension ID (you can whitelist specific extension IDs)
    const allowedExtensions = process.env.ALLOWED_EXTENSION_IDS?.split(',') || []
    if (!allowedExtensions.includes(extensionId)) {
      return res.status(401).json({ message: 'Extension not authorized' })
    }

    // Verify signature
    const dataToSign = `${extensionId}:${userId}:${boardId}:${title}:${imageUrl}`
    const secret = process.env.CHROME_EXTENSION_SECRET || 'default-secret'
    
    if (!verifySignature(dataToSign, signature, secret)) {
      return res.status(401).json({ message: 'Invalid signature' })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pinterestAccounts: {
          include: {
            boards: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Find Pinterest account
    const pinterestAccount = user.pinterestAccounts[0]
    if (!pinterestAccount) {
      return res.status(404).json({ message: 'No Pinterest account linked' })
    }

    // Verify board exists
    const board = pinterestAccount.boards.find(b => b.boardId === boardId)
    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date()

    // Create pin in queue
    const pinQueue = await prisma.pinQueue.create({
      data: {
        userId,
        pinterestAccountId: pinterestAccount.id,
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
      scheduledAt: pinQueue.scheduledAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors })
    }
    console.error('Error creating chrome extension pin:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
