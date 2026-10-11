import { useState } from 'react';

export default function Calculator() {
  const [input, setInput] = useState('');

  const handleBtn = (val) => setInput((prev) => prev + val);
  const clear = () => setInput('');
  const calculate = () => {
    try {
      setInput(Function(`'use strict'; return (${input})`)().toString());
    } catch {
      setInput('Error');
    }
  };

  return (
    <div className="max-w-xs mx-auto space-y-3">
      <input
        type="text"
        readOnly
        value={input}
        className="w-full p-2 text-right text-xl border rounded dark:bg-gray-800 dark:border-gray-700"
      />
      <div className="grid grid-cols-4 gap-2">
        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((btn) => (
          <button
            key={btn}
            onClick={() => (btn === '=' ? calculate() : handleBtn(btn))}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded font-semibold"
          >
            {btn}
          </button>
        ))}
        <button onClick={clear} className="col-span-4 p-2 bg-rose-500 text-white rounded font-semibold">
          Clear
        </button>
      </div>
    </div>
  );
}