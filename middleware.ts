import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Excluir rutas estáticas y de API para mejor rendimiento
  if (req.nextUrl.pathname.startsWith('/auth/') ||
      req.nextUrl.pathname.startsWith('/_next/') ||
      req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Verificar tokens de autenticación de manera eficiente
  const allCookies = req.cookies.getAll();
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  );
  const hasToken = supabaseCookies.length > 0;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/tesista', '/docente', '/coordinador', '/asesor', '/revisor'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // TEMPORALMENTE DESHABILITADO - NO BLOQUEAR DASHBOARD POST-REGISTRO
  // Las cookies pueden tardar en establecerse después del registro
  if (false && isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}