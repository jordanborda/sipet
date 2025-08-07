import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 CALLBACK: Componente AuthCallback montado');
    console.log('🌐 CALLBACK: URL actual:', window.location.href);
    console.log('🔍 CALLBACK: Query params:', router.query);

    const handleAuthCallback = async () => {
      console.log('⚡ CALLBACK: Iniciando handleAuthCallback');
      console.log('🔗 CALLBACK: URL de callback:', window.location.href);
      
      try {
        // Verificar si es una verificación de email
        const urlParams = new URLSearchParams(window.location.search);
        const isEmailVerification = urlParams.get('verified') === 'true';
        
        if (isEmailVerification) {
          console.log('📧 CALLBACK: Procesando verificación de email');
          localStorage.setItem('email_verified_success', 'true');
        }
        
        // Para OAuth implicit flow, el token viene en el hash (fragment)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log('🔑 CALLBACK: Access token encontrado en URL hash');
          console.log('🍪 CALLBACK: Verificando cookies después de llegada:', document.cookie);
          
          // Dar tiempo a Supabase para procesar el token automáticamente
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('🍪 CALLBACK: Verificando cookies después de delay:', document.cookie);
        }
        
        // Obtener la sesión actual
        console.log('📡 CALLBACK: Obteniendo sesión de Supabase...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📊 CALLBACK: Resultado de getSession:', {
          session: session ? {
            user: {
              id: session.user.id,
              email: session.user.email,
              provider: session.user.app_metadata?.provider,
              email_confirmed: session.user.email_confirmed_at ? 'confirmed' : 'pending'
            },
            expires_at: session.expires_at,
            access_token: session.access_token ? 'presente' : 'ausente'
          } : null,
          error: error
        });

        if (error) {
          console.error('❌ CALLBACK: Error obteniendo sesión:', error);
          setError('Error al verificar la autenticación. Intenta nuevamente.');
          return;
        }

        if (session) {
          // Usuario autenticado exitosamente
          console.log('✅ CALLBACK: Usuario autenticado, datos de sesión:');
          console.log('👤 CALLBACK: Usuario ID:', session.user.id);
          console.log('📧 CALLBACK: Email:', session.user.email);
          console.log('🔗 CALLBACK: Provider:', session.user.app_metadata?.provider);
          console.log('📧 CALLBACK: Email confirmado:', session.user.email_confirmed_at ? 'Sí' : 'No');
          
          // Si es verificación de email exitosa o email ya confirmado, ir al dashboard
          if (isEmailVerification || session.user.email_confirmed_at) {
            console.log('🎯 CALLBACK: Redirigiendo al dashboard...');
            router.push('/dashboard');
          } else {
            // Email no verificado, redirigir a la página de verificación
            console.log('⚠️ CALLBACK: Email no verificado, redirigiendo a verificación');
            router.push('/?email_pending=true');
          }
        } else {
          // No hay sesión todavía, esperar a que onAuthStateChange la detecte
          console.log('⏳ CALLBACK: No hay sesión aún, esperando onAuthStateChange...');
        }
      } catch (err) {
        console.error('💥 CALLBACK: Error procesando callback:', err);
        setError('Error inesperado durante la autenticación.');
      } finally {
        setLoading(false);
      }
    };

    // Escuchar cambios en el estado de autenticación
    console.log('👂 CALLBACK: Configurando listener onAuthStateChange');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 CALLBACK: Auth state change detectado:', {
          event,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          provider: session?.user?.app_metadata?.provider
        });
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ CALLBACK: SIGNED_IN detectado desde onAuthStateChange');
          console.log('👤 CALLBACK: Datos del usuario autenticado:');
          console.log('   - ID:', session.user.id);
          console.log('   - Email:', session.user.email);
          console.log('   - Provider:', session.user.app_metadata?.provider);
          console.log('🎯 CALLBACK: Redirigiendo al dashboard desde onAuthStateChange...');
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 CALLBACK: SIGNED_OUT detectado, redirigiendo al login');
          router.push('/');
        } else {
          console.log('ℹ️ CALLBACK: Evento no manejado:', event);
        }
      }
    );

    // Procesar el callback después de un pequeño delay para dar tiempo a Supabase
    console.log('⏱️ CALLBACK: Configurando timer para handleAuthCallback');
    const timer = setTimeout(() => {
      console.log('⏰ CALLBACK: Timer ejecutado, llamando handleAuthCallback');
      handleAuthCallback();
    }, 100);

    // Limpiar la suscripción y el timer cuando el componente se desmonte
    return () => {
      console.log('🧹 CALLBACK: Limpiando suscripciones y timers');
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Procesando autenticación...</p>
          <p className="text-gray-500 text-xs mt-2">Serás redirigido automáticamente</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Error de autenticación</h2>
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return null;
}