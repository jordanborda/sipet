import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleIcon, MicrosoftIcon } from "@/components/ui/icons";
import { supabase, signInWithProvider, signInWithEmail, signUpWithEmail } from "@/lib/supabase";

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
  
  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    console.log('🏠 HOME: Componente Home montado');
    console.log('🌐 HOME: URL actual:', window.location.href);
    
    const checkExistingSession = async () => {
      console.log('🔍 HOME: Verificando sesión existente...');
      
      // Verificar si venimos de un logout (parámetro en URL o flag)
      const urlParams = new URLSearchParams(window.location.search);
      const fromLogout = urlParams.get('logout') === 'true';
      
      if (fromLogout) {
        console.log('🚪 HOME: Llegamos desde logout, limpiando cualquier sesión residual...');
        
        // Asegurar limpieza completa
        await supabase.auth.signOut();
        
        // Limpiar URL
        window.history.replaceState({}, document.title, '/');
        
        console.log('✅ HOME: Limpieza post-logout completada');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📊 HOME: Resultado de getSession:', {
        session: session ? {
          user: {
            id: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider
          },
          expires_at: session.expires_at
        } : null
      });
      
      if (session) {
        console.log('✅ HOME: Sesión encontrada, redirigiendo al dashboard');
        router.push('/dashboard');
      } else {
        console.log('ℹ️ HOME: No hay sesión activa, mostrando página de login');
      }
    };
    
    checkExistingSession();
  }, []);
  const [loading, setLoading] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: ""
  });

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    console.log(`🔐 HOME: Iniciando login con ${provider}`);
    
    // Verificar si hay flag para forzar selección de cuenta
    const forceSelection = localStorage.getItem('force_account_selection') === 'true';
    if (forceSelection) {
      console.log('🔄 HOME: Flag detectado - se forzará selección de cuenta Google');
    }
    
    setLoading(provider);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        console.error(`❌ HOME: Error en login con ${provider}:`, error);
        alert(`Error: ${error.message}`);
      } else {
        console.log(`✅ HOME: Login con ${provider} iniciado correctamente`);
      }
    } catch (err) {
      console.error(`💥 HOME: Error inesperado con ${provider}:`, err);
      alert("Error al conectar con el proveedor");
    } finally {
      setLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    try {
      const { error } = await signInWithEmail(loginData.email, loginData.password);
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        router.push('/dashboard');
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
      const { error } = await signUpWithEmail(
        registerData.email, 
        registerData.password,
        {
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          student_id: registerData.studentId
        }
      );
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
        router.push('/dashboard');
      }
    } catch (err) {
      alert("Error al registrarse");
    } finally {
      setLoading(null);
    }
  };

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
                          <a href="#" className="text-[10px] text-blue-600 hover:underline">
                            ¿Olvidaste tu contraseña?
                          </a>
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
                          <Label htmlFor="student-id" className="text-xs">Código Estudiantil</Label>
                          <Input 
                            id="student-id" 
                            type="text" 
                            placeholder="202X-XXXX"
                            className="h-9 text-xs"
                            value={registerData.studentId}
                            onChange={(e) => setRegisterData({...registerData, studentId: e.target.value})}
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
