'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'

interface ConditionalNavbarProps {
  user: any
}

export function ConditionalNavbar({ user }: ConditionalNavbarProps) {
  const pathname = usePathname()
  
  // Hide navbar on funnel pages
  if (pathname.startsWith('/funnel')) {
    return null
  }
  
  return <Navbar user={user} />
}