#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Cuestionario Digital Likert HTML
Sistema LogicQP - Grupo 6 - Cel@g
"""

def generate_likert_table(questions, section_name, question_prefix):
    """Generar tabla de escala Likert"""
    html = f"""
                    <h3>{section_name}</h3>
                    <table class="likert-table">
                        <thead>
                            <tr>
                                <th style="width: 50%;">Pregunta</th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                            </tr>
                        </thead>
                        <tbody>
    """
    
    for i, question in enumerate(questions, 1):
        question_name = f"{question_prefix}_{i}"
        html += f"""
                            <tr>
                                <td class="question-text">{question}</td>
                                <td class="likert-options">
                                    <input type="radio" name="{question_name}" value="1" required>
                                </td>
                                <td class="likert-options">
                                    <input type="radio" name="{question_name}" value="2" required>
                                </td>
                                <td class="likert-options">
                                    <input type="radio" name="{question_name}" value="3" required>
                                </td>
                                <td class="likert-options">
                                    <input type="radio" name="{question_name}" value="4" required>
                                </td>
                                <td class="likert-options">
                                    <input type="radio" name="{question_name}" value="5" required>
                                </td>
                            </tr>
        """
    
    html += """
                        </tbody>
                    </table>
    """
    return html

def generate_radio_question(question, name, options):
    """Generar pregunta de opción múltiple"""
    html = f"""
                    <div class="form-group">
                        <label>{question}</label>
                        <div class="checkbox-group">
    """
    
    for i, option in enumerate(options):
        option_id = f"{name}_{i}"
        html += f"""
                            <div class="checkbox-item">
                                <input type="radio" id="{option_id}" name="{name}" value="{option.lower().replace(' ', '_')}" required>
                                <label for="{option_id}">{option}</label>
                            </div>
        """
    
    html += """
                        </div>
                    </div>
    """
    return html

def generate_text_area(question, name, required=True):
    """Generar área de texto"""
    required_attr = "required" if required else ""
    html = f"""
                    <div class="form-group">
                        <label for="{name}">{question}</label>
                        <textarea id="{name}" name="{name}" class="text-area" {required_attr}></textarea>
                    </div>
    """
    return html

def main():
    """Función principal"""
    print("🚀 Generando Cuestionario Digital Likert HTML...")
    
    # Definir todas las preguntas por sección
    preguntas = {
        'facilidad': [
            'El sistema es fácil de usar',
            'La interfaz es intuitiva y clara',
            'Es fácil navegar por el sistema',
            'Los menús son fáciles de encontrar',
            'Las funciones están bien organizadas'
        ],
        'diseno': [
            'El diseño visual es atractivo',
            'Los colores son apropiados',
            'Los textos son legibles',
            'Los botones son fáciles de identificar',
            'El diseño es consistente en todas las páginas'
        ],
        'navegacion': [
            'Es fácil encontrar lo que busco',
            'La estructura del menú es lógica',
            'Es fácil regresar a páginas anteriores',
            'Los enlaces funcionan correctamente',
            'El sistema tiene un buen flujo de trabajo'
        ],
        'velocidad': [
            'El sistema carga rápidamente',
            'Las páginas se abren sin demoras',
            'Las búsquedas son rápidas',
            'Los reportes se generan rápidamente',
            'El sistema responde bien a mis acciones'
        ],
        'productividad': [
            'Puedo completar mis tareas rápidamente',
            'El sistema me ayuda a ser más productivo',
            'Puedo realizar múltiples tareas simultáneamente',
            'El sistema me ahorra tiempo',
            'Puedo trabajar de manera eficiente'
        ],
        'funcionalidades': [
            'La búsqueda de productos es eficiente',
            'El proceso de compra es rápido',
            'La gestión de inventario es eficaz',
            'Los reportes son útiles y completos',
            'Las notificaciones son oportunas'
        ],
        'satisfaccion': [
            'Estoy satisfecho con el sistema en general',
            'El sistema cumple con mis expectativas',
            'Recomendaría el sistema a otros',
            'El sistema mejora mi experiencia de trabajo',
            'Estoy contento con la calidad del sistema'
        ],
        'experiencia': [
            'El sistema es agradable de usar',
            'Me siento cómodo usando el sistema',
            'El sistema me da confianza',
            'Me siento apoyado por el sistema',
            'El sistema es confiable'
        ],
        'valor': [
            'El sistema aporta valor a mi trabajo',
            'Las funcionalidades son útiles',
            'El sistema resuelve mis necesidades',
            'El sistema es indispensable para mi trabajo',
            'El sistema supera a otros sistemas similares'
        ],
        'productos': [
            'Es fácil buscar productos',
            'Los filtros funcionan bien',
            'La información de productos es clara',
            'Es fácil agregar productos al carrito',
            'La gestión de categorías es eficiente'
        ],
        'compra': [
            'El carrito de compras es fácil de usar',
            'El proceso de checkout es claro',
            'Los formularios son fáciles de llenar',
            'Las opciones de pago son claras',
            'Las confirmaciones son útiles'
        ],
        'inventario': [
            'Es fácil crear nuevos productos',
            'La actualización de stock es sencilla',
            'Las alertas de reposición son útiles',
            'Los reportes de inventario son completos',
            'La trazabilidad de lotes es efectiva'
        ],
        'reportes': [
            'Es fácil generar reportes',
            'Los filtros de reportes son útiles',
            'La exportación de datos funciona bien',
            'Los gráficos son claros y útiles',
            'La información de auditoría es completa'
        ],
        'seguridad': [
            'Me siento seguro usando el sistema',
            'El sistema protege mi información',
            'Los controles de acceso son adecuados',
            'El sistema es seguro para transacciones',
            'Confío en la seguridad del sistema'
        ],
        'confiabilidad': [
            'El sistema funciona de manera consistente',
            'Rara vez experimento errores',
            'El sistema está disponible cuando lo necesito',
            'Los datos se guardan correctamente',
            'El sistema es estable y confiable'
        ],
        'responsivo': [
            'El sistema funciona bien en mi dispositivo',
            'La interfaz se adapta bien a diferentes tamaños',
            'Es fácil usar el sistema en móvil',
            'Los elementos son fáciles de tocar',
            'El sistema es accesible desde cualquier lugar'
        ],
        'accesibilidad': [
            'El sistema es fácil de usar para personas con discapacidades',
            'Los textos tienen buen contraste',
            'El sistema es compatible con lectores de pantalla',
            'Los elementos son fáciles de identificar',
            'El sistema es inclusivo'
        ],
        'problemas': [
            'He experimentado errores en el sistema',
            'El sistema a veces es lento',
            'Algunas funciones no funcionan como esperaba',
            'He tenido problemas de conectividad',
            'El sistema a veces se cuelga'
        ],
        'mejoras': [
            'Necesito más funcionalidades',
            'El sistema necesita mejoras en la interfaz',
            'Necesito mejor rendimiento',
            'El sistema necesita mejor documentación',
            'Necesito mejor soporte técnico'
        ],
        'impacto': [
            'El sistema me ayuda a ser más productivo',
            'El sistema mejora la calidad de mi trabajo',
            'El sistema me ahorra tiempo',
            'El sistema reduce errores en mi trabajo',
            'El sistema mejora la comunicación'
        ],
        'objetivos': [
            'El sistema cumple con los objetivos del negocio',
            'El sistema es rentable para la organización',
            'El sistema mejora la satisfacción del cliente',
            'El sistema reduce costos operativos',
            'El sistema mejora la competitividad'
        ]
    }
    
    # Generar HTML completo
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuestionario de Evaluación LogicQP - Escala Likert</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        
        .header p {{
            font-size: 1.2em;
            opacity: 0.9;
        }}
        
        .form-container {{
            padding: 40px;
        }}
        
        .section {{
            margin-bottom: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #3498db;
        }}
        
        .section h2 {{
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.8em;
        }}
        
        .section h3 {{
            color: #34495e;
            margin: 25px 0 15px 0;
            font-size: 1.4em;
        }}
        
        .likert-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .likert-table th {{
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
        }}
        
        .likert-table td {{
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
            vertical-align: middle;
        }}
        
        .likert-table tr:nth-child(even) {{
            background: #f8f9fa;
        }}
        
        .question-text {{
            font-weight: 500;
            color: #2c3e50;
        }}
        
        .likert-options {{
            text-align: center;
        }}
        
        .likert-options input[type="radio"] {{
            transform: scale(1.5);
            margin: 0 8px;
            cursor: pointer;
        }}
        
        .likert-options label {{
            display: inline-block;
            margin: 0 5px;
            cursor: pointer;
            font-size: 0.9em;
            color: #7f8c8d;
        }}
        
        .form-group {{
            margin-bottom: 20px;
        }}
        
        .form-group label {{
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
        }}
        
        .form-group input, .form-group select, .form-group textarea {{
            width: 100%;
            padding: 12px;
            border: 2px solid #ecf0f1;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }}
        
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {{
            outline: none;
            border-color: #3498db;
        }}
        
        .checkbox-group {{
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 10px;
        }}
        
        .checkbox-item {{
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        
        .checkbox-item input[type="checkbox"], .checkbox-item input[type="radio"] {{
            transform: scale(1.2);
            cursor: pointer;
        }}
        
        .text-area {{
            min-height: 100px;
            resize: vertical;
        }}
        
        .submit-btn {{
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s;
            margin: 30px auto;
            display: block;
        }}
        
        .submit-btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }}
        
        .progress-bar {{
            width: 100%;
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            margin-bottom: 30px;
            overflow: hidden;
        }}
        
        .progress-fill {{
            height: 100%;
            background: linear-gradient(90deg, #3498db, #2ecc71);
            width: 0%;
            transition: width 0.3s;
        }}
        
        .required {{
            color: #e74c3c;
        }}
        
        .instructions {{
            background: #e8f4fd;
            border: 1px solid #3498db;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }}
        
        .instructions h3 {{
            color: #2980b9;
            margin-bottom: 15px;
        }}
        
        .scale-info {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }}
        
        .scale-info h4 {{
            color: #856404;
            margin-bottom: 10px;
        }}
        
        .scale-item {{
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }}
        
        .section-counter {{
            background: #3498db;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 15px;
        }}
        
        @media (max-width: 768px) {{
            .container {{
                margin: 10px;
                border-radius: 10px;
            }}
            
            .form-container {{
                padding: 20px;
            }}
            
            .section {{
                padding: 20px;
            }}
            
            .likert-table {{
                font-size: 0.9em;
            }}
            
            .likert-table th, .likert-table td {{
                padding: 10px 5px;
            }}
            
            .checkbox-group {{
                flex-direction: column;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Cuestionario de Evaluación LogicQP</h1>
            <p>Evaluación de Usabilidad, Eficiencia y Satisfacción del Usuario</p>
        </div>
        
        <div class="form-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            
            <form id="likertForm" onsubmit="return submitForm(event)">
                <div class="instructions">
                    <h3>🎯 Instrucciones</h3>
                    <p>Este cuestionario tiene como objetivo evaluar su experiencia con el sistema LogicQP. Sus respuestas son muy importantes para mejorar el sistema.</p>
                    <ul>
                        <li>Lea cada pregunta cuidadosamente</li>
                        <li>Seleccione la opción que mejor represente su experiencia</li>
                        <li>Use la escala del 1 al 5 donde: 1 = Muy en desacuerdo/Muy malo, 5 = Muy de acuerdo/Excelente</li>
                        <li>Tiempo estimado: 15-20 minutos</li>
                    </ul>
                </div>
                
                <div class="scale-info">
                    <h4>📊 Escala de Evaluación</h4>
                    <div class="scale-item">
                        <span>1 = Muy en desacuerdo / Muy malo</span>
                        <span>(0-20%)</span>
                    </div>
                    <div class="scale-item">
                        <span>2 = En desacuerdo / Malo</span>
                        <span>(21-40%)</span>
                    </div>
                    <div class="scale-item">
                        <span>3 = Neutral / Regular</span>
                        <span>(41-60%)</span>
                    </div>
                    <div class="scale-item">
                        <span>4 = De acuerdo / Bueno</span>
                        <span>(61-80%)</span>
                    </div>
                    <div class="scale-item">
                        <span>5 = Muy de acuerdo / Excelente</span>
                        <span>(81-100%)</span>
                    </div>
                </div>
                
                <!-- Datos del Encuestado -->
                <div class="section">
                    <div class="section-counter">Sección 0</div>
                    <h2>👤 Datos del Encuestado</h2>
                    
                    <div class="form-group">
                        <label for="nombre">Nombre (opcional):</label>
                        <input type="text" id="nombre" name="nombre">
                    </div>
                    
                    <div class="form-group">
                        <label for="rol">Rol/Posición: <span class="required">*</span></label>
                        <input type="text" id="rol" name="rol" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="experiencia">Experiencia con el sistema: <span class="required">*</span></label>
                        <input type="text" id="experiencia" name="experiencia" placeholder="ej: 6 meses" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Frecuencia de uso: <span class="required">*</span></label>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="radio" id="freq_diario" name="frecuencia" value="diario" required>
                                <label for="freq_diario">Diario</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="freq_semanal" name="frecuencia" value="semanal" required>
                                <label for="freq_semanal">Semanal</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="freq_mensual" name="frecuencia" value="mensual" required>
                                <label for="freq_mensual">Mensual</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="freq_ocasional" name="frecuencia" value="ocasional" required>
                                <label for="freq_ocasional">Ocasional</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="navegador">Navegador utilizado: <span class="required">*</span></label>
                        <select id="navegador" name="navegador" required>
                            <option value="">Seleccione...</option>
                            <option value="chrome">Google Chrome</option>
                            <option value="firefox">Mozilla Firefox</option>
                            <option value="safari">Safari</option>
                            <option value="edge">Microsoft Edge</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Dispositivo: <span class="required">*</span></label>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="radio" id="dev_escritorio" name="dispositivo" value="escritorio" required>
                                <label for="dev_escritorio">Computadora de escritorio</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="dev_laptop" name="dispositivo" value="laptop" required>
                                <label for="dev_laptop">Laptop</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="dev_tablet" name="dispositivo" value="tablet" required>
                                <label for="dev_tablet">Tablet</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="dev_movil" name="dispositivo" value="movil" required>
                                <label for="dev_movil">Móvil</label>
                            </div>
                        </div>
                    </div>
                </div>
"""
    
    # Agregar todas las secciones de preguntas
    secciones = [
        ('🔍 SECCIÓN 1: USABILIDAD', [
            ('1.1 Facilidad de Uso General', 'facilidad'),
            ('1.2 Diseño de la Interfaz', 'diseno'),
            ('1.3 Navegación y Estructura', 'navegacion')
        ]),
        ('⚡ SECCIÓN 2: EFICIENCIA', [
            ('2.1 Velocidad y Rendimiento', 'velocidad'),
            ('2.2 Productividad', 'productividad'),
            ('2.3 Funcionalidades Específicas', 'funcionalidades')
        ]),
        ('😊 SECCIÓN 3: SATISFACCIÓN', [
            ('3.1 Satisfacción General', 'satisfaccion'),
            ('3.2 Experiencia de Usuario', 'experiencia'),
            ('3.3 Valor y Utilidad', 'valor')
        ]),
        ('🔧 SECCIÓN 4: FUNCIONALIDADES ESPECÍFICAS', [
            ('4.1 Gestión de Productos', 'productos'),
            ('4.2 Proceso de Compra', 'compra'),
            ('4.3 Gestión de Inventario', 'inventario'),
            ('4.4 Reportes y Auditoría', 'reportes')
        ]),
        ('🛡️ SECCIÓN 5: SEGURIDAD Y CONFIABILIDAD', [
            ('5.1 Seguridad', 'seguridad'),
            ('5.2 Confiabilidad', 'confiabilidad')
        ]),
        ('📱 SECCIÓN 6: RESPONSIVIDAD Y ACCESIBILIDAD', [
            ('6.1 Diseño Responsivo', 'responsivo'),
            ('6.2 Accesibilidad', 'accesibilidad')
        ]),
        ('🚨 SECCIÓN 7: PROBLEMAS Y MEJORAS', [
            ('7.1 Problemas Encontrados', 'problemas'),
            ('7.2 Necesidades de Mejora', 'mejoras')
        ]),
        ('🎯 SECCIÓN 8: OBJETIVOS DE NEGOCIO', [
            ('8.1 Impacto en el Trabajo', 'impacto'),
            ('8.2 Cumplimiento de Objetivos', 'objetivos')
        ])
    ]
    
    section_counter = 1
    for section_title, subsections in secciones:
        html_content += f"""
                <div class="section">
                    <div class="section-counter">Sección {section_counter}</div>
                    <h2>{section_title}</h2>
"""
        
        for subsection_title, question_key in subsections:
            html_content += generate_likert_table(preguntas[question_key], subsection_title, question_key)
        
        html_content += """
                </div>
"""
        section_counter += 1
    
    # Agregar sección de comentarios
    html_content += """
                <div class="section">
                    <div class="section-counter">Sección 9</div>
                    <h2>💬 COMENTARIOS Y SUGERENCIAS</h2>
                    
                    <h3>8.1 Comentarios Libres</h3>
"""
    
    comentarios = [
        ('¿Qué es lo que más le gusta del sistema LogicQP?', 'me_gusta'),
        ('¿Qué es lo que menos le gusta del sistema?', 'no_gusta'),
        ('¿Qué funcionalidades le gustaría que se agreguen?', 'funcionalidades_nuevas'),
        ('¿Qué mejoras sugiere para el sistema?', 'mejoras_sugeridas'),
        ('¿Alguna otra observación o comentario?', 'otras_observaciones')
    ]
    
    for pregunta, name in comentarios:
        html_content += generate_text_area(pregunta, name, required=False)
    
    # Agregar evaluación general
    html_content += """
                </div>
                
                <div class="section">
                    <div class="section-counter">Sección 10</div>
                    <h2>📊 EVALUACIÓN GENERAL</h2>
                    
                    <h3>9.1 Puntuación General</h3>
                    <div class="form-group">
                        <label>En una escala del 1 al 5, ¿cómo calificaría el sistema LogicQP en general? <span class="required">*</span></label>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="radio" id="puntuacion_1" name="puntuacion_general" value="1" required>
                                <label for="puntuacion_1">1 - Muy malo</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="puntuacion_2" name="puntuacion_general" value="2" required>
                                <label for="puntuacion_2">2 - Malo</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="puntuacion_3" name="puntuacion_general" value="3" required>
                                <label for="puntuacion_3">3 - Regular</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="puntuacion_4" name="puntuacion_general" value="4" required>
                                <label for="puntuacion_4">4 - Bueno</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="puntuacion_5" name="puntuacion_general" value="5" required>
                                <label for="puntuacion_5">5 - Excelente</label>
                            </div>
                        </div>
                    </div>
                    
                    <h3>9.2 Comparación con Otros Sistemas</h3>
                    <div class="form-group">
                        <label>¿Cómo compara LogicQP con otros sistemas similares que ha usado? <span class="required">*</span></label>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="radio" id="comparacion_1" name="comparacion" value="mucho_peor" required>
                                <label for="comparacion_1">Mucho peor</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="comparacion_2" name="comparacion" value="peor" required>
                                <label for="comparacion_2">Peor</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="comparacion_3" name="comparacion" value="similar" required>
                                <label for="comparacion_3">Similar</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="comparacion_4" name="comparacion" value="mejor" required>
                                <label for="comparacion_4">Mejor</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="comparacion_5" name="comparacion" value="mucho_mejor" required>
                                <label for="comparacion_5">Mucho mejor</label>
                            </div>
                        </div>
                    </div>
                    
                    <h3>9.3 Recomendación</h3>
                    <div class="form-group">
                        <label>¿Recomendaría LogicQP a otros usuarios? <span class="required">*</span></label>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="radio" id="recomendacion_1" name="recomendacion" value="definitivamente_no" required>
                                <label for="recomendacion_1">Definitivamente no</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="recomendacion_2" name="recomendacion" value="probablemente_no" required>
                                <label for="recomendacion_2">Probablemente no</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="recomendacion_3" name="recomendacion" value="neutral" required>
                                <label for="recomendacion_3">Neutral</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="recomendacion_4" name="recomendacion" value="probablemente_si" required>
                                <label for="recomendacion_4">Probablemente sí</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="radio" id="recomendacion_5" name="recomendacion" value="definitivamente_si" required>
                                <label for="recomendacion_5">Definitivamente sí</label>
                            </div>
                        </div>
                    </div>
                </div>
"""
    
    # Cerrar el formulario y agregar JavaScript
    html_content += """
                <!-- Botón de envío -->
                <button type="submit" class="submit-btn">📤 Enviar Encuesta</button>
            </form>
        </div>
    </div>
    
    <script>
        // Función para actualizar la barra de progreso
        function updateProgress() {
            const form = document.getElementById('likertForm');
            const inputs = form.querySelectorAll('input[type="radio"]:checked, input[type="text"], input[type="email"], select, textarea');
            const totalInputs = form.querySelectorAll('input[type="radio"], input[type="text"], input[type="email"], select, textarea').length;
            const progress = (inputs.length / totalInputs) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
        }
        
        // Agregar event listeners para actualizar el progreso
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('likertForm');
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('change', updateProgress);
                input.addEventListener('input', updateProgress);
            });
            
            updateProgress();
        });
        
        // Función para validar y enviar el formulario
        function submitForm(event) {
            event.preventDefault();
            
            // Validar que todos los campos requeridos estén completos
            const requiredInputs = document.querySelectorAll('input[required], select[required]');
            let isValid = true;
            let missingFields = [];
            
            requiredInputs.forEach(input => {
                if (!input.value && !input.checked) {
                    isValid = false;
                    input.style.borderColor = '#e74c3c';
                    missingFields.push(input.name || input.id);
                } else {
                    input.style.borderColor = '#ecf0f1';
                }
            });
            
            if (!isValid) {
                alert('Por favor, complete todos los campos requeridos marcados con *.');
                return false;
            }
            
            // Recopilar datos del formulario
            const formData = new FormData(document.getElementById('likertForm'));
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
            
            // Calcular puntuaciones por sección
            const scores = calculateScores(data);
            data.scores = scores;
            
            // Mostrar resumen de puntuaciones
            showScoreSummary(scores);
            
            // Simular envío (aquí se conectaría con el backend)
            console.log('Datos de la encuesta:', data);
            
            // Mostrar mensaje de confirmación
            alert('¡Gracias por completar la encuesta! Sus respuestas han sido enviadas correctamente.');
            
            return false;
        }
        
        // Función para calcular puntuaciones
        function calculateScores(data) {
            const scores = {
                usabilidad: 0,
                eficiencia: 0,
                satisfaccion: 0,
                total: 0
            };
            
            // Calcular usabilidad (facilidad + diseno + navegacion)
            const usabilidadKeys = ['facilidad', 'diseno', 'navegacion'];
            let usabilidadSum = 0;
            let usabilidadCount = 0;
            
            usabilidadKeys.forEach(key => {
                for (let i = 1; i <= 5; i++) {
                    const value = data[`${key}_${i}`];
                    if (value) {
                        usabilidadSum += parseInt(value);
                        usabilidadCount++;
                    }
                }
            });
            
            scores.usabilidad = usabilidadCount > 0 ? (usabilidadSum / usabilidadCount).toFixed(2) : 0;
            
            // Calcular eficiencia (velocidad + productividad + funcionalidades)
            const eficienciaKeys = ['velocidad', 'productividad', 'funcionalidades'];
            let eficienciaSum = 0;
            let eficienciaCount = 0;
            
            eficienciaKeys.forEach(key => {
                for (let i = 1; i <= 5; i++) {
                    const value = data[`${key}_${i}`];
                    if (value) {
                        eficienciaSum += parseInt(value);
                        eficienciaCount++;
                    }
                }
            });
            
            scores.eficiencia = eficienciaCount > 0 ? (eficienciaSum / eficienciaCount).toFixed(2) : 0;
            
            // Calcular satisfacción (satisfaccion + experiencia + valor)
            const satisfaccionKeys = ['satisfaccion', 'experiencia', 'valor'];
            let satisfaccionSum = 0;
            let satisfaccionCount = 0;
            
            satisfaccionKeys.forEach(key => {
                for (let i = 1; i <= 5; i++) {
                    const value = data[`${key}_${i}`];
                    if (value) {
                        satisfaccionSum += parseInt(value);
                        satisfaccionCount++;
                    }
                }
            });
            
            scores.satisfaccion = satisfaccionCount > 0 ? (satisfaccionSum / satisfaccionCount).toFixed(2) : 0;
            
            // Calcular total
            const totalSum = parseFloat(scores.usabilidad) + parseFloat(scores.eficiencia) + parseFloat(scores.satisfaccion);
            scores.total = (totalSum / 3).toFixed(2);
            
            return scores;
        }
        
        // Función para mostrar resumen de puntuaciones
        function showScoreSummary(scores) {
            const summary = `
                📊 RESUMEN DE PUNTUACIONES:
                
                🔍 Usabilidad: ${scores.usabilidad}/5
                ⚡ Eficiencia: ${scores.eficiencia}/5
                😊 Satisfacción: ${scores.satisfaccion}/5
                
                📈 Puntuación Total: ${scores.total}/5
                
                ${scores.total >= 4.5 ? '🌟 Excelente' : 
                  scores.total >= 3.5 ? '👍 Bueno' : 
                  scores.total >= 2.5 ? '👌 Regular' : 
                  scores.total >= 1.5 ? '⚠️ Malo' : '❌ Muy malo'}
            `;
            
            console.log(summary);
        }
        
        // Función para guardar respuestas localmente (opcional)
        function saveToLocalStorage() {
            const formData = new FormData(document.getElementById('likertForm'));
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            localStorage.setItem('likertSurveyData', JSON.stringify(data));
        }
        
        // Guardar automáticamente cada 30 segundos
        setInterval(saveToLocalStorage, 30000);
        
        // Cargar datos guardados al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            const savedData = localStorage.getItem('likertSurveyData');
            if (savedData) {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const element = document.querySelector(`[name="${key}"]`);
                    if (element) {
                        if (element.type === 'radio' || element.type === 'checkbox') {
                            const radio = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                            if (radio) radio.checked = true;
                        } else {
                            element.value = data[key];
                        }
                    }
                });
                updateProgress();
            }
        });
    </script>
</body>
</html>"""
    
    # Guardar archivo
    with open('CUESTIONARIO_DIGITAL_LIKERT_LogicQP.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ Cuestionario digital HTML creado exitosamente: CUESTIONARIO_DIGITAL_LIKERT_LogicQP.html")
    print("📊 Total de secciones: 10")
    print("📝 Total de preguntas Likert: 100+")
    print("⏱️ Tiempo estimado de llenado: 15-20 minutos")
    print("📱 Diseño responsivo para móviles y tablets")
    print("💾 Guardado automático cada 30 segundos")
    print("📈 Cálculo automático de puntuaciones")
    print("🎯 Validación en tiempo real")

if __name__ == "__main__":
    main()
