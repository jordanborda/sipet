import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleIcon, MicrosoftIcon } from "@/components/ui/icons";
import { supabase, signInWithProvider, signInWithEmail, signUpWithEmail, resendEmailConfirmation, sendPasswordResetEmail } from "@/lib/supabase";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // Verificar sesión activa una sola vez al montar
  useEffect(() => {
    let isMounted = true;
    let hasProcessed = false;
    
    const checkExistingSession = async () => {
      if (hasProcessed) return;
      hasProcessed = true;
      
      try {
        // Verificar si venimos de un logout
        const urlParams = new URLSearchParams(window.location.search);
        const fromLogout = urlParams.get('logout') === 'true';
        
        if (fromLogout) {
          await supabase.auth.signOut();
          window.history.replaceState({}, document.title, '/');
          if (isMounted) setIsCheckingSession(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session) {
          if (!session.user.email_confirmed_at) {
            setPendingEmail(session.user.email || "");
            setShowEmailVerification(true);
          } else {
            // Marcar que hay sesión activa sin redirigir
            setHasActiveSession(true);
          }
        }
        
        if (isMounted) setIsCheckingSession(false);
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted) setIsCheckingSession(false);
      }
    };
    
    if (router.isReady && !hasProcessed) {
      checkExistingSession();
    }
    
    return () => {
      isMounted = false;
    };
  }, [router.isReady]);
  
  const [resetEmail, setResetEmail] = useState("");
  const [resetStep, setResetStep] = useState<'email' | 'sent'>('email');
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    setLoading(provider);
    
    try {
      // Limpiar sesiones existentes antes del OAuth login
      await supabase.auth.signOut({ scope: 'global' });
      
      // Limpiar storage
      const storageKeys = Object.keys(localStorage);
      storageKeys.forEach(key => {
        if (key.startsWith('supabase') || key.includes('auth') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Verificar si hay flag para forzar selección de cuenta
      const forceSelection = localStorage.getItem('force_account_selection') === 'true';
      
      // Esperar un momento para que la limpieza se complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { error } = await signInWithProvider(provider);
      if (error) {
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      alert("Error al conectar con el proveedor");
    } finally {
      setLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    
    try {
      // Primero limpiar cualquier sesión existente
      await supabase.auth.signOut({ scope: 'global' });
      
      // Limpiar cookies de Supabase manualmente
      const allCookies = document.cookie.split(';');
      allCookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }
      });
      
      // Limpiar localStorage y sessionStorage
      const storageKeys = Object.keys(localStorage);
      storageKeys.forEach(key => {
        if (key.startsWith('supabase') || key.includes('auth') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('supabase') || key.includes('auth') || key.startsWith('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Esperar un momento para que la limpieza se complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ahora hacer el login
      const { error } = await signInWithEmail(loginData.email, loginData.password);
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        // Esperar un momento para que la nueva sesión se establezca
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Forzar recarga completa para asegurar nueva sesión
        window.location.href = '/dashboard';
      }
    } catch (err) {
      alert("Error al iniciar sesión");
    } finally {
      setLoading(null);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    
    setLoading("register");
    try {
      const { data, error } = await signUpWithEmail(
        registerData.email, 
        registerData.password,
        {
          first_name: registerData.firstName,
          last_name: registerData.lastName
        }
      );
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        // Si el usuario necesita verificar su email
        if (data.user && !data.user.email_confirmed_at) {
          setPendingEmail(registerData.email);
          setShowEmailVerification(true);
        } else {
          // Si el email ya está verificado, forzar navegación al dashboard
          alert("¡Registro exitoso! Redirigiendo al dashboard...");
          
          // Usar window.location.href para evitar cualquier bloqueo
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      }
    } catch (err) {
      alert("Error al registrarse");
    } finally {
      setLoading(null);
    }
  };

  const handleResendEmail = async () => {
    setLoading("resend");
    try {
      const { error } = await resendEmailConfirmation(pendingEmail);
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("Email de verificación reenviado. Revisa tu bandeja de entrada.");
      }
    } catch (err) {
      alert("Error al reenviar el email");
    } finally {
      setLoading(null);
    }
  };

  const handleCloseVerification = () => {
    setShowEmailVerification(false);
    setPendingEmail("");
  };

  const handleForgotPassword = () => {
    setShowPasswordReset(true);
    setResetStep('email');
    setResetEmail("");
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("password-reset");
    try {
      const { error } = await sendPasswordResetEmail(resetEmail);
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        setResetStep('sent');
        alert("Enlace de recuperación enviado. Revisa tu correo electrónico.");
      }
    } catch (err) {
      alert("Error al enviar el enlace de recuperación");
    } finally {
      setLoading(null);
    }
  };

  const handleClosePasswordReset = () => {
    setShowPasswordReset(false);
    setResetEmail("");
    setResetStep('email');
  };

  // Mostrar loading mientras se verifica la sesión
  if (isCheckingSession) {
    return (
      <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Verificando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si se debe mostrar la pantalla de verificación de email
  if (showEmailVerification) {
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

        {/* Main Content - Email Verification */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle className="text-xl text-gray-900">Verifica tu correo electrónico</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Hemos enviado un enlace de verificación a:
                <br />
                <span className="font-medium text-blue-600">{pendingEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-gray-600 space-y-2">
                <p>
                  Revisa tu bandeja de entrada y haz clic en el enlace de verificación 
                  para activar tu cuenta.
                </p>
                <p className="text-xs text-gray-500">
                  Si no encuentras el email, revisa tu carpeta de spam.
                </p>
              </div>
              
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 text-xs"
                  onClick={handleResendEmail}
                  disabled={loading === 'resend'}
                >
                  {loading === 'resend' ? 'Reenviando...' : 'Reenviar email de verificación'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-9 text-xs text-gray-500 hover:text-gray-700"
                  onClick={handleCloseVerification}
                >
                  Volver al inicio de sesión
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Una vez verificado, podrás acceder a tu cuenta y al portal estudiantil.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Si se debe mostrar la pantalla de recuperación de contraseña
  if (showPasswordReset) {
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

        {/* Main Content - Password Reset */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
            {resetStep === 'email' ? (
              <>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-gray-900">Recuperar Contraseña</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Ingresa tu correo electrónico para recibir un enlace de recuperación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendPasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm">Correo Electrónico</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        placeholder="tu-correo@ejemplo.com"
                        className="h-9 text-xs"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        type="submit"
                        className="w-full h-9 text-xs bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                        disabled={loading === 'password-reset'}
                      >
                        {loading === 'password-reset' ? 'Enviando...' : 'Enviar enlace de recuperación'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-9 text-xs text-gray-500 hover:text-gray-700"
                        onClick={handleClosePasswordReset}
                      >
                        Volver al inicio de sesión
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl text-gray-900">Enlace Enviado</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Hemos enviado un enlace de recuperación a:
                    <br />
                    <span className="font-medium text-blue-600">{resetEmail}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center text-sm text-gray-600 space-y-2">
                    <p>
                      Revisa tu bandeja de entrada y haz clic en el enlace de recuperación 
                      para restablecer tu contraseña.
                    </p>
                    <p className="text-xs text-gray-500">
                      Si no encuentras el email, revisa tu carpeta de spam.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-9 text-xs"
                      onClick={() => setResetStep('email')}
                    >
                      Enviar a otro correo
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-9 text-xs text-gray-500 hover:text-gray-700"
                      onClick={handleClosePasswordReset}
                    >
                      Volver al inicio de sesión
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      El enlace expirará en 24 horas por seguridad.
                    </p>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </main>
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
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Admisiones</a>
              <a href="#" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Programas</a>
              <a href="#" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Investigación</a>
              <a href="#" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Biblioteca</a>
              <a href="#" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Contacto</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {hasActiveSession && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-300 rounded-lg p-4 shadow-lg z-50">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Sesión Activa</p>
                <p className="text-xs text-green-700">Ya tienes una sesión iniciada</p>
              </div>
              <button
                onClick={async () => {
                  // Asegurar que tenemos una sesión válida antes de navegar
                  const { data: { session } } = await supabase.auth.getSession();
                  if (session) {
                    // Usar Next.js router para navegación
                    router.push('/dashboard');
                  } else {
                    // Si no hay sesión, recargar la página para limpiar estado
                    window.location.reload();
                  }
                }}
                className="ml-4 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        )}
        
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - University Info */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Bienvenido a tu
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                  Futuro Académico
                </span>
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-lg">
                Accede a tu portal estudiantil para gestionar tus materias, revisar calificaciones, 
                consultar horarios y conectar con la comunidad universitaria.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-100">
                <div className="text-lg font-bold text-blue-600">15k+</div>
                <div className="text-[10px] text-gray-600">Estudiantes</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-100">
                <div className="text-lg font-bold text-indigo-600">200+</div>
                <div className="text-[10px] text-gray-600">Programas</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-100">
                <div className="text-lg font-bold text-purple-600">95%</div>
                <div className="text-[10px] text-gray-600">Empleabilidad</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Servicios Disponibles</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Consulta de Notas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Inscripción de Materias</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Horarios Académicos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Biblioteca Virtual</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-center text-gray-900">Portal Estudiantil</CardTitle>
                <CardDescription className="text-center text-xs text-gray-600">
                  Ingresa tus credenciales para acceder
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login" className="text-xs">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="register" className="text-xs">Registrarse</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <div className="space-y-4">
                      {/* OAuth Buttons */}
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-9 text-xs justify-start gap-3 border-gray-300 hover:bg-gray-50"
                          onClick={() => handleOAuthLogin('google')}
                          disabled={loading === 'google'}
                        >
                          <GoogleIcon className="w-4 h-4" />
                          {loading === 'google' ? 'Conectando...' : 'Continuar con Google'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-9 text-xs justify-start gap-3 border-gray-300 hover:bg-gray-50"
                          onClick={() => handleOAuthLogin('azure')}
                          disabled={loading === 'azure'}
                        >
                          <MicrosoftIcon className="w-4 h-4" />
                          {loading === 'azure' ? 'Conectando...' : 'Continuar con Microsoft'}
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">O continúa con</span>
                        </div>
                      </div>
                      
                      <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email" className="text-xs">Correo Institucional</Label>
                          <Input 
                            id="login-email" 
                            type="email" 
                            placeholder="estudiante@usm.edu.co"
                            className="h-9 text-xs"
                            value={loginData.email}
                            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password" className="text-xs">Contraseña</Label>
                          <Input 
                            id="login-password" 
                            type="password"
                            className="h-9 text-xs"
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="remember" className="w-3 h-3" />
                            <label htmlFor="remember" className="text-[10px] text-gray-600">
                              Recordarme
                            </label>
                          </div>
                          <button 
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-[10px] text-blue-600 hover:underline"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                        <Button 
                          type="submit"
                          className="w-full h-9 text-xs bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                          disabled={loading === 'email'}
                        >
                          {loading === 'email' ? 'Iniciando...' : 'Iniciar Sesión'}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <div className="space-y-3">
                      <form onSubmit={handleEmailRegister} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="first-name" className="text-xs">Nombres</Label>
                            <Input 
                              id="first-name" 
                              type="text"
                              className="h-9 text-xs"
                              value={registerData.firstName}
                              onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="last-name" className="text-xs">Apellidos</Label>
                            <Input 
                              id="last-name" 
                              type="text"
                              className="h-9 text-xs"
                              value={registerData.lastName}
                              onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="register-email" className="text-xs">Correo Electrónico</Label>
                          <Input 
                            id="register-email" 
                            type="email" 
                            placeholder="correo@ejemplo.com"
                            className="h-9 text-xs"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="register-password" className="text-xs">Contraseña</Label>
                          <Input 
                            id="register-password" 
                            type="password"
                            className="h-9 text-xs"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="confirm-password" className="text-xs">Confirmar Contraseña</Label>
                          <Input 
                            id="confirm-password" 
                            type="password"
                            className="h-9 text-xs"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex items-start space-x-2">
                          <input type="checkbox" id="terms" className="w-3 h-3 mt-0.5" required />
                          <label htmlFor="terms" className="text-[10px] text-gray-600 leading-tight">
                            Acepto los términos y condiciones del uso del portal estudiantil
                          </label>
                        </div>
                        <Button 
                          type="submit"
                          className="w-full h-9 text-xs bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                          disabled={loading === 'register'}
                        >
                          {loading === 'register' ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-blue-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-[10px] text-gray-600">
              © 2025 Universidad San Martín. Todos los derechos reservados.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-[10px] text-gray-600 hover:text-blue-600 transition-colors">
                Soporte Técnico
              </a>
              <a href="#" className="text-[10px] text-gray-600 hover:text-blue-600 transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-[10px] text-gray-600 hover:text-blue-600 transition-colors">
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
