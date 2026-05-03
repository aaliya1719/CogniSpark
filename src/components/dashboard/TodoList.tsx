"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, ListTodo, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", title: "Review Thermodynamics Notes", completed: false },
    { id: "2", title: "C++ Lab Assignment", completed: true },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTodo,
      completed: false,
    };
    setTodos([todo, ...todos]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <Card className="flex-1 border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          Study Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Add a task..." 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            className="bg-background/50"
          />
          <Button size="icon" onClick={addTodo}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
          {todos.map((todo) => (
            <div 
              key={todo.id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg border bg-background/30 transition-all",
                todo.completed && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <button onClick={() => toggleTodo(todo.id)}>
                  {todo.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <span className={cn("text-sm font-medium", todo.completed && "line-through")}>
                  {todo.title}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground italic">
              No tasks for now. Add one above!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
