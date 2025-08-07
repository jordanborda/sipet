import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProyTesis from "@/components/tesista/ProyTesis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Home,
  Search,
  Settings,
  MessageSquare,
  Folder,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface User {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  dni: string;
  codigo_matricula: string;
  student_id: string;
}

interface ThesisProject {
  id: string;
  titulo: string;
  estado: string;
  created_at: string;
  archivo_nombre: string;
  archivo_url: string;
  fecha_carga: string;
}

interface ThesisLog {
  id: string;
  step_number: number;
  estado_anterior: string;
  estado_nuevo: string;
  accion: string;
  descripcion: string;
  actor_nombre: string;
  actor_tipo: string;
  observaciones: string;
  fecha_accion: string;
  is_milestone: boolean;
}

interface Profesor {
  id: string;
  full_name: string;
  email: string;
}

interface LineaInvestigacion {
  id: string;
  nombre: string;
  descripcion: string;
  carrera: string;
  responsable: Profesor;
}

// Mapeo de estados de BD a pasos del timeline
const STEP_MAPPING = {
  1: ['sin_proyecto'], // Sin proyecto cargado
  2: ['cargado', 'revision_formato'], // Proyecto cargado
  3: ['aprobado_formato', 'en_revision_director'], // Director revisa
  4: ['aprobado_director', 'listo_sorteo'], // Listo para sorteo
  5: ['en_revision_jurados'], // Revisión de jurados
  6: ['con_observaciones'], // Subir correcciones
  7: ['dictamen_pendiente', 'aprobado'], // Proyecto aprobado
  8: ['documentos_pendientes'], // Subir documentos
  9: ['validacion_coordinacion'], // Validación coordinación
  10: ['borrador_en_revision'], // Borrador en revisión
  11: ['proceso_finalizado'] // Proceso finalizado
};

export default function Tesista() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProyTesisModalOpen, setIsProyTesisModalOpen] = useState(false);
  const [lineasInvestigacion, setLineasInvestigacion] = useState<LineaInvestigacion[]>([]);
  const [expandedLinea, setExpandedLinea] = useState<string | null>(null);
  const [userThesisProject, setUserThesisProject] = useState<ThesisProject | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [thesisLogs, setThesisLogs] = useState<ThesisLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadLineasInvestigacion();
      loadUserThesisProject();
    }
  }, [user]);

  // Función para cargar el proyecto de tesis del usuario
  const loadUserThesisProject = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('thesis_projects')
        .select('id, titulo, estado, created_at, archivo_nombre, archivo_url, fecha_carga')
        .or(`estudiante_principal_id.eq.${user.id},estudiante_secundario_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando proyecto:', error);
        return;
      }

      if (data) {
        setUserThesisProject(data);
        setCurrentStep(getStepFromState(data.estado));
        // Cargar logs del proyecto
        loadThesisLogs(data.id);
      } else {
        setUserThesisProject(null);
        setCurrentStep(1); // Sin proyecto
        setThesisLogs([]); // Limpiar logs
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Función para cargar los logs de trámites del proyecto
  const loadThesisLogs = async (projectId: string) => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('tram_thesis_log')
        .select(`
          id,
          step_number,
          estado_anterior,
          estado_nuevo,
          accion,
          descripcion,
          actor_nombre,
          actor_tipo,
          observaciones,
          fecha_accion,
          is_milestone
        `)
        .eq('thesis_project_id', projectId)
        .eq('is_active', true)
        .order('fecha_accion', { ascending: false });

      if (error) {
        console.error('Error cargando logs:', error);
        return;
      }

      setThesisLogs(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Función para determinar el paso actual según el estado
  const getStepFromState = (estado: string): number => {
    for (const [step, states] of Object.entries(STEP_MAPPING)) {
      if (states.includes(estado)) {
        return parseInt(step);
      }
    }
    return 1; // Default al paso 1
  };

  // Función para determinar si un paso está desbloqueado
  const isStepUnlocked = (step: number): boolean => {
    return step <= currentStep;
  };

  // Función para obtener estilos del paso
  const getStepStyles = (step: number) => {
    const isUnlocked = isStepUnlocked(step);
    const isCurrent = step === currentStep;
    
    return {
      container: `relative flex items-start mb-8 transition-all duration-300 ${
        isUnlocked ? 'opacity-100' : 'opacity-30'
      }`,
      circle: `flex-shrink-0 w-16 h-16 text-white rounded-full flex items-center justify-center font-bold text-lg z-10 ${
        isCurrent ? 'ring-4 ring-blue-300 ring-opacity-50 scale-110' : ''
      } transition-all duration-300`,
      content: `ml-6 bg-white p-4 rounded-lg flex-1 transition-all duration-300 ${
        isCurrent ? 'shadow-lg border-2 border-blue-300' : 'shadow-sm'
      }`
    };
  };

  const checkAuth = async () => {
    console.log('🔐 TESISTA: Iniciando verificación de autenticación');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📊 TESISTA: Sesión obtenida:', session ? 'presente' : 'ausente');
      
      if (!session) {
        console.log('❌ TESISTA: No hay sesión, redirigiendo al login');
        router.push('/');
        return;
      }

      console.log('🔍 TESISTA: Obteniendo datos del usuario de la BD');
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error) {
        console.error('❌ TESISTA: Error al obtener datos del usuario:', error);
        router.push('/dashboard');
        return;
      }

      console.log('📊 TESISTA: Datos del usuario obtenidos:', {
        dni: userData.dni,
        codigo_matricula: userData.codigo_matricula,
        first_time_setup_completed: userData.first_time_setup_completed
      });

      if (!userData.dni || !userData.codigo_matricula) {
        console.log('📝 TESISTA: Usuario no tiene DNI o código de matrícula, redirigiendo al dashboard');
        router.push('/dashboard');
        return;
      }

      console.log('✅ TESISTA: Usuario tiene datos completos, permitiendo acceso');

      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || `${userData.first_name} ${userData.last_name}`.trim() || userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name || '',
        avatar_url: userData.avatar_url,
        dni: userData.dni,
        codigo_matricula: userData.codigo_matricula,
        student_id: userData.student_id || userData.codigo_matricula
      };

      setUser(userProfile);
      console.log('👤 TESISTA: Usuario configurado correctamente');
      
    } catch (error) {
      console.error('💥 TESISTA: Error en autenticación:', error);
      router.push('/');
    } finally {
      console.log('🏁 TESISTA: Finalizando checkAuth');
      setLoading(false);
    }
  };

  const loadLineasInvestigacion = async () => {
    try {
      // Simulación de datos - reemplazar con llamada real a supabase
      // const { data, error } = await supabase
      //   .from('lineas_investigacion')
      //   .select(`
      //     *,
      //     responsable:profesores(id, full_name, email)
      //   `)
      //   .eq('carrera', user?.carrera)

      // Datos de ejemplo basados en la carrera del usuario
      const lineasEjemplo: LineaInvestigacion[] = [
        {
          id: '1',
          nombre: 'Inteligencia Artificial y Machine Learning',
          descripcion: 'Investigación en algoritmos de aprendizaje automático, redes neuronales, procesamiento de lenguaje natural y visión por computadora.',
          carrera: 'Ingeniería de Sistemas',
          responsable: {
            id: 'prof1',
            full_name: 'Dr. Carlos Mendoza Ruiz',
            email: 'carlos.mendoza@universidad.edu.pe'
          }
        },
        {
          id: '2',
          nombre: 'Desarrollo Web y Aplicaciones Móviles',
          descripcion: 'Desarrollo de aplicaciones web modernas, frameworks JavaScript, aplicaciones móviles nativas e híbridas.',
          carrera: 'Ingeniería de Sistemas',
          responsable: {
            id: 'prof2',
            full_name: 'Mg. Ana Patricia Flores',
            email: 'ana.flores@universidad.edu.pe'
          }
        },
        {
          id: '3',
          nombre: 'Ciberseguridad y Redes',
          descripcion: 'Seguridad informática, ethical hacking, análisis de vulnerabilidades, administración de redes y sistemas.',
          carrera: 'Ingeniería de Sistemas',
          responsable: {
            id: 'prof3',
            full_name: 'Dr. Miguel Torres Vega',
            email: 'miguel.torres@universidad.edu.pe'
          }
        },
        {
          id: '4',
          nombre: 'Base de Datos y Big Data',
          descripcion: 'Diseño de bases de datos, optimización de consultas, análisis de grandes volúmenes de datos, data mining.',
          carrera: 'Ingeniería de Sistemas',
          responsable: {
            id: 'prof4',
            full_name: 'Mg. Rosa Elena Quispe',
            email: 'rosa.quispe@universidad.edu.pe'
          }
        },
        {
          id: '5',
          nombre: 'Realidad Virtual y Aumentada',
          descripcion: 'Desarrollo de aplicaciones de realidad virtual y aumentada, gráficos 3D, interfaces inmersivas.',
          carrera: 'Ingeniería de Sistemas',
          responsable: {
            id: 'prof5',
            full_name: 'Dr. Jorge Luis Ramirez',
            email: 'jorge.ramirez@universidad.edu.pe'
          }
        },
        {
          id: '6',
          nombre: 'Sistemas de Información Empresarial',
          descripcion: 'ERP, CRM, Business Intelligence, arquitectura empresarial, gestión de procesos de negocio.',
          carrera: 'Ingeniería de Sistemas',
          responsable: {
            id: 'prof6',
            full_name: 'Mg. Patricia Silva Ochoa',
            email: 'patricia.silva@universidad.edu.pe'
          }
        }
      ];

      setLineasInvestigacion(lineasEjemplo);
    } catch (error) {
      console.error('Error cargando líneas de investigación:', error);
    }
  };

  const sections = [
    {
      id: 'inicio',
      title: 'INICIO',
      icon: Home,
    },
    {
      id: 'lineas',
      title: 'LÍNEAS DE INVESTIGACIÓN',
      icon: Search,
    },
    {
      id: 'herramientas',
      title: 'HERRAMIENTA DE TESISTA',
      icon: Settings,
    },
    {
      id: 'consultas',
      title: 'CONSULTA Y TRÁMITES',
      icon: MessageSquare,
    },
    {
      id: 'formatos',
      title: 'FORMATOS',
      icon: Folder,
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white flex flex-col`}>
      <Header 
        title="Portal del Tesista - SIPeT" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      {/* Welcome Dropdown Bar */}
      <div className="w-full flex justify-center">
        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between px-4 py-2 text-xs text-white font-medium transition-all duration-200 hover:bg-gray-600"
            style={{ backgroundColor: '#6B7280' }}
          >
            <span>Bienvenido a SIPeT Tesistas</span>
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-10 text-sm text-gray-800 shadow-2xl border border-gray-300 rounded-lg w-[500px] max-w-4xl" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="p-4 space-y-3">
                {/* Descripción principal */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-sm leading-relaxed">
                    <strong>Sistema Integral para el Proceso y Evaluación de Tesis</strong> - La Plataforma <em className="font-semibold text-blue-800">SIPeT</em> tiene por objetivo agilizar el proceso de investigación con las herramientas necesarias para realizar el trámite de tu proyecto y borrador de Tesis.
                  </p>
                </div>

                {/* Título de recomendaciones */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                  <h3 className="font-bold text-yellow-800 text-center text-base">📋 RECOMENDACIONES</h3>
                </div>

                {/* Lista de recomendaciones */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Antes de iniciar su trámite revise los <strong>reglamentos de proyecto y borrador de tesis</strong> <em>(Sección Herramientas del tesista)</em></p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Elabore su proyecto y borrador de tesis de acuerdo a los <strong>formatos</strong> que su Escuela ha establecido</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Tanto el proyecto y borrador de tesis deberá contar con el <span className="bg-yellow-200 px-1 rounded font-semibold">informe de similitud TURNITIN</span> realizado y firmado <em>exclusivamente</em> por su director de tesis</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Usted deberá cargar su proyecto y borrador de tesis en <span className="bg-red-200 px-2 py-1 rounded font-bold text-red-800">formato PDF</span></p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Identificar la <strong>Línea de Investigación</strong> a la que pertenece su tema de Investigación</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Elija su <strong>Asesor/Director</strong> de proyecto de tesis. Los <em>3 jurados de tesis</em> serán sorteados por el Director de la Unidad de investigación de su facultad a través de la <span className="font-semibold text-blue-800">Plataforma SIPeT</span></p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Buscar Información en la sección <strong>Herramientas del Tesista</strong></p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm">Los trámites y consultas sobre el proceso de proyecto y borrador de tesis se realizan en la <strong>Coordinación de Investigación</strong> de cada Facultad, ver <em>Consultas y trámites</em></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full flex justify-center py-4">
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="inicio" className="w-full">
            <TabsList className="w-full h-auto p-0 flex justify-center rounded-lg overflow-hidden !bg-[#0039A6]">
              {sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <TabsTrigger 
                    key={section.id}
                    value={section.id}
                    className="flex flex-col items-center py-4 px-8 text-xs font-medium transition-all duration-200 flex-1 min-w-0 !text-white !bg-transparent !shadow-none hover:!bg-black/20 hover:!text-white data-[state=active]:!bg-blue-800 data-[state=active]:!text-white data-[state=active]:hover:!bg-blue-900"
                    style={{ 
                      borderRight: index < sections.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none'
                    }}
                  >
                    <IconComponent className="w-8 h-8 mb-2" />
                    <span className="text-xs whitespace-nowrap">{section.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Contents */}
            <div className="bg-white min-h-[600px]">
              <TabsContent value="inicio" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  
                  {/* Timeline */}
                  <div className="relative">
                    {/* Línea vertical del timeline */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                    
                    {/* Paso 1 */}
                    <div className={getStepStyles(1).container}>
                      <div className={`${getStepStyles(1).circle} bg-blue-400`}>1</div>
                      <div className={`${getStepStyles(1).content} border-l-4 border-blue-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Carga Proyecto</h3>
                            <p className="text-sm text-gray-700">Una vez cargado el proyecto la Coordinación de Investigación de la Facultad procederá a revisar el formato del proyecto.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            {userThesisProject ? (
                              // Mostrar información del proyecto cargado
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full max-w-[250px]">
                                <div className="text-center mb-3">
                                  <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
                                    ✓ Proyecto Cargado
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">Título:</p>
                                    <p 
                                      className="text-sm font-semibold text-gray-900 leading-tight cursor-help overflow-hidden"
                                      title={userThesisProject.titulo}
                                      style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical' as const,
                                        maxHeight: '2.5em'
                                      }}
                                    >
                                      {userThesisProject.titulo}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">Fecha de subida:</p>
                                    <p className="text-sm text-gray-800">
                                      {new Date(userThesisProject.fecha_carga || userThesisProject.created_at).toLocaleDateString('es-PE', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  
                                  {userThesisProject.archivo_url ? (
                                    <div className="pt-2">
                                      <a 
                                        href={userThesisProject.archivo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                                        onClick={(e) => {
                                          // Verificar que la URL sea válida
                                          if (!userThesisProject.archivo_url || userThesisProject.archivo_url.trim() === '') {
                                            e.preventDefault();
                                            alert('Archivo no disponible para descarga');
                                          }
                                        }}
                                      >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Descargar PDF
                                      </a>
                                      {userThesisProject.archivo_nombre && (
                                        <p className="text-xs text-gray-500 mt-1 truncate" title={userThesisProject.archivo_nombre}>
                                          {userThesisProject.archivo_nombre}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="pt-2">
                                      <div className="inline-flex items-center justify-center w-full px-3 py-2 bg-gray-300 text-gray-500 text-xs font-medium rounded-md cursor-not-allowed">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Archivo no disponible
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Mostrar botón para subir proyecto
                              <>
                                <button 
                                  onClick={() => setIsProyTesisModalOpen(true)}
                                  disabled={!isStepUnlocked(1)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                                    !isStepUnlocked(1)
                                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                >
                                  Subir mi Proyecto de Tesis
                                </button>
                              </>
                            )}
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 1 - Proceso</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 2 */}
                    <div className={getStepStyles(2).container}>
                      <div className={`${getStepStyles(2).circle} bg-green-400`}>2</div>
                      <div className={`${getStepStyles(2).content} border-l-4 border-green-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Director de tesis revisa el proyecto</h3>
                            <p className="text-sm text-gray-700">El Director de Tesis debe de dar el visto bueno y/o conformidad por la plataforma <strong>SIPeT</strong> en un plazo de <span className="bg-yellow-200 px-1 rounded font-semibold">48 horas</span>. Comunícate con tu Director/Asesor para acelerar este procedimiento.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">En espera de</span>
                              <span className="block font-medium">Director de Tesis</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 2 - Pendiente</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 3 */}
                    <div className={getStepStyles(3).container}>
                      <div className={`${getStepStyles(3).circle} bg-yellow-400`}>3</div>
                      <div className={`${getStepStyles(3).content} border-l-4 border-yellow-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Listo para Sorteo</h3>
                            <p className="text-sm text-gray-700">El proyecto de tesis fue aprobado por el director de tesis y fue enviado al proceso de sorteo. El sorteo es realizado por la Director de la Unidad de Investigación de cada Facultad a través de la <strong>Plataforma SIPeT</strong>, para verificar el estado de este proceso puede usar la sección de contacto para comunicarse con la Coordinación de su Facultad.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">En proceso de</span>
                              <span className="block font-medium">Sorteo de Jurados</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 3 - En curso</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 4 */}
                    <div className={getStepStyles(4).container}>
                      <div className={`${getStepStyles(4).circle} bg-orange-400`}>4</div>
                      <div className={`${getStepStyles(4).content} border-l-4 border-orange-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">En revisión de jurados</h3>
                            <p className="text-sm text-gray-700">El proyecto se encuentra en revisión por los jurados de tesis durante un periodo máximo de <span className="bg-red-200 px-1 rounded font-semibold">(7 días laborables desde la fecha de asignación de los jurados)</span>, en caso de que algún miembro jurado no de respuesta, puede solicitar la notificación y/o habilitación del trámite a su Coordinación de investigación para avanzar hacia la siguiente etapa de <strong>DICTAMEN</strong>.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">Esperando</span>
                              <span className="block font-medium">Revisión de Jurados</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 4 - En revisión</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 5 */}
                    <div className={getStepStyles(5).container}>
                      <div className={`${getStepStyles(5).circle} bg-purple-400`}>5</div>
                      <div className={`${getStepStyles(5).content} border-l-4 border-purple-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Subida de archivo corregido / dictamen de proyecto de tesis</h3>
                            <p className="text-sm text-gray-700">Una vez <strong>FINALIZADO</strong> el proceso de correcciones por la totalidad de los miembros de jurado el tesista deberá levantar las correcciones realizar y cargar nuevamente el archivo <span className="bg-red-200 px-1 rounded font-semibold">(lo corregido deberá estar en letras de color rojo)</span> y si su escuela lo requiere adjuntar el Informe de correcciones. Una vez cargado este archivo el estado del proyecto avanzará a la etapa de <strong>DICTAMEN</strong>.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">Pendiente</span>
                              <span className="block font-medium">Subir Correcciones</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 5 - Acción requerida</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 6 */}
                    <div className={getStepStyles(6).container}>
                      <div className={`${getStepStyles(6).circle} bg-green-400`}>6</div>
                      <div className={`${getStepStyles(6).content} border-l-4 border-green-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Proyecto de tesis aprobado</h3>
                            <p className="text-sm text-gray-700">El proyecto de tesis fue aprobado de acuerdo a una de las siguientes modalidades: <em>unanimidad, mayoría o reglamento</em>. A partir de la fecha consignada en el Acta de aprobación usted puede ejecutar su proyecto por un periodo <span className="bg-green-200 px-1 rounded font-semibold">mínimo de 3 meses</span> antes de avanzar hacia la etapa de borrador de tesis.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-green-600 text-sm">
                              <span className="block">✓ Proyecto</span>
                              <span className="block font-medium">Aprobado</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 6 - Completado</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 7 */}
                    <div className={getStepStyles(7).container}>
                      <div className={`${getStepStyles(7).circle} bg-indigo-400`}>7</div>
                      <div className={`${getStepStyles(7).content} border-l-4 border-indigo-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Habilitar la etapa de Borrador de tesis</h3>
                            <p className="text-sm text-gray-700 mb-2">Para habilitar la etapa de borrador de tesis usted deberá de cargar en la Plataforma un solo archivo en <span className="bg-red-200 px-1 rounded font-bold">formato PDF</span> que contenga los siguientes documentos:</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                              <li>Acta de aprobación de proyecto</li>
                              <li>Bachiller (Legalizado)</li>
                              <li>Resolución de Bachiller (conteniendo todas las hojas)</li>
                            </ul>
                            <p className="text-sm text-gray-700 mt-2">Una vez completado este paso usted estará hábil para cargar el archivo de borrador de tesis de acuerdo al formato de su facultad.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">Subir</span>
                              <span className="block font-medium">Documentos PDF</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 7 - Por hacer</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 8 */}
                    <div className={getStepStyles(8).container}>
                      <div className={`${getStepStyles(8).circle} bg-cyan-400`}>8</div>
                      <div className={`${getStepStyles(8).content} border-l-4 border-cyan-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Borrador de tesis cargado a la Plataforma</h3>
                            <p className="text-sm text-gray-700">Usted registró en la Plataforma el Borrador de tesis. Este archivo será revisado y validado por la Coordinación de investigación de su facultad para corroborar si este cumple los requisitos de formato. Si los formatos son válidos su archivo será remitido a los jurados para el proceso de corrección y si no, el archivo será rechazado.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">En validación</span>
                              <span className="block font-medium">Coordinación</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 8 - En proceso</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 9 */}
                    <div className={getStepStyles(9).container}>
                      <div className={`${getStepStyles(9).circle} bg-rose-400`}>9</div>
                      <div className={`${getStepStyles(9).content} border-l-4 border-rose-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Borrador en revisión por jurados</h3>
                            <p className="text-sm text-gray-700">El borrador de tesis se encuentra en revisión por los miembros de jurado de tesis, el plazo máximo es de <span className="bg-yellow-200 px-1 rounded font-semibold">10 días hábiles</span> a partir de la fecha en que se asignó el archivo a los jurados. Una vez completada la corrección por la integridad de los miembros de jurado y director de la tesis usted deberá solicitar a la Coordinación de investigación la reunión de dictamen. Solo cuando haya finalizado el proceso de reunión de dictamen, obtenga el Acta de dictamen (con la fecha de sustentación) y haya finalizado el proceso en el repositorio institucional (URL de repositorio) usted deberá cargar el archivo final de su borrador de tesis a la Plataforma.</p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">En revisión</span>
                              <span className="block font-medium">Jurados de Tesis</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 9 - En proceso</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 10 */}
                    <div className={getStepStyles(10).container}>
                      <div className={`${getStepStyles(10).circle} bg-teal-400`}>10</div>
                      <div className={`${getStepStyles(10).content} border-l-4 border-teal-400`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">Reunión de dictamen / carga de archivo de borrador final</h3>
                            <p className="text-sm text-gray-700 mb-2">El archivo final de borrador de tesis ha sido cargado a la <strong>Plataforma SIPeT</strong>. Ahora usted deberá solicitar la publicación de la <strong>EXPOSICIÓN Y DEFENSA DE TESIS</strong> haciendo click en la opción <span className="bg-blue-200 px-1 rounded font-semibold">SUSTENTACIÓN</span> de su Plataforma SIPeT.</p>
                            <p className="text-sm text-gray-700 mb-1">Para lo cual usted deberá tener los siguientes datos:</p>
                            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                              <li>Fecha de reunión de dictamen</li>
                              <li>Fecha de sustentación</li>
                              <li>URL de repositorio</li>
                              <li>Diapositivas en formato PDF</li>
                            </ul>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-gray-400 text-sm">
                              <span className="block">Programar</span>
                              <span className="block font-medium">Sustentación</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 10 - Por programar</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 11 */}
                    <div className={getStepStyles(11).container}>
                      <div className={`${getStepStyles(11).circle} bg-green-500`}>11</div>
                      <div className={`${getStepStyles(11).content} border-l-4 border-green-500`}>
                        <div className="flex items-start justify-between">
                          {/* Contenido izquierdo */}
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-lg text-black mb-2">🎓 Sustentación de Tesis</h3>
                            <p className="text-sm text-gray-700">El proceso en la <strong>Plataforma SIPeT</strong> ha concluido con su sustentación. <span className="font-semibold text-green-700">¡Felicitaciones!</span></p>
                          </div>
                          
                          {/* Separador vertical */}
                          <div className="w-px bg-gray-300 h-16 mx-4"></div>
                          
                          {/* Columna de acción derecha */}
                          <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-center text-green-600 text-sm">
                              <span className="block">✓ Proceso</span>
                              <span className="block font-medium">Finalizado</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 text-center">Paso 11 - Completado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Historial de Trámites */}
                  {userThesisProject && thesisLogs.length > 0 && (
                    <div className="mt-12 bg-white rounded-lg shadow-lg border border-gray-200">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-2">Historial de Trámites</h3>
                            <p className="text-blue-100">
                              Seguimiento detallado de tu proceso de tesis
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                              <span className="text-sm font-medium">{thesisLogs.length} eventos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {loadingLogs ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Cargando historial...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {thesisLogs.map((log, index) => (
                              <div 
                                key={log.id} 
                                className={`border-l-4 pl-6 py-4 ${
                                  log.is_milestone 
                                    ? 'border-yellow-400 bg-yellow-50' 
                                    : 'border-gray-300 bg-gray-50'
                                } rounded-r-lg transition-all duration-200 hover:shadow-md`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      {log.is_milestone && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                                          ⭐ Hito
                                        </span>
                                      )}
                                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                        Paso {log.step_number}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(log.fecha_accion).toLocaleString('es-PE', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                      {log.accion}
                                    </h4>
                                    
                                    {log.descripcion && (
                                      <p className="text-sm text-gray-600 mb-2">
                                        {log.descripcion}
                                      </p>
                                    )}
                                    
                                    {log.observaciones && (
                                      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mt-2">
                                        <strong>Observaciones:</strong> {log.observaciones}
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 mt-2">
                                      {log.estado_anterior && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                          De: {log.estado_anterior.replace('_', ' ')}
                                        </span>
                                      )}
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        A: {log.estado_nuevo.replace('_', ' ')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right flex-shrink-0">
                                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                                      <p className="text-xs text-gray-500 mb-1">Realizado por:</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {log.actor_nombre}
                                      </p>
                                      <p className="text-xs text-gray-500 capitalize">
                                        ({log.actor_tipo})
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {index < thesisLogs.length - 1 && (
                                  <div className="mt-4 border-b border-gray-200"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="lineas" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">

                  <div className="space-y-4">
                    {lineasInvestigacion.map((linea, index) => (
                      <div key={linea.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {/* Header de la línea */}
                        <button
                          onClick={() => setExpandedLinea(expandedLinea === linea.id ? null : linea.id)}
                          className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between text-left"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{linea.nombre}</h3>
                              <p className="text-sm text-gray-600 mt-1">{linea.descripcion}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {expandedLinea === linea.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                        
                        {/* Contenido expandible */}
                        {expandedLinea === linea.id && (
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                  <span className="text-sm font-semibold">
                                    {linea.responsable.full_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900">Responsable de Línea</h4>
                                <p className="text-sm text-gray-800 font-medium">{linea.responsable.full_name}</p>
                                <p className="text-sm text-blue-600">
                                  <a href={`mailto:${linea.responsable.email}`} className="hover:underline">
                                    {linea.responsable.email}
                                  </a>
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <a
                                  href={`mailto:${linea.responsable.email}?subject=Consulta sobre línea de investigación: ${linea.nombre}`}
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Contactar
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="herramientas" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <div className="space-y-6">
                    {/* Reglamentos */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Reglamentos</h3>
                            <p className="text-sm text-gray-600">Documentos oficiales y reglamentos vigentes</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Reglamento de Proyecto de Tesis */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">PDF</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Reglamento de Proyecto de Tesis</h4>
                                <p className="text-sm text-gray-600 mb-3">Normativa para la elaboración y presentación del proyecto de tesis</p>
                                <a 
                                  href="/documents/reglamento-proyecto-tesis.pdf" 
                                  target="_blank"
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Descargar PDF
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Reglamento de Borrador de Tesis */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">PDF</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Reglamento de Borrador de Tesis</h4>
                                <p className="text-sm text-gray-600 mb-3">Normativa para la elaboración y presentación del borrador de tesis</p>
                                <a 
                                  href="/documents/reglamento-borrador-tesis.pdf" 
                                  target="_blank"
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Descargar PDF
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Reglamento General de Investigación */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">PDF</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Reglamento General de Investigación</h4>
                                <p className="text-sm text-gray-600 mb-3">Marco normativo general para actividades de investigación</p>
                                <a 
                                  href="/documents/reglamento-general-investigacion.pdf" 
                                  target="_blank"
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Descargar PDF
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Manual de Sustentación */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">PDF</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Manual de Sustentación</h4>
                                <p className="text-sm text-gray-600 mb-3">Guía para el proceso de sustentación y defensa de tesis</p>
                                <a 
                                  href="/documents/manual-sustentacion.pdf" 
                                  target="_blank"
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Descargar PDF
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recursos para Citas Bibliográficas */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center">
                            <Search className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recursos para Citas Bibliográficas</h3>
                            <p className="text-sm text-gray-600">Herramientas y guías para citas y referencias</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Guía APA */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">APA</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Guía de Estilo APA 7ma Edición</h4>
                                <p className="text-sm text-gray-600 mb-3">Manual completo para citas y referencias en formato APA</p>
                                <div className="flex space-x-2">
                                  <a 
                                    href="/documents/guia-apa-7.pdf" 
                                    target="_blank"
                                    className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors"
                                  >
                                    Descargar PDF
                                  </a>
                                  <a 
                                    href="https://apastyle.apa.org/" 
                                    target="_blank"
                                    className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                                  >
                                    Sitio Oficial
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Gestores de Referencias */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Settings className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Gestores de Referencias</h4>
                                <p className="text-sm text-gray-600 mb-3">Herramientas para organizar y gestionar referencias bibliográficas</p>
                                <div className="space-y-2">
                                  <div className="flex space-x-2">
                                    <a 
                                      href="https://www.zotero.org/" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                                    >
                                      Zotero
                                    </a>
                                    <a 
                                      href="https://www.mendeley.com/" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                                    >
                                      Mendeley
                                    </a>
                                  </div>
                                  <div className="flex space-x-2">
                                    <a 
                                      href="https://endnote.com/" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 transition-colors"
                                    >
                                      EndNote
                                    </a>
                                    <a 
                                      href="/documents/tutorial-gestores.pdf" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                                    >
                                      Tutorial PDF
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bases de Datos Académicas */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                <Search className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Bases de Datos Académicas</h4>
                                <p className="text-sm text-gray-600 mb-3">Acceso a fuentes académicas confiables</p>
                                <div className="space-y-2">
                                  <div className="flex space-x-2">
                                    <a 
                                      href="https://scholar.google.com/" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                    >
                                      Google Scholar
                                    </a>
                                    <a 
                                      href="https://www.scopus.com/" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                                    >
                                      Scopus
                                    </a>
                                  </div>
                                  <div className="flex space-x-2">
                                    <a 
                                      href="https://www.webofscience.com/" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                    >
                                      Web of Science
                                    </a>
                                    <a 
                                      href="https://scielo.org/" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                                    >
                                      SciELO
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verificadores de Plagio */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">✓</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Verificadores de Originalidad</h4>
                                <p className="text-sm text-gray-600 mb-3">Herramientas para verificar la originalidad del trabajo</p>
                                <div className="space-y-2">
                                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                                    <p className="text-xs text-yellow-800">
                                      <strong>Importante:</strong> El informe TURNITIN oficial debe ser realizado exclusivamente por tu director de tesis
                                    </p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <a 
                                      href="/documents/guia-turnitin.pdf" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                    >
                                      Guía TURNITIN
                                    </a>
                                    <a 
                                      href="/documents/interpretacion-similitud.pdf" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                                    >
                                      Interpretación
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recursos e Información */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recursos e Información</h3>
                            <p className="text-sm text-gray-600">Información adicional y recursos útiles</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Metodología de Investigación */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">📚</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Metodología de Investigación</h4>
                                <p className="text-sm text-gray-600 mb-3">Guías y recursos sobre metodología científica</p>
                                <div className="space-y-2">
                                  <a 
                                    href="/documents/metodologia-investigacion.pdf" 
                                    target="_blank"
                                    className="block w-fit px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 transition-colors"
                                  >
                                    Manual de Metodología
                                  </a>
                                  <a 
                                    href="/documents/tipos-investigacion.pdf" 
                                    target="_blank"
                                    className="block w-fit px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                                  >
                                    Tipos de Investigación
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Redacción Académica */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">✍️</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Redacción Académica</h4>
                                <p className="text-sm text-gray-600 mb-3">Guías para mejorar la redacción científica</p>
                                <div className="space-y-2">
                                  <a 
                                    href="/documents/manual-redaccion-academica.pdf" 
                                    target="_blank"
                                    className="block w-fit px-3 py-1 bg-pink-600 text-white text-xs font-medium rounded-md hover:bg-pink-700 transition-colors"
                                  >
                                    Manual de Redacción
                                  </a>
                                  <a 
                                    href="/documents/ortografia-gramatica.pdf" 
                                    target="_blank"
                                    className="block w-fit px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                                  >
                                    Ortografía y Gramática
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Estadística y Análisis */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">📊</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Estadística y Análisis de Datos</h4>
                                <p className="text-sm text-gray-600 mb-3">Herramientas para análisis estadístico</p>
                                <div className="space-y-2">
                                  <div className="flex space-x-2">
                                    <a 
                                      href="/documents/spss-basico.pdf" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                    >
                                      Manual SPSS
                                    </a>
                                    <a 
                                      href="/documents/excel-estadistica.pdf" 
                                      target="_blank"
                                      className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                    >
                                      Excel Estadístico
                                    </a>
                                  </div>
                                  <a 
                                    href="/documents/interpretacion-resultados.pdf" 
                                    target="_blank"
                                    className="block w-fit px-3 py-1 bg-cyan-600 text-white text-xs font-medium rounded-md hover:bg-cyan-700 transition-colors"
                                  >
                                    Interpretación de Resultados
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contacto y Soporte */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">📞</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Contacto y Soporte</h4>
                                <p className="text-sm text-gray-600 mb-3">Canales de comunicación y ayuda</p>
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-700">
                                    <p><strong>Coordinación de Investigación:</strong></p>
                                    <p>📧 investigacion@universidad.edu.pe</p>
                                    <p>📞 (01) 123-4567 ext. 123</p>
                                  </div>
                                  <a 
                                    href="/documents/directorio-contactos.pdf" 
                                    target="_blank"
                                    className="block w-fit px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                                  >
                                    Directorio Completo
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="consultas" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Consultas y Trámites</h2>
                    <p className="text-gray-600">Información de contacto y trámites de la Unidad de Investigación</p>
                  </div>

                  <div className="space-y-6">
                    {/* Información de la Unidad de Investigación */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Unidad de Investigación - Ingeniería de Sistemas</h3>
                            <p className="text-sm text-gray-600">Facultad de Ingeniería y Arquitectura</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Información de Contacto */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">📞</span>
                              Información de Contacto
                            </h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs">📧</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                                  <a href="mailto:investigacion.sistemas@universidad.edu.pe" className="text-sm text-blue-600 hover:underline">
                                    investigacion.sistemas@universidad.edu.pe
                                  </a>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs">📱</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Teléfono/WhatsApp</p>
                                  <p className="text-sm text-gray-700">(01) 456-7890</p>
                                  <p className="text-sm text-gray-700">Celular: +51 987-654-321</p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs">🏢</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Oficina</p>
                                  <p className="text-sm text-gray-700">Edificio B - Piso 3 - Oficina 301</p>
                                  <p className="text-sm text-gray-700">Facultad de Ingeniería y Arquitectura</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Horarios y Personal */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 text-lg mb-3 flex items-center">
                              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">🕐</span>
                              Horarios de Atención
                            </h4>
                            
                            <div className="space-y-3">
                              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <h5 className="font-medium text-blue-900 mb-2">Atención Presencial</h5>
                                <div className="text-sm text-blue-800 space-y-1">
                                  <p><strong>Lunes a Viernes:</strong> 8:00 AM - 5:00 PM</p>
                                  <p><strong>Sábados:</strong> 8:00 AM - 12:00 PM</p>
                                  <p className="text-xs italic">*Horario de refrigerio: 1:00 PM - 2:00 PM</p>
                                </div>
                              </div>

                              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                <h5 className="font-medium text-green-900 mb-2">Atención Virtual</h5>
                                <div className="text-sm text-green-800 space-y-1">
                                  <p><strong>WhatsApp:</strong> 24/7 (respuesta en horario laboral)</p>
                                  <p><strong>Correo:</strong> Respuesta máximo 48 horas</p>
                                  <p><strong>Videollamadas:</strong> Previa cita</p>
                                </div>
                              </div>

                              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                <h5 className="font-medium text-yellow-900 mb-2">Personal Responsable</h5>
                                <div className="text-sm text-yellow-800 space-y-1">
                                  <p><strong>Director:</strong> Dr. Carlos Mendoza Ruiz</p>
                                  <p><strong>Coordinador:</strong> Mg. Ana Patricia Flores</p>
                                  <p><strong>Asistente:</strong> Lic. María Rodriguez</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tipos de Trámites y Consultas */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-teal-50 border-b border-teal-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Trámites y Consultas Disponibles</h3>
                            <p className="text-sm text-gray-600">Servicios que puedes solicitar en la Unidad de Investigación</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Trámites de Proyecto */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">1</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Proyecto de Tesis</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• Revisión de formato</li>
                                  <li>• Asignación de jurados</li>
                                  <li>• Consultas sobre líneas de investigación</li>
                                  <li>• Seguimiento del proceso</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Trámites de Borrador */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">2</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Borrador de Tesis</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• Habilitación de etapa</li>
                                  <li>• Validación de documentos</li>
                                  <li>• Programación de dictamen</li>
                                  <li>• Coordinación de sustentación</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Documentación */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">📄</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Documentación</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• Constancias y certificados</li>
                                  <li>• Cartas de presentación</li>
                                  <li>• Formatos oficiales</li>
                                  <li>• Cronogramas de sustentación</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Soporte Técnico */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                <Settings className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Soporte Técnico</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• Problemas con la plataforma</li>
                                  <li>• Carga de archivos</li>
                                  <li>• Acceso al sistema</li>
                                  <li>• Reseteo de contraseñas</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información Importante */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center">
                          <span className="text-lg">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 mb-2">Información Importante</h4>
                          <div className="text-sm text-red-800 space-y-2">
                            <p>• Todos los trámites deben iniciarse a través de la <strong>Plataforma SIPeT</strong></p>
                            <p>• Para atención presencial es <strong>obligatorio solicitar cita previa</strong></p>
                            <p>• Los documentos deben estar en <strong>formato PDF</strong> y debidamente firmados</p>
                            <p>• Los tiempos de respuesta pueden variar según la complejidad del trámite</p>
                            <p>• Mantén actualizada tu información de contacto en la plataforma</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contacto Rápido */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                      <h4 className="font-semibold text-gray-900 mb-4">¿Necesitas ayuda inmediata?</h4>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <a 
                          href="mailto:investigacion.sistemas@universidad.edu.pe?subject=Consulta desde SIPeT - Tesista"
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <span className="mr-2">📧</span>
                          Enviar Correo
                        </a>
                        <a 
                          href="https://wa.me/51987654321?text=Hola, necesito ayuda con mi proceso de tesis en SIPeT"
                          target="_blank"
                          className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <span className="mr-2">📱</span>
                          WhatsApp
                        </a>
                        <a 
                          href="tel:+5114567890"
                          className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <span className="mr-2">📞</span>
                          Llamar
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="formatos" className="py-8 px-0">
                <div className="mx-auto px-8 w-full max-w-4xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Formatos</h2>
                    <p className="text-gray-600">Descarga los formatos oficiales necesarios para tu proceso de tesis</p>
                  </div>

                  <div className="space-y-6">
                    {/* Formatos de Proyecto de Tesis */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">1</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Formatos para Proyecto de Tesis</h3>
                            <p className="text-sm text-gray-600">Documentos necesarios para la primera etapa del proceso</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Formato Principal del Proyecto */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">DOC</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Formato de Proyecto de Tesis</h4>
                                <p className="text-xs text-gray-600 mb-2">Plantilla principal para elaborar el proyecto</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Word</span>
                                  <span className="ml-2">~45 páginas</span>
                                </div>
                                <a 
                                  href="/formats/formato-proyecto-tesis.docx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Carta de Aceptación del Asesor */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">DOC</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Carta de Aceptación</h4>
                                <p className="text-xs text-gray-600 mb-2">Formato para el asesor/director</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Word</span>
                                  <span className="ml-2">1 página</span>
                                </div>
                                <a 
                                  href="/formats/carta-aceptacion-asesor.docx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Matriz de Consistencia */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-orange-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">XLS</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Matriz de Consistencia</h4>
                                <p className="text-xs text-gray-600 mb-2">Plantilla para organizar variables</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Excel</span>
                                  <span className="ml-2">3 hojas</span>
                                </div>
                                <a 
                                  href="/formats/matriz-consistencia.xlsx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Cronograma de Actividades */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">XLS</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Cronograma de Actividades</h4>
                                <p className="text-xs text-gray-600 mb-2">Planificación temporal del proyecto</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Excel</span>
                                  <span className="ml-2">Gantt</span>
                                </div>
                                <a 
                                  href="/formats/cronograma-actividades.xlsx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Presupuesto */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-teal-50 to-teal-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">XLS</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Formato de Presupuesto</h4>
                                <p className="text-xs text-gray-600 mb-2">Detalle de costos del proyecto</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded">Excel</span>
                                  <span className="ml-2">Calculado</span>
                                </div>
                                <a 
                                  href="/formats/presupuesto-proyecto.xlsx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Solicitud de Proyecto */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-50 to-indigo-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">PDF</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Solicitud de Proyecto</h4>
                                <p className="text-xs text-gray-600 mb-2">Formulario de registro oficial</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">PDF</span>
                                  <span className="ml-2">Fillable</span>
                                </div>
                                <a 
                                  href="/formats/solicitud-proyecto.pdf" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formatos de Borrador de Tesis */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-green-50 border-b border-green-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">2</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Formatos para Borrador de Tesis</h3>
                            <p className="text-sm text-gray-600">Documentos para la segunda etapa del proceso</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Formato Principal del Borrador */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">DOC</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Formato de Borrador de Tesis</h4>
                                <p className="text-xs text-gray-600 mb-2">Plantilla completa para la tesis</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Word</span>
                                  <span className="ml-2">~100 páginas</span>
                                </div>
                                <a 
                                  href="/formats/formato-borrador-tesis.docx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Carátula de Tesis */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">DOC</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Carátula de Tesis</h4>
                                <p className="text-xs text-gray-600 mb-2">Portada oficial de la tesis</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Word</span>
                                  <span className="ml-2">1 página</span>
                                </div>
                                <a 
                                  href="/formats/caratula-tesis.docx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Formato de Diapositivas */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-orange-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">PPT</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Diapositivas de Sustentación</h4>
                                <p className="text-xs text-gray-600 mb-2">Plantilla para la presentación</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">PowerPoint</span>
                                  <span className="ml-2">20 slides</span>
                                </div>
                                <a 
                                  href="/formats/diapositivas-sustentacion.pptx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Acta de Originalidad */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-red-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">PDF</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Acta de Originalidad</h4>
                                <p className="text-xs text-gray-600 mb-2">Declaración del autor</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">PDF</span>
                                  <span className="ml-2">Fillable</span>
                                </div>
                                <a 
                                  href="/formats/acta-originalidad.pdf" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Autorización de Publicación */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">PDF</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Autorización de Publicación</h4>
                                <p className="text-xs text-gray-600 mb-2">Permiso para repositorio</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">PDF</span>
                                  <span className="ml-2">Fillable</span>
                                </div>
                                <a 
                                  href="/formats/autorizacion-publicacion.pdf" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Informe de Similitud */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-yellow-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">DOC</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Informe de Similitud</h4>
                                <p className="text-xs text-gray-600 mb-2">Para el director de tesis</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Word</span>
                                  <span className="ml-2">TURNITIN</span>
                                </div>
                                <a 
                                  href="/formats/informe-similitud.docx" 
                                  download
                                  className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-xs font-medium rounded-md hover:bg-yellow-700 transition-colors w-full justify-center"
                                >
                                  📥 Descargar
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formatos Complementarios */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-purple-50 border-b border-purple-200 px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Formatos Complementarios</h3>
                            <p className="text-sm text-gray-600">Documentos adicionales y de apoyo</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Constancia de Bachiller */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-50 to-indigo-100">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">PDF</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Constancia de Bachiller</h4>
                                <p className="text-xs text-gray-600 mb-2">Formato de solicitud</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">PDF</span>
                                </div>
                              </div>
                              <a 
                                href="/formats/constancia-bachiller.pdf" 
                                download
                                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors w-full justify-center"
                              >
                                📥 Descargar
                              </a>
                            </div>
                          </div>

                          {/* Ficha de Registro */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-teal-50 to-teal-100">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="w-12 h-12 bg-teal-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">XLS</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Ficha de Registro</h4>
                                <p className="text-xs text-gray-600 mb-2">Datos del tesista</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded">Excel</span>
                                </div>
                              </div>
                              <a 
                                href="/formats/ficha-registro.xlsx" 
                                download
                                className="inline-flex items-center px-3 py-2 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 transition-colors w-full justify-center"
                              >
                                📥 Descargar
                              </a>
                            </div>
                          </div>

                          {/* Encuesta de Satisfacción */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-pink-50 to-pink-100">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="w-12 h-12 bg-pink-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">PDF</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Encuesta de Satisfacción</h4>
                                <p className="text-xs text-gray-600 mb-2">Evaluación del proceso</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">PDF</span>
                                </div>
                              </div>
                              <a 
                                href="/formats/encuesta-satisfaccion.pdf" 
                                download
                                className="inline-flex items-center px-3 py-2 bg-pink-600 text-white text-xs font-medium rounded-md hover:bg-pink-700 transition-colors w-full justify-center"
                              >
                                📥 Descargar
                              </a>
                            </div>
                          </div>

                          {/* Lista de Verificación */}
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="w-12 h-12 bg-gray-600 text-white rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold">DOC</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Lista de Verificación</h4>
                                <p className="text-xs text-gray-600 mb-2">Checklist de documentos</p>
                                <div className="text-xs text-gray-500 mb-3">
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Word</span>
                                </div>
                              </div>
                              <a 
                                href="/formats/lista-verificacion.docx" 
                                download
                                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors w-full justify-center"
                              >
                                📥 Descargar
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información Importante */}
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                          <span className="text-lg">💡</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-900 mb-2">Instrucciones de Uso</h4>
                          <div className="text-sm text-yellow-800 space-y-2">
                            <p>• <strong>Descarga el formato</strong> correspondiente a tu etapa actual en el proceso</p>
                            <p>• <strong>Completa toda la información</strong> solicitada siguiendo las instrucciones internas</p>
                            <p>• <strong>Conserva el formato original</strong> - no modificar márgenes, fuentes ni estructura</p>
                            <p>• <strong>Guarda tu trabajo frecuentemente</strong> y mantén copias de respaldo</p>
                            <p>• <strong>Convierte a PDF</strong> solo cuando esté completamente terminado para subir a la plataforma</p>
                            <p>• <strong>Revisa los reglamentos</strong> en la sección "Herramientas del Tesista" antes de completar</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Soporte */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                      <h4 className="font-semibold text-gray-900 mb-4">¿Problemas con los formatos?</h4>
                      <p className="text-sm text-gray-600 mb-4">Si tienes dificultades para descargar o abrir algún formato, contacta con soporte técnico</p>
                      <a 
                        href="mailto:soporte.sipet@universidad.edu.pe?subject=Problema con formatos - SIPeT"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <span className="mr-2">🔧</span>
                        Solicitar Ayuda
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <Footer />
      
      {/* Modal ProyTesis */}
      {user && (
        <ProyTesis 
          isOpen={isProyTesisModalOpen}
          onClose={() => {
            setIsProyTesisModalOpen(false);
            // Recargar proyecto del usuario después de cerrar el modal
            if (user) {
              loadUserThesisProject();
            }
          }}
          currentUser={user}
        />
      )}
    </div>
  );
}