import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Example: Check for an auth cookie
  const authToken = request.cookies.get('auth_token');

  // If no token, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed if authenticated
  return NextResponse.next();
}

// Specify the routes where this middleware should apply
export const config = {
  matcher: ['/', '/about/:path*'], // Add all protected paths
};
