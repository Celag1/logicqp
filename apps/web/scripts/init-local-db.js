const { initDatabase } = require('../lib/database/local-db.ts')

async function initializeLocalDatabase() {
  try {
    console.log('🚀 Inicializando base de datos local LogicQP...')
    
    // Crear el directorio de datos si no existe
    const fs = require('fs')
    const path = require('path')
    const dataDir = path.join(__dirname, '..', 'data')
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log('📁 Directorio de datos creado')
    }
    
    // Inicializar la base de datos
    await initDatabase()
    
    console.log('✅ Base de datos local LogicQP inicializada correctamente')
    console.log('📊 Datos incluidos:')
    console.log('   - 3 usuarios (incluyendo super admin)')
    console.log('   - 1 empresa (LogicQP)')
    console.log('   - 2 productos de ejemplo')
    console.log('   - 1 cliente de ejemplo')
    console.log('   - 1 proveedor de ejemplo')
    console.log('   - Configuración básica')
    console.log('')
    console.log('🎯 La aplicación ahora puede funcionar completamente en modo local')
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos local:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeLocalDatabase()
}

module.exports = { initializeLocalDatabase }
