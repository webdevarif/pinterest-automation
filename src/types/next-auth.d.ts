import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    accessToken?: string
    refreshToken?: string
    pinterestId?: string
    username?: string
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }

  interface JWT {
    accessToken?: string
    refreshToken?: string
    pinterestId?: string
    username?: string
  }
}
