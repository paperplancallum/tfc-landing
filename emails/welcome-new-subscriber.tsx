import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeNewSubscriberEmailProps {
  email: string;
  tempPassword: string;
  planName: string;
  passwordResetUrl: string;
}

export const WelcomeNewSubscriberEmail = ({
  email = 'john@example.com',
  tempPassword = 'TempPass123',
  planName = 'Premium Yearly',
  passwordResetUrl = 'https://tomsflightclub.com/auth/set-password?token=xxx',
}: WelcomeNewSubscriberEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tomsflightclub.com';

  return (
    <Html>
      <Head />
      <Preview>Welcome to Tom's Flight Club Premium! Here are your login details.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading as="h1" style={logoText}>
              Tom's Flight Club
            </Heading>
          </Section>

          {/* Welcome Message */}
          <Heading as="h2" style={title}>
            Welcome to Tom's Flight Club Premium! ✈️
          </Heading>

          <Text style={paragraph}>
            Thank you for joining Tom's Flight Club {planName} membership! Your payment has been processed successfully, and we've created your account.
          </Text>

          {/* Account Details */}
          <Section style={accountBox}>
            <Heading as="h3" style={boxTitle}>
              Your Account Details
            </Heading>
            <Text style={credential}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={credential}>
              <strong>Temporary Password:</strong> {tempPassword}
            </Text>
            <Text style={warningText}>
              ⚠️ For security, please set your own password within 48 hours
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button href={passwordResetUrl} style={button}>
              Set Your Password
            </Button>
          </Section>

          {/* What's Next */}
          <Section style={{ marginTop: '40px' }}>
            <Heading as="h3" style={subheading}>
              What happens next?
            </Heading>
            <Text style={paragraph}>
              <strong>1. Set your password:</strong> Click the button above to create your secure password.
            </Text>
            <Text style={paragraph}>
              <strong>2. Set your home city:</strong> Go to your <Link href={`${baseUrl}/account`} style={link}>account settings</Link> to set your departure city for personalized deals.
            </Text>
            <Text style={paragraph}>
              <strong>3. Get daily deals:</strong> You'll receive premium flight deals every day at 7 AM - 3 hours before free members!
            </Text>
          </Section>

          {/* Premium Benefits */}
          <Section style={benefitsBox}>
            <Heading as="h3" style={boxTitle}>
              Your Premium Benefits
            </Heading>
            <Text style={benefitItem}>✅ 9 daily flight deals (vs 1 for free members)</Text>
            <Text style={benefitItem}>✅ Early access at 7 AM (3 hours before others)</Text>
            <Text style={benefitItem}>✅ Exclusive premium-only deals</Text>
            <Text style={benefitItem}>✅ Priority customer support</Text>
            <Text style={benefitItem}>✅ Advanced search filters</Text>
          </Section>

          {/* Support */}
          <Text style={paragraph}>
            Need help? Reply to this email or visit our <Link href={`${baseUrl}/help`} style={link}>help center</Link>.
          </Text>

          <Hr style={divider} />

          {/* Footer */}
          <Text style={footer}>
            Tom's Flight Club - Find ultra-cheap flight deals
          </Text>
          <Text style={footer}>
            <Link href={`${baseUrl}/account`} style={footerLink}>
              Manage Account
            </Link>
            {' · '}
            <Link href={`${baseUrl}/help`} style={footerLink}>
              Get Help
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeNewSubscriberEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 48px',
  backgroundColor: '#5046e5',
  textAlign: 'center' as const,
};

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const title = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '30px 48px 20px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 48px 16px',
};

const accountBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px 48px',
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '30px 48px',
  border: '1px solid #86efac',
};

const boxTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const credential = {
  color: '#525252',
  fontSize: '16px',
  margin: '8px 0',
};

const warningText = {
  color: '#dc2626',
  fontSize: '14px',
  margin: '16px 0 0',
  fontWeight: 'bold',
};

const benefitItem = {
  color: '#16a34a',
  fontSize: '15px',
  margin: '8px 0',
};

const subheading = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 48px 16px',
};

const button = {
  backgroundColor: '#5046e5',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 40px',
};

const link = {
  color: '#5046e5',
  textDecoration: 'underline',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '40px 48px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  margin: '0 48px 8px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};