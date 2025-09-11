-- Crear tabla de usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  clave VARCHAR(255) NOT NULL,
  rol VARCHAR(20) CHECK (rol IN ('admin', 'asistente', 'barbero')) NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  precio_entrada DECIMAL(10,2) NOT NULL,
  precio_salida DECIMAL(10,2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  fecha_ingreso DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de facturas
CREATE TABLE facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL,
  cliente VARCHAR(200) NOT NULL,
  servicios JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  abierta BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cierres de caja
CREATE TABLE cierres_caja (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  total_ventas DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_propinas DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_efectivo DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_tarjeta DECIMAL(10,2) NOT NULL DEFAULT 0,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de barberos
CREATE TABLE barberos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de propinas
CREATE TABLE propinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbero VARCHAR(50) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  entregada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales de usuarios
INSERT INTO usuarios (usuario, clave, rol, nombre, apellido) VALUES
('luis.paez', '1234', 'admin', 'Luis', 'Paez'),
('natali.gomez', '1002158638', 'admin', 'Nataly', 'Gomez'),
('jose.torres', '1044215117', 'barbero', 'José', 'Torres'),
('breiner.ferrer', '1002185092', 'barbero', 'Breiner', 'Ferrer'),
('edinson.vergara', '1001914098', 'barbero', 'Edinson', 'Vergara');

-- Insertar datos iniciales de barberos
INSERT INTO barberos (usuario, nombre, apellido) VALUES
('jose.torres', 'José', 'Torres'),
('breiner.ferrer', 'Breiner', 'Ferrer'),
('edinson.vergara', 'Edinson', 'Vergara');

-- Crear índices para mejor rendimiento
CREATE INDEX idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_abierta ON facturas(abierta);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_propinas_barbero ON propinas(barbero);
CREATE INDEX idx_propinas_entregada ON propinas(entregada);
CREATE INDEX idx_cierres_caja_fecha ON cierres_caja(fecha);

-- Configurar RLS (Row Level Security) - opcional para mayor seguridad
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierres_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE barberos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propinas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo para desarrollo)
CREATE POLICY "Permitir todo en usuarios" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir todo en productos" ON productos FOR ALL USING (true);
CREATE POLICY "Permitir todo en facturas" ON facturas FOR ALL USING (true);
CREATE POLICY "Permitir todo en cierres_caja" ON cierres_caja FOR ALL USING (true);
CREATE POLICY "Permitir todo en barberos" ON barberos FOR ALL USING (true);
CREATE POLICY "Permitir todo en propinas" ON propinas FOR ALL USING (true); 