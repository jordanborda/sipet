import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Footer() {
  const router = useRouter();

  const footerSections = [
    {
      title: 'Legal',
      links: [
        { name: 'Información Legal', href: '/legal-information' },
        { name: 'Aviso Legal', href: '/legal-notice' },
        { name: 'Política de Privacidad', href: '/privacy-policy' },
        { name: 'Datos de Acceso Abierto', href: '/open-access-data' },
      ]
    },
    {
      title: 'Soporte',
      links: [
        { name: 'Preguntas Frecuentes', href: '/faq' },
        { name: 'Guía Rápida', href: '/quick-guide' },
        { name: 'Enviar Comentarios', href: '/send-feedback' },
        { name: 'Acerca de RITEC', href: '/about-ritec' },
        { name: 'Política de Cookies', href: '/cookie-policy' },
      ]
    },
    {
      title: 'SIPeT',
      links: [
        { name: 'Proyectos de Tesis', href: '/thesis-projects' },
        { name: 'Áreas de Investigación', href: '/research-areas' },
        { name: 'Calendario Académico', href: '/academic-calendar' },
        { name: 'Recursos', href: '/resources' },
      ]
    }
  ];

  return (
    <footer className="w-full border-t border-gray-200" style={{ backgroundColor: '#0f1419' }}>
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 py-8">
          {/* University Section */}
          <div className="md:col-span-1">
            <Image 
              src="/logo.png" 
              alt="Universidad San Martín" 
              width={120}
              height={32}
              className="h-8 mb-3 opacity-90"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h3 className="text-white font-medium text-xs mb-2 tracking-wide">UNIVERSIDAD SAN MARTÍN</h3>
            <p className="text-gray-400 text-xs leading-tight">
              Sistema Integral para el Proceso y Evaluación de Tesis
            </p>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="md:col-span-1">
              <h4 className="text-white font-medium text-xs mb-3 tracking-wide uppercase">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => router.push(link.href)}
                      className="text-gray-400 hover:text-white text-xs transition-colors duration-200 block w-full text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800">
          <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-gray-500 text-xs">
              <p>© 2025 Universidad San Martín. Todos los derechos reservados.</p>
            </div>
            <div className="text-gray-500 text-xs mt-2 md:mt-0 flex space-x-4">
              <span>SIPeT v2.0</span>
              <span>•</span>
              <span>Desarrollado con Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}