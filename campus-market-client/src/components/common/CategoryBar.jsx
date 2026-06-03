import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';

export default function CategoryBar({ activeCategory, onSelect }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleClick = (value) => {
    if (onSelect) {
      onSelect(value);
    } else {
      const params = new URLSearchParams(searchParams);
      params.set('category', value);
      navigate('/search?' + params.toString());
    }
  };

  const allCategories = [{ label: 'All', emoji: '🌟', value: '' }, ...CATEGORIES];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {allCategories.map((cat) => {
        const isActive = activeCategory === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => handleClick(cat.value)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
