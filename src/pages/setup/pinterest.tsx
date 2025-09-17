import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid,
  Link,
} from '@mui/material'
import {
  CheckCircle,
  Settings,
  Pinterest,
  VpnKey,
} from '@mui/icons-material'
import NextLink from 'next/link'

const steps = [
  'Setup Pinterest API',
  'Setup Complete'
]

export default function PinterestSetup() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Check URL parameters for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const step = urlParams.get('step')
    const success = urlParams.get('success')
    const error = urlParams.get('error')

    if (step === '1' && success === 'true') {
      setActiveStep(1)
      setSuccess('Pinterest account connected successfully!')
    } else if (error === 'oauth_failed') {
      setError('Failed to connect Pinterest account. Please try again.')
    }
  }, [])

  const handleCredentialsChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [field]: event.target.value
    })
  }

  const handleSetupPinterest = async () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      setError('Please fill in both Client ID and Client Secret')
      return
    }

    setLoading(true)
    setError('')

    try {
      // First save credentials
      const credentialsResponse = await fetch('/api/setup/save-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!credentialsResponse.ok) {
        const errorData = await credentialsResponse.json()
        setError(errorData.message || 'Failed to save credentials')
        return
      }

      // Then get access token
      const tokenResponse = await fetch('/api/setup/get-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        if (tokenData.authUrl) {
          // Redirect to Pinterest OAuth
          window.location.href = tokenData.authUrl
        } else {
          setSuccess('Pinterest API setup complete! You can now use the dashboard.')
          setActiveStep(1)
        }
      } else {
        const errorData = await tokenResponse.json()
        setError(errorData.message || 'Failed to get access token')
      }
    } catch (error) {
      setError('An error occurred while setting up Pinterest API')
    } finally {
      setLoading(false)
    }
  }


  const handleComplete = () => {
    router.push('/dashboard')
  }

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <Pinterest sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Pinterest Setup
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Connect your Pinterest account and add your API credentials
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {activeStep === 0 && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <VpnKey sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Step 1: Add Pinterest API Credentials
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                To use Pinterest automation, you need to provide your Pinterest API credentials.
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Don&apos;t have Pinterest API credentials?</strong>{' '}
                <Link 
                  href="https://developers.pinterest.com/" 
                  target="_blank" 
                  rel="noopener"
                  color="primary"
                >
                  Get them from Pinterest Developer Dashboard
                </Link>
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pinterest Client ID"
                  value={credentials.clientId}
                  onChange={handleCredentialsChange('clientId')}
                  placeholder="Enter your Pinterest Client ID"
                  helperText="Found in your Pinterest Developer Dashboard"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pinterest Client Secret"
                  type="password"
                  value={credentials.clientSecret}
                  onChange={handleCredentialsChange('clientSecret')}
                  placeholder="Enter your Pinterest Client Secret"
                  helperText="Keep this secure - it's your secret key"
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSetupPinterest}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                {loading ? 'Setting up...' : 'Setup Pinterest API'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Setup Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your Pinterest API is now configured with an access token. You can start creating and scheduling pins.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleComplete}
              sx={{ mt: 2 }}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <Link component={NextLink} href="/privacy" color="primary">
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Container>
  )
}
