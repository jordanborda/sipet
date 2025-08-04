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

export default function Coordinador() {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50`}>
      <Header 
        title="Portal del Coordinador" 
        subtitle="Administración del Programa de Tesis"
        showBackToDashboard={true}
      />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100 max-w-md mx-auto">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle className="text-xl text-gray-900">Portal del Coordinador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Esta sección está en desarrollo. Pronto podrás administrar todo el programa de tesis.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Gestión del programa</p>
                <p>• Reportes y estadísticas</p>
                <p>• Administración de usuarios</p>
                <p>• Configuración del sistema</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}