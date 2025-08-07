import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { BarChart3, TrendingUp, Settings, MapPin, Calendar, Users, FileText, Award, Download, Filter, Search, Check, X, Save, AlertCircle } from "lucide-react";
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

interface UserManagement {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  dni: string | null;
  phone: string | null;
  created_at: string;
  is_student: boolean;
  is_advisor: boolean;
  is_reviewer: boolean;
  is_coordinator: boolean;
  is_administrator: boolean;
}

interface UserFilters {
  search: string;
  roleFilter: string;
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
  const [dateFilter, setDateFilter] = useState('all');

  // User management states
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserManagement[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState<UserFilters>({
    search: '',
    roleFilter: 'all'
  });
  const [pendingRoleChanges, setPendingRoleChanges] = useState<{[userId: string]: Partial<UserManagement>}>({});
  const [savingChanges, setSavingChanges] = useState(false);

  // Sidebar configuration
  const sidebarItems = [
    { id: 'reportes-admin', label: 'Reportes administración', icon: BarChart3 },
    { id: 'lineas-investigacion', label: 'Líneas de investigación', icon: TrendingUp },
    { id: 'reportes-pi', label: 'Reportes P.I.', icon: Settings },
    { id: 'visitas', label: 'Visitas', icon: MapPin },
    { id: 'gestionar-usuarios', label: 'Gestionar Usuarios', icon: Users }
  ];

  // User management functions
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          full_name,
          dni,
          phone,
          created_at,
          is_student,
          is_advisor,
          is_reviewer,
          is_coordinator,
          is_administrator
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
      toast.success(`${data?.length || 0} usuarios cargados`);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setUsersLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (userFilters.search.trim()) {
      const searchTerm = userFilters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.full_name?.toLowerCase().includes(searchTerm) ||
        user.first_name?.toLowerCase().includes(searchTerm) ||
        user.last_name?.toLowerCase().includes(searchTerm) ||
        user.dni?.toLowerCase().includes(searchTerm)
      );
    }

    // Role filter
    if (userFilters.roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (userFilters.roleFilter) {
          case 'student': return user.is_student;
          case 'advisor': return user.is_advisor;
          case 'reviewer': return user.is_reviewer;
          case 'coordinator': return user.is_coordinator;
          case 'administrator': return user.is_administrator;
          default: return true;
        }
      });
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = (userId: string, role: keyof UserManagement, value: boolean) => {
    setPendingRoleChanges(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [role]: value
      }
    }));

    // Update local state for immediate UI feedback
    setFilteredUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, [role]: value } : user
    ));
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, [role]: value } : user
    ));
  };

  const saveRoleChanges = async () => {
    setSavingChanges(true);
    try {
      for (const [userId, changes] of Object.entries(pendingRoleChanges)) {
        const { error } = await supabase
          .from('users')
          .update(changes)
          .eq('id', userId);

        if (error) throw error;
      }

      setPendingRoleChanges({});
      toast.success('Roles actualizados exitosamente');
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('Error al actualizar los roles');
    } finally {
      setSavingChanges(false);
    }
  };

  const hasPendingChanges = Object.keys(pendingRoleChanges).length > 0;

  // Effects
  useEffect(() => {
    filterUsers();
  }, [userFilters, users]);

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

      case 'gestionar-usuarios':
        return (
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black">Gestionar Usuarios</h3>
                    <p className="text-gray-600">Administrar roles y permisos de usuarios</p>
                  </div>
                </div>
                {hasPendingChanges && (
                  <button
                    onClick={saveRoleChanges}
                    disabled={savingChanges}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savingChanges ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Search Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido, DNI o correo..."
                    value={userFilters.search}
                    onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={userFilters.roleFilter}
                    onChange={(e) => setUserFilters(prev => ({ ...prev, roleFilter: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all" className="text-black">Todos los roles</option>
                    <option value="student" className="text-black">Estudiantes</option>
                    <option value="advisor" className="text-black">Asesores</option>
                    <option value="reviewer" className="text-black">Revisores</option>
                    <option value="coordinator" className="text-black">Coordinadores</option>
                    <option value="administrator" className="text-black">Administradores</option>
                  </select>
                </div>
              </div>

              {/* Load Users Button */}
              <div className="mb-4">
                <button
                  onClick={loadUsers}
                  disabled={usersLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {usersLoading ? 'Cargando...' : 'Cargar Usuarios'}
                </button>
              </div>

              {/* Pending Changes Alert */}
              {hasPendingChanges && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicar las modificaciones.
                    </p>
                  </div>
                </div>
              )}

              {/* Stats */}
              {users.length > 0 && (
                <div className="mb-4 bg-gray-600 rounded-lg px-4 py-2">
                  <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-white">
                    <span className="flex items-center">
                      <span className="font-semibold text-blue-300">{users.filter(u => u.is_student).length}</span>
                      <span className="ml-1">Estudiantes</span>
                    </span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span className="flex items-center">
                      <span className="font-semibold text-green-300">{users.filter(u => u.is_advisor).length}</span>
                      <span className="ml-1">Asesores</span>
                    </span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span className="flex items-center">
                      <span className="font-semibold text-purple-300">{users.filter(u => u.is_reviewer).length}</span>
                      <span className="ml-1">Revisores</span>
                    </span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span className="flex items-center">
                      <span className="font-semibold text-yellow-300">{users.filter(u => u.is_coordinator).length}</span>
                      <span className="ml-1">Coordinadores</span>
                    </span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span className="flex items-center">
                      <span className="font-semibold text-red-300">{users.filter(u => u.is_administrator).length}</span>
                      <span className="ml-1">Administradores</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Users Table */}
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Usuario</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">DNI</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Teléfono</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Registro</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Estudiante</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Asesor</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Revisor</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Coordinador</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Administrador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {/* User Info */}
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}</div>
                              <div className="text-gray-600 text-xs">{user.email}</div>
                            </div>
                          </td>
                          
                          {/* DNI */}
                          <td className="px-4 py-3 text-gray-600">
                            {user.dni || 'N/A'}
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3 text-gray-600">
                            {user.phone || 'N/A'}
                          </td>

                          {/* Registration Date */}
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>

                          {/* Student Role */}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={user.is_student}
                              onChange={(e) => handleRoleChange(user.id, 'is_student', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>

                          {/* Advisor Role */}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={user.is_advisor}
                              onChange={(e) => handleRoleChange(user.id, 'is_advisor', e.target.checked)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          </td>

                          {/* Reviewer Role */}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={user.is_reviewer}
                              onChange={(e) => handleRoleChange(user.id, 'is_reviewer', e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                          </td>

                          {/* Coordinator Role */}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={user.is_coordinator}
                              onChange={(e) => handleRoleChange(user.id, 'is_coordinator', e.target.checked)}
                              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                            />
                          </td>

                          {/* Administrator Role */}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={user.is_administrator}
                              onChange={(e) => handleRoleChange(user.id, 'is_administrator', e.target.checked)}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* No Results */}
                  {filteredUsers.length === 0 && users.length > 0 && (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No se encontraron usuarios con los criterios de búsqueda</p>
                    </div>
                  )}

                  {/* Empty State */}
                  {users.length === 0 && !usersLoading && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No hay usuarios cargados</p>
                      <p className="text-gray-500 text-sm">Haz clic en "Cargar Usuarios" para ver los usuarios</p>
                    </div>
                  )}
                </div>
              )}
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