-- ===========================================
-- SIPeT Database Migration Script
-- ===========================================
-- Nombre: create_project_documents_table
-- Fecha: 2025-01-07
-- Descripción: Crear tabla project_documents para archivos y documentos
-- Ejecutado en: Supabase - Proyecto oydittvsdhggwfzxlnib
-- ===========================================

-- Crear tabla project_documents para archivos y documentos
CREATE TABLE public.project_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thesis_project_id UUID NOT NULL REFERENCES public.thesis_projects(id) ON DELETE CASCADE,
    
    -- Información del documento
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(30) NOT NULL CHECK (tipo_documento IN (
        'proyecto_inicial',
        'proyecto_corregido',
        'borrador_tesis',
        'borrador_corregido',
        'informe_turnitin',
        'carta_aceptacion_asesor',
        'informe_correcciones',
        'acta_aprobacion',
        'documento_adicional'
    )),
    
    -- Metadatos del archivo
    url_archivo VARCHAR(500) NOT NULL,
    tamano_bytes INTEGER,
    tipo_mime VARCHAR(100),
    hash_archivo VARCHAR(64),
    
    -- Información de la carga
    subido_por_id UUID NOT NULL REFERENCES public.users(id),
    fecha_subida TIMESTAMPTZ DEFAULT now(),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    es_version_actual BOOLEAN DEFAULT true,
    documento_padre_id UUID REFERENCES public.project_documents(id),
    
    -- Estado y validación
    estado_validacion VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_validacion IN (
        'pendiente',
        'validado',
        'rechazado'
    )),
    observaciones_validacion TEXT,
    validado_por_id UUID REFERENCES public.users(id),
    fecha_validacion TIMESTAMPTZ,
    
    -- Control
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_project_documents_project ON public.project_documents(thesis_project_id);
CREATE INDEX idx_project_documents_tipo ON public.project_documents(tipo_documento);
CREATE INDEX idx_project_documents_subido_por ON public.project_documents(subido_por_id);
CREATE INDEX idx_project_documents_fecha_subida ON public.project_documents(fecha_subida);
CREATE INDEX idx_project_documents_version_actual ON public.project_documents(es_version_actual) WHERE es_version_actual = true;

-- Constraint: solo puede haber una versión actual por tipo de documento por proyecto
CREATE UNIQUE INDEX idx_project_documents_unique_current_version 
    ON public.project_documents(thesis_project_id, tipo_documento) 
    WHERE es_version_actual = true AND is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_project_documents_updated_at BEFORE UPDATE
    ON public.project_documents FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();

COMMENT ON TABLE public.project_documents IS 'Documentos y archivos asociados a proyectos de tesis';

-- ===========================================
-- Estado: EJECUTADO EXITOSAMENTE
-- ===========================================