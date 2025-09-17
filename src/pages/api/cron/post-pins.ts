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
        pinterestAccount: true,
        board: true,
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
        let accessToken = pin.pinterestAccount.accessToken
        if (pin.pinterestAccount.tokenExpires && pin.pinterestAccount.tokenExpires <= now) {
          if (pin.pinterestAccount.refreshToken) {
            const pinterestAPI = new PinterestAPI(accessToken)
            const newTokens = await pinterestAPI.refreshAccessToken(pin.pinterestAccount.refreshToken)
            
            // Update tokens in database
            await prisma.pinterestAccount.update({
              where: { id: pin.pinterestAccount.id },
              data: {
                accessToken: newTokens.access_token,
                refreshToken: newTokens.refresh_token,
                tokenExpires: new Date(Date.now() + newTokens.expires_in * 1000),
              },
            })
            
            accessToken = newTokens.access_token
          } else {
            throw new Error('Token expired and no refresh token available')
          }
        }

        // Create the pin
        const pinterestAPI = new PinterestAPI(accessToken)
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
