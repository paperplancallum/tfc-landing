import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PaymentSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // User is logged in, redirect to deals
    redirect('/deals')
  } else {
    // User needs to create an account
    redirect('/auth/signup?payment=success')
  }
}