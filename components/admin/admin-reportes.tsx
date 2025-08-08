import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { BarChart3, Settings, MapPin, Users, FileText, Award, Download } from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  totalUsers: number;
  totalTesistas: number;
  totalDocentes: number;
  totalCoordinadores: number;
  totalAdmins: number;
  recentRegistrations: number;
  activeUsers: number;
}

interface AdminReportesProps {
  activeSidebarItem: string;
  setActiveSidebarItem: (item: string) => void;
}

export default function AdminReportes({ activeSidebarItem, setActiveSidebarItem }: AdminReportesProps) {
  const [reportData, setReportData] = useState<ReportData>({
    totalUsers: 0,
    totalTesistas: 0,
    totalDocentes: 0,
    totalCoordinadores: 0,
    totalAdmins: 0,
    recentRegistrations: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(false);

  // Sidebar configuration
  const sidebarItems = [
    { id: 'reportes-admin', label: 'Reportes administración', icon: BarChart3 },
    { id: 'reportes-pi', label: 'Reportes P.I.', icon: Settings },
    { id: 'visitas', label: 'Visitas', icon: MapPin }
  ];

  // Load report data from database
  const loadReportData = async () => {
    setLoading(true);
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get users by role
      const { data: usersByRole, error: roleError } = await supabase
        .from('users')
        .select('selected_role, is_administrator');

      if (roleError) throw roleError;

      const roleCounts = usersByRole?.reduce((acc, user) => {
        if (user.is_administrator) acc.admins++;
        else if (user.selected_role === 'tesista') acc.tesistas++;
        else if (user.selected_role === 'docente') acc.docentes++;
        else if (user.selected_role === 'coordinador') acc.coordinadores++;
        return acc;
      }, { tesistas: 0, docentes: 0, coordinadores: 0, admins: 0 });

      // Get recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentRegistrations } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get active users (those who have signed in)
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .not('last_sign_in_at', 'is', null);

      setReportData({
        totalUsers: totalUsers || 0,
        totalTesistas: roleCounts?.tesistas || 0,
        totalDocentes: roleCounts?.docentes || 0,
        totalCoordinadores: roleCounts?.coordinadores || 0,
        totalAdmins: roleCounts?.admins || 0,
        recentRegistrations: recentRegistrations || 0,
        activeUsers: activeUsers || 0
      });

      toast.success('Datos del reporte actualizados');

    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Error al cargar datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Export report data
  const exportReport = () => {
    const csvData = [
      ['Métrica', 'Valor'],
      ['Total de Usuarios', reportData.totalUsers],
      ['Tesistas', reportData.totalTesistas],
      ['Docentes', reportData.totalDocentes],
      ['Coordinadores', reportData.totalCoordinadores],
      ['Administradores', reportData.totalAdmins],
      ['Registros Recientes (30 días)', reportData.recentRegistrations],
      ['Usuarios Activos', reportData.activeUsers]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_sipet_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte exportado exitosamente');
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-2">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSidebarItem(item.id)}
                className={`w-full flex items-center px-2 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeSidebarItem === item.id
                    ? 'bg-[#002d7a] text-white'
                    : 'text-black hover:bg-[#0039A6] hover:text-white'
                }`}
              >
                <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />
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
      case 'reportes-admin':
        return (
          <div className="space-y-0 p-0">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Reportes de Administración
                    </h3>
                    <p className="text-gray-600">
                      Dashboard general del sistema SIPeT
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={loadReportData}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                  <button
                    onClick={exportReport}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{reportData.totalUsers}</p>
                      <p className="text-sm text-gray-600">Total Usuarios</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{reportData.totalTesistas}</p>
                      <p className="text-sm text-gray-600">Tesistas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-8 h-8 text-amber-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{reportData.totalDocentes}</p>
                      <p className="text-sm text-gray-600">Docentes</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Settings className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{reportData.totalAdmins}</p>
                      <p className="text-sm text-gray-600">Administradores</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Distribución por Roles</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tesistas:</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">{reportData.totalTesistas}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${reportData.totalUsers > 0 ? (reportData.totalTesistas / reportData.totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Docentes:</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">{reportData.totalDocentes}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-amber-600 h-2 rounded-full" 
                            style={{ width: `${reportData.totalUsers > 0 ? (reportData.totalDocentes / reportData.totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Coordinadores:</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">{reportData.totalCoordinadores}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${reportData.totalUsers > 0 ? (reportData.totalCoordinadores / reportData.totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Administradores:</span>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900 mr-2">{reportData.totalAdmins}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${reportData.totalUsers > 0 ? (reportData.totalAdmins / reportData.totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Actividad del Sistema</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usuarios Activos:</span>
                      <span className="font-semibold text-gray-900">{reportData.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasa de Actividad:</span>
                      <span className="font-semibold text-gray-900">
                        {reportData.totalUsers > 0 ? 
                          Math.round((reportData.activeUsers / reportData.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registros Recientes (30d):</span>
                      <span className="font-semibold text-gray-900">{reportData.recentRegistrations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usuarios Inactivos:</span>
                      <span className="font-semibold text-gray-900">
                        {reportData.totalUsers - reportData.activeUsers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'visitas':
        return (
          <div className="space-y-6 p-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Registro de Visitas
                  </h3>
                  <p className="text-gray-600">
                    Monitor de accesos y actividad en el sistema
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{reportData.activeUsers}</div>
                  <div className="text-sm text-gray-600">Visitas Únicas</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Visitas Hoy</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">0</div>
                  <div className="text-sm text-gray-600">Tiempo Promedio</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-center">
                  El sistema de registro de visitas está en desarrollo.
                  <br />
                  Funcionalidad disponible próximamente.
                </p>
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
              REPORTES - {currentItem?.label}
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