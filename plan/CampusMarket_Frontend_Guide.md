# 🎓 Campus Market — Frontend Implementation Guide

> Everything you need to build the React frontend. Pages, components, state, API calls, routing, styling — all in one place.

---

## 📋 Table of Contents

1. [Project Setup](#1-project-setup)
2. [Folder Structure](#2-folder-structure)
3. [Design System & Global Styles](#3-design-system--global-styles)
4. [Routing Map](#4-routing-map)
5. [Global State (Zustand Stores)](#5-global-state-zustand-stores)
6. [API Layer (Axios)](#6-api-layer-axios)
7. [Reusable UI Components](#7-reusable-ui-components)
8. [Layout Components](#8-layout-components)
9. [Page: Landing (Guest Home)](#9-page-landing-guest-home)
10. [Page: Login](#10-page-login)
11. [Page: Sign Up (4 Steps)](#11-page-sign-up-4-steps)
12. [Page: Home Feed](#12-page-home-feed)
13. [Page: Product Detail](#13-page-product-detail)
14. [Page: Express Interest Flow](#14-page-express-interest-flow)
15. [Page: Create Listing (4 Steps)](#15-page-create-listing-4-steps)
16. [Page: Search Results](#16-page-search-results)
17. [Page: My Profile](#17-page-my-profile)
18. [Page: Edit Profile](#18-page-edit-profile)
19. [Page: My Listings](#19-page-my-listings)
20. [Page: Wishlist](#20-page-wishlist)
21. [Page: Notifications](#21-page-notifications)
22. [Page: Settings](#22-page-settings)
23. [Page: 404 Not Found](#23-page-404-not-found)
24. [Custom Hooks](#24-custom-hooks)
25. [Utility Functions](#25-utility-functions)
26. [Constants & Config](#26-constants--config)
27. [Frontend Business Logic Rules](#27-frontend-business-logic-rules)
28. [Error States & Empty States](#28-error-states--empty-states)
29. [Loading & Skeleton States](#29-loading--skeleton-states)
30. [Responsive Design Rules](#30-responsive-design-rules)
31. [Frontend Build Checklist](#31-frontend-build-checklist)

---

## 1. Project Setup

### 1.1 Initialize the Project

```bash
npm create vite@latest campus-market-client -- --template react
cd campus-market-client
npm install
```

### 1.2 Install All Dependencies

```bash
# Routing
npm install react-router-dom

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# State management
npm install zustand

# HTTP requests
npm install axios

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# UI utilities
npm install react-hot-toast
npm install lucide-react
npm install date-fns
npm install react-dropzone
npm install yet-another-react-lightbox

# Dev tools
npm install -D eslint prettier eslint-config-prettier
```

### 1.3 tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### 1.4 index.css

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-gray-900 font-sans;
  }
}

@layer components {
  .btn-primary {
    @apply bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-secondary {
    @apply border border-gray-300 text-gray-700 rounded-lg px-4 py-2 font-medium hover:bg-gray-50 transition;
  }
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition;
  }
  .input {
    @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent;
  }
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  .error-text {
    @apply text-xs text-red-500 mt-1;
  }
}
```

### 1.5 .env

```
VITE_API_URL=http://localhost:5000/api
```

---

## 2. Folder Structure

```
src/
├── api/
│   ├── axiosInstance.js        ← base config + JWT interceptor
│   ├── authApi.js
│   ├── productApi.js
│   ├── userApi.js
│   ├── interestApi.js
│   ├── wishlistApi.js
│   └── notificationApi.js
│
├── assets/
│   └── logo.svg
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── BottomTabBar.jsx    ← mobile only
│   │   └── PageWrapper.jsx     ← max-width container
│   │
│   ├── product/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductCardSkeleton.jsx
│   │   ├── ProductImageGallery.jsx
│   │   └── ConditionBadge.jsx
│   │
│   ├── seller/
│   │   └── SellerCard.jsx
│   │
│   ├── forms/
│   │   ├── OTPInput.jsx
│   │   ├── ImageUploader.jsx
│   │   ├── TagInput.jsx
│   │   └── StepProgressBar.jsx
│   │
│   ├── common/
│   │   ├── CategoryBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── LocationSelector.jsx
│   │   ├── SafetyBanner.jsx
│   │   ├── VerifiedBadge.jsx
│   │   └── SectionHeader.jsx
│   │
│   └── ui/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Spinner.jsx
│       ├── Badge.jsx
│       ├── EmptyState.jsx
│       ├── ErrorState.jsx
│       └── ConfirmDialog.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useProducts.js
│   ├── useWishlist.js
│   ├── useLocation.js
│   └── useDebounce.js
│
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Home.jsx
│   ├── ProductDetail.jsx
│   ├── ExpressInterest.jsx
│   ├── CreateListing.jsx
│   ├── SearchResults.jsx
│   ├── Profile.jsx
│   ├── EditProfile.jsx
│   ├── MyListings.jsx
│   ├── Wishlist.jsx
│   ├── Notifications.jsx
│   ├── Settings.jsx
│   └── NotFound.jsx
│
├── store/
│   ├── authStore.js
│   ├── productStore.js
│   └── notificationStore.js
│
├── utils/
│   ├── distance.js
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## 3. Design System & Global Styles

### 3.1 Color Usage

| Use Case | Tailwind Class |
|----------|---------------|
| Primary button bg | `bg-indigo-600` |
| Primary button hover | `hover:bg-indigo-700` |
| Links | `text-indigo-600` |
| Page background | `bg-slate-50` |
| Card background | `bg-white` |
| Body text | `text-gray-900` |
| Muted text | `text-gray-500` |
| Border default | `border-gray-200` |
| Success green | `text-green-600` / `bg-green-50` |
| Warning amber | `text-amber-600` / `bg-amber-50` |
| Danger red | `text-red-600` / `bg-red-50` |

### 3.2 Condition Badge Colors

| Condition | Background | Text |
|-----------|-----------|------|
| New | `bg-green-100` | `text-green-800` |
| Like New | `bg-blue-100` | `text-blue-800` |
| Good | `bg-yellow-100` | `text-yellow-800` |
| Fair | `bg-gray-100` | `text-gray-700` |

### 3.3 Typography Scale

| Element | Classes |
|---------|---------|
| Page title H1 | `text-3xl font-bold text-gray-900` |
| Section heading H2 | `text-xl font-semibold text-gray-800` |
| Card title | `text-base font-medium text-gray-900` |
| Body | `text-sm text-gray-600` |
| Label | `text-sm font-medium text-gray-700` |
| Price | `text-xl font-bold text-gray-900` |
| Muted small | `text-xs text-gray-400` |

---

## 4. Routing Map

### 4.1 App.jsx — All Routes

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import ExpressInterest from './pages/ExpressInterest';
import CreateListing from './pages/CreateListing';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MyListings from './pages/MyListings';
import Wishlist from './pages/Wishlist';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Protected (requires login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/product/:id/interest" element={<ExpressInterest />} />
          <Route path="/sell" element={<CreateListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4.2 ProtectedRoute Component

```jsx
// components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute() {
  const { user } = useAuthStore();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
```

### 4.3 Route Summary Table

| Path | Page | Auth Required | Notes |
|------|------|--------------|-------|
| `/` | Landing | ❌ | Guest home page |
| `/login` | Login | ❌ | Redirect to /home if already logged in |
| `/signup` | Signup | ❌ | 4-step form |
| `/home` | Home Feed | ✅ | Location-sorted products |
| `/product/:id` | Product Detail | ❌ | Show login prompt for actions |
| `/product/:id/interest` | Express Interest | ✅ | Contact + checklist flow |
| `/sell` | Create Listing | ✅ | 4-step form |
| `/search` | Search Results | ❌ | Filters + sort |
| `/profile` | My Profile | ✅ | Tabs: overview, listings, interests |
| `/profile/edit` | Edit Profile | ✅ | Edit personal details |
| `/my-listings` | My Listings | ✅ | Active, sold, drafts tabs |
| `/wishlist` | Wishlist | ✅ | Saved products |
| `/notifications` | Notifications | ✅ | All notifications |
| `/settings` | Settings | ✅ | Preferences, account actions |
| `*` | NotFound | ❌ | 404 page |

---

## 5. Global State (Zustand Stores)

### 5.1 authStore.js

```js
// store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,       // { id, name, username, avatar, college, verified, ... }
      token: null,

      setAuth: (user, token) => set({ user, token }),
      updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' } // persisted to localStorage
  )
);

export default useAuthStore;
```

**What `user` object contains:**
```js
{
  id: 'u001',
  name: 'Aarav Shah',
  username: 'aaravshah',
  avatar: '/uploads/avatars/u001.jpg',
  college: 'IIT Gandhinagar',
  city: 'Gandhinagar',
  lat: 23.2156,
  lng: 72.6369,
  verified: true,         // college email verified
  role: 'user',
}
```

---

### 5.2 productStore.js

```js
// store/productStore.js
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
  resetFilters: () => set({
    filters: { category: '', condition: '', minPrice: 0, maxPrice: 50000, radius: 25, sort: 'newest' },
  }),
}));

export default useProductStore;
```

---

### 5.3 notificationStore.js

```js
// store/notificationStore.js
import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  }),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
}));

export default useNotificationStore;
```

---

## 6. API Layer (Axios)

### 6.1 axiosInstance.js

```js
// api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const token = auth?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### 6.2 authApi.js

```js
import api from './axiosInstance';

export const sendOtp = (mobile) => api.post('/auth/send-otp', { mobile });
export const verifyOtp = (mobile, otp) => api.post('/auth/verify-otp', { mobile, otp });
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const forgotPassword = (mobile) => api.post('/auth/forgot-password', { mobile });
export const resetPassword = (data) => api.put('/auth/reset-password', data);
```

### 6.3 productApi.js

```js
import api from './axiosInstance';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const markSold = (id) => api.put(`/products/${id}/mark-sold`);
export const renewListing = (id) => api.put(`/products/${id}/renew`);
export const incrementView = (id) => api.post(`/products/${id}/view`);
export const searchProducts = (params) => api.get('/products/search', { params });
export const uploadImage = (formData) => api.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

### 6.4 interestApi.js

```js
import api from './axiosInstance';

export const expressInterest = (data) => api.post('/interests', data);
export const getMyInterests = () => api.get('/interests/mine');
export const getProductInterests = (productId) => api.get(`/interests/product/${productId}`);
export const getSellerContact = (productId) => api.get(`/interests/contact/${productId}`);
```

### 6.5 wishlistApi.js

```js
import api from './axiosInstance';

export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
```

### 6.6 notificationApi.js

```js
import api from './axiosInstance';

export const getNotifications = () => api.get('/notifications');
export const markAllRead = () => api.put('/notifications/read-all');
export const markOneRead = (id) => api.put(`/notifications/${id}/read`);
```

---

## 7. Reusable UI Components

### 7.1 Button.jsx

```jsx
// components/ui/Button.jsx
export default function Button({ children, variant = 'primary', loading, ...props }) {
  const base = 'rounded-lg px-4 py-2 font-medium transition text-sm flex items-center gap-2';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-indigo-600 hover:bg-indigo-50',
  };
  return (
    <button className={`${base} ${variants[variant]} disabled:opacity-50`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
```

### 7.2 Badge.jsx

```jsx
// components/ui/Badge.jsx
export default function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:   'bg-gray-100 text-gray-700',
    green:  'bg-green-100 text-green-800',
    blue:   'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red:    'bg-red-100 text-red-800',
    indigo: 'bg-indigo-100 text-indigo-800',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
}
```

### 7.3 ConditionBadge.jsx

```jsx
// components/product/ConditionBadge.jsx
import Badge from '../ui/Badge';

const colorMap = { New: 'green', 'Like New': 'blue', Good: 'yellow', Fair: 'gray' };

export default function ConditionBadge({ condition }) {
  return <Badge color={colorMap[condition] || 'gray'}>{condition}</Badge>;
}
```

### 7.4 VerifiedBadge.jsx

```jsx
// components/common/VerifiedBadge.jsx
export default function VerifiedBadge() {
  return (
    <span title="Verified Student" className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
      ✅ Verified
    </span>
  );
}
```

### 7.5 Modal.jsx

```jsx
// components/ui/Modal.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
```

### 7.6 Spinner.jsx

```jsx
export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
  );
}
```

### 7.7 EmptyState.jsx

```jsx
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
```

### 7.8 StepProgressBar.jsx

```jsx
// components/forms/StepProgressBar.jsx
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
```

### 7.9 SafetyBanner.jsx

```jsx
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
```

### 7.10 OTPInput.jsx

```jsx
// components/forms/OTPInput.jsx
import { useRef } from 'react';

export default function OTPInput({ value, onChange, length = 6 }) {
  const refs = useRef([]);

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/, '');
    const arr = value.split('');
    arr[i] = val;
    onChange(arr.join(''));
    if (val && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
        />
      ))}
    </div>
  );
}
```

### 7.11 ImageUploader.jsx

```jsx
// components/forms/ImageUploader.jsx
import { useDropzone } from 'react-dropzone';

export default function ImageUploader({ images, onAdd, onRemove }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 6 - images.length,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: onAdd,
  });

  return (
    <div className="space-y-3">
      {images.length < 6 && (
        <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition">
          <input {...getInputProps()} />
          <p className="text-gray-500 text-sm">📸 Drag & drop or <span className="text-indigo-600 font-medium">browse</span></p>
          <p className="text-xs text-gray-400 mt-1">Up to 6 images, max 5MB each</p>
        </div>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square">
              <img src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                className="w-full h-full object-cover rounded-lg" alt="" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">Cover</span>
              )}
              <button onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 7.12 TagInput.jsx

```jsx
// components/forms/TagInput.jsx
import { useState } from 'react';

export default function TagInput({ tags, onChange, max = 10 }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < max) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const remove = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            {tag}
            <button onClick={() => remove(tag)} className="text-indigo-400 hover:text-indigo-700">×</button>
          </span>
        ))}
      </div>
      {tags.length < max && (
        <div className="flex gap-2">
          <input
            className="input text-sm"
            placeholder="Add a tag..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          />
          <button onClick={add} className="btn-secondary text-sm px-3">Add</button>
        </div>
      )}
    </div>
  );
}
```

---

## 8. Layout Components

### 8.1 Navbar.jsx

**Elements (Desktop):**
```
Left:   [🎓 Logo]  [📍 City ▼]
Center: [🔍 Search bar...]
Right:  [🔔 Bell w/ badge]  [❤️ Wishlist]  [+ Sell]  [Avatar ▼]
        OR if logged out: [Login]  [Sign Up]
```

**Logic:**
- Read `user` from `useAuthStore()`
- If `user` → show avatar dropdown, bell, wishlist, sell
- If no `user` → show Login + Sign Up buttons
- Bell shows red badge with `unreadCount` from `useNotificationStore()`
- Location pill shows `user.city` or detected city; click → `LocationSelector` modal
- Search bar: onChange → debounce 400ms → navigate to `/search?q=...`

**Avatar Dropdown items:**
- 👤 My Profile → `/profile`
- 📦 My Listings → `/my-listings`
- 🛒 My Interests → `/profile` (interests tab)
- ❤️ Wishlist → `/wishlist`
- ⚙️ Settings → `/settings`
- 🚪 Logout → call `authStore.logout()` → navigate to `/`

### 8.2 BottomTabBar.jsx (Mobile Only)

Shown only on `sm` and smaller screens. Fixed to bottom.

```
🏠 Home | 🔍 Search | ➕ Sell | 🔔 Alerts | 👤 Profile
```

- Active tab: indigo color
- Sell tab → navigate to `/sell`; if not logged in → `/login`
- Alerts tab shows badge if `unreadCount > 0`

### 8.3 Footer.jsx

Links: About Us | How It Works | Safety Tips | Contact | Terms | Privacy  
Copyright line at bottom.  
Only shown on Landing page and non-auth pages. Hidden when inside the app dashboard.

### 8.4 PageWrapper.jsx

```jsx
export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
```

---

## 9. Page: Landing (Guest Home)

**File:** `pages/Landing.jsx`  
**Auth:** None required  
**Redirect:** If user is already logged in → redirect to `/home`

### Sections (top to bottom):

**1. Navbar** — logo + search + Login/Signup buttons

**2. Hero Section**
- Headline: "Your Campus. Your Marketplace."
- Subheadline: "Buy and sell with verified students at your college."
- Two buttons: `[Start Selling →]` (primary) `[Browse Products]` (secondary)
- Both buttons → `/signup` if not logged in
- Background: subtle gradient or light indigo mesh

**3. Live Stats Bar**
```
🎓 120+ Colleges  |  📦 3,400+ Listings  |  👥 8,200+ Students  |  🏙️ 15+ Cities
```
Static numbers hardcoded in V1. Later fetch from API.

**4. Category Strip**
- 10 category pills with emoji icons, horizontally scrollable
- Clicking any → navigate to `/search?category=Electronics` (or respective)
- Categories: Books, Electronics, Furniture, Clothing, Instruments, Sports, Kitchen, Lab Items, Stationery, Other

**5. Featured Products Grid**
- Heading: "Popular near you"
- Fetch first 8 products from `GET /products?limit=8`
- Show as `ProductCard` grid (4 cols desktop, 2 cols mobile)
- Cards have a semi-transparent "Login to contact" overlay when guest clicks contact

**6. How It Works**
- 3 steps with icons and descriptions (static content):
  1. Sign Up Free — Verify your college
  2. List or Browse — Post in 2 minutes
  3. Meet & Deal — Meet on campus, done

**7. Trust Badges**
- 4 cards: ✅ Verified Students | 🛡️ Safe Meetings | 📍 Hyperlocal | 💸 Student Prices

**8. Footer**

---

## 10. Page: Login

**File:** `pages/Login.jsx`  
**Auth:** None (redirect to /home if already logged in)

### Layout

Centered card, max-width 400px.

**Fields:**
- Mobile Number OR Email (toggle between the two)
- Password (with show/hide toggle)
- "Forgot Password?" link → opens forgot password modal

**Submit:**
- Call `login({ mobile/email, password })`
- On success → `authStore.setAuth(user, token)` → navigate to `/home`
- On fail → show inline error message below fields

**Forgot Password Modal:**
1. Enter mobile number
2. Call `forgotPassword(mobile)` → show OTP input
3. Enter OTP → call `verifyOtp` → show new password fields
4. Submit → `resetPassword` → close modal + toast "Password updated"

**Validation Rules:**
- Mobile: exactly 10 digits
- Email: valid format
- Password: required, min 1 char (login doesn't enforce strength)

**Bottom of card:**
"Don't have an account? [Sign Up →]"

---

## 11. Page: Sign Up (4 Steps)

**File:** `pages/Signup.jsx`  
**Auth:** None

All 4 steps shown in a single page using local state `currentStep`. `StepProgressBar` shown at top.

Labels: `['Mobile', 'Details', 'College', 'Location & Password']`

### Step 1 — Mobile OTP

- Large input: mobile number (10 digits)
- "Send OTP" button → calls `sendOtp(mobile)`
- OTP input appears below (OTPInput component, 6 boxes)
- 60-second countdown timer: "Resend OTP (45s)"
- On verify → `verifyOtp(mobile, otp)` → if success → move to Step 2
- Error: "Incorrect OTP. Try again." (3 tries max, then resend)

### Step 2 — Personal Details

- Full Name (text input)
- Username (text input, check availability on blur — call `GET /users/check-username?u=...`)
- Profile Photo (optional image upload, circle preview)
- "Next →" button

**Validation:**
- Name: 2–60 chars
- Username: 4–20 chars, alphanumeric + underscore, unique

### Step 3 — College Details

- College Name: searchable dropdown (search-as-you-type; seeded list in `constants.js`)
- College City: auto-filled when college selected, editable
- College Email: email input (optional; hint text: "Adds a Verified badge to your profile")
- Year: dropdown (1st Year / 2nd Year / 3rd Year / Final Year / Alumni)
- Department/Stream: text input
- "Next →" button

### Step 4 — Location & Password

- Area/Locality: text input + "📍 Use my location" GPS button
  - GPS button calls `navigator.geolocation.getCurrentPosition()`
  - On success → reverse geocode or store lat/lng
- Password: password input with strength indicator
  - Strength bar: red (weak) → yellow (medium) → green (strong)
  - Strength rules: min 8 chars + uppercase + number = strong
- Confirm Password: must match
- "Create Account" button → calls `signup({ all form data })`
- On success → `authStore.setAuth(user, token)` → navigate to `/home` + toast "Welcome to Campus Market! 🎉"

---

## 12. Page: Home Feed

**File:** `pages/Home.jsx`  
**Auth:** Required

### Layout

```
[Navbar]
[CategoryBar]
[FilterBar — active filter chips + Sort dropdown]
  ├── Section: "From [College Name] (your college)"
  │     [ProductGrid]
  ├── Section: "From [City]"
  │     [ProductGrid]
  └── Section: "More listings"
        [ProductGrid]
[BottomTabBar — mobile]
```

### Data Fetching

On mount: call `getProducts({ lat, lng, radius: 25, sort: 'newest', page: 1 })`  
Pass user's `lat` and `lng` from `authStore`.  
Backend returns products sorted by proximity priority.

### CategoryBar

Horizontal scrollable strip of categories:
- Each is a pill button
- Active category: indigo filled, others: gray outlined
- On click → update `productStore.filters.category` → re-fetch

### FilterBar

- Show active filter chips if any: `[Electronics ×]  [₹0–₹5,000 ×]  [Clear All]`
- Filter button (mobile) → opens bottom sheet with full FilterPanel
- Sort dropdown (desktop sidebar): Newest / Price Low-High / Price High-High / Most Viewed

### FilterPanel (sidebar desktop, bottom sheet mobile)

| Filter | Input Type |
|--------|-----------|
| Category | Radio buttons (All + 10 categories) |
| Condition | Checkboxes (New, Like New, Good, Fair) |
| Price Range | Two number inputs (min/max) or range slider |
| Distance | Radio: Same campus / Same city / 25 km / 50 km / All |
| Posted | Radio: Any / Today / This week / This month |

"Apply Filters" and "Clear All" buttons at bottom.

### ProductCard.jsx

```
┌────────────────────────┐
│  [Image 4:3 ratio]  ❤️ │  ← wishlist toggle top-right
├────────────────────────┤
│  Engineering Drawing…  │  ← title, 2-line truncate
│  ₹ 250  [Negotiable]   │
│  📍 IIT Gandhinagar    │
│  [Like New]  2 hrs ago │
└────────────────────────┘
```

**ProductCard interactions:**
- Click anywhere → navigate to `/product/:id`
- Heart ❤️ click → toggle wishlist; if not logged in → redirect to login
- Heart animation: gray → red, scale bounce
- Hover: slight shadow increase, border color shift

### Infinite Scroll / Pagination

- Load 20 products per page
- "Load more" button at bottom (V1) or intersection observer for infinite scroll
- Show skeleton cards while loading next page

---

## 13. Page: Product Detail

**File:** `pages/ProductDetail.jsx`  
**Auth:** Not required to view; required to interact

### On Mount

- `incrementView(id)` — fire and forget (no await needed)
- `getProduct(id)` — load product data
- Check if product is in user's wishlist → set heart state

### Layout (Desktop — 2 column)

**Left Column (55%) — Image Gallery**
- `ProductImageGallery` component
- Large primary image
- Thumbnail strip below (up to 6)
- Click thumbnail → swap primary
- Click primary → open lightbox (yet-another-react-lightbox)

**Right Column (45%) — Info Panel**

```
Product Title (text-2xl font-bold)
₹ 250   [Negotiable tag]
[Like New badge]  [Books & Stationery]
📍 IIT Gandhinagar · Gandhinagar
🕐 Posted 2 hours ago  👁 34 views
──────────────────────────────────
SELLER CARD
──────────────────────────────────
[❤️ Save to Wishlist]  (outline heart, fills on click)
[💬 Contact Seller]    (primary button, full width)
[🚩 Report Listing]    (ghost/link button, small)
```

**Below both columns — Full Width:**

```
📝 Description
[Full description text, formatted]

🏷️ Tags:  [drawing] [engineering] [first year]

[SafetyBanner]

── More from [Seller Name] ──
[ProductCard] [ProductCard] [ProductCard]

── Similar products near you ──
[ProductCard] [ProductCard] [ProductCard] [ProductCard]
```

### Listing Status Banners

| Status | What to Show |
|--------|-------------|
| `sold` | Red banner "This item has been sold." + Contact button disabled |
| `flagged` | Yellow banner "This listing is under review." |
| `deleted` | Navigate to `/404` or show "Listing not available" |

### Guest Behavior

- Guest can see the full product detail
- Clicking "Contact Seller" or "Save to Wishlist" → show modal "Login to continue" with Login and Sign Up buttons

### SellerCard.jsx

```jsx
// Shows inside ProductDetail right panel
// Data: seller avatar, name, verified status, college, member since, listing count
// Buttons: "View other listings" → /search?seller=:id

<div className="card p-4">
  <div className="flex items-center gap-3">
    <img src={seller.avatar} className="w-12 h-12 rounded-full object-cover" />
    <div>
      <p className="font-semibold">{seller.name} {seller.verified && <VerifiedBadge />}</p>
      <p className="text-sm text-gray-500">{seller.college}</p>
      <p className="text-xs text-gray-400">Member since {formatDate(seller.createdAt)}</p>
    </div>
  </div>
  <button className="mt-3 text-sm text-indigo-600 hover:underline">
    View other listings →
  </button>
</div>
```

### Report Listing Modal

Triggered by "🚩 Report Listing" button.

```
Radio options:
○ Inappropriate content
○ Already sold
○ Spam or misleading
○ Fake/counterfeit item
○ Wrong category
○ Suspected scam
○ Other [text field appears]

[Cancel]  [Submit Report]
```

On submit → `POST /reports/listing/:id` → close modal + toast "Thanks for reporting. We'll review in 24 hours."

---

## 14. Page: Express Interest Flow

**File:** `pages/ExpressInterest.jsx`  
**Auth:** Required  
**Route:** `/product/:id/interest`

3-step flow on a single page, controlled by local state.

### Step 1 — Confirm Interest

```
[Product thumbnail]  Product Title
                     ₹ 250

Your contact info (shared with seller):
Name:     [Aarav Shah        ] ← pre-filled, editable
Phone:    [9876543210        ] ← pre-filled, editable
Area:     [Gandhinagar       ] ← pre-filled, editable

Message to seller (optional):
[Is this still available?    ]

[Send Interest →]
```

- Pre-fill from `authStore.user`
- On submit → `expressInterest({ productId, buyerName, buyerPhone, buyerArea, message })`
- On success → move to Step 2

### Step 2 — Safety Checklist

```
🛡️ Before we reveal the seller's contact:

☐ I will meet the seller in a public campus location
☐ I will not share my bank account details
☐ I will inspect the item before paying
☐ I understand Campus Market doesn't guarantee transactions
☐ I will report suspicious behavior

[Agree & See Contact Details]  ← disabled until all 5 checked
```

- All 5 checkboxes must be checked to enable the button
- On click → `getSellerContact(productId)` → move to Step 3

### Step 3 — Seller Contact Revealed

```
✅ Seller has been notified!

[Seller Avatar]  Aarav Shah  ✅ Verified
                 IIT Gandhinagar

📞 Phone: 98765 43210   [Copy]
💬 [Open in WhatsApp →]  (if seller enabled)
📍 Preferred meeting: College Canteen

⚠️ Never pay before inspecting the item in person.

[← Back to Listing]    [🏠 Home]
```

- Phone copy button → `navigator.clipboard.writeText(phone)` + toast "Copied!"
- WhatsApp link: `https://wa.me/91${phone}?text=Hi, I'm interested in your ${productTitle} on Campus Market.`

### Edge Case: Already Expressed Interest

If user has already expressed interest in this product → skip Steps 1 and 2, show Step 3 directly (fetched from backend: `contactRevealed: true`).

---

## 15. Page: Create Listing (4 Steps)

**File:** `pages/CreateListing.jsx`  
**Auth:** Required

`StepProgressBar` at top with 4 steps: `['Basic Info', 'Photos & Details', 'Location', 'Review & Post']`

Local state: `formData` object that accumulates across all steps.  
Save draft after each step: `localStorage.setItem('listing-draft', JSON.stringify(formData))`.  
On page mount: restore draft if exists → show "Resume draft?" banner.

### Step 1 — Basic Info

| Field | Component | Notes |
|-------|-----------|-------|
| Product Name | `<input>` | Required, 5–80 chars |
| Category | `<select>` dropdown | Required; triggers sub-category |
| Sub-Category | `<select>` dropdown | Optional, context-aware |
| Condition | Radio buttons | Required: New / Like New / Good / Fair |
| Price (₹) | Number input | Required; 1–99,999 |
| Mark as Negotiable | Toggle switch | Optional |
| Mark as Free | Toggle switch | Sets price to 0, hides price field |

Validation on "Next →": all required fields must be filled.

### Step 2 — Photos & Description

| Field | Component | Notes |
|-------|-----------|-------|
| Photos | `ImageUploader` | 1–6 images required; first = cover |
| Description | `<textarea>` | Required, 20–1000 chars; char counter shown |
| Tags | `TagInput` | Optional, up to 10 tags |

Character counter: `"245 / 1000"` shown below textarea.

### Step 3 — Location & Contact

| Field | Component | Notes |
|-------|-----------|-------|
| Location | Text input | Pre-filled from profile, editable |
| Use My Location | GPS button | Auto-fill via geolocation API |
| Preferred Meeting Spot | Text input | Optional, e.g. "College canteen" |
| Show WhatsApp | Toggle | Default ON |
| WhatsApp Number | Number input | Pre-filled from profile, editable; shown if toggle ON |

### Step 4 — Review & Post

Full preview of the listing:
- Image gallery preview (first image large)
- All fields displayed exactly as buyers will see
- "Edit" link next to each section → jumps back to that step
- "Post Listing" button (primary, large)

**On Post:**
1. If images are File objects (not yet uploaded) → upload each via `uploadImage(formData)` → get URLs
2. Assemble payload with image URLs
3. Call `createProduct(payload)`
4. On success → clear draft from localStorage → navigate to `/product/:id` → toast "✅ Your listing is live!"
5. On error → show error, stay on Step 4

---

## 16. Page: Search Results

**File:** `pages/SearchResults.jsx`  
**Auth:** Not required

### URL Params

Read from URL on mount: `?q=laptop&category=Electronics&minPrice=500&maxPrice=10000&sort=newest&page=1`

### Layout

```
[Navbar with search pre-filled]

Results for "laptop"  ← show query
[Electronics ×] [₹500–₹10,000 ×]  ← active filter chips
Showing 24 results near Ahmedabad

[Filters sidebar (desktop)]  |  [Product Grid]

[Pagination: ← Prev  Page 2 of 5  Next →]
```

### Fetching

On mount and when filters change:  
`searchProducts({ q, category, condition, minPrice, maxPrice, lat, lng, radius, sort, page })`

Update URL params on every filter change (so results are shareable):  
`navigate('/search?' + new URLSearchParams({ q, category, ... }).toString())`

### Empty State

```
🔍 No results for "quantum textbook" near Ahmedabad.

Showing results from other locations ↓
[products from other cities]

Try:
• Use broader search terms
• Change category filter
• Expand distance filter
```

---

## 17. Page: My Profile

**File:** `pages/Profile.jsx`  
**Auth:** Required

### Profile Header

```
[Avatar large]   Aarav Shah              [Edit Profile →]
                 @aaravshah
                 ✅ Verified Student
                 🎓 IIT Gandhinagar · Final Year · CSE
                 📍 Gandhinagar
                 📅 Member since Jan 2025

  📦 12 listings    👁 340 views    🤝 8 deals
```

Fetch from `GET /users/me`.

### Tabs

Four tabs using local state: `activeTab`:

**Overview tab:**
- 3 most recent active listings (ProductCard grid)
- "View all listings →" link

**My Listings tab:**
- Redirect to `/my-listings` or render inline

**My Interests tab:**
- List of products user expressed interest in
- Each row: product thumbnail + title + price + seller name + "View Contact" button
- Status chip: "Pending" / "Active" / "Sold"

**Wishlist tab:**
- Same as the standalone Wishlist page but embedded

### College Email Verification Section (inside profile)

If not verified:
```
🎓 Verify your college email to get a Verified Student badge.
Email: [___________@iitgn.ac.in]  [Send Verification Email]
```

If verified:
```
✅ Verified Student — iitgn.ac.in confirmed
```

---

## 18. Page: Edit Profile

**File:** `pages/EditProfile.jsx`  
**Auth:** Required

### Editable Fields

| Field | Notes |
|-------|-------|
| Profile Photo | Click avatar → file picker → circular crop preview |
| Full Name | Text input |
| Username | Text input + availability check on blur |
| College | Searchable dropdown (warning: changing resets verified badge) |
| Year / Semester | Dropdown |
| Department | Text |
| Area / Locality | Text + GPS button |
| WhatsApp Number | Number input |
| Show WhatsApp on listings | Toggle |

### Change Password Section (separate card below)

- Current Password
- New Password (strength indicator)
- Confirm New Password
- "Update Password" button

**On save:** `PUT /users/me` → update `authStore.user` with new data → toast "Profile saved" → navigate back to `/profile`.

---

## 19. Page: My Listings

**File:** `pages/MyListings.jsx`  
**Auth:** Required

### Three Tabs: Active | Sold | Drafts

**Fetching:** `GET /users/me/listings` → filter by `status` on frontend.

### Listing Management Card

```
[Thumbnail]  Engineering Drawing Set
             ₹ 250  [Like New]  Posted 3 days ago
             👁 34 views   ❤️ 5 saves   📩 3 interested

[Edit]  [Mark as Sold]  [Delete]  [Renew]
```

- **Edit** → navigate to `/sell?edit=:id` (pre-fill form with existing data)
- **Mark as Sold** → confirm dialog → `markSold(id)` → move card to Sold tab
- **Delete** → confirm dialog → `deleteProduct(id)` → remove from list
- **Renew** (only if expires soon) → `renewListing(id)` → toast "Listing renewed for 30 days"

### Interested Buyers (expandable per listing)

Click "📩 3 interested" → expand section below listing card:

```
Interested Buyers:
──────────────────
[Avatar]  Priya Sharma  · IIT Gandhinagar  ·  2 hrs ago
          "Is this still available?"
          📞 9123456789

[Avatar]  Rohan Mehta   · Gujarat Uni     ·  1 day ago
          (no message)
          📞 9876512345
```

Fetch from `GET /interests/product/:productId`.

### Drafts Tab

Show incomplete listings saved during Create Listing flow.  
Each draft card shows: step reached, timestamp, title (if entered).  
"Continue" button → navigate to `/sell` with draft data restored.

---

## 20. Page: Wishlist

**File:** `pages/Wishlist.jsx`  
**Auth:** Required

Fetch from `GET /wishlist` on mount.

### Layout

Heading: "Your Wishlist (12)"

Product grid — same `ProductCard` as Home Feed, but with:
- "Remove" (×) button in top-left corner of each card
- If product status is "sold" → gray overlay + "Sold" badge + Contact button removed

**Empty State:**
```
❤️ Your wishlist is empty.
Save products you like and come back to them anytime.
[Browse Products →]
```

---

## 21. Page: Notifications

**File:** `pages/Notifications.jsx`  
**Auth:** Required

Fetch from `GET /notifications` on mount → update store.

### Layout

```
Notifications              [Mark all as read]

TODAY
● [Avatar]  Priya is interested in your Drawing Set   2m ago
            "Is this still available?"
            → [View Listing]

● [Icon🔥]  Your listing got 10 views!                 1h ago
            Engineering Drawing Set is trending

YESTERDAY
○ [Icon✅]  Welcome to Campus Market, Aarav! 🎉        Yesterday
```

- ● = unread (filled dot), ○ = read (hollow dot)
- Click notification → mark as read + navigate to relevant page
- "Mark all as read" → `markAllRead()` + update store + update bell badge to 0

### Notification Icons by Type

| Type | Icon/Color |
|------|-----------|
| `buyer_interest` | User avatar of buyer |
| `listing_views` | 🔥 orange |
| `wishlist_save` | ❤️ red |
| `welcome` | 🎉 purple |
| `listing_expire` | ⏰ amber |
| `report_resolved` | ✅ green |

---

## 22. Page: Settings

**File:** `pages/Settings.jsx`  
**Auth:** Required

### Settings Sections

**Notification Preferences**
- All notifications (toggle)
- Buyer interest alerts (toggle)
- View milestones (toggle)
- Wishlist alerts (toggle)

**Privacy**
- Profile visible to: All users / Same college only (radio)
- Show WhatsApp number to interested buyers (toggle)

**Account**
- "Deactivate Account" (secondary danger button) → confirm dialog → `DELETE /users/me?action=deactivate`
- "Delete Account" (danger button) → confirm dialog with "Type DELETE to confirm" input → `DELETE /users/me?action=delete`

**On deactivate:** logout → navigate to `/` + toast "Your account has been deactivated."

---

## 23. Page: 404 Not Found

**File:** `pages/NotFound.jsx`  
**Auth:** None

```
🔍  404

Oops! This page doesn't exist.

The listing may have been removed or the link is incorrect.

[← Go Home]   [Browse Products]
```

---

## 24. Custom Hooks

### 24.1 useAuth.js

```js
// hooks/useAuth.js
import useAuthStore from '../store/authStore';
import { login as loginApi, signup as signupApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, token, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    setAuth(res.data.user, res.data.token);
    navigate('/home');
    toast.success('Welcome back!');
  };

  const logout = () => {
    storeLogout();
    navigate('/');
    toast('Logged out.', { icon: '👋' });
  };

  return { user, token, isLoggedIn: !!user, login, logout };
}
```

### 24.2 useWishlist.js

```js
// hooks/useWishlist.js
import { useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlistApi';
import toast from 'react-hot-toast';

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    getWishlist().then((res) => {
      setWishlistIds(res.data.map((w) => w.productId));
    });
  }, []);

  const toggle = async (productId) => {
    if (wishlistIds.includes(productId)) {
      await removeFromWishlist(productId);
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      toast('Removed from wishlist');
    } else {
      await addToWishlist(productId);
      setWishlistIds((prev) => [...prev, productId]);
      toast.success('❤️ Added to wishlist');
    }
  };

  return { wishlistIds, toggle, isSaved: (id) => wishlistIds.includes(id) };
}
```

### 24.3 useDebounce.js

```js
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
```

### 24.4 useLocation.js

```js
// hooks/useLocation.js
import { useState } from 'react';

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detect = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('Geolocation not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLoading(false);
        setError(err.message);
        reject(err);
      }
    );
  });

  return { detect, loading, error };
}
```

---

## 25. Utility Functions

### 25.1 distance.js

```js
// utils/distance.js
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

### 25.2 formatters.js

```js
// utils/formatters.js
import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (dateStr) =>
  formatDistanceToNow(new Date(dateStr), { addSuffix: true });

export const formatDate = (dateStr) =>
  format(new Date(dateStr), 'MMM yyyy'); // → "Jan 2025"

export const formatPrice = (price, isFree) =>
  isFree ? 'Free' : `₹ ${price.toLocaleString('en-IN')}`;

export const truncate = (str, len = 40) =>
  str.length > len ? str.slice(0, len) + '…' : str;

export const initials = (name) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
```

### 25.3 validators.js

```js
// utils/validators.js
export const isMobile = (val) => /^[6-9]\d{9}$/.test(val);
export const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
export const isCollegeEmail = (val) => /\.(edu|ac\.in)$/.test(val);
export const isStrongPassword = (val) =>
  val.length >= 8 && /[A-Z]/.test(val) && /\d/.test(val);
```

---

## 26. Constants & Config

### 26.1 constants.js

```js
// utils/constants.js

export const CATEGORIES = [
  { label: 'Books & Stationery', emoji: '📚', value: 'books' },
  { label: 'Electronics',        emoji: '💻', value: 'electronics' },
  { label: 'Furniture',          emoji: '🪑', value: 'furniture' },
  { label: 'Clothing',           emoji: '👗', value: 'clothing' },
  { label: 'Instruments',        emoji: '🎸', value: 'instruments' },
  { label: 'Sports',             emoji: '🏋️', value: 'sports' },
  { label: 'Kitchen',            emoji: '🍳', value: 'kitchen' },
  { label: 'Lab Items',          emoji: '🧪', value: 'lab' },
  { label: 'Stationery',         emoji: '📐', value: 'stationery' },
  { label: 'Other',              emoji: '📦', value: 'other' },
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export const SORT_OPTIONS = [
  { label: 'Newest first',        value: 'newest' },
  { label: 'Price: Low to High',  value: 'price_asc' },
  { label: 'Price: High to Low',  value: 'price_desc' },
  { label: 'Most Viewed',         value: 'views' },
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', 'Final Year', 'Alumni'];

export const REPORT_REASONS = [
  'Inappropriate content',
  'Already sold',
  'Spam or misleading description',
  'Fake or counterfeit item',
  'Wrong category',
  'Suspected scam',
  'Other',
];

export const MAX_ACTIVE_LISTINGS = 10;
export const LISTING_EXPIRY_DAYS = 30;
export const MAX_IMAGES = 6;
export const MAX_TAGS = 10;
```

---

## 27. Frontend Business Logic Rules

These must be enforced in the UI (not just the backend):

| Rule | Where to Enforce | How |
|------|-----------------|-----|
| User cannot contact their own listing | ProductDetail.jsx | Hide "Contact Seller" if `product.sellerId === user.id`; show "This is your listing" instead |
| Must be logged in to contact | ProductDetail.jsx | Show login modal on button click if `!user` |
| Must be logged in to wishlist | ProductCard.jsx | Redirect to `/login` if `!user` |
| Cannot post listing with 0 images | CreateListing Step 2 | Disable "Next" button if `images.length === 0` |
| Price must be > 0 or marked Free | CreateListing Step 1 | Validate on "Next" click |
| Username must be unique | Signup Step 2 | Call API on blur, show green ✓ or red ✗ |
| Max 10 active listings | MyListings / CreateListing | Show warning banner if user has 10 active listings; disable post button |
| Already expressed interest | ExpressInterest | Skip Steps 1–2, show contact directly |
| Sold listing: actions disabled | ProductDetail | Grey out and disable Contact/Wishlist if `status === 'sold'` |
| Changing college resets verified | EditProfile | Show warning toast when college field is changed |
| Draft restore | CreateListing | On mount, check localStorage for draft; show "Resume draft?" banner |

---

## 28. Error States & Empty States

### Empty States per Page

| Page | Empty State |
|------|------------|
| Home Feed (no products near user) | "📦 No listings near you yet. Be the first!" + Sell button |
| Search Results (no match) | "🔍 No results found. Try different keywords or filters." |
| My Listings (no active) | "📦 You haven't posted anything yet. [+ Post Your First Listing]" |
| My Listings (no sold) | "🤝 No sold items yet." |
| My Listings (no drafts) | "✏️ No drafts saved." |
| Wishlist (empty) | "❤️ Your wishlist is empty. [Browse Products]" |
| Notifications (none) | "🔔 No notifications yet." |
| My Interests (none) | "🛒 You haven't contacted any sellers yet." |

### Error States

| Scenario | UI |
|----------|---|
| Network error / fetch fails | Error card with retry button: "Failed to load. [Try Again]" |
| Product not found (404) | "This listing doesn't exist or was removed." + Home button |
| Server error (500) | "Something went wrong on our side. We're fixing it." |
| Image upload fails | Error message per image: "Failed to upload. Try again." (other images continue) |
| OTP wrong | "Incorrect OTP. X attempts remaining." |
| Account locked | "Too many attempts. Try again in 14:32." (countdown) |
| Session expired | Auto-redirect to login + toast "Session expired. Please login." |

---

## 29. Loading & Skeleton States

### ProductCardSkeleton.jsx

```jsx
export default function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-[4/3] w-full" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}
```

### When to Show Skeletons

| Page / Section | Skeleton Count |
|---------------|---------------|
| Home Feed initial load | 8 ProductCardSkeleton |
| Search Results | 12 ProductCardSkeleton |
| Product Detail | Full page skeleton (image placeholder + text lines) |
| Profile page | Avatar circle + text lines |
| Notifications | 5 notification row skeletons |
| My Listings | 3 listing card skeletons |

### Button Loading State

When an API call is in flight:
- Button shows spinner icon + disabled state
- Button text changes: "Post Listing" → "Posting..." / "Sending..." / "Saving..."
- Re-enabled after API resolves (success or error)

---

## 30. Responsive Design Rules

### Breakpoints

| Screen | Tailwind Prefix | Width | Layout Changes |
|--------|----------------|-------|---------------|
| Mobile | (default) | < 640px | 1-col feed, bottom tab bar, filter as bottom sheet |
| Tablet | `sm:` | 640–1024px | 2-col feed, top navbar, filter as sidebar |
| Desktop | `lg:` | > 1024px | 4-col feed, filter sidebar always visible |

### Component-Level Rules

| Component | Mobile | Desktop |
|-----------|--------|---------|
| ProductGrid | `grid-cols-2` | `grid-cols-4` |
| FilterPanel | Bottom sheet (fixed), toggleable | Left sidebar, always visible |
| Navbar | Logo + hamburger | Full navbar with all elements |
| BottomTabBar | Shown (fixed bottom) | Hidden |
| ProductDetail | Stacked columns | Side-by-side columns |
| StepProgressBar | Step number only | Number + label |
| CategoryBar | Horizontal scroll, `overflow-x-auto` | Same |

---

## 31. Frontend Build Checklist

Use this as your to-do list, in order.

### Week 1 — Setup & Auth

- [ ] Initialize Vite + React project
- [ ] Install all dependencies
- [ ] Configure Tailwind + global CSS + Inter font
- [ ] Create folder structure
- [ ] Build `axiosInstance.js` with JWT interceptor
- [ ] Build `authStore.js` (Zustand + persist)
- [ ] Build `authApi.js`
- [ ] Build `Login.jsx` page (form + validation + API)
- [ ] Build `Signup.jsx` page (4-step flow + OTP)
- [ ] Build `ProtectedRoute.jsx`
- [ ] Build `App.jsx` with all routes
- [ ] Build `Navbar.jsx` (both logged-in and guest states)
- [ ] Build `Footer.jsx`

### Week 2 — Landing & Home Feed

- [ ] Build `Landing.jsx` (all 8 sections)
- [ ] Build `ProductCard.jsx`
- [ ] Build `ProductCardSkeleton.jsx`
- [ ] Build `ProductGrid.jsx`
- [ ] Build `CategoryBar.jsx`
- [ ] Build `productApi.js`
- [ ] Build `Home.jsx` (feed + sections by location)
- [ ] Build `FilterPanel.jsx` (all filter options)
- [ ] Build `productStore.js`
- [ ] Wire up filters → re-fetch products

### Week 3 — Product Detail & Interest Flow

- [ ] Build `ProductDetail.jsx` (full layout)
- [ ] Build `ProductImageGallery.jsx` (thumbnail strip + lightbox)
- [ ] Build `SellerCard.jsx`
- [ ] Build `ConditionBadge.jsx`
- [ ] Build `SafetyBanner.jsx`
- [ ] Build `Modal.jsx`
- [ ] Build Report Listing modal + `reportApi.js`
- [ ] Build `ExpressInterest.jsx` (3-step flow)
- [ ] Build `interestApi.js`
- [ ] Handle "already expressed interest" flow

### Week 4 — Create Listing & Search

- [ ] Build `StepProgressBar.jsx`
- [ ] Build `ImageUploader.jsx`
- [ ] Build `TagInput.jsx`
- [ ] Build `CreateListing.jsx` (4 steps + draft save + preview)
- [ ] Build image upload to `POST /upload/image`
- [ ] Build `SearchResults.jsx`
- [ ] Wire search bar → debounce → navigate with query params
- [ ] Wire filters in search results

### Week 5 — Profile & Management

- [ ] Build `Profile.jsx` (header + 4 tabs)
- [ ] Build `EditProfile.jsx` (all editable fields)
- [ ] Build `MyListings.jsx` (3 tabs + manage actions)
- [ ] Build Interested Buyers expandable section
- [ ] Build `Wishlist.jsx`
- [ ] Build `wishlistApi.js` + `useWishlist.js`
- [ ] Build `Notifications.jsx`
- [ ] Build `notificationApi.js` + `notificationStore.js`
- [ ] Update bell badge from notification store

### Week 6 — Polish, States & Responsive

- [ ] Build `Settings.jsx` (all settings + account actions)
- [ ] Build `NotFound.jsx`
- [ ] Add all empty states (per page)
- [ ] Add all error states + retry buttons
- [ ] Add all skeleton loaders
- [ ] Add toast notifications (`react-hot-toast`) to all actions
- [ ] Add all loading states on buttons
- [ ] Test all mobile layouts (bottom tab bar, stacked columns, bottom sheet filter)
- [ ] Test all tablet layouts
- [ ] Fix all responsive issues

### Week 7 — Edge Cases & Rules

- [ ] Block own listing contact
- [ ] Block guest actions → show login modal
- [ ] Max 10 listings cap enforcement
- [ ] Draft restore on CreateListing mount
- [ ] Sold listing: disable all interactive elements
- [ ] Session expiry: auto-logout + toast
- [ ] Username availability check on blur (Signup)
- [ ] College change warning (EditProfile)
- [ ] WhatsApp link generation on Contact Reveal page
- [ ] Phone number copy button

### Week 8 — Final QA & Deploy

- [ ] Test full signup + login flow end-to-end
- [ ] Test full create listing flow (with image upload)
- [ ] Test full express interest flow
- [ ] Test wishlist toggle on multiple cards
- [ ] Test all filter combinations in search
- [ ] Test on real mobile device
- [ ] Set `VITE_API_URL` to production URL in `.env`
- [ ] Run `npm run build` → fix any build errors
- [ ] Deploy to Vercel → verify live URL works
- [ ] Test live URL on mobile browser

---

*Frontend Implementation Guide v1.0 | Campus Market | June 2025*
*Stack: React 18 + Vite + Tailwind CSS + Zustand + React Router v6 + Axios*
