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
} from '@mui/material'
import { Pinterest } from '@mui/icons-material'

export default function SignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
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
          <Pinterest sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Connect your Pinterest account to start automating your content
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Pinterest />}
            onClick={() => signIn('pinterest')}
            sx={{ mt: 3, px: 4, py: 1.5 }}
          >
            Connect with Pinterest
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}
