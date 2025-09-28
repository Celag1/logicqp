-- Corregir usuario super-admin
UPDATE profiles 
SET 
  rol = 'super_admin',
  telefono = '0998769259',
  direccion = 'Av. Bolivariana 1441 y Genovesa, Ambato, Ecuador',
  empresa = 'IngSoft S.A.',
  email_verificado = true,
  telefono_verificado = true
WHERE email = 'celag3@gmail.com';
