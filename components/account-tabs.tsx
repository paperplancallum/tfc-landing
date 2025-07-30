'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { ProfileForm } from '@/components/profile-form'
import { MembershipPanel } from '@/components/membership-panel'

interface AccountTabsProps {
  user: User
  profile: any
  subscription: any
  homeCity: any
  isAdmin?: boolean
}

export function AccountTabs({ user, profile, subscription, homeCity, isAdmin = false }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'membership', label: 'Membership' },
  ]

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'profile' && (
          <ProfileForm user={user} profile={profile} homeCity={homeCity} isAdmin={isAdmin} />
        )}
        {activeTab === 'membership' && (
          <MembershipPanel profile={profile} subscription={subscription} />
        )}
      </div>
    </div>
  )
}