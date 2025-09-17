/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NODE_ENV === 'production' 
      ? 'https://webdevarif-pin-automation.netlify.app'
      : 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    PINTEREST_CLIENT_ID: process.env.PINTEREST_CLIENT_ID,
    PINTEREST_CLIENT_SECRET: process.env.PINTEREST_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
}

module.exports = nextConfig
