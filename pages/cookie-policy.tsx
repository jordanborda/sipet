import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function CookiePolicy() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - Cookie Policy" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Política de Cookies</CardTitle>
                  <p className="text-slate-600 text-sm">Uso de cookies y tecnologías similares</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">¿Qué son las Cookies?</h2>
                <p className="text-slate-700 mb-6">
                  Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita 
                  nuestro sitio web. Nos ayudan a mejorar su experiencia y el funcionamiento del sistema SIPeT.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Tipos de Cookies que Utilizamos</h3>
                
                <div className="space-y-4">
                  <Card className="border border-slate-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-slate-900 mb-2">Cookies Esenciales</h4>
                      <p className="text-slate-700 text-sm">
                        Necesarias para el funcionamiento básico del sistema, incluyen cookies de sesión 
                        y autenticación. No se pueden desactivar.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-slate-900 mb-2">Cookies de Rendimiento</h4>
                      <p className="text-slate-700 text-sm">
                        Recopilan información sobre cómo los usuarios utilizan el sitio web para mejorar 
                        el rendimiento y la funcionalidad.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-slate-900 mb-2">Cookies de Preferencias</h4>
                      <p className="text-slate-700 text-sm">
                        Recuerdan sus preferencias de configuración como idioma, tema y opciones de 
                        visualización personalizadas.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-slate-900 mb-3 mt-6">Gestión de Cookies</h3>
                <p className="text-slate-700 mb-4">
                  Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies 
                  que ya están en su dispositivo y configurar la mayoría de navegadores para evitar que 
                  se instalen.
                </p>

                <h4 className="font-medium text-slate-900 mb-2">Configuración por Navegador</h4>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-1">
                  <li><strong>Chrome:</strong> Configuración {'>'}  Privacidad y seguridad {'>'} Cookies</li>
                  <li><strong>Firefox:</strong> Preferencias {'>'} Privacidad y seguridad</li>
                  <li><strong>Safari:</strong> Preferencias {'>'} Privacidad</li>
                  <li><strong>Edge:</strong> Configuración {'>'} Cookies y permisos del sitio</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Cookies de Terceros</h3>
                <p className="text-slate-700 mb-4">
                  Utilizamos servicios de terceros que pueden establecer sus propias cookies:
                </p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-1">
                  <li>Google Analytics (análisis de uso)</li>
                  <li>Servicios de autenticación</li>
                  <li>CDN para recursos estáticos</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Consentimiento</h3>
                <p className="text-slate-700 mb-4">
                  Al continuar utilizando nuestro sitio web, usted acepta el uso de cookies según se 
                  describe en esta política. Puede retirar su consentimiento en cualquier momento 
                  modificando la configuración de su navegador.
                </p>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Desactivar ciertas cookies puede afectar la funcionalidad 
                    del sistema SIPeT y su experiencia de usuario.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>Contacto:</strong> Para consultas sobre nuestra política de cookies, 
                    escriba a privacy@universidadsanmartin.edu.pe
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