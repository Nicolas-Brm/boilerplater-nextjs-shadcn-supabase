import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAPI } from '@/features/admin/lib/permissions'
import { Permission } from '@/features/admin/types'
import { z } from 'zod'

// Vérifier que la clé service role est configurée
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY n\'est pas configurée. La création d\'utilisateurs admin ne fonctionnera pas.')
}

// Client Supabase avec service_role
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['user', 'moderator', 'admin', 'super_admin']),
  isActive: z.boolean()
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API] Début de la création d\'utilisateur')
    
    // Vérifier que la service role key est configurée
    if (!supabaseAdmin) {
      console.log('❌ [API] Service role key manquante')
      return NextResponse.json(
        { error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY n\'est pas définie' },
        { status: 500 }
      )
    }

    console.log('✅ [API] Service role key configurée')

    // Vérifier l'authentification et les permissions admin
    console.log('🔍 [API] Vérification des permissions admin...')
    const adminUser = await requireAdminAPI([Permission.CREATE_USERS], request)
    
    console.log('🔍 [API] Résultat requireAdminAPI:', adminUser ? {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive
    } : 'null')
    
    if (!adminUser) {
      console.log('❌ [API] Aucun utilisateur admin trouvé ou permissions insuffisantes')
      return NextResponse.json(
        { error: 'Accès non autorisé. Permissions admin requises.' },
        { status: 403 }
      )
    }

    console.log('✅ [API] Utilisateur admin validé:', adminUser.email, 'Role:', adminUser.role)
    
    const body = await request.json()
    console.log('🔍 [API] Données reçues:', { ...body, password: '[MASQUÉ]' })
    
    const validatedData = CreateUserSchema.parse(body)
    console.log('✅ [API] Données validées')
    
    // Créer l'utilisateur avec le client admin
    console.log('🔍 [API] Création de l\'utilisateur auth...')
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true
    })

    if (authError || !authUser.user) {
      console.log('❌ [API] Erreur création auth:', authError)
      return NextResponse.json(
        { error: `Erreur lors de la création: ${authError?.message}` },
        { status: 400 }
      )
    }

    console.log('✅ [API] Utilisateur auth créé:', authUser.user.id)

    // Créer le profil utilisateur
    console.log('🔍 [API] Création du profil utilisateur...')
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: authUser.user.id,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        role: validatedData.role,
        is_active: validatedData.isActive
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.log('❌ [API] Erreur création profil:', profileError)
      // Supprimer l'utilisateur si le profil échoue
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: `Erreur lors de la création du profil: ${profileError.message}` },
        { status: 400 }
      )
    }

    console.log('✅ [API] Profil utilisateur créé avec succès')

    return NextResponse.json({
      success: true,
      data: { message: 'Utilisateur créé avec succès', userId: authUser.user.id }
    })

  } catch (error) {
    console.error('❌ [API] Erreur API création utilisateur:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 