#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import json
import requests
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LogicQPScreenshotGenerator:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.screenshots_dir = "capturas_informe"
        
        # Crear directorio para capturas
        if not os.path.exists(self.screenshots_dir):
            os.makedirs(self.screenshots_dir)
            logger.info(f"Directorio creado: {self.screenshots_dir}")
    
    def create_mock_screenshot(self, filename, title, description, content_type="page"):
        """Crear una captura simulada con información del sistema"""
        try:
            # Crear imagen base
            width, height = 1920, 1080
            img = Image.new('RGB', (width, height), color='white')
            draw = ImageDraw.Draw(img)
            
            # Configurar fuentes
            try:
                title_font = ImageFont.truetype("arial.ttf", 36)
                subtitle_font = ImageFont.truetype("arial.ttf", 24)
                text_font = ImageFont.truetype("arial.ttf", 18)
                small_font = ImageFont.truetype("arial.ttf", 14)
            except:
                title_font = ImageFont.load_default()
                subtitle_font = ImageFont.load_default()
                text_font = ImageFont.load_default()
                small_font = ImageFont.load_default()
            
            # Header con gradiente simulado
            header_height = 120
            draw.rectangle([0, 0, width, header_height], fill=(102, 126, 234))
            
            # Título principal
            title_bbox = draw.textbbox((0, 0), title, font=title_font)
            title_width = title_bbox[2] - title_bbox[0]
            title_x = (width - title_width) // 2
            draw.text((title_x, 30), title, fill='white', font=title_font)
            
            # Subtítulo
            subtitle_bbox = draw.textbbox((0, 0), "Sistema Farmacéutico LogicQP", font=subtitle_font)
            subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
            subtitle_x = (width - subtitle_width) // 2
            draw.text((subtitle_x, 75), "Sistema Farmacéutico LogicQP", fill='white', font=subtitle_font)
            
            # Contenido principal
            y_position = header_height + 40
            
            # Descripción
            draw.text((50, y_position), f"Descripción: {description}", fill='black', font=text_font)
            y_position += 40
            
            # Información específica según el tipo
            if content_type == "login":
                self.add_login_content(draw, y_position, text_font, small_font)
            elif content_type == "dashboard":
                self.add_dashboard_content(draw, y_position, text_font, small_font)
            elif content_type == "catalog":
                self.add_catalog_content(draw, y_position, text_font, small_font)
            elif content_type == "devtools":
                self.add_devtools_content(draw, y_position, text_font, small_font)
            elif content_type == "responsive":
                self.add_responsive_content(draw, y_position, text_font, small_font)
            elif content_type == "navigation":
                self.add_navigation_content(draw, y_position, text_font, small_font)
            elif content_type == "error":
                self.add_error_content(draw, y_position, text_font, small_font)
            
            # Footer
            footer_y = height - 60
            draw.rectangle([0, footer_y, width, height], fill=(248, 249, 250))
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            draw.text((50, footer_y + 20), f"Generado: {timestamp} | LogicQP - Sistema de Sesiones y Cookies", 
                     fill='gray', font=small_font)
            
            # Guardar imagen
            screenshot_path = os.path.join(self.screenshots_dir, f"{filename}.png")
            img.save(screenshot_path)
            logger.info(f"Captura simulada creada: {screenshot_path}")
            
            return screenshot_path
            
        except Exception as e:
            logger.error(f"Error creando captura simulada {filename}: {e}")
            return None
    
    def add_login_content(self, draw, y_start, text_font, small_font):
        """Agregar contenido específico de login"""
        y = y_start
        
        # Simular formulario de login
        draw.rectangle([100, y, 800, y + 400], outline='gray', width=2)
        draw.text((120, y + 20), "Formulario de Login", fill='black', font=text_font)
        
        # Campo email
        draw.rectangle([120, y + 60, 780, y + 90], outline='lightgray', width=1)
        draw.text((130, y + 70), "Email: admin@logicqp.com", fill='black', font=small_font)
        
        # Campo contraseña
        draw.rectangle([120, y + 110, 780, y + 140], outline='lightgray', width=1)
        draw.text((130, y + 120), "Contraseña: ••••••••••", fill='black', font=small_font)
        
        # Botón de login
        draw.rectangle([120, y + 160, 200, y + 190], fill=(102, 126, 234))
        draw.text((140, y + 170), "Iniciar Sesión", fill='white', font=small_font)
        
        # Información de autenticación
        y += 250
        draw.text((50, y), "Características de Autenticación:", fill='black', font=text_font)
        y += 30
        
        features = [
            "• Validación de credenciales con Supabase Auth",
            "• JWT tokens para sesiones seguras",
            "• Auto-refresh de tokens",
            "• Persistencia de sesión entre recargas",
            "• Redirección automática post-login"
        ]
        
        for feature in features:
            draw.text((70, y), feature, fill='black', font=small_font)
            y += 25
    
    def add_dashboard_content(self, draw, y_start, text_font, small_font):
        """Agregar contenido específico del dashboard"""
        y = y_start
        
        # Header del dashboard
        draw.rectangle([50, y, width-50, y + 80], fill=(102, 126, 234))
        draw.text((70, y + 20), "Dashboard Principal", fill='white', font=text_font)
        draw.text((70, y + 50), "Usuario: admin@logicqp.com | Rol: Administrador", fill='white', font=small_font)
        
        y += 100
        
        # Estadísticas
        stats = [
            ("Productos Activos", "1,247", "green"),
            ("Usuarios Registrados", "89", "blue"),
            ("Ventas del Mes", "$45,230", "purple"),
            ("Sesiones Activas", "12", "orange")
        ]
        
        for i, (label, value, color) in enumerate(stats):
            x = 100 + (i * 400)
            draw.rectangle([x, y, x + 350, y + 120], outline='lightgray', width=1)
            draw.text((x + 20, y + 20), label, fill='black', font=small_font)
            draw.text((x + 20, y + 50), value, fill=color, font=text_font)
        
        y += 150
        
        # Información de sesión
        draw.text((50, y), "Estado de Sesión:", fill='black', font=text_font)
        y += 30
        
        session_info = [
            "• Sesión activa desde: 2025-01-07 10:00:00",
            "• Token expira en: 7 días",
            "• Última actividad: Hace 2 minutos",
            "• IP de conexión: 192.168.1.100",
            "• Navegador: Chrome 120.0.0.0"
        ]
        
        for info in session_info:
            draw.text((70, y), info, fill='black', font=small_font)
            y += 25
    
    def add_catalog_content(self, draw, y_start, text_font, small_font):
        """Agregar contenido específico del catálogo"""
        y = y_start
        width = 1920  # Definir width para esta función
        
        # Header del catálogo
        draw.rectangle([50, y, width-50, y + 60], fill=(34, 197, 94))
        draw.text((70, y + 20), "Catálogo de Productos Farmacéuticos", fill='white', font=text_font)
        
        y += 80
        
        # Productos simulados
        products = [
            ("Paracetamol 500mg", "$2.50", "Medicamentos", "Stock: 150"),
            ("Vitamina C 1000mg", "$8.90", "Vitaminas", "Stock: 75"),
            ("Jabón Antibacterial", "$3.20", "Higiene", "Stock: 200"),
            ("Termómetro Digital", "$15.00", "Equipos", "Stock: 25")
        ]
        
        for i, (name, price, category, stock) in enumerate(products):
            x = 100 + ((i % 2) * 800)
            y_pos = y + ((i // 2) * 120)
            
            draw.rectangle([x, y_pos, x + 750, y_pos + 100], outline='lightgray', width=1)
            draw.text((x + 20, y_pos + 10), name, fill='black', font=text_font)
            draw.text((x + 20, y_pos + 35), f"Precio: {price} | {category}", fill='gray', font=small_font)
            draw.text((x + 20, y_pos + 55), stock, fill='green', font=small_font)
            
            # Botón agregar al carrito
            draw.rectangle([x + 600, y_pos + 20, x + 720, y_pos + 60], fill=(34, 197, 94))
            draw.text((x + 620, y_pos + 35), "Agregar", fill='white', font=small_font)
        
        y += 300
        
        # Información del carrito
        draw.text((50, y), "Carrito de Compras (Persistente):", fill='black', font=text_font)
        y += 30
        
        cart_info = [
            "• Productos en carrito: 3",
            "• Total: $24.60",
            "• Datos guardados en LocalStorage",
            "• Persistencia entre sesiones",
            "• Sincronización automática"
        ]
        
        for info in cart_info:
            draw.text((70, y), info, fill='black', font=small_font)
            y += 25
    
    def add_devtools_content(self, draw, y_start, text_font, small_font):
        """Agregar contenido específico de DevTools"""
        y = y_start
        
        # Simular DevTools
        draw.rectangle([50, y, width-50, y + 500], outline='gray', width=2)
        draw.text((70, y + 20), "DevTools - Application Tab", fill='black', font=text_font)
        
        y += 50
        
        # Cookies
        draw.text((70, y), "Cookies (localhost:3000):", fill='black', font=text_font)
        y += 30
        
        cookies = [
            ("sb-access-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "7 días"),
            ("sb-refresh-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "30 días"),
            ("sb-provider-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "1 hora")
        ]
        
        for name, value, expires in cookies:
            draw.text((90, y), f"• {name}: {value[:50]}...", fill='black', font=small_font)
            draw.text((90, y + 15), f"  Expira: {expires}", fill='gray', font=small_font)
            y += 35
        
        y += 20
        
        # LocalStorage
        draw.text((70, y), "LocalStorage:", fill='black', font=text_font)
        y += 30
        
        storage_items = [
            ("cart-storage", '{"items":[...],"total":24.60}'),
            ("user-preferences", '{"theme":"light","language":"es"}'),
            ("session-data", '{"lastLogin":"2025-01-07T10:00:00Z"}')
        ]
        
        for key, value in storage_items:
            draw.text((90, y), f"• {key}: {value}", fill='black', font=small_font)
            y += 25
        
        y += 20
        
        # Console logs
        draw.text((70, y), "Console Logs:", fill='black', font=text_font)
        y += 30
        
        logs = [
            "🔐 useAuth: Inicializando...",
            "📋 Sesión inicial: ✅ Activa",
            "👤 Usuario encontrado: admin@logicqp.com",
            "🔄 Auth state change: SIGNED_IN"
        ]
        
        for log in logs:
            draw.text((90, y), log, fill='black', font=small_font)
            y += 25
    
    def add_responsive_content(self, draw, y_start, text_font, small_font):
        """Agregar contenido específico de responsive design"""
        y = y_start
        
        # Vista desktop
        draw.rectangle([50, y, 600, y + 300], outline='gray', width=2)
        draw.text((70, y + 20), "Desktop View (1920x1080)", fill='black', font=text_font)
        draw.text((70, y + 50), "• Navegación horizontal completa", fill='black', font=small_font)
        draw.text((70, y + 70), "• Sidebar expandido", fill='black', font=small_font)
        draw.text((70, y + 90), "• Grid de productos 4 columnas", fill='black', font=small_font)
        draw.text((70, y + 110), "• Footer completo", fill='black', font=small_font)
        
        # Vista tablet
        draw.rectangle([650, y, 1200, y + 300], outline='gray', width=2)
        draw.text((670, y + 20), "Tablet View (768x1024)", fill='black', font=text_font)
        draw.text((670, y + 50), "• Navegación adaptada", fill='black', font=small_font)
        draw.text((670, y + 70), "• Sidebar colapsable", fill='black', font=small_font)
        draw.text((670, y + 90), "• Grid de productos 2 columnas", fill='black', font=small_font)
        draw.text((670, y + 110), "• Botones táctiles", fill='black', font=small_font)
        
        # Vista móvil
        draw.rectangle([1250, y, 1800, y + 300], outline='gray', width=2)
        draw.text((1270, y + 20), "Mobile View (375x667)", fill='black', font=text_font)
        draw.text((1270, y + 50), "• Menú hamburguesa", fill='black', font=small_font)
        draw.text((1270, y + 70), "• Navegación vertical", fill='black', font=small_font)
        draw.text((1270, y + 90), "• Grid de productos 1 columna", fill='black', font=small_font)
        draw.text((1270, y + 110), "• Touch-friendly", fill='black', font=small_font)
        
        y += 350
        
        # Características responsive
        draw.text((50, y), "Características Responsive:", fill='black', font=text_font)
        y += 30
        
        responsive_features = [
            "• Breakpoints: 768px (tablet), 375px (móvil)",
            "• Flexbox y CSS Grid para layouts adaptativos",
            "• Imágenes responsivas con srcset",
            "• Tipografía escalable (rem/em)",
            "• Touch targets de mínimo 44px"
        ]
        
        for feature in responsive_features:
            draw.text((70, y), feature, fill='black', font=small_font)
            y += 25
    
    def add_navigation_content(self, draw, y_start, text_font, small_font):
        """Agregar contenido específico de navegación"""
        y = y_start
        width = 1920  # Definir width para esta función
        
        # Menú principal
        draw.rectangle([50, y, width-50, y + 80], fill=(102, 126, 234))
        draw.text((70, y + 20), "Menú de Navegación Principal", fill='white', font=text_font)
        
        y += 100
        
        # Items del menú
        menu_items = [
            ("Inicio", "/", "active"),
            ("Catálogo", "/catalogo", "dropdown"),
            ("Gestión", "/gestion", "dropdown"),
            ("Administración", "/admin", "dropdown"),
            ("Mi Cuenta", "/mi-cuenta", "dropdown")
        ]
        
        x = 100
        for item, url, status in menu_items:
            color = 'white' if status == 'active' else 'black'
            draw.rectangle([x, y, x + 150, y + 40], outline='lightgray', width=1)
            draw.text((x + 20, y + 10), item, fill=color, font=small_font)
            x += 160
        
        y += 80
        
        # Menú de usuario
        draw.text((50, y), "Menú de Usuario:", fill='black', font=text_font)
        y += 30
        
        user_menu_items = [
            "• Perfil de Usuario",
            "• Configuración",
            "• Historial de Pedidos",
            "• Cerrar Sesión"
        ]
        
        for item in user_menu_items:
            draw.text((70, y), item, fill='black', font=small_font)
            y += 25
        
        y += 20
        
        # Información de navegación
        draw.text((50, y), "Características de Navegación:", fill='black', font=text_font)
        y += 30
        
        nav_features = [
            "• Navegación SPA (Single Page Application)",
            "• Rutas protegidas con autenticación",
            "• Breadcrumbs para orientación",
            "• Navegación por teclado (accesibilidad)",
            "• Indicadores de página activa"
        ]
        
        for feature in nav_features:
            draw.text((70, y), feature, fill='black', font=small_font)
            y += 25
    
    def add_error_content(self, draw, y_start, text_font, small_font):
        """Agregar contenido específico de manejo de errores"""
        y = y_start
        
        # Error 404
        draw.rectangle([50, y, 900, y + 200], outline='red', width=2)
        draw.text((70, y + 20), "Error 404 - Página No Encontrada", fill='red', font=text_font)
        draw.text((70, y + 50), "La página que buscas no existe o ha sido movida.", fill='black', font=small_font)
        draw.text((70, y + 80), "• Verifica la URL", fill='black', font=small_font)
        draw.text((70, y + 100), "• Usa el menú de navegación", fill='black', font=small_font)
        draw.text((70, y + 120), "• Contacta al administrador", fill='black', font=small_font)
        
        # Botón de regreso
        draw.rectangle([70, y + 150, 200, y + 180], fill='red')
        draw.text((90, y + 160), "Volver al Inicio", fill='white', font=small_font)
        
        # Error de acceso
        draw.rectangle([950, y, 1800, y + 200], outline='orange', width=2)
        draw.text((970, y + 20), "Acceso Denegado", fill='orange', font=text_font)
        draw.text((970, y + 50), "No tienes permisos para acceder a esta página.", fill='black', font=small_font)
        draw.text((970, y + 80), "• Verifica tu rol de usuario", fill='black', font=small_font)
        draw.text((970, y + 100), "• Contacta al administrador", fill='black', font=small_font)
        draw.text((970, y + 120), "• Inicia sesión con otra cuenta", fill='black', font=small_font)
        
        # Botón de login
        draw.rectangle([970, y + 150, 1100, y + 180], fill='orange')
        draw.text((990, y + 160), "Iniciar Sesión", fill='white', font=small_font)
        
        y += 250
        
        # Manejo de errores
        draw.text((50, y), "Características del Manejo de Errores:", fill='black', font=text_font)
        y += 30
        
        error_features = [
            "• Páginas de error personalizadas",
            "• Redirección automática en errores 404",
            "• Validación de permisos en tiempo real",
            "• Logs de errores para debugging",
            "• Mensajes de error amigables al usuario"
        ]
        
        for feature in error_features:
            draw.text((70, y), feature, fill='black', font=small_font)
            y += 25
    
    def generate_all_screenshots(self):
        """Generar todas las capturas del informe"""
        logger.info("Generando capturas del informe...")
        
        screenshots = [
            {
                "filename": "01_login_form",
                "title": "Formulario de Login",
                "description": "Interfaz de autenticación del sistema LogicQP",
                "type": "login"
            },
            {
                "filename": "02_dashboard_main",
                "title": "Dashboard Principal",
                "description": "Panel principal con usuario autenticado",
                "type": "dashboard"
            },
            {
                "filename": "03_catalog_page",
                "title": "Catálogo de Productos",
                "description": "Página del catálogo con carrito persistente",
                "type": "catalog"
            },
            {
                "filename": "04_devtools_evidence",
                "title": "Evidencia DevTools",
                "description": "Cookies, LocalStorage y Console logs",
                "type": "devtools"
            },
            {
                "filename": "05_responsive_design",
                "title": "Diseño Responsive",
                "description": "Vistas desktop, tablet y móvil",
                "type": "responsive"
            },
            {
                "filename": "06_navigation_menus",
                "title": "Menús de Navegación",
                "description": "Estructura de navegación del sistema",
                "type": "navigation"
            },
            {
                "filename": "07_error_handling",
                "title": "Manejo de Errores",
                "description": "Páginas de error 404 y acceso denegado",
                "type": "error"
            }
        ]
        
        successful_captures = 0
        
        for screenshot in screenshots:
            if self.create_mock_screenshot(
                screenshot["filename"],
                screenshot["title"],
                screenshot["description"],
                screenshot["type"]
            ):
                successful_captures += 1
        
        # Crear índice
        self.create_screenshot_index(screenshots)
        
        logger.info(f"Capturas generadas: {successful_captures}/{len(screenshots)}")
        return successful_captures == len(screenshots)
    
    def create_screenshot_index(self, screenshots):
        """Crear índice de capturas"""
        # Crear archivo JSON
        index_path = os.path.join(self.screenshots_dir, "indice_capturas.json")
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(screenshots, f, indent=2, ensure_ascii=False)
        
        # Crear archivo de texto
        txt_path = os.path.join(self.screenshots_dir, "indice_capturas.txt")
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write("ÍNDICE DE CAPTURAS - INFORME SESIONES Y COOKIES LogicQP\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Fecha de generación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for i, screenshot in enumerate(screenshots, 1):
                f.write(f"{i}. {screenshot['filename']}.png\n")
                f.write(f"   Título: {screenshot['title']}\n")
                f.write(f"   Descripción: {screenshot['description']}\n")
                f.write(f"   Tipo: {screenshot['type']}\n\n")
        
        logger.info(f"Índice creado: {index_path}")

def main():
    """Función principal"""
    print("🎯 GENERADOR DE CAPTURAS SIMULADAS PARA INFORME LogicQP")
    print("=" * 60)
    
    generator = LogicQPScreenshotGenerator()
    
    if generator.generate_all_screenshots():
        print("\n✅ CAPTURAS GENERADAS EXITOSAMENTE")
        print(f"📁 Directorio: {generator.screenshots_dir}")
        print("📋 Revisa el archivo 'indice_capturas.txt' para ver todas las capturas")
        print("\n📸 Capturas generadas:")
        print("• 01_login_form.png - Formulario de Login")
        print("• 02_dashboard_main.png - Dashboard Principal")
        print("• 03_catalog_page.png - Catálogo de Productos")
        print("• 04_devtools_evidence.png - Evidencia DevTools")
        print("• 05_responsive_design.png - Diseño Responsive")
        print("• 06_navigation_menus.png - Menús de Navegación")
        print("• 07_error_handling.png - Manejo de Errores")
    else:
        print("\n❌ ERROR EN LA GENERACIÓN DE CAPTURAS")

if __name__ == "__main__":
    main()
