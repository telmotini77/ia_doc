import re
import math
from datetime import datetime

def parse_prompt(prompt):
    lowercase = prompt.lower()
    title = "Proyecto Tecnológico Integrador"
    
    # Intentar extraer algo entre comillas
    match = re.search(r'"([^"]+)"', prompt)
    if match and match.group(1):
        title = match.group(1).strip()
    else:
        # Deducir título limpiando verbos comunes
        clean = re.sub(
            r'(?i)(crea|genera|un|una|informe|sobre|documento|de|para|el |la |proyecto |sistema |auditoria |plataforma )',
            '', prompt
        ).strip()
        if len(clean) > 5 and len(clean) < 60:
            title = clean[0].upper() + clean[1:]
            
    # Extraer Institución
    institution = "Instituto de Educación Superior y Tecnológica"
    if "universidad" in lowercase or "u. " in lowercase:
        match_inst = re.search(r'(?i)(universidad\s+[\w\sÁÉÍÓÚáéíóúñ]+)', prompt)
        if match_inst:
            institution = match_inst.group(1).strip()
            
    # Extraer Autores
    authors = ["Ing. Residente / Consultor Técnico"]
    if "autor" in lowercase or "integrantes" in lowercase or "por " in lowercase:
        parts = re.split(r'(?i)(?:por|autor|integrantes|creado por)\s+', prompt)
        if len(parts) > 1:
            author_list = [a.strip() for a in re.split(r'(?:y|,)', parts[1]) if len(a.strip()) > 2]
            if author_list:
                authors = author_list[:4]
                
    # Responsable/Tutor
    advisor = "Dr. Ing. de Proyectos e Innovación"
    if "docente" in lowercase or "profesor" in lowercase or "tutor" in lowercase:
        parts = re.split(r'(?i)(?:docente|profesor|tutor)\s+', prompt)
        if len(parts) > 1:
            advisor = re.split(r'[.,\n]', parts[1])[0].strip()
            
    months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    now = datetime.now()
    date_str = f"{now.day} de {months[now.month-1]} de {now.year}"
    
    return {
        "title": title,
        "institution": institution,
        "authors": authors,
        "advisor": advisor,
        "date": date_str,
        "place": "Quito, Ecuador"
    }

def parse_prompt_oficio(prompt, type_str):
    lowercase = prompt.lower()
    now = datetime.now()
    months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    date_str = f"{now.day} de {months[now.month-1]} de {now.year}"
    
    ciudad = "Quito"
    match_city = re.search(r'(?i)(?:ciudad|en|desde)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)', prompt)
    if match_city:
        ciudad = match_city.group(1)
        
    asunto = "Solicitud de trámite oficial"
    match_asunto = re.search(r'(?i)(?:asunto|sobre|referente a|solicitud de|respecto a)\s+([^.,;\n]{5,80})', prompt)
    if match_asunto:
        asunto = match_asunto.group(1).strip()
        
    seq = str(now.microsecond % 900 + 100)
    num_solicitud = f"Oficio N.º {seq}-{'SOLIC' if type_str == 'petition' else 'RESP'}-{now.year}"
    
    referencia_previo = None
    if type_str == 'response':
        match_ref = re.search(r'(?i)(?:referencia|en respuesta a|en atenci[oó]n a|oficio n[oº\.]+[\s]*)(\d{2,4}[-\w]*)', prompt)
        ref_seq = str((now.microsecond + 50) % 900 + 100)
        referencia_previo = match_ref.group(1).strip() if match_ref else f"Oficio N.º {ref_seq}-SOLIC-{now.year}"
        
    destinatario = {
        "nombre": "Lcda. Directora del Departamento" if type_str == 'petition' else "Ciudadano Solicitante",
        "cargo": "Directora del Departamento Académico" if type_str == 'petition' else "Responsable del Trámite",
        "institucion": "Institución de Educación Superior",
        "ciudad": ciudad,
        "tratamiento": "Señor/Señora"
    }
    
    match_dest = re.search(r'(?i)(?:destinatario|dirigido a|para el[/la]*)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s.]+?)(?:,|\n|cargo)', prompt)
    if match_dest:
        destinatario["nombre"] = match_dest.group(1).strip()
        
    match_inst = re.search(r'(?i)(universidad|instituto|ministerio|gobierno|municipio|colegio|empresa)\s+[\w\sáéíóúñÁÉÍÓÚÑ]+', prompt)
    if match_inst:
        destinatario["institucion"] = match_inst.group(0).strip()
        
    remitente = {
        "nombre": "Ing. Solicitante Responsable" if type_str == 'petition' else "Coordinador Institucional",
        "cargo": "Técnico Responsable / Coordinador" if type_str == 'petition' else "Director del Departamento",
        "institucion": destinatario["institucion"],
        "cedula": "1700000000-0",
        "ciudad": ciudad
    }
    
    match_rem = re.search(r'(?i)(?:autor|firmante|remitente|de parte de|por parte de)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s.]+?)(?:,|\.|\n|$)', prompt)
    if match_rem:
        remitente["nombre"] = match_rem.group(1).strip()
        
    topic_keywords = re.sub(r'(?i)(oficio|solicitud|respuesta|generar|crear|documento|por favor)', '', prompt).strip()[:120]
    
    return {
        "ciudad": ciudad,
        "fecha": date_str,
        "lugarFecha": f"{ciudad}, {date_str}",
        "numSolicitud": num_solicitud,
        "referenciaOficioPrevio": referencia_previo,
        "asunto": asunto,
        "destinatario": destinatario,
        "remitente": remitente,
        "topicKeywords": topic_keywords
    }

def get_prompt_keyphrase(prompt):
    if not prompt:
        return "desarrollo tecnológico"
    clean = re.sub(
        r'(?i)(crea|genera|un|una|informe|sobre|documento|de|para|el |la |proyecto |sistema |auditoria |plataforma |quiero |que |hagas |diseño |implementacion )',
        '', prompt
    ).strip()
    return clean if len(clean) >= 3 else prompt.strip()

def generate_pseudo_research_sentences(keyphrase, count):
    subjects = [
        f"El desarrollo de un sistema de {keyphrase}",
        f"La implementación de soluciones para {keyphrase}",
        f"La optimización y control de {keyphrase}",
        f"El diseño de una arquitectura enfocada en {keyphrase}",
        f"El análisis sistemático de {keyphrase}",
        f"La integración de tecnologías de {keyphrase}",
        f"La automatización de procesos vinculados a {keyphrase}",
        f"El marco de trabajo establecido para {keyphrase}"
    ]
    
    verbs = [
        "permite optimizar la distribución de recursos críticos",
        "mitiga los cuellos de botella del esquema convencional",
        "garantiza un rendimiento estable bajo condiciones de alta demanda",
        "facilita el monitoreo continuo de las variables operacionales",
        "reduce significativamente el margen de error humano",
        "mejora la consistencia y seguridad del flujo lógico",
        "aporta escalabilidad a la infraestructura técnica",
        "asegura el cumplimiento de los estándares de calidad vigentes"
    ]
    
    complements = [
        "mediante la incorporación de interfaces digitales modernas y seguras",
        "a través del análisis de datos recolectados en tiempo real",
        "promoviendo una gestión eficiente del tiempo y del capital invertido",
        "bajo un esquema modular que facilita futuras ampliaciones",
        "sustentado en principios de diseño ágil y desarrollo sostenible",
        "lo cual resulta indispensable para la toma de decisiones estratégicas",
        "reduciendo costos operativos y tiempos de respuesta al mínimo",
        "con el fin de responder a los retos del entorno actual"
    ]
    
    sentences = []
    for i in range(count):
        s = subjects[i % len(subjects)]
        v = verbs[(i + 1) % len(verbs)]
        c = complements[(i + 2) % len(complements)]
        sentences.append(f"{s} {v} {c}.")
    return sentences

def compile_research_sentences(wikipedia_data, scientific_papers, prompt):
    sentences = []
    if wikipedia_data:
        for w in wikipedia_data:
            if "extract" in w:
                clean = re.sub(r'\[\d+\]', '', w["extract"]).strip()
                split = [s.strip() for s in re.split(r'[.!?]+', clean) if len(s.strip()) > 20]
                sentences.extend(split)
                
    if scientific_papers:
        for p in scientific_papers:
            if "abstract" in p:
                clean = re.sub(r'\[\d+\]', '', p["abstract"]).strip()
                split = [s.strip() for s in re.split(r'[.!?]+', clean) if len(s.strip()) > 20]
                sentences.extend(split)
                
    if len(sentences) < 15:
        keyphrase = get_prompt_keyphrase(prompt)
        pseudo = generate_pseudo_research_sentences(keyphrase, 30)
        sentences.extend(pseudo)
        
    return sentences

def generate_dynamic_academic_paragraph(section, title, base_text, paragraph_index, research_sentences):
    connectors = {
        "introduccion": [
            "Con relación a la introducción de este estudio,",
            "Para contextualizar el análisis de este tema,",
            "En el marco del planteamiento inicial,",
            "Al abordar la relevancia de esta investigación,",
            "Como punto de partida para este análisis,",
            "Asimismo, al examinar la situación actual,"
        ],
        "antecedente": [
            "Al revisar los antecedentes históricos de este campo,",
            "Con respecto a las investigaciones previas,",
            "En relación con los estudios de caso analizados,",
            "De acuerdo con los reportes previos,",
            "Analizando el desarrollo histórico del tema,",
            "Asimismo, los registros anteriores confirman que,"
        ],
        "definicionProblema": [
            "Al formular la problemática identificada,",
            "Con respecto al problema central de este estudio,",
            "En relación con las deficiencias detectadas,",
            "Al evaluar la brecha de rendimiento en este entorno,",
            "Como principal obstáculo identificado,",
            "Asimismo, la falta de controles automatizados provoca que,"
        ],
        "justificacion": [
            "La justificación teórica y práctica de esta propuesta reside en que,",
            "Es fundamental implementar esta solución puesto que,",
            "En términos de viabilidad y pertinencia,",
            "Desde una perspectiva de optimización de recursos,",
            "Al evaluar los beneficios esperados del sistema,",
            "Asimismo, la adopción de este enfoque garantiza que,"
        ],
        "marcoConceptual": [
            "Dentro del marco conceptual y teórico de este trabajo,",
            "Con base en los fundamentos científicos establecidos,",
            "En lo referente a las definiciones clave del tema,",
            "Al analizar los principios lógicos que rigen este campo,",
            "De acuerdo con las teorías de referencia,",
            "Asimismo, la conceptualización técnica precisa que,"
        ],
        "marcoMetodologico": [
            "En el diseño metodológico de la investigación,",
            "Con respecto al procedimiento secuencial establecido,",
            "En relación con las fases de validación experimental,",
            "Para garantizar el rigor y la replicabilidad de las pruebas,",
            "Al instrumentar la recolección y análisis de datos,",
            "Asimismo, la metodología aplicada contempla que,"
        ],
        "resultadosObtenidos": [
            "Al examinar los resultados cuantitativos y cualitativos obtenidos,",
            "Con respecto a los datos recopilados durante la fase piloto,",
            "En relación con las métricas observadas,",
            "Al evaluar el desempeño operativo del prototipo,",
            "Los registros de rendimiento demuestran que,",
            "Asimismo, el comportamiento del sistema refleja que,"
        ],
        "analisisResultados": [
            "Al analizar críticamente los hallazgos de este estudio,",
            "Con respecto a la discusión de los resultados obtenidos,",
            "En comparación con los métodos tradicionales o manuales,",
            "Al interpretar la significancia estadística de los datos,",
            "El análisis del retorno de inversión y eficiencia concluye que,",
            "Asimismo, la validación técnica demuestra que,"
        ]
    }
    
    keywords = [w.lower() for w in re.split(r'\s+', title) if len(w) > 3]
    keyphrase = " ".join(keywords) if keywords else "desarrollo tecnológico"
    
    sentence_pool = list(research_sentences)
    if not sentence_pool:
        sentence_pool = generate_pseudo_research_sentences(keyphrase, 30)
        
    num_sentences = 2 + (paragraph_index % 2)
    paragraph_sentences = []
    
    section_connectors = connectors.get(section, connectors["introduccion"])
    
    for i in range(num_sentences):
        sentence_index = (paragraph_index * 3 + i) % len(sentence_pool)
        sentence = sentence_pool[sentence_index].strip().rstrip(".")
        
        if sentence:
            conn_idx = (paragraph_index + i) % len(section_connectors)
            conn = section_connectors[conn_idx]
            
            first_char = sentence[0].lower()
            rest = sentence[1:]
            paragraph_sentences.append(f"{conn} {first_char}{rest}.")
            
    return " ".join(paragraph_sentences)

def expand_section_text(category, section, report_type, title, base_text, research_sentences):
    paragraphs = [base_text]
    
    # Determinar rango
    if report_type == 'universitario':
        if section == 'marcoConceptual': target = 2200
        elif section == 'marcoMetodologico': target = 1100
        elif section == 'resultadosObtenidos': target = 900
        elif section == 'analisisResultados': target = 550
        else: target = 400
    elif report_type == 'tecnico':
        if section == 'marcoConceptual': target = 2700
        elif section == 'marcoMetodologico': target = 1800
        elif section == 'resultadosObtenidos': target = 1300
        elif section == 'analisisResultados': target = 700
        else: target = 450
    elif report_type == 'ieee':
        if section == 'marcoConceptual': target = 1300
        elif section == 'marcoMetodologico': target = 1000
        elif section == 'resultadosObtenidos': target = 900
        elif section == 'analisisResultados': target = 600
        else: target = 500
    else:  # corto
        if section == 'marcoConceptual': target = 500
        elif section == 'marcoMetodologico': target = 250
        elif section == 'resultadosObtenidos': target = 250
        elif section == 'analisisResultados': target = 150
        else: target = 180
        
    current_words = len(re.split(r'\s+', " ".join(paragraphs)))
    paragraph_index = 0
    
    while current_words < target and paragraph_index < 12:
        dyn_para = generate_dynamic_academic_paragraph(section, title, base_text, paragraph_index, research_sentences)
        paragraphs.append(dyn_para)
        current_words = len(re.split(r'\s+', " ".join(paragraphs)))
        paragraph_index += 1
        
    return "\n\n".join(paragraphs)

def extract_dynamic_tools_and_steps(prompt, research_sentences):
    lowercase_prompt = prompt.lower()
    tools_pool = []
    
    # Check for specific tech tools in prompt
    tech_map = {
        "python": "Python 3",
        "javascript": "JavaScript (ES6+)",
        "typescript": "TypeScript",
        "react": "React.js Framework",
        "vue": "Vue.js",
        "node": "Node.js (Express)",
        "fastapi": "FastAPI (Python)",
        "django": "Django Rest Framework",
        "esp32": "Microcontrolador ESP32",
        "arduino": "Placa Arduino Uno/Mega",
        "raspberry": "Raspberry Pi 4",
        "postgresql": "PostgreSQL RDBMS",
        "mysql": "MySQL Database",
        "mongodb": "MongoDB (NoSQL)",
        "docker": "Contenedores Docker",
        "kubernetes": "Orquestador Kubernetes",
        "wireshark": "Analizador Wireshark",
        "nmap": "Escáner Nmap",
        "pfsense": "Firewall pfSense",
        "wazuh": "SIEM Wazuh",
        "stripe": "Pasarela de pagos Stripe",
        "paypal": "Pasarela de pagos PayPal"
    }
    
    for key, val in tech_map.items():
        if key in lowercase_prompt:
            tools_pool.append(val)
            
    # Add general tech categories if mentioned
    category_map = {
        "base de datos": "Bases de datos SQL/NoSQL",
        "db": "Bases de datos relacionales",
        "seguridad": "Sistemas de cifrado y firewalls",
        "ciberseguridad": "Herramientas de pentesting y análisis de vulnerabilidades",
        "sensor": "Sensores de telemetría IoT",
        "bomba": "Actuadores mecánicos y reles de potencia",
        "riego": "Sistemas de electrovalvulas y flujo de agua",
        "nube": "Servicios Cloud (AWS/GCP)",
        "cloud": "Servicios de Hosting en la Nube",
        "api": "APIs RESTful e integraciones web",
        "vpn": "Servidor VPN seguro (OpenVPN)"
    }
    
    for key, val in category_map.items():
        if key in lowercase_prompt and val not in tools_pool:
            tools_pool.append(val)
            
    # If not enough tools, grab from research sentences
    if len(tools_pool) < 3:
        for s in research_sentences:
            words = [w.strip().replace("[^a-z0-9]", "") for w in s.lower().split()]
            for w in words:
                if w in tech_map and tech_map[w] not in tools_pool:
                    tools_pool.append(tech_map[w])
                    
    fallback_tools = [
        "Librerías de desarrollo de software",
        "Entornos de desarrollo integrado (IDE)",
        "Bases de datos persistentes de alta disponibilidad",
        "Protocolos de comunicación en red (HTTP/MQTT)",
        "Plataformas de despliegue y Cloud Hosting"
    ]
    while len(tools_pool) < 5:
        next_fallback = next((t for t in fallback_tools if t not in tools_pool), None)
        if next_fallback:
            tools_pool.append(next_fallback)
        else:
            break
            
    herramientas = ", ".join(tools_pool)
    keyphrase = get_prompt_keyphrase(prompt)
    
    # Custom procedures based on tech
    procedimiento = [
        f"1. Levantamiento de requerimientos iniciales para el análisis de {keyphrase}."
    ]
    
    if "base de datos" in tools_pool or "Bases de datos relacionales" in tools_pool:
        procedimiento.append("2. Modelado de base de datos relacional y diseño del esquema lógico de almacenamiento.")
    else:
        procedimiento.append(f"2. Especificación técnica y diseño conceptual de la arquitectura para {keyphrase}.")
        
    if "Microcontrolador ESP32" in tools_pool or "Placa Arduino Uno/Mega" in tools_pool or "Sensores de telemetría IoT" in tools_pool:
        procedimiento.append("3. Ensamblaje físico del circuito integrado, calibración de sensores e integración de microcontroladores.")
    else:
        procedimiento.append(f"3. Codificación de módulos lógicos del sistema e integración de APIs del lado del servidor.")
        
    if "ciberseguridad" in prompt.lower() or "seguridad" in prompt.lower():
        procedimiento.append("4. Ejecución de pruebas de penetración, escaneo de puertos y validación de políticas criptográficas de seguridad.")
    else:
        procedimiento.append(f"4. Fase de pruebas unitarias y de integración de componentes en el entorno de desarrollo.")
        
    procedimiento.append(f"5. Despliegue en producción, análisis de rendimiento y corrección de bugs reportados.")
    
    return herramientas, " ".join(procedimiento)

def generate_local_content(prompt, type_str, prediction_result=None, report_type='tecnico', existing_doc=None, presentation_style='informe', scientific_papers=None, wikipedia_data=None):
    metadata = parse_prompt(prompt)
    title = metadata["title"]
    institution = metadata["institution"]
    authors = metadata["authors"]
    advisor = metadata["advisor"]
    date = metadata["date"]
    
    category = "general"
    if prediction_result and "category" in prediction_result:
        category = prediction_result["category"]
    else:
        lowercase = prompt.lower()
        if "riego" in lowercase or "cultivo" in lowercase: category = "riego"
        elif "seguridad" in lowercase or "ciber" in lowercase: category = "security"
        elif "commerce" in lowercase or "tienda" in lowercase: category = "ecommerce"
        elif "educa" in lowercase or "lms" in lowercase: category = "education"
        elif "salud" in lowercase or "médic" in lowercase: category = "health"
        elif "finanz" in lowercase or "contab" in lowercase: category = "finance"

    research_sentences = compile_research_sentences(wikipedia_data, scientific_papers, prompt)
    keyphrase = get_prompt_keyphrase(prompt)
    lowercase_prompt = prompt.lower()
    
    desc = f"el diseño, simulación e implementación detallada de un prototipo enfocado en \"{title}\", estructurado en base a fundamentos conceptuales y metodologías prácticas aplicadas."
    intro = " ".join(research_sentences[:2])
    
    justificacion = f"La justificación de esta propuesta radica en que, tal como se documenta en las fuentes de investigación, {research_sentences[2][0].lower() + research_sentences[2][1:]} Esto evidencia una necesidad crítica de optimizar este campo." if len(research_sentences) > 2 else f"La justificación de este proyecto técnico se sustenta en la necesidad de automatizar y mejorar los procesos vinculados a \"{keyphrase}\", minimizando errores y aumentando la eficiencia general."
    teoria = " ".join(research_sentences[3:8])
    
    herramientas, procedimiento = extract_dynamic_tools_and_steps(prompt, research_sentences)
    
    conclusiones = [
        f"Se logró diseñar e implementar la arquitectura propuesta para \"{title}\", alcanzando un nivel de estabilidad operativa óptimo.",
        f"Se evidenció que, en concordancia con la teoría analizada, {research_sentences[8][0].lower() + research_sentences[8][1:]}" if len(research_sentences) > 8 else f"El sistema desarrollado permitió agilizar los procesos de \"{keyphrase}\", disminuyendo los tiempos de operación estimados en un 35%.",
        "Se validó la adaptabilidad del esquema modular propuesto, sentando las bases para futuras actualizaciones e integraciones complejas."
    ]
    
    recomendaciones = [
        "Establecer un cronograma sistemático de mantenimiento preventivo y actualizaciones para resguardar la integridad de los datos.",
        "Planificar un esquema piloto controlado que permita medir el desempeño en condiciones reales y calibrar los parámetros analógicos o lógicos.",
        f"Explorar la incorporación de tecnologías complementarias (como algoritmos predictivos o cifrado robusto) para potenciar la escalabilidad y seguridad de \"{keyphrase}\"."
    ]
    
    # Dynamic budget rows based on detected features
    detected_tech = []
    # Analyze prompt for tech tags
    if any(w in lowercase_prompt for w in ["postgres", "postgresql", "mysql", "mongodb", "sqlite", "sql", "base de datos", "db"]):
        detected_tech.append("database")
    if any(w in lowercase_prompt for w in ["docker", "kubernetes", "k8s", "cicd", "devops", "contenedor"]):
        detected_tech.append("docker")
    if any(w in lowercase_prompt for w in ["seguridad", "ciberseguridad", "cifrado", "ssl", "tls", "firewall", "pfsense", "vpn", "wazuh"]):
        detected_tech.append("security")
    if any(w in lowercase_prompt for w in ["react", "vue", "angular", "nextjs", "frontend", "interfaz"]):
        detected_tech.append("frontend")
    if any(w in lowercase_prompt for w in ["node", "express", "fastapi", "django", "python", "backend", "api"]):
        detected_tech.append("backend")
    if any(w in lowercase_prompt for w in ["sensor", "iot", "esp32", "arduino", "riego", "físico", "dispositivo", "bomba", "valvula"]):
        detected_tech.append("iot")

    budget_rows = []
    if "iot" in detected_tech:
        budget_rows.append([f"Sensores de telemetría y actuadores para {keyphrase[:25]}", 5, 25.00])
        budget_rows.append(["Placa de desarrollo microcontrolador (ESP32/Arduino)", 3, 15.00])
        budget_rows.append(["Módulos relés, cableado y fuente de poder regulada", 2, 12.50])
    
    if "database" in detected_tech:
        budget_rows.append(["Instancia de Base de Datos gestionada en la nube (PostgreSQL)", 3, 30.00])
        
    if "docker" in detected_tech:
        budget_rows.append(["Servidor de contenedores administrado (Docker/AWS ECS) (Meses)", 3, 45.00])
    else:
        if "iot" not in detected_tech:
            budget_rows.append(["Servidor VPS para producción y hosting web (Meses)", 3, 30.00])
            
    if "security" in detected_tech:
        budget_rows.append(["Certificados SSL/TLS de validación extendida y Firewall perimetral", 1, 75.00])
        
    if "frontend" in detected_tech:
        budget_rows.append(["Despliegue y hosting frontend optimizado en la nube (Meses)", 3, 15.00])
        
    if "backend" in detected_tech:
        budget_rows.append(["Librerías comerciales de backend y APIs de terceros", 1, 120.00])
        
    # Standard engineer cost
    role = "Especialista en Automatización e IoT" if "iot" in detected_tech else "Desarrollador de Software Senior"
    labor_cost = 1100.00 if "security" in detected_tech else 950.00
    budget_rows.append([f"Mano de obra especializada ({role})", 1, labor_cost])
    
    # Fill up if budget is small
    if len(budget_rows) < 4:
        if "iot" in detected_tech:
            budget_rows.append(["Servicio en la nube de Broker MQTT para telemetría (Meses)", 3, 15.00])
            budget_rows.append(["Carcasa protectora impermeable IP67 para exteriores", 2, 10.00])
        else:
            budget_rows.append(["Licencias de herramientas de diseño UI/UX e IDEs", 1, 100.00])
            budget_rows.append(["Almacenamiento de archivos S3 y CDN (Meses)", 3, 15.00])

    # --- INFORMES (report, docx, pdf) ---
    if type_str in ['report', 'docx', 'pdf']:
        is_ieee = report_type == 'ieee'
        intro_text = f"RESUMEN (ABSTRACT) -- La automatización e implementación de soluciones basadas en tecnología digital representan un pilar estratégico en la ingeniería contemporánea. En este artículo científico se detalla el diseño, simulación y evaluación de el desarrollo del proyecto titulado \"{title}\". Los resultados demuestran una mejora sustancial en el rendimiento operativo, abriendo pautas para futuras optimizaciones de la arquitectura. Palabras clave: Automatización, IoT, Ciberseguridad, Redes, Eficiencia.\n\nSECCIÓN I: INTRODUCCIÓN -- El presente estudio de caso presenta de forma resumida la propuesta enfocada en {desc} Este trabajo busca abordar las problemáticas existentes mediante soluciones innovadoras, estableciendo un diagnóstico inicial claro." if is_ieee else f"El presente estudio de caso presenta de forma resumida la propuesta enfocada en {desc} Este trabajo busca abordar las problemáticas existentes mediante soluciones innovadoras, estableciendo un diagnóstico inicial claro."
        
        if scientific_papers:
            first_paper = scientific_papers[0]
            citation = "[1]" if is_ieee else f"({first_paper['authors'].split(',')[0].split(' y ')[0].strip()}, {first_paper['year']})"
            intro_text += f" Este estudio se justifica teóricamente y se alinea con hallazgos clave reportados recientemente por {first_paper['authors']} en {citation}, quienes investigaron \"{first_paper['title']}\" y demostraron la viabilidad de enfoques tecnológicos equivalentes."
            
        antecedente_text = f"A. ANTECEDENTES Y REVISIÓN HISTÓRICA -- {intro} El desarrollo tecnológico actual exige adaptación rápida, y las instituciones enfrentan constantes desafíos de integración que deben ser mitigados para mantener la eficiencia." if is_ieee else f"{intro} El desarrollo tecnológico actual exige adaptación rápida, y las instituciones enfrentan constantes desafíos de integración que deben ser mitigados para mantener la eficiencia."
        definicion_text = "B. FORMULACIÓN DEL PROBLEMA -- Se evidencia una carencia sistemática en la gestión y control de procesos clave. El problema principal radica en las prácticas manuales u obsoletas que provocan demoras sustanciales, afectando el rendimiento integral y la toma de decisiones." if is_ieee else "Se evidencia una carencia sistemática en la gestión y control de procesos clave. El problema principal radica en las prácticas manuales u obsoletas que provocan demoras sustanciales, afectando el rendimiento integral y la toma de decisiones."
        justificacion_text = f"C. MOTIVACIÓN Y JUSTIFICACIÓN -- Es pertinente implementar este estudio de caso porque {justificacion} Además, aportará un marco referencial para futuros análisis en escenarios de condiciones similares." if is_ieee else f"Es pertinente implementar este estudio de caso porque {justificacion} Además, aportará un marco referencial para futuros análisis en escenarios de condiciones similares."
        
        especificos = [
            "Analizar la problemática actual empleando herramientas metodológicas.",
            "Diseñar una estructura lógica que solvente las necesidades detectadas.",
            "Validar la eficacia de la propuesta a través de pruebas de control."
        ]
        if report_type == 'corto':
            especificos = especificos[:2]
        elif report_type in ['universitario', 'tecnico']:
            especificos.append("Evaluar la viabilidad económica y ambiental del sistema implementado.")
            
        conclusiones_list = list(conclusiones)
        recomendaciones_list = list(recomendaciones)
        
        if report_type == 'corto':
            conclusiones_list = conclusiones_list[:2]
            recomendaciones_list = recomendaciones_list[:2]
        elif report_type == 'universitario':
            conclusiones_list.append("Se demostró que la capacitación del personal incrementa la adopción tecnológica en un 95% en los primeros meses.")
            recomendaciones_list.append("Establecer revisiones de seguridad mensuales y backups distribuidos en la nube para garantizar redundancia.")
        elif report_type == 'tecnico':
            conclusiones_list.extend([
                "Se demostró que la capacitación del personal incrementa la adopción tecnológica en un 95% en los primeros meses.",
                "El análisis de consumo eléctrico del sistema validó su viabilidad técnica para alimentación por baterías solares."
            ])
            recomendaciones_list.extend([
                "Establecer revisiones de seguridad mensuales y backups distribuidos en la nube para garantizar redundancia.",
                "Migrar la API hacia arquitecturas serverless en AWS Lambda para reducir costos de infraestructura ociosa."
            ])
            
        referencias_list = [
            "Gómez, A., & Pérez, R. (2025). Monitoreo Inteligente. Revista Iberoamericana de Tecnología, 12(3), 45-56.",
            "Smith, M. (2024). Sistemas Automatizados en la Industria 4.0 (3.ª ed.). Academic Press."
        ]
        if is_ieee:
            referencias_list = [
                "[1] A. Gómez and R. Pérez, \"Monitoreo Inteligente,\" Revista Iberoamericana de Tecnología, vol. 12, no. 3, pp. 45-56, 2025.",
                "[2] M. Smith, Sistemas Automatizados en la Industria 4.0, 3rd ed. Academic Press, 2024.",
                "[3] J. Doe, \"Architecting Distributed Systems for IoT,\" IEEE Transactions on Cloud Computing, vol. 10, no. 2, pp. 120-135, 2025.",
                "[4] E. Johnson, \"Network Security and Firewalls in Corporate Infrastructures,\" IEEE Security & Privacy, vol. 23, no. 1, pp. 50-61, 2026."
            ]
        elif report_type in ['universitario', 'tecnico']:
            referencias_list.extend([
                "Johnson, E. (2026). Seguridad en Redes y Firewalls en la Nube. Editorial Universitaria.",
                "Doe, J. (2025). Arquitectura de Sistemas Distribuidos para IoT. Journal of Systems Engineering, 8(2), 112-125."
            ])
            
        if scientific_papers:
            if is_ieee:
                referencias_list = [
                    f"[{idx+1}] {p['authors'].replace(' y ', ' and ')}, \"{p['title']},\" {p['venue']}, {p['year']}. Disponible en: {p['doi']}"
                    for idx, p in enumerate(scientific_papers)
                ]
            else:
                referencias_list = [
                    f"{p['authors']} ({p['year']}). {p['title']}. {p['venue']}. Disponible en: {p['doi']}"
                    for p in scientific_papers
                ]
                
        return {
            "title": title.upper(),
            "type": "report",
            "institution": institution,
            "authors": ", ".join(authors),
            "course": "Tercero BGU",
            "advisor": advisor,
            "date": "2025 - 2026",
            "primeraParte": {
                "introduccion": expand_section_text(category, 'introduccion', report_type, title, intro_text, research_sentences),
                "antecedente": expand_section_text(category, 'antecedente', report_type, title, antecedente_text, research_sentences),
                "definicionProblema": expand_section_text(category, 'definicionProblema', report_type, title, definicion_text, research_sentences),
                "justificacion": expand_section_text(category, 'justificacion', report_type, title, justificacion_text, research_sentences),
                "objetivos": {
                    "general": f"Desarrollar y evaluar {desc}",
                    "especificos": especificos
                }
            },
            "segundaParte": {
                "marcoConceptual": expand_section_text(category, 'marcoConceptual', report_type, title, teoria, research_sentences),
                "marcoMetodologico": expand_section_text(category, 'marcoMetodologico', report_type, title, f"Se utilizarán las siguientes herramientas: {herramientas}. El procedimiento consistió en: {procedimiento}. Esta metodología asegura resultados cuantificables y reproducibles.", research_sentences),
                "resultadosObtenidos": expand_section_text(category, 'resultadosObtenidos', report_type, title, "Los resultados demuestran la viabilidad de la intervención. Durante la fase de recolección de datos, se observó que la implementación de los nuevos protocolos tuvo un efecto inmediato sobre el rendimiento. Los procesos se agilizaron y las métricas se estabilizaron.", research_sentences),
                "analisisResultados": expand_section_text(category, 'analisisResultados', report_type, title, "Examinando los resultados, resulta evidente que la nueva estrategia superó al método anterior. La optimización alcanzada respalda plenamente la viabilidad técnica y operativa de los cambios propuestos en el contexto del problema definido.", research_sentences)
            },
            "terceraParte": {
                "conclusiones": conclusiones_list,
                "recomendaciones": recomendaciones_list
            },
            "cuartaParte": {
                "referencias": referencias_list,
                "anexos": "Anexo A: Matriz de levantamiento de requerimientos.\nAnexo B: Instrumentos de validación técnica."
            }
        }

    # --- DIAPOSITIVAS (presentation, pptx) ---
    if type_str in ['presentation', 'pptx']:
        is_investigacion = presentation_style == 'investigacion'
        metric1 = f"Eficiencia de {keyphrase[:20]}"
        metric2 = "Tiempo de procesamiento/respuesta"
        metric3 = "Tasa de error/fallas"
        
        comp_table = f"Métrica | Antes (Manual) | Después (Sistema)\n----------------------------------------\n{metric1} | Baja | Alta (Optimizado)\n{metric2} | Elevado | Reducido (-45%)\n{metric3} | 15% | <1.5%"
        
        r_s_3 = research_sentences[3][:120] if len(research_sentences) > 3 else "Fundamentos teóricos del tema"
        r_s_4 = research_sentences[4][:120] if len(research_sentences) > 4 else "Análisis de variables y consistencia de datos"
        r_s_5 = research_sentences[5][:120] if len(research_sentences) > 5 else "Plataformas en la nube y persistencia de datos"
        r_s_7 = research_sentences[7][:120] if len(research_sentences) > 7 else "Eficiencia operativa mejorada notablemente."
        
        report_slides = [
            { "num": 1, "title": "Portada", "content": f"Título: {title}\nIntegrantes: {', '.join(authors)}\nInstitución: {institution}\nFecha: {date}" },
            { "num": 2, "title": "Agenda", "content": "1. Introducción\n2. Problema y Justificación\n3. Objetivos del Proyecto\n4. Marco Teórico\n5. Metodología aplicada\n6. Resultados y Evidencias\n7. Conclusiones y Recomendaciones" },
            { "num": 3, "title": "Introducción", "content": f"Contexto: {intro[:150]}...\nObjetivo de la propuesta: Implementar un modelo óptimo para automatizar y mejorar este campo." },
            { "num": 4, "title": "Problema o Justificación", "content": f"Reto actual: Operaciones manuales ineficientes y ausencia de telemetría histórica.\n\nJustificación: {justificacion[:180]}" },
            { "num": 5, "title": "Objetivos del Proyecto", "content": f"Objetivo General:\n- Desarrollar y evaluar un sistema integral para {keyphrase}\n\nObjetivos Específicos:\n- Analizar tecnologías idóneas.\n- Diseñar hardware/software modular.\n- Evaluar prototipo funcional." },
            { "num": 6, "title": "Marco Teórico - Conceptos", "content": f"Bases conceptuales:\n- {r_s_3}\n- {r_s_4}\n- Protocolos seguros e interfaces optimizadas." },
            { "num": 7, "title": "Marco Teórico - Tecnologías", "content": f"Componentes clave:\n- {r_s_5}\n- APIs y servicios de intercambio de información.\n- Cifrado y validación lógica." },
            { "num": 8, "title": "Marco Teórico - Arquitectura", "content": "Esquema del Sistema:\n[Cliente/Interfaz] <--- HTTPS/WSS ---> [Servidor / Lógica Central] <--- Protocolos ---> [Control de Datos]" },
            { "num": 9, "title": "Metodología - Enfoque", "content": "Tipo: Investigación tecnológica experimental y desarrollo aplicado.\n\nFases:\n1. Análisis preliminar de requerimientos\n2. Diseño electrónico/lógico de la arquitectura\n3. Construcción, codificación y pruebas unitarias" },
            { "num": 10, "title": "Metodología - Herramientas", "content": f"Software y Recursos utilizados:\n- {herramientas[:160]}..." },
            { "num": 11, "title": "Metodología - Procedimiento", "content": f"{procedimiento}\nOptimización constante en cada iteración del ciclo." },
            { "num": 12, "title": "Metodología - Plan de Pruebas", "content": "Plan de validación:\n- Pruebas unitarias de flujo lógico.\n- Pruebas de integración de datos y servicios.\n- Monitoreo de uso de recursos e integridad operativa." },
            { "num": 13, "title": "Resultados Obtenidos", "content": f"Métricas principales:\n- {r_s_7}\n- Registro automático de eventos históricos.\n- Estabilidad y disponibilidad del prototipo." },
            { "num": 14, "title": "Resultados - Comparativa", "content": comp_table },
            { "num": 15, "title": "Resultados - Evidencias", "content": "Evidencia visual:\n- Capturas del dashboard interactivo.\n- Logs de conexión activa con cero desconexiones en pruebas de esfuerzo.\n- Gráficas de comportamiento de variables en tiempo real." },
            { "num": 16, "title": "Conclusiones", "content": f"Logros principales:\n- {conclusiones[0]}\n- {conclusiones[1]}\n- Cumplimiento estricto de todos los objetivos propuestos." },
            { "num": 17, "title": "Recomendaciones", "content": f"Próximos Pasos:\n- {recomendaciones[0]}\n- {recomendaciones[1]}" },
            { "num": 18, "title": "Preguntas", "content": "Muchas gracias por su atención.\n\n¿Tiene alguna consulta o comentario sobre el proyecto?\n\nContacto: info@institucion.edu" }
        ]
        
        research_slides = [
            { "num": 1, "title": "Portada", "content": f"Título: {title}\nInvestigadores: {', '.join(authors)}\nInstitución: {institution}\nFecha: {date}" },
            { "num": 2, "title": "Resumen / Abstract", "content": f"Objetivo: Investigar e implementar {desc}\nMetodología: Enfoque tecnológico aplicado y experimental.\nResultados clave: Optimización del consumo y reducción drástica de tiempos operativos." },
            { "num": 3, "title": "Introducción y Contexto", "content": f"Problema: Ineficiencias operacionales debidas a la intervención manual y ausencia de telemetría histórica.\n\nContexto: {intro}" },
            { "num": 4, "title": "Hipótesis y Objetivos", "content": "Hipótesis: La introducción de un sistema automatizado basado en IoT o modelos predictivos aumentará la eficiencia global en al menos un 30%.\n\nObjetivo: Desarrollar y evaluar el prototipo modular." },
            { "num": 5, "title": "Metodología de Investigación", "content": "Enfoque: Experimental e investigación tecnológica.\nVariables:\n- Variable Independiente: Sistema tecnológico automatizado.\n- Variable Dependiente: Eficiencia, estabilidad y tasa de error." },
            { "num": 6, "title": "Muestra y Recolección de Datos", "content": f"Muestra: 100 pruebas de control e instrumentación analítica.\nHerramientas:\n- {herramientas[:160]}..." },
            { "num": 7, "title": "Análisis de Datos y Pruebas", content: "Método: Comparación estadística del rendimiento del sistema.\nFase A (Planificación) -> Concluida.\nFase B (Construcción) -> Estabilidad general verificada." },
            { "num": 8, "title": "Resultados del Estudio", "content": "Resultados empíricos:\n- Optimización en ahorro de recursos observada.\n- Disponibilidad en pruebas superior al 99.5%.\n- Margen de error en telemetría bajo el estándar." },
            { "num": 9, "title": "Discusión de Hallazgos", "content": f"Discusión:\n- Los hallazgos de {keyphrase} validan empíricamente la hipótesis propuesta.\n- Los tiempos de operación muestran una mejora estadísticamente relevante.\n- Retos futuros: Escalabilidad del backend." },
            { "num": 10, "title": "Conclusiones de Investigación", "content": "Conclusiones:\n1. La propuesta técnica es 100% viable.\n2. La hipótesis de eficiencia de recursos fue superada.\n3. Se recomienda la adopción del esquema para producción." },
            { "num": 11, "title": "Referencias Científicas", "content": f"Bibliografía de soporte:\n- Gomez & Perez (2025). Monitoreo Inteligente.\n- Smith (2024). Sistemas Automatizados, Academic Press.\n- Artículos científicos sobre {keyphrase} encontrados en la investigación de internet." },
            { "num": 12, "title": "Agradecimientos y Preguntas", "content": "Agradecemos al departamento de investigación por facilitar el acceso a la infraestructura.\n\n¿Tiene alguna pregunta o sugerencia sobre nuestro estudio?\n\nContacto: info@institucion.edu" }
        ]
        
        return {
            "title": title,
            "type": "presentation",
            "members": ", ".join(authors),
            "institution": institution,
            "date": date,
            "slides": research_slides if is_investigacion else report_slides
        }

    # --- HOJAS DE CÁLCULO (spreadsheet, xlsx) ---
    if type_str in ['spreadsheet', 'xlsx']:
        is_economy = any(w in lowercase_prompt for w in ["economia", "ecuador", "pib", "macroecon"])
        
        if is_economy:
            pais = "Ecuador"
            pais_match = re.search(r'(?i)(?:economia|pib|inflacion|desempleo)\s+de\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)', prompt)
            if pais_match:
                pais = pais_match.group(1)
                
            annual_rows = []
            start_year = now.year - 10
            for i in range(10):
                year = start_year + i
                pib_val = round(1.5 + math.sin(i) * 2.0, 1)
                inf_val = round(2.0 + math.cos(i) * 1.5, 1)
                des_val = round(4.0 + math.sin(i * 1.5) * 1.0, 1)
                annual_rows.append([year, pib_val, inf_val, des_val])
                
            first_half = annual_rows[:5]
            second_half = annual_rows[5:10]
            
            def get_avg(arr, idx):
                return round(sum(r[idx] for r in arr) / len(arr), 2)
                
            quinquenal_rows = [
                [f"{annual_rows[0][0]}-{annual_rows[4][0]}", get_avg(first_half, 1), get_avg(first_half, 2), get_avg(first_half, 3)],
                [f"{annual_rows[5][0]}-{annual_rows[9][0]}", get_avg(second_half, 1), get_avg(second_half, 2), get_avg(second_half, 3)]
            ]
            
            decada_rows = [
                [f"{annual_rows[0][0]}-{annual_rows[9][0]}", get_avg(annual_rows, 1), get_avg(annual_rows, 2), get_avg(annual_rows, 3)]
            ]
            
            economy_graph_rows = [
                ["PIB Promedio", 2.0, get_avg(annual_rows, 1)],
                ["Inflación Promedio", 2.5, get_avg(annual_rows, 2)],
                ["Desempleo Promedio", 5.0, get_avg(annual_rows, 3)]
            ]
            
            return {
                "title": f"Análisis Macroeconómico de {pais} ({annual_rows[0][0]}-{annual_rows[9][0]})",
                "type": "spreadsheet",
                "members": ", ".join(authors),
                "date": date,
                "hoja1": {
                    "titulo": "PORTADA",
                    "proyecto": f"Análisis Macroeconómico de {pais} ({annual_rows[0][0]}-{annual_rows[9][0]})",
                    "integrantes": authors,
                    "fecha": date,
                    "institucion": institution
                },
                "hoja2": {
                    "titulo": "Anual",
                    "headers": ["Año", "Crecimiento PIB (%)", "Inflación (%)", "Desempleo (%)"],
                    "rows": annual_rows
                },
                "hoja3": {
                    "titulo": "Quinquenal",
                    "headers": ["Periodo", "Crecimiento PIB (Promedio %)", "Inflación (Promedio %)", "Desempleo (Promedio %)"],
                    "rows": quinquenal_rows
                },
                "hoja4": {
                    "titulo": "Decada",
                    "headers": ["Periodo", "Crecimiento PIB (Promedio %)", "Inflación (Promedio %)", "Desempleo (Promedio %)"],
                    "rows": decada_rows
                },
                "hoja5": {
                    "titulo": "Datos Gráficos",
                    "headers": ["Categoría", "Variable A (Meta)", "Variable B (Real)"],
                    "rows": economy_graph_rows
                }
            }
            
        total_val = 0.0
        xlsx_rows = []
        for r in budget_rows:
            row_total = r[1] * r[2]
            total_val += row_total
            xlsx_rows.append([r[0], r[1], r[2], row_total])
            
        crono_rows = [
            [f"Investigación y análisis preliminar sobre {keyphrase[:30]}", "2026-06-01", "2026-06-07", authors[0], "Completado"]
        ]
        if "iot" in detected_tech:
            crono_rows.extend([
                ["Diseño electrónico y simulación de circuitos en Proteus/EasyEDA", "2026-06-08", "2026-06-15", authors[0], "Completado"],
                ["Adquisición de componentes e integración de sensores con microcontroladores", "2026-06-16", "2026-06-30", authors[0], "En Progreso"],
                ["Programación de lógica de control de actuadores y calibración", "2026-07-01", "2026-07-10", authors[0], "Pendiente"]
            ])
        else:
            crono_rows.extend([
                [f"Diseño conceptual de la arquitectura de {keyphrase[:30]}", "2026-06-08", "2026-06-15", authors[0], "Completado"],
                ["Configuración del entorno de desarrollo y estructura del backend", "2026-06-16", "2026-06-30", authors[0], "En Progreso"]
            ])
            
        if "database" in detected_tech:
            crono_rows.append(["Diseño del modelo entidad-relación y esquema de base de datos", "2026-07-01", "2026-07-10", authors[0], "Pendiente"])
            
        if "frontend" in detected_tech:
            crono_rows.append(["Desarrollo de panel visual e interfaces interactivas con React", "2026-07-11", "2026-07-20", authors[0], "Pendiente"])
            
        crono_rows.extend([
            ["Pruebas de conectividad, esfuerzo e integración de servicios", "2026-07-21", "2026-08-05", authors[0], "Pendiente"],
            ["Elaboración de la documentación final y manuales de operación", "2026-08-06", "2026-08-15", authors[0], "Pendiente"]
        ])
        
        result_rows = [
            [f"Tiempo de respuesta de {keyphrase}", "1.2 segundos", "Reducción significativa del tiempo de ejecución"],
            [f"Disponibilidad operacional de {keyphrase}", "99.8%", "Medido de forma continua durante la fase piloto"],
            ["Tasa de error en transacciones/lecturas", "0.4%", "Por debajo del límite máximo aceptable de 1%"],
            ["Eficiencia en uso de recursos", "35.0%", "Optimización lograda gracias al nuevo diseño modular"]
        ]
        
        kpi_rows = [
            [f"Eficiencia operacional de {keyphrase}", "30.0%", "35.0%", 116.7],
            ["Disponibilidad de plataforma", "99.0%", "99.8%", 100.8],
            ["Precisión de procesamiento", "95.0%", "98.5%", 103.7]
        ]
        
        graph_rows = [
            [f"Fase 1 - Requerimientos de {keyphrase}", 100, 100],
            ["Fase 2 - Diseño de Arquitectura", 90, 95],
            ["Fase 3 - Desarrollo y Codificación", 85, 88],
            ["Fase 4 - Pruebas e Integración", 80, 83]
        ]
        
        evidence_rows = [
            ["2026-06-03", f"Reunión de inicio de {keyphrase}", "Acta de inicio y repositorio GitHub"],
            ["2026-06-12", "Diseño conceptual de la arquitectura", "Diagrama conceptual y especificaciones aprobadas"],
            ["2026-06-25", "Construcción preliminar del prototipo", "Código base e interfaz inicial"],
            ["2026-07-05", "Pruebas de conectividad e integración", "Logs de conexión y transacciones exitosas"],
            ["2026-07-15", "Validación final y pruebas de usuario", "Informe de aceptación y demostración en vivo"]
        ]
        
        return {
            "title": title,
            "type": "spreadsheet",
            "members": ", ".join(authors),
            "date": date,
            "hoja1": {
                "titulo": "PORTADA",
                "proyecto": title,
                "integrantes": authors,
                "fecha": date,
                "institucion": institution
            },
            "hoja2": {
                "titulo": "Cronograma",
                "headers": ["Actividad", "Inicio", "Fin", "Responsable", "Estado"],
                "rows": crono_rows
            },
            "hoja3": {
                "titulo": "Presupuesto",
                "headers": ["Recurso", "Cantidad", "Costo Unitario ($)", "Total ($)"],
                "rows": xlsx_rows,
                "formulas": {
                    "labelCell": f"C{len(xlsx_rows) + 2}",
                    "label": "Total General",
                    "totalCell": f"D{len(xlsx_rows) + 2}",
                    "value": float(total_val)
                }
            },
            "hoja4": {
                "titulo": "Resultados",
                "headers": ["Variable", "Valor", "Observaciones"],
                "rows": result_rows
            },
            "hoja5": {
                "titulo": "Estadísticas",
                "headers": ["Indicador / KPI", "Valor Objetivo", "Valor Logrado", "Cumplimiento (%)"],
                "rows": kpi_rows
            },
            "hoja6": {
                "titulo": "Gráficos",
                "headers": ["Categoría", "Variable A (Meta)", "Variable B (Real)"],
                "rows": graph_rows
            },
            "hoja7": {
                "titulo": "Registro de Evidencias",
                "headers": ["Fecha", "Actividad", "Evidencia"],
                "rows": evidence_rows
            }
        }

    # --- OFICIO DE SOLICITUD (petition) ---
    if type_str == 'petition':
        oficio = parse_prompt_oficio(prompt, 'petition')
        topic_sentence = f"relacionada con \"{oficio['topicKeywords'][0].upper() + oficio['topicKeywords'][1:]}\"" if len(oficio['topicKeywords']) > 10 else f"sobre el proyecto titulado \"{title}\""
        
        return {
            "title": title,
            "type": "petition",
            "encabezado": {
                "logoText": f"{oficio['destinatario']['institucion'].upper()} — DEPARTAMENTO DE GESTIÓN INSTITUCIONAL",
                "oficioNum": oficio["numSolicitud"],
                "lugarFecha": oficio["lugarFecha"]
            },
            "destinatario": {
                "tratamiento": "Señor/Señora",
                "nombre": oficio["destinatario"]["nombre"],
                "cargo": oficio["destinatario"]["cargo"],
                "institucion": oficio["destinatario"]["institucion"],
                "ciudad": oficio["destinatario"]["ciudad"]
            },
            "asunto": oficio["asunto"] if len(oficio["asunto"]) > 10 else f"Solicitud de trámite institucional {topic_sentence}",
            "saludo": f"Estimado/a {oficio['destinatario']['tratamiento']} {oficio['destinatario']['nombre']}:",
            "cuerpoContexto": f"Quien suscribe, {oficio['remitente']['nombre']}, en calidad de {oficio['remitente']['cargo']}, me dirijo a usted de la manera más respetuosa con la finalidad de exponer lo siguiente:",
            "cuerpoAntecedentes": f"En el marco de las actividades institucionales y en atención a la normativa vigente que rige los procedimientos administrativos internos de {oficio['destinatario']['institucion']}, y habiendo cumplido con los requisitos previos establecidos para este tipo de gestión, se procede a elevar formalmente la presente solicitud a su autoridad.",
            "cuerpoDesarrollo": f"El motivo que origina esta comunicación es {topic_sentence}. La presente petición se sustenta en la necesidad de dar cumplimiento a los objetivos institucionales y garantizar la continuidad de los procesos que se encuentran bajo la responsabilidad de este despacho. Se adjuntan todos los documentos habilitantes que respaldan el presente requerimiento para su revisión y visto bueno.",
            "peticion": [
                "La recepción y análisis formal del presente expediente por parte del departamento correspondiente.",
                "La emisión de la resolución o autorización pertinente en el plazo establecido por la normativa interna.",
                "La asignación de los recursos logísticos y técnicos necesarios para la ejecución del proceso solicitado.",
                "Se notifique el resultado de la gestión a la dirección de correo institucional del solicitante."
            ],
            "despedida": "Agradezco de antemano la atención dispensada a la presente solicitud y quedo en espera de una respuesta favorable. Sin otro particular, me suscribo de usted con sentimientos de alta consideración y estima.",
            "firma": {
                "nombre": oficio["remitente"]["nombre"],
                "cargo": oficio["remitente"]["cargo"],
                "cedula": oficio["remitente"]["cedula"],
                "institucion": oficio["remitente"]["institucion"],
                "ciudad": oficio["remitente"]["ciudad"]
            },
            "copias": [
                "Archivo institucional",
                "Dirección de Planificación"
            ],
            "anexos": [
                "Copia del documento de identidad del solicitante",
                "Formulario de solicitud debidamente llenado y firmado",
                "Documentos habilitantes y respaldo técnico"
            ]
        }

    # --- OFICIO DE RESPUESTA (response) ---
    if type_str == 'response':
        oficio = parse_prompt_oficio(prompt, 'response')
        topic_sentence = f"\"{oficio['topicKeywords'][0].upper() + oficio['topicKeywords'][1:]}\"" if len(oficio['topicKeywords']) > 10 else f"\"{title}\""
        
        return {
            "title": title,
            "type": "response",
            "encabezado": {
                "logoText": f"{oficio['remitente']['institucion'].upper()} — DIRECCIÓN GENERAL",
                "oficioNum": oficio["numSolicitud"],
                "lugarFecha": oficio["lugarFecha"]
            },
            "destinatario": {
                "tratamiento": "Señor/Señora",
                "nombre": oficio["destinatario"]["nombre"],
                "cargo": oficio["destinatario"]["cargo"],
                "institucion": oficio["destinatario"]["institucion"],
                "ciudad": oficio["destinatario"]["ciudad"]
            },
            "referenciaOficioPrevio": oficio["referenciaOficioPrevio"],
            "asunto": oficio["asunto"] if len(oficio["asunto"]) > 10 else f"Respuesta a comunicación oficial referente a {topic_sentence}",
            "saludo": f"Estimado/a {oficio['destinatario']['nombre']}:",
            "cuerpoContexto": f"En respuesta a su atenta comunicación con referencia {oficio['referenciaOficioPrevio']}, mediante la cual eleva una solicitud formal a este despacho, me permito comunicarle la resolución adoptada por esta dirección general:",
            "cuerpoAntecedentes": f"Que la dirección técnica evaluó detenidamente la viabilidad del trámite solicitado concerniente al proyecto {topic_sentence}. Que de acuerdo con el informe presupuestario y de recursos habilitantes, se constató que la petición cuenta con el sustento documental e institucional correspondiente.",
            "cuerpoDesarrollo": "En consecuencia, y fundamentado en las atribuciones legales conferidas a esta dirección general, le informo que la resolución para este trámite ha sido aprobada formalmente. Se autoriza el inicio inmediato de las actividades logísticas y operativas de coordinación para el cumplimiento del fin propuesto.",
            "resolucionAdoptada": [
                "Aprobar la viabilidad del expediente en todos sus términos y alcances.",
                "Disponer al departamento técnico la apertura e implementación del caso.",
                "Asignar la partida y el cronograma de ejecución según las directivas analizadas."
            ],
            "despedida": "Con la seguridad de que esta decisión redundará en beneficio de nuestra gestión conjunta, me suscribo de usted expresándole sentimientos de mi consideración más distinguida.",
            "firma": {
                "nombre": oficio["remitente"]["nombre"],
                "cargo": oficio["remitente"]["cargo"],
                "cedula": oficio["remitente"]["cedula"],
                "institucion": oficio["remitente"]["institucion"],
                "ciudad": oficio["remitente"]["ciudad"]
            },
            "copias": [
                "Archivo general",
                "Departamento Financiero"
            ],
            "anexos": [
                "Copia del informe técnico emitido",
                "Resolución presupuestaria aprobada"
            ]
        }
        
    return {}
