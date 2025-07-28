'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'London, UK',
    text: 'Tom\'s Flight Club has saved me thousands on flights. The premium membership pays for itself with just one trip!',
  },
  {
    name: 'Mike Chen',
    location: 'New York, USA',
    text: 'I love getting the deals early at 7 AM. By the time free users see them, I\'ve already booked my vacation!',
  },
  {
    name: 'Emma Williams',
    location: 'Sydney, Australia',
    text: 'The quality of deals is incredible. I\'ve visited 15 countries in the last year thanks to Tom\'s Flight Club.',
  },
  {
    name: 'Carlos Rodriguez',
    location: 'Barcelona, Spain',
    text: 'Best investment for any traveler. The deals are genuine and the savings are real.',
  }
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <p className="text-lg mb-6 italic">
          "{testimonials[currentIndex].text}"
        </p>
        <div>
          <p className="font-semibold">{testimonials[currentIndex].name}</p>
          <p className="text-gray-600">{testimonials[currentIndex].location}</p>
        </div>
      </div>
      
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
      >
        <ChevronRight size={24} />
      </button>
      
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}