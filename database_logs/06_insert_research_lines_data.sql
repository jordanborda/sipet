-- ===========================================
-- SIPeT Database Migration Script
-- ===========================================
-- Nombre: insert_research_lines_data
-- Fecha: 2025-01-07
-- Descripción: Insertar datos iniciales en research_lines
-- Ejecutado en: Supabase - Proyecto oydittvsdhggwfzxlnib
-- ===========================================

-- Insertar líneas de investigación iniciales para Ingeniería de Sistemas
INSERT INTO public.research_lines (nombre, descripcion, carrera, facultad, area_conocimiento) VALUES 
(
    'Inteligencia Artificial y Machine Learning',
    'Desarrollo e implementación de sistemas inteligentes, algoritmos de aprendizaje automático y redes neuronales para la solución de problemas complejos',
    'Ingeniería de Sistemas',
    'Facultad de Ingeniería',
    'Ciencias de la Computación'
),
(
    'Desarrollo Web y Aplicaciones Móviles',
    'Creación de aplicaciones web modernas, aplicaciones móviles multiplataforma y sistemas de información empresariales',
    'Ingeniería de Sistemas',
    'Facultad de Ingeniería',
    'Ingeniería de Software'
),
(
    'Ciberseguridad y Redes',
    'Implementación de medidas de seguridad informática, análisis de vulnerabilidades y administración de redes corporativas',
    'Ingeniería de Sistemas',
    'Facultad de Ingeniería',
    'Seguridad Informática'
),
(
    'Base de Datos y Big Data',
    'Diseño y optimización de bases de datos, análisis de grandes volúmenes de datos y sistemas de Business Intelligence',
    'Ingeniería de Sistemas',
    'Facultad de Ingeniería',
    'Gestión de Datos'
),
(
    'Realidad Virtual y Aumentada',
    'Desarrollo de experiencias inmersivas, simulaciones 3D y aplicaciones de realidad mixta para diversos sectores',
    'Ingeniería de Sistemas',
    'Facultad de Ingeniería',
    'Tecnologías Emergentes'
),
(
    'Internet de las Cosas (IoT)',
    'Desarrollo de sistemas conectados, sensores inteligentes y automatización para hogares y ciudades inteligentes',
    'Ingeniería de Sistemas',
    'Facultad de Ingeniería',
    'Sistemas Embebidos'
),
(
    'Computación en la Nube',
    'Implementación de arquitecturas cloud, microservicios y sistemas distribuidos escalables',
    'Ingeniería de Sistemas',
    'Facultad de Ingeniería',
    'Infraestructura Tecnológica'
);

-- ===========================================
-- Estado: EJECUTADO EXITOSAMENTE
-- Total de registros insertados: 7
-- ===========================================