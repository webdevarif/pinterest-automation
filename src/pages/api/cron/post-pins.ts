import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { PinterestAPI } from '@/lib/pinterest-api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Verify this is a cron job request
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const now = new Date()
    
    // Find pins that are scheduled to be posted and haven't been posted yet
    const pendingPins = await prisma.pinQueue.findMany({
      where: {
        posted: false,
        scheduledAt: {
          lte: now,
        },
        retryCount: {
          lt: 3, // Max 3 retries
        },
      },
      include: {
        user: {
          select: {
            pinterestAccessToken: true,
            pinterestClientId: true,
            pinterestClientSecret: true,
            pinterestTokenExpires: true,
          }
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: 10, // Process max 10 pins at a time
    })

    const results = []

    for (const pin of pendingPins) {
      try {
        // Check if token is expired and refresh if needed
        let accessToken = pin.user.pinterestAccessToken
        if (!accessToken) {
          throw new Error('No Pinterest access token found')
        }

        if (pin.user.pinterestTokenExpires && pin.user.pinterestTokenExpires <= now) {
          // For client credentials flow, we need to get a new token
          const pinterestAPI = new PinterestAPI(
            accessToken,
            pin.user.pinterestClientId || undefined,
            pin.user.pinterestClientSecret || undefined
          )
          const newTokens = await pinterestAPI.refreshAccessToken('') // Empty refresh token for client credentials
          
          // Update tokens in database
          await prisma.user.update({
            where: { id: pin.userId },
            data: {
              pinterestAccessToken: newTokens.access_token,
              pinterestTokenExpires: new Date(Date.now() + newTokens.expires_in * 1000),
            },
          })
          
          accessToken = newTokens.access_token
        }

        // Create the pin
        const pinterestAPI = new PinterestAPI(
          accessToken,
          pin.user.pinterestClientId || undefined,
          pin.user.pinterestClientSecret || undefined
        )
        const createdPin = await pinterestAPI.createPin({
          board_id: pin.boardId!,
          title: pin.title,
          description: pin.description,
          link: pin.link || undefined,
          media_source: {
            source_type: 'image_url',
            url: pin.imageUrl,
          },
        })

        // Mark as posted
        await prisma.pinQueue.update({
          where: { id: pin.id },
          data: {
            posted: true,
            postedAt: new Date(),
            errorMessage: null,
          },
        })

        results.push({
          pinId: pin.id,
          status: 'success',
          pinterestPinId: createdPin.id,
        })
      } catch (error) {
        console.error(`Error posting pin ${pin.id}:`, error)
        
        // Increment retry count
        await prisma.pinQueue.update({
          where: { id: pin.id },
          data: {
            retryCount: pin.retryCount + 1,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })

        results.push({
          pinId: pin.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    res.status(200).json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
