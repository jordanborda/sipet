import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function LegalInformation() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - Legal Information" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Información Legal</CardTitle>
                  <p className="text-slate-600 text-sm">Términos y condiciones de uso del sistema</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Términos de Uso</h2>
                <p className="text-slate-700 mb-6">
                  El Sistema Integral para el Proceso y Evaluación de Tesis (SIPeT) es una plataforma desarrollada 
                  por la Universidad San Martín para gestionar el proceso académico de tesis de grado y posgrado.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Uso Autorizado</h3>
                <p className="text-slate-700 mb-4">
                  El acceso y uso de este sistema está restringido a estudiantes, docentes y personal autorizado 
                  de la Universidad San Martín. El uso indebido de la plataforma puede resultar en la suspensión 
                  del acceso y/o acciones disciplinarias.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Derechos de Propiedad Intelectual</h3>
                <p className="text-slate-700 mb-4">
                  Todo el contenido, diseño, y funcionalidad del sistema SIPeT están protegidos por las leyes 
                  de propiedad intelectual. Los usuarios no pueden reproducir, distribuir o modificar cualquier 
                  parte del sistema sin autorización expresa.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Responsabilidad del Usuario</h3>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                  <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>Utilizar el sistema únicamente para fines académicos autorizados</li>
                  <li>No intentar acceder a información o áreas no autorizadas</li>
                  <li>Reportar cualquier problema de seguridad o mal funcionamiento</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Modificaciones</h3>
                <p className="text-slate-700 mb-4">
                  La Universidad se reserva el derecho de modificar estos términos en cualquier momento. 
                  Los usuarios serán notificados de cambios significativos a través del sistema.
                </p>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6">
                  <p className="text-sm text-slate-600">
                    <strong>Última actualización:</strong> Agosto 2025<br/>
                    <strong>Contacto legal:</strong> legal@universidadsanmartin.edu.pe
                  </p>
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