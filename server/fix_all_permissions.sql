-- 1. SOLUCIONAR TABLA USERS (Tu error principal)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir que el usuario se CREAR a sí mismo (necesario para el primer login/sync)
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Permitir que el usuario se ACTUALICE a sí mismo
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Permitir ver su propio perfil (o todos si es una red social, pero mejor restringir por ahora)
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);


-- 2. SOLUCIONAR TABLA TRANSACTIONS (Para guardar gastos)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Esta es la que fallaba antes en transacciones
CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON transactions FOR UPDATE
USING (auth.uid() = user_id);


-- 3. SOLUCIONAR TABLA CATEGORIES (Para crear categorías nuevas)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Si las categorías NO tienen user_id, permitimos que cualquier usuario logueado las vea
CREATE POLICY "Authenticated users can view categories"
ON categories FOR SELECT
TO authenticated
USING (true);

-- Permitir crear categorías nuevas
CREATE POLICY "Authenticated users can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);
