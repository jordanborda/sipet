import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Faculty {
  id: string;
  name: string;
  schools: ProfessionalSchool[];
}

interface ProfessionalSchool {
  id: string;
  name: string;
  faculty_id: string;
}

interface OnboardingData {
  role: 'estudiante' | 'docente' | 'coordinador' | null;
  firstName: string;
  secondName: string;
  lastName: string;
  dni: string;
  code: string;
  faculty: string;
  professionalSchool: string;
  phone: string;
  email: string;
}

interface OnboardingPageProps {
  onComplete: (data: OnboardingData) => Promise<void>;
  loading: boolean;
}

const PerfilComponent = ({ onComplete, loading }: OnboardingPageProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<OnboardingData>({
    role: null,
    firstName: '',
    secondName: '',
    lastName: '',
    dni: '',
    code: '',
    faculty: '',
    professionalSchool: '',
    phone: '',
    email: ''
  });

  // Mock data - In real implementation, fetch from database
  const [faculties] = useState<Faculty[]>([
    {
      id: '1',
      name: 'Facultad de Ingeniería',
      schools: [
        { id: '1', name: 'Ingeniería de Sistemas', faculty_id: '1' },
        { id: '2', name: 'Ingeniería Civil', faculty_id: '1' },
        { id: '3', name: 'Ingeniería Industrial', faculty_id: '1' }
      ]
    },
    {
      id: '2',
      name: 'Facultad de Ciencias de la Salud',
      schools: [
        { id: '4', name: 'Medicina Humana', faculty_id: '2' },
        { id: '5', name: 'Enfermería', faculty_id: '2' },
        { id: '6', name: 'Odontología', faculty_id: '2' }
      ]
    },
    {
      id: '3',
      name: 'Facultad de Educación',
      schools: [
        { id: '7', name: 'Educación Inicial', faculty_id: '3' },
        { id: '8', name: 'Educación Primaria', faculty_id: '3' },
        { id: '9', name: 'Educación Secundaria', faculty_id: '3' }
      ]
    }
  ]);

  const selectedFaculty = faculties.find(f => f.id === formData.faculty);
  const availableSchools = selectedFaculty?.schools || [];

  const handleRoleSelection = (role: 'estudiante' | 'docente' | 'coordinador') => {
    setFormData(prev => ({ ...prev, role }));
    if (!completedSteps.includes(1)) {
      setCompletedSteps([1]);
    }
    setCurrentStep(2);
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step <= Math.max(...completedSteps, 0)) {
      setCurrentStep(step);
    }
  };

  const handleStep2Continue = () => {
    if (isStep2Complete) {
      if (!completedSteps.includes(2)) {
        setCompletedSteps(prev => [...prev, 2]);
      }
      setCurrentStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const isStep2Complete = formData.firstName.trim() && formData.lastName.trim() && 
                          formData.dni.trim() && formData.code.trim() && 
                          formData.phone.trim() && formData.email.trim();

  const isStep3Complete = formData.faculty.trim() && formData.professionalSchool.trim();

  const steps = [
    { number: 1, title: 'Selección de Rol', completed: completedSteps.includes(1) },
    { number: 2, title: 'Datos Personales', completed: completedSteps.includes(2) },
    { number: 3, title: 'Perfil Profesional', completed: completedSteps.includes(3) }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">¡Bienvenido a SIPeT!</h1>
            <p className="text-black">Complete su registro siguiendo los pasos a continuación</p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative">
            {steps.map((step, index) => (
              <div key={step.number} className="relative mb-12">
                {/* Vertical Line (appears behind each step except the last) */}
                {index < steps.length - 1 && (
                  <div 
                    className="absolute left-5 top-10 w-0.5 bg-blue-600"
                    style={{ height: 'calc(100% + 3rem)' }}
                  ></div>
                )}
                
                {/* Step Header */}
                <div className="flex items-start mb-4 relative z-10">
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer transition-all mr-4 relative z-20 ${
                      step.completed || currentStep === step.number
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-300'
                    } ${completedSteps.includes(step.number) || step.number <= Math.max(...completedSteps, 0) ? 'hover:scale-105' : 'cursor-not-allowed'}`}
                    onClick={() => handleStepClick(step.number)}
                  >
                    {step.completed ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black">
                      {step.title}
                    </h2>
                  </div>
                </div>

                {/* Step Content */}
                {step.number === 1 && (currentStep === 1 || completedSteps.includes(1)) && (
                  <div className="ml-14 mb-6">
                    <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                      {/* Estudiante */}
                      <button
                        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-center transition-all ${
                          formData.role === 'estudiante' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                        }`}
                        onClick={() => handleRoleSelection('estudiante')}
                      >
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-xs font-semibold">Estudiante</span>
                      </button>

                      {/* Docente */}
                      <button
                        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-center transition-all ${
                          formData.role === 'docente' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                        }`}
                        onClick={() => handleRoleSelection('docente')}
                      >
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        <span className="text-xs font-semibold">Docente</span>
                      </button>

                      {/* Coordinador */}
                      <button
                        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-center transition-all ${
                          formData.role === 'coordinador' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                        }`}
                        onClick={() => handleRoleSelection('coordinador')}
                      >
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="text-xs font-semibold">Coordinador</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 Content - Personal Data */}
                {step.number === 2 && (currentStep === 2 || completedSteps.includes(2)) && (
                  <div className="ml-14 mb-6">
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div>
                          <Label htmlFor="firstName" className="text-black">Nombre *</Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="Juan"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>

                        {/* Segundo Nombre */}
                        <div>
                          <Label htmlFor="secondName" className="text-black">Segundo Nombre</Label>
                          <Input
                            id="secondName"
                            type="text"
                            placeholder="Carlos"
                            value={formData.secondName}
                            onChange={(e) => setFormData(prev => ({ ...prev, secondName: e.target.value }))}
                          />
                        </div>

                        {/* Apellidos */}
                        <div>
                          <Label htmlFor="lastName" className="text-black">Apellidos *</Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="García López"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>

                        {/* DNI */}
                        <div>
                          <Label htmlFor="dni" className="text-black">DNI *</Label>
                          <Input
                            id="dni"
                            type="text"
                            placeholder="12345678"
                            value={formData.dni}
                            onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                            maxLength={8}
                            required
                          />
                        </div>

                        {/* Código */}
                        <div>
                          <Label htmlFor="code" className="text-black">
                            {formData.role === 'estudiante' ? 'Código de Matrícula *' : 'Código de Docente *'}
                          </Label>
                          <Input
                            id="code"
                            type="text"
                            placeholder={formData.role === 'estudiante' ? "2024-001234" : "DOC-001234"}
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            required
                          />
                        </div>

                        {/* Celular */}
                        <div>
                          <Label htmlFor="phone" className="text-black">Celular *</Label>
                          <Input
                            id="phone"
                            type="text"
                            placeholder="987654321"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                          />
                        </div>

                        {/* Correo Electrónico */}
                        <div className="md:col-span-2">
                          <Label htmlFor="email" className="text-black">Correo Electrónico *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="juan.garcia@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      {currentStep === 2 && (
                        <div className="flex justify-end pt-4">
                          <Button
                            type="button"
                            onClick={handleStep2Continue}
                            disabled={!isStep2Complete}
                          >
                            Continuar
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Step 3 Content - Professional Profile */}
                {step.number === 3 && (currentStep === 3 || completedSteps.includes(3)) && (
                  <div className="ml-14 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Facultad */}
                        <div>
                          <Label htmlFor="faculty">Seleccione la Facultad *</Label>
                          <select
                            id="faculty"
                            value={formData.faculty}
                            onChange={(e) => {
                              setFormData(prev => ({ 
                                ...prev, 
                                faculty: e.target.value,
                                professionalSchool: ''
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Seleccionar facultad...</option>
                            {faculties.map(faculty => (
                              <option key={faculty.id} value={faculty.id}>
                                {faculty.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Escuela Profesional */}
                        <div>
                          <Label htmlFor="professionalSchool">Escuela Profesional *</Label>
                          <select
                            id="professionalSchool"
                            value={formData.professionalSchool}
                            onChange={(e) => setFormData(prev => ({ ...prev, professionalSchool: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                            disabled={!formData.faculty}
                          >
                            <option value="">Seleccionar escuela profesional...</option>
                            {availableSchools.map(school => (
                              <option key={school.id} value={school.id}>
                                {school.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {currentStep === 3 && (
                        <div className="flex justify-end pt-4">
                          <Button
                            type="submit"
                            disabled={loading || !isStep3Complete}
                          >
                            {loading ? 'Guardando...' : 'Completar Registro'}
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilComponent;