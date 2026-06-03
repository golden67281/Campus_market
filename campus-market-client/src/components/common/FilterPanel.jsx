import { X } from 'lucide-react';
import { CATEGORIES, CONDITIONS, SORT_OPTIONS } from '../../utils/constants';
import Button from '../ui/Button';

export default function FilterPanel({ filters, onChange, onApply, onReset }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <p className="label mb-3">Category</p>
        <div className="space-y-2">
          {[{ label: 'All', value: '' }, ...CATEGORIES].map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={c.value}
                checked={filters.category === c.value}
                onChange={() => update('category', c.value)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {c.emoji} {c.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="label mb-3">Condition</p>
        <div className="space-y-2">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.conditions?.includes(c) || false}
                onChange={(e) => {
                  const curr = filters.conditions || [];
                  update('conditions', e.target.checked ? [...curr, c] : curr.filter((x) => x !== c));
                }}
                className="accent-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="label mb-3">Price Range (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value)}
            className="input text-sm w-full"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="input text-sm w-full"
          />
        </div>
      </div>

      {/* Distance */}
      <div>
        <p className="label mb-3">Distance</p>
        <div className="space-y-2">
          {[
            { label: 'Same campus', value: 0 },
            { label: 'Same city', value: 5 },
            { label: 'Within 25 km', value: 25 },
            { label: 'Within 50 km', value: 50 },
            { label: 'All India', value: 9999 },
          ].map((d) => (
            <label key={d.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="radius"
                value={d.value}
                checked={filters.radius === d.value}
                onChange={() => update('radius', d.value)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="label mb-3">Sort By</p>
        <select
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
          className="input text-sm"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="primary" onClick={onApply} className="flex-1 justify-center">Apply</Button>
        <Button variant="secondary" onClick={onReset}>
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
