import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cómo accedo al sistema SIPeT?",
      answer: "Debes usar tu código de estudiante y contraseña institucional. Si tienes problemas de acceso, contacta al soporte técnico."
    },
    {
      question: "¿Qué documentos necesito para registrar mi proyecto de tesis?",
      answer: "Necesitas el formato de proyecto completado, carta de compromiso del asesor, y el informe de similitud Turnitin firmado por tu director."
    },
    {
      question: "¿Cómo elijo mi asesor de tesis?",
      answer: "Puedes buscar asesores por área de especialidad en el sistema. Debes contactar directamente al docente y obtener su confirmación antes de registrarlo."
    },
    {
      question: "¿Cuánto tiempo demora la revisión de mi proyecto?",
      answer: "El comité académico tiene un plazo de 15 días hábiles para revisar y aprobar proyectos de tesis de pregrado, y 20 días para posgrado."
    },
    {
      question: "¿Puedo cambiar mi tema de tesis después de aprobado?",
      answer: "Los cambios menores están permitidos, pero cambios sustanciales requieren una nueva aprobación del comité académico."
    },
    {
      question: "¿Qué hago si mi asesor no responde?",
      answer: "Contacta a la Coordinación de Investigación de tu facultad. Ellos pueden mediar o asignar un co-asesor si es necesario."
    },
    {
      question: "¿Cómo programo mi sustentación?",
      answer: "Una vez que tu borrador sea aprobado, podrás programar tu sustentación a través del sistema. El jurado será asignado automáticamente."
    }
  ];

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - FAQ" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Preguntas Frecuentes</CardTitle>
                  <p className="text-slate-600 text-sm">Respuestas a las consultas más comunes</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="border border-slate-200">
                    <CardHeader 
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900">{faq.question}</h3>
                        <ChevronDown 
                          className={`w-5 h-5 text-slate-500 transition-transform ${
                            openFAQ === index ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CardHeader>
                    {openFAQ === index && (
                      <CardContent className="pt-0">
                        <p className="text-slate-700">{faq.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">¿No encontraste tu respuesta?</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Si tienes alguna pregunta que no está en esta lista, no dudes en contactarnos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Enviar Consulta
                  </button>
                  <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                    Contactar Soporte
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}