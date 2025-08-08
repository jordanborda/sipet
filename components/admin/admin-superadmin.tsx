import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { FileText, Plus, X, Save, AlertCircle, Download, Upload, BarChart3, TrendingUp, Settings, Users, Filter, Search, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ResearchLine {
  id: string;
  research_line_name: string;
  professional_school: string | null;
  faculty: string | null;
  knowledge_area: string | null;
  specializations: string | null;
  responsable_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NewResearchLineForm {
  research_line_name: string;
  professional_school: string;
  faculty: string;
  knowledge_area: string;
  specializations: string;
  is_active: boolean;
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

interface SuperAdminProps {
  activeSidebarItem: string;
  setActiveSidebarItem: (item: string) => void;
}

export default function AdminSuperAdmin({ activeSidebarItem, setActiveSidebarItem }: SuperAdminProps) {
  // Research lines states
  const [researchLines, setResearchLines] = useState<ResearchLine[]>([]);
  const [researchLinesLoading, setResearchLinesLoading] = useState(false);
  const [importingCSV, setImportingCSV] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingLineId, setDeletingLineId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [associatedProjects, setAssociatedProjects] = useState<any[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [hasDependencies, setHasDependencies] = useState(false);
  const [formData, setFormData] = useState<NewResearchLineForm>({
    research_line_name: '',
    professional_school: '',
    faculty: '',
    knowledge_area: '',
    specializations: '',
    is_active: true
  });

  // Autocomplete data
  const [existingData, setExistingData] = useState({
    faculties: [] as string[],
    schools: [] as string[],
    areas: [] as string[]
  });

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState({
    faculties: [] as string[],
    schools: [] as string[],
    areas: [] as string[]
  });

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
    { id: 'lineas-investigacion-admin', label: 'Lineas de Investigación - Admin', icon: FileText },
    { id: 'gestion-usuarios-avanzada', label: 'Gestión Usuarios Avanzada', icon: Users },
    { id: 'configuracion-sistema', label: 'Configuración Sistema', icon: Settings },
    { id: 'reportes-avanzados', label: 'Reportes Avanzados', icon: BarChart3 },
    { id: 'auditoria', label: 'Auditoría', icon: TrendingUp }
  ];

  // Load existing data for autocomplete
  const loadExistingData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('research_lines')
        .select('faculty, professional_school, knowledge_area');

      if (error) throw error;

      const faculties = [...new Set(data?.map(item => item.faculty).filter(Boolean))] as string[];
      const schools = [...new Set(data?.map(item => item.professional_school).filter(Boolean))] as string[];
      const areas = [...new Set(data?.map(item => item.knowledge_area).filter(Boolean))] as string[];

      setExistingData({
        faculties,
        schools,
        areas
      });
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  }, []);

  // Load research lines
  const loadResearchLines = async () => {
    setResearchLinesLoading(true);
    try {
      const { data, error } = await supabase
        .from('research_lines')
        .select('*')
        .order('research_line_name', { ascending: true });

      if (error) throw error;
      setResearchLines(data || []);
      toast.success(`${data?.length || 0} líneas de investigación cargadas`);
    } catch (error) {
      console.error('Error loading research lines:', error);
      toast.error('Error al cargar líneas de investigación');
    } finally {
      setResearchLinesLoading(false);
    }
  };

  // Export research lines to CSV
  const exportResearchLinesToCSV = () => {
    if (researchLines.length === 0) {
      toast.error('No hay líneas de investigación para exportar');
      return;
    }

    const csvHeaders = [
      'Nombre',
      'Escuela Profesional', 
      'Facultad',
      'Área de Conocimiento',
      'Especializaciones',
      'Estado',
      'Fecha Creación'
    ];

    const csvData = researchLines.map(line => [
      line.research_line_name,
      line.professional_school || '',
      line.faculty || '',
      line.knowledge_area || '',
      line.specializations || '',
      line.is_active ? 'Activa' : 'Inactiva',
      new Date(line.created_at).toLocaleDateString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lineas_investigacion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Líneas de investigación exportadas exitosamente');
  };

  // Import research lines from CSV
  const importResearchLinesFromCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Por favor selecciona un archivo CSV válido');
      return;
    }

    setImportingCSV(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error('El archivo CSV debe contener al menos una fila de datos');
          return;
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const importData: Partial<ResearchLine>[] = [];

        for (const line of dataLines) {
          // Parse CSV line handling quoted values
          const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map(val => val.replace(/^"|"$/g, '').trim());

          if (values.length >= 5) {
            importData.push({
              research_line_name: values[0],
              professional_school: values[1] || null,
              faculty: values[2] || null,
              knowledge_area: values[3] || null,
              specializations: values[4] || null,
              is_active: values[5] !== 'Inactiva'
            });
          }
        }

        if (importData.length === 0) {
          toast.error('No se encontraron datos válidos en el archivo CSV');
          return;
        }

        // Insert data into Supabase
        const { error } = await supabase
          .from('research_lines')
          .insert(importData)
          .select();

        if (error) throw error;

        toast.success(`${importData.length} líneas de investigación importadas exitosamente`);
        loadResearchLines(); // Reload the list
        
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast.error('Error al importar el archivo CSV');
      } finally {
        setImportingCSV(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      toast.error('Error al leer el archivo');
      setImportingCSV(false);
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

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

  const filterUsers = useCallback(() => {
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
  }, [users, userFilters]);

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
  }, [userFilters, users, filterUsers]);

  // Handle form changes with autocomplete
  const handleInputChange = (field: keyof NewResearchLineForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Generate suggestions based on field (only for string fields)
    if (typeof value === 'string') {
      if (field === 'faculty') {
        const filtered = existingData.faculties.filter(item => 
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, faculties: filtered }));
      } else if (field === 'professional_school') {
        const filtered = existingData.schools.filter(item => 
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, schools: filtered }));
      } else if (field === 'knowledge_area') {
        const filtered = existingData.areas.filter(item => 
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, areas: filtered }));
      }
    }
  };

  // Select suggestion
  const selectSuggestion = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuggestions(prev => ({ ...prev, [field]: [] }));
  };

  // Clear suggestions
  const clearSuggestions = () => {
    setSuggestions({ faculties: [], schools: [], areas: [] });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      research_line_name: '',
      professional_school: '',
      faculty: '',
      knowledge_area: '',
      specializations: '',
      is_active: true
    });
    clearSuggestions();
  };

  // Create or update research line
  const createResearchLine = async () => {
    if (!formData.faculty.trim()) {
      toast.error('La facultad es requerida');
      return;
    }
    
    if (!formData.professional_school.trim()) {
      toast.error('La escuela profesional es requerida');
      return;
    }
    
    if (!formData.research_line_name.trim()) {
      toast.error('El nombre de la línea de investigación es requerido');
      return;
    }

    setCreating(true);
    try {
      const dataToSave = {
        research_line_name: formData.research_line_name.trim(),
        professional_school: formData.professional_school.trim() || null,
        faculty: formData.faculty.trim() || null,
        knowledge_area: formData.knowledge_area.trim() || null,
        specializations: formData.specializations.trim() || null,
        is_active: formData.is_active
      };

      let error;

      if (editingLineId) {
        // Update existing line
        ({ error } = await supabase
          .from('research_lines')
          .update(dataToSave)
          .eq('id', editingLineId));
        
        if (!error) {
          toast.success('Línea de investigación actualizada exitosamente');
        }
      } else {
        // Create new line
        ({ error } = await supabase
          .from('research_lines')
          .insert(dataToSave)
          .select()
          .single());
        
        if (!error) {
          toast.success('Línea de investigación creada exitosamente');
        }
      }

      if (error) throw error;

      setShowModal(false);
      setEditingLineId(null);
      resetForm();
      
      // Reload existing data for future autocomplete
      loadExistingData();
      
      // Reload research lines
      loadResearchLines();

    } catch (error) {
      console.error('Error saving research line:', error);
      toast.error(`Error al ${editingLineId ? 'actualizar' : 'crear'} la línea de investigación`);
    } finally {
      setCreating(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLineId(null);
    resetForm();
  };

  // Handle edit research line
  const handleEditResearchLine = (lineId: string) => {
    const line = researchLines.find(l => l.id === lineId);
    if (line) {
      setFormData({
        research_line_name: line.research_line_name,
        professional_school: line.professional_school || '',
        faculty: line.faculty || '',
        knowledge_area: line.knowledge_area || '',
        specializations: line.specializations || '',
        is_active: line.is_active
      });
      setEditingLineId(lineId);
      setShowModal(true);
    }
  };

  // Check if research line has associated projects and get project details
  const checkResearchLineDependencies = async (lineId: string) => {
    try {
      const { data, count, error } = await supabase
        .from('thesis_projects')
        .select('id, titulo, estado, created_at', { count: 'exact' })
        .eq('research_line_id', lineId);

      if (error) throw error;
      setAssociatedProjects(data || []);
      const hasProjects = (count || 0) > 0;
      setHasDependencies(hasProjects);
      return count || 0;
    } catch (error) {
      console.error('Error checking dependencies:', error);
      setAssociatedProjects([]);
      setHasDependencies(false);
      return 0;
    }
  };

  // Handle delete research line
  const handleDeleteResearchLine = async (lineId: string) => {
    const dependencyCount = await checkResearchLineDependencies(lineId);
    setDeletingLineId(lineId);
    setProjectCount(dependencyCount);
    setShowDeleteModal(true);
  };

  // Confirm delete research line
  const confirmDeleteResearchLine = async () => {
    if (!deletingLineId) return;

    setDeleting(true);
    try {
      // If there are associated projects, update them to set research_line_id to NULL
      if (hasDependencies && projectCount > 0) {
        // First, update the thesis_projects to set research_line_id to NULL
        const { error: updateError } = await supabase
          .from('thesis_projects')
          .update({ research_line_id: null })
          .eq('research_line_id', deletingLineId);

        if (updateError) {
          console.error('Error updating thesis_projects:', updateError);
          toast.error('Error al actualizar los proyectos asociados');
          return;
        }

        toast.success(`${projectCount} proyecto${projectCount !== 1 ? 's' : ''} actualizado${projectCount !== 1 ? 's' : ''} - línea de investigación removida`);
      }

      // Now delete the research line
      const { error } = await supabase
        .from('research_lines')
        .delete()
        .eq('id', deletingLineId);

      if (error) {
        // If it's still a foreign key constraint error, provide a helpful message
        if (error.code === '23503') {
          toast.error('Error inesperado: aún existen referencias a esta línea de investigación');
          return;
        }
        throw error;
      }

      toast.success('Línea de investigación eliminada exitosamente');
      loadResearchLines();
      setShowDeleteModal(false);
      setDeletingLineId(null);
      setProjectCount(0);
      setAssociatedProjects([]);
      setShowProjects(false);
      setHasDependencies(false);
    } catch (error) {
      console.error('Error deleting research line:', error);
      toast.error('Error al eliminar la línea de investigación');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete research line
  const cancelDeleteResearchLine = () => {
    setShowDeleteModal(false);
    setDeletingLineId(null);
    setProjectCount(0);
    setAssociatedProjects([]);
    setShowProjects(false);
    setHasDependencies(false);
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
      case 'lineas-investigacion-admin':
        return (
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black">Lineas de Investigación - Admin</h3>
                    <p className="text-gray-600">Gestión y administración de líneas de investigación</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={loadResearchLines}
                    disabled={researchLinesLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {researchLinesLoading ? 'Cargando...' : 'Cargar Líneas'}
                  </button>
                  <button
                    onClick={exportResearchLinesToCSV}
                    disabled={researchLines.length === 0}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={importResearchLinesFromCSV}
                      disabled={importingCSV}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button
                      disabled={importingCSV}
                      className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md text-sm hover:bg-amber-700 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {importingCSV ? 'Importando...' : 'Importar CSV'}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear manualmente
                  </button>
                </div>
              </div>

              {/* Research Lines Table */}
              {researchLinesLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando líneas de investigación...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Nombre</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Escuela Profesional</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Facultad</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Área de Conocimiento</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Especializaciones</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Estado</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Creada</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {researchLines.map((line, index) => (
                        <tr key={line.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {/* Nombre */}
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{line.research_line_name}</div>
                          </td>
                          
                          {/* Escuela Profesional */}
                          <td className="px-4 py-3 text-gray-600">
                            {line.professional_school || 'N/A'}
                          </td>

                          {/* Facultad */}
                          <td className="px-4 py-3 text-gray-600">
                            {line.faculty || 'N/A'}
                          </td>

                          {/* Área de Conocimiento */}
                          <td className="px-4 py-3 text-gray-600">
                            {line.knowledge_area || 'N/A'}
                          </td>

                          {/* Especializaciones */}
                          <td className="px-4 py-3 text-gray-600">
                            {line.specializations ? (
                              <div className="max-w-xs">
                                <p className="text-sm truncate" title={line.specializations}>
                                  {line.specializations}
                                </p>
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>

                          {/* Estado */}
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              line.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {line.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>

                          {/* Fecha de Creación */}
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(line.created_at).toLocaleDateString()}
                          </td>

                          {/* Acciones */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEditResearchLine(line.id)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                                title="Editar línea de investigación"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResearchLine(line.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                title="Eliminar línea de investigación"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Empty State */}
                  {researchLines.length === 0 && !researchLinesLoading && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No hay líneas de investigación cargadas</p>
                      <p className="text-gray-500 text-sm">Haz clic en &quot;Cargar Líneas&quot; para ver las líneas de investigación</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'gestion-usuarios-avanzada':
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
                    <h3 className="text-xl font-semibold text-black">Gestión Usuarios Avanzada</h3>
                    <p className="text-gray-600">Administrar roles y permisos de usuarios del sistema</p>
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
                      Tienes cambios sin guardar. Haz clic en &quot;Guardar Cambios&quot; para aplicar las modificaciones.
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
                      <p className="text-gray-500 text-sm">Haz clic en &quot;Cargar Usuarios&quot; para ver los usuarios</p>
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
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              SUPERADMIN - {currentItem?.label}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingLineId ? 'Editar Línea de Investigación' : 'Crear Nueva Línea de Investigación'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {editingLineId ? 'Modifique los campos necesarios' : 'Complete los campos para registrar una nueva línea'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Required Field Notice */}
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Los campos Facultad, Escuela Profesional y Nombre son obligatorios
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Facultad (Required - First) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facultad *
                  </label>
                  <input
                    type="text"
                    value={formData.faculty}
                    onChange={(e) => handleInputChange('faculty', e.target.value)}
                    onFocus={() => handleInputChange('faculty', formData.faculty)}
                    onBlur={() => setTimeout(clearSuggestions, 200)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Ej: Ingeniería"
                    required
                  />
                  {suggestions.faculties.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {suggestions.faculties.map((faculty, index) => (
                        <button
                          key={index}
                          onClick={() => selectSuggestion('faculty', faculty)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          {faculty}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Escuela Profesional (Required - Second) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escuela Profesional *
                  </label>
                  <input
                    type="text"
                    value={formData.professional_school}
                    onChange={(e) => handleInputChange('professional_school', e.target.value)}
                    onFocus={() => handleInputChange('professional_school', formData.professional_school)}
                    onBlur={() => setTimeout(clearSuggestions, 200)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Ej: Ingeniería de Sistemas"
                    required
                  />
                  {suggestions.schools.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {suggestions.schools.map((school, index) => (
                        <button
                          key={index}
                          onClick={() => selectSuggestion('professional_school', school)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          {school}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nombre (Required - Third) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Línea de Investigación *
                  </label>
                  <input
                    type="text"
                    value={formData.research_line_name}
                    onChange={(e) => handleInputChange('research_line_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Ej: Inteligencia Artificial y Machine Learning"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Área de Conocimiento */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área de Conocimiento
                    </label>
                    <input
                      type="text"
                      value={formData.knowledge_area}
                      onChange={(e) => handleInputChange('knowledge_area', e.target.value)}
                      onFocus={() => handleInputChange('knowledge_area', formData.knowledge_area)}
                      onBlur={() => setTimeout(clearSuggestions, 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="Ej: Tecnologías de la Información"
                    />
                    {suggestions.areas.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.areas.map((area, index) => (
                          <button
                            key={index}
                            onClick={() => selectSuggestion('knowledge_area', area)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => handleInputChange('is_active', e.target.value === 'active')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                    </select>
                  </div>
                </div>

                {/* Especializaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especializaciones
                  </label>
                  <textarea
                    value={formData.specializations}
                    onChange={(e) => handleInputChange('specializations', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    placeholder="Ej: Machine Learning, Deep Learning, Computer Vision (opcional)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separar especialidades con comas
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={handleCloseModal}
                disabled={creating}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createResearchLine}
                disabled={creating || !formData.research_line_name.trim() || !formData.faculty.trim() || !formData.professional_school.trim()}
                className="flex items-center px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {creating 
                  ? (editingLineId ? 'Actualizando...' : 'Creando...') 
                  : (editingLineId ? 'Actualizar Línea' : 'Crear Línea')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Confirmar Eliminación
                  </h2>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar la línea de investigación{' '}
                <span className="font-semibold text-gray-900">
                  &quot;{researchLines.find(l => l.id === deletingLineId)?.research_line_name}&quot;
                </span>
                ?
              </p>

              {/* Show warning about associated projects */}
              {hasDependencies ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium mb-1">
                        ⚠️ Hay {projectCount} proyecto{projectCount !== 1 ? 's' : ''} de tesis con esta línea de investigación
                      </p>
                      <p className="text-sm text-yellow-700 mb-2">
                        Si continúa, la línea de investigación será removida de {projectCount === 1 ? 'este proyecto' : 'estos proyectos'} 
                        (se pondrá como nula) antes de eliminar la línea.
                      </p>
                      <p className="text-sm text-yellow-700 font-medium">
                        ¿Desea continuar?
                      </p>
                      <button
                        onClick={() => setShowProjects(!showProjects)}
                        className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 font-medium underline focus:outline-none"
                      >
                        {showProjects ? 'Ocultar proyectos' : 'Ver proyectos asociados'}
                      </button>
                      {showProjects && (
                        <div className="mt-3 bg-white rounded-md p-3 border border-yellow-200">
                          <p className="text-sm font-medium text-gray-900 mb-2">Proyectos asociados:</p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {associatedProjects.map((project) => (
                              <div key={project.id} className="text-sm text-gray-700 p-2 bg-gray-50 rounded border-l-2 border-yellow-300">
                                <div className="font-medium">{project.titulo || 'Sin título'}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Estado: {project.estado || 'N/A'} • Creado: {new Date(project.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-800">
                      Esta acción eliminará permanentemente la línea de investigación del sistema.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={cancelDeleteResearchLine}
                disabled={deleting}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteResearchLine}
                disabled={deleting}
                className="flex items-center px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? 'Eliminando...' : (hasDependencies ? 'Sí, Continuar' : 'Eliminar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}