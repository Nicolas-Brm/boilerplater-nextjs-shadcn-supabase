import { NextResponse } from 'next/server'
import { needsOnboarding } from '@/features/admin/actions/onboarding'

export async function GET() {
  try {
    const result = await needsOnboarding()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de la vérification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      needsOnboarding: result.data?.needsOnboarding || false
    })
  } catch (error) {
    console.error('Erreur dans l\'API onboarding status:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 