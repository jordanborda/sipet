import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminTesista from "@/components/admin/admin-tesista";
import AdminDocente from "@/components/admin/admin-docente";
import AdminReportes from "@/components/admin/admin-reportes";
import { Eye, EyeOff, Lock, User, Users, BarChart3, BookOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  selected_role: string;
  is_administrator: boolean;
}


export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  
  // Tab and sidebar state
  const [activeTab, setActiveTab] = useState('tesistas');
  const [activeSidebarItem, setActiveSidebarItem] = useState({
    tesistas: 'inicio',
    docentes: 'repositorio-docentes',
    reportes: 'reportes-admin'
  });
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Error states
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const adminSession = localStorage.getItem('admin_session');
      
      if (adminSession) {
        const sessionData = JSON.parse(adminSession);
        const currentTime = new Date().getTime();
        
        if (currentTime - sessionData.timestamp < 24 * 60 * 60 * 1000) {
          setAdmin(sessionData.admin);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('admin_session');
        }
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      localStorage.removeItem('admin_session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      // Verify admin credentials
      const { data: passwordValid, error: passwordError } = await supabase
        .rpc('verify_admin_password', {
          input_email: formData.email,
          input_password: formData.password
        });

      if (passwordError || !passwordValid) {
        setError('Credenciales incorrectas');
        setLoginLoading(false);
        return;
      }

      // Get admin user data
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (adminError || !adminData) {
        setError('Error al obtener datos del administrador');
        setLoginLoading(false);
        return;
      }

      // Verify user is actually an administrator
      if (!adminData.is_administrator) {
        setError('Usuario no tiene permisos de administrador');
        setLoginLoading(false);
        return;
      }

      // Update last login in administrators table
      await supabase
        .from('administrators')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', adminData.id);

      // Store admin session
      const sessionData = {
        admin: adminData,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      setAdmin(adminData);
      setIsLoggedIn(true);
      
    } catch (error) {
      console.error('Error during admin login:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setAdmin(null);
    setIsLoggedIn(false);
    setFormData({ email: '', password: '' });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col`}>
        <Header 
          title="Panel de Administración - SIPeT" 
          subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
        />

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
                <p className="text-gray-600 text-sm">Ingresa tus credenciales para continuar</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="admin@sipet.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ingresa tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }


  // Tabs configuration matching tesista.tsx style
  const tabs = [
    { id: 'tesistas', title: 'TESISTAS', icon: Users },
    { id: 'docentes', title: 'DOCENTES', icon: BookOpen },
    { id: 'reportes', title: 'REPORTES ADMIN', icon: BarChart3 }
  ];

  // Admin Dashboard with tesista.tsx styling
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white flex flex-col`}>
      <Header 
        title="Panel de Administración - SIPeT" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bienvenido, {admin?.full_name || admin?.email}</h1>
            <p className="text-blue-100">Panel de Administración del Sistema SIPeT</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Tabs Navigation - centered and reduced width */}
      <div className="w-full py-4 flex justify-center">
        <div className="w-full max-w-[1408px] px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto p-0 flex justify-center rounded-lg overflow-hidden !bg-[#0039A6]">
              {tabs.map((tab, index) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center py-4 px-8 text-xs font-medium transition-all duration-200 flex-1 min-w-0 !text-white !bg-transparent !shadow-none hover:!bg-black/20 hover:!text-white data-[state=active]:!bg-blue-800 data-[state=active]:!text-white data-[state=active]:hover:!bg-blue-900"
                    style={{ 
                      borderRight: index < tabs.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                    }}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <IconComponent className="w-8 h-8 mb-2" />
                    <span className="text-xs whitespace-nowrap">{tab.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Contents */}
            <div className="bg-white min-h-[600px] w-full flex justify-center">
              <div className="w-full max-w-[1408px]">
                {/* TESISTAS Tab */}
                <TabsContent value="tesistas" className="py-0 px-0">
                  <div className="w-full">
                    <AdminTesista 
                      activeSidebarItem={activeSidebarItem.tesistas}
                      setActiveSidebarItem={(item: string) => setActiveSidebarItem(prev => ({ ...prev, tesistas: item }))}
                    />
                  </div>
                </TabsContent>

                {/* DOCENTES Tab */}
                <TabsContent value="docentes" className="py-0 px-0">
                  <div className="w-full">
                    <AdminDocente 
                      activeSidebarItem={activeSidebarItem.docentes}
                      setActiveSidebarItem={(item: string) => setActiveSidebarItem(prev => ({ ...prev, docentes: item }))}
                    />
                  </div>
                </TabsContent>

                {/* REPORTES ADMIN Tab */}
                <TabsContent value="reportes" className="py-0 px-0">
                  <div className="w-full">
                    <AdminReportes 
                      activeSidebarItem={activeSidebarItem.reportes}
                      setActiveSidebarItem={(item: string) => setActiveSidebarItem(prev => ({ ...prev, reportes: item }))}
                    />
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}

