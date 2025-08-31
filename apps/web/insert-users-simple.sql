-- Script simple para insertar usuarios de prueba
-- Ejecutar en Supabase SQL Editor

-- Insertar usuarios de prueba en la tabla profiles
INSERT INTO profiles (id, email, nombre, rol, email_verified, created_at, updated_at) VALUES
-- Super Admin
(gen_random_uuid(), 'celag3@gmail.com', 'Carlos Elag', 'super_admin', true, NOW(), NOW()),

-- Administrador
(gen_random_uuid(), 'admin@qp.ec', 'Administrador QP', 'administrador', true, NOW(), NOW()),

-- Vendedor
(gen_random_uuid(), 'ventas@qp.ec', 'Ventas QP', 'vendedor', true, NOW(), NOW()),

-- Inventario
(gen_random_uuid(), 'invent@qp.ec', 'Inventario QP', 'inventario', true, NOW(), NOW()),

-- Contable
(gen_random_uuid(), 'contab@qp.ec', 'Contable QP', 'contable', true, NOW(), NOW()),

-- Cliente
(gen_random_uuid(), 'elipaz31@gmail.com', 'Eli Paz', 'cliente', true, NOW(), NOW());

-- Verificar que se insertaron
SELECT * FROM profiles ORDER BY created_at;
