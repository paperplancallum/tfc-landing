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

interface WinBackCampaignEmailProps {
  userName?: string;
  daysSinceExpiration: number;
  discountPercentage: number;
  discountCode: string;
  expiresIn: string;
  reactivateUrl: string;
  specialMessage?: string;
}

export const WinBackCampaignEmail = ({
  userName = 'there',
  daysSinceExpiration = 7,
  discountPercentage = 25,
  discountCode = 'COMEBACK25',
  expiresIn = '7 days',
  reactivateUrl = 'https://tomsflightclub.com/join?code=COMEBACK25',
  specialMessage,
}: WinBackCampaignEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tomsflightclub.com';

  // Different messages based on days since expiration
  const getSubjectLine = () => {
    if (daysSinceExpiration === 3) return "We miss you! Here's 20% off";
    if (daysSinceExpiration === 7) return "Special offer just for you - 25% off";
    if (daysSinceExpiration === 14) return "Last chance! 30% off premium membership";
    if (daysSinceExpiration === 30) return "Final offer: 30% off + bonus month";
    return "Come back to Tom's Flight Club";
  };

  const getEmoji = () => {
    if (daysSinceExpiration === 3) return '💔';
    if (daysSinceExpiration === 7) return '🎁';
    if (daysSinceExpiration === 14) return '⏰';
    if (daysSinceExpiration === 30) return '🚨';
    return '✈️';
  };

  return (
    <Html>
      <Head />
      <Preview>{getSubjectLine()}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading as="h1" style={logoText}>
              Tom's Flight Club
            </Heading>
          </Section>

          {/* Discount Badge */}
          <Section style={{ textAlign: 'center', marginTop: '-30px' }}>
            <div style={discountBadge}>
              <Text style={discountText}>{discountPercentage}% OFF</Text>
            </div>
          </Section>

          {/* Main Message */}
          <Heading as="h2" style={title}>
            {getSubjectLine()} {getEmoji()}
          </Heading>

          <Text style={paragraph}>
            Hi {userName},
          </Text>

          {daysSinceExpiration === 3 && (
            <Text style={paragraph}>
              It's been 3 days since your premium membership expired, and we already miss having you as part of our premium community! 
              The best flight deals are passing you by - let us help you save on your next adventure.
            </Text>
          )}

          {daysSinceExpiration === 7 && (
            <Text style={paragraph}>
              We noticed you haven't reactivated your premium membership yet. 
              You're missing out on incredible flight deals - just yesterday, our premium members saved over £400 on flights to Tokyo!
            </Text>
          )}

          {daysSinceExpiration === 14 && (
            <Text style={paragraph}>
              Two weeks without premium deals? That's a lot of missed savings! 
              This is your last chance to get our best discount. Don't let this offer fly away!
            </Text>
          )}

          {daysSinceExpiration === 30 && (
            <Text style={paragraph}>
              This is it - our final and BEST offer for you. We really want you back, so we're including a bonus month FREE 
              on top of our biggest discount. This offer will never be repeated!
            </Text>
          )}

          {specialMessage && (
            <Text style={paragraph}>
              <em>{specialMessage}</em>
            </Text>
          )}

          {/* Offer Box */}
          <Section style={offerBox}>
            <Heading as="h3" style={offerTitle}>
              Your Exclusive Offer:
            </Heading>
            <Text style={offerDetail}>
              <strong>{discountPercentage}% OFF</strong> any premium plan
              {daysSinceExpiration === 30 && ' + 1 MONTH FREE'}
            </Text>
            <Text style={codeText}>
              Use code: <span style={codeHighlight}>{discountCode}</span>
            </Text>
            <Text style={expiryText}>
              ⏰ Expires in {expiresIn}
            </Text>
          </Section>

          {/* Recent Deals Missed */}
          <Section style={missedDealsBox}>
            <Heading as="h3" style={boxTitle}>
              Recent Deals You Missed:
            </Heading>
            <Text style={dealItem}>• London → Tokyo: <strong>£389</strong> (saved £611)</Text>
            <Text style={dealItem}>• Manchester → New York: <strong>£199</strong> (saved £401)</Text>
            <Text style={dealItem}>• Edinburgh → Barcelona: <strong>£39</strong> (saved £161)</Text>
            <Text style={dealsSummary}>
              Premium members saved an average of <strong>£387 per flight</strong> last week!
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button href={reactivateUrl} style={button}>
              Claim Your {discountPercentage}% Discount
            </Button>
          </Section>

          {/* Benefits Reminder */}
          <Text style={reminderTitle}>
            Remember what you're missing:
          </Text>
          <Text style={benefitsList}>
            ✈️ 9 daily deals (vs just 1) • 🌅 7 AM access (3 hours early) • 💎 Premium-only deals • 🎯 Priority support
          </Text>

          <Hr style={divider} />

          {/* Footer */}
          <Text style={footer}>
            This exclusive offer is only available to previous premium members and cannot be combined with other offers.
          </Text>
          <Text style={footerSmall}>
            <Link href={`${baseUrl}/unsubscribe?type=winback`} style={footerLink}>
              Don't want these offers?
            </Link>
            {' | '}
            <Link href={`${baseUrl}/help`} style={footerLink}>
              Need help?
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WinBackCampaignEmail;

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

const discountBadge = {
  display: 'inline-block',
  backgroundColor: '#dc2626',
  borderRadius: '50%',
  width: '100px',
  height: '100px',
  textAlign: 'center' as const,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const discountText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  lineHeight: '100px',
  margin: '0',
};

const title = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '20px 48px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 48px 16px',
};

const offerBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px 48px',
  border: '2px dashed #f59e0b',
  textAlign: 'center' as const,
};

const offerTitle = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const offerDetail = {
  color: '#92400e',
  fontSize: '24px',
  margin: '8px 0',
};

const codeText = {
  color: '#525252',
  fontSize: '16px',
  margin: '12px 0',
};

const codeHighlight = {
  backgroundColor: '#fff',
  padding: '4px 12px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#dc2626',
};

const expiryText = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '12px 0 0',
};

const missedDealsBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '24px',
  margin: '30px 48px',
};

const boxTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const dealItem = {
  color: '#525252',
  fontSize: '15px',
  margin: '8px 0',
};

const dealsSummary = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '16px 0 0',
  paddingTop: '12px',
  borderTop: '1px solid #e5e7eb',
};

const reminderTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '40px 48px 12px',
  textAlign: 'center' as const,
};

const benefitsList = {
  color: '#525252',
  fontSize: '15px',
  margin: '0 48px 20px',
  textAlign: 'center' as const,
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 50px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '40px 48px',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 48px 8px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
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