import Spinner from './Spinner';

const VARIANTS = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  ghost:     'bg-transparent text-gray-600 border border-transparent hover:bg-gray-100',
  danger:    'bg-red-500 text-white hover:bg-red-600 border border-transparent',
};

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${className}`}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}
