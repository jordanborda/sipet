import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users, Target, Award } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AboutRITEC() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - About RITEC" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Acerca de RITEC</CardTitle>
                  <p className="text-slate-600 text-sm">Red de Investigación y Tecnología Educativa</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">¿Qué es RITEC?</h2>
                <p className="text-slate-700 mb-6">
                  RITEC (Red de Investigación y Tecnología Educativa) es una iniciativa de la Universidad San Martín 
                  orientada a fortalecer la investigación académica mediante el uso de tecnologías innovadoras y 
                  metodologías colaborativas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="border border-slate-200">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-medium text-slate-900 mb-2">Investigadores</h3>
                      <p className="text-slate-600 text-sm">Red de más de 150 investigadores activos</p>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardContent className="p-6 text-center">
                      <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-medium text-slate-900 mb-2">Proyectos</h3>
                      <p className="text-slate-600 text-sm">80+ proyectos de investigación completados</p>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardContent className="p-6 text-center">
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-medium text-slate-900 mb-2">Reconocimientos</h3>
                      <p className="text-slate-600 text-sm">15 premios nacionales e internacionales</p>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Misión</h3>
                <p className="text-slate-700 mb-4">
                  Promover la excelencia en la investigación académica mediante la integración de tecnologías 
                  educativas avanzadas, facilitando la colaboración entre investigadores y mejorando los 
                  procesos de gestión del conocimiento.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Visión</h3>
                <p className="text-slate-700 mb-4">
                  Ser reconocidos como la red de investigación universitaria líder en el país, caracterizada 
                  por la innovación tecnológica, la calidad de sus investigaciones y el impacto social de 
                  sus contribuciones.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Áreas de Investigación</h3>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                  <li>Tecnologías Educativas e Innovación Pedagógica</li>
                  <li>Sistemas de Información y Gestión del Conocimiento</li>
                  <li>Análisis de Datos y Business Intelligence</li>
                  <li>Desarrollo Sostenible y Responsabilidad Social</li>
                  <li>Ciencias de la Salud y Bienestar</li>
                  <li>Ingeniería y Tecnologías Aplicadas</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Contacto RITEC</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>Director:</strong> Dr. [Nombre del Director]<br/>
                    <strong>Email:</strong> ritec@universidadsanmartin.edu.pe<br/>
                    <strong>Oficina:</strong> Edificio de Investigación, 3er piso<br/>
                    <strong>Teléfono:</strong> +51 1 234-5678 ext. 300
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