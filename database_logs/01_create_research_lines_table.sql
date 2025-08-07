-- ===========================================
-- SIPeT Database Migration Script
-- ===========================================
-- Nombre: create_research_lines_table
-- Fecha: 2025-01-07
-- Descripción: Crear tabla research_lines para líneas de investigación
-- Ejecutado en: Supabase - Proyecto oydittvsdhggwfzxlnib
-- ===========================================

-- Crear tabla research_lines para líneas de investigación
CREATE TABLE public.research_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    carrera VARCHAR(100),
    facultad VARCHAR(100),
    area_conocimiento VARCHAR(100),
    responsable_id UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Añadir índices para optimización
CREATE INDEX idx_research_lines_carrera ON public.research_lines(carrera);
CREATE INDEX idx_research_lines_facultad ON public.research_lines(facultad);
CREATE INDEX idx_research_lines_responsable_id ON public.research_lines(responsable_id);

-- Añadir trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_research_lines_updated_at BEFORE UPDATE
    ON public.research_lines FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column();

COMMENT ON TABLE public.research_lines IS 'Líneas de investigación disponibles para proyectos de tesis';

-- ===========================================
-- Estado: EJECUTADO EXITOSAMENTE
-- ===========================================