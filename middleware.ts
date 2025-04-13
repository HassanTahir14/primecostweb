import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware that just forwards the request
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    // Skip static files and API routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 