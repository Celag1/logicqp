import { createClient } from '@supabase/supabase-js'
import { config } from '@/lib/config'

const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables de entorno de Supabase no configuradas!')
  console.error('Crea un archivo .env.local en apps/web/ con:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
})

export { createClient }
