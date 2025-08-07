import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, updatePassword } from '@/lib/supabase';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyResetSession = async () => {
      try {
        console.log('🔄 RESET: Verificando sesión de reseteo de contraseña');
        
        // Obtener la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ RESET: Error obteniendo sesión:', error);
          setError('Enlace de recuperación inválido o expirado.');
          return;
        }

        if (!session) {
          console.log('⚠️ RESET: No hay sesión activa');
          setError('Enlace de recuperación inválido o expirado. Solicita un nuevo enlace.');
          return;
        }

        console.log('✅ RESET: Sesión válida para reseteo de contraseña');
        setIsValidSession(true);
        
      } catch (err) {
        console.error('💥 RESET: Error inesperado:', err);
        setError('Error inesperado. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    verifyResetSession();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setResetLoading(true);
    setError(null);

    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        setError(`Error: ${error.message}`);
        return;
      }

      // Contraseña actualizada exitosamente
      alert('¡Contraseña actualizada correctamente! Serás redirigido al dashboard.');
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Error inesperado al actualizar la contraseña');
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Universidad San Martín</h1>
                <p className="text-[10px] text-gray-600 leading-none">Portal Académico</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
          {!isValidSession || error ? (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Enlace no válido</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {error || 'El enlace de recuperación es inválido o ha expirado'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm text-gray-600">
                  <p>
                    Por favor, solicita un nuevo enlace de recuperación desde la página de inicio de sesión.
                  </p>
                </div>
                <Button
                  type="button"
                  className="w-full h-9 text-xs bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                  onClick={handleGoHome}
                >
                  Ir al inicio de sesión
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-gray-900">Nueva Contraseña</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Ingresa tu nueva contraseña para completar el proceso de recuperación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-xs">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm">Nueva Contraseña</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="h-9 text-xs"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError(null);
                      }}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm">Confirmar Nueva Contraseña</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      placeholder="Repite tu nueva contraseña"
                      className="h-9 text-xs"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError(null);
                      }}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full h-9 text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-9 text-xs text-gray-500 hover:text-gray-700"
                      onClick={handleGoHome}
                    >
                      Cancelar y volver al inicio
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Después de actualizar tu contraseña podrás iniciar sesión normalmente.
                    </p>
                  </div>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}