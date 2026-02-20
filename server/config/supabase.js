import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from root .env for local dev; on Render, env vars are set in dashboard
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase URL and anon key not fully configured. Using PostgreSQL pooler connection.');
}

// Public client (respects RLS) - for read operations
export const supabasePublic = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Admin client (bypasses RLS) - for write operations
// Uses service role key which should ONLY be used server-side
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// PostgreSQL connection details for direct queries if needed
export const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  poolMode: process.env.DB_POOL_MODE
};

// Test connection with better error handling
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('bikes')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase Query Error:', error.message);
      console.error('Error code:', error.code);
      console.error('Status:', error.status);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase Connection Error:', error.message);
    console.error('Full error:', error);
    return false;
  }
}
