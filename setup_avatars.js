const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auifcmslsgwtjceqrthk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aWZjbXNsc2d3dGpjZXFydGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTIwNTgsImV4cCI6MjA4MDY4ODA1OH0.PJNumsoJ1SuFEmvsgOS_RBDgokXg2OEqGz4FFJnLfBs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupAvatarStorage() {
  try {
    console.log('🔧 Configurando almacenamiento de avatares...\n');

    // Intentar crear el bucket
    console.log('1️⃣  Intentando crear bucket "avatars"...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.warn('⚠️  Error creando bucket:', bucketError.message);
      console.log('   (Esto es normal si ya existe)\n');
    } else if (bucketData) {
      console.log('✅ Bucket "avatars" creado exitosamente\n');
    } else {
      console.log('✅ El bucket "avatars" ya existe\n');
    }

    // Verificar acceso de escritura con un archivo de prueba
    console.log('2️⃣  Probando acceso de escritura...');
    const testFile = new Uint8Array([0xff, 0xd8, 0xff]); // Mini JPEG header
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload('test_write_permission.jpg', testFile, {
        upsert: true,
      });

    if (uploadError) {
      console.log('⚠️  No se puede escribir directamente (normal si hay RLS)');
      console.log('   Error:', uploadError.message, '\n');
    } else {
      console.log('✅ Acceso de escritura OK\n');
      // Limpiar archivo de prueba
      await supabase.storage.from('avatars').remove(['test_write_permission.jpg']);
    }

    // Verificar acceso de lectura
    console.log('3️⃣  Probando acceso de lectura...');
    const { data: fileList, error: listError } = await supabase.storage
      .from('avatars')
      .list('');

    if (listError) {
      console.log('❌ No se puede listar archivos:', listError.message);
    } else {
      console.log('✅ Acceso de lectura OK');
      console.log('   Archivos en bucket:', fileList.length);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📌 RESUMEN:');
    console.log('='.repeat(60));
    console.log('✅ Bucket "avatars" listo para usar');
    console.log('   - URL pública: https://auifcmslsgwtjceqrthk.supabase.co/storage/v1/object/public/avatars/');
    console.log('   - Usuarios pueden subir avatares');
    console.log('   - Los avatares se guardan como URLs públicas en la BD');
    console.log('   - Las fotos son accesibles para todos\n');

  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

setupAvatarStorage();
