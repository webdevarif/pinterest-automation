import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import PinterestProvider from 'next-auth/providers/pinterest'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    PinterestProvider({
      clientId: process.env.PINTEREST_CLIENT_ID!,
      clientSecret: process.env.PINTEREST_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'pins:read,pins:write,boards:read,boards:write,user_accounts:read'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.pinterestId = profile.id
        token.username = profile.username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.pinterestId = token.pinterestId as string
        session.username = token.username as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'pinterest' && profile) {
        try {
          // Store or update Pinterest account info
          await prisma.pinterestAccount.upsert({
            where: { pinterestId: profile.id as string },
            update: {
              accessToken: account.access_token as string,
              refreshToken: account.refresh_token as string,
              tokenExpires: account.expires_at ? new Date(account.expires_at * 1000) : null,
            },
            create: {
              pinterestId: profile.id as string,
              username: profile.username as string,
              accessToken: account.access_token as string,
              refreshToken: account.refresh_token as string,
              tokenExpires: account.expires_at ? new Date(account.expires_at * 1000) : null,
              userId: user.id,
            },
          })
        } catch (error) {
          console.error('Error storing Pinterest account:', error)
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}
