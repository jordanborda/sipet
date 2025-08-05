import { useState, useEffect } from 'react';
import { X, Upload, FileText, Users, User } from 'lucide-react';

interface Student {
  id: string;
  codigo_matricula: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

interface LineaInvestigacion {
  id: string;
  nombre: string;
  carrera: string;
}

interface ProyTesisProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Student;
}

export default function ProyTesis({ isOpen, onClose, currentUser }: ProyTesisProps) {
  const [tipoProyecto, setTipoProyecto] = useState<'individual' | 'grupal' | null>(null);
  const [codigoCompanero, setCodigoCompanero] = useState('');
  const [companero, setCompanero] = useState<Student | null>(null);
  const [lineasInvestigacion, setLineasInvestigacion] = useState<LineaInvestigacion[]>([]);
  const [lineaSeleccionada, setLineaSeleccionada] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tituloProyecto, setTituloProyecto] = useState('');
  const [resumen, setResumen] = useState('');
  const [palabrasClave, setPalabrasClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulación de líneas de investigación (reemplazar con llamada a API)
  useEffect(() => {
    if (isOpen) {
      // Simulación de datos - reemplazar con llamada real a supabase
      setLineasInvestigacion([
        { id: '1', nombre: 'Inteligencia Artificial y Machine Learning', carrera: 'Ingeniería de Sistemas' },
        { id: '2', nombre: 'Desarrollo Web y Aplicaciones Móviles', carrera: 'Ingeniería de Sistemas' },
        { id: '3', nombre: 'Ciberseguridad y Redes', carrera: 'Ingeniería de Sistemas' },
        { id: '4', nombre: 'Base de Datos y Big Data', carrera: 'Ingeniería de Sistemas' },
        { id: '5', nombre: 'Realidad Virtual y Aumentada', carrera: 'Ingeniería de Sistemas' }
      ]);
    }
  }, [isOpen]);

  const buscarCompanero = async () => {
    if (!codigoCompanero.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Simulación de búsqueda - reemplazar con llamada real a supabase
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('codigo_matricula', codigoCompanero)
      //   .single();
      
      // Simulación de resultado
      setTimeout(() => {
        if (codigoCompanero === '20190001') {
          setCompanero({
            id: '2',
            codigo_matricula: '20190001',
            full_name: 'María González López',
            first_name: 'María',
            last_name: 'González López'
          });
        } else {
          setError('No se encontró estudiante con ese código de matrícula');
          setCompanero(null);
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Error al buscar compañero');
      setLoading(false);
    }
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('El archivo debe ser un PDF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('El archivo no debe exceder 5MB');
        return;
      }
      setArchivo(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!tipoProyecto || !lineaSeleccionada || !archivo || !tituloProyecto.trim() || !resumen.trim() || !palabrasClave.trim()) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (tipoProyecto === 'grupal' && !companero) {
      setError('Por favor ingrese un código de compañero válido');
      return;
    }

    setLoading(true);
    
    try {
      // Aquí iría la lógica para enviar el proyecto a la base de datos
      console.log('Enviando proyecto:', {
        tipo: tipoProyecto,
        estudiantes: tipoProyecto === 'individual' ? [currentUser] : [currentUser, companero],
        lineaInvestigacion: lineaSeleccionada,
        archivo: archivo.name,
        titulo: tituloProyecto,
        resumen,
        palabrasClave
      });
      
      // Simulación de envío
      setTimeout(() => {
        alert('Proyecto enviado exitosamente');
        onClose();
        // Reset form
        setTipoProyecto(null);
        setCodigoCompanero('');
        setCompanero(null);
        setLineaSeleccionada('');
        setArchivo(null);
        setTituloProyecto('');
        setResumen('');
        setPalabrasClave('');
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Error al enviar el proyecto');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-[900px] h-[700px] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0" style={{ backgroundColor: '#0039A6' }}>
          <h2 className="text-lg font-bold text-white">Subir Proyecto de Tesis</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Tipo de Proyecto */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Tipo de Proyecto</div>
              <div className="col-span-2">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setTipoProyecto('individual');
                      setCompanero(null);
                      setCodigoCompanero('');
                    }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      tipoProyecto === 'individual' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-500 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Individual
                  </button>
                  <button
                    onClick={() => setTipoProyecto('grupal')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      tipoProyecto === 'grupal' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-500 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    Grupal
                  </button>
                </div>
              </div>
            </div>

            {/* Código de Compañero */}
            {tipoProyecto === 'grupal' && (
              <div className="grid grid-cols-3 gap-6 items-start">
                <div className="text-base font-semibold text-gray-900">
                  Código de Matrícula del Compañero *
                </div>
                <div className="col-span-2">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={codigoCompanero}
                      onChange={(e) => setCodigoCompanero(e.target.value)}
                      placeholder=""
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={buscarCompanero}
                      disabled={loading || !codigoCompanero.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Estudiantes */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Estudiantes</div>
              <div className="col-span-2">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-black">{currentUser.full_name}</p>
                    <p className="text-sm text-black">Código: {currentUser.codigo_matricula}</p>
                  </div>
                  
                  {tipoProyecto === 'grupal' && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {companero ? (
                        <>
                          <p className="font-medium text-black">{companero.full_name}</p>
                          <p className="text-sm text-black">Código: {companero.codigo_matricula}</p>
                        </>
                      ) : (
                        <p className="text-black italic">Ingrese código del compañero</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Línea de Investigación */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Línea de Investigación *</div>
              <div className="col-span-2">
                <select
                  value={lineaSeleccionada}
                  onChange={(e) => setLineaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione una línea de investigación</option>
                  {lineasInvestigacion.map((linea) => (
                    <option key={linea.id} value={linea.id}>
                      {linea.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subir Archivo */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Archivo (PDF - Máximo 5MB) *</div>
              <div className="col-span-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleArchivoChange}
                    className="hidden"
                    id="archivo-upload"
                  />
                  <label
                    htmlFor="archivo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {archivo ? (
                      <>
                        <FileText className="w-12 h-12 text-green-500 mb-2" />
                        <p className="text-sm font-medium text-black">{archivo.name}</p>
                        <p className="text-sm text-black">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-black">Haga clic para seleccionar un archivo PDF</p>
                        <p className="text-sm text-black">Máximo 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Título del Proyecto */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Título del Proyecto *</div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={tituloProyecto}
                  onChange={(e) => setTituloProyecto(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Resumen (Abstract) *</div>
              <div className="col-span-2">
                <textarea
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder=""
                  rows={4}
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Palabras Clave */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Palabras Clave (Keywords) *</div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={palabrasClave}
                  onChange={(e) => setPalabrasClave(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="grid grid-cols-3 gap-6">
                <div></div>
                <div className="col-span-2">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-8 py-4 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !tipoProyecto || !lineaSeleccionada || !archivo || !tituloProyecto.trim() || !resumen.trim() || !palabrasClave.trim()}
            className="px-8 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Proyecto'}
          </button>
        </div>
      </div>
    </div>
  );
}