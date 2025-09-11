-- Migración para agregar campos de pago a la tabla facturas
-- Ejecutar este script en Supabase para agregar los campos faltantes

-- Agregar columnas para efectivo y transferencia
ALTER TABLE facturas 
ADD COLUMN efectivo DECIMAL(10,2) DEFAULT 0,
ADD COLUMN transferencia DECIMAL(10,2) DEFAULT 0,
ADD COLUMN tipo_pago VARCHAR(20) DEFAULT 'efectivo';

-- Agregar constraint para tipo_pago
ALTER TABLE facturas 
ADD CONSTRAINT check_tipo_pago 
CHECK (tipo_pago IN ('efectivo', 'transferencia', 'combinado'));

-- Actualizar facturas existentes para migrar el total a efectivo
UPDATE facturas 
SET efectivo = total, 
    transferencia = 0, 
    tipo_pago = 'efectivo' 
WHERE efectivo IS NULL;

-- Hacer los campos NOT NULL después de la migración
ALTER TABLE facturas 
ALTER COLUMN efectivo SET NOT NULL,
ALTER COLUMN transferencia SET NOT NULL,
ALTER COLUMN tipo_pago SET NOT NULL;
