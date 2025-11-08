import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies
  const token = request.cookies.get('sb-access-token')

  // Protected routes
  const isCustomerRoute = pathname.startsWith('/customer')
  const isPartnerRoute = pathname.startsWith('/partner')
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute = isCustomerRoute || isPartnerRoute || isAdminRoute

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing login/register with token
  const isAuthRoute = pathname === '/login' || pathname === '/register'
  if (isAuthRoute && token) {
    // Default redirect to customer dashboard
    // In production, you should check the user role from the token
    return NextResponse.redirect(new URL('/customer/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/customer/:path*', '/partner/:path*', '/admin/:path*', '/login', '/register'],
}
