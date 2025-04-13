import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#00B8A9] hover:bg-[#009688] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B8A9]"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
} 