import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">
            About Tom&apos;s Flight Club
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            We're on a mission to make travel more accessible by finding the best flight deals for our members
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p>
              Tom&apos;s Flight Club was founded in 2015 by Tom, a travel enthusiast who discovered a knack for finding incredible flight deals. What started as sharing deals with friends quickly grew into a community of thousands of travelers saving money on their adventures.
            </p>
            <p>
              Today, we serve over 100,000 members worldwide, helping them explore the world without breaking the bank. Our team of travel experts works around the clock to find and verify the best flight deals, typically 50-75% off regular prices.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Quality Over Quantity</h3>
              <p className="text-gray-600">
                We hand-pick only the best deals, ensuring every alert we send is worth your time.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="font-semibold mb-2">Trust & Transparency</h3>
              <p className="text-gray-600">
                We verify every deal and provide honest information about availability and restrictions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="font-semibold mb-2">Travel for Everyone</h3>
              <p className="text-gray-600">
                We believe everyone deserves to explore the world, regardless of their budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who are exploring the world for less with Tom&apos;s Flight Club
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/join">
              <Button size="lg">Join For Free</Button>
            </Link>
            <Link href="/deals">
              <Button size="lg" variant="outline">Browse Deals</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}