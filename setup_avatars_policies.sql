-- ==========================================
-- Políticas RLS para bucket "avatars"
-- Ejecutar en: https://app.supabase.com/project/[PROJECT_ID]/sql/new
-- ==========================================

-- 1. Permitir lectura pública de avatares
CREATE POLICY "Public read avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- 2. Permitir a usuarios autenticados subir avatares (a su carpeta)
CREATE POLICY "Authenticated users upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- 3. Permitir actualizar su propio avatar
CREATE POLICY "Users update own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- 4. Permitir eliminar su propio avatar
CREATE POLICY "Users delete own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
