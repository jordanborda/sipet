Obtiene el contexto actual básico de la base de datos para operaciones posteriores.

## Función:

Proporciona una vista rápida y esencial del estado actual de la base de datos SIPeT, incluyendo:

- **Tablas existentes** y conteo de registros
- **Estructura básica** de tablas principales
- **Usuarios/datos actuales** para contexto

## Uso:

```
/db-analyze
```

El comando establece contexto para cualquier operación posterior como:
- Crear tablas
- Modificar esquemas  
- Insertar datos
- Desarrollar APIs

**Salida:** Resumen conciso del estado actual de la DB (sin reportes extensos)