import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Privacy Policy — Tom's Flight Club",
  description:
    "How Tom's Flight Club collects, uses, and protects the information you provide on the website and in the iOS app.",
}

const LAST_UPDATED = 'May 10, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-primary text-white py-12">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm opacity-80">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl prose prose-lg">
          <p>
            Tom&apos;s Flight Club (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the website
            <a href="https://tomsflightclub.com"> tomsflightclub.com</a> and the &ldquo;Tom&apos;s
            Flight Club&rdquo; iOS app. This Privacy Policy explains what personal data we collect,
            why we collect it, and how we use and protect it.
          </p>

          <h2>1. Data we collect</h2>
          <ul>
            <li>
              <strong>Account information.</strong> Email address, first and last name (optional),
              and home airport (optional) when you create an account.
            </li>
            <li>
              <strong>Payment information.</strong> Subscription status and plan tier. Web payments
              are processed by Stripe; in-app purchases are processed by Apple. We do not store full
              card numbers.
            </li>
            <li>
              <strong>Usage data.</strong> Pages visited, deals viewed, and basic device metadata
              (model, OS version, app version) to help us improve the product.
            </li>
            <li>
              <strong>Push tokens.</strong> If you opt in to notifications in the iOS app, we store
              the Expo / Apple push token to deliver new-deal alerts. You can revoke this at any
              time from iOS Settings.
            </li>
            <li>
              <strong>Crash and error reports.</strong> If you opt in to error reporting, anonymised
              stack traces are sent to Sentry.
            </li>
          </ul>

          <h2>2. How we use your data</h2>
          <ul>
            <li>To provide the service: deliver flight deals via email and push.</li>
            <li>To process and manage subscriptions through Stripe and Apple.</li>
            <li>To respond to support requests.</li>
            <li>To improve the product through aggregated, non-identifying analytics.</li>
          </ul>
          <p>We do not sell your personal data. We do not share it with advertisers.</p>

          <h2>3. Third parties</h2>
          <ul>
            <li>
              <strong>Supabase</strong> — database and authentication.
            </li>
            <li>
              <strong>Stripe</strong> — web subscription payments.
            </li>
            <li>
              <strong>Apple In-App Purchase</strong> — iOS app subscription payments via RevenueCat.
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery.
            </li>
            <li>
              <strong>Expo Push Service</strong> — iOS push notification delivery.
            </li>
            <li>
              <strong>Sentry</strong> — optional error reporting.
            </li>
          </ul>
          <p>
            Each third party has its own privacy policy. We share with them only what is necessary
            to deliver the service.
          </p>

          <h2>4. Data retention</h2>
          <p>
            Account data is retained while your account is active. When you delete your account
            (Account → Delete account, in the app, or by emailing
            <a href="mailto:hello@tomsflightclub.com"> hello@tomsflightclub.com</a>), we
            permanently remove your authentication record, anonymise your user row, cancel any
            active subscription, and delete your push devices and email preferences within 30 days.
          </p>

          <h2>5. Your rights</h2>
          <p>
            You may access, correct, or delete the data we hold about you. You can exercise these
            rights from the app (Account → Profile / Notifications / Delete account) or by
            contacting <a href="mailto:hello@tomsflightclub.com">hello@tomsflightclub.com</a>. UK
            and EU residents have the additional rights granted under UK GDPR / GDPR.
          </p>

          <h2>6. Children</h2>
          <p>
            Our service is not directed at children under 13, and we do not knowingly collect data
            from them.
          </p>

          <h2>7. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be notified by email
            or in-app. The &ldquo;Last updated&rdquo; date at the top reflects the latest revision.
          </p>

          <h2>8. Contact</h2>
          <p>
            Questions or requests about your data:
            <a href="mailto:hello@tomsflightclub.com"> hello@tomsflightclub.com</a>.
          </p>
        </div>
      </section>
    </div>
  )
}
