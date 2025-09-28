#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Formulario Google Forms para Cuestionario Likert
Sistema LogicQP - Grupo 6 - Cel@g
"""

def generate_google_forms_instructions():
    """Generar instrucciones para crear formulario en Google Forms"""
    
    instructions = """# 📋 INSTRUCCIONES PARA CREAR FORMULARIO GOOGLE FORMS

## 🎯 PASOS PARA CREAR EL FORMULARIO:

### 1. Acceder a Google Forms
- Ir a https://forms.google.com
- Iniciar sesión con cuenta de Google
- Crear nuevo formulario en blanco

### 2. Configuración Inicial
- Título: "Cuestionario de Evaluación LogicQP - Escala Likert"
- Descripción: "Evaluación de Usabilidad, Eficiencia y Satisfacción del Usuario"
- Configurar como "Cuestionario" en la configuración
- Habilitar "Recopilar direcciones de correo electrónico"

### 3. Estructura del Formulario

#### SECCIÓN 0: DATOS DEL ENCUESTADO
- **Pregunta 1:** Nombre (opcional) - Respuesta corta
- **Pregunta 2:** Rol/Posición - Respuesta corta (requerida)
- **Pregunta 3:** Experiencia con el sistema - Respuesta corta (requerida)
- **Pregunta 4:** Frecuencia de uso - Opción múltiple (requerida)
  - Diario
  - Semanal
  - Mensual
  - Ocasional
- **Pregunta 5:** Navegador utilizado - Opción múltiple (requerida)
  - Google Chrome
  - Mozilla Firefox
  - Safari
  - Microsoft Edge
  - Otros
- **Pregunta 6:** Dispositivo - Opción múltiple (requerida)
  - Computadora de escritorio
  - Laptop
  - Tablet
  - Móvil

#### SECCIÓN 1: USABILIDAD
- **Pregunta 7:** El sistema es fácil de usar - Escala lineal (1-5)
- **Pregunta 8:** La interfaz es intuitiva y clara - Escala lineal (1-5)
- **Pregunta 9:** Es fácil navegar por el sistema - Escala lineal (1-5)
- **Pregunta 10:** Los menús son fáciles de encontrar - Escala lineal (1-5)
- **Pregunta 11:** Las funciones están bien organizadas - Escala lineal (1-5)

#### SECCIÓN 2: EFICIENCIA
- **Pregunta 12:** El sistema carga rápidamente - Escala lineal (1-5)
- **Pregunta 13:** Las páginas se abren sin demoras - Escala lineal (1-5)
- **Pregunta 14:** Las búsquedas son rápidas - Escala lineal (1-5)
- **Pregunta 15:** Los reportes se generan rápidamente - Escala lineal (1-5)
- **Pregunta 16:** El sistema responde bien a mis acciones - Escala lineal (1-5)

#### SECCIÓN 3: SATISFACCIÓN
- **Pregunta 17:** Estoy satisfecho con el sistema en general - Escala lineal (1-5)
- **Pregunta 18:** El sistema cumple con mis expectativas - Escala lineal (1-5)
- **Pregunta 19:** Recomendaría el sistema a otros - Escala lineal (1-5)
- **Pregunta 20:** El sistema mejora mi experiencia de trabajo - Escala lineal (1-5)
- **Pregunta 21:** Estoy contento con la calidad del sistema - Escala lineal (1-5)

### 4. Configuración de Escalas
- Usar "Escala lineal" de 1 a 5
- Etiquetas: "1 = Muy en desacuerdo" y "5 = Muy de acuerdo"
- Marcar como requeridas todas las preguntas de escala

### 5. Preguntas Adicionales
- **Pregunta 22:** ¿Qué es lo que más le gusta del sistema? - Párrafo
- **Pregunta 23:** ¿Qué es lo que menos le gusta del sistema? - Párrafo
- **Pregunta 24:** ¿Qué funcionalidades le gustaría que se agreguen? - Párrafo
- **Pregunta 25:** ¿Qué mejoras sugiere para el sistema? - Párrafo
- **Pregunta 26:** Puntuación general del sistema (1-5) - Escala lineal
- **Pregunta 27:** ¿Recomendaría el sistema? - Opción múltiple
  - Definitivamente no
  - Probablemente no
  - Neutral
  - Probablemente sí
  - Definitivamente sí

### 6. Configuración Final
- Habilitar "Ver un resumen de respuestas"
- Configurar notificaciones por email
- Establecer fecha límite si es necesario
- Personalizar mensaje de confirmación

### 7. Compartir Formulario
- Obtener enlace de compartir
- Configurar permisos de acceso
- Enviar por email o publicar en sitio web

## 📊 VENTAJAS DE GOOGLE FORMS:
- ✅ Fácil de crear y administrar
- ✅ Recopilación automática de respuestas
- ✅ Análisis básico integrado
- ✅ Exportación a Excel/Google Sheets
- ✅ Accesible desde cualquier dispositivo
- ✅ Sin necesidad de programación
- ✅ Integración con Google Workspace

## 🔧 CONFIGURACIONES RECOMENDADAS:
- **Tema:** Profesional (azul/verde)
- **Imagen de encabezado:** Logo de LogicQP
- **Configuración de respuestas:** Permitir una respuesta por persona
- **Notificaciones:** Habilitar para nuevas respuestas
- **Resumen:** Mostrar gráficos y estadísticas

## 📈 ANÁLISIS DE RESULTADOS:
1. Ir a "Respuestas" en el formulario
2. Ver resumen automático con gráficos
3. Exportar a Google Sheets para análisis avanzado
4. Calcular promedios por sección
5. Generar reportes de satisfacción

## 🎯 MÉTRICAS A CALCULAR:
- **Usabilidad:** Promedio de preguntas 7-11
- **Eficiencia:** Promedio de preguntas 12-16
- **Satisfacción:** Promedio de preguntas 17-21
- **Puntuación Total:** Promedio general
- **NPS (Net Promoter Score):** Basado en pregunta 27

## 📱 COMPARTIR EL FORMULARIO:
1. Copiar enlace de compartir
2. Enviar por email a usuarios
3. Publicar en intranet/sitio web
4. Compartir en redes sociales
5. Incluir en comunicaciones internas

## ⏰ TIEMPO ESTIMADO DE CONFIGURACIÓN:
- **Creación básica:** 30-45 minutos
- **Personalización:** 15-30 minutos
- **Pruebas:** 10-15 minutos
- **Total:** 1-1.5 horas

## 🔒 CONSIDERACIONES DE PRIVACIDAD:
- Configurar como formulario privado
- Habilitar solo para usuarios autorizados
- No recopilar información personal sensible
- Cumplir con políticas de privacidad de la empresa
- Anonimizar respuestas si es necesario

## 📋 CHECKLIST DE CREACIÓN:
- [ ] Crear formulario en Google Forms
- [ ] Configurar título y descripción
- [ ] Agregar todas las preguntas (27 total)
- [ ] Configurar escalas 1-5 para preguntas Likert
- [ ] Marcar preguntas como requeridas
- [ ] Personalizar tema y diseño
- [ ] Configurar notificaciones
- [ ] Probar formulario completo
- [ ] Obtener enlace de compartir
- [ ] Enviar a usuarios objetivo
- [ ] Monitorear respuestas
- [ ] Analizar resultados

## 🎨 PERSONALIZACIÓN VISUAL:
- **Colores:** Azul (#3498db) y Verde (#2ecc71)
- **Fuente:** Roboto o Arial
- **Imagen de encabezado:** Logo LogicQP
- **Iconos:** Usar emojis para secciones
- **Tema:** Profesional y moderno

## 📊 PLANTILLA DE ANÁLISIS:
```
USABILIDAD = (P7 + P8 + P9 + P10 + P11) / 5
EFICIENCIA = (P12 + P13 + P14 + P15 + P16) / 5
SATISFACCIÓN = (P17 + P18 + P19 + P20 + P21) / 5
TOTAL = (USABILIDAD + EFICIENCIA + SATISFACCIÓN) / 3
```

## 🚀 PRÓXIMOS PASOS:
1. Crear formulario siguiendo estas instrucciones
2. Probar con usuarios piloto
3. Ajustar preguntas según feedback
4. Lanzar versión final
5. Recopilar respuestas por 2-4 semanas
6. Analizar resultados
7. Generar reporte de satisfacción
8. Implementar mejoras sugeridas

---
**© 2025 Grupo 6 - Cel@g. Todos los derechos reservados.**
"""
    
    return instructions

def main():
    """Función principal"""
    print("🚀 Generando instrucciones para Google Forms...")
    
    instructions = generate_google_forms_instructions()
    
    # Guardar instrucciones
    with open('INSTRUCCIONES_GOOGLE_FORMS_LogicQP.md', 'w', encoding='utf-8') as f:
        f.write(instructions)
    
    print("✅ Instrucciones para Google Forms creadas: INSTRUCCIONES_GOOGLE_FORMS_LogicQP.md")
    print("📋 Incluye: 27 preguntas estructuradas")
    print("🎯 Configuración paso a paso")
    print("📊 Métricas de análisis")
    print("⏰ Tiempo estimado: 1-1.5 horas")
    print("🔧 Sin necesidad de programación")

if __name__ == "__main__":
    main()
