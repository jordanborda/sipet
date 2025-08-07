-- ===========================================
-- SIPeT Database Migration Script
-- ===========================================
-- Nombre: create_thesis_projects_table
-- Fecha: 2025-01-07
-- Descripción: Crear tabla thesis_projects para proyectos de tesis principales
-- Ejecutado en: Supabase - Proyecto oydittvsdhggwfzxlnib
-- ===========================================

-- Crear tabla thesis_projects para proyectos de tesis principales
CREATE TABLE public.thesis_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    resumen TEXT NOT NULL,
    palabras_clave VARCHAR(300),
    tipo_proyecto VARCHAR(20) NOT NULL CHECK (tipo_proyecto IN ('individual', 'grupal')),
    
    -- Relaciones
    research_line_id UUID REFERENCES public.research_lines(id),
    estudiante_principal_id UUID NOT NULL REFERENCES public.users(id),
    estudiante_secundario_id UUID REFERENCES public.users(id),
    supervisor_id UUID REFERENCES public.users(id),
    
    -- Estado del proyecto
    estado VARCHAR(30) DEFAULT 'cargado' CHECK (estado IN (
        'cargado',
        'revision_formato',
        'aprobado_formato',
        'en_revision_director',
        'aprobado_director',
        'listo_sorteo',
        'en_revision_jurados',
        'con_observaciones',
        'dictamen_pendiente',
        'aprobado',
        'rechazado'
    )),
    
    -- Fechas importantes
    fecha_carga TIMESTAMPTZ DEFAULT now(),
    fecha_aprobacion_director TIMESTAMPTZ,
    fecha_sorteo_jurados TIMESTAMPTZ,
    fecha_dictamen TIMESTAMPTZ,
    fecha_limite_ejecucion TIMESTAMPTZ,
    
    -- Metadatos del archivo
    archivo_nombre VARCHAR(255),
    archivo_url VARCHAR(500),
    archivo_size INTEGER,
    archivo_hash VARCHAR(64),
    
    -- Control de versiones
    version INTEGER DEFAULT 1,
    archivo_corregido_url VARCHAR(500),
    fecha_correccion TIMESTAMPTZ,
    
    -- Campos adicionales
    observaciones TEXT,
    notas_internas TEXT,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_thesis_projects_estudiante_principal ON public.thesis_projects(estudiante_principal_id);
CREATE INDEX idx_thesis_projects_estudiante_secundario ON public.thesis_projects(estudiante_secundario_id);
CREATE INDEX idx_thesis_projects_supervisor ON public.thesis_projects(supervisor_id);
CREATE INDEX idx_thesis_projects_research_line ON public.thesis_projects(research_line_id);
CREATE INDEX idx_thesis_projects_estado ON public.thesis_projects(estado);
CREATE INDEX idx_thesis_projects_fecha_carga ON public.thesis_projects(fecha_carga);

-- Trigger para updated_at
CREATE TRIGGER update_thesis_projects_updated_at BEFORE UPDATE
    ON public.thesis_projects FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();

-- Constraint para asegurar que proyectos grupales tengan estudiante secundario
ALTER TABLE public.thesis_projects ADD CONSTRAINT check_proyecto_grupal 
    CHECK (
        (tipo_proyecto = 'individual' AND estudiante_secundario_id IS NULL) OR
        (tipo_proyecto = 'grupal' AND estudiante_secundario_id IS NOT NULL)
    );

COMMENT ON TABLE public.thesis_projects IS 'Proyectos de tesis principales con seguimiento de estado';

-- ===========================================
-- Estado: EJECUTADO EXITOSAMENTE
-- ===========================================