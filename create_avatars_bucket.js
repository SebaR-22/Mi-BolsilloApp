const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auifcmslsgwtjceqrthk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aWZjbXNsc2d3dGpjZXFydGhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTExMjA1OCwiZXhwIjoyMDgwNjg4MDU4fQ.IZK3WD9CqTUNVJXoaQu3yVNPqXQdQD7LOkF_QW3uu74';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAvatarsBucket() {
  try {
    console.log('Creando bucket "avatars"...');
    
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true, // Permitir acceso público
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ El bucket "avatars" ya existe.');
      } else {
        console.error('❌ Error al crear bucket:', error.message);
      }
      return;
    }

    console.log('✅ Bucket "avatars" creado exitosamente:', data);
    console.log('Configurando permisos públicos de lectura...');

    // Obtener lista de buckets para confirmar
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listando buckets:', listError.message);
    } else {
      console.log('Buckets disponibles:', buckets.map(b => b.name));
    }
  } catch (err) {
    console.error('Error inesperado:', err.message);
  }
}

createAvatarsBucket();
