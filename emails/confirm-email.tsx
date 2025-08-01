import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ConfirmEmailProps {
  userName?: string
  confirmationUrl: string
}

export const ConfirmEmail = ({
  userName = '',
  confirmationUrl,
}: ConfirmEmailProps) => {
  const previewText = `Confirm your email for Tom's Flight Club`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Tom's Flight Club</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to Tom's Flight Club!</Heading>
            
            <Text style={paragraph}>
              Hi{userName ? ` ${userName}` : ''},
            </Text>
            
            <Text style={paragraph}>
              Thanks for signing up! We're excited to help you discover amazing flight deals 
              from your home city.
            </Text>

            <Text style={paragraph}>
              Please confirm your email address to start receiving our hand-picked flight deals:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={confirmationUrl}>
                Confirm Email Address
              </Button>
            </Section>

            <Text style={smallText}>
              Or copy and paste this link into your browser:
            </Text>
            <Link href={confirmationUrl} style={link}>
              {confirmationUrl}
            </Link>

            <Section style={benefitsSection}>
              <Heading as="h2" style={h2}>
                What you'll get:
              </Heading>
              
              <Text style={benefitItem}>
                ✈️ <strong>Daily flight deals</strong> from your chosen home city
              </Text>
              
              <Text style={benefitItem}>
                💰 <strong>Save up to 90%</strong> on flights worldwide
              </Text>
              
              <Text style={benefitItem}>
                🌍 <strong>Mistake fares</strong> and exclusive deals you won't find elsewhere
              </Text>
              
              <Text style={benefitItem}>
                📱 <strong>Personalized alerts</strong> for your favorite destinations
              </Text>
            </Section>

            <Text style={paragraph}>
              This link will expire in 24 hours for security reasons.
            </Text>

            <Text style={signoff}>
              Happy travels,<br />
              The Tom's Flight Club Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Tom's Flight Club. All rights reserved.
            </Text>
            <Text style={footerText}>
              Tom's Flight Club, London, UK
            </Text>
            <Section style={footerLinks}>
              <Link href="https://tomsflightclub.com/privacy" style={footerLink}>
                Privacy Policy
              </Link>
              {' • '}
              <Link href="https://tomsflightclub.com/terms" style={footerLink}>
                Terms of Service
              </Link>
              {' • '}
              <Link href="https://tomsflightclub.com/contact" style={footerLink}>
                Contact Us
              </Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ConfirmEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginTop: '20px',
  marginBottom: '20px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}

const header = {
  backgroundColor: '#415BE7',
  padding: '20px 40px',
  textAlign: 'center' as const,
}

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
  letterSpacing: '-0.5px',
}

const content = {
  padding: '40px',
}

const h1 = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 30px',
}

const h2 = {
  color: '#1a202c',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '30px 0 20px',
}

const paragraph = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#415BE7',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const smallText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0 8px',
}

const link = {
  color: '#415BE7',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const benefitsSection = {
  backgroundColor: '#f7fafc',
  borderRadius: '6px',
  padding: '24px',
  margin: '32px 0',
}

const benefitItem = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '12px 0',
}

const signoff = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
}

const footer = {
  backgroundColor: '#f7fafc',
  padding: '32px 40px',
}

const footerText = {
  color: '#718096',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '4px 0',
}

const footerLinks = {
  textAlign: 'center' as const,
  margin: '16px 0 0',
}

const footerLink = {
  color: '#415BE7',
  fontSize: '14px',
  textDecoration: 'none',
}