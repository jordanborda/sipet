import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, Phone, ExternalLink, Globe, LogOut } from "lucide-react";
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  avatar_url: string;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Universidad San Martín", subtitle = "Sistema de Gestión Académica" }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    
    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          loadUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const loadUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Obtener datos del usuario desde nuestra tabla
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, full_name, first_name, avatar_url')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error al obtener datos del usuario:', error);
        setLoading(false);
        return;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || `${userData.first_name}`.trim() || userData.email,
        first_name: userData.first_name,
        avatar_url: userData.avatar_url
      });
    } catch (error) {
      console.error('Error cargando usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 HEADER: Iniciando proceso de logout completo');
      
      // 1. Cerrar sesión en Supabase con revocación de tokens
      console.log('📡 HEADER: Cerrando sesión en Supabase...');
      await supabase.auth.signOut({ scope: 'global' });
      
      // 2. Limpiar todas las cookies relacionadas con Supabase
      console.log('🍪 HEADER: Limpiando cookies de Supabase...');
      const allCookies = document.cookie.split(';');
      
      allCookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Limpiar cookies de Supabase
        if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
          console.log(`🧹 HEADER: Eliminando cookie: ${name}`);
          
          // Eliminar cookie en diferentes dominios y paths
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }
      });
      
      // 3. Establecer flag para forzar selección de cuenta en próximo login
      console.log('🏷️ HEADER: Estableciendo flag para forzar selección de cuenta Google...');
      localStorage.setItem('force_account_selection', 'true');
      
      // 4. Limpiar localStorage y sessionStorage (excepto nuestro flag)
      console.log('💾 HEADER: Limpiando storage local...');
      const storageKeys = Object.keys(localStorage);
      storageKeys.forEach(key => {
        if ((key.startsWith('supabase') || key.includes('auth') || key.startsWith('sb-')) && key !== 'force_account_selection') {
          console.log(`🧹 HEADER: Eliminando localStorage: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('supabase') || key.includes('auth') || key.startsWith('sb-')) {
          console.log(`🧹 HEADER: Eliminando sessionStorage: ${key}`);
          sessionStorage.removeItem(key);
        }
      });
      
      // 5. Limpiar estado local
      console.log('🔄 HEADER: Limpiando estado local...');
      setUser(null);
      
      // 6. Redirigir al home con parámetro de logout
      console.log('🏠 HEADER: Redirigiendo al home...');
      
      // 7. Forzar recarga de la página para asegurar limpieza completa
      setTimeout(() => {
        console.log('🔄 HEADER: Forzando recarga de página para limpieza completa...');
        window.location.href = '/?logout=true';
      }, 100);
      
      console.log('✅ HEADER: Logout completo exitoso');
      
    } catch (error) {
      console.error('❌ HEADER: Error durante logout:', error);
      // Aún así redirigir al home con limpieza
      setTimeout(() => {
        window.location.href = '/?logout=true';
      }, 100);
    }
  };

  const navigateToProfile = () => {
    router.push('/perfil');
  };

  const navigateToSettings = () => {
    // TODO: Implementar página de configuración
    console.log('Navegar a configuración');
  };

  const TopHeader = () => (
    <div className="w-full" style={{ backgroundColor: '#211E1E' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-10">
          <div className="flex items-center space-x-1 text-xs">
            {/* Contacto */}
            <button className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10">
              <Phone className="w-3 h-3" />
              <span>Contacto</span>
            </button>
            <div className="text-white/40">|</div>
            
            {/* Links de Interés */}
            <button className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10">
              <ExternalLink className="w-3 h-3" />
              <span>Links de Interés</span>
            </button>
            <div className="text-white/40">|</div>
            
            {/* Idioma En/Es */}
            <button className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10">
              <Globe className="w-3 h-3" />
              <span>En/Es</span>
            </button>
            <div className="text-white/40">|</div>
            
            {/* Cerrar Sesión */}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <TopHeader />
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#0039A6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título clickeable */}
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-4 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {title.includes('Tesista') ? 'T' : 
                   title.includes('Docente') ? 'D' : 
                   title.includes('Coordinador') ? 'C' : 'S'}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{title}</h1>
                <p className="text-[10px] text-white/80 leading-none">{subtitle}</p>
              </div>
            </button>


            {/* Usuario autenticado */}
            {user && !loading ? (
              <div className="flex items-center space-x-4">
                {/* Botones de navegación */}
                <div className="flex items-center space-x-2">
                  {/* Perfil Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={navigateToProfile}
                    className="text-white hover:bg-white/10 px-3"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-xs">Perfil</span>
                  </Button>

                  {/* Notificaciones Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 px-3 relative">
                        <Bell className="w-4 h-4 mr-2" />
                        <span className="text-xs">Notificaciones</span>
                        {/* Badge de notificaciones nuevas */}
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span>Notificaciones</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-64 overflow-y-auto">
                        <DropdownMenuItem className="flex-col items-start p-3 space-y-1">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium">Nuevo proyecto aprobado</span>
                            <span className="text-xs text-gray-500">2h</span>
                          </div>
                          <p className="text-xs text-gray-600">Tu proyecto de tesis ha sido aprobado por el comité académico.</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex-col items-start p-3 space-y-1">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium">Recordatorio de entrega</span>
                            <span className="text-xs text-gray-500">1d</span>
                          </div>
                          <p className="text-xs text-gray-600">Recuerda entregar tu borrador de tesis antes del 15 de agosto.</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex-col items-start p-3 space-y-1">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium">Reunión programada</span>
                            <span className="text-xs text-gray-500">3d</span>
                          </div>
                          <p className="text-xs text-gray-600">Tu asesor ha programado una reunión para el próximo viernes.</p>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-center text-xs text-blue-600">
                        Ver todas las notificaciones
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Avatar y información del usuario */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2 hover:bg-white/10">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{user.full_name}</p>
                        <p className="text-xs text-white/80">{user.email}</p>
                      </div>
                      {user.avatar_url ? (
                        <Image 
                          src={user.avatar_url} 
                          alt="Avatar" 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.first_name?.charAt(0) || user.email.charAt(0)}
                          </span>
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={navigateToSettings}>
                      <span>Configuración</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-white">Cargando...</span>
              </div>
            ) : (
              <Button 
                onClick={() => router.push('/')}
                variant="outline" 
                size="sm" 
                className="text-xs bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}