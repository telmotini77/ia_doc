/**
 * Módulo de generación de contenido estructurado mediante Machine Learning Local e integración de API.
 * Contiene una Red Neuronal Artificial local para clasificación de texto y estructuración de contenidos.
 */

// ==========================================================================
// DATASET DE ENTRENAMIENTO PARA LA IA (Consola ML)
// ==========================================================================
export const TRAINING_DATASET = [
  // Riego e IoT (riego)
  { text: "sistema de riego automatizado con sensores de humedad de suelo y esp32", label: "riego" },
  { text: "riego por goteo inteligente usando sensores de lluvia y microcontroladores", label: "riego" },
  { text: "monitoreo de humedad de suelo y temperatura en cultivos agricolas iot", label: "riego" },
  { text: "automatizacion de riego para invernadero utilizando reles y electrovalvulas", label: "riego" },
  { text: "sensores capacitivos de humedad y control autonomo de agua para plantas", label: "riego" },
  { text: "riego inteligente con conectividad wifi protocolo mqtt para agricultura", label: "riego" },
  { text: "riego automatico por goteo en plantaciones de hortalizas y sensores", label: "riego" },
  { text: "plataforma iot de riego de precision con sensores de humedad y flujo", label: "riego" },

  // Ciberseguridad y Redes (security)
  { text: "auditoria de ciberseguridad sobre la infraestructura de red corporativa nmap", label: "security" },
  { text: "analisis de vulnerabilidades con metasploit y owasp zap en servidores web", label: "security" },
  { text: "implementacion de cortafuegos pfsense y sistema ips ids wazuh para red", label: "security" },
  { text: "fortalecimiento de seguridad de redes locales y politicas de contraseñas", label: "security" },
  { text: "pentesting de caja negra y escaneo de puertos tls cifrado de datos", label: "security" },
  { text: "politicas de seguridad informatica e implementacion de vpn con 2fa", label: "security" },
  { text: "analisis de trafico con wireshark y mitigacion de ataques de denegacion", label: "security" },
  { text: "auditoria de redes y proteccion contra ransomware y fugas de datos", label: "security" },

  // E-Commerce y Ventas (ecommerce)
  { text: "plataforma de comercio electronico con carrito de compras pasarela stripe", label: "ecommerce" },
  { text: "tienda digital de productos locales con transacciones de pago seguras", label: "ecommerce" },
  { text: "sistema de facturacion e inventario para ventas online e-commerce", label: "ecommerce" },
  { text: "pagina web de compras y carrito interactivo pasarela de pago tokenizada", label: "ecommerce" },
  { text: "tienda virtual de ropa y catalogo de productos con checkout en linea", label: "ecommerce" },
  { text: "integracion de pagos online stripe paypal en plataforma e-commerce react", label: "ecommerce" },
  { text: "portal de ventas por internet con carrito y gestion de despachos", label: "ecommerce" },
  { text: "aplicacion de mercado virtual y control de stock contabilidad de ventas", label: "ecommerce" },

  // Educacion y E-Learning (education)
  { text: "plataforma de educacion virtual lms aula inteligente adaptativa react", label: "education" },
  { text: "sistema de aprendizaje personalizado y cursos virtuales formato scorm", label: "education" },
  { text: "aula virtual interactiva para escuelas tareas y calificaciones escolares", label: "education" },
  { text: "plataforma e-learning con recomendaciones academicas para estudiantes", label: "education" },
  { text: "software de gestion de examenes en linea y matriculacion de alumnos", label: "education" },
  { text: "sistema adaptativo para colegios con seguimiento del rendimiento escolar", label: "education" },
  { text: "portal de capacitacion docente y foros de discusion estudiantil", label: "education" },
  { text: "aula interactiva de educacion a distancia con videos y cuestionarios", label: "education" },

  // Salud y Telemedicina (health)
  { text: "sistema de telemedicina y monitoreo de pacientes clinicos webrtc", label: "health" },
  { text: "expediente clinico digital historias clinicas bajo estandar hl7", label: "health" },
  { text: "monitoreo de signos vitales con sensores biomedicos iot alertas medicas", label: "health" },
  { text: "plataforma de teleconsulta medica receta electronica firma digital", label: "health" },
  { text: "gestion hospitalaria base de datos de pacientes cronicos clinica", label: "health" },
  { text: "monitoreo de ritmo cardiaco a distancia webrtc videoconsulta medica", label: "health" },
  { text: "aplicacion de telemedicina con turnos medicos y proteccion hipaa", label: "health" },
  { text: "sistema de monitoreo de salud remoto para personas de la tercera edad", label: "health" },

  // Finanzas y Contabilidad (finance)
  { text: "sistema contable inteligente conciliacion financiera extractos bancarios", label: "finance" },
  { text: "analisis predictivo de flujo de caja y gestion de presupuestos dobles", label: "finance" },
  { text: "conciliacion automatica de movimientos bancarios y cuentas por cobrar", label: "finance" },
  { text: "software financiero para control de ingresos egresos contabilidad", label: "finance" },
  { text: "algoritmos de conciliacion contable y balance general empresarial", label: "finance" },
  { text: "sistema de facturacion electronica y prevision de liquidez en caja", label: "finance" },
  { text: "gestion contable multi-moneda open banking conciliacion automatizada", label: "finance" },
  { text: "presupuestos contables prediccion de gastos mensuales en la nube", label: "finance" }
];

// Tokenizador semántico
function tokenize(text) {
  if (!text) return [];
  const normalized = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, "");   // Eliminar puntuación
  
  const words = normalized.split(/\s+/);
  const stopWords = new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "para", "con", "en", "y", "o", "a", "al", "sobre", "su", "sus", "por", "que", "como", "esta", "este", "se"]);
  return words.filter(word => word.length > 1 && !stopWords.has(word));
}

// Constructor de Vocabulario
function buildVocabulary(dataset) {
  const vocab = new Set();
  dataset.forEach(item => {
    const tokens = tokenize(item.text);
    tokens.forEach(t => vocab.add(t));
  });

  // Palabras comunes en español para enriquecer el vocabulario
  const extraWords = [
    "proyecto", "sistema", "desarrollo", "automatizacion", "inteligente", "riego", "goteo", "sensor", "humedad", "temperatura",
    "ciberseguridad", "seguridad", "red", "redes", "auditoria", "vulnerabilidades", "tienda", "comercio", "electronico", "ventas",
    "carrito", "pagos", "plataforma", "educacion", "aprendizaje", "aula", "cursos", "estudiantes", "salud", "pacientes",
    "medica", "clinica", "telemedicina", "finanzas", "contabilidad", "conciliacion", "banco", "presupuesto", "flujo", "caja",
    "recursos", "optimizacion", "eficiencia", "herramientas", "metodologia", "resultados", "conclusiones", "recomendaciones",
    "investigacion", "tecnologia", "innovacion", "implementacion", "analisis", "diseño", "gestion", "informacion", "datos",
    "proceso", "control", "monitoreo", "dispositivo", "hardware", "software", "servidor", "nube", "aplicacion", "interfaz",
    "conexion", "usuarios", "cliente", "servicios", "integracion", "pruebas", "calidad", "soporte", "mantenimiento",
    "costo", "tiempo", "operacion", "rendimiento", "velocidad", "capacidad", "almacenamiento", "acceso", "autenticacion",
    "encriptacion", "protocolo", "wifi", "mqtt", "esp32", "arduino", "rele", "valvula", "bomba", "agua", "plantas", "cultivos",
    "agricola", "invernadero", "codigo", "programacion", "desarrollador", "experiencia", "usabilidad", "accesibilidad", "pantalla",
    "movil", "computadora", "portatil", "tableta", "internet", "banda", "ancha", "fibra", "optica", "satelital", "inalambrica",
    "antena", "senal", "cobertura", "alcance", "frecuencia", "canal", "transmision", "recepcion", "emisor", "receptor",
    "mensaje", "paquetes", "puerto", "direccion", "ip", "dns", "dhcp", "enrutador", "conmutador", "cortafuegos", "tabla",
    "columna", "fila", "registro", "consulta", "indice", "clave", "primaria", "foranea", "relacion", "entidad", "atributo",
    "esquema", "modelo", "vista", "controlador", "framework", "libreria", "modulo", "paquete", "dependencia", "instalacion",
    "configuracion", "ejecucion", "compilacion", "interpretacion", "lenguaje", "sintaxis", "semantica", "gramatica", "compilador",
    "interprete", "depurador", "consola", "terminal", "comando", "archivo", "directorio", "carpeta", "ruta", "permiso",
    "propietario", "grupo", "lectura", "escritura", "modificacion", "eliminacion", "creacion", "actualizacion", "insercion",
    "seleccion", "filtrado", "ordenamiento", "busqueda", "algoritmo", "estructura", "clase", "objeto", "funcion", "metodo",
    "variable", "constante", "parametro", "argumento", "retorno", "valor", "tipo", "entero", "flotante", "cadena", "booleano",
    "arreglo", "lista", "pila", "cola", "arbol", "grafo", "nodo", "puntero", "referencia", "memoria", "asignacion",
    "liberacion", "puntero", "direccion", "bloque", "hilo", "proceso", "sincronizacion", "mutex", "semaforo", "evento",
    "manejador", "excepcion", "error", "depuracion", "prueba", "cobertura", "asercion", "unitario", "integracion",
    "sistema", "aceptacion", "rendimiento", "carga", "estres", "seguridad", "penetracion", "vulnerabilidad", "explotacion",
    "parche", "actualizacion", "version", "control", "git", "repositorio", "rama", "fusion", "conflicto", "compromiso",
    "historial", "diferencia", "cambio", "solicitud", "extraccion", "empuje", "clonacion", "bifurcacion", "seguimiento",
    "problema", "defecto", "mejora", "tarea", "hito", "proyecto", "tablero", "tableros", "tarjeta", "lista", "columna",
    "flujo", "trabajo", "estado", "pendiente", "progreso", "completado", "bloqueado", "cancelado", "reabierto", "cerrado",
    "prioridad", "alta", "media", "baja", "urgente", "critica", "estimacion", "esfuerzo", "tiempo", "duracion", "fecha",
    "limite", "vencimiento", "creacion", "actualizacion", "cierre", "creador", "asignado", "informador", "observador",
    "comentario", "descripcion", "resumen", "titulo", "etiqueta", "componente", "version", "afectada", "fijada", "resolucion"
  ];

  extraWords.forEach(w => {
    if (vocab.size < 10000) {
      vocab.add(w);
    }
  });

  // Rellenar con palabras autogeneradas estructuradas hasta completar exactamente 10000
  let id = 1;
  while (vocab.size < 10000) {
    vocab.add(`vocab_pad_${id}`);
    id++;
  }

  return Array.from(vocab);
}

// Vectorizador Bag-of-Words
function vectorize(text, vocab) {
  const tokens = new Set(tokenize(text));
  return vocab.map(word => tokens.has(word) ? 1 : 0);
}

// ==========================================================================
// MODELO DE CLASIFICACIÓN NEURONAL (MACHINE LEARNING LOCAL)
// ==========================================================================
export class NeuralClassifier {
  constructor() {
    this.classes = ["riego", "security", "ecommerce", "education", "health", "finance"];
    this.vocab = [];
    this.weights = []; // Matriz de tamaño: vocabSize x numClasses
    this.biases = [];  // Array de tamaño: numClasses
    this.isTrained = false;
  }

  train(dataset = TRAINING_DATASET, epochs = 60, lr = 0.25) {
    this.vocab = buildVocabulary(dataset);
    const vocabSize = this.vocab.length;
    const numClasses = this.classes.length;

    // Inicializar pesos y sesgos con pequeños números
    this.weights = Array.from({ length: vocabSize }, () => Array(numClasses).fill(0));
    this.biases = Array(numClasses).fill(0);

    const history = [];

    for (let epoch = 1; epoch <= epochs; epoch++) {
      let totalLoss = 0;
      let correct = 0;

      // Mezclar dataset para evitar sesgos
      const shuffled = [...dataset].sort(() => Math.random() - 0.5);

      shuffled.forEach(item => {
        const x = vectorize(item.text, this.vocab);
        const yTrue = this.classes.indexOf(item.label);

        // Obtener índices activos (donde x[i] === 1) para evitar bucles O(vocabSize)
        const activeIndices = [];
        for (let i = 0; i < vocabSize; i++) {
          if (x[i] > 0) activeIndices.push(i);
        }

        // Forward Pass (Paso hacia adelante): z = xW + b
        const z = [...this.biases];
        for (let c = 0; c < numClasses; c++) {
          for (let idx = 0; idx < activeIndices.length; idx++) {
            const i = activeIndices[idx];
            z[c] += this.weights[i][c];
          }
        }

        // Activación Softmax
        const maxZ = Math.max(...z); // Evitar desbordamiento aritmético
        const expZ = z.map(val => Math.exp(val - maxZ));
        const sumExpZ = expZ.reduce((a, b) => a + b, 0);
        const probabilities = expZ.map(val => val / sumExpZ);

        // Pérdida y exactitud
        totalLoss -= Math.log(Math.max(probabilities[yTrue], 1e-15));
        const predictedClass = probabilities.indexOf(Math.max(...probabilities));
        if (predictedClass === yTrue) correct++;

        // Backpropagation (Retropropagación)
        // Gradiente dz = probabilidad - verdad_única (one-hot)
        const dz = probabilities.map((prob, c) => prob - (c === yTrue ? 1 : 0));

        // Gradientes descendientes estocásticos (SGD)
        for (let c = 0; c < numClasses; c++) {
          this.biases[c] -= lr * dz[c];
          for (let idx = 0; idx < activeIndices.length; idx++) {
            const i = activeIndices[idx];
            this.weights[i][c] -= lr * dz[c];
          }
        }
      });

      const avgLoss = totalLoss / dataset.length;
      const accuracy = correct / dataset.length;
      history.push({ epoch, loss: avgLoss, accuracy });
    }

    this.isTrained = true;
    return {
      vocabSize,
      numClasses,
      history,
      finalLoss: history[history.length - 1].loss,
      finalAccuracy: history[history.length - 1].accuracy
    };
  }

  predict(text) {
    if (!this.isTrained) {
      throw new Error("La Red Neuronal no ha sido entrenada.");
    }

    const x = vectorize(text, this.vocab);
    const numClasses = this.classes.length;
    const vocabSize = this.vocab.length;

    // Obtener índices activos
    const activeIndices = [];
    for (let i = 0; i < vocabSize; i++) {
      if (x[i] > 0) activeIndices.push(i);
    }

    // Forward pass
    const z = [...this.biases];
    for (let c = 0; c < numClasses; c++) {
      for (let idx = 0; idx < activeIndices.length; idx++) {
        const i = activeIndices[idx];
        z[c] += this.weights[i][c];
      }
    }

    // Softmax
    const maxZ = Math.max(...z);
    const expZ = z.map(val => Math.exp(val - maxZ));
    const sumExpZ = expZ.reduce((a, b) => a + b, 0);
    const probabilities = expZ.map(val => val / sumExpZ);

    const maxProbIdx = probabilities.indexOf(Math.max(...probabilities));
    const confidence = probabilities[maxProbIdx];
    
    // Si la confianza máxima es muy baja (< 35%), usar el clasificador por defecto general
    const category = confidence > 0.35 ? this.classes[maxProbIdx] : "general";

    const scores = {};
    this.classes.forEach((className, idx) => {
      scores[className] = probabilities[idx];
    });

    return {
      category,
      confidence,
      scores
    };
  }
}

// Heurísticas de extracción de metadatos del prompt
function parsePrompt(prompt) {
  const lowercase = prompt.toLowerCase();
  
  // Extraer Título/Tema base
  let title = "Proyecto Tecnológico Integrador";
  
  // Intentar extraer algo entre comillas
  const match = prompt.match(/"([^"]+)"/);
  if (match && match[1]) {
    title = match[1];
  } else {
    // Intentar deducir un título limpio removiendo verbos iniciales
    const cleanPrompt = prompt.replace(/(crea|genera|un|una|informe|sobre|documento|de|para|el |la |proyecto |sistema |auditoria |plataforma )/gi, '').trim();
    if (cleanPrompt.length > 5 && cleanPrompt.length < 60) {
      title = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
    }
  }

  // Extraer Institución
  let institution = "Instituto de Educación Superior y Tecnológica";
  if (lowercase.includes("universidad") || lowercase.includes("u. ")) {
    const matchInst = prompt.match(/(universidad\s+[\w\sÁÉÍÓÚáéíóúñ]+)/i);
    institution = matchInst ? matchInst[1] : "Universidad Metropolitana de Ciencias y Tecnología";
  }

  // Extraer Autores
  let authors = ["Ing. Residente / Consultor Técnico"];
  if (lowercase.includes("autor") || lowercase.includes("integrantes") || lowercase.includes("por ")) {
    const parts = prompt.split(/(?:por|autor|integrantes|creado por)\s+/i);
    if (parts.length > 1) {
      const authorList = parts[1].split(/(?:y|,)/).map(a => a.trim()).filter(a => a.length > 2);
      if (authorList.length > 0) authors = authorList.slice(0, 4);
    }
  }

  // Docente/Responsable
  let advisor = "Dr. Ing. de Proyectos e Innovación";
  if (lowercase.includes("docente") || lowercase.includes("profesor") || lowercase.includes("tutor")) {
    const parts = prompt.split(/(?:docente|profesor|tutor)\s+/i);
    if (parts.length > 1) {
      advisor = parts[1].split(/[.,\n]/)[0].trim();
    }
  }

  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const now = new Date();
  const dateStr = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  const place = "Quito, Ecuador";

  return { title, institution, authors, advisor, date: dateStr, place };
}

// Diccionario de párrafos de desarrollo académico específicos de cada categoría
const CATEGORY_PARAGRAPHS = {
  riego: {
    introduccion: [
      "El sector agrícola moderno se enfrenta a desafíos sin precedentes derivados de la escasez global de agua y los patrones climáticos volátiles. La implementación de tecnologías enmarcadas en la agricultura de precisión surge como una respuesta crítica para asegurar la viabilidad de los cultivos.",
      "A nivel mundial, la automatización en el manejo de recursos hídricos permite mitigar las pérdidas asociadas con la evaporación y la escorrentía. Este proyecto introduce un marco tecnológico basado en sensores de respuesta rápida para optimizar el ciclo del agua."
    ],
    antecedente: [
      "Históricamente, los sistemas de riego han operado bajo esquemas temporizados fijos que ignoran las necesidades biológicas inmediatas del suelo. Esta falta de adaptación genera condiciones de asfixia radicular o estrés hídrico severo en las plantaciones.",
      "La proliferación de hardware de bajo costo con conectividad Wi-Fi, como la serie ESP32, ha democratizado el acceso a telemetría ambiental. Ensayos anteriores demuestran la viabilidad de acoplar relés de estado sólido con válvulas solenoides para un control preciso."
    ],
    definicionProblema: [
      "Se identifica una ineficiencia crítica en la distribución del agua debido a la ausencia de herramientas científicas de diagnóstico en tiempo real. Esto resulta en un sobreconsumo energético de bombeo y un desperdicio alarmante del recurso hídrico.",
      "Las lecturas empíricas del suelo a menudo se realizan de manera manual y esporádica, lo cual imposibilita una respuesta reactiva ante lluvias repentinas o periodos imprevistos de alta radiación solar."
    ],
    justificacion: [
      "Este estudio se justifica en la imperativa necesidad de conservar recursos naturales mientras se maximiza el rendimiento agrícola local. La automatización del riego disminuye los costos de mano de obra y previene la proliferación de plagas micóticas asociadas con el exceso de humedad.",
      "Al digitalizar la humedad del suelo, se genera un registro histórico invaluable para la toma de decisiones agronómicas a mediano plazo, aportando valor científico y de sustentabilidad."
    ],
    marcoConceptual: [
      "El principio fundamental del monitoreo de humedad se basa en la física del suelo y la fisiología vegetal. El potencial matricial del agua en el suelo y el punto de marchitez permanente determinan los límites operativos del sistema.",
      "Los sensores capacitivos operan midiendo la variación de la capacitancia eléctrica, lo que resulta en mediciones de humedad estables e inmunes a la salinidad y corrosión galvánica.",
      "La comunicación entre nodos se rige bajo el protocolo ligero MQTT, diseñado para telemetría en redes de bajo ancho de banda. Los actuadores relevadores utilizan optoacopladores para aislar las corrientes parásitas y proteger los pines de control del microcontrolador."
    ],
    marcoMetodologico: [
      "El prototipo se diseñó utilizando un microcontrolador de doble núcleo programado bajo el entorno de Arduino IDE. El circuito impreso se encapsuló en un compartimento con protección de grado IP65 para evitar la penetración de humedad ambiental.",
      "La rutina de calibración consistió en definir los valores analógicos extremos correspondientes a suelo completamente deshidratado y suelo saturado de agua. El algoritmo de lazo cerrado toma muestras promediadas cada 10 minutos para descartar picos de ruido."
    ],
    resultadosObtenidos: [
      "Los datos recolectados durante 14 días demostraron un comportamiento estable del hardware, con una reducción promedio del 35% en el volumen de agua utilizado para el riego diario en comparación con el control manual.",
      "Se registraron más de 2000 lecturas exitosas en la base de datos distribuida sin interrupciones significativas de la señal inalámbrica, validando la estabilidad de la pila de comunicación TCP/IP."
    ],
    analisisResultados: [
      "El análisis del ahorro de agua confirma la hipótesis de que un sistema reactivo a la humedad capacitiva es altamente eficiente. La disipación térmica del microcontrolador se mantuvo dentro de rangos operativos aceptables.",
      "El filtrado digital de lecturas anómalas previno activaciones falsas de las electroválvulas, garantizando la durabilidad física de los componentes mecánicos de bombeo y control."
    ]
  },
  security: {
    introduccion: [
      "En el entorno digital contemporáneo, la protección de los activos de información corporativos es un requisito estratégico primordial. Las amenazas persistentes y las brechas de datos exigen auditorías de seguridad sistemáticas y proactivas.",
      "La infraestructura de red se enfrenta constantemente a vectores de ataque complejos. Evaluar y robustecer los mecanismos de autenticación y control perimetral reduce significativamente la superficie de exposición ante incidentes cibernéticos."
    ],
    antecedente: [
      "Auditorías previas revelaron una correlación directa entre configuraciones por defecto en servidores internos y la vulnerabilidad ante malware de tipo ransomware. La falta de segmentación de red facilita el movimiento lateral.",
      "El aumento exponencial del teletrabajo introdujo puntos de vulnerabilidad en los extremos de la red corporativa. La implementación apresurada de túneles VPN sin autenticación multifactor (MFA) comprometió la confidencialidad."
    ],
    definicionProblema: [
      "Se observa una falta de visibilidad centralizada sobre los eventos de tráfico internos, lo cual demora la detección de anomalías operativas. Los puertos de administración expuestos a internet representan un vector crítico de intrusión.",
      "Las políticas de acceso y contraseñas vigentes carecen de los estándares mínimos de complejidad, facilitando ataques de fuerza bruta y la reutilización indebida de credenciales de usuario."
    ],
    justificacion: [
      "Implementar este análisis técnico y robustecimiento de seguridad previene la pérdida de reputación corporativa e interrupciones en la continuidad de las operaciones del negocio.",
      "El cumplimiento normativo de estándares como ISO 27001 exige controles técnicos rigurosos. Este proyecto dota a la organización de herramientas de mitigación en sintonía con las regulaciones internacionales de privacidad."
    ],
    marcoConceptual: [
      "La ciberseguridad corporativa se fundamenta en la tríada CIA (Confidencialidad, Integridad y Disponibilidad). El escaneo de vulnerabilidades utiliza firmas conocidas para identificar fallos en servicios expuestos mediante puertos lógicos.",
      "Los firewalls de inspección de estado (stateful inspection) analizan el tráfico a nivel de red y transporte para bloquear conexiones no solicitadas. El cifrado de tránsito mediante TLS 1.3 emplea algoritmos de intercambio de claves criptográficas seguras.",
      "Los sistemas de detección y prevención de intrusos (IDS/IPS) analizan firmas de tráfico anómalo. La arquitectura Zero Trust dicta que ningún dispositivo interno es confiable por defecto, exigiendo verificación continua."
    ],
    marcoMetodologico: [
      "La metodología de pentesting se estructuró bajo el estándar OSSTMM, abarcando reconocimiento pasivo, escaneo activo de puertos con Nmap y explotación controlada de vulnerabilidades identificadas mediante frameworks especializados.",
      "Se configuró una consola central de monitoreo SIEM que correlaciona logs del firewall perimetral y de los sistemas operativos finales, disparando alertas críticas en base a firmas de ataques de fuerza bruta o escaneo masivo."
    ],
    resultadosObtenidos: [
      "Las pruebas iniciales identificaron tres vulnerabilidades de severidad alta relacionadas con certificados SSL caducados y bases de datos con contraseñas débiles. Tras la mitigación, la puntuación de riesgo global disminuyó un 80%.",
      "El sistema IPS bloqueó exitosamente el 100% de los intentos simulados de inyección de código y escaneo intrusivo desde la red externa, registrando de inmediato la dirección IP de origen en la lista negra perimetral."
    ],
    analisisResultados: [
      "Los hallazgos confirman la efectividad de la segmentación de red para mitigar el impacto de un compromiso local. La implementación de la autenticación de doble factor en la VPN redujo a cero los accesos no autorizados.",
      "El análisis del consumo de recursos del software de monitoreo demostró un impacto menor al 3% en la capacidad del procesador de los servidores auditados, certificando la viabilidad operativa de la solución continua."
    ]
  },
  ecommerce: {
    introduccion: [
      "La aceleración de los modelos comerciales basados en internet requiere arquitecturas web que combinen alta disponibilidad y transacciones seguras. La digitalización de catálogos y pasarelas de pago impulsa la escalabilidad corporativa.",
      "El diseño de plataformas de comercio electrónico modernas pone énfasis en la reducción de fricción durante el proceso de compra. Una experiencia de pago integrada y segura es vital para retener clientes y mejorar la conversión."
    ],
    antecedente: [
      "Los canales de ventas tradicionales enfrentan limitaciones geográficas y de horario que restringen la captación de clientes. Intentos previos de integración de plataformas comerciales carecían de sincronización de inventario en tiempo real.",
      "El procesamiento heredado de pagos mediante desvíos a portales externos elevaba la tasa de abandono del carrito de compras debido a tiempos de carga lentos y desconfianza visual del usuario final."
    ],
    definicionProblema: [
      "Se identifica una brecha técnica entre la gestión de inventario en el almacén físico y la disponibilidad mostrada en el portal web, causando sobreventa de productos. Los tiempos de carga superiores a tres segundos ahuyentan visitas.",
      "La ausencia de un sistema tokenizado para el almacenamiento de datos financieros expone la plataforma a riesgos de fraude y no conformidad con normativas estándar de tarjetas de pago (PCI-DSS)."
    ],
    justificacion: [
      "Este desarrollo es pertinente para diversificar los ingresos y expandir la presencia comercial del negocio hacia mercados regionales. La optimización del flujo de compra aumenta la satisfacción y fidelidad del usuario.",
      "La automatización del proceso de compra y facturación electrónica reduce los errores de despacho y libera recursos humanos internos para el servicio de postventa."
    ],
    marcoConceptual: [
      "Las arquitecturas de e-commerce modernas emplean el patrón SPA (Single Page Application) en el frontend y servicios REST en el backend. La pasarela de pago Stripe encapsula la información de tarjetas de crédito mediante tokens seguros.",
      "El almacenamiento en caché a nivel de base de datos disminuye el tiempo de respuesta en consultas de catálogo frecuentes. El protocolo HTTPS asegura que la comunicación entre el cliente y el servidor viaje cifrada bajo algoritmos simétricos.",
      "Los patrones de persistencia garantizan transacciones atómicas a nivel de base de datos (ACID), previniendo inconsistencias en la cantidad de stock disponible ante compras concurrentes de múltiples usuarios."
    ],
    marcoMetodologico: [
      "La plataforma se estructuró sobre React para la vista e interfaces reactivas y Node.js para la API del servidor. Se utilizó PostgreSQL para almacenar relaciones complejas de clientes, pedidos e inventario de productos.",
      "Se implementaron pruebas de estrés concurrentes utilizando herramientas de simulación de carga web para medir la latencia de confirmación del carrito de compras bajo picos simulados de hasta 150 usuarios por minuto."
    ],
    resultadosObtenidos: [
      "La plataforma validó tiempos de respuesta del servidor menores a 200 milisegundos y un proceso de compra en tres clics que redujo el abandono del carrito del 45% al 15% durante la primera fase de pruebas.",
      "Se procesaron transacciones financieras en modo sandbox de manera ininterrumpida, registrando confirmaciones instantáneas de cobro y generación automática de recibos digitales listos para despacho."
    ],
    analisisResultados: [
      "El análisis del rendimiento transaccional respalda el uso de procesamiento asíncrono para notificaciones de pago. El sistema de inventario distribuido demostró consistencia del 100% en pruebas de concurrencia extrema.",
      "La integración de cifrado SSL y tokens de Stripe mitigó riesgos de intercepción de credenciales financieras, cumpliendo con las mejores prácticas de seguridad de comercio electrónico en la nube."
    ]
  },
  education: {
    introduccion: [
      "La transición hacia la educación virtual exige entornos de aprendizaje inteligentes que mantengan el interés y se adapten al ritmo de asimilación conceptual de cada estudiante de manera personalizada.",
      "Las plataformas de gestión del aprendizaje (LMS) contemporáneas evolucionan incorporando analítica de datos para identificar patrones de rendimiento y ofrecer retroalimentación oportuna en entornos a distancia."
    ],
    antecedente: [
      "El aprendizaje virtual masivo suele experimentar altas tasas de deserción debidas a la uniformidad rígida de los contenidos y la falta de interactividad en los módulos evaluativos.",
      "Las implementaciones previas de aulas virtuales servían únicamente como repositorios estáticos de archivos PDF, desaprovechando las ventajas pedagógicas del diseño multimedia interactivo y la gamificación."
    ],
    definicionProblema: [
      "Se detecta una brecha de engagement debida a la rigidez instruccional que no distingue los conocimientos previos del alumno. La carencia de retroalimentación inmediata desmotiva a los estudiantes rezagados.",
      "La falta de métricas automatizadas de progreso impide a los tutores académicos intervenir de forma temprana ante casos latentes de deserción escolar o dificultades de comprensión conceptual."
    ],
    justificacion: [
      "Desarrollar una plataforma adaptativa responde a la necesidad de mejorar la equidad en el rendimiento académico. La retroalimentación automática optimiza los tiempos docentes para tutorías de alto valor.",
      "El sistema reduce la deserción escolar en entornos virtuales a distancia, ofreciendo una experiencia educativa flexible y escalable acorde con las exigencias del aprendizaje en la era del conocimiento."
    ],
    marcoConceptual: [
      "El aprendizaje adaptativo de software combina algoritmos de clasificación de perfiles estudiantiles con repositorios de contenido dinámicos. El estándar SCORM regula la interoperabilidad de empaquetados multimedia interactivos.",
      "La teoría del diseño instruccional moderno recomienda fragmentar la información en micro-aprendizajes (microlearning) para mejorar la retención cognitiva y reducir la fatiga en sesiones de estudio extensas.",
      "La analítica del aprendizaje (learning analytics) extrae datos cuantitativos de interacciones en el portal para predecir el rendimiento final y mapear la curva de aprendizaje individual del alumno."
    ],
    marcoMetodologico: [
      "La plataforma se implementó con un backend modular capaz de evaluar los puntajes y derivar automáticamente al alumno a módulos de nivelación o de nivel avanzado. La base de datos registra tiempos de lectura y clics.",
      "Se realizó un estudio piloto con un grupo experimental de 40 estudiantes utilizando el sistema adaptativo, comparando su desempeño final con un grupo de control bajo metodología instruccional tradicional y estática."
    ],
    resultadosObtenidos: [
      "El grupo experimental que utilizó el motor adaptativo obtuvo un incremento del 20% en las notas de evaluación intermedia y reportó un índice de satisfacción del 92% respecto a la flexibilidad del LMS.",
      "El tablero de control del docente se actualizó en tiempo real con una latencia menor a tres segundos, alertando con precisión sobre tres estudiantes con patrones de inactividad de alto riesgo."
    ],
    analisisResultados: [
      "Se comprueba estadísticamente que la personalización algorítmica de contenidos disminuye el tiempo de asimilación teórica. El almacenamiento multimedia en servidores CDN previno problemas de ancho de banda.",
      "La visualización interactiva de progresos permitió a los tutores guiar de forma eficiente a los estudiantes rezagados, demostrando la viabilidad de fusionar tecnología analítica con pedagogía moderna."
    ]
  },
  health: {
    introduccion: [
      "El acceso universal a servicios de salud oportunos se beneficia de los canales de comunicación síncronos a distancia. La telemedicina reduce brechas geográficas y optimiza la capacidad instalada de clínicas.",
      "El monitoreo remoto de signos vitales mediante tecnologías del Internet de las Cosas Médicas (IoMT) permite transicionar de un modelo de salud reactivo a uno predictivo y de monitoreo constante."
    ],
    antecedente: [
      "El traslado de pacientes crónicos desde zonas rurales a centros hospitalarios metropolitanos representa costos elevados y riesgos para la salud física del paciente ante afecciones agudas recurrentes.",
      "Sistemas de registro médico antiguos adolecían de fragmentación informativa, almacenando historiales clínicos en archivos locales incompatibles con estándares internacionales de intercambio electrónico."
    ],
    definicionProblema: [
      "Se consta una demora crítica en la detección de anomalías cardíacas o respiratorias en pacientes dados de alta. La incompatibilidad de sistemas clínicos impide la portabilidad del expediente clínico digital.",
      "El cumplimiento deficiente de protocolos de confidencialidad en canales de videollamada comerciales vulnera la privacidad del paciente y expone a los profesionales a sanciones legales severas."
    ],
    justificacion: [
      "Este sistema se justifica por la necesidad de mitigar la saturación de salas de emergencia hospitalarias mediante teleconsultas preventivas. El monitoreo continuo de signos vitales salva vidas al alertar en tiempo de crisis.",
      "La adopción de estándares de encriptación y firmas electrónicas en recetas médicas garantiza el cumplimiento normativo legal, protegiendo la confidencialidad de la información de salud sensible."
    ],
    marcoConceptual: [
      "El estándar HL7 (Health Level Seven) regula la interoperabilidad de datos clínicos electrónicos. La telemedicina síncrona utiliza videollamadas WebRTC de baja latencia con canales de audio y datos cifrados de extremo a extremo.",
      "El cifrado AES-256 protege las bases de datos no relacionales que almacenan expedientes clínicos de acuerdo con las normativas internacionales de protección de datos de salud (HIPAA / GDPR).",
      "La telemetría IoMT emplea sensores no invasivos como oxímetros y oxigenadores de pulso digitales para transmitir variables fisiológicas críticas a pasarelas en la nube con un retardo mínimo."
    ],
    marcoMetodologico: [
      "Se construyó un portal web seguro que integra una sala virtual WebRTC y un módulo de base de datos documental. Se programaron alertas críticas mediante sockets persistentes cuando los valores fisiológicos superan umbrales seguros.",
      "Se realizaron simulaciones de carga y concurrencia con médicos reales para validar el flujo de firma digital de recetas médicas y la consistencia en la visualización en tiempo real de electrocardiogramas simulados."
    ],
    resultadosObtenidos: [
      "El sistema mantuvo canales de videollamada activos a resoluciones HD utilizando un ancho de banda menor a 1.2 Mbps, garantizando una comunicación fluida incluso en conexiones móviles rurales inestables.",
      "El algoritmo de alerta fisiológica detectó de manera correcta el 99% de los eventos de arritmia y desoxigenación simulados, enviando notificaciones push críticas en un tiempo menor a 1.5 segundos."
    ],
    analisisResultados: [
      "El análisis del rendimiento clínico demuestra la viabilidad técnica de la interoperabilidad HL7 para compartir expedientes. El cifrado de punta a punta previno ataques de intercepción de datos de salud de prueba.",
      "La estabilidad del monitoreo IoMT resalta la conveniencia de integrar dispositivos médicos de bajo consumo energético para el cuidado a largo plazo de pacientes con enfermedades crónicas."
    ]
  },
  finance: {
    introduccion: [
      "La gestión financiera ágil y la previsión precisa de flujos de caja son elementos indispensables para el crecimiento de cualquier organización comercial o emprendimiento en los dinámicos mercados actuales.",
      "La automatización de procesos contables como la conciliación bancaria minimiza la probabilidad de errores de registro y optimiza la velocidad del cierre mensual, aportando claridad para la toma de decisiones."
    ],
    antecedente: [
      "El registro contable en hojas de cálculo no integradas y cargadas manualmente genera discrepancias sistemáticas entre los saldos bancarios reales y los libros internos de cuentas de la empresa.",
      "Los pronósticos de flujo de caja basados en datos estáticos históricos carecen de precisión para modelar contingencias económicas de corto plazo, comprometiendo la liquidez inmediata del negocio."
    ],
    definicionProblema: [
      "Se detecta una ineficiencia operativa que consume valiosas horas del personal de finanzas en revisiones manuales de extractos bancarios. Las discrepancias no resueltas pueden ocultar fugas de capital o fraudes.",
      "La ausencia de un motor predictivo local para el comportamiento del flujo de ingresos y egresos impide planificar adecuadamente inversiones en bienes de capital y el cumplimiento de obligaciones fiscales."
    ],
    justificacion: [
      "Automatizar la contabilidad corporativa se justifica en el ahorro sustancial de recursos y en la eliminación del error humano en los balances de cierre. Facilita auditorías fiscales internas y externas con total transparencia.",
      "Disponer de un panel predictivo en tiempo real empodera al equipo administrativo para negociar plazos de crédito de proveedores y asegurar la estabilidad de la caja ante periodos estacionales de bajas ventas."
    ],
    marcoConceptual: [
      "La contabilidad de doble entrada garantiza que toda transacción financiera mantenga el balance contable básico. La conciliación es la coincidencia automatizada de registros mediante lógica de coincidencia difusa (fuzzy matching).",
      "Los pronósticos de flujo de caja emplean algoritmos de regresión de series temporales. Las APIs bancarias reguladas bajo PSD2 facilitan la conexión directa para la lectura en tiempo real de movimientos financieros de forma segura.",
      "La integridad contable exige el uso de firmas criptográficas SHA-256 para cada transacción registrada en el libro mayor digital, asegurando la inmutabilidad y trazabilidad completa de los datos de la auditoría."
    ],
    marcoMetodologico: [
      "El software de conciliación se diseñó incorporando un algoritmo que pondera coincidencia por fecha, monto de transacción y texto de referencia de transferencias bancarias cargadas en formatos estándar XML o CSV.",
      "Se llevaron a cabo pruebas con un dataset contable de 5000 transacciones aleatorias para medir la tasa de coincidencia exacta automática frente al análisis asistido por un operador humano calificado."
    ],
    resultadosObtenidos: [
      "El motor de conciliación automática resolvió el 96% de las transacciones sin intervención manual en menos de 5 segundos, reduciendo el tiempo de conciliación de 12 horas mensuales a un promedio de 10 minutos.",
      "El modelo de series de tiempo predijo el flujo de egresos semanales con un margen de error menor al 5%, identificando de manera autónoma un periodo crítico de déficit de liquidez con tres semanas de anticipación."
    ],
    analisisResultados: [
      "El alto nivel de precisión en la conciliación confirma la viabilidad de la automatización sobre libros mayores. El análisis de rendimiento de base de datos garantizó búsquedas complejas sub-segundo.",
      "La encriptación de datos bancarios de prueba en reposo protegió la información confidencial de la empresa contra accesos no autorizados, cumpliendo con los lineamientos de auditoría financiera."
    ]
  },
  general: {
    introduccion: [
      "El desarrollo exitoso de proyectos de base tecnológica requiere planificaciones estructuradas y metodologías rigurosas que articulen el diseño con los objetivos estratégicos establecidos.",
      "La optimización de procesos mediante herramientas digitales representa un vector clave para la modernización y la mejora de la eficiencia operativa en diversos ámbitos organizacionales."
    ],
    antecedente: [
      "Los flujos de trabajo tradicionales a menudo dependen de tareas manuales propensas a demoras y errores operativos. La carencia de telemetría impide tomar decisiones informadas en base a datos precisos.",
      "El avance de las arquitecturas web basadas en APIs y el almacenamiento en la nube ha abierto oportunidades sin precedentes para resolver problemas de gestión complejos de manera ágil."
    ],
    definicionProblema: [
      "Se observa un estancamiento en la eficiencia debido a la persistencia de procesos analógicos que no se comunican de forma fluida, generando islas de información y retrasos acumulativos.",
      "La falta de visibilidad analítica del desempeño del sistema limita la capacidad de identificar cuellos de botella operativos de forma temprana y planificar mantenimientos preventivos."
    ],
    justificacion: [
      "Este proyecto se justifica en su aporte para simplificar la toma de decisiones mediante paneles analíticos visuales y la automatización de procesos complejos repetitivos.",
      "La solución técnica propuesta no solo reduce costos de operación a mediano plazo, sino que eleva la calidad de los servicios prestados y la satisfacción de los usuarios involucrados."
    ],
    marcoConceptual: [
      "Las arquitecturas de sistemas modernas se apoyan en el patrón cliente-servidor y en protocolos estándar de transferencia de datos sobre redes IP. La seguridad se gestiona mediante capas de control lógico y de acceso físico.",
      "Las bases de datos estructuradas garantizan la integridad referencial de los registros históricos recopilados. El diseño modular de componentes facilita la escalabilidad y el mantenimiento del código.",
      "El ciclo de mejora continua en el desarrollo de software asegura que la retroalimentación de los usuarios se incorpore de manera ágil en cada nueva versión del sistema."
    ],
    marcoMetodologico: [
      "El enfoque adoptado es descriptivo y experimental, combinando el diseño conceptual de la arquitectura lógica con la codificación de un prototipo funcional para pruebas empíricas de integración.",
      "Se establecieron planes de contingencia técnicos y de seguridad y se realizaron pruebas unitarias exhaustivas sobre las funciones centrales del sistema antes del despliegue piloto final."
    ],
    resultadosObtenidos: [
      "Las pruebas iniciales confirmaron la estabilidad de los flujos de comunicación con tiempos de respuesta óptimos y cero caídas del sistema durante la ejecución simulada.",
      "Se recopiló retroalimentación altamente favorable de los participantes del piloto, quienes destacaron la facilidad de uso de la interfaz web y la utilidad de los reportes automatizados."
    ],
    analisisResultados: [
      "Los resultados cuantitativos demuestran que la automatización de los procesos tradicionales superó con éxito las métricas de control de calidad propuestas al inicio del estudio.",
      "El análisis del consumo de recursos lógicos y la viabilidad técnica certifica que el sistema es escalable y apto para ser implementado en escenarios de producción comercial."
    ]
  }
};

// Diccionario de párrafos de desarrollo académico genéricos por sección para expansión masiva
const UNIVERSAL_PARAGRAPHS = {
  marcoConceptual: [
    "En el ámbito del diseño de sistemas modernos, la escalabilidad y modularidad representan criterios de calidad indispensables. Toda solución que pretenda integrarse en un entorno operativo real debe seguir patrones de diseño establecidos que mitiguen el acoplamiento y faciliten el mantenimiento evolutivo. La arquitectura de microservicios, por ejemplo, permite separar las responsabilidades del sistema en unidades autónomas e independientes que se comunican a través de APIs RESTful o colas de mensajería asíncronas.",
    "Asimismo, la persistencia de datos debe diseñarse considerando el teorema CAP y seleccionando el motor de base de datos idóneo para garantizar la consistencia, disponibilidad y tolerancia a particiones de red. El modelado entidad-relación y el establecimiento de índices eficientes aseguran búsquedas en tiempos sub-segundo, incluso ante el crecimiento exponencial de registros de telemetría y perfiles de usuarios recopilados por los servicios centrales.",
    "Por otro lado, la adopción de arquitecturas desacopladas como Publish-Subscribe (PubSub) permite a los servidores de backend y a los dispositivos finales en el borde (Edge Computing) interactuar con una baja sobrecarga computacional. El uso de brokers de mensajería optimiza la entrega de eventos concurrentes, garantizando que el flujo de datos transaccionales se procese sin bloqueos ni retrasos en la pila del servidor.",
    "Desde el punto de vista del desarrollo ágil, la inmutabilidad de los datos históricos y la trazabilidad de los cambios operativos representan pilares normativos de la auditoría informática moderna. Toda transacción, lectura física o evento crítico debe ir acompañado de una firma de tiempo e identificadores unívocos para posibilitar análisis forenses posteriores o la corrección de inconsistencias lógicas en el sistema."
  ],
  marcoMetodologico: [
    "El desarrollo se rige bajo la metodología ágil Scrum, dividiendo el cronograma de trabajo en iteraciones cortas llamadas sprints de dos semanas. Cada sprint concluye con un incremento funcional del sistema probado y listo para su demostración. El ciclo de vida de desarrollo de software (SDLC) adoptado incluye fases de análisis estricto de requerimientos funcionales y no funcionales, modelado lógico, codificación estructurada y pruebas exhaustivas de integración.",
    "Las pruebas unitarias y de integración garantizan que cada componente de código responda según lo esperado ante entradas nominales y de excepción. Se implementó un pipeline automatizado de integración y despliegue continuo (CI/CD) para compilar y validar el software en un entorno sandbox antes de su promoción a la rama de producción principal. Las métricas de cobertura de código se monitorean constantemente para mantener la robustez del producto final.",
    "Además, las pruebas de estrés simulan condiciones extremas de carga con herramientas automatizadas que envían miles de peticiones HTTP/Sockets concurrentes hacia el servidor. Esto permite identificar cuellos de botella de memoria y de procesamiento antes de la puesta en marcha oficial, permitiendo calibrar los balanceadores de carga y las políticas de escalado automático en la infraestructura en la nube.",
    "El diseño de las interfaces de usuario (UX/UI) sigue directrices de diseño interactivo de alta fidelidad, garantizando que los tableros de control respondan rápidamente en todo tipo de pantallas (diseño responsivo). Se priorizó la accesibilidad (normativa WCAG) y la usabilidad para minimizar la curva de aprendizaje de los usuarios finales y asegurar una navegación intuitiva y sin fricciones."
  ],
  resultadosObtenidos: [
    "Para validar estadísticamente los resultados del proyecto, se recopiló una muestra significativa de datos operativos durante el transcurso de las pruebas piloto. La distribución de los datos se analizó mediante pruebas de normalidad y cálculo de varianzas para asegurar la representatividad estadística de la muestra. Se establecieron variables de control claras para aislar efectos ambientales externos que pudiesen sesgar la evaluación.",
    "Las lecturas del sistema reflejan una consistencia operativa del 99.8% a lo largo de todo el periodo de prueba evaluado, confirmando la estabilidad del hardware y del software desarrollados frente a fluctuaciones en el suministro eléctrico y fallos menores en las redes de comunicación local. El tiempo promedio transcurrido entre fallos (MTBF) superó con creces los límites de tolerancia mínimos establecidos.",
    "El panel administrativo web centralizó de forma exitosa los reportes en formatos estructurados PDF y Excel, automatizando la generación de resúmenes operativos diarios. Las consultas concurrentes hacia la base de datos se ejecutaron con una latencia media de 12 milisegundos, demostrando la efectividad de la optimización realizada a nivel de esquemas de tablas e índices del motor persistente.",
    "La tasa de error transaccional general se mantuvo por debajo del 0.2%, un rendimiento sustancialmente mejor que el 3.5% que presentaban los métodos analógicos de registro manual de información y control de procesos. Esto valida la robustez de las rutinas de validación de entradas."
  ],
  analisisResultados: [
    "El análisis detallado de la seguridad del sistema contempla la protección de datos en reposo y en tránsito mediante algoritmos de cifrado simétrico Advanced Encryption Standard (AES) con llaves de 256 bits y firmas digitales basadas en criptografía de clave pública y tokens JWT. Se definieron políticas estrictas de control de acceso basado en roles (RBAC) para limitar los privilegios administrativos y proteger los datos.",
    "Adicionalmente, el estudio de viabilidad económica demostró que el retorno de la inversión (ROI) se sitúa en un periodo menor a los ocho meses gracias a los ahorros directos obtenidos por la automatización de los recursos y la eliminación de horas de personal. Los costos de mantenimiento operativo del servidor en la nube representan menos del 15% de los beneficios mensuales generados.",
    "Desde una perspectiva ambiental y de sostenibilidad, la organización incorpora protocolos de bajo consumo en el borde y modos de suspensión inteligente redujo la huella de carbono de los servidores locales en un 22% anual. Esto posiciona el proyecto dentro de los lineamientos corporativos de responsabilidad social y desarrollo sustentable."
  ]
};

// Párrafos adicionales para relleno de gran volumen (proyectos técnicos de 10K+ palabras)
const EXTRA_ACADEMIC_PARAGRAPHS = [
  "La modularización del software permite a los equipos de desarrollo trabajar de manera de concurrente en distintas capas de la aplicación sin interferir en los componentes del núcleo central, reduciendo sustancialmente los conflictos de integración.",
  "Las técnicas avanzadas de optimización de bases de datos relacionales incluyen la normalización para eliminar redundancias y la desnormalización selectiva y uso de vistas indexadas para acelerar consultas complejas de agregación analítica.",
  "La virtualización mediante contenedores ligeros simplifica el empaquetamiento de dependencias y la portabilidad del software, garantizando que el sistema se ejecute bajo condiciones idénticas tanto en desarrollo como en la nube.",
  "Las arquitecturas dirigidas por eventos (Event-Driven Architectures) procesan los flujos de telemetría de forma asíncrona y en tiempo real, mejorando la respuesta general del sistema ante ráfagas masivas de eventos concurrentes.",
  "La auditoría de rendimiento en producción utiliza herramientas de perfilado (profilers) para medir los tiempos de ejecución a nivel de instrucciones del procesador, detectando fugas de memoria ocultas en rutinas de larga duración.",
  "La encriptación asimétrica mediante algoritmos RSA con claves de 4096 bits se emplea para el intercambio inicial seguro de secretos de sesión, garantizando que las comunicaciones subsecuentes cifradas con AES-256 no puedan ser interceptadas.",
  "La metodología de diseño centrado en el usuario (UCD) sitúa las necesidades operativas de los operadores finales como el eje central de las decisiones de interfaz de usuario, validando prototipos interactivos en etapas tempranas.",
  "Los balanceadores de carga distribuyen dinámicamente el tráfico entrante hacia múltiples instancias del servidor de aplicaciones, previniendo cuellos de botella por saturación de red y asegurando la resiliencia del servicio.",
  "Los marcos de desarrollo de pruebas automatizadas (Testing Frameworks) ejecutan conjuntos de pruebas de regresión en cada actualización de código, asegurando que las nuevas características no rompan la funcionalidad preexistente.",
  "El diseño térmico y de disipación pasiva de las carcasas protectoras para los dispositivos de hardware previene fallos por fatiga de materiales y sobrecalentamiento electrónico en climas cálidos y entornos húmedos extremos."
];

// Función para expandir dinámicamente un texto hasta cumplir un rango aproximado de palabras
function expandSectionText(category, section, reportType, title, baseText) {
  const paragraphs = [baseText];
  
  // Obtener párrafos específicos de la categoría si existen
  const categoryParas = CATEGORY_PARAGRAPHS[category]?.[section] || [];
  categoryParas.forEach(p => {
    const formattedPara = p.replace(/\$\{title\}/g, title);
    paragraphs.push(formattedPara);
  });
  
  // Determinar cuántos palabras adicionales universales y extras añadir según el reportType
  let targetWordCount = 200; // Por defecto corto
  if (reportType === 'universitario') {
    if (section === 'marcoConceptual') targetWordCount = 2200;
    else if (section === 'marcoMetodologico') targetWordCount = 1100;
    else if (section === 'resultadosObtenidos') targetWordCount = 900;
    else if (section === 'analisisResultados') targetWordCount = 550;
    else targetWordCount = 400; // introduccion, antecedente, definicionProblema, justificacion
  } else if (reportType === 'tecnico') {
    if (section === 'marcoConceptual') targetWordCount = 2700;
    else if (section === 'marcoMetodologico') targetWordCount = 1800;
    else if (section === 'resultadosObtenidos') targetWordCount = 1300;
    else if (section === 'analisisResultados') targetWordCount = 700;
    else targetWordCount = 450; // introduccion, antecedente, definicionProblema, justificacion
  } else if (reportType === 'ieee') {
    if (section === 'marcoConceptual') targetWordCount = 1300;
    else if (section === 'marcoMetodologico') targetWordCount = 1000;
    else if (section === 'resultadosObtenidos') targetWordCount = 900;
    else if (section === 'analisisResultados') targetWordCount = 600;
    else targetWordCount = 500; // introduccion, antecedente, definicionProblema, justificacion
  } else {
    // 'corto'
    if (section === 'marcoConceptual') targetWordCount = 500;
    else if (section === 'marcoMetodologico') targetWordCount = 250;
    else if (section === 'resultadosObtenidos') targetWordCount = 250;
    else if (section === 'analisisResultados') targetWordCount = 150;
    else targetWordCount = 180; // introduccion, antecedente, definicionProblema, justificacion
  }
  
  // Agregar párrafos universales para esta sección
  const universalParas = UNIVERSAL_PARAGRAPHS[section] || [];
  
  // Añadir párrafos de forma progresiva hasta alcanzar la longitud de palabras meta
  let currentWords = paragraphs.join(" ").split(/\s+/).length;
  
  let uIdx = 0;
  while (currentWords < targetWordCount && uIdx < universalParas.length) {
    paragraphs.push(universalParas[uIdx]);
    currentWords = paragraphs.join(" ").split(/\s+/).length;
    uIdx++;
  }
  
  let eIdx = 0;
  while (currentWords < targetWordCount && eIdx < EXTRA_ACADEMIC_PARAGRAPHS.length) {
    paragraphs.push(EXTRA_ACADEMIC_PARAGRAPHS[eIdx]);
    currentWords = paragraphs.join(" ").split(/\s+/).length;
    eIdx++;
  }

  // Unir con doble salto de línea
  return paragraphs.join("\n\n");
}

// Función auxiliar para modificar un documento localmente
function modifyLocalDoc(existingDoc, prompt, reportType, category, title) {
  const doc = JSON.parse(JSON.stringify(existingDoc));
  const lowercase = prompt.toLowerCase();

  if (lowercase.includes("título") || lowercase.includes("titulo") || lowercase.includes("tema")) {
    const match = prompt.match(/(?:título|titulo|tema)\s*(?:a|sea|de|:)?\s*["'«“]([^"'»”]+)["'»”]/i) ||
                  prompt.match(/(?:título|titulo|tema)\s*(?:a|sea|de|:)?\s*([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+)/i);
    if (match && match[1]) {
      const newTitle = match[1].trim();
      doc.title = newTitle.toUpperCase();
      if (doc.hoja1) doc.hoja1.proyecto = newTitle;
    }
  }

  if (lowercase.includes("institución") || lowercase.includes("institucion")) {
    const match = prompt.match(/(?:institución|institucion)\s*(?:a|sea|de|:)?\s*["'«“]([^"'»”]+)["'»”]/i) ||
                  prompt.match(/(?:institución|institucion)\s*(?:a|sea|de|:)?\s*([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+)/i);
    if (match && match[1]) {
      const newInst = match[1].trim();
      doc.institution = newInst;
      if (doc.hoja1) doc.hoja1.institucion = newInst;
    }
  }

  if (doc.primeraParte) {
    if (lowercase.includes("introduccion") || lowercase.includes("introducción")) {
      doc.primeraParte.introduccion = `[Revisado] ${doc.primeraParte.introduccion}\n\nNota de actualización: Se ha incorporado e integrado la siguiente directiva: "${prompt}".`;
    }
    if (lowercase.includes("antecedente")) {
      doc.primeraParte.antecedente = `[Revisado] ${doc.primeraParte.antecedente}\n\nNota de actualización: Contexto modificado según: "${prompt}".`;
    }
    if (lowercase.includes("problema")) {
      doc.primeraParte.definicionProblema = `[Revisado] ${doc.primeraParte.definicionProblema}\n\nNota de actualización: Definición del problema refinada según: "${prompt}".`;
    }
    if (lowercase.includes("justificacion") || lowercase.includes("justificación")) {
      doc.primeraParte.justificacion = `[Revisado] ${doc.primeraParte.justificacion}\n\nNota de actualización: Justificación adaptada con respecto a: "${prompt}".`;
    }
    if (lowercase.includes("objetivo")) {
      doc.primeraParte.objetivos.general = `[Revisado] Desarrollar y evaluar el sistema, enfocado en: "${prompt}"`;
      if (!doc.primeraParte.objetivos.especificos.some(o => o.includes("Revisión"))) {
        doc.primeraParte.objetivos.especificos.push(`Realizar la revisión y adaptación funcional de la arquitectura de acuerdo con los nuevos requerimientos.`);
      }
    }
  }

  if (doc.segundaParte) {
    if (lowercase.includes("marco conceptual") || lowercase.includes("teoria") || lowercase.includes("teoría")) {
      doc.segundaParte.marcoConceptual = `[Revisado] ${doc.segundaParte.marcoConceptual}\n\nNota de actualización: Incorporando teoría sobre: "${prompt}".`;
    }
    if (lowercase.includes("metodologia") || lowercase.includes("metodología") || lowercase.includes("codigo") || lowercase.includes("código") || lowercase.includes("arquitectura")) {
      doc.segundaParte.marcoMetodologico = `[Revisado] ${doc.segundaParte.marcoMetodologico}\n\nNota de actualización: Ajuste en la metodología y especificaciones del sistema: "${prompt}".`;
    }
    if (lowercase.includes("resultados") || lowercase.includes("pruebas")) {
      doc.segundaParte.resultadosObtenidos = `[Revisado] ${doc.segundaParte.resultadosObtenidos}\n\nNota de actualización: Se agregaron nuevos registros de pruebas y observaciones: "${prompt}".`;
    }
    if (lowercase.includes("analisis") || lowercase.includes("análisis")) {
      doc.segundaParte.analisisResultados = `[Revisado] ${doc.segundaParte.analisisResultados}\n\nNota de actualización: Discusión y comparativa refinada según: "${prompt}".`;
    }
  }

  if (doc.terceraParte) {
    if (lowercase.includes("conclusion") || lowercase.includes("conclusión")) {
      doc.terceraParte.conclusiones.push(`Se concluye la viabilidad de la modificación solicitada: "${prompt}".`);
    }
    if (lowercase.includes("recomendacion") || lowercase.includes("recomendación")) {
      doc.terceraParte.recomendaciones.push(`Recomendar la adopción del nuevo esquema planteado en la actualización: "${prompt}".`);
    }
  }

  if (doc.slides && Array.isArray(doc.slides)) {
    if (lowercase.includes("slide") || lowercase.includes("diapositiva")) {
      doc.slides.forEach(slide => {
        if (lowercase.includes(slide.title.toLowerCase())) {
          slide.content += `\n- Actualización: ${prompt}`;
        }
      });
    } else {
      doc.slides.push({
        num: doc.slides.length + 1,
        title: "Revisiones y Cambios",
        content: `Actualización del Documento:\n- Se modificó la presentación en base a la consulta del usuario.\n- Detalles: ${prompt}`
      });
    }
  }

  if (doc.hoja1 && doc.type === 'spreadsheet') {
    if (lowercase.includes("presupuesto") || lowercase.includes("costo") || lowercase.includes("recurso") || lowercase.includes("total")) {
      if (doc.hoja3 && doc.hoja3.rows) {
        doc.hoja3.rows.push([`Recurso adicional (${prompt.substring(0, 15)}...)`, 1, 120.00, 120.00]);
        if (doc.hoja3.formulas && doc.hoja3.formulas.value) {
          doc.hoja3.formulas.value += 120.00;
        }
      }
    }
    if (lowercase.includes("actividad") || lowercase.includes("cronograma") || lowercase.includes("tarea")) {
      if (doc.hoja2 && doc.hoja2.rows) {
        doc.hoja2.rows.push([`Actividad adicional: ${prompt.substring(0, 30)}`, "2025-10-01", "2025-10-15", "Responsable", "Pendiente"]);
      }
    }
  }

  if (doc.cuerpo) {
    doc.cuerpo = `${doc.cuerpo}\n\n[ACTUALIZACIÓN ADICIONAL]: Respecto a su solicitud de modificación: "${prompt}", se procede a incorporar dicha instrucción para los fines pertinentes.`;
  }

  return doc;
}

// Generador de Contenido Local Inteligente usando la predicción del modelo neuronal
export function generateLocalContent(prompt, type, predictionResult = null, reportType = 'tecnico', existingDoc = null, presentationStyle = 'informe') {
  const metadata = parsePrompt(prompt);
  const { title, institution, authors, advisor, date, place } = metadata;

  // Determinar la categoría (usando la predicción de la red neuronal o fallback simple)
  let category = "general";
  if (predictionResult && predictionResult.category) {
    category = predictionResult.category;
  } else {
    // Fallback de heurísticas simples si no hay objeto clasificador
    const lowercase = prompt.toLowerCase();
    if (lowercase.includes("riego") || lowercase.includes("cultivo")) category = "riego";
    else if (lowercase.includes("seguridad") || lowercase.includes("ciber")) category = "security";
    else if (lowercase.includes("commerce") || lowercase.includes("tienda")) category = "ecommerce";
    else if (lowercase.includes("educa") || lowercase.includes("lms")) category = "education";
    else if (lowercase.includes("salud") || lowercase.includes("médic")) category = "health";
    else if (lowercase.includes("finanz") || lowercase.includes("contab")) category = "finance";
  }

  // Modificar si existe un documento previo
  if (existingDoc) {
    return modifyLocalDoc(existingDoc, prompt, reportType, category, title);
  }

  // Descripciones y datos de contexto para cada categoría
  let context = {
    desc: `el desarrollo del proyecto titulado "${title}", optimizando recursos clave y garantizando un diseño escalable alineado con los requerimientos establecidos.`,
    intro: `En la actualidad, las organizaciones requieren implementar metodologías estructuradas para resolver problemas de gestión informática. Este proyecto presenta una propuesta sólida para el diseño e implementación de "${title}".`,
    justificacion: `El desarrollo de este sistema permite automatizar procesos propensos a errores manuales, reducir costos operativos y recopilar información histórica valiosa que mejora significativamente la toma de decisiones estratégicas.`,
    teoria: `El marco teórico se fundamenta en arquitecturas de software modernas, protocolos de comunicación robustos, sistemas gestores de bases de datos de alto rendimiento y metodologías ágiles de desarrollo de proyectos.`,
    herramientas: `Entornos de desarrollo integrados (IDEs), lenguajes de programación estructurados, bases de datos SQL/NoSQL y servidores en la nube para pruebas.`,
    procedimiento: "1. Análisis de necesidades de la infraestructura. 2. Modelado de base de datos y flujos lógicos. 3. Codificación del prototipo funcional. 4. Pruebas de integración y seguridad. 5. Despliegue preliminar y corrección de bugs.",
    conclusiones: [
      `Se logró diseñar e implementar con éxito la arquitectura propuesta para "${title}", cumpliendo con los objetivos establecidos.`,
      `La optimización implementada permitió reducir los tiempos de respuesta del sistema en un 40% en comparación con los métodos manuales.`,
      `Se adquirió un profundo aprendizaje práctico sobre el ciclo de vida del desarrollo y la importancia de la seguridad informática.`
    ],
    recomendaciones: [
      `Establecer un cronograma de mantenimiento preventivo periódico para asegurar la máxima estabilidad del software.`,
      `Capacitar de forma exhaustiva a los usuarios finales para optimizar el uso de las funciones integradas.`,
      `Planificar una migración paulatina hacia microservicios para mejorar la escalabilidad del producto final.`
    ],
    budgetRows: [
      ["Servidor Cloud (Meses)", 3, 20.00, 60.00],
      ["Base de Datos Administrada", 1, 45.00, 45.00],
      ["Certificado de Seguridad SSL", 1, 15.00, 15.00],
      ["Mano de Obra (Desarrollo)", 1, 800.00, 800.00],
      ["Mantenimiento y Soporte", 1, 100.00, 100.00]
    ]
  };

  if (category === "riego") {
    context = {
      desc: "un sistema de riego inteligente basado en Internet de las Cosas (IoT) y sensores de humedad y temperatura, que optimiza el consumo de agua y automatiza el riego de cultivos.",
      intro: "La escasez de agua y la necesidad de optimizar la producción agrícola exigen tecnologías de precisión. Este proyecto presenta un sistema inteligente de riego por goteo automatizado mediante IoT.",
      justificacion: "El riego ineficiente desperdicia hasta un 60% del agua dulce disponible. Este proyecto soluciona el problema monitorizando la humedad del suelo en tiempo real para regar únicamente cuando es necesario.",
      teoria: "Se basa en el uso de microcontroladores (ESP32/Arduino), sensores de humedad de suelo capacitivos (YL-69), bombas de agua de 12V, y protocolos de comunicación ligeros como MQTT.",
      herramientas: "Microcontrolador ESP32, Sensor de humedad YL-69, Sensor DHT11, Relé de 5V, Firebase Realtime Database, y un Frontend en React.",
      procedimiento: "1. Calibración de los sensores de humedad en seco y húmedo. 2. Programación del firmware en el ESP32 para lecturas y envío de datos. 3. Configuración del broker MQTT o Firebase. 4. Integración del panel web. 5. Pruebas en campo con cultivos reales.",
      conclusiones: [
        "El sistema redujo el desperdicio de agua en un 35% durante las pruebas de campo realizadas en un periodo de dos semanas.",
        "Se validó la conectividad del ESP32 a través del protocolo Wi-Fi, manteniendo una latencia de datos inferior a 2 segundos hacia la nube.",
        "El control inteligente basado en el umbral de humedad previno el exceso de riego de manera 100% autónoma."
      ],
      recomendaciones: [
        "Reemplazar la fuente de alimentación cableada por paneles solares autónomos de 10W con baterías recargables LiPo.",
        "Implementar sensores de humedad del suelo de grado industrial con blindaje anticorrosión para mayor durabilidad física.",
        "Integrar alertas críticas en tiempo real a través de mensajería instantánea como Telegram o WhatsApp."
      ],
      budgetRows: [
        ["Microcontrolador ESP32", 3, 12.00, 36.00],
        ["Sensores de Humedad Capacitivos", 5, 4.50, 22.50],
        ["Módulos de Relé 5V", 3, 2.50, 7.50],
        ["Electroválvulas de Riego de 12V", 2, 18.00, 36.00],
        ["Servidor de pruebas Cloud (Meses)", 3, 15.00, 45.00],
        ["Cables y Accesorios de Conexión", 1, 15.00, 15.00],
        ["Mano de Obra y Desarrollo", 1, 800.00, 800.00]
      ]
    };
  } else if (category === "security") {
    context = {
      desc: "una auditoría profunda de ciberseguridad sobre la infraestructura de red, detectando vulnerabilidades críticas en puertos abiertos, configuraciones débiles y políticas de contraseñas.",
      intro: "En la era digital, la seguridad de la información es un pilar estratégico. Este informe analiza el estado de ciberseguridad corporativa e implementa controles según la norma ISO 27001.",
      justificacion: "Los ataques de ransomware y phishing han aumentado exponencialmente. Identificar vectores de ataque internos y externos de forma temprana previene pérdidas económicas catastróficas y protege la reputación institucional.",
      teoria: "Se apoya en conceptos de Pentesting ético, escaneo de puertos, análisis estático de código, cifrado de datos en reposo y tránsito (TLS 1.3), y controles basados en el estándar ISO 27002.",
      herramientas: "Nmap, Wireshark, Metasploit Framework, OWASP ZAP, cortafuegos pfSense, y servidores virtuales Ubuntu Linux para simulación de ataques.",
      procedimiento: "1. Fase de reconocimiento pasivo y activo de la red. 2. Escaneo automatizado y manual de puertos y servicios. 3. Análisis de falsos positivos y priorización de riesgos (CVSS v3). 4. Mitigación de brechas y parchado de servidores. 5. Generación del reporte técnico.",
      conclusiones: [
        "Se detectaron 3 vulnerabilidades críticas relacionadas con contraseñas por defecto en la base de datos y puertos expuestos innecesariamente.",
        "Se implementó con éxito un sistema de prevención de intrusos (IPS) que bloquea escaneos de Nmap de manera automática.",
        "La concientización al personal redujo la tasa de éxito de campañas simuladas de phishing de un 45% a solo un 5%."
      ],
      recomendaciones: [
        "Establecer una política obligatoria de autenticación de doble factor (2FA) para el acceso a las VPNs corporativas.",
        "Realizar auditorías externas de caja negra al menos dos veces al año por consultores independientes.",
        "Implementar un centro de monitoreo de seguridad (SOC) basado en software libre como Wazuh."
      ],
      budgetRows: [
        ["Hardware Cortafuegos pfSense", 1, 250.00, 250.00],
        ["Licencia de Escáner Comercial (1 Mes)", 1, 95.00, 95.00],
        ["Servidor Virtual para pruebas", 2, 20.00, 40.00],
        ["Dispositivos YubiKey para 2FA", 5, 50.00, 250.00],
        ["Mano de Obra de Consultoría", 1, 900.00, 900.00]
      ]
    };
  } else if (category === "ecommerce") {
    context = {
      desc: "una plataforma digital de comercio electrónico interactiva que facilita la compra y venta de productos locales con pasarela de pagos integrada de baja latencia.",
      intro: "La digitalización de los negocios locales es vital para expandir su alcance comercial. Este proyecto presenta una plataforma web e-commerce con carrito de compras y pasarela de pago segura.",
      justificacion: "La falta de presencia digital limita los ingresos de los emprendimientos locales. Ofrecer un portal con pagos en línea seguros y control de inventario en tiempo real incrementa las ventas hasta en un 80%.",
      teoria: "Se fundamenta en arquitecturas cliente-servidor basadas en REST APIs, cifrado de transacciones financieras (tokenización PCI-DSS) y sistemas distribuidos para consistencia de inventario.",
      herramientas: "React, Node.js con Express, Base de Datos PostgreSQL, pasarela Stripe SDK y herramientas de monitoreo como Sentry.",
      procedimiento: "1. Maquetación UX/UI de la tienda y el carrito. 2. Programación del backend de productos y órdenes. 3. Integración de la pasarela Stripe en modo prueba. 4. Diseño del dashboard de administrador. 5. Pruebas de compra concurrentes de 100 usuarios virtuales.",
      conclusiones: [
        "La plataforma procesó transacciones de prueba con una latencia de confirmación inferior a 1.5 segundos.",
        "El sistema de inventario distribuido previno la sobreventa de productos en condiciones de alta concurrencia simulada.",
        "La tasa de abandono de carrito disminuyó un 12% gracias a un proceso de checkout simplificado en una sola página."
      ],
      recomendaciones: [
        "Añadir pasarelas de pago adicionales como PayPal y transferencias bancarias directas.",
        "Implementar un motor de sugerencia de productos basado en compras previas para aumentar el ticket promedio.",
        "Utilizar balanceadores de carga para mantener el rendimiento durante temporadas de ofertas comerciales masivas."
      ],
      budgetRows: [
        ["Servidores Web y Hosting (Meses)", 3, 30.00, 90.00],
        ["Dominio Corporativo .com (1 Año)", 1, 12.00, 12.00],
        ["Certificado SSL de Organización", 1, 45.00, 45.00],
        ["Comisión Inicial de Pruebas de Pago", 1, 20.00, 20.00],
        ["Desarrollo Frontend & Backend", 1, 850.00, 850.00]
      ]
    };
  } else if (category === "education") {
    context = {
      desc: "una plataforma de educación virtual (LMS) adaptativa que personaliza el aprendizaje para los estudiantes mediante análisis de datos de rendimiento escolar.",
      intro: "El sector educativo ha experimentado una transformación digital acelerada. Este proyecto propone una solución de aula virtual inteligente enfocada en reducir la deserción escolar y mejorar el engagement.",
      justificacion: "La falta de herramientas personalizadas provoca un 25% de deserción en cursos virtuales. Esta plataforma soluciona el problema adaptando las actividades al ritmo de aprendizaje de cada alumno en tiempo real.",
      teoria: "Se fundamenta en la teoría del aprendizaje adaptativo, el análisis de datos educativos (Educational Data Mining), el estándar LTI para interoperabilidad y el diseño instruccional moderno.",
      herramientas: "React.js para el Frontend, Node.js y Express para el Backend, base de datos PostgreSQL, y servicios de AWS para almacenamiento multimedia.",
      procedimiento: "1. Levantamiento de requerimientos pedagógicos y técnicos. 2. Modelado del motor de recomendaciones. 3. Diseño de la base de datos de progreso. 4. Integración del reproductor SCORM. 5. Pruebas piloto con un grupo de 50 estudiantes.",
      conclusiones: [
        "El motor adaptativo logró aumentar la tasa de aprobación de exámenes en un 22% en el grupo experimental.",
        "La tasa de retención estudiantil se mantuvo por encima de las expectativas iniciales, reduciendo el abandono en un 15%.",
        "La retroalimentación de los docentes confirmó que la visualización de métricas de progreso ahorra hasta un 30% del tiempo de tutoría."
      ],
      recomendaciones: [
        "Integrar un sistema de foros automatizado asistido por un bot conversacional para preguntas frecuentes.",
        "Optimizar la plataforma para conexiones móviles de bajo ancho de banda en zonas rurales.",
        "Obtener la certificación oficial de estándares IMS Global para garantizar la interoperabilidad."
      ],
      budgetRows: [
        ["Servidores y Base de Datos Cloud (Anual)", 1, 350.00, 350.00],
        ["Licencia de Herramientas de Autor SCORM", 2, 80.00, 160.00],
        ["Diseño de Interfaz de Usuario (UI/UX)", 1, 200.00, 200.00],
        ["Servicio de Streaming de Video (Meses)", 4, 30.00, 120.00],
        ["Capacitación a Docentes (Horas)", 10, 25.00, 250.00],
        ["Mano de Obra de Programación", 1, 900.00, 900.00],
        ["Publicidad y Lanzamiento", 1, 100.00, 100.00]
      ]
    };
  } else if (category === "health") {
    context = {
      desc: "un sistema de telemedicina y monitoreo remoto de pacientes críticos que centraliza historias clínicas y signos vitales en tiempo real bajo altos estándares de confidencialidad.",
      intro: "El acceso oportuno a servicios médicos es un reto en comunidades aisladas. Este proyecto presenta una plataforma de teleconsulta que permite la interacción directa médico-paciente y el registro clínico unificado.",
      justificacion: "La falta de atención oportuna agrava las enfermedades crónicas. Este sistema permite a médicos especialistas diagnosticar a distancia, agilizando el flujo de atención y evitando traslados innecesarios.",
      teoria: "Se basa en el estándar HL7 para el intercambio de datos médicos, cifrado simétrico/asimétrico (AES/RSA) para cumplimiento de normativas de salud como HIPAA, y protocolos de comunicación en tiempo real (WebRTC).",
      herramientas: "WebRTC para videoconsultas, MongoDB para la base de datos no relacional de expedientes, cifrado bcrypt/crypto, y un panel frontend interactivo.",
      procedimiento: "1. Análisis de cumplimiento legal y estándares HL7/HIPAA. 2. Configuración del canal de comunicación WebRTC seguro. 3. Diseño de la base de datos documental. 4. Implementación de firmas digitales para recetas. 5. Simulación con médicos especialistas y pacientes ficticios.",
      conclusiones: [
        "Se redujo el tiempo de espera para una teleconsulta de especialidad en un 70% en comparación con la cita presencial.",
        "Se garantizó el cifrado de punta a punta del 100% de las transmisiones de video e historias clínicas evaluadas.",
        "El sistema de alertas automatizado para signos vitales anómalos funcionó con una precisión de detección del 98%."
      ],
      recomendaciones: [
        "Añadir soporte para la conexión de dispositivos médicos IoT comerciales (e.g., oxímetros Bluetooth).",
        "Desarrollar una aplicación móvil nativa con notificaciones push para recordatorios de medicamentos.",
        "Establecer convenios con proveedores locales de farmacia para surtir recetas electrónicas de forma directa."
      ],
      budgetRows: [
        ["Servidor Seguro Cloud (HIPAA Compliant)", 3, 60.00, 180.00],
        ["Servicio WebRTC Turn/Stun Server", 3, 20.00, 60.00],
        ["Licencia de Certificación de Criptografía", 1, 120.00, 120.00],
        ["Dispositivo de Monitoreo de Signos Vitales", 3, 40.00, 120.00],
        ["Mano de Obra de Ingeniería Médica", 1, 950.00, 950.00]
      ]
    };
  } else if (category === "finance") {
    context = {
      desc: "un sistema automatizado de conciliación financiera y análisis predictivo de flujo de caja que utiliza algoritmos locales para optimizar la toma de decisiones económicas.",
      intro: "La gestión de caja y la previsión financiera son pilares para la supervivencia de las empresas. Este proyecto detalla un software de conciliación y control inteligente de cuentas por cobrar y pagar.",
      justificacion: "El error humano en las hojas de cálculo financieras tradicionales provoca discrepancias de hasta un 5% en los balances mensuales. Automatizar la conciliación de extractos bancarios elimina discrepancias y previene crisis de liquidez.",
      teoria: "Abarca principios de contabilidad de doble entrada, análisis de series de tiempo para predicción de flujos de caja, algoritmos de coincidencia de patrones (fuzzy matching) y criptografía de transacciones.",
      herramientas: "Python para análisis de datos, API de bancos ficticios, PostgreSQL para almacenamiento de transacciones contables, y React en el panel de control administrativo.",
      procedimiento: "1. Mapeo de flujos de efectivo de la empresa. 2. Implementación del cargador de extractos bancarios en CSV/XML. 3. Desarrollo del algoritmo de conciliación automática. 4. Modelado predictivo de egresos futuros. 5. Pruebas de estrés con 10,000 transacciones simuladas.",
      conclusiones: [
        "El algoritmo local logró conciliar de forma correcta el 96.5% de los movimientos bancarios automáticamente.",
        "Se redujo de 15 días a solo 30 minutos el proceso de cierre contable y conciliación mensual.",
        "El modelo de predicción de flujo de caja operó con un margen de error promedio inferior al 6%."
      ],
      recomendaciones: [
        "Integrar conexiones API bancarias directas utilizando estándares de Open Banking (como PSD2).",
        "Implementar un módulo de detección de anomalías y fraudes basado en patrones de gasto atípicos.",
        "Agregar soporte multi-moneda con actualización automática de tasas de cambio en tiempo real."
      ],
      budgetRows: [
        ["Servidor de Base de Datos Contable", 3, 25.00, 75.00],
        ["Sandbox API de Integración Bancaria", 1, 80.00, 80.00],
        ["Servicio Cloud Computacional (Análisis)", 3, 30.00, 90.00],
        ["Librerías de Criptografía Financiera", 1, 50.00, 50.00],
        ["Mano de Obra y Auditoría Contable", 1, 900.00, 900.00]
      ]
    };
  }

  // Construcción de estructuras basadas en el tipo
  if (type === 'report' || type === 'docx' || type === 'pdf') {
    const isIEEE = reportType === 'ieee';
    
    const introText = isIEEE 
      ? `RESUMEN (ABSTRACT) -- La automatización e implementación de soluciones basadas en tecnología digital representan un pilar estratégico en la ingeniería contemporánea. En este artículo científico se detalla el diseño, simulación y evaluación de el desarrollo del proyecto titulado "${title}". Los resultados demuestran una mejora sustancial en el rendimiento operativo, abriendo pautas para futuras optimizaciones de la arquitectura. Palabras clave: Automatización, IoT, Ciberseguridad, Redes, Eficiencia.\n\nSECCIÓN I: INTRODUCCIÓN -- El presente estudio de caso presenta de forma resumida la propuesta enfocada en ${context.desc} Este trabajo busca abordar las problemáticas existentes mediante soluciones innovadoras, estableciendo un diagnóstico inicial claro.`
      : `El presente estudio de caso presenta de forma resumida la propuesta enfocada en ${context.desc} Este trabajo busca abordar las problemáticas existentes mediante soluciones innovadoras, estableciendo un diagnóstico inicial claro.`;

    const antecedenteText = isIEEE ? `A. ANTECEDENTES Y REVISIÓN HISTÓRICA -- ${context.intro} El desarrollo tecnológico actual exige adaptación rápida, y las instituciones enfrentan constantes desafíos de integración que deben ser mitigados para mantener la eficiencia.` : `${context.intro} El desarrollo tecnológico actual exige adaptación rápida, y las instituciones enfrentan constantes desafíos de integración que deben ser mitigados para mantener la eficiencia.`;
    
    const definicionText = isIEEE ? `B. FORMULACIÓN DEL PROBLEMA -- Se evidencia una carencia sistemática en la gestión y control de procesos clave. El problema principal radica en las prácticas manuales u obsoletas que provocan demoras sustanciales, afectando el rendimiento integral y la toma de decisiones.` : `Se evidencia una carencia sistemática en la gestión y control de procesos clave. El problema principal radica en las prácticas manuales u obsoletas que provocan demoras sustanciales, afectando el rendimiento integral y la toma de decisiones.`;
    
    const justificacionText = isIEEE ? `C. MOTIVACIÓN Y JUSTIFICACIÓN -- Es pertinente implementar este estudio de caso porque ${context.justificacion} Además, aportará un marco referencial para futuros análisis en escenarios de condiciones similares.` : `Es pertinente implementar este estudio de caso porque ${context.justificacion} Además, aportará un marco referencial para futuros análisis en escenarios de condiciones similares.`;

    let especificos = [
      "Analizar la problemática actual empleando herramientas metodológicas.",
      "Diseñar una estructura lógica que solvente las necesidades detectadas.",
      "Validar la eficacia de la propuesta a través de pruebas de control."
    ];
    if (reportType === 'corto') {
      especificos = especificos.slice(0, 2);
    } else if (reportType === 'universitario' || reportType === 'tecnico') {
      especificos.push("Evaluar la viabilidad económica y ambiental del sistema implementado.");
    }
    
    let conclusionesList = [...context.conclusiones];
    let recomendacionesList = [...context.recomendaciones];
    
    if (reportType === 'corto') {
      conclusionesList = conclusionesList.slice(0, 2);
      recomendacionesList = recomendacionesList.slice(0, 2);
    } else if (reportType === 'universitario') {
      conclusionesList.push(`Se demostró que la capacitación del personal incrementa la adopción tecnológica en un 95% en los primeros meses.`);
      recomendacionesList.push(`Establecer revisiones de seguridad mensuales y backups distribuidos en la nube para garantizar redundancia.`);
    } else if (reportType === 'tecnico') {
      conclusionesList.push(`Se demostró que la capacitación del personal incrementa la adopción tecnológica en un 95% en los primeros meses.`);
      conclusionesList.push(`El análisis de consumo eléctrico del sistema validó su viabilidad técnica para alimentación por baterías solares.`);
      recomendacionesList.push(`Establecer revisiones de seguridad mensuales y backups distribuidos en la nube para garantizar redundancia.`);
      recomendacionesList.push(`Migrar la API hacia arquitecturas serverless en AWS Lambda para reducir costos de infraestructura ociosa.`);
    } else if (reportType === 'ieee') {
      conclusionesList = conclusionesList.slice(0, 3);
      recomendacionesList = recomendacionesList.slice(0, 3);
    }

    let referenciasList = [
      "Gómez, A., & Pérez, R. (2025). Monitoreo Inteligente. Revista Iberoamericana de Tecnología, 12(3), 45-56.",
      "Smith, M. (2024). Sistemas Automatizados en la Industria 4.0 (3.ª ed.). Academic Press."
    ];
    if (isIEEE) {
      referenciasList = [
        "[1] A. Gómez and R. Pérez, \"Monitoreo Inteligente,\" Revista Iberoamericana de Tecnología, vol. 12, no. 3, pp. 45-56, 2025.",
        "[2] M. Smith, Sistemas Automatizados en la Industria 4.0, 3rd ed. Academic Press, 2024.",
        "[3] J. Doe, \"Architecting Distributed Systems for IoT,\" IEEE Transactions on Cloud Computing, vol. 10, no. 2, pp. 120-135, 2025.",
        "[4] E. Johnson, \"Network Security and Firewalls in Corporate Infrastructures,\" IEEE Security & Privacy, vol. 23, no. 1, pp. 50-61, 2026."
      ];
    } else if (reportType === 'universitario' || reportType === 'tecnico') {
      referenciasList.push("Johnson, E. (2026). Seguridad en Redes y Firewalls en la Nube. Editorial Universitaria.");
      referenciasList.push("Doe, J. (2025). Arquitectura de Sistemas Distribuidos para IoT. Journal of Systems Engineering, 8(2), 112-125.");
    }

    return {
      title: title.toUpperCase(),
      type: "report",
      institution,
      authors: authors.join(", "),
      course: "Tercero BGU",
      advisor,
      date: "2025 - 2026",
      primeraParte: {
        introduccion: expandSectionText(category, 'introduccion', reportType, title, introText),
        antecedente: expandSectionText(category, 'antecedente', reportType, title, antecedenteText),
        definicionProblema: expandSectionText(category, 'definicionProblema', reportType, title, definicionText),
        justificacion: expandSectionText(category, 'justificacion', reportType, title, justificacionText),
        objetivos: {
          general: `Desarrollar y evaluar ${context.desc}`,
          especificos
        }
      },
      segundaParte: {
        marcoConceptual: expandSectionText(category, 'marcoConceptual', reportType, title, context.teoria),
        marcoMetodologico: expandSectionText(category, 'marcoMetodologico', reportType, title, `Se utilizarán las siguientes herramientas: ${context.herramientas}. El procedimiento consistió en: ${context.procedimiento}. Esta metodología asegura resultados cuantificables y reproducibles.`),
        resultadosObtenidos: expandSectionText(category, 'resultadosObtenidos', reportType, title, "Los resultados demuestran la viabilidad de la intervención. Durante la fase de recolección de datos, se observó que la implementación de los nuevos protocolos tuvo un efecto inmediato sobre el rendimiento. Los procesos se agilizaron y las métricas se estabilizaron."),
        analisisResultados: expandSectionText(category, 'analisisResultados', reportType, title, "Examinando los resultados, resulta evidente que la nueva estrategia superó al método anterior. La optimización alcanzada respalda plenamente la viabilidad técnica y operativa de los cambios propuestos en el contexto del problema definido.")
      },
      terceraParte: {
        conclusiones: conclusionesList,
        recomendaciones: recomendacionesList
      },
      cuartaParte: {
        referencias: referenciasList,
        anexos: "Anexo A: Matriz de levantamiento de requerimientos.\nAnexo B: Instrumentos de validación técnica."
      }
    };
  }

  if (type === 'presentation' || type === 'pptx') {
    const isInvestigacion = presentationStyle === 'investigacion';
    
    const reportSlides = [
      { num: 1, title: "Portada", content: `Título: ${title}\nIntegrantes: ${authors.join(", ")}\nInstitución: ${institution}\nFecha: ${date}` },
      { num: 2, title: "Agenda", content: "1. Introducción\n2. Problema y Justificación\n3. Objetivos del Proyecto\n4. Marco Teórico\n5. Metodología aplicada\n6. Resultados y Evidencias\n7. Conclusiones y Recomendaciones" },
      { num: 3, title: "Introducción", content: `Contexto: ${context.intro.substring(0, 150)}...\nObjetivo de la propuesta: Modernizar el flujo tradicional incorporando automatización y métricas en la nube.` },
      { num: 4, title: "Problema o Justificación", content: `Reto actual: Operaciones manuales ineficientes, altos tiempos de respuesta y nula recolección de datos históricos.\n\nJustificación: ${context.justificacion}` },
      { num: 5, title: "Objetivos del Proyecto", content: `Objetivo General:\n- Desarrollar y evaluar ${context.desc}\n\nObjetivos Específicos:\n- Analizar tecnologías idóneas.\n- Diseñar hardware/software modular.\n- Evaluar prototipo funcional.` },
      { num: 6, title: "Marco Teórico - Conceptos", content: `Bases conceptuales:\n- Automatización e integración en la nube.\n- Sistemas de bajo consumo.\n- Protocolos ligeros e interfaces seguras.` },
      { num: 7, title: "Marco Teórico - Tecnologías", content: `Componentes clave:\n- Plataformas IaaS/PaaS.\n- Base de datos estructurada y en tiempo real.\n- Cifrado de datos en reposo y tránsito.` },
      { num: 8, title: "Marco Teórico - Arquitectura", content: "Esquema del Sistema:\n[Cliente/Frontend] <--- HTTPS ---> [API Gateway / Servidor] <--- MQTT/TCP ---> [Dispositivos/Edge]" },
      { num: 9, title: "Metodología - Enfoque", content: `Tipo: Investigación tecnológica experimental y desarrollo aplicado.\n\nFases:\n1. Análisis preliminar\n2. Diseño electrónico/lógico\n3. Construcción y Codificación` },
      { num: 10, title: "Metodología - Herramientas", content: `Software y Hardware utilizados:\n- ${context.herramientas}\n- Microcontroladores de desarrollo y sensores calibrados.` },
      { num: 11, title: "Metodología - Procedimiento", content: `${context.procedimiento}\nOptimización constante en cada iteración del ciclo.` },
      { num: 12, title: "Metodología - Plan de Pruebas", content: "Plan de validación:\n- Pruebas unitarias de flujo lógico.\n- Pruebas de integración de datos.\n- Monitoreo de uso de recursos e integridad." },
      { num: 13, title: "Resultados Obtenidos", content: `Métricas principales:\n- Eficiencia de recursos mejorada.\n- Tiempos de operación reducidos notablemente.\n- Registro automático de eventos en base de datos.` },
      { num: 14, title: "Resultados - Comparativa", content: "Métrica | Antes (Manual) | Después (Sistema)\n----------------------------------------\nT. Operación | 45 min | 1.2 min\nTasa Fallos | 12.5% | 1.1%\nConsumo General | 100% | 65%" },
      { num: 15, title: "Resultados - Evidencias", content: "Evidencia visual:\n- Capturas del dashboard interactivo.\n- Logs de conexión activa con cero desconexiones en 48 horas.\n- Gráficas de comportamiento de variables en tiempo real." },
      { num: 16, title: "Conclusiones", content: `Logros principales:\n- ${context.conclusiones[0]}\n- ${context.conclusiones[1]}\n- Cumplimiento estricto de todos los objetivos propuestos.` },
      { num: 17, title: "Recomendaciones", content: `Próximos Pasos:\n- ${context.recomendaciones[0]}\n- ${context.recomendaciones[1]}\n- Evaluar la incorporación de algoritmos predictivos locales.` },
      { num: 18, title: "Preguntas", content: "Muchas gracias por su atención.\n\n¿Tiene alguna consulta o comentario sobre el proyecto?\n\nContacto: info@institucion.edu" }
    ];

    const researchSlides = [
      { num: 1, title: "Portada", content: `Título: ${title}\nInvestigadores: ${authors.join(", ")}\nInstitución: ${institution}\nFecha: ${date}` },
      { num: 2, title: "Resumen / Abstract", content: `Objetivo: Investigar e implementar ${context.desc}\nMetodología: Enfoque tecnológico aplicado y experimental.\nResultados clave: Optimización del consumo y reducción drástica de tiempos operativos.` },
      { num: 3, title: "Introducción y Contexto", content: `Problema: Ineficiencias operacionales debidas a la intervención manual y ausencia de telemetría histórica.\n\nContexto: ${context.intro}` },
      { num: 4, title: "Hipótesis y Objetivos", content: `Hipótesis: La introducción de un sistema automatizado basado en IoT o modelos predictivos aumentará la eficiencia global en al menos un 30%.\n\nObjetivo: Desarrollar y evaluar el prototipo modular.` },
      { num: 5, title: "Metodología de Investigación", content: `Enfoque: Experimental e investigación tecnológica.\nVariables:\n- Variable Independiente: Sistema tecnológico automatizado.\n- Variable Dependiente: Eficiencia, estabilidad y tasa de error.` },
      { num: 6, title: "Muestra y Recolección de Datos", content: `Muestra: 100 pruebas de control e instrumentación analítica.\nHerramientas:\n- ${context.herramientas}\n- Logs del sistema y almacenamiento de datos históricos.` },
      { num: 7, title: "Análisis de Datos y Pruebas", content: `Método: Comparación estadística del rendimiento del sistema.\nFase A (Planificación) -> Concluida.\nFase B (Construcción) -> 95% de estabilidad general.` },
      { num: 8, title: "Resultados del Estudio", content: `Resultados empíricos:\n- Optimización en ahorro de recursos: 32% (Meta: 30%).\n- Disponibilidad en pruebas: 99.8%.\n- Margen de error en telemetría: < 6.0%.` },
      { num: 9, title: "Discusión de Hallazgos", content: "Discusión:\n- Los hallazgos validan empíricamente la hipótesis propuesta.\n- Los tiempos de operación (1.2 min vs 45 min) muestran una mejora estadísticamente relevante.\n- Retos futuros: Escalabilidad del backend." },
      { num: 10, title: "Conclusiones de Investigación", content: `Conclusiones:\n1. La automatización propuesta es 100% viable.\n2. La hipótesis de eficiencia del 30% fue superada.\n3. Se recomienda la adopción del esquema para producción.` },
      { num: 11, title: "Referencias Científicas", content: "Bibliografía de soporte:\n- Gómez & Pérez (2025). Monitoreo Inteligente.\n- Smith (2024). Sistemas Automatizados, Academic Press.\n- Johnson (2026). Seguridad en Redes." },
      { num: 12, title: "Agradecimientos y Preguntas", content: "Agradecemos al departamento de investigación por facilitar el acceso a la infraestructura.\n\n¿Tiene alguna pregunta o sugerencia sobre nuestro estudio?\n\nContacto: info@institucion.edu" }
    ];

    return {
      title,
      type: "presentation",
      members: authors.join(", "),
      institution,
      date,
      slides: isInvestigacion ? researchSlides : reportSlides
    };
  }

  if (type === 'spreadsheet' || type === 'xlsx') {
    let totalVal = 0;
    const xlsxRows = context.budgetRows.map(r => {
      const rowTotal = r[1] * r[2];
      totalVal += rowTotal;
      return [r[0], r[1], r[2], rowTotal];
    });

    return {
      title,
      type: "spreadsheet",
      members: authors.join(", "),
      date,
      hoja1: {
        titulo: "PORTADA",
        proyecto: title,
        integrantes: authors,
        fecha: date,
        institucion: institution
      },
      hoja2: {
        titulo: "Cronograma",
        headers: ["Actividad", "Inicio", "Fin", "Responsable", "Estado"],
        rows: [
          ["Investigación y análisis de requerimientos", "2026-06-01", "2026-06-07", authors[0], "Completado"],
          ["Diseño de la arquitectura del sistema", "2026-06-08", "2026-06-15", authors[0], "Completado"],
          ["Desarrollo del backend y base de datos", "2026-06-16", "2026-06-30", authors[0], "En Progreso"],
          ["Integración física y calibración", "2026-07-01", "2026-07-10", authors[0], "Pendiente"],
          ["Desarrollo del panel web (Frontend)", "2026-07-11", "2026-07-25", authors[0], "Pendiente"],
          ["Pruebas generales y corrección de bugs", "2026-07-26", "2026-08-05", authors[0], "Pendiente"],
          ["Elaboración del informe final", "2026-08-06", "2026-08-15", authors[0], "Pendiente"]
        ]
      },
      hoja3: {
        titulo: "Presupuesto",
        headers: ["Recurso", "Cantidad", "Costo Unitario ($)", "Total ($)"],
        rows: xlsxRows,
        formulas: {
          labelCell: "C9",
          label: "Total General",
          totalCell: "D9",
          value: totalVal
        }
      },
      hoja4: {
        titulo: "Resultados",
        headers: ["Variable", "Valor", "Observaciones"],
        rows: [
          ["Tiempo de Respuesta Promedio", "1.2 segundos", "Mejora del 97.3% frente a manual"],
          ["Tasa de error operativa", "0.4%", "Bajo el umbral aceptable del 1%"],
          ["Disponibilidad del Sistema", "99.8%", "Monitoreado continuamente en pruebas"],
          ["Satisfacción del Usuario Final", "94%", "Evaluado por 30 participantes"]
        ]
      },
      hoja5: {
        titulo: "Estadísticas",
        headers: ["Indicador / KPI", "Valor Objetivo", "Valor Logrado", "Cumplimiento (%)"],
        rows: [
          ["Eficiencia en Ahorro de Recursos", "30.0%", "32.0%", 106.7],
          ["Disponibilidad del Sistema", "99.0%", "99.8%", 100.8],
          ["Precisión de Procesos", "95.0%", "97.5%", 102.6],
          ["Satisfacción del Usuario Final", "90.0%", "94.0%", 104.4]
        ]
      },
      hoja6: {
        titulo: "Gráficos",
        headers: ["Categoría", "Variable A (Meta)", "Variable B (Real)"],
        rows: [
          ["Fase A - Requerimientos", 100, 100],
          ["Fase B - Arquitectura", 90, 95],
          ["Fase C - Prototipo", 85, 87],
          ["Fase D - Producción", 80, 82]
        ]
      },
      hoja7: {
        titulo: "Registro de Evidencias",
        headers: ["Fecha", "Actividad", "Evidencia"],
        rows: [
          ["2026-06-03", "Reunión de planificación inicial", "Acta de Inicio y Repositorio en GitHub"],
          ["2026-06-12", "Diseño de esquemas y arquitectura", "Documento de Arquitectura Aprobado"],
          ["2026-06-25", "Construcción preliminar", "Prototipo en sandbox estable"],
          ["2026-07-05", "Pruebas de conectividad y flujos", "Logs de conexión activa"],
          ["2026-07-15", "Validación final del dashboard web", "Demostración en vivo en entorno local"]
        ]
      }
    };
  }

  if (type === 'petition') {
    return {
      title,
      type: "petition",
      encabezado: {
        logoText: "DOCUGENIUS ACADEMIA - INNOVACIÓN TECNOLÓGICA",
        oficioNum: `OFICIO N.º 047-PROY-${new Date().getFullYear()}`,
        lugarFecha: `${place}, ${date}`
      },
      destinatario: {
        nombre: advisor.startsWith("Dr.") || advisor.startsWith("Ing.") ? advisor : `Dr. ${advisor}`,
        cargo: "Coordinador Académico y de Proyectos",
        institucion: institution
      },
      asunto: `Solicitud de Aprobación de Proyecto: "${title}"`,
      saludo: "Estimada Autoridad,",
      cuerpo: `Por medio de la presente, me dirijo a usted de la manera más atenta con la finalidad de presentar formalmente el proyecto titulado "${title}". Este proyecto ha sido estructurado meticulosamente por los investigadores firmantes para dar solución práctica a la problemática de eficiencia tecnológica dentro de nuestra institución.
 
El desarrollo propuesto integra tecnologías de vanguardia bajo estándares óptimos de diseño, garantizando un impacto favorable inmediato en el consumo de recursos y la recolección de estadísticas de valor científico. Consideramos que la implementación de esta propuesta fortalecerá significativamente las actividades académicas y prácticas de nuestra facultad.`,
      peticion: [
        "La revisión y visto bueno de la propuesta técnica adjunta en este expediente.",
        "La asignación de un espacio de laboratorio para las pruebas del prototipo funcional.",
        "La designación de un jurado evaluador para la sustentación del proyecto final una vez concluido."
      ],
      despedida: "Sin otro particular por el momento, agradeciendo de antemano la atención brindada a esta solicitud, me suscribo de usted reiterándole mi más alta consideración y estima.",
      firma: {
        nombre: authors[0],
        cargo: "Estudiante Investigador / Coordinador de Proyecto",
        cedula: "C.I. 172456789-0"
      },
      anexos: "1. Anteproyecto Técnico y Cronograma de Trabajo detallado.\n2. Presupuesto estimado del proyecto."
    };
  }

  if (type === 'response') {
    return {
      title,
      type: "response",
      encabezado: {
        logoText: "DIRECCIÓN DE INVESTIGACIÓN Y DESARROLLO - " + institution.toUpperCase(),
        oficioNum: `OFICIO N.º 189-DIR-${new Date().getFullYear()}`,
        lugarFecha: `${place}, ${date}`
      },
      destinatario: {
        nombre: authors[0],
        cargo: "Coordinador de Estudiantes de Proyecto",
        institucion: institution
      },
      asunto: `Respuesta a la Solicitud de Aprobación del Proyecto: "${title}"`,
saludo: "Estimado Estudiante / Investigador,",
      cuerpo: `En atención a su comunicación de fecha reciente, mediante la cual solicita la aprobación del anteproyecto titulado "${title}", así como el apoyo técnico y logístico para el desarrollo de sus pruebas, cumplo con informar a usted la resolución adoptada.
 
Esta dirección procedió a realizar un análisis exhaustivo de la factibilidad metodológica, pertinencia temática e impacto institucional de su propuesta. Encontramos que el diseño planteado cumple cabalmente con los lineamientos académicos e incentiva la innovación tecnológica de manera integral.`,
      conclusion: `Por lo expuesto, esta Dirección ha resuelto: APROBAR la ejecución del proyecto titulado "${title}" y AUTORIZAR el libre acceso al laboratorio de sistemas en los horarios solicitados. Se le asignará al tutor especialista de área para el acompañamiento y validación técnica del prototipo.`,
      despedida: "Le auguramos el mayor de los éxitos en el desarrollo de esta importante investigación. Quedamos a su disposición para coordinar los detalles operativos pertinentes.",
      firma: {
        nombre: advisor,
        cargo: "Director del Departamento de Investigación y Desarrollo",
        institucion: institution
      },
      anexos: "1. Cronograma de asignación de tutores y laboratorios.\n2. Rúbrica de evaluación para la entrega del informe final."
    };
  }

  return {};
}

// ==========================================
// PROCESAMIENTO Y GENERACIÓN CLOUD
// ==========================================

// Analizador estructurado de contenido de diapositiva
export function parseSlideText(content) {
  if (!content) return { type: 'blocks', data: [] };
  
  if (content.includes(" | ") || content.includes("----")) {
    return { type: 'table', raw: content };
  }

  const lines = content.split("\n");
  const blocks = [];
  let currentBlock = null;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isHeaderLine = trimmed.includes(":") && !trimmed.startsWith("-") && !trimmed.startsWith("•") && !/^\d+\./.test(trimmed);
    const lineIndex = lines.indexOf(line);
    const nextLine = lineIndex < lines.length - 1 ? lines[lineIndex + 1].trim() : "";
    const isGenericHeader = !trimmed.startsWith("-") && !trimmed.startsWith("•") && !/^\d+\./.test(trimmed) && nextLine && (nextLine.startsWith("-") || nextLine.startsWith("•"));

    if (isHeaderLine) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      const parts = trimmed.split(":");
      const title = parts[0].trim();
      const rest = parts.slice(1).join(":").trim();
      
      currentBlock = {
        title: title,
        bullets: rest ? [rest] : []
      };
    } else if (isGenericHeader) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        title: trimmed,
        bullets: []
      };
    } else {
      if (!currentBlock) {
        currentBlock = {
          title: "",
          bullets: []
        };
      }
      let cleanLine = trimmed;
      if (cleanLine.startsWith("-") || cleanLine.startsWith("•")) {
        cleanLine = cleanLine.substring(1).trim();
      }
      currentBlock.bullets.push(cleanLine);
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return {
    type: 'blocks',
    data: blocks.filter(b => b.title || b.bullets.length > 0)
  };
}

// Función para interactuar con la API de Gemini Cloud
export async function generateGeminiContent(prompt, docType, apiKey, customMetadataObj = {}, attachedFiles = [], reportType = 'tecnico', existingDoc = null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  // Construir prompts y esquemas según el tipo de documento
  let schemaDescription = "";
  if (docType === 'report' || docType === 'docx' || docType === 'pdf') {
    let wordCounts = {
      introduccion: "200 - 250 palabras",
      antecedente: "200 - 250 palabras",
      definicionProblema: "200 - 250 palabras",
      justificacion: "80 - 100 palabras",
      marcoConceptual: "800 - 900 palabras",
      marcoMetodologico: "450 - 500 palabras",
      resultadosObtenidos: "350 - 400 palabras",
      analisisResultados: "200 - 250 palabras",
      numConclusiones: 2,
      numRecomendaciones: 2,
      numReferencias: 2
    };

    if (reportType === 'corto') {
      wordCounts = {
        introduccion: "150 - 200 palabras",
        antecedente: "150 - 200 palabras",
        definicionProblema: "150 - 200 palabras",
        justificacion: "80 - 100 palabras",
        marcoConceptual: "250 - 300 palabras",
        marcoMetodologico: "200 - 250 palabras",
        resultadosObtenidos: "150 - 200 palabras",
        analisisResultados: "100 - 150 palabras",
        numConclusiones: 2,
        numRecomendaciones: 2,
        numReferencias: 2
      };
    } else if (reportType === 'universitario') {
      wordCounts = {
        introduccion: "500 - 700 palabras",
        antecedente: "500 - 700 palabras",
        definicionProblema: "500 - 700 palabras",
        justificacion: "250 - 350 palabras",
        marcoConceptual: "1500 - 2000 palabras",
        marcoMetodologico: "800 - 1000 palabras",
        resultadosObtenidos: "700 - 900 palabras",
        analisisResultados: "500 - 700 palabras",
        numConclusiones: 3,
        numRecomendaciones: 3,
        numReferencias: 5
      };
    } else if (reportType === 'tecnico') {
      wordCounts = {
        introduccion: "800 - 1000 palabras",
        antecedente: "800 - 1000 palabras",
        definicionProblema: "800 - 1000 palabras",
        justificacion: "500 - 700 palabras",
        marcoConceptual: "2500 - 3500 palabras",
        marcoMetodologico: "1500 - 2000 palabras con diagramas descritos, arquitectura del sistema y fragmentos de código o pseudocódigo realistas",
        resultadosObtenidos: "1200 - 1600 palabras incluyendo simulaciones de pruebas y análisis de seguridad detallado",
        analisisResultados: "800 - 1200 palabras",
        numConclusiones: 4,
        numRecomendaciones: 4,
        numReferencias: 6
      };
    } else if (reportType === 'ieee') {
      wordCounts = {
        introduccion: "500 - 750 palabras. Deberás empezar obligatoriamente con un 'RESUMEN / ABSTRACT' formal de 150-200 palabras y luego continuar con la Introducción estilo IEEE",
        antecedente: "Trabajos Relacionados y Antecedentes (400 - 600 palabras)",
        definicionProblema: "Formulación del Problema y Desafíos Científicos (400 - 600 palabras)",
        justificacion: "Contribución y Justificación de la investigación (200 - 300 palabras)",
        marcoConceptual: "Fundamentos Científicos y Marco Teórico en formato formal (1000 - 1500 palabras)",
        marcoMetodologico: "Diseño Experimental, Propuesta y Metodología (600 - 900 palabras)",
        resultadosObtenidos: "Evaluación Experimental y Resultados Obtenidos con referencias a tablas/figuras (500 - 800 palabras)",
        analisisResultados: "Discusión de Resultados y Análisis de Rendimiento (400 - 600 palabras)",
        numConclusiones: 2,
        numRecomendaciones: 2,
        numReferencias: 4
      };
    }

    schemaDescription = `Return a JSON object conforming exactly to this schema for an 'Estudio de Caso':
{
  "title": "TEMA EN MAYÚSCULAS",
  "type": "report",
  "institution": "Name of Institution",
  "authors": "Nombre y Apellido",
  "course": "Curso y Paralelo",
  "advisor": "Name of Advisor/Teacher",
  "date": "Periodo, e.g. 2025 - 2026",
  "primeraParte": {
    "introduccion": "Introducción detallada (${wordCounts.introduccion})",
    "antecedente": "Antecedente y contexto (${wordCounts.antecedente})",
    "definicionProblema": "Definición del problema (${wordCounts.definicionProblema})",
    "justificacion": "Justificación del estudio (${wordCounts.justificacion})",
    "objetivos": {
      "general": "Objetivo general iniciando con verbo en infinitivo",
      "especificos": ["Objetivo específico 1", "Objetivo específico 2"]
    }
  },
  "segundaParte": {
    "marcoConceptual": "Marco Conceptual (${wordCounts.marcoConceptual})",
    "marcoMetodologico": "Marco Metodológico (${wordCounts.marcoMetodologico})",
    "resultadosObtenidos": "Resultados Obtenidos (${wordCounts.resultadosObtenidos})",
    "analisisResultados": "Análisis de Resultados (${wordCounts.analisisResultados})"
  },
  "terceraParte": {
    "conclusiones": [
      ${Array.from({length: wordCounts.numConclusiones}).map((_, i) => `"Conclusión detallada ${i + 1}"`).join(",\n      ")}
    ],
    "recomendaciones": [
      ${Array.from({length: wordCounts.numRecomendaciones}).map((_, i) => `"Recomendación detallada ${i + 1}"`).join(",\n      ")}
    ]
  },
  "cuartaParte": {
    "referencias": [
      ${Array.from({length: wordCounts.numReferencias}).map((_, i) => `"Referencia ${i + 1} en formato APA 7 o IEEE"`).join(",\n      ")}
    ],
    "anexos": "Detalle de encuestas, gráficos u otros adjuntos relevantes de soporte"
  }
}`;
  } else if (docType === 'presentation' || docType === 'pptx') {
    schemaDescription = `Return a JSON object conforming exactly to this schema:
{
  "title": "Clean Presentation Title",
  "type": "presentation",
  "members": "Comma-separated authors",
  "institution": "Name of Institution",
  "date": "Date like '26 de Mayo de 2026'",
  "slides": [
    { "num": 1, "title": "Portada", "content": "Title: ...\\nIntegrantes: ...\\nInstitución: ...\\nFecha: ..." },
    { "num": 2, "title": "Agenda", "content": "1. Introducción\\n2. ...\\n..." },
    { "num": 3, "title": "Introducción", "content": "..." },
    { "num": 4, "title": "Problema o Justificación", "content": "..." },
    { "num": 5, "title": "Objetivos del Proyecto", "content": "..." },
    { "num": 6, "title": "Marco Teórico - Conceptos", "content": "..." },
    { "num": 7, "title": "Marco Teórico - Tecnologías", "content": "..." },
    { "num": 8, "title": "Marco Teórico - Arquitectura", "content": "..." },
    { "num": 9, "title": "Metodología - Enfoque", "content": "..." },
    { "num": 10, "title": "Metodología - Herramientas", "content": "..." },
    { "num": 11, "title": "Metodología - Procedimiento", "content": "..." },
    { "num": 12, "title": "Metodología - Plan de Pruebas", "content": "..." },
    { "num": 13, "title": "Resultados Obtenidos", "content": "..." },
    { "num": 14, "title": "Resultados - Comparativa", "content": "..." },
    { "num": 15, "title": "Resultados - Evidencias", "content": "..." },
    { "num": 16, "title": "Conclusiones", "content": "..." },
    { "num": 17, "title": "Recomendaciones", "content": "..." },
    { "num": 18, "title": "Preguntas", "content": "..." }
  ]
}
Make sure slide contents fit the slide dimensions (do not overflow). Use bullet points and short sentences separated by newlines.`;
  } else if (docType === 'spreadsheet' || docType === 'xlsx') {
    schemaDescription = `Return a JSON object conforming exactly to this schema:
{
  "title": "Clean Sheet Title",
  "type": "spreadsheet",
  "members": "Comma-separated authors",
  "date": "Date like '26 de Mayo de 2026'",
  "hoja1": {
    "titulo": "PORTADA",
    "proyecto": "Project Title",
    "integrantes": ["Author 1", "Author 2"],
    "fecha": "Date",
    "institucion": "Name of Institution (optional, default empty)"
  },
  "hoja2": {
    "titulo": "Cronograma",
    "headers": ["Actividad", "Inicio", "Fin", "Responsable", "Estado"],
    "rows": [
      ["Activity name", "YYYY-MM-DD", "YYYY-MM-DD", "Author Name", "Completado/En Progreso/Pendiente"]
    ]
  },
  "hoja3": {
    "titulo": "Presupuesto",
    "headers": ["Recurso", "Cantidad", "Costo Unitario ($)", "Total ($)"],
    "rows": [
      ["Resource name", 2, 45.0, 90.0]
    ],
    "formulas": {
      "labelCell": "C9",
      "label": "Total General",
      "totalCell": "D9",
      "value": 1500
    }
  },
  "hoja4": {
    "titulo": "Resultados",
    "headers": ["Variable", "Valor", "Observaciones"],
    "rows": [
      ["Metric", "Value", "Comment"]
    ]
  },
  "hoja5": {
    "titulo": "Estadísticas",
    "headers": ["Indicador / KPI", "Valor Objetivo", "Valor Logrado", "Cumplimiento (%)"],
    "rows": [
      ["KPI name", "90%", "95%", 105.5]
    ]
  },
  "hoja6": {
    "titulo": "Gráficos",
    "headers": ["Categoría", "Variable A (Meta)", "Variable B (Real)"],
    "rows": [
      ["Category name", 80, 85]
    ]
  },
  "hoja7": {
    "titulo": "Registro de Evidencias",
    "headers": ["Fecha", "Actividad", "Evidencia"],
    "rows": [
      ["YYYY-MM-DD", "Activity", "Evidence name"]
    ]
  }
}`;
  } else if (docType === 'petition') {
    schemaDescription = `Return a JSON object conforming exactly to this schema:
{
  "title": "Clean Title",
  "type": "petition",
  "encabezado": {
    "logoText": "INSTITUTION LOGO TEXT",
    "oficioNum": "OFICIO N.º ...",
    "lugarFecha": "City, Date"
  },
  "destinatario": {
    "nombre": "Destinatary Name",
    "cargo": "Destinatary Role",
    "institucion": "Destinatary Institution"
  },
  "asunto": "Asunto of the petition",
  "saludo": "Saludo formal",
  "cuerpo": "Detailed letter body text petitioning something (must be between 150 and 400 words, direct and clear, in Spanish)",
  "peticion": ["Petition item 1", "Petition item 2"],
  "despedida": "Despedida formal",
  "firma": {
    "nombre": "Sender Name",
    "cargo": "Sender Role/Title",
    "cedula": "C.I. number"
  },
  "anexos": "List of annexes"
}`;
  } else if (docType === 'response') {
    schemaDescription = `Return a JSON object conforming exactly to this schema:
{
  "title": "Clean Title",
  "type": "response",
  "encabezado": {
    "logoText": "INSTITUTION LOGO TEXT",
    "oficioNum": "OFICIO N.º ...",
    "lugarFecha": "City, Date"
  },
  "destinatario": {
    "nombre": "Destinatary Name",
    "cargo": "Destinatary Role",
    "institucion": "Destinatary Institution"
  },
  "asunto": "Asunto of the response",
  "saludo": "Saludo formal",
  "cuerpo": "Detailed letter body text answering/responding to a previous petition (must be between 100 and 350 words, direct and clear, in Spanish)",
  "conclusion": "Resolución / Conclusión of the response",
  "despedida": "Despedida formal",
  "firma": {
    "nombre": "Sender Name",
    "cargo": "Sender Role/Title",
    "institucion": "Sender Institution"
  },
  "anexos": "List of annexes"
}`;
  }

  let existingDocInstruction = "";
  if (existingDoc) {
    existingDocInstruction = `
You are MODIFIYING an existing document. 
Here is the current document JSON data:
${JSON.stringify(existingDoc)}

The user has requested the following changes: "${prompt}".
Please modify the existing document data according to the user's request. Keep everything else intact unless requested to change it. Maintain the exact same JSON schema structure as the input document. Make sure to adapt the content length and structure according to the specified reportType and oficios guidelines if requested or necessary.
`;
  }

  // Pre-llenar metadatos si el usuario los ingresa
  let metadataOverrides = "";
  if (customMetadataObj && (customMetadataObj.title || customMetadataObj.institution || customMetadataObj.authors || customMetadataObj.advisor)) {
    metadataOverrides = `If applicable, override/use the metadata with these values:
- Title/Proyecto: ${customMetadataObj.title || ""}
- Institution: ${customMetadataObj.institution || ""}
- Authors/Integrantes: ${customMetadataObj.authors || ""}
- Advisor/Docente: ${customMetadataObj.advisor || ""}
`;
  }

  let fileInstruction = "";
  if (attachedFiles && attachedFiles.length > 0) {
    fileInstruction = "Please consider the attached files/images as additional context for generating the content. ";
  }

  const promptText = existingDoc ? `You are a professional document content editor. Based on the user modification request: "${prompt}", edit the existing document.
${existingDocInstruction}
${schemaDescription}
Output must be a raw JSON string ONLY. Do not wrap in markdown \`\`\`json blocks. Ensure numbers are numbers and arrays are arrays. All text must be in Spanish.`
: `You are a professional document content generator. Based on the user requirement prompt: "${prompt}", ${fileInstruction}generate the complete, realistic and detailed content in Spanish for a "${docType}" document. Do not use placeholders.
${metadataOverrides}
${schemaDescription}

IMPORTANT WORD COUNT AND LAYOUT GUIDELINES:
- You MUST write the sections to match the exact word count ranges specified in the schema. Do not output placeholders.
- For academic short reports ('corto'), write concise but complete paragraphs matching the specified lengths.
- For university full reports ('universitario'), write extremely detailed, academic, and extensive paragraphs to meet the high word count requirements.
- For technical project reports ('tecnico'), go into great detail with technical architectures, security analysis, test procedures, and realistic mock-ups of code or pseudocódigo, using highly descriptive and extensive language to meet the deep technical and high word count requirements.
- For IEEE articles ('ieee'), use formal IEEE formatting style. The first section ('introduccion') MUST start with an abstract ('RESUMEN / ABSTRACT') of 150-200 words, followed by the introduction content.
- For petitions ('petition'), the 'cuerpo' MUST be direct and contain between 150 and 400 words.
- For responses ('response'), the 'cuerpo' MUST be direct and contain between 100 and 350 words.

Output must be a raw JSON string ONLY. Do not wrap in markdown \`\`\`json blocks. Ensure numbers are numbers and arrays are arrays. All text must be in Spanish.`;

  const parts = [{ text: promptText }];
  
  if (attachedFiles && attachedFiles.length > 0) {
    attachedFiles.forEach(file => {
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: file.data
        }
      });
    });
  }

  const requestBody = {
    contents: [
      {
        parts: parts
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  const result = await response.json();
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("No text response from Gemini API");
  }

  return JSON.parse(textResponse.trim());
}

