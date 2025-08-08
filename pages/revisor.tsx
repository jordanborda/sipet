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
  FileCheck,
  ClipboardList,
  Calendar,
  MessageSquare,
  Settings,
  Star,
  CheckCircle,
  Clock
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
    id: 'evaluaciones',
    title: 'EVALUACIONES',
    icon: FileCheck,
  },
  {
    id: 'revisiones',
    title: 'REVISIONES',
    icon: ClipboardList,
  },
  {
    id: 'sustentaciones',
    title: 'SUSTENTACIONES',
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

export default function Revisor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      // Verificar si el usuario tiene el rol de revisor
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_reviewer')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error || !userData?.is_reviewer) {
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
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white`}>
      <Header 
        title="Portal del Revisor" 
        subtitle="Evaluación y Revisión de Tesis"
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
                  <Card className="bg-white/80 backdrop-blur-sm border-amber-100 max-w-md mx-auto">
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <CardTitle className="text-xl text-gray-900">Portal del Revisor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Bienvenido al portal del revisor. Aquí puedes evaluar proyectos de tesis como miembro del jurado.
                      </p>
                      <div className="space-y-3 text-sm text-gray-600">
                        <p>• Evaluación de proyectos</p>
                        <p>• Revisión de documentos</p>
                        <p>• Calificación de tesis</p>
                        <p>• Participación en sustentaciones</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="evaluaciones" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-amber-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-amber-600" />
                        Evaluaciones Asignadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Proyectos de tesis asignados para tu evaluación como revisor.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pendientes
                          </h4>
                          <p className="text-2xl font-bold text-red-600">0</p>
                          <p className="text-sm text-red-600">Evaluaciones por revisar</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            En Proceso
                          </h4>
                          <p className="text-2xl font-bold text-yellow-600">0</p>
                          <p className="text-sm text-yellow-600">Evaluaciones iniciadas</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Completadas
                          </h4>
                          <p className="text-2xl font-bold text-green-600">0</p>
                          <p className="text-sm text-green-600">Evaluaciones terminadas</p>
                        </div>
                      </div>
                      <div className="text-center text-gray-500">
                        <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tienes evaluaciones asignadas</p>
                        <p className="text-sm mt-2">Los proyectos aparecerán aquí cuando sean asignados para revisión</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revisiones" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-amber-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-amber-600" />
                        Proceso de Revisión
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Gestiona el proceso de revisión detallada de documentos y proyectos de tesis.
                      </p>
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <h4 className="font-semibold text-amber-800 mb-2">Criterios de Evaluación</h4>
                          <ul className="text-sm text-amber-700 space-y-1">
                            <li>• Metodología de investigación</li>
                            <li>• Coherencia y estructura</li>
                            <li>• Revisión bibliográfica</li>
                            <li>• Análisis y resultados</li>
                            <li>• Conclusiones y aportes</li>
                          </ul>
                        </div>
                      </div>
                      <div className="text-center text-gray-500 mt-6">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay revisiones en proceso</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sustentaciones" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-amber-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-amber-600" />
                        Sustentaciones y Defensa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Calendario de sustentaciones donde participas como miembro del jurado evaluador.
                      </p>
                      <div className="mb-6">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">Próximas Sustentaciones</h4>
                          <p className="text-sm text-blue-700">No hay sustentaciones programadas</p>
                        </div>
                      </div>
                      <div className="text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tienes sustentaciones programadas</p>
                        <p className="text-sm mt-2">Recibirás notificaciones cuando seas convocado como jurado</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="consultas" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-amber-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-amber-600" />
                        Consultas del Proceso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Comunicación con coordinadores y otros revisores sobre el proceso de evaluación.
                      </p>
                      <div className="text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay consultas pendientes</p>
                        <p className="text-sm mt-2">Las consultas sobre evaluaciones aparecerán aquí</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="configuracion" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <Card className="bg-white/80 backdrop-blur-sm border-amber-100">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-amber-600" />
                        Configuración del Revisor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        Configura tus preferencias como revisor y criterios de evaluación.
                      </p>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Disponibilidad para Evaluaciones</h4>
                          <p className="text-sm text-gray-600">Configura tu disponibilidad para recibir asignaciones de evaluación</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Especialidades de Revisión</h4>
                          <p className="text-sm text-gray-600">Define tus áreas de especialización para evaluaciones más precisas</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Plantillas de Evaluación</h4>
                          <p className="text-sm text-gray-600">Personaliza plantillas para agilizar el proceso de evaluación</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Notificaciones</h4>
                          <p className="text-sm text-gray-600">Configurar alertas sobre nuevas asignaciones y fechas límite</p>
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