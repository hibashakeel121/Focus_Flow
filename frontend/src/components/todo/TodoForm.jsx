import { useState } from 'react';
import Button from '../common/Button';

export default function TodoForm({ onAdd, disabled, adding }) {
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Enter a task title.');
      return;
    }
    if (trimmedTitle.length > 200) {
      setValidationError('Task titles must be 200 characters or fewer.');
      return;
    }
    setValidationError('');
    const saved = await onAdd(trimmedTitle);
    // Keep the draft available if the API could not save it.
    if (saved) setTitle('');
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label htmlFor="task-title" className="mb-2 block text-sm font-medium">Task title</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="task-title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => { setTitle(event.target.value); setValidationError(''); }}
          maxLength={200}
          disabled={disabled}
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'task-title-error' : undefined}
          placeholder="e.g. Finish my science assignment"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <Button type="submit" disabled={disabled} className="bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed">{adding ? 'Adding...' : 'Add Task'}</Button>
      </div>
      {validationError && <p id="task-title-error" role="alert" className="mt-2 text-sm text-red-600">{validationError}</p>}
    </form>
  );
}
