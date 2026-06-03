import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎓</span>
              <span className="font-bold text-xl tracking-tight">Campus Market</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              The hyperlocal peer-to-peer marketplace built exclusively for college and university students.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                >
                  ✨ About Us
                </Link>
              </li>
              <li><Link to="/contact" className="hover:text-indigo-600 transition">Contact Us</Link></li>
              <li><Link to="/safety" className="hover:text-indigo-600 transition">Safety Tips</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/terms" className="hover:text-indigo-600 transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-600 transition">Privacy Policy</Link></li>
              <li><Link to="/report" className="hover:text-indigo-600 transition">Report a Problem</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © 2025 Campus Market. Made with ❤️ for Indian students.
          </p>
          <div className="flex gap-6 text-gray-400">
            <a href="https://instagram.com/satyam_sharma728" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition text-sm">Instagram</a>
            <a href="https://wa.me/916287089715" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition text-sm">WhatsApp</a>
            <a href="tel:+916287089715" className="hover:text-indigo-600 transition text-sm">Call Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
