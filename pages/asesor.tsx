import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Home,
  Users,
  FileCheck,
  Calendar,
  MessageSquare,
  Settings,
  BookOpen,
  CheckSquare,
  TrendingUp
} from "lucide-react";

// Lazy load fonts to improve performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const sections = [
  {
    id: 'inicio',
    title: 'INICIO',
    icon: Home,
  },
  {
    id: 'tesistas',
    title: 'MIS TESISTAS',
    icon: Users,
  },
  {
    id: 'avances',
    title: 'AVANCES',
    icon: TrendingUp,
  },
  {
    id: 'reuniones',
    title: 'REUNIONES',
    icon: Calendar,
  },
  {
    id: 'consultas',
    title: 'CONSULTAS',
    icon: MessageSquare,
  },
  {
    id: 'configuracion',
    title: 'CONFIGURACIÓN',
    icon: Settings,
  },
];

export default function Asesor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      // Verificar si el usuario tiene el rol de asesor
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_advisor')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error || !userData?.is_advisor) {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white`}>
      <Header 
        title="Portal del Asesor" 
        subtitle="Asesoría y Supervisión de Tesis"
      />

      {/* Tabs Navigation */}
      <div className="w-full flex justify-center py-4">
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="inicio" className="w-full">
            <TabsList className="w-full h-auto p-0 flex justify-center rounded-lg overflow-hidden !bg-[#0039A6]">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <TabsTrigger 
                    key={section.id}
                    value={section.id}
                    className="flex flex-col items-center py-4 px-8 text-xs font-medium transition-all duration-200 flex-1 min-w-0 !text-white !bg-transparent !shadow-none hover:!bg-black/20 hover:!text-white data-[state=active]:!bg-blue-800 data-[state=active]:!text-white data-[state=active]:hover:!bg-blue-900"
                    style={{ 
                      borderRight: index < sections.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                    }}
                  >
                    <IconComponent className="w-8 h-8 mb-2" />
                    <span className="text-xs whitespace-nowrap">{section.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Contents */}
            <div className="bg-white min-h-[600px]">
              <TabsContent value="inicio" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-green-100 max-w-md mx-auto">
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <CardTitle className="text-xl text-gray-900">Portal del Asesor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Bienvenido al portal de asesor. Aquí puedes guiar y supervisar el progreso de tus tesistas.
                      </p>
                      <div className="space-y-3 text-sm text-gray-600">
                        <p>• Asesoría metodológica</p>
                        <p>• Seguimiento de avances</p>
                        <p>• Orientación académica</p>
                        <p>• Programación de reuniones</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tesistas" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-green-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-green-600" />
                        Mis Tesistas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Lista de estudiantes bajo tu asesoría académica para el desarrollo de sus proyectos de tesis.
                      </p>
                      <div className="text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tienes tesistas asignados actualmente</p>
                        <p className="text-sm mt-2">Los estudiantes aparecerán aquí cuando sean asignados a tu asesoría</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="avances" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-green-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        Seguimiento de Avances
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Monitorea el progreso de las tesis, revisa entregas y proporciona retroalimentación.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">Entregas Pendientes</h4>
                          <p className="text-2xl font-bold text-green-600">0</p>
                          <p className="text-sm text-green-600">Sin revisiones pendientes</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">Proyectos Activos</h4>
                          <p className="text-2xl font-bold text-blue-600">0</p>
                          <p className="text-sm text-blue-600">Tesis en desarrollo</p>
                        </div>
                      </div>
                      <div className="text-center text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay avances para revisar</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reuniones" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-green-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-green-600" />
                        Agenda de Reuniones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Programa y gestiona reuniones de asesoría con tus tesistas.
                      </p>
                      <div className="mb-6">
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <Calendar className="w-4 h-4 mr-2" />
                          Programar Nueva Reunión
                        </Button>
                      </div>
                      <div className="text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tienes reuniones programadas</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="consultas" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-green-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                        Consultas de Tesistas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Responde dudas y consultas académicas de tus estudiantes de tesis.
                      </p>
                      <div className="text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay consultas pendientes</p>
                        <p className="text-sm mt-2">Las consultas de tus tesistas aparecerán aquí</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="configuracion" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-green-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-green-600" />
                        Configuración del Asesor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Configura tus preferencias de asesoría y disponibilidad.
                      </p>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Disponibilidad de Asesoría</h4>
                          <p className="text-sm text-gray-600">Configura tus horarios de atención y modalidades de asesoría</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Notificaciones</h4>
                          <p className="text-sm text-gray-600">Personaliza cómo recibir notificaciones de entregas y consultas</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Plantillas de Retroalimentación</h4>
                          <p className="text-sm text-gray-600">Crear plantillas para agilizar la revisión de avances</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}