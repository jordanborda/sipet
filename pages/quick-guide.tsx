import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function QuickGuide() {
  const steps = [
    {
      title: "Registro e Ingreso",
      description: "Accede al sistema con tu código de estudiante y contraseña institucional."
    },
    {
      title: "Selección de Asesor",
      description: "Busca y contacta un asesor especializado en tu área de investigación."
    },
    {
      title: "Registro del Proyecto",
      description: "Completa el formato de proyecto y súbelo junto con los documentos requeridos."
    },
    {
      title: "Aprobación del Comité",
      description: "Espera la revisión y aprobación de tu proyecto por el comité académico."
    },
    {
      title: "Desarrollo de Tesis",
      description: "Trabaja en tu investigación manteniendo comunicación regular con tu asesor."
    },
    {
      title: "Entrega del Borrador",
      description: "Sube tu borrador final con el informe de similitud Turnitin."
    },
    {
      title: "Programación de Sustentación",
      description: "Una vez aprobado el borrador, programa tu fecha de sustentación."
    }
  ];

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - Quick Guide" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Guía Rápida</CardTitle>
                  <p className="text-slate-600 text-sm">Pasos para completar tu proceso de tesis</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 mb-1">{step.title}</h3>
                      <p className="text-slate-700 text-sm">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-slate-400 mt-1" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Consejos Importantes</h3>
                <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
                  <li>Mantén comunicación regular con tu asesor</li>
                  <li>Respeta los plazos establecidos por la universidad</li>
                  <li>Utiliza las herramientas disponibles en el sistema</li>
                  <li>Consulta los reglamentos antes de iniciar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}