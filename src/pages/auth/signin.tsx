import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Link,
} from '@mui/material'
import { Google } from '@mui/icons-material'
import NextLink from 'next/link'

export default function SignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/setup/pinterest')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Google sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Sign in with Google to start automating your Pinterest content
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Google />}
            onClick={() => signIn('google')}
            sx={{ mt: 3, px: 4, py: 1.5 }}
          >
            Sign in with Google
          </Button>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              By connecting your account, you agree to our{' '}
              <Link component={NextLink} href="/privacy" color="primary">
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
