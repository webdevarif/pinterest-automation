import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const statusSchema = z.object({
  extensionId: z.string(),
  userId: z.string(),
  pinId: z.string().optional(),
  signature: z.string(),
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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { extensionId, userId, pinId, signature } = statusSchema.parse(req.query)

    // Verify extension ID
    const allowedExtensions = process.env.ALLOWED_EXTENSION_IDS?.split(',') || []
    if (!allowedExtensions.includes(extensionId)) {
      return res.status(401).json({ message: 'Extension not authorized' })
    }

    // Verify signature
    const dataToSign = `${extensionId}:${userId}${pinId ? ':' + pinId : ''}`
    const secret = process.env.CHROME_EXTENSION_SECRET || 'default-secret'
    
    if (!verifySignature(dataToSign, signature, secret)) {
      return res.status(401).json({ message: 'Invalid signature' })
    }

    const where: any = { userId }
    if (pinId) {
      where.id = pinId
    }

    const pins = await prisma.pinQueue.findMany({
      where,
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
        boardId: pin.boardId,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors })
    }
    console.error('Error fetching chrome extension pin status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
