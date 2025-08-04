import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ExternalLink } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function OpenAccessData() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - Open Access Data" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Datos de Acceso Abierto</CardTitle>
                  <p className="text-slate-600 text-sm">Repositorio institucional y acceso a investigaciones</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Repositorio Institucional</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="border border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Tesis de Pregrado
                      </h3>
                      <p className="text-slate-600 text-sm mb-3">Acceso a trabajos de investigación de estudiantes de pregrado</p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Ver repositorio →</button>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="font-medium text-slate-900 mb-3 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Tesis de Posgrado
                      </h3>
                      <p className="text-slate-600 text-sm mb-3">Investigaciones de maestría y doctorado</p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Ver repositorio →</button>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Política de Acceso Abierto</h3>
                <p className="text-slate-700 mb-4">
                  La Universidad San Martín se compromete con el acceso abierto al conocimiento científico, 
                  facilitando el acceso gratuito a las investigaciones realizadas por su comunidad académica.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Estadísticas del Repositorio</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">1,250</div>
                    <div className="text-sm text-slate-600">Tesis Pregrado</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">340</div>
                    <div className="text-sm text-slate-600">Tesis Maestría</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">85</div>
                    <div className="text-sm text-slate-600">Tesis Doctorado</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">50K+</div>
                    <div className="text-sm text-slate-600">Descargas</div>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Criterios de Publicación</h3>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                  <li>Tesis sustentadas y aprobadas</li>
                  <li>Autorización del autor para publicación</li>
                  <li>Cumplimiento de estándares de calidad académica</li>
                  <li>Metadatos completos según estándares Dublin Core</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> El repositorio es actualizado semanalmente con nuevas publicaciones. 
                    Para consultas específicas, contacte a la Biblioteca Central.
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