// components/ui/ErrorState.jsx
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', description = 'Failed to load. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">❌</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {onRetry && <Button onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
