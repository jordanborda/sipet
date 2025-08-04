import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        showBackToDashboard={true}
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
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
                Esta sección está en desarrollo. Pronto podrás supervisar y asesorar a tus estudiantes de tesis.
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
      </main>
    </div>
  );
}