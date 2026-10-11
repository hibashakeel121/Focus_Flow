import { useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useTimer } from "../context/TimerContext";

export default function HabitPage() {
  const { habits, addHabit, toggleHabit, deleteHabit } = useTimer();
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addHabit(text);
    setText("");
  };

  return (
    <Card title="Habit & Streak Tracker">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New habit (e.g., Read 20 pages)..."
          className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none"
        />
        <Button type="submit" variant="primary">
          Add Habit
        </Button>
      </form>

      {habits.length === 0 ? (
        <p className="text-center text-gray-500 my-4">No habits added yet. Start a new streak!</p>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    habit.completedToday
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-400"
                  }`}
                >
                  {habit.completedToday && "✓"}
                </button>
                <span className={habit.completedToday ? "line-through text-gray-400" : ""}>
                  {habit.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded-full dark:bg-amber-900/40 dark:text-amber-300">
                  🔥 {habit.streak} day streak
                </span>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}