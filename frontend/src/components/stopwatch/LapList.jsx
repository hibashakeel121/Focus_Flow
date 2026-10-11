export default function LapList({ laps }) {
  if (laps.length === 0) return null;

  return (
    <div className="mt-4 max-h-40 overflow-y-auto border-t dark:border-gray-700 pt-3">
      <h3 className="text-sm font-semibold text-gray-500 mb-2">Laps</h3>
      <div className="space-y-1">
        {laps.map((lap, idx) => (
          <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>Lap {laps.length - idx}</span>
            <span className="font-mono">{lap}</span>
          </div>
        ))}
      </div>
    </div>
  );
}