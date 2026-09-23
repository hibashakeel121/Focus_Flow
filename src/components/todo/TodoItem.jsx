import Button from '../common/Button';

export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 accent-blue-600 cursor-pointer"
        />
        <span className={todo.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}>
          {todo.text}
        </span>
      </div>
      <Button variant="danger" onClick={() => onDelete(todo.id)} className="px-2 py-1 text-xs">
        Delete
      </Button>
    </div>
  );
}