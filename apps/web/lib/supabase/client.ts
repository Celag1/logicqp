import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: Mostrar las variables de entorno en consola
console.log('🔍 Supabase Config Debug:')
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ NO configurada')
console.log('ANON KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ NO configurada')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables de entorno de Supabase no configuradas!')
  console.error('Crea un archivo .env.local en apps/web/ con:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export { createClient }
