-- ===========================================
-- SIPeT Database Migration Script
-- ===========================================
-- Nombre: create_tram_thesis_log_table
-- Fecha: 2025-08-07
-- Descripción: Crear tabla tram_thesis_log para seguimiento detallado de trámites
-- Ejecutado en: Supabase - Proyecto oydittvsdhggwfzxlnib
-- ===========================================

-- Crear tabla tram_thesis_log para seguimiento de trámites de tesis
CREATE TABLE public.tram_thesis_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thesis_project_id UUID NOT NULL REFERENCES public.thesis_projects(id) ON DELETE CASCADE,
    
    -- Estado y información del trámite
    step_number INTEGER NOT NULL CHECK (step_number >= 1 AND step_number <= 11),
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    -- Actor del cambio
    actor_id UUID REFERENCES public.users(id),
    actor_tipo VARCHAR(20) CHECK (actor_tipo IN (
        'tesista',
        'director',
        'jurado',
        'coordinador',
        'administrador',
        'sistema'
    )),
    actor_nombre VARCHAR(255),
    
    -- Detalles adicionales del trámite
    observaciones TEXT,
    datos_adicionales JSONB, -- Para almacenar información específica del paso
    documento_asociado_id UUID REFERENCES public.project_documents(id),
    
    -- Control de fechas y notificaciones
    fecha_accion TIMESTAMPTZ DEFAULT now(),
    fecha_limite TIMESTAMPTZ,
    fecha_notificacion TIMESTAMPTZ,
    notificado BOOLEAN DEFAULT false,
    
    -- Estado del log
    is_milestone BOOLEAN DEFAULT false, -- Para marcar hitos importantes
    is_active BOOLEAN DEFAULT true,
    
    -- Metadatos
    metadata JSONB, -- Para información adicional específica
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para optimización de consultas
CREATE INDEX idx_tram_thesis_log_project_id ON public.tram_thesis_log(thesis_project_id);
CREATE INDEX idx_tram_thesis_log_step_number ON public.tram_thesis_log(step_number);
CREATE INDEX idx_tram_thesis_log_estado_nuevo ON public.tram_thesis_log(estado_nuevo);
CREATE INDEX idx_tram_thesis_log_actor_id ON public.tram_thesis_log(actor_id);
CREATE INDEX idx_tram_thesis_log_fecha_accion ON public.tram_thesis_log(fecha_accion);
CREATE INDEX idx_tram_thesis_log_milestone ON public.tram_thesis_log(is_milestone) WHERE is_milestone = true;

-- Trigger para updated_at
CREATE TRIGGER update_tram_thesis_log_updated_at BEFORE UPDATE
    ON public.tram_thesis_log FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();

-- Vista para consulta fácil del estado actual por proyecto
CREATE OR REPLACE VIEW public.thesis_current_status AS
SELECT DISTINCT ON (thesis_project_id)
    thesis_project_id,
    step_number,
    estado_nuevo as estado_actual,
    accion as ultima_accion,
    descripcion,
    actor_nombre,
    fecha_accion,
    is_milestone
FROM public.tram_thesis_log
WHERE is_active = true
ORDER BY thesis_project_id, fecha_accion DESC;

-- Función para agregar log de trámite
CREATE OR REPLACE FUNCTION add_thesis_log(
    p_thesis_project_id UUID,
    p_step_number INTEGER,
    p_estado_anterior VARCHAR(50),
    p_estado_nuevo VARCHAR(50),
    p_accion VARCHAR(100),
    p_descripcion TEXT DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_actor_tipo VARCHAR(20) DEFAULT 'sistema',
    p_actor_nombre VARCHAR(255) DEFAULT NULL,
    p_observaciones TEXT DEFAULT NULL,
    p_datos_adicionales JSONB DEFAULT NULL,
    p_documento_id UUID DEFAULT NULL,
    p_fecha_limite TIMESTAMPTZ DEFAULT NULL,
    p_is_milestone BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.tram_thesis_log (
        thesis_project_id,
        step_number,
        estado_anterior,
        estado_nuevo,
        accion,
        descripcion,
        actor_id,
        actor_tipo,
        actor_nombre,
        observaciones,
        datos_adicionales,
        documento_asociado_id,
        fecha_limite,
        is_milestone
    ) VALUES (
        p_thesis_project_id,
        p_step_number,
        p_estado_anterior,
        p_estado_nuevo,
        p_accion,
        p_descripcion,
        p_actor_id,
        p_actor_tipo,
        p_actor_nombre,
        p_observaciones,
        p_datos_adicionales,
        p_documento_id,
        p_fecha_limite,
        p_is_milestone
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener historial de trámites
CREATE OR REPLACE FUNCTION get_thesis_log_history(p_thesis_project_id UUID)
RETURNS TABLE (
    id UUID,
    step_number INTEGER,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    accion VARCHAR(100),
    descripcion TEXT,
    actor_nombre VARCHAR(255),
    actor_tipo VARCHAR(20),
    observaciones TEXT,
    fecha_accion TIMESTAMPTZ,
    is_milestone BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.step_number,
        l.estado_anterior,
        l.estado_nuevo,
        l.accion,
        l.descripcion,
        l.actor_nombre,
        l.actor_tipo,
        l.observaciones,
        l.fecha_accion,
        l.is_milestone
    FROM public.tram_thesis_log l
    WHERE l.thesis_project_id = p_thesis_project_id 
    AND l.is_active = true
    ORDER BY l.fecha_accion DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.tram_thesis_log IS 'Log detallado de todos los trámites y cambios de estado en proyectos de tesis';
COMMENT ON FUNCTION add_thesis_log IS 'Función para agregar un nuevo log de trámite de tesis';
COMMENT ON FUNCTION get_thesis_log_history IS 'Función para obtener el historial completo de trámites de un proyecto';
COMMENT ON VIEW public.thesis_current_status IS 'Vista del estado actual de cada proyecto de tesis';

-- ===========================================
-- Estado: EJECUTADO EXITOSAMENTE
-- ===========================================