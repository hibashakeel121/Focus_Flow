export default function TimerInput({ seconds, onChange, disabled }) {
  return (
    <div className="flex justify-center items-center gap-2 my-4">
      <input
        type="number"
        min="1"
        value={seconds}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 0))}
        disabled={disabled}
        className="w-24 text-center text-2xl p-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-900 disabled:opacity-50"
      />
      <span className="text-gray-500 font-medium">seconds</span>
    </div>
  );
}