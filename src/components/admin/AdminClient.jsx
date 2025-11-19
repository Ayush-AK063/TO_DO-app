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

  const handleBlockUser = async (userId, isBlocked) => {
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

  const handleToggleAdmin = async (userId, isAdmin) => {
    if (userId === currentUser.id) {
      toast.error('You cannot change your own admin status')
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

  const handleDeleteUser = async (userId, email) => {
    if (userId === currentUser.id) {
      toast.error('You cannot delete your own account')
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View, block, delete users, and manage admin roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(user.full_name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.full_name || 'No name'}
                              </div>
                              {user.id === currentUser.id && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge className="gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_blocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                              disabled={loading === user.id || user.id === currentUser.id}
                              title={user.is_admin ? 'Revoke admin' : 'Grant admin'}
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleBlockUser(user.id, user.is_blocked)}
                              disabled={loading === user.id || user.id === currentUser.id}
                              title={user.is_blocked ? 'Unblock user' : 'Block user'}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={loading === user.id || user.id === currentUser.id}
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
