import { useRef } from 'react';

export default function OTPInput({ value, onChange, length = 6 }) {
  const refs = useRef([]);

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/, '');
    const arr = value.split('');
    arr[i] = val;
    onChange(arr.join(''));
    if (val && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
        />
      ))}
    </div>
  );
}
