export default function StepProgressBar({ currentStep, totalSteps, labels }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
            ${i + 1 <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {i + 1}
          </div>
          {labels && <span className="text-xs text-gray-500 hidden sm:block">{labels[i]}</span>}
          {i < totalSteps - 1 && (
            <div className={`flex-1 h-1 rounded ${i + 1 < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
