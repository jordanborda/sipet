import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔄 CALLBACK: Componente AuthCallback montado');
    console.log('🌐 CALLBACK: URL actual:', window.location.href);
    console.log('🔍 CALLBACK: Query params:', router.query);

    const handleAuthCallback = async () => {
      console.log('⚡ CALLBACK: Iniciando handleAuthCallback');
      console.log('🔗 CALLBACK: URL de callback:', window.location.href);
      
      try {
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
              provider: session.user.app_metadata?.provider
            },
            expires_at: session.expires_at,
            access_token: session.access_token ? 'presente' : 'ausente'
          } : null,
          error: error
        });

        if (error) {
          console.error('❌ CALLBACK: Error obteniendo sesión:', error);
          console.log('🔄 CALLBACK: Redirigiendo a home con error');
          router.push('/?error=auth_error');
          return;
        }

        if (session) {
          // Usuario autenticado exitosamente, redirigir al dashboard
          console.log('✅ CALLBACK: Usuario autenticado, datos de sesión:');
          console.log('👤 CALLBACK: Usuario ID:', session.user.id);
          console.log('📧 CALLBACK: Email:', session.user.email);
          console.log('🔗 CALLBACK: Provider:', session.user.app_metadata?.provider);
          console.log('🎯 CALLBACK: Redirigiendo al dashboard...');
          router.push('/dashboard');
        } else {
          // No hay sesión todavía, esperar a que onAuthStateChange la detecte
          console.log('⏳ CALLBACK: No hay sesión aún, esperando onAuthStateChange...');
        }
      } catch (error) {
        console.error('💥 CALLBACK: Error procesando callback:', error);
        console.log('🔄 CALLBACK: Redirigiendo a home con error de callback');
        router.push('/?error=callback_error');
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