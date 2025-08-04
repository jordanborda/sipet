import { useRouter } from 'next/router';
import { ExternalLink, FileText, Shield, Database, HelpCircle, BookOpen, MessageSquare, Info, Cookie } from 'lucide-react';

export default function Footer() {
  const router = useRouter();

  const firstColumnLinks = [
    { name: 'Legal information', href: '/legal-information', icon: FileText },
    { name: 'Legal notice', href: '/legal-notice', icon: Shield },
    { name: 'Privacy policy', href: '/privacy-policy', icon: Shield },
    { name: 'Open access data', href: '/open-access-data', icon: Database },
  ];

  const secondColumnLinks = [
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Quick guide', href: '/quick-guide', icon: BookOpen },
    { name: 'Send Feedback', href: '/send-feedback', icon: MessageSquare },
    { name: 'About RITEC', href: '/about-ritec', icon: Info },
    { name: 'Cookie policy', href: '/cookie-policy', icon: Cookie },
  ];

  return (
    <footer className="w-full mt-auto" style={{ backgroundColor: '#211E1E' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="Universidad San Martín Logo" 
            className="h-16 w-auto"
            onError={(e) => {
              // Fallback si no existe el logo
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Primera Columna */}
          <div className="space-y-3">
            {firstColumnLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors text-sm p-2 rounded hover:bg-white/10 text-left w-full"
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </div>

          {/* Segunda Columna */}
          <div className="space-y-3">
            {secondColumnLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors text-sm p-2 rounded hover:bg-white/10 text-left w-full"
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tercera Columna - Texto Legal */}
          <div className="text-white/70 text-xs leading-relaxed">
            <p className="mb-4">
              El usuario tiene la obligación de utilizar los servicios y contenidos proporcionados por la Universidad, 
              en particular, los impresos y recursos electrónicos, de conformidad con la legislación vigente y los 
              principios de buena fe y en general usos aceptados, sin contravenir con su realización el orden público, 
              especialmente, en el caso en que, para el adecuado desempeño de su actividad, necesita reproducir, 
              distribuir, comunicar y/o poner a disposición, fragmentos de obras impresas o susceptibles de estar en 
              formato analógico o digital, ya sea en soporte papel o electrónico.
            </p>
            <p className="text-white/60">
              <strong>Ley 23/2006, de 7 de julio,</strong> por la que se modifica el texto revisado de la Ley de 
              Propiedad Intelectual, aprobado por el Real Decreto Legislativo 1/1996, de 12 de abril.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-white/60 text-xs">
            <p>© 2025 Universidad San Martín - SIPeT. Todos los derechos reservados.</p>
            <p className="mt-2 md:mt-0">Sistema Integral para el Proceso y Evaluación de Tesis</p>
          </div>
        </div>
      </div>
    </footer>
  );
}