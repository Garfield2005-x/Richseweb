import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  // Protect admin panel routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    const role = token.role;
    if (role === 'AFFILIATE') {
      // AFFILIATE role is restricted to /admin/affiliate and its sub-paths
      if (pathname === '/admin' || pathname === '/admin/') {
        return NextResponse.redirect(new URL('/admin/affiliate', req.url));
      }
      if (!pathname.startsWith('/admin/affiliate')) {
        return NextResponse.redirect(new URL('/admin/affiliate', req.url));
      }
    } else if (role !== 'ADMIN') {
      // Non-admins (normal users) are redirected to the homepage
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = token.role;
    if (role === 'AFFILIATE') {
      // AFFILIATE is only allowed to access affiliate APIs
      if (!pathname.startsWith('/api/admin/affiliate')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
