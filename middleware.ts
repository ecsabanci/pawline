import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // Protected routes
    const protectedPaths = ['/profile', '/checkout'];
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    // Auth routes (login/register)
    const authPaths = ['/auth/login', '/auth/register'];
    const isAuthPath = authPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    // Handle protected routes
    if (isProtectedPath) {
      if (!session) {
        // Save the original URL as a query parameter
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Handle auth routes
    if (isAuthPath && session) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    return response;
  }
}

export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*', '/auth/:path*'],
}; 