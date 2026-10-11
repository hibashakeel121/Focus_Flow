import { useState } from 'react';

export default function WordCounter() {
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text here..."
        className="w-full h-32 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none"
      />
      <div className="flex gap-4 text-sm font-medium">
        <div>Words: <span className="font-bold">{words}</span></div>
        <div>Characters: <span className="font-bold">{chars}</span></div>
      </div>
    </div>
  );
}