import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid pin ID' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (req.method === 'DELETE') {
      const pin = await prisma.pinQueue.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      })

      if (!pin) {
        return res.status(404).json({ message: 'Pin not found' })
      }

      if (pin.posted) {
        return res.status(400).json({ message: 'Cannot delete posted pin' })
      }

      await prisma.pinQueue.delete({
        where: { id },
      })

      res.status(200).json({ message: 'Pin deleted successfully' })
    } else if (req.method === 'GET') {
      const pin = await prisma.pinQueue.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      })

      if (!pin) {
        return res.status(404).json({ message: 'Pin not found' })
      }

      res.status(200).json(pin)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error handling pin request:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
