export default function VerifiedBadge({ size = 'md' }) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      title="Verified Student — College email confirmed"
      className={`inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-indigo-200 ${sizes[size] || sizes.md}`}
    >
      {/* Shield tick SVG */}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 1.5L2.5 3.5V8c0 3.3 2.5 5.7 5.5 6.5C11 13.7 13.5 11.3 13.5 8V3.5L8 1.5Z"
          fill="white"
          fillOpacity="0.25"
          stroke="white"
          strokeWidth="1"
        />
        <path
          d="M5.5 8L7 9.5L10.5 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified Student
    </span>
  );
}
