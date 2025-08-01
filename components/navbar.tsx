'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Globe, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function Navbar({ user }: { user: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userCity, setUserCity] = useState<string | null>(null)
  const [userCityName, setUserCityName] = useState<string | null>(null)
  const [userCityDisplayName, setUserCityDisplayName] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Load user's home city
  useEffect(() => {
    if (user) {
      loadUserCity()
    }
  }, [user])

  async function loadUserCity() {
    const { data: profile } = await supabase
      .from('users')
      .select('home_city_id')
      .eq('id', user.id)
      .single()

    if (profile?.home_city_id) {
      const { data: city } = await supabase
        .from('cities')
        .select('iata_code, name')
        .eq('id', profile.home_city_id)
        .single()
      
      if (city) {
        setUserCity(city.iata_code.toLowerCase())
        setUserCityName(city.name.toLowerCase().replace(/\s+/g, '-'))
        setUserCityDisplayName(city.name)
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="bg-primary shadow-sm">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Tom's Flight Club" width={160} height={40} className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/deals" 
              className={`flex items-center gap-1 text-white hover:text-white/80 ${pathname === '/deals' ? 'font-semibold' : ''}`}
            >
              <Globe size={18} />
              All Deals
            </Link>
            {user && userCityName ? (
              <Link 
                href={`/deals/${userCityName}`} 
                className={`flex items-center gap-1 text-white hover:text-white/80 ${pathname.startsWith(`/deals/${userCityName}`) ? 'font-semibold' : ''}`}
              >
                <MapPin size={18} />
                {userCityDisplayName} Deals
              </Link>
            ) : (
              <Link 
                href="/auth/signup" 
                className="flex items-center gap-1 text-white hover:text-white/80"
              >
                <MapPin size={18} />
                Set Your City
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/account" className="text-white hover:text-white/80">
                  My Account
                </Link>
                <Button variant="ghost" className="text-white hover:text-white/80 hover:bg-white/10" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:text-white/80 hover:bg-white/10">
                    Log In
                  </Button>
                </Link>
                <Link href="/join">
                  <Button className="bg-white text-primary hover:bg-white/90">
                    Join For Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/deals"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white hover:text-white/80 hover:bg-white/10 ${pathname === '/deals' ? 'bg-white/10' : ''}`}
              >
                <Globe size={18} />
                All Deals
              </Link>
              {user && userCityName ? (
                <Link
                  href={`/deals/${userCityName}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white hover:text-white/80 hover:bg-white/10 ${pathname.startsWith(`/deals/${userCityName}`) ? 'bg-white/10' : ''}`}
                >
                  <MapPin size={18} />
                  {userCityDisplayName} Deals
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin size={18} />
                  Set Your City
                </Link>
              )}
              
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-white/80 hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/join"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-white text-primary hover:bg-white/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Join For Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}