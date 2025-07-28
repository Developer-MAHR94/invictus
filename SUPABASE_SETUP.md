# Configuración de Supabase para Invictus Barber

## Pasos para configurar Supabase:

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa la información del proyecto:
   - **Name**: `invictus-barber`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana a tu ubicación

### 2. Obtener credenciales
1. En el dashboard de tu proyecto, ve a **Settings** > **API**
2. Copia:
   - **Project URL** (ej: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)

### 3. Configurar variables de entorno
1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:
```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Configurar la base de datos
1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `supabase-schema.sql`
3. Ejecuta el script para crear todas las tablas

### 5. Verificar la configuración
1. Ve a **Table Editor** en Supabase
2. Deberías ver las siguientes tablas:
   - `usuarios`
   - `productos`
   - `facturas`
   - `cierres_caja`
   - `barberos`
   - `propinas`

### 6. Datos iniciales
El script SQL ya incluye los usuarios iniciales:
- **Admin**: `luis.paez` / `1234`
- **Asistente**: `natali.gomez` / `1002158638`
- **Barberos**: 
  - `jose.torres` / `1044215117`
  - `breiner.ferrer` / `1002185092`
  - `edinson.vergara` / `1001914098`

## Configuración para producción (Vercel)

### Variables de entorno en Vercel:
1. En tu proyecto de Vercel, ve a **Settings** > **Environment Variables**
2. Agrega las mismas variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Configuración de CORS:
1. En Supabase, ve a **Settings** > **API**
2. En **CORS Origins**, agrega tu dominio de Vercel:
   - `https://tu-proyecto.vercel.app`
   - `http://localhost:5173` (para desarrollo)

## Estructura de la base de datos

### Tabla `usuarios`
- `id`: UUID (clave primaria)
- `usuario`: VARCHAR(50) UNIQUE
- `clave`: VARCHAR(255)
- `rol`: ENUM('admin', 'asistente', 'barbero')
- `nombre`: VARCHAR(100)
- `apellido`: VARCHAR(100)
- `created_at`: TIMESTAMP

### Tabla `productos`
- `id`: UUID (clave primaria)
- `nombre`: VARCHAR(200)
- `precio_entrada`: DECIMAL(10,2)
- `precio_salida`: DECIMAL(10,2)
- `cantidad`: INTEGER
- `fecha_ingreso`: DATE
- `created_at`: TIMESTAMP

### Tabla `facturas`
- `id`: UUID (clave primaria)
- `numero`: VARCHAR(50) UNIQUE
- `fecha`: DATE
- `cliente`: VARCHAR(200)
- `servicios`: JSONB
- `total`: DECIMAL(10,2)
- `abierta`: BOOLEAN
- `created_at`: TIMESTAMP

### Tabla `cierres_caja`
- `id`: UUID (clave primaria)
- `fecha`: DATE
- `total_ventas`: DECIMAL(10,2)
- `total_propinas`: DECIMAL(10,2)
- `total_efectivo`: DECIMAL(10,2)
- `total_tarjeta`: DECIMAL(10,2)
- `observaciones`: TEXT
- `created_at`: TIMESTAMP

### Tabla `barberos`
- `id`: UUID (clave primaria)
- `usuario`: VARCHAR(50) UNIQUE
- `nombre`: VARCHAR(100)
- `apellido`: VARCHAR(100)
- `created_at`: TIMESTAMP

### Tabla `propinas`
- `id`: UUID (clave primaria)
- `barbero`: VARCHAR(50)
- `monto`: DECIMAL(10,2)
- `fecha`: DATE
- `entregada`: BOOLEAN
- `created_at`: TIMESTAMP

## Notas importantes

1. **Seguridad**: Las contraseñas están en texto plano en este ejemplo. Para producción, deberías usar hash de contraseñas.

2. **RLS**: Row Level Security está habilitado con políticas básicas. Puedes ajustar las políticas según tus necesidades de seguridad.

3. **Backup**: Supabase hace backups automáticos, pero es recomendable configurar backups adicionales para datos críticos.

4. **Monitoreo**: Usa el dashboard de Supabase para monitorear el uso de la base de datos y el rendimiento. 