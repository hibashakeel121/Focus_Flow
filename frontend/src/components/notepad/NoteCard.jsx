import Button from '../common/Button';

export default function NoteCard({ note, onDelete }) {
  return (
    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-gray-700 border border-yellow-200 dark:border-gray-600 shadow-sm flex flex-col justify-between">
      <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap mb-4">{note.text}</p>
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{note.date}</span>
        <Button variant="danger" onClick={() => onDelete(note.id)} className="px-2 py-0.5 text-xs">
          Delete
        </Button>
      </div>
    </div>
  );
}