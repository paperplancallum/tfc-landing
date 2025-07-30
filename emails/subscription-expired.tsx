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

interface SubscriptionExpiredEmailProps {
  userName?: string;
  expirationDate: string;
  lastPlanName: string;
  reactivateUrl: string;
}

export const SubscriptionExpiredEmail = ({
  userName = 'there',
  expirationDate = 'January 15, 2025',
  lastPlanName = 'Premium Monthly',
  reactivateUrl = 'https://tomsflightclub.com/join',
}: SubscriptionExpiredEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tomsflightclub.com';

  return (
    <Html>
      <Head />
      <Preview>Your Tom's Flight Club premium membership has expired</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading as="h1" style={logoText}>
              Tom's Flight Club
            </Heading>
          </Section>

          {/* Main Message */}
          <Heading as="h2" style={title}>
            Your Premium Membership Has Expired 😔
          </Heading>

          <Text style={paragraph}>
            Hi {userName},
          </Text>

          <Text style={paragraph}>
            Your Tom's Flight Club {lastPlanName} membership expired on <strong>{expirationDate}</strong>. We're sad to see you go!
          </Text>

          <Text style={paragraph}>
            Your account has been automatically switched to our free plan, which means:
          </Text>

          {/* What Changed */}
          <Section style={comparisonBox}>
            <Heading as="h3" style={boxTitle}>
              What's Changed:
            </Heading>
            <Text style={changeItem}>
              ❌ <strong>Daily deals reduced:</strong> From 9 deals to just 1 deal per day
            </Text>
            <Text style={changeItem}>
              ❌ <strong>Later access:</strong> Deals at 10 AM instead of 7 AM (3 hours later)
            </Text>
            <Text style={changeItem}>
              ❌ <strong>Premium-only deals:</strong> No access to exclusive premium deals
            </Text>
            <Text style={changeItem}>
              ❌ <strong>Basic support:</strong> No more priority customer support
            </Text>
          </Section>

          {/* What You Keep */}
          <Section style={keepBox}>
            <Heading as="h3" style={boxTitle}>
              What You Keep:
            </Heading>
            <Text style={keepItem}>
              ✅ Your account and settings
            </Text>
            <Text style={keepItem}>
              ✅ Access to 1 free deal daily
            </Text>
            <Text style={keepItem}>
              ✅ Your saved preferences
            </Text>
          </Section>

          {/* CTA */}
          <Text style={ctaText}>
            Missing your premium benefits already? We'd love to have you back!
          </Text>

          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button href={reactivateUrl} style={button}>
              Reactivate Premium Membership
            </Button>
          </Section>

          <Text style={centerText}>
            <em>Come back within 7 days and we'll give you 20% off your next subscription!</em>
          </Text>

          {/* Alternative Actions */}
          <Section style={{ marginTop: '40px' }}>
            <Heading as="h3" style={subheading}>
              Other Options:
            </Heading>
            <Text style={paragraph}>
              • <Link href={`${baseUrl}/account`} style={link}>Update your email preferences</Link> to control when you receive deals
            </Text>
            <Text style={paragraph}>
              • <Link href={`${baseUrl}/help`} style={link}>Contact support</Link> if you think this is a mistake
            </Text>
            <Text style={paragraph}>
              • <Link href={`${baseUrl}/join#plans`} style={link}>View all membership plans</Link> to find one that fits your budget
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Text style={footer}>
            We hope to see you back soon! The best flight deals are waiting for you.
          </Text>
          <Text style={footer}>
            Tom's Flight Club - Find ultra-cheap flight deals
          </Text>
          <Text style={footerSmall}>
            <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>
              Unsubscribe from these notifications
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionExpiredEmail;

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

const comparisonBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px 48px',
  border: '1px solid #fecaca',
};

const keepBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px 48px',
  border: '1px solid #86efac',
};

const boxTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const changeItem = {
  color: '#dc2626',
  fontSize: '15px',
  margin: '8px 0',
  lineHeight: '24px',
};

const keepItem = {
  color: '#16a34a',
  fontSize: '15px',
  margin: '8px 0',
  lineHeight: '24px',
};

const ctaText = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '30px 48px 20px',
  textAlign: 'center' as const,
};

const centerText = {
  color: '#525252',
  fontSize: '16px',
  margin: '20px 48px',
  textAlign: 'center' as const,
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
  color: '#525252',
  fontSize: '15px',
  margin: '0 48px 8px',
  textAlign: 'center' as const,
};

const footerSmall = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '16px 48px 8px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};