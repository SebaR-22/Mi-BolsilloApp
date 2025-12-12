-- 1. Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL, -- Opcional para magic link
    avatar VARCHAR(255),
    theme VARCHAR(50) DEFAULT 'light',
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Usuarios
-- Permitir insert autenticados (el ID debe coincidir con auth.uid() o ser NULL para el sistema)
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Permitir insert desde el servidor (sin autenticación)
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON users FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Permitir que cualquier usuario autenticado vea su propio perfil
CREATE POLICY "Anyone can view their own user"
ON users FOR SELECT
USING (auth.uid() = id);

-- 3. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT '#000000',
    icon VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL para categorías de fábrica
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default user_id to auth.uid() for new client-side inserts
ALTER TABLE categories ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Categorías
-- Permitir ver: Categorías de sistema (user_id IS NULL) O categorías propias (user_id = auth.uid())
CREATE POLICY "Users can view system and own categories"
ON categories FOR SELECT
USING (user_id IS NULL OR user_id = auth.uid());

-- Permitir crear: Solo autenticados y asignando su propio ID
CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permitir actualizar/borrar: Solo si es dueño
CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);

-- 4. Tabla de Transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad para Transacciones
CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
ON transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE USING (auth.uid() = user_id);

-- 5. Datos Iniciales de Categorías (De Fábrica - user_id NULL)
-- Nota: Al insertar como superusuario o sistema, user_id puede ser NULL si no se especifica y el default no interviene, 
-- pero como pusimos default auth.uid(), es mejor ser explícito o deshabilitar RLS para el seed.
-- Aquí asumimos ejecución directa SQL donde auth.uid() puede ser nulo o ignorado si es Admin.
INSERT INTO categories (name, color, icon, type, user_id) VALUES
('Comida', '#ef4444', 'pizza', 'expense', NULL),
('Transporte', '#3b82f6', 'car', 'expense', NULL),
('Servicios', '#8b5cf6', 'laptop', 'expense', NULL),
('Otros', '#10b981', 'heart', 'expense', NULL)
ON CONFLICT DO NOTHING;

