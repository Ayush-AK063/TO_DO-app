'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Plus, Shield } from 'lucide-react'
import TodoList from './TodoList'
import AddTodoDialog from './AddTodoDialog'
import { toast } from 'sonner'

export default function DashboardClient({ user, profile, initialTodos }) {
  const [todos, setTodos] = useState(initialTodos)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTodos((prev) =>
              prev.map((todo) => (todo.id === payload.new.id ? payload.new : todo))
            )
          } else if (payload.eventType === 'DELETE') {
            setTodos((prev) => prev.filter((todo) => todo.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const handleAddTodo = async (title, description, dueDate) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          title,
          description,
          due_date: dueDate,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Manually update the state to show the new todo immediately
      setTodos((prev) => [data, ...prev])

      toast.success('Todo added successfully!')
      setIsAddDialogOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdateTodo = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Manually update the state to show changes immediately
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
      )

      toast.success('Todo updated successfully!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteTodo = async (id) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)

      if (error) throw error

      // Manually update the state to remove the deleted todo immediately
      setTodos((prev) => prev.filter((todo) => todo.id !== id))

      toast.success('Todo deleted successfully!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleToggleTodo = async (id, completed) => {
    await handleUpdateTodo(id, { completed: !completed })
  }

  // Filter todos
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysTodos = todos.filter((todo) => {
    if (!todo.due_date) return false
    const dueDate = new Date(todo.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  })

  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Todo App
          </h1>
          <div className="flex items-center gap-4">
            {profile?.is_admin && (
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {getInitials(user.user_metadata?.full_name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              My Todos
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Manage your tasks efficiently
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Todo
          </Button>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="today">
              Today&apos;s Todos ({todaysTodos.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTodos.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTodos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <TodoList
              todos={todaysTodos}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              emptyMessage="No todos scheduled for today"
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <TodoList
              todos={completedTodos}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              emptyMessage="No completed todos yet"
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <TodoList
              todos={pendingTodos}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
              emptyMessage="No pending todos"
            />
          </TabsContent>
        </Tabs>
      </main>

      <AddTodoDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddTodo}
      />
    </div>
  )
}
