import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Create Account
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign up to start managing your todos
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
