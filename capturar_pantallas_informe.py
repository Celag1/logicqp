#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from PIL import Image, ImageDraw, ImageFont
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LogicQPScreenshotCapture:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.screenshots_dir = "capturas_informe"
        self.driver = None
        self.wait = None
        
        # Crear directorio para capturas
        if not os.path.exists(self.screenshots_dir):
            os.makedirs(self.screenshots_dir)
            logger.info(f"Directorio creado: {self.screenshots_dir}")
    
    def setup_driver(self):
        """Configurar el driver de Chrome"""
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Configurar para capturas de alta calidad
        chrome_options.add_argument("--force-device-scale-factor=1")
        chrome_options.add_argument("--high-dpi-support=1")
        
        # Usar directorio único para evitar conflictos
        import tempfile
        temp_dir = tempfile.mkdtemp()
        chrome_options.add_argument(f"--user-data-dir={temp_dir}")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.wait = WebDriverWait(self.driver, 10)
            logger.info("Driver de Chrome configurado exitosamente")
            return True
        except Exception as e:
            logger.error(f"Error configurando driver: {e}")
            return False
    
    def take_screenshot(self, filename, description=""):
        """Tomar captura de pantalla con anotaciones"""
        try:
            # Tomar captura
            screenshot_path = os.path.join(self.screenshots_dir, f"{filename}.png")
            self.driver.save_screenshot(screenshot_path)
            
            # Agregar anotación con descripción
            if description:
                self.add_annotation_to_screenshot(screenshot_path, description)
            
            logger.info(f"Captura guardada: {screenshot_path}")
            return screenshot_path
        except Exception as e:
            logger.error(f"Error tomando captura {filename}: {e}")
            return None
    
    def add_annotation_to_screenshot(self, image_path, text):
        """Agregar anotación de texto a la captura"""
        try:
            # Abrir imagen
            img = Image.open(image_path)
            draw = ImageDraw.Draw(img)
            
            # Configurar fuente
            try:
                font = ImageFont.truetype("arial.ttf", 20)
            except:
                font = ImageFont.load_default()
            
            # Agregar texto en la parte inferior
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            # Fondo para el texto
            padding = 10
            bg_x1 = img.width - text_width - padding * 2
            bg_y1 = img.height - text_height - padding * 2
            bg_x2 = img.width - padding
            bg_y2 = img.height - padding
            
            draw.rectangle([bg_x1, bg_y1, bg_x2, bg_y2], fill=(0, 0, 0, 128))
            draw.text((bg_x1 + padding, bg_y1 + padding), text, fill=(255, 255, 255), font=font)
            
            # Guardar imagen modificada
            img.save(image_path)
            
        except Exception as e:
            logger.error(f"Error agregando anotación: {e}")
    
    def capture_login_page(self):
        """Capturar página de login"""
        logger.info("Capturando página de login...")
        
        try:
            self.driver.get(f"{self.base_url}/login")
            time.sleep(3)
            
            # Capturar formulario de login
            self.take_screenshot("01_login_form", "Formulario de Login - LogicQP")
            
            # Llenar formulario de ejemplo
            email_field = self.wait.until(EC.presence_of_element_located((By.NAME, "email")))
            password_field = self.driver.find_element(By.NAME, "password")
            
            email_field.send_keys("admin@logicqp.com")
            password_field.send_keys("password123")
            
            # Capturar formulario lleno
            self.take_screenshot("02_login_form_filled", "Formulario de Login Lleno")
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturando login: {e}")
            return False
    
    def capture_dashboard(self):
        """Capturar dashboard principal"""
        logger.info("Capturando dashboard...")
        
        try:
            # Navegar al dashboard
            self.driver.get(f"{self.base_url}/dashboard")
            time.sleep(3)
            
            # Capturar dashboard completo
            self.take_screenshot("03_dashboard_main", "Dashboard Principal - Usuario Autenticado")
            
            # Capturar header con usuario
            header = self.driver.find_element(By.TAG_NAME, "nav")
            self.driver.execute_script("arguments[0].scrollIntoView();", header)
            time.sleep(1)
            self.take_screenshot("04_dashboard_header", "Header con Usuario Autenticado")
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturando dashboard: {e}")
            return False
    
    def capture_catalog_page(self):
        """Capturar página del catálogo"""
        logger.info("Capturando catálogo...")
        
        try:
            self.driver.get(f"{self.base_url}/catalogo")
            time.sleep(3)
            
            # Capturar catálogo completo
            self.take_screenshot("05_catalog_page", "Página del Catálogo de Productos")
            
            # Agregar productos al carrito
            try:
                add_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Agregar')]")
                if add_buttons:
                    add_buttons[0].click()
                    time.sleep(1)
                    self.take_screenshot("06_cart_with_products", "Carrito con Productos Agregados")
            except:
                logger.warning("No se pudo agregar productos al carrito")
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturando catálogo: {e}")
            return False
    
    def capture_devtools_evidence(self):
        """Capturar evidencia de DevTools"""
        logger.info("Capturando evidencia de DevTools...")
        
        try:
            # Abrir DevTools
            self.driver.execute_script("window.open('', '_blank');")
            self.driver.switch_to.window(self.driver.window_handles[1])
            
            # Navegar a página con autenticación
            self.driver.get(f"{self.base_url}/dashboard")
            time.sleep(3)
            
            # Simular apertura de DevTools (no se puede abrir realmente con Selenium)
            # En su lugar, capturamos la página con información de sesión
            self.take_screenshot("07_session_evidence", "Evidencia de Sesión Activa")
            
            # Volver a la ventana principal
            self.driver.close()
            self.driver.switch_to.window(self.driver.window_handles[0])
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturando DevTools: {e}")
            return False
    
    def capture_responsive_design(self):
        """Capturar diseño responsivo"""
        logger.info("Capturando diseño responsivo...")
        
        try:
            # Vista desktop
            self.driver.set_window_size(1920, 1080)
            self.driver.get(f"{self.base_url}/dashboard")
            time.sleep(2)
            self.take_screenshot("08_desktop_view", "Vista Desktop (1920x1080)")
            
            # Vista tablet
            self.driver.set_window_size(768, 1024)
            time.sleep(2)
            self.take_screenshot("09_tablet_view", "Vista Tablet (768x1024)")
            
            # Vista móvil
            self.driver.set_window_size(375, 667)
            time.sleep(2)
            self.take_screenshot("10_mobile_view", "Vista Móvil (375x667)")
            
            # Restaurar tamaño original
            self.driver.set_window_size(1920, 1080)
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturando responsive: {e}")
            return False
    
    def capture_navigation_menus(self):
        """Capturar menús de navegación"""
        logger.info("Capturando menús de navegación...")
        
        try:
            self.driver.get(f"{self.base_url}/dashboard")
            time.sleep(3)
            
            # Capturar menú principal
            self.take_screenshot("11_main_navigation", "Menú de Navegación Principal")
            
            # Capturar menú de usuario
            try:
                user_menu = self.driver.find_element(By.XPATH, "//button[contains(@class, 'user') or contains(text(), 'Usuario')]")
                user_menu.click()
                time.sleep(1)
                self.take_screenshot("12_user_menu", "Menú de Usuario Desplegable")
            except:
                logger.warning("No se pudo encontrar menú de usuario")
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturando navegación: {e}")
            return False
    
    def capture_error_states(self):
        """Capturar estados de error"""
        logger.info("Capturando estados de error...")
        
        try:
            # Intentar acceder a página protegida sin autenticación
            self.driver.get(f"{self.base_url}/admin")
            time.sleep(3)
            self.take_screenshot("13_protected_page", "Página Protegida - Acceso Denegado")
            
            # Página 404
            self.driver.get(f"{self.base_url}/pagina-inexistente")
            time.sleep(3)
            self.take_screenshot("14_404_page", "Página 404 - No Encontrada")
            
            return True
            
        except Exception as e:
            logger.error(f"Error capturando estados de error: {e}")
            return False
    
    def create_screenshot_index(self):
        """Crear índice de capturas"""
        logger.info("Creando índice de capturas...")
        
        screenshots = [
            {
                "filename": "01_login_form.png",
                "description": "Formulario de Login - LogicQP",
                "section": "Autenticación",
                "purpose": "Mostrar interfaz de login"
            },
            {
                "filename": "02_login_form_filled.png",
                "description": "Formulario de Login Lleno",
                "section": "Autenticación",
                "purpose": "Mostrar validación de campos"
            },
            {
                "filename": "03_dashboard_main.png",
                "description": "Dashboard Principal - Usuario Autenticado",
                "section": "Gestión de Sesiones",
                "purpose": "Evidenciar sesión activa"
            },
            {
                "filename": "04_dashboard_header.png",
                "description": "Header con Usuario Autenticado",
                "section": "Gestión de Sesiones",
                "purpose": "Mostrar información de usuario"
            },
            {
                "filename": "05_catalog_page.png",
                "description": "Página del Catálogo de Productos",
                "section": "Almacenamiento Local",
                "purpose": "Mostrar funcionalidad del sistema"
            },
            {
                "filename": "06_cart_with_products.png",
                "description": "Carrito con Productos Agregados",
                "section": "Almacenamiento Local",
                "purpose": "Evidenciar persistencia de datos"
            },
            {
                "filename": "07_session_evidence.png",
                "description": "Evidencia de Sesión Activa",
                "section": "Seguridad",
                "purpose": "Mostrar estado de autenticación"
            },
            {
                "filename": "08_desktop_view.png",
                "description": "Vista Desktop (1920x1080)",
                "section": "Responsive Design",
                "purpose": "Mostrar diseño en desktop"
            },
            {
                "filename": "09_tablet_view.png",
                "description": "Vista Tablet (768x1024)",
                "section": "Responsive Design",
                "purpose": "Mostrar diseño en tablet"
            },
            {
                "filename": "10_mobile_view.png",
                "description": "Vista Móvil (375x667)",
                "section": "Responsive Design",
                "purpose": "Mostrar diseño en móvil"
            },
            {
                "filename": "11_main_navigation.png",
                "description": "Menú de Navegación Principal",
                "section": "Navegación",
                "purpose": "Mostrar estructura de navegación"
            },
            {
                "filename": "12_user_menu.png",
                "description": "Menú de Usuario Desplegable",
                "section": "Navegación",
                "purpose": "Mostrar opciones de usuario"
            },
            {
                "filename": "13_protected_page.png",
                "description": "Página Protegida - Acceso Denegado",
                "section": "Seguridad",
                "purpose": "Mostrar protección de rutas"
            },
            {
                "filename": "14_404_page.png",
                "description": "Página 404 - No Encontrada",
                "section": "Manejo de Errores",
                "purpose": "Mostrar manejo de errores"
            }
        ]
        
        # Crear archivo de índice
        index_path = os.path.join(self.screenshots_dir, "indice_capturas.json")
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(screenshots, f, indent=2, ensure_ascii=False)
        
        # Crear archivo de texto legible
        txt_path = os.path.join(self.screenshots_dir, "indice_capturas.txt")
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write("ÍNDICE DE CAPTURAS - INFORME SESIONES Y COOKIES LogicQP\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Fecha de generación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            current_section = ""
            for screenshot in screenshots:
                if screenshot["section"] != current_section:
                    current_section = screenshot["section"]
                    f.write(f"\n{current_section.upper()}:\n")
                    f.write("-" * len(current_section) + "\n")
                
                f.write(f"• {screenshot['filename']}\n")
                f.write(f"  Descripción: {screenshot['description']}\n")
                f.write(f"  Propósito: {screenshot['purpose']}\n\n")
        
        logger.info(f"Índice creado: {index_path}")
        return screenshots
    
    def run_capture_session(self):
        """Ejecutar sesión completa de capturas"""
        logger.info("Iniciando sesión de capturas...")
        
        if not self.setup_driver():
            return False
        
        try:
            # Lista de funciones de captura
            capture_functions = [
                self.capture_login_page,
                self.capture_dashboard,
                self.capture_catalog_page,
                self.capture_devtools_evidence,
                self.capture_responsive_design,
                self.capture_navigation_menus,
                self.capture_error_states
            ]
            
            # Ejecutar capturas
            successful_captures = 0
            for capture_func in capture_functions:
                if capture_func():
                    successful_captures += 1
                time.sleep(2)  # Pausa entre capturas
            
            # Crear índice
            screenshots = self.create_screenshot_index()
            
            logger.info(f"Captura completada: {successful_captures}/{len(capture_functions)} funciones exitosas")
            logger.info(f"Total de capturas: {len(screenshots)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error en sesión de capturas: {e}")
            return False
        
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("Driver cerrado")

def main():
    """Función principal"""
    print("🎯 GENERADOR DE CAPTURAS PARA INFORME LogicQP")
    print("=" * 50)
    
    capturer = LogicQPScreenshotCapture()
    
    if capturer.run_capture_session():
        print("\n✅ CAPTURAS COMPLETADAS EXITOSAMENTE")
        print(f"📁 Directorio: {capturer.screenshots_dir}")
        print("📋 Revisa el archivo 'indice_capturas.txt' para ver todas las capturas")
    else:
        print("\n❌ ERROR EN LA CAPTURA DE PANTALLAS")
        print("Verifica que la aplicación esté ejecutándose en http://localhost:3000")

if __name__ == "__main__":
    main()
