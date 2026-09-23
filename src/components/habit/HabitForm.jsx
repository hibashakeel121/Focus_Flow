import { useState } from 'react';
import Button from '../common/Button';
import { useTheme } from '../../context/ThemeContext';

export default function HabitForm({ onAdd }) {
  const [name, setName] = useState('');
  const { themeStyles } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New habit (e.g., Read 20 pages)..."
        className={`flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${themeStyles.input}`}
      />
      <Button type="submit">Add Habit</Button>
    </form>
  );
}