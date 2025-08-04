import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Search,
  Settings,
  MessageSquare,
  Folder
} from "lucide-react";

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
  dni: string;
  codigo_matricula: string;
  student_id: string;
}

export default function Tesista() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔐 TESISTA: Iniciando verificación de autenticación');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📊 TESISTA: Sesión obtenida:', session ? 'presente' : 'ausente');
      
      if (!session) {
        console.log('❌ TESISTA: No hay sesión, redirigiendo al login');
        router.push('/');
        return;
      }

      console.log('🔍 TESISTA: Obteniendo datos del usuario de la BD');
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error) {
        console.error('❌ TESISTA: Error al obtener datos del usuario:', error);
        router.push('/dashboard');
        return;
      }

      console.log('📊 TESISTA: Datos del usuario obtenidos:', {
        dni: userData.dni,
        codigo_matricula: userData.codigo_matricula,
        first_time_setup_completed: userData.first_time_setup_completed
      });

      if (!userData.dni || !userData.codigo_matricula) {
        console.log('📝 TESISTA: Usuario no tiene DNI o código de matrícula, redirigiendo al dashboard');
        router.push('/dashboard');
        return;
      }

      console.log('✅ TESISTA: Usuario tiene datos completos, permitiendo acceso');

      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || `${userData.first_name} ${userData.last_name}`.trim() || userData.email,
        first_name: userData.first_name,
        avatar_url: userData.avatar_url,
        dni: userData.dni,
        codigo_matricula: userData.codigo_matricula,
        student_id: userData.student_id || userData.codigo_matricula
      };

      setUser(userProfile);
      console.log('👤 TESISTA: Usuario configurado correctamente');
      
    } catch (error) {
      console.error('💥 TESISTA: Error en autenticación:', error);
      router.push('/');
    } finally {
      console.log('🏁 TESISTA: Finalizando checkAuth');
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'lineas',
      title: 'Líneas de Investigación',
      icon: Search,
    },
    {
      id: 'herramientas',
      title: 'Herramientas del Tesista',
      icon: Settings,
    },
    {
      id: 'consultas',
      title: 'Consultas y Trámites',
      icon: MessageSquare,
    },
    {
      id: 'formatos',
      title: 'Formatos',
      icon: Folder,
    }
  ];

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
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="Portal del Tesista - SIPeT" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Title with underline */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Bienvenido a SIPeT tesistas
            </h1>
            <div className="w-32 h-1 bg-slate-900 mx-auto"></div>
          </div>

          {/* Large Horizontal Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div
                  key={section.id}
                  className="group cursor-pointer flex flex-col items-center p-8 rounded-xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl"
                  style={{
                    '--water-color': '#211E1E'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    const element = e.currentTarget;
                    element.style.backgroundColor = '#211E1E';
                    element.classList.add('animate-pulse');
                  }}
                  onMouseLeave={(e) => {
                    const element = e.currentTarget;
                    element.style.backgroundColor = 'transparent';
                    element.classList.remove('animate-pulse');
                  }}
                >
                  <div 
                    className="mb-6 p-6 rounded-full transition-all duration-500 group-hover:animate-bounce"
                    style={{ backgroundColor: '#0039A6' }}
                  >
                    <IconComponent 
                      className="w-16 h-16 text-white transition-all duration-500 group-hover:text-white group-hover:scale-125" 
                    />
                  </div>
                  <h3 
                    className="text-xl font-semibold text-center transition-all duration-500 group-hover:text-white"
                    style={{ color: '#0039A6' }}
                  >
                    {section.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}