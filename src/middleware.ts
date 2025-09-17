import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If user is authenticated and trying to access setup, allow it
    if (token && pathname.startsWith('/setup/')) {
      return NextResponse.next()
    }

    // If user is not authenticated and trying to access protected routes
    if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/setup/'))) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (pathname === '/' || pathname.startsWith('/api/auth/') || pathname === '/privacy') {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/setup/:path*',
    '/api/pins/:path*',
    '/api/pinterest/:path*',
  ]
}
