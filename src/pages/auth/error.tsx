import { useRouter } from 'next/router'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material'
import { Error as ErrorIcon, ArrowBack } from '@mui/icons-material'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  const getErrorMessage = (error: string | string[] | undefined) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      default:
        return 'An error occurred during authentication.'
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Authentication Error
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {getErrorMessage(error)}
          </Alert>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please try signing in again or contact support if the problem persists.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/')}
              sx={{ mr: 2 }}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push('/auth/signin')}
            >
              Try Again
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
