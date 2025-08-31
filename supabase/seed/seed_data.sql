-- =====================================================
-- LOGICQP - DATOS DE PRUEBA (SEED)
-- =====================================================

-- Insertar categorías de productos farmacéuticos
INSERT INTO categorias (nombre, descripcion) VALUES
('Analgésicos', 'Medicamentos para el alivio del dolor'),
('Antiinflamatorios', 'Medicamentos para reducir la inflamación'),
('Antibióticos', 'Medicamentos para tratar infecciones bacterianas'),
('Antihistamínicos', 'Medicamentos para alergias'),
('Vitaminas', 'Suplementos vitamínicos'),
('Dermatológicos', 'Productos para el cuidado de la piel'),
('Oftalmológicos', 'Productos para el cuidado de los ojos'),
('Cardiovasculares', 'Medicamentos para el corazón'),
('Gastrointestinales', 'Medicamentos para problemas digestivos'),
('Respiratorios', 'Medicamentos para problemas respiratorios'),
('Antidiabéticos', 'Medicamentos para la diabetes'),
('Hormonales', 'Medicamentos hormonales'),
('Oncológicos', 'Medicamentos para el cáncer'),
('Neurológicos', 'Medicamentos para el sistema nervioso'),
('Inmunológicos', 'Medicamentos para el sistema inmune');

-- Insertar proveedores
INSERT INTO proveedores (nombre, ruc, direccion, telefono, email, contacto) VALUES
('Laboratorios Pfizer Ecuador', '1790012345001', 'Quito, Ecuador', '+593 2 234 5678', 'info@pfizer.ec', 'Dr. Carlos Méndez'),
('Roche Ecuador S.A.', '1790012345002', 'Guayaquil, Ecuador', '+593 4 345 6789', 'contacto@roche.ec', 'Lic. María González'),
('Novartis Ecuador', '1790012345003', 'Cuenca, Ecuador', '+593 7 456 7890', 'info@novartis.ec', 'Dr. Roberto Silva'),
('Merck Ecuador', '1790012345004', 'Manta, Ecuador', '+593 5 567 8901', 'ventas@merck.ec', 'Ing. Ana Torres'),
('Bayer Ecuador', '1790012345005', 'Portoviejo, Ecuador', '+593 5 678 9012', 'info@bayer.ec', 'Dr. Luis Vargas'),
('GSK Ecuador', '1790012345006', 'Santo Domingo, Ecuador', '+593 2 789 0123', 'contacto@gsk.ec', 'Lic. Carmen Ruiz'),
('AstraZeneca Ecuador', '1790012345007', 'Machala, Ecuador', '+593 7 890 1234', 'info@astrazeneca.ec', 'Dr. Pedro Mendoza'),
('Sanofi Ecuador', '1790012345008', 'Esmeraldas, Ecuador', '+593 6 901 2345', 'ventas@sanofi.ec', 'Ing. Rosa Herrera'),
('Johnson & Johnson Ecuador', '1790012345009', 'Ibarra, Ecuador', '+593 6 012 3456', 'info@jnj.ec', 'Dr. Fernando Castro'),
('Abbott Ecuador', '1790012345010', 'Loja, Ecuador', '+593 7 123 4567', 'contacto@abbott.ec', 'Lic. Patricia Mora'),
('Eli Lilly Ecuador', '1790012345011', 'Ambato, Ecuador', '+593 3 234 5678', 'info@lilly.ec', 'Dr. Ricardo Paredes'),
('Bristol-Myers Squibb Ecuador', '1790012345012', 'Riobamba, Ecuador', '+593 3 345 6789', 'ventas@bms.ec', 'Ing. Gloria Salazar'),
('Takeda Ecuador', '1790012345013', 'Latacunga, Ecuador', '+593 3 456 7890', 'info@takeda.ec', 'Dr. Hugo Benítez'),
('Amgen Ecuador', '1790012345014', 'Tulcán, Ecuador', '+593 6 567 8901', 'contacto@amgen.ec', 'Lic. Isabel Cárdenas'),
('Biogen Ecuador', '1790012345015', 'El Carmen, Ecuador', '+593 5 678 9012', 'info@biogen.ec', 'Dr. Manuel Espinoza'),
('Regeneron Ecuador', '1790012345016', 'La Concordia, Ecuador', '+593 5 789 0123', 'ventas@regeneron.ec', 'Ing. Lucía Mendoza'),
('Vertex Ecuador', '1790012345017', 'Pedernales, Ecuador', '+593 5 890 1234', 'info@vertex.ec', 'Dr. Carlos Zambrano'),
('Moderna Ecuador', '1790012345018', 'Jipijapa, Ecuador', '+593 5 901 2345', 'contacto@moderna.ec', 'Lic. Elena Vásquez'),
('BioNTech Ecuador', '1790012345019', 'Montecristi, Ecuador', '+593 5 012 3456', 'info@biontech.ec', 'Dr. Roberto Zambrano'),
('CureVac Ecuador', '1790012345020', 'Pedernales, Ecuador', '+593 5 123 4567', 'ventas@curevac.ec', 'Ing. María Zambrano');

-- Insertar productos Qualipharm (30 productos)
INSERT INTO productos (codigo, nombre, descripcion, precio, precio_compra, categoria_id, proveedor_id, stock_minimo, stock_maximo) VALUES
('QPH-001', 'QualiParacetamol 500mg', 'Analgésico y antipirético para el alivio del dolor y fiebre', 2.50, 1.80, 1, 1, 100, 1000),
('QPH-002', 'QualiIbuprofeno 400mg', 'Antiinflamatorio no esteroideo para dolor e inflamación', 3.20, 2.30, 2, 2, 80, 800),
('QPH-003', 'QualiAmoxicilina 500mg', 'Antibiótico de amplio espectro para infecciones bacterianas', 8.50, 6.20, 3, 3, 50, 500),
('QPH-004', 'QualiLoratadina 10mg', 'Antihistamínico para el alivio de síntomas alérgicos', 4.80, 3.50, 4, 4, 120, 1200),
('QPH-005', 'QualiVitamina C 1000mg', 'Suplemento vitamínico para fortalecer el sistema inmune', 6.90, 4.80, 5, 5, 200, 2000),
('QPH-006', 'QualiOmeprazol 20mg', 'Protector gástrico para problemas digestivos', 12.50, 9.20, 9, 6, 60, 600),
('QPH-007', 'QualiSalbutamol 100mcg', 'Broncodilatador para problemas respiratorios', 15.80, 11.50, 10, 7, 40, 400),
('QPH-008', 'QualiMetformina 500mg', 'Antidiabético oral para control de glucosa', 18.90, 13.80, 11, 8, 45, 450),
('QPH-009', 'QualiAtorvastatina 20mg', 'Estatinas para control del colesterol', 22.40, 16.50, 8, 9, 35, 350),
('QPH-010', 'QualiLosartán 50mg', 'Antihipertensivo para control de presión arterial', 19.60, 14.20, 8, 10, 55, 550),
('QPH-011', 'QualiCetirizina 10mg', 'Antihistamínico de segunda generación', 5.20, 3.80, 4, 11, 110, 1100),
('QPH-012', 'QualiDiclofenaco 50mg', 'Antiinflamatorio para dolor muscular y articular', 4.60, 3.20, 2, 12, 90, 900),
('QPH-013', 'QualiAzitromicina 500mg', 'Antibiótico macrólido para infecciones respiratorias', 25.80, 18.90, 3, 13, 30, 300),
('QPH-014', 'QualiCalcio + Vitamina D', 'Suplemento para salud ósea', 8.90, 6.40, 5, 14, 150, 1500),
('QPH-015', 'QualiMagnesio 400mg', 'Suplemento mineral para función muscular', 7.40, 5.30, 5, 15, 160, 1600),
('QPH-016', 'QualiOmega 3 1000mg', 'Ácidos grasos esenciales para salud cardiovascular', 12.80, 9.10, 5, 16, 100, 1000),
('QPH-017', 'QualiProbióticos 10B', 'Suplemento para salud digestiva', 16.50, 11.80, 5, 17, 80, 800),
('QPH-018', 'QualiMelatonina 3mg', 'Suplemento para mejorar el sueño', 9.60, 6.90, 5, 18, 120, 1200),
('QPH-019', 'QualiColágeno Hidrolizado', 'Suplemento para salud de piel y articulaciones', 18.90, 13.50, 5, 19, 70, 700),
('QPH-020', 'QualiJalea Real 1000mg', 'Suplemento natural para energía y vitalidad', 14.20, 10.10, 5, 20, 90, 900),
('QPH-021', 'QualiGinkgo Biloba 120mg', 'Suplemento para memoria y circulación', 11.80, 8.40, 5, 1, 110, 1100),
('QPH-022', 'QualiGinseng 500mg', 'Suplemento para energía y resistencia', 13.50, 9.60, 5, 2, 85, 850),
('QPH-023', 'QualiCúrcuma 500mg', 'Suplemento antiinflamatorio natural', 8.90, 6.30, 5, 3, 130, 1300),
('QPH-024', 'QualiAceite de Coco 1000mg', 'Suplemento para salud metabólica', 10.40, 7.50, 5, 4, 140, 1400),
('QPH-025', 'QualiTé Verde 500mg', 'Suplemento antioxidante natural', 6.80, 4.90, 5, 5, 180, 1800),
('QPH-026', 'QualiAloe Vera 500mg', 'Suplemento para salud digestiva', 9.20, 6.60, 5, 6, 95, 950),
('QPH-027', 'QualiMiel de Manuka', 'Miel medicinal para salud general', 22.50, 16.80, 5, 7, 50, 500),
('QPH-028', 'QualiAceite de Oliva Extra Virgen', 'Aceite saludable para cocina', 15.90, 11.20, 5, 8, 75, 750),
('QPH-029', 'QualiVinagre de Manzana', 'Vinagre natural para salud digestiva', 7.80, 5.60, 5, 9, 125, 1250),
('QPH-030', 'QualiSal Rosa del Himalaya', 'Sal mineral natural para cocina', 4.50, 3.20, 5, 10, 200, 2000);

-- Insertar lotes para los productos
INSERT INTO lotes (producto_id, numero_lote, fecha_fabricacion, fecha_vencimiento, cantidad_inicial, cantidad_disponible, precio_compra, proveedor_id) VALUES
(1, 'LOT-001-2024', '2024-01-15', '2026-01-15', 500, 500, 1.80, 1),
(2, 'LOT-002-2024', '2024-01-20', '2026-01-20', 400, 400, 2.30, 2),
(3, 'LOT-003-2024', '2024-02-01', '2025-08-01', 250, 250, 6.20, 3),
(4, 'LOT-004-2024', '2024-02-10', '2026-02-10', 600, 600, 3.50, 4),
(5, 'LOT-005-2024', '2024-02-15', '2027-02-15', 1000, 1000, 4.80, 5),
(6, 'LOT-006-2024', '2024-03-01', '2026-03-01', 300, 300, 9.20, 6),
(7, 'LOT-007-2024', '2024-03-10', '2025-09-10', 200, 200, 11.50, 7),
(8, 'LOT-008-2024', '2024-03-15', '2026-03-15', 225, 225, 13.80, 8),
(9, 'LOT-009-2024', '2024-04-01', '2026-04-01', 175, 175, 16.50, 9),
(10, 'LOT-010-2024', '2024-04-10', '2026-04-10', 275, 275, 14.20, 10),
(11, 'LOT-011-2024', '2024-04-15', '2026-04-15', 550, 550, 3.80, 11),
(12, 'LOT-012-2024', '2024-05-01', '2026-05-01', 450, 450, 3.20, 12),
(13, 'LOT-013-2024', '2024-05-10', '2025-11-10', 150, 150, 18.90, 13),
(14, 'LOT-014-2024', '2024-05-15', '2027-05-15', 750, 750, 6.40, 14),
(15, 'LOT-015-2024', '2024-06-01', '2027-06-01', 800, 800, 5.30, 15),
(16, 'LOT-016-2024', '2024-06-10', '2026-06-10', 500, 500, 9.10, 16),
(17, 'LOT-017-2024', '2024-06-15', '2026-06-15', 400, 400, 11.80, 17),
(18, 'LOT-018-2024', '2024-07-01', '2026-07-01', 600, 600, 6.90, 18),
(19, 'LOT-019-2024', '2024-07-10', '2026-07-10', 350, 350, 13.50, 19),
(20, 'LOT-020-2024', '2024-07-15', '2026-07-15', 450, 450, 10.10, 20),
(21, 'LOT-021-2024', '2024-08-01', '2026-08-01', 550, 550, 8.40, 1),
(22, 'LOT-022-2024', '2024-08-10', '2026-08-10', 425, 425, 9.60, 2),
(23, 'LOT-023-2024', '2024-08-15', '2026-08-15', 650, 650, 6.30, 3),
(24, 'LOT-024-2024', '2024-09-01', '2026-09-01', 700, 700, 7.50, 4),
(25, 'LOT-025-2024', '2024-09-10', '2026-09-10', 900, 900, 4.90, 5),
(26, 'LOT-026-2024', '2024-09-15', '2026-09-15', 475, 475, 6.60, 6),
(27, 'LOT-027-2024', '2024-10-01', '2026-10-01', 250, 250, 16.80, 7),
(28, 'LOT-028-2024', '2024-10-10', '2026-10-10', 375, 375, 11.20, 8),
(29, 'LOT-029-2024', '2024-10-15', '2026-10-15', 625, 625, 5.60, 9),
(30, 'LOT-030-2024', '2024-11-01', '2026-11-01', 1000, 1000, 3.20, 10);

-- Insertar configuración inicial de empresa
INSERT INTO empresa_config (nombre_empresa, ruc, direccion, telefono, email, moneda, zona_horaria) VALUES
('Qualipharm Laboratorio Farmacéutico', '1791234567001', 'Quito, Ecuador', '+593 2 234 5678', 'info@qualipharm.com.ec', 'USD', 'America/Guayaquil');
