import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { toast } from "sonner";

// Componente para el toast de acceso denegado
const AccessDeniedToast = ({ t }: { t: string | number }) => {
  const [progress, setProgress] = useState(100);
  const duration = 4000; // 4 segundos

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          toast.dismiss(t);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [t, duration]);

  return (
    <div 
      className="bg-red-600 rounded-lg shadow-md relative overflow-hidden"
      style={{ minWidth: '260px' }}
    >
      <div className="flex items-center px-4 py-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-white text-base">Acceso Denegado</h3>
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="flex-shrink-0 ml-3 text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {/* Barra de progreso de tiempo */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-800">
        <div 
          className="h-full bg-white transition-all ease-linear"
          style={{ 
            width: `${progress}%`,
            transitionDuration: '100ms'
          }}
        />
      </div>
    </div>
  );
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface User {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  avatar_url: string;
  needs_setup: boolean;
  dni?: string;
  codigo_matricula?: string;
  is_student: boolean;
  is_advisor: boolean;
  is_reviewer: boolean;
  is_coordinator: boolean;
  is_administrator: boolean;
}

interface FirstTimeSetupModalProps {
  isOpen: boolean;
  onComplete: (dni: string, codigoMatricula: string) => void;
  loading: boolean;
}

const FirstTimeSetupModal = ({ isOpen, onComplete, loading }: FirstTimeSetupModalProps) => {
  const [dni, setDni] = useState('');
  const [codigoMatricula, setCodigoMatricula] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.trim() && codigoMatricula.trim()) {
      onComplete(dni.trim(), codigoMatricula.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-gray-900">¡Bienvenido!</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Para completar tu registro, necesitamos algunos datos adicionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dni" className="text-sm font-medium">DNI</Label>
              <Input
                id="dni"
                type="text"
                placeholder="12345678"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="h-10 text-sm"
                maxLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo-matricula" className="text-sm font-medium">Código de Matrícula</Label>
              <Input
                id="codigo-matricula"
                type="text"
                placeholder="2024-001234"
                value={codigoMatricula}
                onChange={(e) => setCodigoMatricula(e.target.value)}
                className="h-10 text-sm"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 text-sm bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              disabled={loading || !dni.trim() || !codigoMatricula.trim()}
            >
              {loading ? 'Guardando...' : 'Completar Registro'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    console.log('🏠 DASHBOARD: Componente Dashboard montado');
    console.log('🌐 DASHBOARD: URL actual:', window.location.href);
    
    checkAuth();
    
    // Escuchar cambios en el estado de autenticación
    console.log('👂 DASHBOARD: Configurando listener onAuthStateChange');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 DASHBOARD: Auth state change detectado:', {
          event,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
          provider: session?.user?.app_metadata?.provider
        });
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ DASHBOARD: Usuario firmado, actualizando datos');
          checkAuth();
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 DASHBOARD: Usuario deslogueado, redirigiendo al login');
          router.push('/');
        }
      }
    );

    return () => {
      console.log('🧹 DASHBOARD: Limpiando suscripciones');
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    console.log('🔐 DASHBOARD: Iniciando checkAuth');
    
    try {
      console.log('📡 DASHBOARD: Obteniendo sesión de Supabase...');
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📊 DASHBOARD: Resultado de getSession:', {
        session: session ? {
          user: {
            id: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider
          },
          expires_at: session.expires_at
        } : null
      });

      if (!session) {
        console.log('❌ DASHBOARD: No hay sesión, redirigiendo al login');
        router.push('/');
        return;
      }

      console.log('✅ DASHBOARD: Sesión encontrada, buscando datos del usuario en BD');
      console.log('🔍 DASHBOARD: Buscando usuario con auth_user_id:', session.user.id);

      // Obtener datos del usuario desde nuestra tabla
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();

      console.log('📊 DASHBOARD: Resultado de consulta users:', {
        userData: userData ? {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: userData.full_name,
          first_time_setup_completed: userData.first_time_setup_completed
        } : null,
        error: error
      });

      if (error) {
        console.error('❌ DASHBOARD: Error al obtener datos del usuario:', error);
        console.log('📝 DASHBOARD: Posible causa: Usuario no existe en tabla users');
        
        // Si el usuario no existe en nuestra tabla, podría ser un problema con el trigger
        if (error.code === 'PGRST116') { // No rows found
          console.log('🚨 DASHBOARD: Usuario no encontrado en tabla users, verificando trigger');
        }
        return;
      }

      console.log('✅ DASHBOARD: Datos del usuario obtenidos correctamente');
      
      // Verificar si el usuario necesita completar setup específicamente para tesista
      const needsSetupForTesista = !userData.dni || !userData.codigo_matricula;
      
      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || `${userData.first_name} ${userData.last_name}`.trim() || userData.email,
        first_name: userData.first_name,
        avatar_url: userData.avatar_url,
        needs_setup: needsSetupForTesista, // Cambiar la lógica para ser más específica
        dni: userData.dni,
        codigo_matricula: userData.codigo_matricula,
        is_student: userData.is_student || false,
        is_advisor: userData.is_advisor || false,
        is_reviewer: userData.is_reviewer || false,
        is_coordinator: userData.is_coordinator || false,
        is_administrator: userData.is_administrator || false
      };

      console.log('👤 DASHBOARD: Perfil de usuario construido:', {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        needs_setup: userProfile.needs_setup,
        dni: userProfile.dni,
        codigo_matricula: userProfile.codigo_matricula,
        needsSetupForTesista: needsSetupForTesista
      });

      setUser(userProfile);
      setShowSetupModal(userProfile.needs_setup);
      
      console.log('✅ DASHBOARD: Estado del usuario actualizado');
      
    } catch (error) {
      console.error('💥 DASHBOARD: Error en autenticación:', error);
      console.log('🔄 DASHBOARD: Redirigiendo al login por error');
      router.push('/');
    } finally {
      console.log('🏁 DASHBOARD: Finalizando checkAuth, setLoading(false)');
      setLoading(false);
    }
  };

  const handleCompleteSetup = async (dni: string, codigoMatricula: string) => {
    setSetupLoading(true);
    try {
      const { data, error } = await supabase.rpc('complete_first_time_setup', {
        p_dni: dni,
        p_codigo_matricula: codigoMatricula
      });

      if (error) {
        toast.error('Error al guardar los datos: ' + error.message);
        return;
      }

      if (data.error) {
        toast.error('Error: ' + data.error);
        return;
      }

      // Actualizar el estado del usuario
      setUser(prev => prev ? {
        ...prev,
        needs_setup: false,
        dni: dni,
        codigo_matricula: codigoMatricula
      } : null);
      
      setShowSetupModal(false);
      toast.success('¡Datos guardados exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al completar el registro');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleRoleSelection = async (role: 'tesista' | 'asesor' | 'revisor' | 'coordinador') => {
    console.log(`🎯 DASHBOARD: Selección de rol: ${role}`);
    console.log('👤 DASHBOARD: Datos del usuario actual:', {
      dni: user?.dni,
      codigo_matricula: user?.codigo_matricula,
      needs_setup: user?.needs_setup,
      is_student: user?.is_student,
      is_advisor: user?.is_advisor,
      is_reviewer: user?.is_reviewer,
      is_coordinator: user?.is_coordinator
    });

    if (!user) {
      console.log('❌ DASHBOARD: No hay usuario, no se puede seleccionar rol');
      return;
    }

    // Check if user has permission for the selected role
    const hasPermission = {
      'tesista': user.is_student,
      'asesor': user.is_advisor,
      'revisor': user.is_reviewer,
      'coordinador': user.is_coordinator
    }[role];

    if (!hasPermission) {
      console.log(`❌ DASHBOARD: Usuario no tiene permisos para el rol: ${role}`);
      
      // Show a more elegant permission denied message
      const roleNames = {
        'tesista': 'Tesista',
        'asesor': 'Asesor',
        'revisor': 'Revisor',
        'coordinador': 'Coordinador'
      };
      
      toast.custom((t) => <AccessDeniedToast t={t} />);
      return;
    }

    console.log(`✅ DASHBOARD: Usuario tiene permisos para el rol: ${role}`);
  

    // Si es tesista y necesita setup (falta DNI o código de matrícula), mostrar modal primero
    if (role === 'tesista' && user.needs_setup) {
      console.log('📝 DASHBOARD: Tesista necesita setup, mostrando modal');
      setShowSetupModal(true);
      return;
    }

    // Si es tesista y ya tiene los datos, permitir acceso directo
    if (role === 'tesista' && !user.needs_setup) {
      console.log('✅ DASHBOARD: Tesista tiene datos completos, acceso directo');
      router.push(`/${role}`);
      return;
    }

    // Para otros roles (asesor, revisor, coordinador)
    console.log(`🔄 DASHBOARD: Guardando rol seleccionado: ${role}`);
    try {
      await supabase.rpc('complete_first_time_setup', {
        p_selected_role: role
      });
      
      console.log(`✅ DASHBOARD: Rol ${role} guardado, redirigiendo`);
      
      // Redirect based on role
      if (role === 'asesor' || role === 'revisor') {
        router.push('/docente'); // Both asesor and revisor use the docente portal
      } else {
        router.push(`/${role}`);
      }
    } catch (error) {
      console.error(`❌ DASHBOARD: Error guardando rol ${role}:`, error);
      console.log(`🔄 DASHBOARD: Redirigiendo a ${role} sin guardar rol`);
      
      // Redirect based on role
      if (role === 'asesor' || role === 'revisor') {
        router.push('/docente'); // Both asesor and revisor use the docente portal
      } else {
        router.push(`/${role}`);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`}>
      <Header />

      {/* Main Dashboard */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Bienvenido, {user?.first_name || 'Usuario'}!
            </h2>
            <p className="text-gray-600 text-lg">
              Selecciona tu rol para acceder al sistema
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tesista */}
            <Card 
              className={`cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm border-blue-100 ${
                !user?.is_student ? 'opacity-60 relative' : ''
              }`}
              onClick={() => handleRoleSelection('tesista')}
            >
              {!user?.is_student && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Tesista</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Gestiona tu proyecto de tesis, avances y documentación
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Seguimiento de proyecto</li>
                  <li>• Documentos y entregas</li>
                  <li>• Comunicación con asesor</li>
                </ul>
              </CardContent>
            </Card>

            {/* Asesor */}
            <Card 
              className={`cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm border-green-100 ${
                !user?.is_advisor ? 'opacity-60 relative' : ''
              }`}
              onClick={() => handleRoleSelection('asesor')}
            >
              {!user?.is_advisor && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Asesor</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Supervisa y guía a los tesistas bajo tu asesoría
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Asesoría de tesis</li>
                  <li>• Seguimiento de avances</li>
                  <li>• Orientación metodológica</li>
                </ul>
              </CardContent>
            </Card>

            {/* Revisor */}
            <Card 
              className={`cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm border-amber-100 ${
                !user?.is_reviewer ? 'opacity-60 relative' : ''
              }`}
              onClick={() => handleRoleSelection('revisor')}
            >
              {!user?.is_reviewer && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Revisor</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Evalúa y revisa proyectos de tesis como jurado
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Evaluación de tesis</li>
                  <li>• Proceso de revisión</li>
                  <li>• Calificación y feedback</li>
                </ul>
              </CardContent>
            </Card>

            {/* Coordinador */}
            <Card 
              className={`cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 bg-white/80 backdrop-blur-sm border-purple-100 ${
                !user?.is_coordinator ? 'opacity-60 relative' : ''
              }`}
              onClick={() => handleRoleSelection('coordinador')}
            >
              {!user?.is_coordinator && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Coordinador</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Administra el programa de tesis y coordinación académica
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Gestión del programa</li>
                  <li>• Reportes y estadísticas</li>
                  <li>• Administración general</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* No roles available message */}
          {user && !user.is_student && !user.is_advisor && !user.is_reviewer && !user.is_coordinator && (
            <div className="mt-8 text-center">
              <Card className="bg-white/80 backdrop-blur-sm border-red-100 max-w-md mx-auto">
                <CardHeader>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-red-800">Sin Roles Asignados</CardTitle>
                  <CardDescription className="text-sm text-red-600">
                    No tienes permisos para acceder a ningún rol del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 mb-4">
                    Contacta al administrador del sistema para que te asigne los roles necesarios.
                  </p>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* First Time Setup Modal */}
      <FirstTimeSetupModal 
        isOpen={showSetupModal}
        onComplete={handleCompleteSetup}
        loading={setupLoading}
      />
    </div>
  );
}