'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Calendar } from 'lucide-react'
import EditTodoDialog from './EditTodoDialog'

export default function TodoList({ todos, onToggle, onUpdate, onDelete, emptyMessage }) {
  const [editingTodo, setEditingTodo] = useState(null)

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isOverdue = (dateString) => {
    if (!dateString) return false
    const dueDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  return (
    <>
      <div className="grid gap-4">
        {todos.map((todo) => (
          <Card key={todo.id} className={todo.completed ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => onToggle(todo.id, todo.completed)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <CardTitle
                      className={`text-lg ${
                        todo.completed ? 'line-through text-zinc-500' : ''
                      }`}
                    >
                      {todo.title}
                    </CardTitle>
                    {todo.description && (
                      <CardDescription className="mt-1">
                        {todo.description}
                      </CardDescription>
                    )}
                    {todo.due_date && (
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-3 w-3 text-zinc-500" />
                        <span
                          className={`text-sm ${
                            isOverdue(todo.due_date) && !todo.completed
                              ? 'text-red-600 font-medium'
                              : 'text-zinc-500'
                          }`}
                        >
                          {formatDate(todo.due_date)}
                        </span>
                        {isOverdue(todo.due_date) && !todo.completed && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTodo(todo)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this todo?')) {
                        onDelete(todo.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {editingTodo && (
        <EditTodoDialog
          todo={editingTodo}
          open={!!editingTodo}
          onOpenChange={(open) => !open && setEditingTodo(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
