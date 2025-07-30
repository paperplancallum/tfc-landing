'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function NavigationProgressInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show loading bar immediately when route changes
    const progressBar = document.getElementById('navigation-progress')
    if (progressBar) {
      progressBar.style.width = '0%'
      progressBar.style.display = 'block'
      
      // Animate to 90% quickly
      setTimeout(() => {
        progressBar.style.width = '90%'
      }, 100)
      
      // Complete and hide after a short delay
      setTimeout(() => {
        progressBar.style.width = '100%'
        setTimeout(() => {
          progressBar.style.display = 'none'
        }, 200)
      }, 500)
    }
  }, [pathname, searchParams])

  return (
    <div
      id="navigation-progress"
      className="fixed top-0 left-0 h-1 bg-primary z-[9999] transition-all duration-300 ease-out"
      style={{ width: '0%', display: 'none' }}
    />
  )
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  )
}