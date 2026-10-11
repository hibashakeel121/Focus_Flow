export default function FilterButtons({ current, onChange }) {
  const filters = ['all', 'active', 'completed'];

  return (
    <div className="flex justify-center gap-2 my-4">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
            current === filter
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
