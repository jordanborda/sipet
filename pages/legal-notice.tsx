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

export default function LegalNotice() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - Legal Notice" 
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
                  <CardTitle className="text-slate-900">Aviso Legal</CardTitle>
                  <p className="text-slate-600 text-sm">Información legal y normativa aplicable</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Identificación del Titular</h2>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                  <p className="text-slate-700"><strong>Razón Social:</strong> Universidad San Martín</p>
                  <p className="text-slate-700"><strong>RUC:</strong> [Número de RUC]</p>
                  <p className="text-slate-700"><strong>Dirección:</strong> [Dirección física]</p>
                  <p className="text-slate-700"><strong>Teléfono:</strong> [Número de teléfono]</p>
                  <p className="text-slate-700"><strong>Email:</strong> info@universidadsanmartin.edu.pe</p>
                </div>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Objeto del Sistema</h3>
                <p className="text-slate-700 mb-4">
                  El Sistema Integral para el Proceso y Evaluación de Tesis (SIPeT) tiene como finalidad 
                  facilitar y gestionar el proceso académico relacionado con las tesis de grado y posgrado 
                  de la Universidad San Martín.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Legislación Aplicable</h3>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2">
                  <li>Ley Universitaria N° 30220</li>
                  <li>Ley de Protección de Datos Personales N° 29733</li>
                  <li>Ley de Propiedad Intelectual - Decreto Legislativo N° 822</li>
                  <li>Reglamento General de la Universidad San Martín</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Limitación de Responsabilidad</h3>
                <p className="text-slate-700 mb-4">
                  La Universidad San Martín no se hace responsable de los daños que puedan derivarse del uso 
                  inadecuado del sistema, interrupciones del servicio por causas técnicas, o de la información 
                  introducida por los usuarios.
                </p>

                <h3 className="text-lg font-medium text-slate-900 mb-3">Jurisdicción</h3>
                <p className="text-slate-700 mb-4">
                  Para la resolución de controversias que pudieran surgir, las partes se someten a la 
                  jurisdicción de los tribunales competentes de Lima, Perú.
                </p>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-6">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Este aviso legal puede ser modificado en cualquier momento. 
                    Se recomienda revisar periódicamente esta página para estar al tanto de los cambios.
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