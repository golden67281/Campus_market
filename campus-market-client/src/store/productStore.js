import { create } from 'zustand';

const useProductStore = create((set) => ({
  products: [],
  filters: {
    category: '',
    condition: '',
    minPrice: 0,
    maxPrice: 50000,
    radius: 25,
    sort: 'newest',
  },
  searchQuery: '',
  currentPage: 1,

  setProducts: (products) => set({ products }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setPage: (p) => set({ currentPage: p }),
  resetFilters: () => set({ 
    filters: {
      category: '',
      condition: '',
      minPrice: 0,
      maxPrice: 50000,
      radius: 25,
      sort: 'newest',
    } 
  }),
}));

export default useProductStore;
