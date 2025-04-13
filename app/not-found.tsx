import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">404</h2>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link 
        href="/"
        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
} 