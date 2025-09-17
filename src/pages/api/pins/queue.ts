import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

    const { page = '1', limit = '10', status = 'all' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {
      userId: session.user.id,
    }

    if (status === 'posted') {
      where.posted = true
    } else if (status === 'pending') {
      where.posted = false
    }

    const [pins, total] = await Promise.all([
      prisma.pinQueue.findMany({
        where,
        orderBy: {
          scheduledAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.pinQueue.count({ where }),
    ])

    res.status(200).json({
      pins,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Error fetching pin queue:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
