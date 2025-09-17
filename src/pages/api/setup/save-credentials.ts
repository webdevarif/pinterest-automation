import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const credentialsSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
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

    const { clientId, clientSecret } = credentialsSchema.parse(req.body)

    // Update user with Pinterest credentials
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pinterestClientId: clientId,
        pinterestClientSecret: clientSecret,
      },
    })

    res.status(200).json({ 
      success: true, 
      message: 'Pinterest credentials saved successfully' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors })
    }
    console.error('Error saving Pinterest credentials:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
