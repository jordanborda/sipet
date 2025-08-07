import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Home, FileText, File, Award, XCircle, Clock, Calendar, Settings, User, CheckCircle, AlertCircle, BarChart3, TrendingUp, Search, Filter, RotateCcw, Eye, Edit, Trash2 } from "lucide-react";

interface TesistaUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  selected_role: string | null;
  created_at: string;
  student_id: string | null;
  student_status: string | null;
  academic_level: string | null;
  major: string | null;
}

interface TramiteStats {
  totalTramites: number;
  proyectosTesis: {
    total: number;
    enCurso: number;
    aprobados: number;
  };
  borradoresTesis: {
    total: number;
    enCurso: number;
    aprobados: number;
  };
  sustentaciones: {
    total: number;
    enCurso: number;
    aprobados: number;
  };
}

interface ProyectoTesis {
  id: string;
  codigo: string;
  tesista_id: string;
  tesista_name: string;
  titulo: string;
  estado: string;
  carrera: string;
  nombre_jurado: string;
  fecha_creacion: string;
  fecha_modificacion: string;
}

interface ProyectoFilters {
  estado: string;
  carrera: string;
  nombreJurado: string;
  codigo: string;
}

interface BorradorTesis {
  id: string;
  codigo: string;
  tesista_id: string;
  tesista_name: string;
  titulo: string;
  estado: string;
  carrera: string;
  nombre_jurado: string;
  fecha_creacion: string;
  fecha_modificacion: string;
}

interface BorradorFilters {
  estado: string;
  carrera: string;
  nombreJurado: string;
  codigo: string;
}

interface Sustentacion {
  id: string;
  codigo: string;
  tesista_id: string;
  tesista_name: string;
  titulo: string;
  carrera: string;
  nombre_jurado: string;
  fecha_sustentacion: string;
  fecha_programada: string;
  nota_final?: number;
}

interface SustentacionFilters {
  carrera: string;
  nombreJurado: string;
  codigo: string;
}

interface SearchedTesista {
  id: string;
  dni: string;
  codigo_matricula: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  student_id: string | null;
  major: string | null;
  phone: string | null;
  created_at: string;
  is_active: boolean;
  proyecto?: {
    id: string;
    codigo: string;
    titulo: string;
    estado: string;
    linea_investigacion: string;
    fecha_inicio_proyecto: string;
    fecha_inicio_borrador: string;
    fecha_ultima: string;
    dias_transcurridos: number;
    en_ejecucion: boolean;
  };
}

interface TramiteLog {
  id: string;
  tesista_id: string;
  proyecto_id: string;
  estado_anterior: string;
  estado_nuevo: string;
  descripcion: string;
  fecha_cambio: string;
  usuario_id: string;
  usuario_nombre: string;
}

interface RechazadoTesis {
  id: string;
  codigo: string;
  tesista_id: string;
  tesista_name: string;
  titulo: string;
  tipo: 'Proyecto' | 'Borrador';
  carrera: string;
  nombre_jurado: string;
  fecha_rechazo: string;
  motivo_rechazo: string;
}

interface RechazadoFilters {
  carrera: string;
  nombreJurado: string;
  codigo: string;
}

interface CaducadoTesis {
  id: string;
  codigo: string;
  tesista_id: string;
  tesista_name: string;
  titulo: string;
  tipo: 'Proyecto' | 'Borrador';
  carrera: string;
  nombre_jurado: string;
  fecha_caducidad: string;
  dias_vencido: number;
}

interface CaducadoFilters {
  carrera: string;
  nombreJurado: string;
  codigo: string;
}

interface ProyectoAmpliado {
  id: string;
  codigo: string;
  tesista_id: string;
  tesista_name: string;
  carrera: string;
  estado_borrador: string;
  estado: string;
  fecha_ampliacion: string;
  dias_transcurridos: number;
  dias_restantes: number;
  titulo: string;
}

interface AmpliadoFilters {
  carrera: string;
  nombreJurado: string;
  codigo: string;
}

interface TiempoTesis {
  id: string;
  codigo: string;
  tesista_id: string;
  tesista_name: string;
  carrera: string;
  estado_borrador: string;
  estado: string;
  fecha_inicio: string;
  dias_transcurridos: number;
  dias_restantes: number;
  titulo: string;
}

interface TiempoFilters {
  carrera: string;
  nombreJurado: string;
  codigo: string;
}

interface AdminTesistaProps {
  activeSidebarItem: string;
  setActiveSidebarItem: (item: string) => void;
}

export default function AdminTesista({ activeSidebarItem, setActiveSidebarItem }: AdminTesistaProps) {
  const [tesistas, setTesistas] = useState<TesistaUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTesista, setSelectedTesista] = useState<TesistaUser | null>(null);
  const [tramiteStats, setTramiteStats] = useState<TramiteStats>({
    totalTramites: 0,
    proyectosTesis: { total: 0, enCurso: 0, aprobados: 0 },
    borradoresTesis: { total: 0, enCurso: 0, aprobados: 0 },
    sustentaciones: { total: 0, enCurso: 0, aprobados: 0 }
  });
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Proyecto de Tesis data and filters
  const [proyectos, setProyectos] = useState<ProyectoTesis[]>([]);
  const [filteredProyectos, setFilteredProyectos] = useState<ProyectoTesis[]>([]);
  const [proyectosLoading, setProyectosLoading] = useState(false);
  const [filters, setFilters] = useState<ProyectoFilters>({
    estado: 'todos',
    carrera: 'todos',
    nombreJurado: '',
    codigo: ''
  });

  // Borrador de Tesis data and filters
  const [borradores, setBorradores] = useState<BorradorTesis[]>([]);
  const [filteredBorradores, setFilteredBorradores] = useState<BorradorTesis[]>([]);
  const [borradoresLoading, setBorradoresLoading] = useState(false);
  const [borradorFilters, setBorradorFilters] = useState<BorradorFilters>({
    estado: 'todos',
    carrera: 'todos',
    nombreJurado: '',
    codigo: ''
  });

  // Sustentaciones data and filters
  const [sustentaciones, setSustentaciones] = useState<Sustentacion[]>([]);
  const [filteredSustentaciones, setFilteredSustentaciones] = useState<Sustentacion[]>([]);
  const [sustentacionesLoading, setSustentacionesLoading] = useState(false);
  const [sustentacionFilters, setSustentacionFilters] = useState<SustentacionFilters>({
    carrera: 'todos',
    nombreJurado: '',
    codigo: ''
  });

  // Rechazados data and filters
  const [rechazados, setRechazados] = useState<RechazadoTesis[]>([]);
  const [filteredRechazados, setFilteredRechazados] = useState<RechazadoTesis[]>([]);
  const [rechazadosLoading, setRechazadosLoading] = useState(false);
  const [rechazadoFilters, setRechazadoFilters] = useState<RechazadoFilters>({
    carrera: 'todos',
    nombreJurado: '',
    codigo: ''
  });

  // Caducados data and filters
  const [caducados, setCaducados] = useState<CaducadoTesis[]>([]);
  const [filteredCaducados, setFilteredCaducados] = useState<CaducadoTesis[]>([]);
  const [caducadosLoading, setCaducadosLoading] = useState(false);
  const [caducadoFilters, setCaducadoFilters] = useState<CaducadoFilters>({
    carrera: 'todos',
    nombreJurado: '',
    codigo: ''
  });

  // Ampliados data and filters
  const [ampliados, setAmpliados] = useState<ProyectoAmpliado[]>([]);
  const [filteredAmpliados, setFilteredAmpliados] = useState<ProyectoAmpliado[]>([]);
  const [ampliadosLoading, setAmpliadosLoading] = useState(false);
  const [ampliadoFilters, setAmpliadoFilters] = useState<AmpliadoFilters>({
    carrera: 'todos',
    nombreJurado: '',
    codigo: ''
  });

  // Tiempos data and filters
  const [tiempos, setTiempos] = useState<TiempoTesis[]>([]);
  const [filteredTiempos, setFilteredTiempos] = useState<TiempoTesis[]>([]);
  const [tiemposLoading, setTiemposLoading] = useState(false);
  const [tiempoFilters, setTiempoFilters] = useState<TiempoFilters>({
    carrera: 'todos',
    nombreJurado: '',
    codigo: ''
  });

  // Search Tesista states
  const [searchProjectCode, setSearchProjectCode] = useState('');
  const [searchDniOrName, setSearchDniOrName] = useState('');
  const [searchedTesista, setSearchedTesista] = useState<SearchedTesista | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tramiteLogs, setTramiteLogs] = useState<TramiteLog[]>([]);

  // Sidebar configuration
  const sidebarItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'buscar-tesista', label: 'Buscar Tesista', icon: Search },
    { id: 'proyectos-tesis', label: 'Proyecto de tesis', icon: FileText },
    { id: 'borrador-tesis', label: 'Borrador de tesis', icon: File },
    { id: 'sustentaciones', label: 'Sustentaciones', icon: Award },
    { id: 'rechazados', label: 'Proy/borr. rechazados', icon: XCircle },
    { id: 'caducados', label: 'Proy/borr. caducados', icon: Clock },
    { id: 'ampliados', label: 'Proyectos ampliados', icon: Calendar },
    { id: 'tiempos', label: 'Ver tiempos', icon: Clock }
  ];

  // Search functions
  const searchTesistaByProjectCode = async (projectCode: string) => {
    if (!projectCode.trim()) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('thesis_projects')
        .select(`
          id,
          titulo,
          estado,
          fecha_carga,
          estudiante_principal_id,
          research_lines!inner(nombre),
          users!inner(
            id,
            dni,
            codigo_matricula,
            email,
            first_name,
            last_name,
            full_name,
            student_id,
            major,
            phone,
            created_at
          )
        `)
        .or(`id.eq.${projectCode},titulo.ilike.%${projectCode}%`)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const tesista: SearchedTesista = {
          id: data.users.id,
          dni: data.users.dni || '',
          codigo_matricula: data.users.codigo_matricula || '',
          email: data.users.email,
          first_name: data.users.first_name,
          last_name: data.users.last_name,
          full_name: data.users.full_name,
          student_id: data.users.student_id,
          major: data.users.major,
          phone: data.users.phone,
          created_at: data.users.created_at,
          is_active: true,
          proyecto: {
            id: data.id,
            codigo: projectCode,
            titulo: data.titulo,
            estado: data.estado,
            linea_investigacion: data.research_lines?.nombre || '',
            fecha_inicio_proyecto: data.fecha_carga,
            fecha_inicio_borrador: '',
            fecha_ultima: data.fecha_carga,
            dias_transcurridos: Math.floor((new Date().getTime() - new Date(data.fecha_carga).getTime()) / (1000 * 3600 * 24)),
            en_ejecucion: data.estado === 'en_curso'
          }
        };
        
        setSearchedTesista(tesista);
        await loadTramiteLogs(tesista.id);
      }
    } catch (error) {
      console.error('Error searching by project code:', error);
      setSearchedTesista(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchTesistaByDniOrName = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          dni,
          codigo_matricula,
          email,
          first_name,
          last_name,
          full_name,
          student_id,
          major,
          phone,
          created_at,
          thesis_projects!left(
            id,
            titulo,
            estado,
            fecha_carga,
            research_lines!inner(nombre)
          )
        `)
        .or(`dni.eq.${searchTerm},last_name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .eq('selected_role', 'tesista')
        .single();
      
      if (error) throw error;
      
      if (data) {
        const proyecto = data.thesis_projects?.[0];
        const tesista: SearchedTesista = {
          id: data.id,
          dni: data.dni || '',
          codigo_matricula: data.codigo_matricula || '',
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: data.full_name,
          student_id: data.student_id,
          major: data.major,
          phone: data.phone,
          created_at: data.created_at,
          is_active: true,
          proyecto: proyecto ? {
            id: proyecto.id,
            codigo: proyecto.id,
            titulo: proyecto.titulo,
            estado: proyecto.estado,
            linea_investigacion: proyecto.research_lines?.nombre || '',
            fecha_inicio_proyecto: proyecto.fecha_carga,
            fecha_inicio_borrador: '',
            fecha_ultima: proyecto.fecha_carga,
            dias_transcurridos: Math.floor((new Date().getTime() - new Date(proyecto.fecha_carga).getTime()) / (1000 * 3600 * 24)),
            en_ejecucion: proyecto.estado === 'en_curso'
          } : undefined
        };
        
        setSearchedTesista(tesista);
        await loadTramiteLogs(tesista.id);
      }
    } catch (error) {
      console.error('Error searching by DNI or name:', error);
      setSearchedTesista(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadTramiteLogs = async (tesistaId: string) => {
    try {
      const { data, error } = await supabase
        .from('tram_thesis_log')
        .select('*')
        .eq('tesista_id', tesistaId)
        .order('fecha_cambio', { ascending: false });
      
      if (error) throw error;
      setTramiteLogs(data || []);
    } catch (error) {
      console.error('Error loading tramite logs:', error);
      setTramiteLogs([]);
    }
  };

  const handleTesistaAction = async (action: string) => {
    if (!searchedTesista) return;
    
    // Handle different actions
    switch (action) {
      case 'renunciar':
        console.log('Renunciar tesista:', searchedTesista.id);
        break;
      case 'habilitar':
        console.log('Habilitar tesista:', searchedTesista.id);
        break;
      case 'habilitar_borrador':
        console.log('Habilitar borrador:', searchedTesista.id);
        break;
      case 'agregar_ampliacion':
        console.log('Agregar ampliación:', searchedTesista.id);
        break;
      case 'cambiar_datos':
        console.log('Cambiar datos:', searchedTesista.id);
        break;
      case 'cambiar_titulo':
        console.log('Cambiar título:', searchedTesista.id);
        break;
      case 'log_tramite':
        console.log('Log trámite:', searchedTesista.id);
        break;
      case 'desactivar':
        console.log('Desactivar tesista:', searchedTesista.id);
        break;
      default:
        break;
    }
  };

  // Load tesistas from database
  const loadTesistas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, full_name, selected_role, created_at, student_id, student_status, academic_level, major')
        .eq('selected_role', 'tesista')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTesistas(data || []);
    } catch (error) {
      console.error('Error loading tesistas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tramites statistics (simulated data for now)
  const loadTramiteStats = async () => {
    setStatsLoading(true);
    try {
      // For now, we'll simulate the data since the tables might not exist yet
      // In a real implementation, you would query the actual tramites tables
      
      // Simulate some realistic data based on tesistas count
      const tesistaCount = tesistas.length;
      const proyectosTotal = Math.floor(tesistaCount * 0.8); // 80% have projects
      const borradorTotal = Math.floor(tesistaCount * 0.4); // 40% have drafts
      const sustentacionTotal = Math.floor(tesistaCount * 0.2); // 20% have defenses
      
      const newStats: TramiteStats = {
        totalTramites: proyectosTotal + borradorTotal + sustentacionTotal,
        proyectosTesis: {
          total: proyectosTotal,
          enCurso: Math.floor(proyectosTotal * 0.7),
          aprobados: Math.floor(proyectosTotal * 0.3)
        },
        borradoresTesis: {
          total: borradorTotal,
          enCurso: Math.floor(borradorTotal * 0.6),
          aprobados: Math.floor(borradorTotal * 0.4)
        },
        sustentaciones: {
          total: sustentacionTotal,
          enCurso: Math.floor(sustentacionTotal * 0.5),
          aprobados: Math.floor(sustentacionTotal * 0.5)
        }
      };
      
      setTramiteStats(newStats);
    } catch (error) {
      console.error('Error loading tramite stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadTesistas();
  }, []);

  useEffect(() => {
    if (tesistas.length > 0) {
      loadTramiteStats();
    }
  }, [tesistas]);

  // Load proyectos de tesis (simulated data for now)
  const loadProyectos = async () => {
    setProyectosLoading(true);
    try {
      // Simulated data for proyectos de tesis
      const simulatedProyectos: ProyectoTesis[] = [
        {
          id: '1',
          codigo: 'PT-2024-001',
          tesista_id: '1',
          tesista_name: 'Ana García Rodríguez',
          titulo: 'Sistema de Gestión Académica basado en Inteligencia Artificial',
          estado: 'En Curso',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_creacion: '2024-01-15',
          fecha_modificacion: '2024-07-20'
        },
        {
          id: '2',
          codigo: 'PT-2024-002',
          tesista_id: '2',
          tesista_name: 'Luis Fernando Torres',
          titulo: 'Aplicación Móvil para el Control de Inventarios',
          estado: 'Aprobado',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Mg. María Gonzales',
          fecha_creacion: '2024-02-10',
          fecha_modificacion: '2024-06-15'
        },
        {
          id: '3',
          codigo: 'PT-2024-003',
          tesista_id: '3',
          tesista_name: 'Carmen Elena Vásquez',
          titulo: 'Plataforma Web para Gestión de Recursos Humanos',
          estado: 'En Revisión',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Roberto Silva',
          fecha_creacion: '2024-03-05',
          fecha_modificacion: '2024-08-01'
        },
        {
          id: '4',
          codigo: 'PT-2024-004',
          tesista_id: '4',
          tesista_name: 'José Miguel Herrera',
          titulo: 'Sistema de Monitoreo IoT para Agricultura de Precisión',
          estado: 'En Curso',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Ing. Patricia López',
          fecha_creacion: '2024-01-20',
          fecha_modificacion: '2024-07-30'
        },
        {
          id: '5',
          codigo: 'PT-2024-005',
          tesista_id: '5',
          tesista_name: 'Sandra Isabel Morales',
          titulo: 'Análisis de Datos para Predicción de Ventas usando Machine Learning',
          estado: 'Rechazado',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_creacion: '2024-04-12',
          fecha_modificacion: '2024-05-25'
        }
      ];
      
      setProyectos(simulatedProyectos);
      setFilteredProyectos(simulatedProyectos);
    } catch (error) {
      console.error('Error loading proyectos:', error);
    } finally {
      setProyectosLoading(false);
    }
  };

  // Filter proyectos based on current filters
  const applyFilters = () => {
    let filtered = [...proyectos];

    // Filter by estado
    if (filters.estado !== 'todos') {
      filtered = filtered.filter(proyecto => proyecto.estado === filters.estado);
    }

    // Filter by carrera
    if (filters.carrera !== 'todos') {
      filtered = filtered.filter(proyecto => proyecto.carrera === filters.carrera);
    }

    // Filter by nombre jurado
    if (filters.nombreJurado.trim()) {
      filtered = filtered.filter(proyecto => 
        proyecto.nombre_jurado.toLowerCase().includes(filters.nombreJurado.toLowerCase())
      );
    }

    // Filter by codigo
    if (filters.codigo.trim()) {
      filtered = filtered.filter(proyecto => 
        proyecto.codigo.toLowerCase().includes(filters.codigo.toLowerCase())
      );
    }

    setFilteredProyectos(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      estado: 'todos',
      carrera: 'todos',
      nombreJurado: '',
      codigo: ''
    });
    setFilteredProyectos(proyectos);
  };

  // Load proyectos when component mounts
  useEffect(() => {
    loadProyectos();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, proyectos]);

  // Load borradores de tesis (simulated data for now)
  const loadBorradores = async () => {
    setBorradoresLoading(true);
    try {
      // Simulated data for borradores de tesis
      const simulatedBorradores: BorradorTesis[] = [
        {
          id: '1',
          codigo: 'BT-2024-001',
          tesista_id: '1',
          tesista_name: 'Ana García Rodríguez',
          titulo: 'Sistema de Gestión Académica basado en Inteligencia Artificial - Borrador Final',
          estado: 'En Revisión',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_creacion: '2024-06-15',
          fecha_modificacion: '2024-08-02'
        },
        {
          id: '2',
          codigo: 'BT-2024-002',
          tesista_id: '2',
          tesista_name: 'Luis Fernando Torres',
          titulo: 'Aplicación Móvil para el Control de Inventarios - Documento Final',
          estado: 'Aprobado',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Mg. María Gonzales',
          fecha_creacion: '2024-07-10',
          fecha_modificacion: '2024-08-01'
        },
        {
          id: '3',
          codigo: 'BT-2024-003',
          tesista_id: '3',
          tesista_name: 'Carmen Elena Vásquez',
          titulo: 'Plataforma Web para Gestión de Recursos Humanos - Primera Versión',
          estado: 'En Curso',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Roberto Silva',
          fecha_creacion: '2024-07-05',
          fecha_modificacion: '2024-08-04'
        },
        {
          id: '4',
          codigo: 'BT-2024-004',
          tesista_id: '4',
          tesista_name: 'José Miguel Herrera',
          titulo: 'Sistema de Monitoreo IoT para Agricultura de Precisión - Borrador Completo',
          estado: 'Observado',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Ing. Patricia López',
          fecha_creacion: '2024-06-20',
          fecha_modificacion: '2024-07-28'
        },
        {
          id: '5',
          codigo: 'BT-2024-005',
          tesista_id: '5',
          tesista_name: 'María José Ramírez',
          titulo: 'Desarrollo de Sistema Web para Comercio Electrónico - Versión Beta',
          estado: 'En Revisión',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_creacion: '2024-07-15',
          fecha_modificacion: '2024-08-03'
        },
        {
          id: '6',
          codigo: 'BT-2024-006',
          tesista_id: '6',
          tesista_name: 'Roberto Carlos Díaz',
          titulo: 'Análisis y Diseño de Red de Telecomunicaciones - Documento Técnico',
          estado: 'Rechazado',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Ing. Patricia López',
          fecha_creacion: '2024-05-12',
          fecha_modificacion: '2024-06-25'
        }
      ];
      
      setBorradores(simulatedBorradores);
      setFilteredBorradores(simulatedBorradores);
    } catch (error) {
      console.error('Error loading borradores:', error);
    } finally {
      setBorradoresLoading(false);
    }
  };

  // Filter borradores based on current filters
  const applyBorradorFilters = () => {
    let filtered = [...borradores];

    // Filter by estado
    if (borradorFilters.estado !== 'todos') {
      filtered = filtered.filter(borrador => borrador.estado === borradorFilters.estado);
    }

    // Filter by carrera
    if (borradorFilters.carrera !== 'todos') {
      filtered = filtered.filter(borrador => borrador.carrera === borradorFilters.carrera);
    }

    // Filter by nombre jurado
    if (borradorFilters.nombreJurado.trim()) {
      filtered = filtered.filter(borrador => 
        borrador.nombre_jurado.toLowerCase().includes(borradorFilters.nombreJurado.toLowerCase())
      );
    }

    // Filter by codigo
    if (borradorFilters.codigo.trim()) {
      filtered = filtered.filter(borrador => 
        borrador.codigo.toLowerCase().includes(borradorFilters.codigo.toLowerCase())
      );
    }

    setFilteredBorradores(filtered);
  };

  // Clear all borrador filters
  const clearBorradorFilters = () => {
    setBorradorFilters({
      estado: 'todos',
      carrera: 'todos',
      nombreJurado: '',
      codigo: ''
    });
    setFilteredBorradores(borradores);
  };

  // Load borradores when component mounts
  useEffect(() => {
    loadBorradores();
  }, []);

  // Apply borrador filters when filters change
  useEffect(() => {
    applyBorradorFilters();
  }, [borradorFilters, borradores]);

  // Load sustentaciones (simulated data for now)
  const loadSustentaciones = async () => {
    setSustentacionesLoading(true);
    try {
      // Simulated data for sustentaciones
      const simulatedSustentaciones: Sustentacion[] = [
        {
          id: '1',
          codigo: 'ST-2024-001',
          tesista_id: '1',
          tesista_name: 'Ana García Rodríguez',
          titulo: 'Sistema de Gestión Académica basado en Inteligencia Artificial',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_sustentacion: '2024-08-15',
          fecha_programada: '2024-08-15',
          nota_final: 18
        },
        {
          id: '2',
          codigo: 'ST-2024-002',
          tesista_id: '2',
          tesista_name: 'Luis Fernando Torres',
          titulo: 'Aplicación Móvil para el Control de Inventarios',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Mg. María Gonzales',
          fecha_sustentacion: '2024-08-10',
          fecha_programada: '2024-08-10',
          nota_final: 16
        },
        {
          id: '3',
          codigo: 'ST-2024-003',
          tesista_id: '3',
          tesista_name: 'Carmen Elena Vásquez',
          titulo: 'Plataforma Web para Gestión de Recursos Humanos',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Roberto Silva',
          fecha_sustentacion: '',
          fecha_programada: '2024-08-20'
        },
        {
          id: '4',
          codigo: 'ST-2024-004',
          tesista_id: '4',
          tesista_name: 'José Miguel Herrera',
          titulo: 'Sistema de Monitoreo IoT para Agricultura de Precisión',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Ing. Patricia López',
          fecha_sustentacion: '2024-07-28',
          fecha_programada: '2024-07-28',
          nota_final: 17
        },
        {
          id: '5',
          codigo: 'ST-2024-005',
          tesista_id: '5',
          tesista_name: 'María José Ramírez',
          titulo: 'Desarrollo de Sistema Web para Comercio Electrónico',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_sustentacion: '',
          fecha_programada: '2024-08-25'
        },
        {
          id: '6',
          codigo: 'ST-2024-006',
          tesista_id: '6',
          tesista_name: 'Roberto Carlos Díaz',
          titulo: 'Análisis y Diseño de Red de Telecomunicaciones',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Ing. Patricia López',
          fecha_sustentacion: '2024-07-15',
          fecha_programada: '2024-07-15',
          nota_final: 19
        },
        {
          id: '7',
          codigo: 'ST-2024-007',
          tesista_id: '7',
          tesista_name: 'Sandra Isabel Morales',
          titulo: 'Análisis de Datos para Predicción de Ventas usando Machine Learning',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_sustentacion: '',
          fecha_programada: '2024-09-05'
        }
      ];
      
      setSustentaciones(simulatedSustentaciones);
      setFilteredSustentaciones(simulatedSustentaciones);
    } catch (error) {
      console.error('Error loading sustentaciones:', error);
    } finally {
      setSustentacionesLoading(false);
    }
  };

  // Filter sustentaciones based on current filters
  const applySustentacionFilters = () => {
    let filtered = [...sustentaciones];

    // Filter by carrera
    if (sustentacionFilters.carrera !== 'todos') {
      filtered = filtered.filter(sustentacion => sustentacion.carrera === sustentacionFilters.carrera);
    }

    // Filter by nombre jurado
    if (sustentacionFilters.nombreJurado.trim()) {
      filtered = filtered.filter(sustentacion => 
        sustentacion.nombre_jurado.toLowerCase().includes(sustentacionFilters.nombreJurado.toLowerCase())
      );
    }

    // Filter by codigo
    if (sustentacionFilters.codigo.trim()) {
      filtered = filtered.filter(sustentacion => 
        sustentacion.codigo.toLowerCase().includes(sustentacionFilters.codigo.toLowerCase())
      );
    }

    setFilteredSustentaciones(filtered);
  };

  // Clear all sustentacion filters
  const clearSustentacionFilters = () => {
    setSustentacionFilters({
      carrera: 'todos',
      nombreJurado: '',
      codigo: ''
    });
    setFilteredSustentaciones(sustentaciones);
  };

  // Load sustentaciones when component mounts
  useEffect(() => {
    loadSustentaciones();
  }, []);

  // Apply sustentacion filters when filters change
  useEffect(() => {
    applySustentacionFilters();
  }, [sustentacionFilters, sustentaciones]);

  // Load rechazados (simulated data for now)
  const loadRechazados = async () => {
    setRechazadosLoading(true);
    try {
      // Simulated data for rechazados
      const simulatedRechazados: RechazadoTesis[] = [
        {
          id: '1',
          codigo: 'PT-2024-R001',
          tesista_id: '1',
          tesista_name: 'Carlos Alberto Morales',
          titulo: 'Sistema de Control de Calidad Automatizado - Rechazado por Metodología',
          tipo: 'Proyecto',
          carrera: 'Ingeniería Industrial',
          nombre_jurado: 'Dr. Fernando Castillo',
          fecha_rechazo: '2024-06-15',
          motivo_rechazo: 'Metodología inadecuada para el tipo de investigación'
        },
        {
          id: '2',
          codigo: 'BT-2024-R001',
          tesista_id: '2',
          tesista_name: 'María Elena Vásquez',
          titulo: 'Plataforma de E-learning con Realidad Virtual - Borrador Rechazado',
          tipo: 'Borrador',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Mg. Patricia Ruiz',
          fecha_rechazo: '2024-07-08',
          motivo_rechazo: 'Falta de fundamentación teórica y referencias actualizadas'
        },
        {
          id: '3',
          codigo: 'PT-2024-R002',
          tesista_id: '3',
          tesista_name: 'Roberto José Herrera',
          titulo: 'Análisis de Redes Sociales para Marketing Digital',
          tipo: 'Proyecto',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Carlos Mendoza',
          fecha_rechazo: '2024-05-22',
          motivo_rechazo: 'Tema muy amplio, falta delimitación del problema'
        },
        {
          id: '4',
          codigo: 'BT-2024-R002',
          tesista_id: '4',
          tesista_name: 'Andrea Sofía Lagos',
          titulo: 'Sistema IoT para Monitoreo Ambiental Urbano - Borrador Final',
          tipo: 'Borrador',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Ing. Ricardo Vera',
          fecha_rechazo: '2024-07-25',
          motivo_rechazo: 'Errores metodológicos y conclusiones no fundamentadas'
        },
        {
          id: '5',
          codigo: 'PT-2024-R003',
          tesista_id: '5',
          tesista_name: 'Diego Fernando Rojas',
          titulo: 'Aplicación Web para Gestión de Inventarios Hospitalarios',
          tipo: 'Proyecto',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Mg. Ana Beltrán',
          fecha_rechazo: '2024-06-30',
          motivo_rechazo: 'Propuesta técnica insuficiente para el nivel requerido'
        }
      ];
      
      setRechazados(simulatedRechazados);
      setFilteredRechazados(simulatedRechazados);
    } catch (error) {
      console.error('Error loading rechazados:', error);
    } finally {
      setRechazadosLoading(false);
    }
  };

  // Filter rechazados based on current filters
  const applyRechazadoFilters = () => {
    let filtered = [...rechazados];

    // Filter by carrera
    if (rechazadoFilters.carrera !== 'todos') {
      filtered = filtered.filter(rechazado => rechazado.carrera === rechazadoFilters.carrera);
    }

    // Filter by nombre jurado
    if (rechazadoFilters.nombreJurado.trim()) {
      filtered = filtered.filter(rechazado => 
        rechazado.nombre_jurado.toLowerCase().includes(rechazadoFilters.nombreJurado.toLowerCase())
      );
    }

    // Filter by codigo
    if (rechazadoFilters.codigo.trim()) {
      filtered = filtered.filter(rechazado => 
        rechazado.codigo.toLowerCase().includes(rechazadoFilters.codigo.toLowerCase())
      );
    }

    setFilteredRechazados(filtered);
  };

  // Clear all rechazado filters
  const clearRechazadoFilters = () => {
    setRechazadoFilters({
      carrera: 'todos',
      nombreJurado: '',
      codigo: ''
    });
    setFilteredRechazados(rechazados);
  };

  // Load rechazados when component mounts
  useEffect(() => {
    loadRechazados();
  }, []);

  // Apply rechazado filters when filters change
  useEffect(() => {
    applyRechazadoFilters();
  }, [rechazadoFilters, rechazados]);

  // Load caducados (simulated data for now)
  const loadCaducados = async () => {
    setCaducadosLoading(true);
    try {
      // Simulated data for caducados
      const simulatedCaducados: CaducadoTesis[] = [
        {
          id: '1',
          codigo: 'PT-2023-C001',
          tesista_id: '1',
          tesista_name: 'Lucía Mercedes Paredes',
          titulo: 'Sistema de Gestión Documental para Pequeñas Empresas',
          tipo: 'Proyecto',
          carrera: 'Ingeniería de Sistemas',
          nombre_jurado: 'Dr. Manuel Ortega',
          fecha_caducidad: '2024-03-15',
          dias_vencido: 142
        },
        {
          id: '2',
          codigo: 'BT-2023-C001',
          tesista_id: '2',
          tesista_name: 'Fernando José Aquino',
          titulo: 'Desarrollo de Aplicación Móvil para Turismo Local - Borrador',
          tipo: 'Borrador',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Mg. Carmen Delgado',
          fecha_caducidad: '2024-02-28',
          dias_vencido: 158
        },
        {
          id: '3',
          codigo: 'PT-2023-C002',
          tesista_id: '3',
          tesista_name: 'Valeria Isabel Mendoza',
          titulo: 'Plataforma Web para Gestión de Citas Médicas',
          tipo: 'Proyecto',
          carrera: 'Ingeniería de Software',
          nombre_jurado: 'Dr. Roberto Silva',
          fecha_caducidad: '2024-04-10',
          dias_vencido: 116
        },
        {
          id: '4',
          codigo: 'BT-2023-C002',
          tesista_id: '4',
          tesista_name: 'Andrés Felipe Torres',
          titulo: 'Sistema de Automatización para Invernaderos - Borrador Técnico',
          tipo: 'Borrador',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Ing. Patricia López',
          fecha_caducidad: '2024-01-20',
          dias_vencido: 197
        },
        {
          id: '5',
          codigo: 'PT-2023-C003',
          tesista_id: '5',
          tesista_name: 'Gabriela Alejandra Núñez',
          titulo: 'Análisis de Datos de Ventas usando Business Intelligence',
          tipo: 'Proyecto',
          carrera: 'Ingeniería Industrial',
          nombre_jurado: 'Mg. Luis Campos',
          fecha_caducidad: '2024-05-05',
          dias_vencido: 91
        },
        {
          id: '6',
          codigo: 'BT-2023-C003',
          tesista_id: '6',
          tesista_name: 'Cristian David Ramírez',
          titulo: 'Red de Sensores Inalámbricos para Monitoreo Industrial',
          tipo: 'Borrador',
          carrera: 'Ingeniería Electrónica',
          nombre_jurado: 'Dr. Eduardo Maldonado',
          fecha_caducidad: '2024-06-12',
          dias_vencido: 53
        }
      ];
      
      setCaducados(simulatedCaducados);
      setFilteredCaducados(simulatedCaducados);
    } catch (error) {
      console.error('Error loading caducados:', error);
    } finally {
      setCaducadosLoading(false);
    }
  };

  // Filter caducados based on current filters
  const applyCaducadoFilters = () => {
    let filtered = [...caducados];

    // Filter by carrera
    if (caducadoFilters.carrera !== 'todos') {
      filtered = filtered.filter(caducado => caducado.carrera === caducadoFilters.carrera);
    }

    // Filter by nombre jurado
    if (caducadoFilters.nombreJurado.trim()) {
      filtered = filtered.filter(caducado => 
        caducado.nombre_jurado.toLowerCase().includes(caducadoFilters.nombreJurado.toLowerCase())
      );
    }

    // Filter by codigo
    if (caducadoFilters.codigo.trim()) {
      filtered = filtered.filter(caducado => 
        caducado.codigo.toLowerCase().includes(caducadoFilters.codigo.toLowerCase())
      );
    }

    setFilteredCaducados(filtered);
  };

  // Clear all caducado filters
  const clearCaducadoFilters = () => {
    setCaducadoFilters({
      carrera: 'todos',
      nombreJurado: '',
      codigo: ''
    });
    setFilteredCaducados(caducados);
  };

  // Load caducados when component mounts
  useEffect(() => {
    loadCaducados();
  }, []);

  // Apply caducado filters when filters change
  useEffect(() => {
    applyCaducadoFilters();
  }, [caducadoFilters, caducados]);

  // Load ampliados (simulated data for now)
  const loadAmpliados = async () => {
    setAmpliadosLoading(true);
    try {
      // Simulated data for proyectos ampliados
      const simulatedAmpliados: ProyectoAmpliado[] = [
        {
          id: '1',
          codigo: 'PT-2024-A001',
          tesista_id: '1',
          tesista_name: 'Ana Lucía Mendoza',
          carrera: 'Ingeniería de Sistemas',
          estado_borrador: 'En Revisión',
          estado: 'Ampliado',
          fecha_ampliacion: '2024-03-15',
          dias_transcurridos: 142,
          dias_restantes: 38,
          titulo: 'Sistema de Gestión Inteligente para Recursos Hospitalarios con IA'
        },
        {
          id: '2',
          codigo: 'PT-2024-A002',
          tesista_id: '2',
          tesista_name: 'Carlos Eduardo Ramírez',
          carrera: 'Ingeniería de Software',
          estado_borrador: 'Aprobado',
          estado: 'En Curso',
          fecha_ampliacion: '2024-02-20',
          dias_transcurridos: 166,
          dias_restantes: 14,
          titulo: 'Plataforma de Microservicios para E-commerce con Arquitectura Distribuida'
        },
        {
          id: '3',
          codigo: 'PT-2024-A003',
          tesista_id: '3',
          tesista_name: 'María Fernanda Torres',
          carrera: 'Ingeniería Electrónica',
          estado_borrador: 'En Curso',
          estado: 'Ampliado',
          fecha_ampliacion: '2024-04-10',
          dias_transcurridos: 116,
          dias_restantes: 64,
          titulo: 'Red de Sensores IoT para Monitoreo Ambiental Urbano en Tiempo Real'
        },
        {
          id: '4',
          codigo: 'PT-2024-A004',
          tesista_id: '4',
          tesista_name: 'José Antonio Vargas',
          carrera: 'Ingeniería Industrial',
          estado_borrador: 'Observado',
          estado: 'En Revisión',
          fecha_ampliacion: '2024-05-05',
          dias_transcurridos: 91,
          dias_restantes: 89,
          titulo: 'Optimización de Cadena de Suministro usando Machine Learning y Blockchain'
        },
        {
          id: '5',
          codigo: 'PT-2024-A005',
          tesista_id: '5',
          tesista_name: 'Gabriela Patricia Morales',
          carrera: 'Ingeniería de Sistemas',
          estado_borrador: 'En Revisión',
          estado: 'Ampliado',
          fecha_ampliacion: '2024-01-30',
          dias_transcurridos: 187,
          dias_restantes: -7,
          titulo: 'Sistema de Análisis Predictivo para Detección de Fraudes Financieros'
        },
        {
          id: '6',
          codigo: 'PT-2024-A006',
          tesista_id: '6',
          tesista_name: 'Roberto Daniel Castillo',
          carrera: 'Ingeniería de Software',
          estado_borrador: 'Aprobado',
          estado: 'Finalizado',
          fecha_ampliacion: '2024-06-12',
          dias_transcurridos: 53,
          dias_restantes: 127,
          titulo: 'Aplicación Móvil Multiplataforma para Gestión de Telemedicina'
        }
      ];
      
      setAmpliados(simulatedAmpliados);
      setFilteredAmpliados(simulatedAmpliados);
    } catch (error) {
      console.error('Error loading ampliados:', error);
    } finally {
      setAmpliadosLoading(false);
    }
  };

  // Filter ampliados based on current filters
  const applyAmpliadoFilters = () => {
    let filtered = [...ampliados];

    // Filter by carrera
    if (ampliadoFilters.carrera !== 'todos') {
      filtered = filtered.filter(ampliado => ampliado.carrera === ampliadoFilters.carrera);
    }

    // Filter by codigo
    if (ampliadoFilters.codigo.trim()) {
      filtered = filtered.filter(ampliado => 
        ampliado.codigo.toLowerCase().includes(ampliadoFilters.codigo.toLowerCase())
      );
    }

    setFilteredAmpliados(filtered);
  };

  // Clear all ampliado filters
  const clearAmpliadoFilters = () => {
    setAmpliadoFilters({
      carrera: 'todos',
      nombreJurado: '',
      codigo: ''
    });
    setFilteredAmpliados(ampliados);
  };

  // Load ampliados when component mounts
  useEffect(() => {
    loadAmpliados();
  }, []);

  // Apply ampliado filters when filters change
  useEffect(() => {
    applyAmpliadoFilters();
  }, [ampliadoFilters, ampliados]);

  // Load tiempos (simulated data for now)
  const loadTiempos = async () => {
    setTiemposLoading(true);
    try {
      // Simulated data for ver tiempos
      const simulatedTiempos: TiempoTesis[] = [
        {
          id: '1',
          codigo: 'PT-2024-T001',
          tesista_id: '1',
          tesista_name: 'Ana García Rodríguez',
          carrera: 'Ingeniería de Sistemas',
          estado_borrador: 'Aprobado',
          estado: 'En Curso',
          fecha_inicio: '2024-01-15',
          dias_transcurridos: 202,
          dias_restantes: 163,
          titulo: 'Sistema de Gestión Académica basado en Inteligencia Artificial'
        },
        {
          id: '2',
          codigo: 'BT-2024-T001',
          tesista_id: '2',
          tesista_name: 'Luis Fernando Torres',
          carrera: 'Ingeniería de Software',
          estado_borrador: 'En Revisión',
          estado: 'Activo',
          fecha_inicio: '2024-02-10',
          dias_transcurridos: 176,
          dias_restantes: 94,
          titulo: 'Aplicación Móvil para el Control de Inventarios'
        },
        {
          id: '3',
          codigo: 'PT-2024-T002',
          tesista_id: '3',
          tesista_name: 'Carmen Elena Vásquez',
          carrera: 'Ingeniería de Sistemas',
          estado_borrador: 'En Curso',
          estado: 'En Desarrollo',
          fecha_inicio: '2024-03-05',
          dias_transcurridos: 153,
          dias_restantes: 117,
          titulo: 'Plataforma Web para Gestión de Recursos Humanos'
        },
        {
          id: '4',
          codigo: 'BT-2024-T002',
          tesista_id: '4',
          tesista_name: 'José Miguel Herrera',
          carrera: 'Ingeniería Electrónica',
          estado_borrador: 'Observado',
          estado: 'En Revisión',
          fecha_inicio: '2024-01-20',
          dias_transcurridos: 197,
          dias_restantes: 73,
          titulo: 'Sistema de Monitoreo IoT para Agricultura de Precisión'
        },
        {
          id: '5',
          codigo: 'PT-2024-T003',
          tesista_id: '5',
          tesista_name: 'Sandra Isabel Morales',
          carrera: 'Ingeniería de Software',
          estado_borrador: 'Aprobado',
          estado: 'Finalizado',
          fecha_inicio: '2024-04-12',
          dias_transcurridos: 115,
          dias_restantes: 250,
          titulo: 'Análisis de Datos para Predicción de Ventas usando Machine Learning'
        },
        {
          id: '6',
          codigo: 'BT-2024-T003',
          tesista_id: '6',
          tesista_name: 'María José Ramírez',
          carrera: 'Ingeniería de Software',
          estado_borrador: 'En Revisión',
          estado: 'Activo',
          fecha_inicio: '2024-07-15',
          dias_transcurridos: 20,
          dias_restantes: 345,
          titulo: 'Desarrollo de Sistema Web para Comercio Electrónico'
        },
        {
          id: '7',
          codigo: 'PT-2024-T004',
          tesista_id: '7',
          tesista_name: 'Roberto Carlos Díaz',
          carrera: 'Ingeniería Electrónica',
          estado_borrador: 'Aprobado',
          estado: 'En Sustentación',
          fecha_inicio: '2023-09-10',
          dias_transcurridos: 329,
          dias_restantes: 36,
          titulo: 'Análisis y Diseño de Red de Telecomunicaciones'
        }
      ];
      
      setTiempos(simulatedTiempos);
      setFilteredTiempos(simulatedTiempos);
    } catch (error) {
      console.error('Error loading tiempos:', error);
    } finally {
      setTiemposLoading(false);
    }
  };

  // Filter tiempos based on current filters
  const applyTiempoFilters = () => {
    let filtered = [...tiempos];

    // Filter by carrera
    if (tiempoFilters.carrera !== 'todos') {
      filtered = filtered.filter(tiempo => tiempo.carrera === tiempoFilters.carrera);
    }

    // Filter by codigo
    if (tiempoFilters.codigo.trim()) {
      filtered = filtered.filter(tiempo => 
        tiempo.codigo.toLowerCase().includes(tiempoFilters.codigo.toLowerCase())
      );
    }

    setFilteredTiempos(filtered);
  };

  // Clear all tiempo filters
  const clearTiempoFilters = () => {
    setTiempoFilters({
      carrera: 'todos',
      nombreJurado: '',
      codigo: ''
    });
    setFilteredTiempos(tiempos);
  };

  // Load tiempos when component mounts
  useEffect(() => {
    loadTiempos();
  }, []);

  // Apply tiempo filters when filters change
  useEffect(() => {
    applyTiempoFilters();
  }, [tiempoFilters, tiempos]);

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
      case 'buscar-tesista':
        return (
          <div className="space-y-6 p-6">
            {/* Search Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Buscar Tesista</h3>
                  <p className="text-sm text-gray-600">Encuentra tesistas por código de proyecto o DNI/apellidos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Search by Project Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Buscar por Código de Proyecto
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchProjectCode}
                      onChange={(e) => setSearchProjectCode(e.target.value)}
                      placeholder="Ingrese Código de Proyecto"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && searchTesistaByProjectCode(searchProjectCode)}
                    />
                    <button
                      onClick={() => searchTesistaByProjectCode(searchProjectCode)}
                      disabled={searchLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {searchLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>

                {/* Search by DNI or Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Buscar por DNI o Apellidos
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchDniOrName}
                      onChange={(e) => setSearchDniOrName(e.target.value)}
                      placeholder="Ingrese DNI o Apellidos"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && searchTesistaByDniOrName(searchDniOrName)}
                    />
                    <button
                      onClick={() => searchTesistaByDniOrName(searchDniOrName)}
                      disabled={searchLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {searchLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {searchedTesista && (
              <>
                {/* Action Buttons */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-black mb-4">Acciones</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleTesistaAction('renunciar')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                    >
                      Renunciar
                    </button>
                    <button
                      onClick={() => handleTesistaAction('habilitar')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    >
                      Habilitar
                    </button>
                    <button
                      onClick={() => handleTesistaAction('habilitar_borrador')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Habilitar Borrador
                    </button>
                    <button
                      onClick={() => handleTesistaAction('agregar_ampliacion')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                    >
                      Agregar Ampliación
                    </button>
                    <button
                      onClick={() => handleTesistaAction('cambiar_datos')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
                    >
                      Cambiar Datos
                    </button>
                    <button
                      onClick={() => handleTesistaAction('cambiar_titulo')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                    >
                      Cambiar Título
                    </button>
                    <button
                      onClick={() => handleTesistaAction('log_tramite')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                    >
                      Log Trámite
                    </button>
                    <button
                      onClick={() => handleTesistaAction('desactivar')}
                      className="px-4 py-2 bg-red-800 text-white rounded-md text-sm hover:bg-red-900"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>

                {/* Student Information Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-black mb-4">Datos Personales y Seguimiento</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">DNI</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Código</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Activo</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Datos Personales</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Carrera</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Celular</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Correo</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Registro</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Cód. Proyecto</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Año</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Estado</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Línea</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Fecha Inicio Proyecto</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Fecha Inicio Borrador</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Última Fecha</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Días</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-900">Ejecución</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-4 py-2">{searchedTesista.dni}</td>
                          <td className="px-4 py-2">{searchedTesista.codigo_matricula}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              searchedTesista.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {searchedTesista.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-2">{searchedTesista.full_name}</td>
                          <td className="px-4 py-2">{searchedTesista.major}</td>
                          <td className="px-4 py-2">{searchedTesista.phone}</td>
                          <td className="px-4 py-2">{searchedTesista.email}</td>
                          <td className="px-4 py-2">{new Date(searchedTesista.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{searchedTesista.proyecto?.codigo || 'N/A'}</td>
                          <td className="px-4 py-2">{new Date(searchedTesista.created_at).getFullYear()}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              searchedTesista.proyecto?.estado === 'en_curso' ? 'bg-blue-100 text-blue-800' :
                              searchedTesista.proyecto?.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {searchedTesista.proyecto?.estado || 'Sin proyecto'}
                            </span>
                          </td>
                          <td className="px-4 py-2">{searchedTesista.proyecto?.linea_investigacion || 'N/A'}</td>
                          <td className="px-4 py-2">{searchedTesista.proyecto?.fecha_inicio_proyecto ? new Date(searchedTesista.proyecto.fecha_inicio_proyecto).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-2">{searchedTesista.proyecto?.fecha_inicio_borrador ? new Date(searchedTesista.proyecto.fecha_inicio_borrador).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-2">{searchedTesista.proyecto?.fecha_ultima ? new Date(searchedTesista.proyecto.fecha_ultima).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-2">{searchedTesista.proyecto?.dias_transcurridos || 0}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              searchedTesista.proyecto?.en_ejecucion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {searchedTesista.proyecto?.en_ejecucion ? 'En Ejecución' : 'Pausado'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Status Change History */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-black mb-4">Estados de Cambio</h4>
                  {tramiteLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-900">Fecha</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-900">Estado Anterior</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-900">Estado Nuevo</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-900">Descripción</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-900">Usuario</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tramiteLogs.map((log, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{new Date(log.fecha_cambio).toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                  {log.estado_anterior}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {log.estado_nuevo}
                                </span>
                              </td>
                              <td className="px-4 py-2">{log.descripcion}</td>
                              <td className="px-4 py-2">{log.usuario_nombre}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay registros de cambios de estado</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* No Results */}
            {!searchedTesista && !searchLoading && (searchProjectCode || searchDniOrName) && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="text-center text-gray-500 py-8">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron resultados</p>
                  <p className="text-sm">Verifique los criterios de búsqueda</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'inicio':
        return (
          <div className="space-y-0 p-0">
            {/* Header Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">
                      Dashboard de Trámites - Tesistas
                    </h3>
                    <p className="text-black">
                      Resumen general de proyectos, borradores y sustentaciones
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    loadTesistas();
                    loadTramiteStats();
                  }}
                  disabled={loading || statsLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {(loading || statsLoading) ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{tesistas.length}</p>
                      <p className="text-sm text-blue-100">Total Tesistas</p>
                    </div>
                    <User className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        {statsLoading ? '...' : tramiteStats.totalTramites}
                      </p>
                      <p className="text-sm text-green-100">Total Trámites</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        {statsLoading ? '...' : 
                          tramiteStats.proyectosTesis.enCurso + tramiteStats.borradoresTesis.enCurso + tramiteStats.sustentaciones.enCurso
                        }
                      </p>
                      <p className="text-sm text-amber-100">En Curso</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-amber-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        {statsLoading ? '...' : 
                          tramiteStats.proyectosTesis.aprobados + tramiteStats.borradoresTesis.aprobados + tramiteStats.sustentaciones.aprobados
                        }
                      </p>
                      <p className="text-sm text-emerald-100">Aprobados</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-200" />
                  </div>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Proyectos de Tesis */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <h4 className="text-sm font-medium text-black">Proyectos de Tesis</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-black">Total:</span>
                      <span className="font-semibold text-black">
                        {statsLoading ? '...' : tramiteStats.proyectosTesis.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">En Curso:</span>
                      <span className="font-semibold text-amber-600">
                        {statsLoading ? '...' : tramiteStats.proyectosTesis.enCurso}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Aprobados:</span>
                      <span className="font-semibold text-green-600">
                        {statsLoading ? '...' : tramiteStats.proyectosTesis.aprobados}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${tramiteStats.proyectosTesis.total > 0 ? 
                            (tramiteStats.proyectosTesis.aprobados / tramiteStats.proyectosTesis.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Borradores de Tesis */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <File className="w-6 h-6 text-purple-600 mr-3" />
                    <h4 className="text-sm font-medium text-black">Borradores de Tesis</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-black">Total:</span>
                      <span className="font-semibold text-black">
                        {statsLoading ? '...' : tramiteStats.borradoresTesis.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">En Curso:</span>
                      <span className="font-semibold text-amber-600">
                        {statsLoading ? '...' : tramiteStats.borradoresTesis.enCurso}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Aprobados:</span>
                      <span className="font-semibold text-green-600">
                        {statsLoading ? '...' : tramiteStats.borradoresTesis.aprobados}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${tramiteStats.borradoresTesis.total > 0 ? 
                            (tramiteStats.borradoresTesis.aprobados / tramiteStats.borradoresTesis.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Sustentaciones */}
                <div className="bg-gray-50 p-0 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-yellow-600 mr-3" />
                    <h4 className="text-sm font-medium text-black">Sustentaciones</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-black">Total:</span>
                      <span className="font-semibold text-black">
                        {statsLoading ? '...' : tramiteStats.sustentaciones.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">En Curso:</span>
                      <span className="font-semibold text-amber-600">
                        {statsLoading ? '...' : tramiteStats.sustentaciones.enCurso}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Aprobados:</span>
                      <span className="font-semibold text-green-600">
                        {statsLoading ? '...' : tramiteStats.sustentaciones.aprobados}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${tramiteStats.sustentaciones.total > 0 ? 
                            (tramiteStats.sustentaciones.aprobados / tramiteStats.sustentaciones.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="text-sm font-medium text-black">Resumen de Progreso</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-black mb-2">Tasa de Aprobación General</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${tramiteStats.totalTramites > 0 ? 
                              ((tramiteStats.proyectosTesis.aprobados + tramiteStats.borradoresTesis.aprobados + tramiteStats.sustentaciones.aprobados) / tramiteStats.totalTramites) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-black">
                        {tramiteStats.totalTramites > 0 ? 
                          Math.round(((tramiteStats.proyectosTesis.aprobados + tramiteStats.borradoresTesis.aprobados + tramiteStats.sustentaciones.aprobados) / tramiteStats.totalTramites) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-black mb-2">Trámites en Proceso</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-3 mr-3">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${tramiteStats.totalTramites > 0 ? 
                              ((tramiteStats.proyectosTesis.enCurso + tramiteStats.borradoresTesis.enCurso + tramiteStats.sustentaciones.enCurso) / tramiteStats.totalTramites) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-black">
                        {tramiteStats.totalTramites > 0 ? 
                          Math.round(((tramiteStats.proyectosTesis.enCurso + tramiteStats.borradoresTesis.enCurso + tramiteStats.sustentaciones.enCurso) / tramiteStats.totalTramites) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h4 className="text-sm font-medium text-black mb-4">Acceso Rápido</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSidebarItem('proyectos-tesis')}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                >
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-black">Proyectos</p>
                </button>
                <button
                  onClick={() => setActiveSidebarItem('borrador-tesis')}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
                >
                  <File className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-black">Borradores</p>
                </button>
                <button
                  onClick={() => setActiveSidebarItem('sustentaciones')}
                  className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center"
                >
                  <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-black">Sustentaciones</p>
                </button>
                <button
                  onClick={() => setActiveSidebarItem('tiempos')}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                >
                  <Clock className="w-8 h-8 text-black mx-auto mb-2" />
                  <p className="text-sm font-medium text-black">Ver Tiempos</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 'proyectos-tesis':
        return (
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Proyectos de Tesis
                  </h3>
                  <p className="text-black">
                    Gestión y seguimiento de proyectos de tesis
                  </p>
                </div>
              </div>
              <button
                onClick={loadProyectos}
                disabled={proyectosLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {proyectosLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-black mr-2" />
                <h4 className="text-sm font-medium text-black">Filtros de Búsqueda</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* Estado Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="todos">Todos</option>
                    <option value="En Curso">En Curso</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>

                {/* Carrera Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Carrera
                  </label>
                  <select
                    value={filters.carrera}
                    onChange={(e) => setFilters(prev => ({ ...prev, carrera: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="todos">Todas</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería de Software">Ingeniería de Software</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  </select>
                </div>

                {/* Nombre Jurado Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Nombre de Jurado
                  </label>
                  <input
                    type="text"
                    value={filters.nombreJurado}
                    onChange={(e) => setFilters(prev => ({ ...prev, nombreJurado: e.target.value }))}
                    placeholder="Buscar jurado..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Codigo Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={filters.codigo}
                    onChange={(e) => setFilters(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Buscar código..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Buscar Button */}
                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>

                {/* Limpiar Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-black">
                Mostrando {filteredProyectos.length} de {proyectos.length} proyectos
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {proyectosLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Cargando proyectos...</p>
                  </div>
                ) : filteredProyectos.length === 0 ? (
                  <div className="p-8 text-center text-black">
                    No se encontraron proyectos con los filtros aplicados
                  </div>
                ) : (
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-12">
                          Nro
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Código
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-48">
                          Tesista
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Fecha
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProyectos.map((proyecto, index) => (
                        <tr key={proyecto.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-blue-600">
                              {proyecto.codigo}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-black truncate">
                                {proyecto.tesista_name}
                              </div>
                              <div className="text-sm text-black truncate">
                                {proyecto.carrera}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-sm text-black truncate" title={proyecto.titulo}>
                              {proyecto.titulo}
                            </div>
                            <div className="text-sm text-black">
                              <span className="text-xs text-gray-400 truncate">Jurado: {proyecto.nombre_jurado}</span> • <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                                proyecto.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                proyecto.estado === 'En Curso' ? 'bg-blue-100 text-blue-800' :
                                proyecto.estado === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                                proyecto.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-black'
                              }`}>
                                {proyecto.estado}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {new Date(proyecto.fecha_modificacion).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button
                                className="text-blue-600 hover:text-black p-1 rounded hover:bg-blue-50"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-black p-1 rounded hover:bg-green-50"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-black p-1 rounded hover:bg-red-50"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      case 'borrador-tesis':
        return (
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <File className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Borradores de Tesis
                  </h3>
                  <p className="text-black">
                    Gestión y seguimiento de borradores de tesis
                  </p>
                </div>
              </div>
              <button
                onClick={loadBorradores}
                disabled={borradoresLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {borradoresLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-black mr-2" />
                <h4 className="text-sm font-medium text-black">Filtros de Búsqueda</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                {/* Estado Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Estado
                  </label>
                  <select
                    value={borradorFilters.estado}
                    onChange={(e) => setBorradorFilters(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  >
                    <option value="todos">Todos</option>
                    <option value="En Curso">En Curso</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Observado">Observado</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>

                {/* Carrera Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Carrera
                  </label>
                  <select
                    value={borradorFilters.carrera}
                    onChange={(e) => setBorradorFilters(prev => ({ ...prev, carrera: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  >
                    <option value="todos">Todas</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería de Software">Ingeniería de Software</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  </select>
                </div>

                {/* Nombre Jurado Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Nombre de Jurado
                  </label>
                  <input
                    type="text"
                    value={borradorFilters.nombreJurado}
                    onChange={(e) => setBorradorFilters(prev => ({ ...prev, nombreJurado: e.target.value }))}
                    placeholder="Buscar jurado..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Codigo Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={borradorFilters.codigo}
                    onChange={(e) => setBorradorFilters(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Buscar código..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Buscar Button */}
                <div className="flex items-end">
                  <button
                    onClick={applyBorradorFilters}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>

                {/* Limpiar Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearBorradorFilters}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-black">
                Mostrando {filteredBorradores.length} de {borradores.length} borradores
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {borradoresLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Cargando borradores...</p>
                  </div>
                ) : filteredBorradores.length === 0 ? (
                  <div className="p-8 text-center text-black">
                    No se encontraron borradores con los filtros aplicados
                  </div>
                ) : (
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-12">
                          Nro
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Código
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-48">
                          Tesista
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Fecha
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBorradores.map((borrador, index) => (
                        <tr key={borrador.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-purple-600">
                              {borrador.codigo}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-black truncate">
                                {borrador.tesista_name}
                              </div>
                              <div className="text-sm text-black truncate">
                                {borrador.carrera}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-sm text-black truncate" title={borrador.titulo}>
                              {borrador.titulo}
                            </div>
                            <div className="text-sm text-black">
                              <span className="text-xs text-gray-400 truncate">Jurado: {borrador.nombre_jurado}</span> • <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                                borrador.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                borrador.estado === 'En Curso' ? 'bg-blue-100 text-blue-800' :
                                borrador.estado === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                                borrador.estado === 'Observado' ? 'bg-orange-100 text-orange-800' :
                                borrador.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-black'
                              }`}>
                                {borrador.estado}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {new Date(borrador.fecha_modificacion).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-blue-600 hover:text-black p-1 rounded hover:bg-blue-50"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-black p-1 rounded hover:bg-green-50"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-black p-1 rounded hover:bg-red-50"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      case 'sustentaciones':
        return (
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Sustentaciones
                  </h3>
                  <p className="text-black">
                    Gestión y seguimiento de sustentaciones de tesis
                  </p>
                </div>
              </div>
              <button
                onClick={loadSustentaciones}
                disabled={sustentacionesLoading}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {sustentacionesLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-black mr-2" />
                <h4 className="text-sm font-medium text-black">Filtros de Búsqueda</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Carrera Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Carrera
                  </label>
                  <select
                    value={sustentacionFilters.carrera}
                    onChange={(e) => setSustentacionFilters(prev => ({ ...prev, carrera: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                  >
                    <option value="todos">Todas</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería de Software">Ingeniería de Software</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  </select>
                </div>

                {/* Nombre Jurado Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Nombre de Jurado
                  </label>
                  <input
                    type="text"
                    value={sustentacionFilters.nombreJurado}
                    onChange={(e) => setSustentacionFilters(prev => ({ ...prev, nombreJurado: e.target.value }))}
                    placeholder="Buscar jurado..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Codigo Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={sustentacionFilters.codigo}
                    onChange={(e) => setSustentacionFilters(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Buscar código..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Buscar Button */}
                <div className="flex items-end">
                  <button
                    onClick={applySustentacionFilters}
                    className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>

                {/* Limpiar Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearSustentacionFilters}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-black">
                Mostrando {filteredSustentaciones.length} de {sustentaciones.length} sustentaciones
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {sustentacionesLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Cargando sustentaciones...</p>
                  </div>
                ) : filteredSustentaciones.length === 0 ? (
                  <div className="p-8 text-center text-black">
                    No se encontraron sustentaciones con los filtros aplicados
                  </div>
                ) : (
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-12">
                          Nro
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Código
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-48">
                          Tesista
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Fecha
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSustentaciones.map((sustentacion, index) => (
                        <tr key={sustentacion.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-yellow-600">
                              {sustentacion.codigo}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-black truncate">
                                {sustentacion.tesista_name}
                              </div>
                              <div className="text-sm text-black truncate">
                                {sustentacion.carrera}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-sm text-black truncate" title={sustentacion.titulo}>
                              {sustentacion.titulo}
                            </div>
                            <div className="text-sm text-black">
                              <span className="text-xs text-gray-400 truncate">Jurado: {sustentacion.nombre_jurado}</span>
                              {sustentacion.nota_final && (
                                <span className="ml-1">
                                  • <span className={`font-semibold text-xs ${
                                    sustentacion.nota_final >= 18 ? 'text-green-600' :
                                    sustentacion.nota_final >= 16 ? 'text-blue-600' :
                                    sustentacion.nota_final >= 14 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {sustentacion.nota_final}
                                  </span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            <div>
                              {sustentacion.fecha_sustentacion ? (
                                <div>
                                  <div className="text-sm text-black">
                                    {new Date(sustentacion.fecha_sustentacion).toLocaleDateString('es-ES')}
                                  </div>
                                  <div className="text-xs text-green-600">Realizada</div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-sm text-black">
                                    {new Date(sustentacion.fecha_programada).toLocaleDateString('es-ES')}
                                  </div>
                                  <div className="text-xs text-orange-600">Programada</div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button
                                className="text-blue-600 hover:text-black p-1 rounded hover:bg-blue-50"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-black p-1 rounded hover:bg-green-50"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-black p-1 rounded hover:bg-red-50"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      case 'rechazados':
        return (
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Proyectos/Borradores Rechazados
                  </h3>
                  <p className="text-black">
                    Gestión de proyectos y borradores rechazados
                  </p>
                </div>
              </div>
              <button
                onClick={loadRechazados}
                disabled={rechazadosLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {rechazadosLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-black mr-2" />
                <h4 className="text-sm font-medium text-black">Filtros de Búsqueda</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Carrera Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Carrera
                  </label>
                  <select
                    value={rechazadoFilters.carrera}
                    onChange={(e) => setRechazadoFilters(prev => ({ ...prev, carrera: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  >
                    <option value="todos">Todas</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería de Software">Ingeniería de Software</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  </select>
                </div>

                {/* Nombre Jurado Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Nombre de Jurado
                  </label>
                  <input
                    type="text"
                    value={rechazadoFilters.nombreJurado}
                    onChange={(e) => setRechazadoFilters(prev => ({ ...prev, nombreJurado: e.target.value }))}
                    placeholder="Buscar jurado..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Codigo Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={rechazadoFilters.codigo}
                    onChange={(e) => setRechazadoFilters(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Buscar código..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Buscar Button */}
                <div className="flex items-end">
                  <button
                    onClick={applyRechazadoFilters}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>

                {/* Limpiar Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearRechazadoFilters}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-black">
                Mostrando {filteredRechazados.length} de {rechazados.length} rechazados
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {rechazadosLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Cargando rechazados...</p>
                  </div>
                ) : filteredRechazados.length === 0 ? (
                  <div className="p-8 text-center text-black">
                    No se encontraron rechazados con los filtros aplicados
                  </div>
                ) : (
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-12">
                          Nro
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Código
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-48">
                          Tesista
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Fecha
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRechazados.map((rechazado, index) => (
                        <tr key={rechazado.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-red-600">
                              {rechazado.codigo}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-black truncate">
                                {rechazado.tesista_name}
                              </div>
                              <div className="text-sm text-black truncate">
                                {rechazado.carrera}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-sm text-black truncate" title={rechazado.titulo}>
                              {rechazado.titulo}
                            </div>
                            <div className="text-sm text-black">
                              <span className="text-xs text-gray-400 truncate">Jurado: {rechazado.nombre_jurado}</span> • <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                                rechazado.tipo === 'Proyecto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {rechazado.tipo}
                              </span>
                            </div>
                            <div className="text-xs text-red-600 mt-1 truncate">
                              Motivo: {rechazado.motivo_rechazo}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            <div>
                              <div className="text-sm text-black">
                                {new Date(rechazado.fecha_rechazo).toLocaleDateString('es-ES')}
                              </div>
                              <div className="text-xs text-red-600">Rechazado</div>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button
                                className="text-blue-600 hover:text-black p-1 rounded hover:bg-blue-50"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-black p-1 rounded hover:bg-green-50"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-black p-1 rounded hover:bg-red-50"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      case 'caducados':
        return (
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Proyectos/Borradores Caducados
                  </h3>
                  <p className="text-black">
                    Gestión de proyectos y borradores caducados
                  </p>
                </div>
              </div>
              <button
                onClick={loadCaducados}
                disabled={caducadosLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {caducadosLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-black mr-2" />
                <h4 className="text-sm font-medium text-black">Filtros de Búsqueda</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Carrera Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Carrera
                  </label>
                  <select
                    value={caducadoFilters.carrera}
                    onChange={(e) => setCaducadoFilters(prev => ({ ...prev, carrera: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  >
                    <option value="todos">Todas</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería de Software">Ingeniería de Software</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  </select>
                </div>

                {/* Nombre Jurado Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Nombre de Jurado
                  </label>
                  <input
                    type="text"
                    value={caducadoFilters.nombreJurado}
                    onChange={(e) => setCaducadoFilters(prev => ({ ...prev, nombreJurado: e.target.value }))}
                    placeholder="Buscar jurado..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Codigo Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={caducadoFilters.codigo}
                    onChange={(e) => setCaducadoFilters(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Buscar código..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Buscar Button */}
                <div className="flex items-end">
                  <button
                    onClick={applyCaducadoFilters}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>

                {/* Limpiar Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearCaducadoFilters}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-black">
                Mostrando {filteredCaducados.length} de {caducados.length} caducados
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {caducadosLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Cargando caducados...</p>
                  </div>
                ) : filteredCaducados.length === 0 ? (
                  <div className="p-8 text-center text-black">
                    No se encontraron caducados con los filtros aplicados
                  </div>
                ) : (
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-12">
                          Nro
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Código
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-48">
                          Tesista
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Fecha
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCaducados.map((caducado, index) => (
                        <tr key={caducado.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-orange-600">
                              {caducado.codigo}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-black truncate">
                                {caducado.tesista_name}
                              </div>
                              <div className="text-sm text-black truncate">
                                {caducado.carrera}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-sm text-black truncate" title={caducado.titulo}>
                              {caducado.titulo}
                            </div>
                            <div className="text-sm text-black">
                              <span className="text-xs text-gray-400 truncate">Jurado: {caducado.nombre_jurado}</span> • <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                                caducado.tipo === 'Proyecto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {caducado.tipo}
                              </span>
                            </div>
                            <div className="text-xs text-orange-600 mt-1 truncate">
                              Vencido hace {caducado.dias_vencido} días
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            <div>
                              <div className="text-sm text-black">
                                {new Date(caducado.fecha_caducidad).toLocaleDateString('es-ES')}
                              </div>
                              <div className="text-xs text-orange-600">Caducado</div>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button
                                className="text-blue-600 hover:text-black p-1 rounded hover:bg-blue-50"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-black p-1 rounded hover:bg-green-50"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-black p-1 rounded hover:bg-red-50"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      case 'ampliados':
        return (
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Proyectos Ampliados
                  </h3>
                  <p className="text-black">
                    Gestión de proyectos con extensión de tiempo
                  </p>
                </div>
              </div>
              <button
                onClick={loadAmpliados}
                disabled={ampliadosLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {ampliadosLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-black mr-2" />
                <h4 className="text-sm font-medium text-black">Filtros de Búsqueda</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Carrera Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Carrera
                  </label>
                  <select
                    value={ampliadoFilters.carrera}
                    onChange={(e) => setAmpliadoFilters(prev => ({ ...prev, carrera: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="todos">Todas</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería de Software">Ingeniería de Software</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  </select>
                </div>

                {/* Codigo Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={ampliadoFilters.codigo}
                    onChange={(e) => setAmpliadoFilters(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Buscar código..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Buscar Button */}
                <div className="flex items-end">
                  <button
                    onClick={applyAmpliadoFilters}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>

                {/* Limpiar Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearAmpliadoFilters}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-black">
                Mostrando {filteredAmpliados.length} de {ampliados.length} proyectos ampliados
              </div>
            </div>

            {/* Extended Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {ampliadosLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Cargando proyectos ampliados...</p>
                  </div>
                ) : filteredAmpliados.length === 0 ? (
                  <div className="p-8 text-center text-black">
                    No se encontraron proyectos ampliados con los filtros aplicados
                  </div>
                ) : (
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-12">Nro</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-20">Código</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-32">Tesista</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Carrera</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Est. Borr.</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-20">Estado</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Fecha</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-16">Días</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-16">D. Rest.</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Título</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAmpliados.map((ampliado, index) => (
                        <tr key={ampliado.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">{index + 1}</td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-green-600">{ampliado.codigo}</span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-black truncate">{ampliado.tesista_name}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black truncate">{ampliado.carrera}</td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                              ampliado.estado_borrador === 'Aprobado' ? 'bg-green-100 text-green-800' :
                              ampliado.estado_borrador === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                              ampliado.estado_borrador === 'En Curso' ? 'bg-blue-100 text-blue-800' :
                              ampliado.estado_borrador === 'Observado' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-black'
                            }`}>
                              {ampliado.estado_borrador}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                              ampliado.estado === 'Finalizado' ? 'bg-green-100 text-green-800' :
                              ampliado.estado === 'Ampliado' ? 'bg-purple-100 text-purple-800' :
                              ampliado.estado === 'En Curso' ? 'bg-blue-100 text-blue-800' :
                              ampliado.estado === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-black'
                            }`}>
                              {ampliado.estado}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {new Date(ampliado.fecha_ampliacion).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            <span className="font-medium">{ampliado.dias_transcurridos}</span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm">
                            <span className={`font-medium ${
                              ampliado.dias_restantes < 0 ? 'text-red-600' :
                              ampliado.dias_restantes < 30 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {ampliado.dias_restantes < 0 ? `${Math.abs(ampliado.dias_restantes)} (vencido)` : ampliado.dias_restantes}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-sm text-black truncate" title={ampliado.titulo}>
                            {ampliado.titulo}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button className="text-blue-600 hover:text-black p-1 rounded hover:bg-blue-50" title="Ver detalles">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-black p-1 rounded hover:bg-green-50" title="Editar">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-black p-1 rounded hover:bg-red-50" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      case 'tiempos':
        return (
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Ver Tiempos
                  </h3>
                  <p className="text-black">
                    Seguimiento de tiempos de todos los proyectos
                  </p>
                </div>
              </div>
              <button
                onClick={loadTiempos}
                disabled={tiemposLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {tiemposLoading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-3">
                <Filter className="w-5 h-5 text-black mr-2" />
                <h4 className="text-sm font-medium text-black">Filtros de Búsqueda</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Carrera Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Carrera
                  </label>
                  <select
                    value={tiempoFilters.carrera}
                    onChange={(e) => setTiempoFilters(prev => ({ ...prev, carrera: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="todos">Todas</option>
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Ingeniería de Software">Ingeniería de Software</option>
                    <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                    <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                  </select>
                </div>

                {/* Codigo Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={tiempoFilters.codigo}
                    onChange={(e) => setTiempoFilters(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Buscar código..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Buscar Button */}
                <div className="flex items-end">
                  <button
                    onClick={applyTiempoFilters}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </button>
                </div>

                {/* Limpiar Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearTiempoFilters}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-black">
                Mostrando {filteredTiempos.length} de {tiempos.length} proyectos
              </div>
            </div>

            {/* Extended Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {tiemposLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black">Cargando tiempos...</p>
                  </div>
                ) : filteredTiempos.length === 0 ? (
                  <div className="p-8 text-center text-black">
                    No se encontraron proyectos con los filtros aplicados
                  </div>
                ) : (
                  <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-12">Nro</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-20">Código</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-32">Tesista</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Carrera</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Est. Borr.</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-20">Estado</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Fecha</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-16">Días</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-16">D. Rest.</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Título</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-24">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTiempos.map((tiempo, index) => (
                        <tr key={tiempo.id} className="hover:bg-gray-50">
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">{index + 1}</td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-indigo-600">{tiempo.codigo}</span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-black truncate">{tiempo.tesista_name}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black truncate">{tiempo.carrera}</td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                              tiempo.estado_borrador === 'Aprobado' ? 'bg-green-100 text-green-800' :
                              tiempo.estado_borrador === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                              tiempo.estado_borrador === 'En Curso' ? 'bg-blue-100 text-blue-800' :
                              tiempo.estado_borrador === 'Observado' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-black'
                            }`}>
                              {tiempo.estado_borrador}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${
                              tiempo.estado === 'Finalizado' ? 'bg-green-100 text-green-800' :
                              tiempo.estado === 'En Sustentación' ? 'bg-purple-100 text-purple-800' :
                              tiempo.estado === 'Activo' ? 'bg-blue-100 text-blue-800' :
                              tiempo.estado === 'En Desarrollo' ? 'bg-cyan-100 text-cyan-800' :
                              tiempo.estado === 'En Revisión' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-black'
                            }`}>
                              {tiempo.estado}
                            </span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            {new Date(tiempo.fecha_inicio).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-black">
                            <span className="font-medium">{tiempo.dias_transcurridos}</span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm">
                            <span className={`font-medium ${
                              tiempo.dias_restantes < 30 ? 'text-red-600' :
                              tiempo.dias_restantes < 90 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {tiempo.dias_restantes}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-sm text-black truncate" title={tiempo.titulo}>
                            {tiempo.titulo}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              <button className="text-blue-600 hover:text-black p-1 rounded hover:bg-blue-50" title="Ver detalles">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-black p-1 rounded hover:bg-green-50" title="Editar">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-black p-1 rounded hover:bg-red-50" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
            <h3 className="text-lg font-semibold text-black mb-2">
              TESISTAS - {currentItem?.label}
            </h3>
            <p className="text-black">
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