# 🚀 Invictus Barber - Configuración con Supabase

## ✅ **Cambios realizados:**

### **1. Migración completa a Supabase:**
- ✅ Login usando base de datos de Supabase
- ✅ Productos almacenados en Supabase
- ✅ Facturas almacenadas en Supabase
- ✅ Cierres de caja almacenados en Supabase
- ✅ Usuarios gestionados desde Supabase

### **2. Funcionalidades preservadas:**
- ✅ Todas las funcionalidades existentes siguen funcionando
- ✅ Interfaz de usuario sin cambios
- ✅ Flujo de trabajo idéntico
- ✅ Solo cambió el almacenamiento de datos

## 🔧 **Configuración necesaria:**

### **1. Crear archivo `.env.local`:**
En la raíz del proyecto, crea un archivo `.env.local` con:

```env
VITE_SUPABASE_URL=https://uaymixmcuoaqgrpxqudy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheW1peG1jdW9hcWdycHhxdWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MDE0NjAsImV4cCI6MjA2OTI3NzQ2MH0.wxw7zeTAwL5XAJnG4MV4_FukkNdK8ctnY889hyaTTQc
```

### **2. Configurar CORS en Supabase:**
1. Ve a tu proyecto en Supabase
2. **Settings** > **API**
3. En **CORS Origins** agrega:
   - `http://localhost:5173` (desarrollo)
   - `https://tu-proyecto.vercel.app` (producción)

### **3. Reiniciar el servidor:**
```bash
npm run dev
```

## 🎯 **Usuarios disponibles:**

Los usuarios ya están configurados en Supabase:

- **Admin**: `luis.paez` / `1234`
- **Asistente**: `natali.gomez` / `1002158638`
- **Barberos**: 
  - `jose.torres` / `1044215117`
  - `breiner.ferrer` / `1002185092`
  - `edinson.vergara` / `1001914098`

## 🔄 **Cambios en el código:**

### **Archivos modificados:**
- `src/views/Login.tsx` - Ahora usa Supabase para autenticación
- `src/context/AppDataContext.tsx` - Migrado a Supabase
- `src/services/supabaseService.ts` - Servicios para Supabase
- `src/lib/supabase.ts` - Configuración de Supabase

### **Archivos nuevos:**
- `supabase-schema.sql` - Estructura de la base de datos
- `SUPABASE_SETUP.md` - Instrucciones de configuración

## 🚀 **Despliegue en Vercel:**

### **Variables de entorno en Vercel:**
1. En tu proyecto de Vercel, ve a **Settings** > **Environment Variables**
2. Agrega las mismas variables que en `.env.local`

### **Configuración de CORS:**
Agrega tu dominio de Vercel en Supabase:
- `https://tu-proyecto.vercel.app`

## ✅ **Verificación:**

### **Para verificar que todo funciona:**
1. Inicia sesión con cualquier usuario
2. Crea un producto en Inventario
3. Crea una factura en Facturación
4. Verifica que los datos aparecen en Supabase

### **En Supabase puedes verificar:**
- **Table Editor** > `usuarios` - Ver usuarios
- **Table Editor** > `productos` - Ver productos creados
- **Table Editor** > `facturas` - Ver facturas creadas

## 🔧 **Solución de problemas:**

### **Si no puedes iniciar sesión:**
1. Verifica que el archivo `.env.local` existe
2. Verifica que las credenciales son correctas
3. Verifica que CORS está configurado en Supabase
4. Reinicia el servidor de desarrollo

### **Si los datos no se guardan:**
1. Verifica la conexión a Supabase en la consola del navegador
2. Verifica que las tablas existen en Supabase
3. Verifica que las políticas RLS permiten las operaciones

## 🎉 **¡Listo!**

Tu aplicación ahora usa Supabase como base de datos y está lista para producción. Todos los datos se sincronizan automáticamente y se mantienen seguros en la nube. 