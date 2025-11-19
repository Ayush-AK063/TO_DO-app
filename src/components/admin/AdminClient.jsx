'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Shield, Ban, Trash2, UserCog } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminClient({ currentUser, profiles }) {
  const [users, setUsers] = useState(profiles)
  const [loading, setLoading] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  const handleBlockUser = async (userId, isBlocked, isAdmin) => {
    // Prevent blocking other admins
    if (isAdmin) {
      toast.error('Cannot block an admin user.')
      return
    }

    setLoading(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_blocked: !isBlocked } : user
      ))

      toast.success(`User ${!isBlocked ? 'blocked' : 'unblocked'} successfully`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleAdmin = async (userId, isAdmin, isBlocked) => {
    if (userId === currentUser.id) {
      toast.error('You cannot change your own admin status')
      return
    }

    // Prevent revoking admin role from other admins
    if (isAdmin) {
      toast.error('Cannot revoke admin role from another admin')
      return
    }

    // Prevent promoting banned users to admin
    if (!isAdmin && isBlocked) {
      toast.error('Cannot grant admin role to a banned user. Unblock them first.')
      return
    }

    setLoading(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !isAdmin } : user
      ))

      toast.success(`Admin role ${!isAdmin ? 'granted' : 'revoked'} successfully`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteUser = async (userId, email, isAdmin) => {
    if (userId === currentUser.id) {
      toast.error('You cannot delete your own account')
      return
    }

    // Prevent deleting other admins
    if (isAdmin) {
      toast.error('Cannot delete an admin user.')
      return
    }

    if (!confirm(`Are you sure you want to permanently delete user ${email}? This will remove them from authentication and they won't be able to log in again. This action cannot be undone.`)) {
      return
    }

    setLoading(userId)
    try {
      // Call API route to delete user from auth (will cascade delete profile and todos)
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      setUsers(users.filter(user => user.id !== userId))
      toast.success('User permanently deleted from system')
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setLoading(null)
    }
  }

  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Admin Panel
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manage users and permissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                  <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-50 mt-2">{users.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Admins</p>
                  <h3 className="text-3xl font-bold text-purple-900 dark:text-purple-50 mt-2">
                    {users.filter(u => u.is_admin).length}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active</p>
                  <h3 className="text-3xl font-bold text-green-900 dark:text-green-50 mt-2">
                    {users.filter(u => !u.is_blocked).length}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-linear-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Blocked</p>
                  <h3 className="text-3xl font-bold text-red-900 dark:text-red-50 mt-2">
                    {users.filter(u => u.is_blocked).length}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center">
                  <Ban className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 py-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Shield className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              User Management
            </CardTitle>
            <CardDescription className="text-base mt-2">
              View, block, delete users, and manage admin roles. Click on action buttons to manage users.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableHead className="font-semibold py-4 px-6">User</TableHead>
                    <TableHead className="font-semibold py-4 px-6">Email</TableHead>
                    <TableHead className="font-semibold py-4 px-6">Role</TableHead>
                    <TableHead className="font-semibold py-4 px-6">Status</TableHead>
                    <TableHead className="font-semibold py-4 px-6">Joined</TableHead>
                    <TableHead className="text-right font-semibold py-4 px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-zinc-500">
                        <div className="flex flex-col items-center gap-3">
                          <Shield className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                          <p className="text-xl font-medium">No users found</p>
                          <p className="text-sm text-zinc-400">Users will appear here once they sign up</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-zinc-100 dark:border-zinc-800">
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-11 w-11 ring-2 ring-zinc-100 dark:ring-zinc-800">
                              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold text-base">
                                {getInitials(user.full_name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-zinc-50 text-base">
                                {user.full_name || 'No name'}
                              </div>
                              {user.id === currentUser.id && (
                                <Badge variant="outline" className="text-xs mt-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-400 py-5 px-6 font-medium">{user.email}</TableCell>
                        <TableCell className="py-5 px-6">
                          {user.is_admin ? (
                            <Badge className="gap-1.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-3 py-1.5 text-sm">
                              <Shield className="h-3.5 w-3.5" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-5 px-6">
                          {user.is_blocked ? (
                            <Badge variant="destructive" className="gap-1.5 bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 px-3 py-1.5 text-sm">
                              <Ban className="h-3.5 w-3.5" />
                              Blocked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 px-3 py-1.5 text-sm">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-400 py-5 px-6 font-medium">{formatDate(user.created_at)}</TableCell>
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleAdmin(user.id, user.is_admin, user.is_blocked)}
                              disabled={loading === user.id || user.id === currentUser.id}
                              title={user.is_admin ? 'Revoke admin' : 'Grant admin'}
                              className="h-10 w-10 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/50 dark:hover:text-purple-400 transition-all"
                            >
                              <UserCog className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleBlockUser(user.id, user.is_blocked, user.is_admin)}
                              disabled={loading === user.id || user.id === currentUser.id}
                              title={user.is_blocked ? 'Unblock user' : 'Block user'}
                              className="h-10 w-10 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/50 dark:hover:text-orange-400 transition-all"
                            >
                              <Ban className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id, user.email, user.is_admin)}
                              disabled={loading === user.id || user.id === currentUser.id}
                              title="Delete user"
                              className="h-10 w-10 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
