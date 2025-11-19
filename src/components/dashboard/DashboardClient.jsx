'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                TodoApp
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your productivity companion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile?.is_admin && (
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Button>
            )}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  {getInitials(user.user_metadata?.full_name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut}
              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
            My Todos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">
            Manage your tasks efficiently and stay organized
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Tasks</p>
                  <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-50 mt-2">{todos.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Today&apos;s Tasks</p>
                  <h3 className="text-3xl font-bold text-purple-900 dark:text-purple-50 mt-2">{todaysTodos.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                  <h3 className="text-3xl font-bold text-green-900 dark:text-green-50 mt-2">{completedTodos.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending</p>
                  <h3 className="text-3xl font-bold text-orange-900 dark:text-orange-50 mt-2">{pendingTodos.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Todo Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Your Tasks
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Organize your work and life, finally.
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="gap-2 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg h-11 px-6"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
          </Button>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3 bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-md">
            <TabsTrigger value="today" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg">
              <span className="hidden sm:inline">Today&apos;s Todos</span>
              <span className="sm:hidden">Today</span>
              <span className="ml-1.5">({todaysTodos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg">
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
              <span className="ml-1.5">({completedTodos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg">
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">Todo</span>
              <span className="ml-1.5">({pendingTodos.length})</span>
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
