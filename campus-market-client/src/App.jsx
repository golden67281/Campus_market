import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import BottomTabBar from './components/layout/BottomTabBar';
import Footer from './components/layout/Footer';
import Spinner from './components/ui/Spinner';

// Lazy-loaded pages for code-splitting
const Landing       = lazy(() => import('./pages/Landing'));
const Login         = lazy(() => import('./pages/Login'));
const Signup        = lazy(() => import('./pages/Signup'));
const Home          = lazy(() => import('./pages/Home'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const Profile       = lazy(() => import('./pages/Profile'));
const EditProfile   = lazy(() => import('./pages/EditProfile'));
const MyListings    = lazy(() => import('./pages/MyListings'));
const Wishlist      = lazy(() => import('./pages/Wishlist'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings      = lazy(() => import('./pages/Settings'));
const NotFound      = lazy(() => import('./pages/NotFound'));
const ChatList      = lazy(() => import('./pages/ChatList'));
const ChatRoom      = lazy(() => import('./pages/ChatRoom'));
const Contact       = lazy(() => import('./pages/Contact'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
          }}
        />

        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/"             element={<Landing />} />
              <Route path="/login"        element={<Login />} />
              <Route path="/signup"       element={<Signup />} />
              <Route path="/search"       element={<SearchResults />} />
              <Route path="/product/:id"  element={<ProductDetail />} />
              <Route path="/contact"      element={<Contact />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/home"              element={<Home />} />
                <Route path="/sell"              element={<CreateListing />} />
                <Route path="/profile"           element={<Profile />} />
                <Route path="/profile/edit"      element={<EditProfile />} />
                <Route path="/my-listings"       element={<MyListings />} />
                <Route path="/wishlist"          element={<Wishlist />} />
                <Route path="/notifications"     element={<Notifications />} />
                <Route path="/settings"          element={<Settings />} />
                <Route path="/chats"             element={<ChatList />} />
                <Route path="/chat/:productId/:partnerId" element={<ChatRoom />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
        <BottomTabBar />
      </div>
    </BrowserRouter>
  );
}
