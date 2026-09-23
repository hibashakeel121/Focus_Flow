import Button from '../common/Button';

export default function HabitItem({ habit, onToggleToday, onDelete }) {
  return (
    <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleToday(habit.id)}
          className={`px-3 py-1 rounded-lg font-bold transition-all ${
            habit.completedToday
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {habit.completedToday ? '✓ Done' : 'Mark Done'}
        </button>
        <div>
          <p className="font-medium">{habit.name}</p>
          <p className="text-xs text-gray-500">🔥 {habit.streak} day streak</p>
        </div>
      </div>
      <Button variant="danger" onClick={() => onDelete(habit.id)} className="px-2 py-1 text-xs">
        Delete
      </Button>
    </div>
  );
}