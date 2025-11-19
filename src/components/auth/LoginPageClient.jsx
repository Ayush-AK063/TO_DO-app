'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPageClient() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('blocked') === 'true') {
      toast.error('You have been banned by an admin. Please contact support.')
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in to manage your todos
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
