export default function SafetyBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="text-sm font-medium text-amber-800">Safety Tip</p>
        <p className="text-sm text-amber-700 mt-0.5">
          Always meet in a public place on campus. Never share bank details or pay before inspecting the item.
        </p>
      </div>
    </div>
  );
}
