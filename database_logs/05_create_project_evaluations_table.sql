-- ===========================================
-- SIPeT Database Migration Script
-- ===========================================
-- Nombre: create_project_evaluations_table
-- Fecha: 2025-01-07
-- Descripción: Crear tabla project_evaluations para evaluaciones y seguimiento
-- Ejecutado en: Supabase - Proyecto oydittvsdhggwfzxlnib
-- ===========================================

-- Crear tabla project_evaluations para evaluaciones y seguimiento
CREATE TABLE public.project_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thesis_project_id UUID NOT NULL REFERENCES public.thesis_projects(id) ON DELETE CASCADE,
    evaluador_id UUID NOT NULL REFERENCES public.users(id),
    
    -- Tipo de evaluación
    tipo_evaluacion VARCHAR(30) NOT NULL CHECK (tipo_evaluacion IN (
        'revision_formato',
        'aprobacion_director',
        'revision_jurado',
        'dictamen_final',
        'defensa_tesis'
    )),
    
    -- Resultado de la evaluación
    resultado VARCHAR(20) NOT NULL CHECK (resultado IN (
        'aprobado',
        'aprobado_con_observaciones',
        'rechazado',
        'pendiente',
        'en_proceso'
    )),
    
    -- Calificación (si aplica)
    calificacion_numerica DECIMAL(4,2),
    calificacion_literal VARCHAR(20),
    
    -- Observaciones y comentarios
    observaciones TEXT,
    recomendaciones TEXT,
    aspectos_positivos TEXT,
    aspectos_a_mejorar TEXT,
    
    -- Fechas
    fecha_evaluacion TIMESTAMPTZ DEFAULT now(),
    fecha_limite TIMESTAMPTZ,
    tiempo_respuesta_horas INTEGER,
    
    -- Rúbrica de evaluación (JSON para flexibilidad)
    criterios_evaluacion JSONB,
    puntajes JSONB,
    
    -- Estado del proceso
    estado_notificacion VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_notificacion IN (
        'pendiente',
        'notificado',
        'visto_por_estudiante'
    )),
    fecha_notificacion TIMESTAMPTZ,
    fecha_vista_estudiante TIMESTAMPTZ,
    
    -- Documentos asociados (si hay informes específicos)
    documento_informe_id UUID REFERENCES public.project_documents(id),
    
    -- Control de versión/iteración
    numero_revision INTEGER DEFAULT 1,
    es_evaluacion_final BOOLEAN DEFAULT false,
    
    -- Control
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_project_evaluations_project ON public.project_evaluations(thesis_project_id);
CREATE INDEX idx_project_evaluations_evaluador ON public.project_evaluations(evaluador_id);
CREATE INDEX idx_project_evaluations_tipo ON public.project_evaluations(tipo_evaluacion);
CREATE INDEX idx_project_evaluations_resultado ON public.project_evaluations(resultado);
CREATE INDEX idx_project_evaluations_fecha ON public.project_evaluations(fecha_evaluacion);
CREATE INDEX idx_project_evaluations_estado ON public.project_evaluations(estado_notificacion);

-- Trigger para updated_at
CREATE TRIGGER update_project_evaluations_updated_at BEFORE UPDATE
    ON public.project_evaluations FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();

-- Función para calcular tiempo de respuesta automáticamente
CREATE OR REPLACE FUNCTION calculate_response_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular tiempo de respuesta en horas si hay fecha límite
    IF OLD.fecha_evaluacion IS NULL AND NEW.fecha_evaluacion IS NOT NULL AND NEW.fecha_limite IS NOT NULL THEN
        NEW.tiempo_respuesta_horas := EXTRACT(EPOCH FROM (NEW.fecha_evaluacion - NEW.fecha_limite)) / 3600;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_evaluation_response_time BEFORE UPDATE
    ON public.project_evaluations FOR EACH ROW EXECUTE PROCEDURE
    calculate_response_time();

COMMENT ON TABLE public.project_evaluations IS 'Evaluaciones y seguimiento de proyectos de tesis por parte de supervisores y jurados';

-- ===========================================
-- Estado: EJECUTADO EXITOSAMENTE
-- ===========================================