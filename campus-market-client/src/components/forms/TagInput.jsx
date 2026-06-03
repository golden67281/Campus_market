import { useState } from 'react';

export default function TagInput({ tags, onChange, max = 10 }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < max) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const remove = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            {tag}
            <button onClick={() => remove(tag)} className="text-indigo-400 hover:text-indigo-700">×</button>
          </span>
        ))}
      </div>
      {tags.length < max && (
        <div className="flex gap-2">
          <input
            className="input text-sm"
            placeholder="Add a tag..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          />
          <button onClick={add} className="btn-secondary text-sm px-3">Add</button>
        </div>
      )}
    </div>
  );
}
