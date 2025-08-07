-- ===========================================
-- SIPeT Database Migration Script
-- ===========================================
-- Nombre: create_project_supervisors_table
-- Fecha: 2025-01-07
-- Descripción: Crear tabla project_supervisors para relaciones director-tesista
-- Ejecutado en: Supabase - Proyecto oydittvsdhggwfzxlnib
-- ===========================================

-- Crear tabla project_supervisors para relaciones director-tesista
CREATE TABLE public.project_supervisors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thesis_project_id UUID NOT NULL REFERENCES public.thesis_projects(id) ON DELETE CASCADE,
    supervisor_id UUID NOT NULL REFERENCES public.users(id),
    
    -- Tipo de supervisión
    tipo_supervisor VARCHAR(20) NOT NULL DEFAULT 'director' CHECK (tipo_supervisor IN (
        'director',
        'asesor', 
        'co_director',
        'jurado_presidente',
        'jurado_secretario',
        'jurado_vocal'
    )),
    
    -- Estado de la relación
    estado VARCHAR(20) DEFAULT 'asignado' CHECK (estado IN (
        'propuesto',
        'asignado',
        'aceptado',
        'rechazado',
        'activo',
        'finalizado'
    )),
    
    -- Fechas importantes
    fecha_asignacion TIMESTAMPTZ DEFAULT now(),
    fecha_respuesta TIMESTAMPTZ,
    fecha_aceptacion TIMESTAMPTZ,
    
    -- Orden para jurados (1, 2, 3)
    orden_jurado INTEGER,
    
    -- Observaciones
    comentarios TEXT,
    motivo_rechazo TEXT,
    
    -- Control
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_project_supervisors_project ON public.project_supervisors(thesis_project_id);
CREATE INDEX idx_project_supervisors_supervisor ON public.project_supervisors(supervisor_id);
CREATE INDEX idx_project_supervisors_tipo ON public.project_supervisors(tipo_supervisor);
CREATE INDEX idx_project_supervisors_estado ON public.project_supervisors(estado);

-- Constraint único: un supervisor no puede tener el mismo tipo para el mismo proyecto
CREATE UNIQUE INDEX idx_project_supervisors_unique_tipo 
    ON public.project_supervisors(thesis_project_id, tipo_supervisor) 
    WHERE is_active = true;

-- Constraint: solo puede haber un director por proyecto
CREATE UNIQUE INDEX idx_project_supervisors_unique_director 
    ON public.project_supervisors(thesis_project_id) 
    WHERE tipo_supervisor = 'director' AND is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_project_supervisors_updated_at BEFORE UPDATE
    ON public.project_supervisors FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();

COMMENT ON TABLE public.project_supervisors IS 'Relaciones entre proyectos de tesis y sus supervisores/jurados';

-- ===========================================
-- Estado: EJECUTADO EXITOSAMENTE
-- ===========================================