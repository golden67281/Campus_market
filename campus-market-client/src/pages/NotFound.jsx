import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import PageWrapper from '../components/layout/PageWrapper';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <PageWrapper className="text-center py-20">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Oops! Page not found</p>
        <p className="text-gray-500 max-w-sm mx-auto mb-10">
          The listing may have been removed or the link is incorrect. Let's get you back on track.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/"><Button variant="primary" className="px-6">← Go Home</Button></Link>
          <Link to="/search"><Button variant="secondary" className="px-6">Browse Products</Button></Link>
        </div>
      </PageWrapper>
    </div>
  );
}