import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star } from "lucide-react";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function SendFeedback() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el feedback
    alert("¡Gracias por tu feedback! Lo revisaremos pronto.");
    setFeedback("");
    setRating(0);
    setCategory("");
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col`}>
      <Header 
        title="SIPeT - Send Feedback" 
        subtitle="Sistema Integral para el Proceso y Evaluación de Tesis"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-slate-900">Enviar Comentarios</CardTitle>
                  <p className="text-slate-600 text-sm">Tu opinión nos ayuda a mejorar el sistema</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="bug">Reporte de Error</option>
                    <option value="feature">Solicitud de Función</option>
                    <option value="improvement">Mejora</option>
                    <option value="general">Comentario General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Calificación del Sistema
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 ${
                          star <= rating ? 'text-yellow-400' : 'text-slate-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comentarios
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Describe tu experiencia, sugerencias o problemas encontrados..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFeedback("");
                      setRating(0);
                      setCategory("");
                    }}
                  >
                    Limpiar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Enviar Feedback
                  </Button>
                </div>
              </form>

              <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Otras formas de contacto</h3>
                <div className="text-sm text-slate-700 space-y-1">
                  <p><strong>Email:</strong> soporte@universidadsanmartin.edu.pe</p>
                  <p><strong>Teléfono:</strong> +51 1 234-5678</p>
                  <p><strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</p>
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