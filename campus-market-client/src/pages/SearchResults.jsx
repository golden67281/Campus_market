import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchProducts } from '../api/productApi';
import useAuthStore from '../store/authStore';
import ProductGrid from '../components/product/ProductGrid';
import FilterPanel from '../components/common/FilterPanel';
import CategoryBar from '../components/common/CategoryBar';
import PageWrapper from '../components/layout/PageWrapper';
import EmptyState from '../components/ui/EmptyState';
import { SORT_OPTIONS } from '../utils/constants';

const DEFAULT_FILTERS = { category: '', conditions: [], minPrice: '', maxPrice: '', radius: 25, sort: 'newest' };

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
  });
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { doSearch(); }, [q, filters, page]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const params = { q, ...filters, page, limit: 12, lat: user?.lat, lng: user?.lng };
      const res = await searchProducts(params);
      setProducts(res.data.products || res.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      // sync URL
      const urlParams = new URLSearchParams({ q, ...filters, page });
      navigate('/search?' + urlParams.toString(), { replace: true });
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const activeChips = [
    filters.category && { label: filters.category, key: 'category' },
    (filters.minPrice || filters.maxPrice) && { label: `₹${filters.minPrice || 0}–₹${filters.maxPrice || '∞'}`, key: 'price' },
    filters.conditions?.length && { label: filters.conditions.join(', '), key: 'conditions' },
  ].filter(Boolean);

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-6">
        {/* Search heading */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {q ? `Results for "${q}"` : 'All Listings'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Searching...' : `${total} results${user?.city ? ` near ${user.city}` : ''}`}
          </p>
        </div>

        <div className="mb-4">
          <CategoryBar activeCategory={filters.category} onSelect={(cat) => setFilters({ ...filters, category: cat })} />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition bg-white"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          {activeChips.map((chip) => (
            <span key={chip.key} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {chip.label}
              <button onClick={() => setFilters({ ...filters, [chip.key]: '' })}><X size={12} /></button>
            </span>
          ))}
          {activeChips.length > 0 && (
            <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs text-red-500 hover:underline">Clear All</button>
          )}
          <div className="ml-auto">
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter drawer */}
        {showFilter && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setShowFilter(false)} />
            <div className="w-80 bg-white h-full overflow-y-auto p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button onClick={() => setShowFilter(false)}><X size={20} /></button>
              </div>
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onApply={() => { setPage(1); setShowFilter(false); doSearch(); }}
                onReset={() => { setFilters(DEFAULT_FILTERS); setShowFilter(false); }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && products.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={`No results for "${q}"`}
            description="Try different keywords, change the category filter, or expand the distance."
          />
        ) : (
          <ProductGrid products={products} loading={loading} skeletonCount={12} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-indigo-400"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:border-indigo-400"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </PageWrapper>
    </div>
  );
}