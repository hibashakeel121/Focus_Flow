import { useState } from "react";
import Card from "../components/common/Card";
import TodoForm from "../components/todo/TodoForm";
import TodoItem from "../components/todo/TodoItem";
import { useTimer } from "../context/TimerContext";

export default function TodoPage() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTimer();
  const [filter, setFilter] = useState("all");

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <Card title="To-Do List">
      <TodoForm onAdd={addTodo} />

      <div className="flex justify-center gap-2 my-4">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2 mt-4">
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </div>
    </Card>
  );
}