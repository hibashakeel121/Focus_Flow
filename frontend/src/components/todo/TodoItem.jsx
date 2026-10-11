import Button from '../common/Button';

export default function TodoItem({ todo, onToggle, onDelete, disabled, deleting }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
      <label className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, !todo.completed)}
          disabled={disabled}
          aria-label={`Mark ${todo.title} as ${todo.completed ? 'active' : 'completed'}`}
          className="h-5 w-5 shrink-0 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
        />
        <span className={`min-w-0 break-words ${todo.completed ? 'line-through opacity-50' : ''}`}>{todo.title}</span>
      </label>
      <Button type="button" variant="danger" onClick={() => onDelete(todo.id)} disabled={disabled} aria-label={`Delete ${todo.title}`} className="shrink-0 px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed">
        {deleting ? 'Deleting...' : 'Delete'}
      </Button>
    </li>
  );
}
