import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link,
  Card,
  CardContent,
} from '@mui/material'
import { PrivacyTip, Security, DataUsage, Visibility } from '@mui/icons-material'

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <PrivacyTip sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Security sx={{ mr: 2, color: 'primary.main' }} />
          Information We Collect
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Personal Information
        </Typography>
        <Typography variant="body1" paragraph>
          When you use our Pinterest Automation service, we collect the following information:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Pinterest Account Information"
              secondary="Your Pinterest username, profile information, and account details that you choose to share with us through Pinterest's OAuth2 authentication."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Authentication Tokens"
              secondary="Access tokens and refresh tokens provided by Pinterest to enable our service to post content on your behalf."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Pin Content"
              secondary="Titles, descriptions, images, and links of pins you schedule through our service."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Usage Data"
              secondary="Information about how you use our service, including scheduling preferences and posting patterns."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DataUsage sx={{ mr: 2, color: 'primary.main' }} />
          How We Use Your Information
        </Typography>
        
        <Typography variant="body1" paragraph>
          We use the information we collect to:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Provide Our Service"
              secondary="Schedule and post pins to your Pinterest boards according to your preferences."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Authenticate with Pinterest"
              secondary="Use your Pinterest credentials to access Pinterest's API and perform actions on your behalf."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Improve Our Service"
              secondary="Analyze usage patterns to enhance functionality and user experience."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Customer Support"
              secondary="Respond to your inquiries and provide technical assistance."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Visibility sx={{ mr: 2, color: 'primary.main' }} />
          Data Sharing and Disclosure
        </Typography>
        
        <Typography variant="body1" paragraph>
          We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Pinterest API"
              secondary="We share necessary information with Pinterest's API to perform the services you've requested, such as posting pins to your boards."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Legal Requirements"
              secondary="We may disclose your information if required by law or in response to valid legal requests."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Service Providers"
              secondary="We may share information with trusted third-party service providers who assist us in operating our service, such as hosting providers and database services."
            />
          </ListItem>
        </List>
      </Paper>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Security sx={{ mr: 2, color: 'primary.main' }} />
            Data Security
          </Typography>
          
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary="Encryption"
                secondary="All data transmission is encrypted using industry-standard SSL/TLS protocols."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Secure Storage"
                secondary="Your data is stored in secure databases with restricted access controls."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Access Controls"
                secondary="Only authorized personnel have access to your personal information."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Regular Audits"
                secondary="We regularly review and update our security practices to maintain the highest standards."
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Rights and Choices
        </Typography>
        
        <Typography variant="body1" paragraph>
          You have the following rights regarding your personal information:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Access"
              secondary="You can request access to the personal information we hold about you."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Correction"
              secondary="You can request correction of any inaccurate or incomplete information."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Deletion"
              secondary="You can request deletion of your personal information, subject to certain exceptions."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Data Portability"
              secondary="You can request a copy of your data in a structured, machine-readable format."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Withdraw Consent"
              secondary="You can withdraw your consent for data processing at any time by disconnecting your Pinterest account."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Third-Party Services
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our service integrates with the following third-party services:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Pinterest API"
              secondary={
                <Box>
                  We use Pinterest&apos;s official API to provide our automation services. 
                  Your use of our service is also subject to Pinterest&apos;s{' '}
                  <Link href="https://policy.pinterest.com/en/privacy-policy" target="_blank" rel="noopener">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="https://policy.pinterest.com/en/terms-of-service" target="_blank" rel="noopener">
                    Terms of Service
                  </Link>.
                </Box>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Database Services"
              secondary="We use secure database services to store your information and ensure data availability."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Hosting Services"
              secondary="Our application is hosted on secure cloud infrastructure to ensure reliable service delivery."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Data Retention
        </Typography>
        
        <Typography variant="body1" paragraph>
          We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. Specifically:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Account Information"
              secondary="Retained while your account is active and for a reasonable period after account closure."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Pin Data"
              secondary="Retained until you delete the pin or close your account."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Usage Data"
              secondary="Retained for analytics purposes for up to 2 years after collection."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Children&apos;s Privacy
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Changes to This Privacy Policy
        </Typography>
        
        <Typography variant="body1" paragraph>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this privacy policy periodically for any changes.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Contact Us
        </Typography>
        
        <Typography variant="body1" paragraph>
          If you have any questions about this privacy policy or our data practices, please contact us:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Email"
              secondary="privacy@pinterest-automation.com"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Support"
              secondary="support@pinterest-automation.com"
            />
          </ListItem>
        </List>
      </Paper>

      <Divider sx={{ my: 4 }} />
      
      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          This privacy policy is effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in its provisions in the future.
        </Typography>
      </Box>
    </Container>
  )
}
