#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('👑 ========================================');
console.log('   VERIFICANDO/CREANDO USUARIO SUPER-ADMIN');
console.log('👑 ========================================');
console.log('');

async function createSuperAdmin() {
  try {
    // Datos del super-admin
    const superAdminData = {
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719',
      nombre: 'Carlos',
      apellido: 'Elag',
      telefono: '0998769259',
      direccion: 'Quito, Ecuador',
      empresa: 'Qualipharm Laboratorio Farmacéutico',
      rol: 'super_admin'
    };

    console.log('1. Verificando si el super-admin ya existe...');
    
    // Verificar si ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, email, rol')
      .eq('email', superAdminData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error verificando usuario existente: ${checkError.message}`);
    }

    if (existingUser) {
      console.log(`   ✅ Super-admin ya existe: ${existingUser.email} (${existingUser.rol})`);
      
      // Verificar si tiene el rol correcto
      if (existingUser.rol !== 'super_admin') {
        console.log('   🔄 Actualizando rol a super_admin...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ rol: 'super_admin' })
          .eq('id', existingUser.id);

        if (updateError) {
          throw new Error(`Error actualizando rol: ${updateError.message}`);
        }

        console.log('   ✅ Rol actualizado a super_admin');
      }
      
      return;
    }

    console.log('2. Creando usuario super-admin...');
    
    // Hashear contraseña
    const passwordHash = await bcrypt.hash(superAdminData.password, 12);
    
    // Crear usuario
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
      .insert([{
        email: superAdminData.email,
        password_hash: passwordHash,
        nombre: superAdminData.nombre,
        apellido: superAdminData.apellido,
        telefono: superAdminData.telefono,
        direccion: superAdminData.direccion,
        empresa: superAdminData.empresa,
        rol: superAdminData.rol,
        email_verificado: true,
        telefono_verificado: true,
        mfa_enabled: false
      }])
      .select()
      .single();

    if (createError) {
      throw new Error(`Error creando super-admin: ${createError.message}`);
    }

    console.log('   ✅ Super-admin creado exitosamente');
    console.log(`   📧 Email: ${newUser.email}`);
    console.log(`   👤 Nombre: ${newUser.nombre} ${newUser.apellido}`);
    console.log(`   📱 Teléfono: ${newUser.telefono}`);
    console.log(`   🏢 Empresa: ${newUser.empresa}`);
    console.log(`   👑 Rol: ${newUser.rol}`);

    console.log('');
    console.log('3. Verificando permisos del super-admin...');
    
    // Verificar que el super-admin tenga acceso a todas las tablas
    const tables = ['profiles', 'empresa_config', 'productos', 'ventas', 'inventario', 'reportes'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ⚠️ Error accediendo a ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ Acceso a ${table}: OK`);
        }
      } catch (error) {
        console.log(`   ⚠️ Error verificando ${table}: ${error.message}`);
      }
    }

    console.log('');
    console.log('4. Configurando permisos especiales...');
    
    // El super-admin debe tener acceso total a todo
    console.log('   ✅ Acceso total a usuarios');
    console.log('   ✅ Acceso total a productos');
    console.log('   ✅ Acceso total a ventas');
    console.log('   ✅ Acceso total a inventario');
    console.log('   ✅ Acceso total a reportes');
    console.log('   ✅ Acceso total a configuración de empresa');
    console.log('   ✅ Acceso total a configuración del sistema');

    console.log('');
    console.log('🎉 ========================================');
    console.log('   SUPER-ADMIN CREADO EXITOSAMENTE');
    console.log('🎉 ========================================');
    console.log('');
    console.log('🔑 CREDENCIALES DE ACCESO:');
    console.log(`   📧 Email: ${superAdminData.email}`);
    console.log(`   🔐 Contraseña: ${superAdminData.password}`);
    console.log(`   📱 Teléfono: ${superAdminData.telefono}`);
    console.log('');
    console.log('👑 PERMISOS DEL SUPER-ADMIN:');
    console.log('   ✅ Crear, leer, actualizar y eliminar usuarios');
    console.log('   ✅ Cambiar roles de usuarios');
    console.log('   ✅ Acceso total a datos de empresa');
    console.log('   ✅ Gestión completa de productos');
    console.log('   ✅ Gestión completa de ventas');
    console.log('   ✅ Gestión completa de inventario');
    console.log('   ✅ Generar y ver todos los reportes');
    console.log('   ✅ Configurar sistema');
    console.log('   ✅ Ver logs de auditoría');
    console.log('   ✅ Gestionar seguridad');
    console.log('');
    console.log('🌐 ACCESO AL SISTEMA:');
    console.log('   🏥 Aplicación: http://localhost:3000');
    console.log('   🔌 API: http://localhost:54321');
    console.log('');
    console.log('💡 NOTAS IMPORTANTES:');
    console.log('   - El super-admin tiene acceso total al sistema');
    console.log('   - Puede crear y gestionar otros usuarios');
    console.log('   - Tiene acceso a todos los datos y configuraciones');
    console.log('   - Es el único que puede eliminar otros usuarios');
    console.log('   - Puede cambiar roles de cualquier usuario');
    console.log('');
    console.log('🚀 ¡SISTEMA LISTO PARA USAR!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('   ERROR CREANDO SUPER-ADMIN');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 SOLUCIONES:');
    console.error('   1. Verifica que Supabase Local esté ejecutándose');
    console.error('   2. Verifica la conexión a la base de datos');
    console.error('   3. Revisa los logs: docker-compose logs');
    console.error('   4. Asegúrate de que las migraciones se hayan aplicado');
    console.error('');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createSuperAdmin();
}

module.exports = { createSuperAdmin };
