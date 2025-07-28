'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How does Tom\'s Flight Club work?',
    answer: 'We search for the best flight deals and send them to our members via email. Premium members get 9 deals daily at 7 AM, while free members get 3 deals at 10 AM.'
  },
  {
    question: 'Can I cancel my premium membership anytime?',
    answer: 'Yes, you can cancel your premium membership at any time from your account settings. Your access will continue until the end of your current billing period.'
  },
  {
    question: 'What\'s the difference between free and premium membership?',
    answer: 'Premium members get 9 daily deals (vs 3 for free), receive deals 3 hours earlier at 7 AM, and get access to exclusive premium-only deals that are more likely to still be available.'
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Yes, we offer a 14-day money-back guarantee. If you\'re not satisfied within the first 14 days, contact us for a full refund.'
  },
  {
    question: 'How are the deals selected?',
    answer: 'Our team of travel experts manually curates deals based on exceptional value, typically 50-75% off regular prices. We focus on quality over quantity.'
  }
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="font-medium">{faq.question}</span>
            <ChevronDown
              className={`transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              size={20}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}