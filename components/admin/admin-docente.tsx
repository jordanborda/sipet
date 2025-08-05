import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { BookOpen, UserCheck, Award, Settings, User, Mail, Phone, Calendar, Save, Plus, Monitor, Clock, LogOut } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface DocenteUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  selected_role: string | null;
  created_at: string;
  phone: string | null;
  last_sign_in_at: string | null;
  sign_in_count: number | null;
}

interface AccessLog {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string | null;
  login_time: string;
  logout_time: string | null;
  device_info: string | null;
  ip_address: string | null;
  session_duration: number | null;
}

interface AdminDocenteProps {
  activeSidebarItem: string;
  setActiveSidebarItem: (item: string) => void;
}

export default function AdminDocente({ activeSidebarItem, setActiveSidebarItem }: AdminDocenteProps) {
  const [docentes, setDocentes] = useState<DocenteUser[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<DocenteUser | null>(null);
  const [activeDocenteTab, setActiveDocenteTab] = useState('busqueda-general');
  
  // Form data for new registration
  const [formData, setFormData] = useState({
    tipo_docente: '',
    categoria: '',
    facultad: '',
    escuela_profesional: '',
    fecha_ingreso: '',
    fecha_ascenso: '',
    resolucion_ascenso: '',
    fecha_contrato: '',
    resolucion_contrato: '',
    dni: '',
    codigo: '',
    apellidos: '',
    nombres: '',
    nacimiento: '',
    direccion: '',
    correo: '',
    celular: '',
    contrasena: ''
  });

  // Sidebar configuration
  const sidebarItems = [
    { id: 'repositorio-docentes', label: 'Repositorio docentes', icon: BookOpen },
    { id: 'acceso-docentes', label: 'Accesos docentes', icon: UserCheck },
    { id: 'constancias', label: 'Constancias', icon: Award }
  ];

  // Load docentes from database
  const loadDocentes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, full_name, selected_role, created_at, phone, last_sign_in_at, sign_in_count')
        .eq('selected_role', 'docente')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocentes(data || []);
    } catch (error) {
      console.error('Error loading docentes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load access logs from database
  const loadAccessLogs = async () => {
    setLogsLoading(true);
    try {
      // For now, we'll create mock data since the access logs table might not exist yet
      // In a real implementation, this would query an access_logs table
      const mockLogs: AccessLog[] = docentes.map((docente, index) => ({
        id: `log_${docente.id}_${index}`,
        user_id: docente.id,
        user_email: docente.email,
        user_full_name: docente.full_name,
        login_time: docente.last_sign_in_at || new Date().toISOString(),
        logout_time: docente.last_sign_in_at ? 
          new Date(new Date(docente.last_sign_in_at).getTime() + Math.random() * 3600000).toISOString() : null,
        device_info: ['Windows 10 - Chrome 120.0', 'MacOS - Safari 17.1', 'Android - Chrome Mobile 119.0', 'iOS - Safari Mobile 16.6'][Math.floor(Math.random() * 4)],
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        session_duration: Math.floor(Math.random() * 7200) // Random duration up to 2 hours
      }));
      
      setAccessLogs(mockLogs);
    } catch (error) {
      console.error('Error loading access logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadDocentes();
  }, []);

  useEffect(() => {
    if (docentes.length > 0 && activeSidebarItem === 'acceso-docentes') {
      loadAccessLogs();
    }
  }, [docentes, activeSidebarItem]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format detailed date with seconds for logs
  const formatDetailedDate = (dateString: string | null) => {
    if (!dateString) return 'No registrado';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format session duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebarItem(item.id)}
                className={`w-full flex items-center px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                  activeSidebarItem === item.id
                    ? 'bg-[#002d7a] text-white'
                    : 'text-gray-600 hover:bg-[#0039A6] hover:text-white'
                }`}
              >
                <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  // Render main content based on active sidebar item
  const renderContent = () => {
    switch (activeSidebarItem) {
      case 'repositorio-docentes':
        return (
          <div className="space-y-0 p-0">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black">
                    Repositorio de Docentes
                  </h3>
                  <p className="text-sm text-black">
                    Gestión y administración de profesores del sistema
                  </p>
                </div>
              </div>
              
              <Tabs value={activeDocenteTab} onValueChange={setActiveDocenteTab} className="w-full">
                <TabsList className="w-full h-auto p-0 flex justify-start rounded-lg overflow-hidden !bg-[#0039A6] mb-6">
                  <TabsTrigger 
                    value="busqueda-general"
                    className="flex items-center py-3 px-6 text-sm font-medium transition-all duration-200 !text-white !bg-transparent !shadow-none hover:!bg-black/20 hover:!text-white data-[state=active]:!bg-blue-800 data-[state=active]:!text-white data-[state=active]:hover:!bg-blue-900"
                  >
                    Búsqueda General
                  </TabsTrigger>
                  <TabsTrigger 
                    value="nuevo-registro"
                    className="flex items-center py-3 px-6 text-sm font-medium transition-all duration-200 !text-white !bg-transparent !shadow-none hover:!bg-black/20 hover:!text-white data-[state=active]:!bg-blue-800 data-[state=active]:!text-white data-[state=active]:hover:!bg-blue-900"
                  >
                    Nuevo Registro
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lista-generacional"
                    className="flex items-center py-3 px-6 text-sm font-medium transition-all duration-200 !text-white !bg-transparent !shadow-none hover:!bg-black/20 hover:!text-white data-[state=active]:!bg-blue-800 data-[state=active]:!text-white data-[state=active]:hover:!bg-blue-900"
                  >
                    Lista Generacional
                  </TabsTrigger>
                </TabsList>

                {/* Búsqueda General Tab */}
                <TabsContent value="busqueda-general" className="py-0 px-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <User className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{docentes.length}</p>
                          <p className="text-sm text-black">Total Docentes</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <UserCheck className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {docentes.filter(d => d.last_sign_in_at).length}
                          </p>
                          <p className="text-sm text-black">Docentes Activos</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Award className="w-8 h-8 text-amber-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-amber-600">0</p>
                          <p className="text-sm text-black">Constancias</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-black">Docentes Registrados</h4>
                    </div>
                    <div className="overflow-x-auto">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-black">Cargando docentes...</p>
                        </div>
                      ) : docentes.length === 0 ? (
                        <div className="p-8 text-center text-sm text-black">
                          No hay docentes registrados
                        </div>
                      ) : (
                        <table className="w-full table-fixed divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Docente
                              </th>
                              <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contacto
                              </th>
                              <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Último Acceso
                              </th>
                              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Accesos Totales
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {docentes.map((docente) => (
                              <tr key={docente.id} className="hover:bg-gray-50">
                                <td className="w-48 px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-black truncate">
                                        {docente.full_name || `${docente.first_name || ''} ${docente.last_name || ''}`.trim() || 'Sin nombre'}
                                      </div>
                                      <div className="text-sm text-black">Docente</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="w-64 px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex items-center text-sm text-black">
                                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                      <span className="truncate">{docente.email}</span>
                                    </div>
                                    {docente.phone && (
                                      <div className="flex items-center text-sm text-black">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="truncate">{docente.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="w-48 px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center text-sm text-black">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="truncate">{formatDate(docente.last_sign_in_at)}</span>
                                  </div>
                                </td>
                                <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-black">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {docente.sign_in_count || 0} accesos
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Nuevo Registro Tab */}
                <TabsContent value="nuevo-registro" className="py-0 px-0">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <Plus className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-black">
                          Registro de Nuevo Docente
                        </h3>
                        <p className="text-sm text-black">
                          Complete la información del docente
                        </p>
                      </div>
                    </div>

                    <form className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Tipo de docente:</label>
                        <input 
                          type="text" 
                          value={formData.tipo_docente}
                          onChange={(e) => setFormData({...formData, tipo_docente: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Categoría:</label>
                        <input 
                          type="text" 
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Facultad:</label>
                        <input 
                          type="text" 
                          value={formData.facultad}
                          onChange={(e) => setFormData({...formData, facultad: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Escuela Profesional:</label>
                        <input 
                          type="text" 
                          value={formData.escuela_profesional}
                          onChange={(e) => setFormData({...formData, escuela_profesional: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Fecha de Ingreso:</label>
                        <input 
                          type="date" 
                          value={formData.fecha_ingreso}
                          onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Fecha de Ascenso:</label>
                        <input 
                          type="date" 
                          value={formData.fecha_ascenso}
                          onChange={(e) => setFormData({...formData, fecha_ascenso: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Resolución de Ascenso:</label>
                        <input 
                          type="text" 
                          value={formData.resolucion_ascenso}
                          onChange={(e) => setFormData({...formData, resolucion_ascenso: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Fecha de Contrato:</label>
                        <input 
                          type="date" 
                          value={formData.fecha_contrato}
                          onChange={(e) => setFormData({...formData, fecha_contrato: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Resolución de Contrato:</label>
                        <input 
                          type="text" 
                          value={formData.resolucion_contrato}
                          onChange={(e) => setFormData({...formData, resolucion_contrato: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">DNI:</label>
                        <input 
                          type="text" 
                          value={formData.dni}
                          onChange={(e) => setFormData({...formData, dni: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Código:</label>
                        <input 
                          type="text" 
                          value={formData.codigo}
                          onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Apellidos:</label>
                        <input 
                          type="text" 
                          value={formData.apellidos}
                          onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Nombres:</label>
                        <input 
                          type="text" 
                          value={formData.nombres}
                          onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Nacimiento:</label>
                        <input 
                          type="date" 
                          value={formData.nacimiento}
                          onChange={(e) => setFormData({...formData, nacimiento: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Dirección:</label>
                        <input 
                          type="text" 
                          value={formData.direccion}
                          onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Correo:</label>
                        <input 
                          type="email" 
                          value={formData.correo}
                          onChange={(e) => setFormData({...formData, correo: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Celular:</label>
                        <input 
                          type="text" 
                          value={formData.celular}
                          onChange={(e) => setFormData({...formData, celular: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="w-48 text-sm font-medium text-black">Contraseña:</label>
                        <input 
                          type="password" 
                          value={formData.contrasena}
                          onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                        />
                      </div>
                    </form>

                    <div className="flex justify-end mt-8">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Docente
                      </button>
                    </div>
                  </div>
                </TabsContent>

                {/* Lista Generacional Tab */}
                <TabsContent value="lista-generacional" className="py-0 px-0">
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-black">Lista Generacional de Docentes</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nro
                            </th>
                            <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Escuela Profesional
                            </th>
                            <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Datos Personales
                            </th>
                            <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Edad
                            </th>
                            <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha Nacimiento
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {docentes.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-sm text-black">
                                No hay docentes registrados para mostrar en la lista generacional
                              </td>
                            </tr>
                          ) : (
                            docentes.map((docente, index) => (
                              <tr key={docente.id} className="hover:bg-gray-50">
                                <td className="w-16 px-6 py-4 whitespace-nowrap text-sm text-black">
                                  {index + 1}
                                </td>
                                <td className="w-48 px-6 py-4 whitespace-nowrap text-sm text-black truncate">
                                  -
                                </td>
                                <td className="w-64 px-6 py-4 whitespace-nowrap text-sm text-black truncate">
                                  {docente.full_name || `${docente.first_name || ''} ${docente.last_name || ''}`.trim() || 'Sin nombre'}
                                </td>
                                <td className="w-20 px-6 py-4 whitespace-nowrap text-sm text-black">
                                  -
                                </td>
                                <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-black">
                                  -
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );

      case 'acceso-docentes':
        return (
          <div className="space-y-0 p-0">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">
                      Logs de Accesos Docentes
                    </h3>
                    <p className="text-sm text-black">
                      Registro detallado de accesos y actividad de los docentes
                    </p>
                  </div>
                </div>
                <button
                  onClick={loadAccessLogs}
                  disabled={logsLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {logsLoading ? 'Actualizando...' : 'Actualizar Logs'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{accessLogs.length}</p>
                      <p className="text-sm text-black">Total Logs</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UserCheck className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {accessLogs.filter(log => log.logout_time).length}
                      </p>
                      <p className="text-sm text-black">Sesiones Cerradas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Monitor className="w-8 h-8 text-amber-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-amber-600">
                        {accessLogs.filter(log => !log.logout_time).length}
                      </p>
                      <p className="text-sm text-black">Sesiones Activas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <LogOut className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {accessLogs.filter(log => log.session_duration).length}
                      </p>
                      <p className="text-sm text-black">Con Duración</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-black">Registro de Accesos Detallado</h4>
                </div>
                <div className="overflow-x-auto">
                  {logsLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm text-black">Cargando logs de accesos...</p>
                    </div>
                  ) : accessLogs.length === 0 ? (
                    <div className="p-8 text-center text-sm text-black">
                      No hay logs de accesos registrados
                    </div>
                  ) : (
                    <table className="w-full table-fixed divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                          </th>
                          <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dispositivo
                          </th>
                          <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IP
                          </th>
                          <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha/Hora Ingreso
                          </th>
                          <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha/Hora Salida
                          </th>
                          <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duración
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accessLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="w-48 px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-black truncate">
                                    {log.user_full_name || 'Sin nombre'}
                                  </div>
                                  <div className="text-sm text-black truncate">
                                    {log.user_email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-black">
                                <Monitor className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="truncate">{log.device_info || 'Desconocido'}</span>
                              </div>
                            </td>
                            <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-black">
                              {log.ip_address || 'N/A'}
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-black">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="truncate">{formatDetailedDate(log.login_time)}</span>
                              </div>
                            </td>
                            <td className="w-48 px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-black">
                                <LogOut className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="truncate">{formatDetailedDate(log.logout_time)}</span>
                              </div>
                            </td>
                            <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-black">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                log.session_duration 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {formatDuration(log.session_duration)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        const currentItem = sidebarItems.find(item => item.id === activeSidebarItem);
        return (
          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              DOCENTES - {currentItem?.label}
            </h3>
            <p className="text-gray-600">
              Esta sección está en desarrollo. Contenido próximamente disponible.
            </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex">
      {renderSidebar()}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}