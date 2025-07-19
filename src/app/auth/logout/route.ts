import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Sign out the user
    await supabase.auth.signOut()
    
    // Redirect to landing page
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Error during logout:', error)
    // Even if there's an error, redirect to landing page
    return NextResponse.redirect(new URL('/', request.url))
  }
} 