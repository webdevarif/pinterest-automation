import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get user's Pinterest credentials
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        pinterestClientId: true,
        pinterestClientSecret: true,
      }
    })

    if (!user?.pinterestClientId || !user?.pinterestClientSecret) {
      return res.status(400).json({ message: 'Pinterest credentials not found. Please add your Pinterest API credentials first.' })
    }

    // For Pinterest, we need to use the authorization code flow
    // Since we can't get an access token without user interaction,
    // we'll store the credentials and redirect to Pinterest OAuth
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/setup/pinterest-callback`
    const scope = 'pins:read,pins:write,boards:read,boards:write,user_accounts:read'
    const state = Math.random().toString(36).substring(7)
    
    const authUrl = `https://www.pinterest.com/oauth/?client_id=${user.pinterestClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`
    
    res.status(200).json({ 
      success: true, 
      message: 'Redirecting to Pinterest for authorization',
      authUrl: authUrl
    })
  } catch (error) {
    console.error('Error getting access token:', error)
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to get access token from Pinterest'
      return res.status(400).json({ message: errorMessage })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}
