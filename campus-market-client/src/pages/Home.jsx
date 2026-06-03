import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useProductStore from '../store/productStore';
import { getProducts } from '../api/productApi';
import ProductGrid from '../components/product/ProductGrid';
import CategoryBar from '../components/common/CategoryBar';
import SectionHeader from '../components/common/SectionHeader';
import FilterPanel from '../components/common/FilterPanel';
import PageWrapper from '../components/layout/PageWrapper';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuthStore();
  const { filters, setFilters, resetFilters } = useProductStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => { fetchProducts(); }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { ...filters, lat: user?.lat, lng: user?.lng, limit: 20 };
      const res = await getProducts(params);
      setProducts(res.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const applyFilters = () => { setFilters(localFilters); setShowFilter(false); };
  const handleReset = () => { resetFilters(); setLocalFilters(filters); setShowFilter(false); };

  // Group products by location for sections
  const fromCollege = products.filter((p) => p.college === user?.college);
  const fromCity = products.filter((p) => p.city === user?.city && p.college !== user?.college);
  const others = products.filter((p) => p.city !== user?.city);

  // Active filter chips
  const activeFilters = [];
  if (filters.category) activeFilters.push({ label: filters.category, key: 'category' });
  if (filters.minPrice || filters.maxPrice) activeFilters.push({ label: `₹${filters.minPrice || 0}–₹${filters.maxPrice || '∞'}`, key: 'price' });
  if (filters.conditions?.length) activeFilters.push({ label: filters.conditions.join(', '), key: 'conditions' });

  return (
    <div className="pb-20 md:pb-0">
      <PageWrapper className="py-6">
        {/* Category Bar */}
        <div className="mb-4">
          <CategoryBar
            activeCategory={filters.category}
            onSelect={(cat) => setFilters({ ...filters, category: cat })}
          />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 transition bg-white"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          {activeFilters.map((f) => (
            <span key={f.key} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {f.label}
              <button onClick={() => {
                if (f.key === 'price') {
                  setFilters({ ...filters, minPrice: 0, maxPrice: 50000 });
                } else if (f.key === 'conditions') {
                  setFilters({ ...filters, conditions: [] });
                } else {
                  setFilters({ ...filters, [f.key]: '' });
                }
              }}>
                <X size={12} />
              </button>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <button onClick={handleReset} className="text-xs text-red-500 hover:underline">Clear All</button>
          )}
          <div className="ml-auto">
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showFilter && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setShowFilter(false)} />
            <div className="w-80 bg-white h-full overflow-y-auto p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button onClick={() => setShowFilter(false)}><X size={20} /></button>
              </div>
              <FilterPanel
                filters={localFilters}
                onChange={setLocalFilters}
                onApply={applyFilters}
                onReset={handleReset}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <ProductGrid products={[]} loading={true} skeletonCount={8} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No listings near you yet"
            description="Be the first to sell something on your campus!"
            action={<Link to="/sell"><Button>+ Post Your First Listing</Button></Link>}
          />
        ) : (
          <div className="space-y-2">
            {fromCollege.length > 0 && (
              <>
                <SectionHeader title={`From ${user?.college || 'your college'}`} />
                <ProductGrid products={fromCollege} loading={false} />
              </>
            )}
            {fromCity.length > 0 && (
              <>
                <SectionHeader title={`From ${user?.city || 'your city'}`} />
                <ProductGrid products={fromCity} loading={false} />
              </>
            )}
            {others.length > 0 && (
              <>
                <SectionHeader title="More listings" />
                <ProductGrid products={others} loading={false} />
              </>
            )}
          </div>
        )}
      </PageWrapper>
    </div>
  );
}