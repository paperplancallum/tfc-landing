import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms of Service — Tom's Flight Club",
  description:
    "The terms governing use of the Tom's Flight Club website and iOS app, including subscriptions, deal listings, and acceptable use.",
}

const LAST_UPDATED = 'May 10, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-primary text-white py-12">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm opacity-80">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl prose prose-lg">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Tom&apos;s Flight
            Club website at <a href="https://tomsflightclub.com">tomsflightclub.com</a> and the
            Tom&apos;s Flight Club iOS app (together, the &ldquo;Service&rdquo;). By using the
            Service, you agree to these Terms.
          </p>

          <h2>1. The service</h2>
          <p>
            Tom&apos;s Flight Club curates flight deals from third-party airlines and travel sites
            and surfaces them via the website, email digests, and the iOS app. Free members see a
            subset of deals; Premium members see every deal we find, ahead of free members, with
            push alerts for their home airport.
          </p>

          <h2>2. Subscriptions</h2>
          <p>
            We offer 3-month, 6-month, and yearly auto-renewing subscriptions. Pricing is shown at
            the point of purchase.
          </p>
          <ul>
            <li>
              <strong>Web subscriptions</strong> are processed by Stripe. You can manage or cancel
              from your account on the website.
            </li>
            <li>
              <strong>iOS in-app subscriptions</strong> are processed by Apple under their standard
              EULA. Payment is charged to your Apple ID. The subscription auto-renews unless
              cancelled at least 24 hours before the end of the current period. Manage or cancel in
              iOS Settings → Apple ID → Subscriptions.
            </li>
            <li>
              Free trial periods (where offered) convert to a paid subscription unless cancelled at
              least 24 hours before the trial ends.
            </li>
            <li>
              Refunds for iOS subscriptions are handled by Apple. Web refunds are handled at our
              discretion; contact <a href="mailto:hello@tomsflightclub.com">hello@tomsflightclub.com</a>.
            </li>
          </ul>

          <h2>3. Deals are informational</h2>
          <p>
            Deal listings are informational. Prices, availability, and routes are pulled from
            third-party sources and change rapidly. We do not sell flights and do not act as a
            travel agent. Booking, ticketing, baggage, refunds, and cancellation are all handled by
            the airline or booking site you link to. We are not liable for any loss, missed
            booking, or schedule change resulting from a deal listing.
          </p>

          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Resell, redistribute, or republish deal listings without permission;</li>
            <li>Scrape, crawl, or otherwise attempt to access the Service in bulk;</li>
            <li>
              Attempt to circumvent paywalls, share login credentials, or impersonate another user;
            </li>
            <li>Use the Service for unlawful purposes.</li>
          </ul>

          <h2>5. Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account. You may delete
            your account at any time from Account → Delete account in the app or by emailing
            <a href="mailto:hello@tomsflightclub.com"> hello@tomsflightclub.com</a>. We may suspend
            or terminate accounts that violate these Terms.
          </p>

          <h2>6. Privacy</h2>
          <p>
            Your use of the Service is also governed by our
            <a href="/privacy"> Privacy Policy</a>.
          </p>

          <h2>7. Intellectual property</h2>
          <p>
            The Service, our brand, deal curation, and original content are owned by Tom&apos;s
            Flight Club. Third-party content (airline branding, destination images sourced from
            Wikimedia Commons, etc.) belongs to its respective owners.
          </p>

          <h2>8. Disclaimers and liability</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranty of any kind. We are not
            liable for indirect, incidental, or consequential damages. Our aggregate liability is
            limited to the amount you paid us in the 12 months preceding the claim.
          </p>

          <h2>9. Apple-specific terms</h2>
          <p>
            For iOS use: Apple is not responsible for the iOS app or the Service, has no obligation
            to provide support, and is not party to these Terms. Apple is a third-party beneficiary
            of these Terms entitled to enforce them against you. The standard
            <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">
              {' '}
              Apple Licensed Application End User License Agreement
            </a>{' '}
            applies in addition to these Terms.
          </p>

          <h2>10. Changes</h2>
          <p>
            We may update these Terms from time to time. Material changes will be notified by email
            or in-app. Continued use of the Service constitutes acceptance.
          </p>

          <h2>11. Contact</h2>
          <p>
            <a href="mailto:hello@tomsflightclub.com">hello@tomsflightclub.com</a>
          </p>
        </div>
      </section>
    </div>
  )
}
