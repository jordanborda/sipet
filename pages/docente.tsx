import { useState, useEffect } from 'react';
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
  Settings
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    id: 'evaluaciones',
    title: 'EVALUACIONES',
    icon: FileCheck,
  },
  {
    id: 'calendario',
    title: 'CALENDARIO',
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

export default function Docente() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50`}>
      <Header 
        title="Portal del Docente" 
        subtitle="Supervisión y Asesoría de Tesis"
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
                    <div className="flex flex-col items-center gap-2">
                      <IconComponent className="w-6 h-6" />
                      <span className="font-normal tracking-wide">
                        {section.title}
                      </span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Contents */}
            <div className="mt-6">
              <TabsContent value="inicio" className="py-8 px-0">
                <div className="max-w-7xl mx-auto text-center">
                  <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 max-w-md mx-auto">
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <CardTitle className="text-xl text-gray-900">Portal del Docente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Bienvenido al portal docente. Aquí puedes supervisar y asesorar a tus estudiantes de tesis.
                      </p>
                      <div className="space-y-3 text-sm text-gray-600">
                        <p>• Supervisión de tesistas</p>
                        <p>• Evaluación de avances</p>
                        <p>• Gestión de asesorías</p>
                        <p>• Calendario de reuniones</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tesistas" className="py-8 px-0">
                <div className="max-w-7xl mx-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        Mis Tesistas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Gestiona y supervisa a los estudiantes asignados a tu tutoría.
                      </p>
                      <div className="text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tienes tesistas asignados actualmente</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="evaluaciones" className="py-8 px-0">
                <div className="max-w-7xl mx-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <FileCheck className="w-6 h-6" />
                        Evaluaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Revisa y evalúa los proyectos de tesis de tus estudiantes.
                      </p>
                      <div className="text-center text-gray-500">
                        <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay evaluaciones pendientes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="calendario" className="py-8 px-0">
                <div className="max-w-7xl mx-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        Calendario
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Programa y gestiona tus citas con tesistas.
                      </p>
                      <div className="text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay citas programadas</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="consultas" className="py-8 px-0">
                <div className="max-w-7xl mx-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        Consultas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Mensajes y consultas de tus estudiantes.
                      </p>
                      <div className="text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay consultas pendientes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="configuracion" className="py-8 px-0">
                <div className="max-w-7xl mx-auto">
                  <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Configuración
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Configura tus preferencias y datos de perfil.
                      </p>
                      <div className="text-center text-gray-500">
                        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Configuraciones disponibles próximamente</p>
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