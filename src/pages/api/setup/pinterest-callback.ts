import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { code, error } = req.query

    if (error) {
      return res.redirect('/setup/pinterest?error=oauth_failed')
    }

    if (!code) {
      return res.status(400).json({ message: 'Authorization code not provided' })
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
      return res.status(400).json({ message: 'Pinterest credentials not found' })
    }

    // Exchange code for access token
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/setup/pinterest-callback`
    
    const tokenResponse = await axios.post('https://api.pinterest.com/v5/oauth/token', {
      grant_type: 'authorization_code',
      client_id: user.pinterestClientId,
      client_secret: user.pinterestClientSecret,
      code: code,
      redirect_uri: redirectUri,
    })

    const { access_token, refresh_token, expires_in } = tokenResponse.data

    // Get user info from Pinterest
    const userResponse = await axios.get('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })

    const pinterestUser = userResponse.data

    // Update the user with the access token and Pinterest user info
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pinterestAccessToken: access_token,
        pinterestTokenExpires: new Date(Date.now() + expires_in * 1000),
        // Store Pinterest user info in name field for now
        name: pinterestUser.username || pinterestUser.full_name || user.name,
      },
    })

    // Redirect to setup completion
    res.redirect('/setup/pinterest?step=1&success=true')
  } catch (error) {
    console.error('Pinterest OAuth callback error:', error)
    res.redirect('/setup/pinterest?error=oauth_failed')
  }
}
