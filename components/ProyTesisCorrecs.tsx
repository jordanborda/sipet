import { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

interface Student {
  id: string;
  codigo_matricula: string;
  full_name: string;
  first_name: string;
  last_name: string;
}

interface ProyTesisCorrecsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Student;
}

export default function ProyTesisCorrecs({ isOpen, onClose, currentUser }: ProyTesisCorrecsProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!archivo) {
      setError('Por favor seleccione un archivo');
      return;
    }

    setLoading(true);
    
    try {
      // Aquí iría la lógica para enviar el archivo corregido a la base de datos
      console.log('Enviando archivo corregido:', {
        estudiante: currentUser,
        archivo: archivo.name
      });
      
      // Simulación de envío
      setTimeout(() => {
        alert('Archivo corregido enviado exitosamente');
        onClose();
        // Reset form
        setArchivo(null);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Error al enviar el archivo');
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
      <div className="bg-white rounded-lg w-[700px] h-[500px] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0" style={{ backgroundColor: '#0039A6' }}>
          <h2 className="text-lg font-bold text-white">Subir Archivo Corregido</h2>
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
            {/* Información del Estudiante */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Estudiante</div>
              <div className="col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-black">{currentUser.full_name}</p>
                  <p className="text-sm text-black">Código: {currentUser.codigo_matricula}</p>
                </div>
              </div>
            </div>

            {/* Subir Archivo Corregido */}
            <div className="grid grid-cols-3 gap-6 items-start">
              <div className="text-base font-semibold text-gray-900">Archivo Corregido (PDF - Máximo 5MB) *</div>
              <div className="col-span-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
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
                        <FileText className="w-16 h-16 text-green-500 mb-3" />
                        <p className="text-base font-medium text-black">{archivo.name}</p>
                        <p className="text-sm text-black">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 text-gray-400 mb-3" />
                        <p className="text-base text-black">Haga clic para seleccionar el archivo PDF corregido</p>
                        <p className="text-sm text-black">Máximo 5MB</p>
                      </>
                    )}
                  </label>
                </div>
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
            disabled={loading || !archivo}
            className="px-8 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar Archivo'}
          </button>
        </div>
      </div>
    </div>
  );
}