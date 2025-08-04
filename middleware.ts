import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('🛡️ MIDDLEWARE: Procesando ruta:', req.nextUrl.pathname);
  
  // Excluir rutas de autenticación del middleware
  if (req.nextUrl.pathname.startsWith('/auth/')) {
    console.log('✅ MIDDLEWARE: Ruta de auth excluida, permitiendo acceso');
    return NextResponse.next()
  }

  // Verificar si hay token de autenticación en las cookies
  // Supabase usa cookies con el patrón sb-{proyecto}-auth-token.{numero}
  const allCookies = req.cookies.getAll();
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );
  
  console.log('🍪 MIDDLEWARE: Cookies de autenticación encontradas:', {
    allCookieNames: allCookies.map(c => c.name),
    supabaseCookies: supabaseCookies.map(c => c.name),
    hasSupabaseCookies: supabaseCookies.length > 0
  });

  const token = supabaseCookies.length > 0;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/tesista', '/docente', '/coordinador']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  console.log('🔒 MIDDLEWARE: Verificación de ruta protegida:', {
    ruta: req.nextUrl.pathname,
    esRutaProtegida: isProtectedRoute,
    tieneToken: token
  });

  // TEMPORALMENTE DESHABILITADO PARA DEBUG
  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    console.log('⚠️ MIDDLEWARE: TEMPORALMENTE PERMITIENDO ACCESO SIN TOKEN PARA DEBUG');
    // return NextResponse.redirect(new URL('/', req.url))
  }

  console.log('✅ MIDDLEWARE: Acceso permitido');
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}