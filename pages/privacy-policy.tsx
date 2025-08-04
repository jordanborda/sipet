import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function PrivacyPolicy() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - Privacy Policy" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Política de Privacidad</CardTitle>
                  <p className="text-slate-600 text-sm">Protección y tratamiento de datos personales</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recopilación de Información</h2>
                <p className="text-slate-700 mb-6">
                  La Universidad San Martín recopila y procesa datos personales necesarios para el funcionamiento 
                  del Sistema SIPeT, en cumplimiento de la Ley de Protección de Datos Personales N° 29733.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Datos que Recopilamos</h3>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                  <li>Información de identificación (nombre, apellidos, DNI, código de estudiante)</li>
                  <li>Información de contacto (correo electrónico, teléfono)</li>
                  <li>Información académica (carrera, ciclo, asesor asignado)</li>
                  <li>Documentos relacionados con el proceso de tesis</li>
                  <li>Registros de actividad en el sistema</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Finalidad del Tratamiento</h3>
                <p className="text-slate-700 mb-4">Los datos personales son utilizados exclusivamente para:</p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                  <li>Gestionar el proceso de elaboración y evaluación de tesis</li>
                  <li>Facilitar la comunicación entre estudiantes, asesores y evaluadores</li>
                  <li>Generar reportes académicos y estadísticos</li>
                  <li>Cumplir con obligaciones legales y reglamentarias</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Seguridad de los Datos</h3>
                <p className="text-slate-700 mb-4">
                  Implementamos medidas técnicas y organizativas apropiadas para proteger los datos personales 
                  contra el acceso no autorizado, alteración, divulgación o destrucción.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Derechos del Usuario</h3>
                <p className="text-slate-700 mb-2">Los titulares de datos personales tienen derecho a:</p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                  <li>Acceder a sus datos personales</li>
                  <li>Rectificar datos inexactos o incompletos</li>
                  <li>Cancelar el tratamiento de sus datos</li>
                  <li>Oponerse al tratamiento de sus datos</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Tiempo de Conservación</h3>
                <p className="text-slate-700 mb-4">
                  Los datos personales se conservarán durante el tiempo necesario para cumplir con las finalidades 
                  del tratamiento y las obligaciones legales aplicables.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Contacto</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    Para ejercer sus derechos o realizar consultas sobre el tratamiento de datos personales:<br/>
                    <strong>Email:</strong> privacy@universidadsanmartin.edu.pe<br/>
                    <strong>Oficina de Protección de Datos:</strong> [Dirección física]
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