import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    
    // Get the current user (admin)
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', currentUser.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get userId from request body
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user from Supabase Auth (this will cascade delete profile and todos due to foreign key constraints)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully from authentication system' 
    })

  } catch (error) {
    console.error('Error in delete user API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
