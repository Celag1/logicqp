const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function killProcessOnPort(port) {
  try {
    console.log(`🔍 Verificando puerto ${port}...`);
    
    // Buscar procesos en el puerto
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (stdout) {
      console.log(`⚠️  Puerto ${port} está en uso. Terminando procesos...`);
      
      // Extraer PIDs de la salida
      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      const pids = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[parts.length - 1];
      }).filter(pid => pid && !isNaN(pid));
      
      // Terminar cada proceso
      for (const pid of pids) {
        try {
          console.log(`🔄 Terminando proceso PID: ${pid}`);
          await execAsync(`taskkill /PID ${pid} /F`);
          console.log(`✅ Proceso ${pid} terminado`);
        } catch (error) {
          console.log(`⚠️  No se pudo terminar proceso ${pid}:`, error.message);
        }
      }
      
      // Esperar un momento para que los procesos se terminen
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`✅ Puerto ${port} está libre`);
    }
  } catch (error) {
    console.log(`✅ Puerto ${port} está libre (no hay procesos)`);
  }
}

async function startServer() {
  try {
    console.log('🚀 Iniciando LogicQP en puerto 3000...');
    
    // Asegurar que el puerto 3000 esté libre
    await killProcessOnPort(3000);
    
    // Iniciar el servidor
    console.log('🎯 Iniciando servidor de desarrollo...');
    const { spawn } = require('child_process');
    
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: '3000' }
    });
    
    server.on('error', (error) => {
      console.error('❌ Error iniciando servidor:', error);
    });
    
    server.on('close', (code) => {
      console.log(`🔄 Servidor terminado con código: ${code}`);
    });
    
    // Manejar cierre del proceso
    process.on('SIGINT', () => {
      console.log('\n🛑 Cerrando servidor...');
      server.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

startServer();
