import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface Deal {
  id: string;
  deal_number?: number;
  from_airport_city: string;
  to_airport_city: string;
  price: string;
  currency: string;
  trip_duration: number;
  departure_date: string;
  return_date: string;
  destination_city_image?: string;
  deal_found_date: string;
  is_premium?: boolean;
  airline?: string;
  from_airport_code: string;
  to_airport_code: string;
  to_airport_country: string;
}

interface DealDigestFreeEmailProps {
  edition: string;
  freeDealsList: Deal[];
  premiumDealsList: Deal[];
  unsubscribeUrl: string;
  cityName?: string;
}

export const DealDigestFreeEmail = ({
  edition = 'January 1, 2025',
  freeDealsList = [],
  premiumDealsList = [],
  unsubscribeUrl = 'https://tomsflightclub.com/unsubscribe',
  cityName = 'your city',
}: DealDigestFreeEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tomsflightclub.com';

  return (
    <Html>
      <Head />
      <Preview>Today's best flight deals - {edition}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading as="h1" style={logoText}>
              Tom's Flight Club
            </Heading>
          </Section>

          {/* Edition Date */}
          <Text style={editionText}>Edition: {edition} - Flights from {cityName}</Text>

          {/* Free Deals Section */}
          <Section>
            {freeDealsList.map((deal) => (
              <Section key={deal.id} style={dealCard}>
                <Row>
                  <td width="40%" style={{ padding: 0, verticalAlign: 'top', height: '150px', maxHeight: '150px', overflow: 'hidden' }}>
                    <Img
                      src={deal.destination_city_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'}
                      width="200"
                      height="150"
                      alt={deal.to_airport_city}
                      style={dealImage}
                    />
                  </td>
                  <td width="60%" style={dealContent}>
                    <Heading as="h3" style={dealTitle}>
                      {deal.from_airport_city} to {deal.to_airport_city}
                    </Heading>
                    <Text style={dealDetails}>
                      📅 {deal.trip_duration} Day Return Trip
                    </Text>
                    <Text style={dealDetails}>
                      ✈️ {new Date(deal.departure_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '60px', marginTop: '8px' }}>
                      <Text style={dealPrice}>
                        {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : '€'}
                        {Math.floor(parseFloat(deal.price) / 100)}
                      </Text>
                      <Button
                        href={`${baseUrl}/deal/${deal.from_airport_code.toLowerCase()}-${deal.to_airport_code.toLowerCase()}-${new Date(deal.deal_found_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '')}-${deal.deal_number || deal.id}`}
                        style={getDealButton}
                      >
                        Get Deal
                      </Button>
                    </div>
                  </td>
                </Row>
              </Section>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Members Only Section */}
          <Section>
            <Heading as="h2" style={sectionTitle}>Members Only Deals</Heading>
            {premiumDealsList.map((deal) => (
              <Section key={deal.id} style={dealCard}>
                <Row>
                  <td width="40%" style={{ padding: 0, verticalAlign: 'top', height: '150px', maxHeight: '150px', overflow: 'hidden' }}>
                    <Img
                      src={deal.destination_city_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'}
                      width="200"
                      height="150"
                      alt={deal.to_airport_city}
                      style={dealImage}
                    />
                  </td>
                  <td width="60%" style={dealContent}>
                    <Heading as="h3" style={dealTitle}>
                      {deal.from_airport_city} to {deal.to_airport_city}
                    </Heading>
                    <Text style={dealDetails}>
                      📅 {deal.trip_duration} Day Return Trip
                    </Text>
                    <Text style={dealDetails}>
                      ✈️ {new Date(deal.departure_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '60px', marginTop: '8px' }}>
                      <Text style={dealPrice}>
                        {deal.currency === 'USD' ? '$' : deal.currency === 'GBP' ? '£' : '€'}
                        {Math.floor(parseFloat(deal.price) / 100)}
                      </Text>
                      <Button
                        href={`${baseUrl}/join`}
                        style={becomeMemberButton}
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  </td>
                </Row>
              </Section>
            ))}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={emailFrequencyText}>
              Receiving too many emails?{' '}
              <Link href={`${baseUrl}/account`} style={unsubscribeLink}>
                Change your frequency
              </Link>
            </Text>
            <Text style={unsubscribe}>
              To unsubscribe from Tom's Flight Club{' '}
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                click here
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#5856D6',
  borderRadius: '8px 8px 0 0',
  padding: '20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const logoText = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#ffffff',
  textAlign: 'center' as const,
  margin: '0',
};

const editionText = {
  fontSize: '14px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const sectionTitle = {
  fontSize: '20px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '32px 0 16px',
};

const dealCard = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  marginBottom: '16px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden' as const,
};

const dealImage = {
  borderRadius: '4px 0 0 4px',
  objectFit: 'cover' as const,
  width: '100%',
  height: '150px',
  display: 'block',
  maxHeight: '150px',
};

const dealContent = {
  padding: '12px 16px 12px 12px',
};

const dealTitle = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const dealDetails = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '2px 0',
};

const dealPrice = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#5856D6',
  margin: '0',
};

const getDealButton = {
  backgroundColor: '#5856D6',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '8px 20px',
  display: 'inline-block',
  marginLeft: '20px',
};

const becomeMemberButton = {
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  color: '#5856D6',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '6px 16px',
  border: '2px solid #5856D6',
  display: 'inline-block',
  flexShrink: 0,
  marginLeft: '20px',
};


const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  marginTop: '32px',
};

const emailFrequencyText = {
  fontSize: '13px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const unsubscribe = {
  fontSize: '12px',
  color: '#6b7280',
  textAlign: 'center' as const,
  margin: '0',
};

const unsubscribeLink = {
  color: '#5856D6',
  textDecoration: 'underline',
};

export default DealDigestFreeEmail;