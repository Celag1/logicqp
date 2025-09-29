// Configuración centralizada para Qualipharm Laboratorio Farmacéutico
export const config = {
  supabase: {
    url: 'https://fwahfmwtbgikzuzmnpsv.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ'
  },
  empresa: {
    nombre: 'Qualipharm Laboratorio Farmacéutico',
    ruc: '1791234567001',
    direccion: 'Av. Manuel Córdova Galarza OE4-175 y Esperanza, Quito, Ecuador',
    telefono: '+593 2 249-2870',
    email: 'daniela.moyano@qualipharmlab.com',
    sitio_web: 'https://www.qualipharmlab.com/',
    descripcion: 'Satisfacemos sus necesidades de desarrollo, producción, logística, asesoría técnica y normativa de productos para la salud y la belleza, con cercanía y versatilidad, sin ser competencia para nuestros clientes.',
    mision: 'Desarrollar y producir medicamentos innovadores que mejoren la calidad de vida de las personas, manteniendo los más altos estándares de calidad y seguridad.',
    vision: 'Ser el laboratorio farmacéutico más confiable y reconocido del Ecuador, expandiendo nuestra presencia en mercados internacionales.',
    valores: 'Calidad, Innovación, Integridad, Compromiso con la salud',
    logo_url: '/logo-qualipharm.png', // Logo local de Qualipharm
    color_primario: '#0056b3',
    color_secundario: '#28a745',
    moneda: 'USD',
    pais: 'Ecuador',
    idioma: 'es',
    zona_horaria: 'America/Guayaquil'
  }
}

// Validar configuración
if (!config.supabase.url || config.supabase.url.includes('127.0.0.1')) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada correctamente')
  console.error('Valor actual:', process.env.NEXT_PUBLIC_SUPABASE_URL)
}

if (!config.supabase.anonKey || config.supabase.anonKey.includes('demo')) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada correctamente')
  console.error('Valor actual:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'NO configurada')
}

console.log('🏥 Qualipharm Laboratorio Farmacéutico - Configuración Supabase:')
console.log('URL:', config.supabase.url)
console.log('Key:', config.supabase.anonKey ? '✅ Configurada' : '❌ NO configurada')
console.log('Empresa:', config.empresa.nombre)
console.log('Email:', config.empresa.email)
