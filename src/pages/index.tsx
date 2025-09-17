import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
} from '@mui/material'
import {
  Pinterest,
  Schedule,
  Api,
  Analytics,
} from '@mui/icons-material'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4">Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box textAlign="center" mb={6}>
        <Pinterest sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          Pinterest Automation
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Automate your Pinterest content with scheduled posts and external API integration
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
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Schedule sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Schedule Posts
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Schedule your pins to be posted at optimal times. Set up your content calendar
                and let the system handle the posting automatically.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Api sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                External API
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Integrate with your existing systems. Add pins programmatically from other
                servers using our secure API endpoints.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Analytics sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Analytics & Insights
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your pin performance and get insights into your posting schedule.
                Monitor success rates and optimize your content strategy.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Pinterest sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Board Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your Pinterest boards directly from the dashboard. View board
                statistics and organize your content efficiently.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 6, p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Ready to get started?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect your Pinterest account to start automating your content strategy.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Pinterest />}
          onClick={() => signIn('pinterest')}
          sx={{ mt: 2 }}
        >
          Get Started
        </Button>
      </Paper>
    </Container>
  )
}
