const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auifcmslsgwtjceqrthk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1aWZjbXNsc2d3dGpjZXFydGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTIwNTgsImV4cCI6MjA4MDY4ODA1OH0.PJNumsoJ1SuFEmvsgOS_RBDgokXg2OEqGz4FFJnLfBs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listBuckets() {
  try {
    console.log('Listando buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Buckets disponibles:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error inesperado:', err.message);
  }
}

listBuckets();
