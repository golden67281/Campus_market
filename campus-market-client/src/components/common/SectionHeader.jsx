export default function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <h2 className="text-base font-semibold text-gray-600 whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
