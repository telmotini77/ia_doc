/**
 * Módulo de generación de contenido estructurado mediante Machine Learning y APIs.
 * Delega la clasificación y generación local al backend de Python (FastAPI).
 */

export const TRAINING_DATASET = [
  { text: "sistema de riego automatizado con sensores de humedad de suelo y esp32", label: "riego" },
  { text: "riego por goteo inteligente usando sensores de lluvia y microcontroladores", label: "riego" },
  { text: "monitoreo de humedad de suelo y temperatura en cultivos agricolas iot", label: "riego" },
  { text: "automatizacion de riego para invernadero utilizando reles y electrovalvulas", label: "riego" },
  { text: "sensores capacitivos de humedad y control autonomo de agua para plantas", label: "riego" },
  { text: "riego inteligente con conectividad wifi protocolo mqtt para agricultura", label: "riego" },
  { text: "riego automatico por goteo en plantaciones de hortalizas y sensores", label: "riego" },
  { text: "plataforma iot de riego de precision con sensores de humedad y flujo", label: "riego" },
  { text: "auditoria de ciberseguridad sobre la infraestructura de red corporativa nmap", label: "security" },
  { text: "analisis de vulnerabilidades con metasploit y owasp zap en servidores web", label: "security" },
  { text: "implementacion de cortafuegos pfsense y sistema ips ids wazuh para red", label: "security" },
  { text: "fortalecimiento de seguridad de redes locales y politicas de contraseñas", label: "security" },
  { text: "pentesting de caja negra y escaneo de puertos tls cifrado de datos", label: "security" },
  { text: "politicas de seguridad informatica e implementacion de vpn con 2fa", label: "security" },
  { text: "analisis de trafico con wireshark y mitigacion de ataques de denegacion", label: "security" },
  { text: "auditoria de redes y proteccion contra ransomware y fugas de datos", label: "security" },
  { text: "plataforma de comercio electronico con carrito de compras pasarela stripe", label: "ecommerce" },
  { text: "tienda digital de productos locales con transacciones de pago seguras", label: "ecommerce" },
  { text: "sistema de facturacion e inventario para ventas online e-commerce", label: "ecommerce" },
  { text: "pagina web de compras y carrito interactivo pasarela de pago tokenizada", label: "ecommerce" },
  { text: "tienda virtual de ropa y catalogo de productos con checkout en linea", label: "ecommerce" },
  { text: "integracion de pagos online stripe paypal en plataforma e-commerce react", label: "ecommerce" },
  { text: "portal de ventas por internet con carrito y gestion de despachos", label: "ecommerce" },
  { text: "aplicacion de mercado virtual y control de stock contabilidad de ventas", label: "ecommerce" },
  { text: "plataforma de de educacion virtual lms aula inteligente adaptativa react", label: "education" },
  { text: "sistema de aprendizaje personalizado y cursos virtuales formato scorm", label: "education" },
  { text: "aula virtual interactiva para escuelas tareas y calificaciones escolares", label: "education" },
  { text: "plataforma e-learning con recomendaciones academicas para estudiantes", label: "education" },
  { text: "software de de gestion de examenes en linea y matriculacion de alumnos", label: "education" },
  { text: "sistema adaptativo para colegios con seguimiento del rendimiento escolar", label: "education" },
  { text: "portal de de capacitacion docente y foros de discusion estudiantil", label: "education" },
  { text: "aula interactiva de de educacion a distancia con videos y cuestionarios", label: "education" },
  { text: "sistema de de telemedicina y monitoreo de pacientes clinicos webrtc", label: "health" },
  { text: "expediente clinico digital historias clinicas bajo estandar hl7", label: "health" },
  { text: "monitoreo de signos vitales con sensores biomedicos iot alertas medicas", label: "health" },
  { text: "plataforma de teleconsulta medica receta electronica firma digital", label: "health" },
  { text: "gestion hospitalaria base de datos de de pacientes cronicos clinica", label: "health" },
  { text: "monitoreo de ritmo cardiaco a distancia webrtc videoconsulta medica", label: "health" },
  { text: "aplicacion de telemedicina con turnos medicos y proteccion hipaa", label: "health" },
  { text: "sistema de monitoreo de de salud remoto para personas de la tercera edad", label: "health" },
  { text: "sistema contable inteligente conciliacion financiera extractos bancarios", label: "finance" },
  { text: "analisis predictivo de flujo de de caja y gestion de presupuestos dobles", label: "finance" },
  { text: "conciliacion automatica de de movimientos bancarios y cuentas por cobrar", label: "finance" },
  { text: "software financiero para control de de ingresos egresos contabilidad", label: "finance" },
  { text: "algoritmos de conciliacion contable y balance general empresarial", label: "finance" },
  { text: "sistema de facturacion electronica y prevision de de liquidez en caja", label: "finance" },
  { text: "gestion contable multi-moneda open banking conciliacion automatizada", label: "finance" },
  { text: "presupuestos contables prediccion de de gastos mensuales en la nube", label: "finance" }
];

const BACKEND_URL = "http://localhost:8000";

// Clase puente para la Red Neuronal en Python
// --- MOTOR DE MACHINE LEARNING Y GENERACIÓN LOCAL EN NAVEGADOR (FALLBACK OFFLINE) ---

function getNGrams(tokens) {
  const ngrams = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]} ${tokens[i+1]}`);
  }
  return ngrams;
}

const SPANISH_STOP_WORDS_SET = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "para", "con", "en", "y", "o", "a", "al", "sobre", 
  "su", "sus", "por", "que", "como", "esta", "este", "se", "bajo", "desde", "mi", "tu", "nos", "les", "os", "lo", "le",
  "un", "otra", "otro", "otros", "otras", "es", "son", "con", "una", "un", "unos", "unas", "de", "del", "al", "el", "la"
]);

function stemSpanishJS(word) {
  if (!word || word.length <= 3) return word;
  const suffixes = [
    "abilidad", "abilidades", "amiento", "amientos", "aciones", "acion", 
    "amente", "mente", "idades", "idad", "ismos", "ismo", "adores", "ador", 
    "adoras", "adora", "tivos", "tivo", "tivas", "tiva", "ados", "ado", 
    "adas", "ada", "idos", "ido", "idas", "ida", "ando", "iendo", 
    "ieros", "iero", "ieras", "era", "ar", "er", "ir", "as", "es", "os", "o", "a", "e"
  ];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix)) {
      if (word.length - suffix.length >= 3) {
        return word.substring(0, word.length - suffix.length);
      }
      break;
    }
  }
  return word;
}

function preprocessAndTokenizeJS(text) {
  if (!text) return [];
  let cleaned = text.toLowerCase();
  cleaned = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s-]/g, " ");
  const words = cleaned.split(/\s+/);
  const tokens = [];
  for (const w of words) {
    if (w && !SPANISH_STOP_WORDS_SET.has(w) && w.length > 1) {
      tokens.push(stemSpanishJS(w));
    }
  }
  return tokens;
}

class JSVectorizer {
  constructor() {
    this.vocab = [];
    this.vocabMap = new Map();
    this.idf = {};
  }

  fit(documents) {
    const docTokens = documents.map(doc => getNGrams(preprocessAndTokenizeJS(doc)));
    const docCounts = {};
    const allTerms = new Set();

    docTokens.forEach(tokens => {
      const uniqueInDoc = new Set(tokens);
      uniqueInDoc.forEach(term => {
        allTerms.add(term);
        docCounts[term] = (docCounts[term] || 0) + 1;
      });
    });

    this.vocab = Array.from(allTerms);
    this.vocab.forEach((term, idx) => {
      this.vocabMap.set(term, idx);
      const df = docCounts[term] || 0;
      this.idf[term] = Math.log((1 + documents.length) / (1 + df)) + 1;
    });
  }

  transform(text) {
    const tokens = getNGrams(preprocessAndTokenizeJS(text));
    const vector = new Array(this.vocab.length).fill(0);
    const tf = {};
    
    tokens.forEach(t => {
      tf[t] = (tf[t] || 0) + 1;
    });
    
    tokens.forEach(t => {
      if (this.vocabMap.has(t)) {
        const idx = this.vocabMap.get(t);
        const sublinearTF = 1 + Math.log(tf[t]);
        vector[idx] = sublinearTF * this.idf[t];
      }
    });
    
    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (mag > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= mag;
      }
    }
    return vector;
  }
}

class JSMLP {
  constructor(inputDim, hiddenDim, outputDim) {
    this.inputDim = inputDim;
    this.hiddenDim = hiddenDim;
    this.outputDim = outputDim;

    const scale1 = Math.sqrt(2.0 / (inputDim + hiddenDim));
    this.W1 = Array.from({ length: inputDim }, () => 
      Array.from({ length: hiddenDim }, () => (Math.random() * 2 - 1) * scale1)
    );
    this.b1 = new Array(hiddenDim).fill(0);

    const scale2 = Math.sqrt(2.0 / (hiddenDim + outputDim));
    this.W2 = Array.from({ length: hiddenDim }, () => 
      Array.from({ length: outputDim }, () => (Math.random() * 2 - 1) * scale2)
    );
    this.b2 = new Array(outputDim).fill(0);
  }

  forward(x) {
    const h = new Array(this.hiddenDim).fill(0);
    for (let j = 0; j < this.hiddenDim; j++) {
      let sum = this.b1[j];
      for (let i = 0; i < this.inputDim; i++) {
        sum += x[i] * this.W1[i][j];
      }
      h[j] = Math.max(0, sum);
    }

    const logits = new Array(this.outputDim).fill(0);
    let maxLogit = -Infinity;
    for (let k = 0; k < this.outputDim; k++) {
      let sum = this.b2[k];
      for (let j = 0; j < this.hiddenDim; j++) {
        sum += h[j] * this.W2[j][k];
      }
      logits[k] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    const exps = logits.map(l => Math.exp(l - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map(e => e / sumExps);

    return { h, probs };
  }

  trainBatch(X, y, epochs = 150, lr = 0.2) {
    const history = [];
    const logs = [
      "[INFO] Conexión fallida con el backend. Levantando Neural Engine local en JS...",
      `[INFO] Cargando dataset: ${X.length} frases etiquetadas...`,
      "[INFO] Iniciando entrenamiento de red neuronal local (MLP en navegador)..."
    ];

    const classesCount = this.outputDim;
    const N = X.length;

    for (let epoch = 1; epoch <= epochs; epoch++) {
      let lossSum = 0;
      let correct = 0;

      for (let n = 0; n < N; n++) {
        const x = X[n];
        const targetClass = y[n];

        const { h, probs } = this.forward(x);
        lossSum -= Math.log(Math.max(probs[targetClass], 1e-15));

        let maxProbIdx = 0;
        for (let k = 1; k < classesCount; k++) {
          if (probs[k] > probs[maxProbIdx]) {
            maxProbIdx = k;
          }
        }
        if (maxProbIdx === targetClass) {
          correct++;
        }

        const dLogits = [...probs];
        dLogits[targetClass] -= 1.0;

        const dW2 = Array.from({ length: this.hiddenDim }, () => new Array(classesCount).fill(0));
        const db2 = [...dLogits];
        for (let j = 0; j < this.hiddenDim; j++) {
          for (let k = 0; k < classesCount; k++) {
            dW2[j][k] = h[j] * dLogits[k];
          }
        }

        const dh = new Array(this.hiddenDim).fill(0);
        for (let j = 0; j < this.hiddenDim; j++) {
          let sum = 0;
          for (let k = 0; k < classesCount; k++) {
            sum += dLogits[k] * this.W2[j][k];
          }
          dh[j] = h[j] > 0 ? sum : 0;
        }

        const dW1 = Array.from({ length: this.inputDim }, () => new Array(this.hiddenDim).fill(0));
        const db1 = [...dh];
        for (let i = 0; i < this.inputDim; i++) {
          for (let j = 0; j < this.hiddenDim; j++) {
            dW1[i][j] = x[i] * dh[j];
          }
        }

        // Weight updates
        for (let j = 0; j < this.hiddenDim; j++) {
          for (let k = 0; k < classesCount; k++) {
            this.W2[j][k] -= lr * dW2[j][k];
          }
        }
        for (let k = 0; k < classesCount; k++) {
          this.b2[k] -= lr * db2[k];
        }

        for (let i = 0; i < this.inputDim; i++) {
          for (let j = 0; j < this.hiddenDim; j++) {
            this.W1[i][j] -= lr * dW1[i][j];
          }
        }
        for (let j = 0; j < this.hiddenDim; j++) {
          this.b1[j] -= lr * db1[j];
        }
      }

      const loss = lossSum / N;
      const accuracy = correct / N;

      history.push({
        epoch,
        loss,
        accuracy
      });

      if (epoch === 1 || epoch % 30 === 0 || epoch === epochs) {
        logs.push(`[ÉPOCA ${epoch}/${epochs}] Pérdida: ${loss.toFixed(4)} | Precisión: ${(accuracy * 100).toFixed(1)}%`);
      }
    }

    logs.push("[INFO] ¡Entrenamiento completo! Red Neuronal local lista en el navegador.");
    return { history, logs };
  }
}

function parsePromptJS(prompt) {
  const lowercase = prompt.toLowerCase();
  let title = "Proyecto Tecnológico Integrador";
  
  const match = prompt.match(/"([^"]+)"/);
  if (match && match[1]) {
    title = match[1].trim();
  } else {
    const clean = prompt.replace(/(crea|genera|un|una|informe|sobre|documento|de|para|el |la |proyecto |sistema |auditoria |plataforma )/gi, "").trim();
    if (clean.length > 5 && clean.length < 60) {
      title = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
  }
  
  let institution = "Instituto de Educación Superior y Tecnológica";
  if (lowercase.includes("universidad") || lowercase.includes("u. ")) {
    const matchInst = prompt.match(/(universidad\s+[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+)/i);
    if (matchInst && matchInst[1]) {
      institution = matchInst[1].trim();
    }
  }
  
  let authors = ["Ing. Residente / Consultor Técnico"];
  if (lowercase.includes("autor") || lowercase.includes("integrantes") || lowercase.includes("por ")) {
    const parts = prompt.split(/(?:por|autor|integrantes|creado por)\s+/i);
    if (parts.length > 1) {
      const authorList = parts[1].split(/(?:y|,)/).map(a => a.trim()).filter(a => a.length > 2);
      if (authorList.length > 0) {
        authors = authorList.slice(0, 4);
      }
    }
  }
  
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
  
  return { title, institution, authors, advisor, date: dateStr, place: "Quito, Ecuador" };
}

export function generateLocalContentJS(prompt, type, predictionResult, reportType = 'tecnico', presentationStyle = 'informe', scientificPapers = [], wikipediaData = []) {
  const metadata = parsePromptJS(prompt);
  const title = metadata.title;
  const institution = metadata.institution;
  const authors = metadata.authors;
  const advisor = metadata.advisor;
  const date = metadata.date;

  const lowercasePrompt = prompt.toLowerCase();
  const detectedTech = [];
  if (/postgres|mysql|mongodb|sqlite|sql|base de datos|db/i.test(lowercasePrompt)) detectedTech.push("database");
  if (/docker|kubernetes|cicd|devops|contenedor/i.test(lowercasePrompt)) detectedTech.push("docker");
  if (/seguridad|ciberseguridad|cifrado|ssl|tls|firewall|vpn/i.test(lowercasePrompt)) detectedTech.push("security");
  if (/react|vue|angular|frontend|interfaz/i.test(lowercasePrompt)) detectedTech.push("frontend");
  if (/node|express|fastapi|django|python|backend|api/i.test(lowercasePrompt)) detectedTech.push("backend");
  if (/sensor|iot|esp32|arduino|riego|dispositivo|bomba|valvula/i.test(lowercasePrompt)) detectedTech.push("iot");

  let tools = "Librerías de desarrollo, IDEs, Servidores Cloud";
  if (detectedTech.length > 0) {
    const techNameMap = {
      database: "PostgreSQL RDBMS",
      docker: "Contenedores Docker",
      security: "SSL y Firewall",
      frontend: "React JS",
      backend: "FastAPI REST API",
      iot: "ESP32 con Sensores"
    };
    tools = detectedTech.map(t => techNameMap[t]).join(", ");
  }

  // --- REPORT ---
  if (type === 'report' || type === 'docx' || type === 'pdf') {
    return {
      title: title.toUpperCase(),
      type: "report",
      institution,
      authors: authors.join(", "),
      course: "Tercero BGU",
      advisor,
      date: "2025 - 2026",
      primeraParte: {
        introduccion: `El presente estudio detalla la estructuración e implementación de un prototipo enfocado en "${title}". Esta iniciativa busca resolver problemas operacionales mediante tecnología moderna y automatización de procesos clave. En entornos profesionales, este diseño aporta eficiencia y control de variables críticas.`,
        antecedente: `Históricamente, los sistemas de gestión en esta área se realizaban de forma manual. Recientemente, con la popularización del Internet de las Cosas y de frameworks ágiles, se abren nuevas oportunidades de optimización y reducción de costes operacionales.`,
        definicionProblema: `Se ha detectado una carencia de herramientas integradas y eficientes para controlar y monitorear los datos en tiempo real. Los retrasos en la respuesta manual y la falta de registros históricos fiables merman la productividad.`,
        justificacion: `La justificación de este proyecto radica en la necesidad crítica de optimizar los flujos de trabajo actuales. La automatización propuesta no solo reduce errores de origen humano, sino que provee una infraestructura escalable.`,
        objetivos: {
          general: `Desarrollar e implementar un sistema de control y monitoreo adaptativo para "${title}".`,
          especificos: [
            "Analizar los requerimientos técnicos y especificar la arquitectura lógica del sistema.",
            "Desarrollar la interfaz visual interactiva y los módulos lógicos de comunicación.",
            "Validar la viabilidad y estabilidad operativa del prototipo final mediante pruebas de esfuerzo."
          ]
        }
      },
      segundaParte: {
        marcoConceptual: `Las bases teóricas de este diseño residen en la arquitectura de microservicios y protocolos de comunicación seguros. La transferencia y persistencia de información en la nube garantizan la accesibilidad global y la integridad de los datos.`,
        marcoMetodologico: `La metodología de desarrollo empleada comprende el diseño conceptual, la fase de prototipado rápido, y pruebas iterativas de control de calidad. Las tecnologías clave incorporadas son: ${tools}.`,
        resultadosObtenidos: `El prototipo final demostró alta resiliencia y estabilidad. Durante las pruebas de simulación y control se observó un funcionamiento fluido en el traspaso de información, con una disponibilidad del sistema superior al 99.2%.`,
        analisisResultados: `Al contrastar el sistema automatizado con los métodos manuales convencionales, se registró una reducción del 40% en los tiempos de ejecución de las tareas, validando plenamente el retorno de inversión técnica.`
      },
      terceraParte: {
        conclusiones: [
          "El sistema modular desarrollado para el proyecto cumple plenamente con los requerimientos de diseño establecidos.",
          "La integración de las tecnologías seleccionadas optimizó el consumo de recursos y la rapidez del sistema.",
          "Las pruebas funcionales confirman la viabilidad técnica y facilidad de mantenimiento de la solución."
        ],
        recomendaciones: [
          "Planificar auditorías de seguridad periódicas y mantener backups de la base de datos.",
          "Capacitar a los operadores finales en el uso del panel interactivo para maximizar la adopción de la herramienta.",
          "Explorar la adición de algoritmos de analítica predictiva en futuras iteraciones."
        ]
      },
      cuartaParte: {
        referencias: [
          "Gómez, R. (2025). Manual de Sistemas Inteligentes. Editorial Tecnos.",
          "Sánchez, M. (2024). Desarrollo Ágil e IoT. Journal de Ingeniería Avanzada, 10(2), 15-28."
        ],
        anexos: "Anexo A: Diagramas conceptuales de arquitectura de red.\nAnexo B: Presupuesto y cotizaciones de componentes."
      }
    };
  }

  // --- PRESENTATION ---
  if (type === 'presentation' || type === 'pptx') {
    return {
      title,
      type: "presentation",
      members: authors.join(", "),
      institution,
      date,
      slides: [
        { num: 1, title: "Portada", content: `Título: ${title}\nIntegrantes: ${authors.join(", ")}\nInstitución: ${institution}\nFecha: ${date}` },
        { num: 2, title: "Introducción", content: `Contexto: Implementación de soluciones eficientes para el problema seleccionado.\nObjetivo: Agilizar el flujo de información y control.` },
        { num: 3, title: "Problema & Solución", content: `Reto: Procesos manuales propensos a errores y demoras operacionales.\nSolución: Prototipo tecnológico modular con telemetría en tiempo real.` },
        { num: 4, title: "Metodología", content: `Fases: Planificación, Desarrollo de Software/Hardware, y Pruebas Unitarias.\nHerramientas principales: ${tools}` },
        { num: 5, title: "Resultados del Proyecto", content: `Logro A: Reducción del tiempo de respuesta del sistema.\nLogro B: Conectividad estable y monitoreo centralizado continuo.` },
        { num: 6, title: "Conclusiones", content: `1. Viabilidad técnica demostrada.\n2. Estabilidad de los componentes del sistema.\n3. Plataforma lista para futuras expansiones.` }
      ]
    };
  }

  // --- SPREADSHEET ---
  if (type === 'spreadsheet' || type === 'xlsx') {
    const budgetRows = [];
    if (detectedTech.includes("iot")) {
      budgetRows.push(["Sensores y módulos de telemetría IoT", 4, 25.00]);
      budgetRows.push(["Placa microcontroladora (ESP32)", 2, 18.00]);
      budgetRows.push(["Actuadores mecánicos y reles de potencia", 2, 10.00]);
    }
    if (detectedTech.includes("database")) {
      budgetRows.push(["Hosting e instancia de Base de datos SQL (Meses)", 3, 20.00]);
    }
    if (detectedTech.includes("security")) {
      budgetRows.push(["Certificado SSL/TLS y Firewall perimetral", 1, 75.00]);
    }
    if (budgetRows.length === 0) {
      budgetRows.push(["Servidor VPS para producción (Meses)", 3, 30.00]);
      budgetRows.push(["Licencias de software de desarrollo", 1, 100.00]);
    }
    budgetRows.push(["Mano de obra (Desarrollador de software)", 1, 900.00]);

    const xlsxRows = [];
    let totalVal = 0;
    budgetRows.forEach(r => {
      const subtotal = r[1] * r[2];
      totalVal += subtotal;
      xlsxRows.push([r[0], r[1], r[2], subtotal]);
    });

    const cronoRows = [
      ["Análisis inicial de requerimientos", "2026-06-01", "2026-06-07", authors[0], "Completado"],
      ["Diseño técnico de arquitectura", "2026-06-08", "2026-06-15", authors[0], "Completado"],
      ["Desarrollo y codificación de módulos", "2026-06-16", "2026-07-15", authors[0], "En Progreso"],
      ["Pruebas integrales y corrección", "2026-07-16", "2026-07-31", authors[0], "Pendiente"]
    ];

    return {
      title,
      type: "spreadsheet",
      members: authors.join(", "),
      date,
      hoja1: { titulo: "PORTADA", proyecto: title, integrantes: authors, fecha: date, institucion: institution },
      hoja2: { titulo: "Cronograma", headers: ["Actividad", "Inicio", "Fin", "Responsable", "Estado"], rows: cronoRows },
      hoja3: {
        titulo: "Presupuesto",
        headers: ["Recurso", "Cantidad", "Costo Unitario ($)", "Total ($)"],
        rows: xlsxRows,
        formulas: {
          labelCell: `C${xlsxRows.length + 2}`,
          label: "Total General",
          totalCell: `D${xlsxRows.length + 2}`,
          value: totalVal
        }
      },
      hoja4: {
        titulo: "Resultados",
        headers: ["Indicador", "Valor Objetivo", "Valor Logrado"],
        rows: [
          ["Eficiencia Operativa", "30.0%", "35.0%"],
          ["Disponibilidad de Red", "99.0%", "99.4%"],
          ["Tasa de error lógico", "< 1.5%", "0.5%"]
        ]
      }
    };
  }

  // --- OFICIO SOLICITUD (petition) ---
  if (type === 'petition') {
    return {
      title,
      type: "petition",
      encabezado: {
        logoText: "DEPARTAMENTO DE GESTIÓN INSTITUCIONAL",
        oficioNum: `Oficio N.º 512-SOLIC-${new Date().getFullYear()}`,
        lugarFecha: `Quito, ${date}`
      },
      destinatario: {
        tratamiento: "Señor/Señora",
        nombre: "Lcda. Directora del Departamento Académico",
        cargo: "Directora General de Planificación",
        institucion: institution,
        ciudad: "Quito"
      },
      asunto: `Solicitud de trámite para el proyecto "${title}"`,
      saludo: "Estimada Directora Académica:",
      cuerpoContexto: `Quien suscribe, ${authors[0]}, me dirijo a usted con el debido respeto para exponer el requerimiento formal de recursos y soporte para el desarrollo del proyecto.`,
      cuerpoAntecedentes: "En concordancia con los procesos estipulados para la coordinación científica y tecnológica interna, procedemos a detallar la justificación de esta petición administrativa.",
      cuerpoDesarrollo: `El motivo principal es la implementación del proyecto titulado "${title}". Solicitamos formalmente que su despacho preste la asesoría correspondiente para el despliegue del prototipo.`,
      peticion: [
        "Revisión y visto bueno del expediente técnico adjunto.",
        "Asignación de espacios y servidores de prueba para la fase piloto.",
        "Notificación de la resolución adoptada a los canales oficiales de contacto."
      ],
      despedida: "Sin otro particular de momento, me despido reiterándole mis sentimientos de alta consideración y estima.",
      firma: {
        nombre: authors[0],
        cargo: "Coordinador de Proyecto",
        cedula: "1700000000-0",
        institucion,
        ciudad: "Quito"
      },
      copias: ["Archivo General", "Secretaría Académica"],
      anexos: ["Copia de la propuesta del proyecto", "Presupuesto detallado de componentes"]
    };
  }

  // --- OFICIO RESPUESTA (response) ---
  if (type === 'response') {
    return {
      title,
      type: "response",
      encabezado: {
        logoText: "DIRECCIÓN GENERAL DE PLANIFICACIÓN",
        oficioNum: `Oficio N.º 513-RESP-${new Date().getFullYear()}`,
        lugarFecha: `Quito, ${date}`
      },
      destinatario: {
        tratamiento: "Señor/Señora",
        nombre: authors[0],
        cargo: "Coordinador de Proyecto",
        institucion: institution,
        ciudad: "Quito"
      },
      referenciaOficioPrevio: `Oficio N.º 512-SOLIC-${new Date().getFullYear()}`,
      asunto: `Respuesta a la comunicación referente a "${title}"`,
      saludo: `Estimado/a ${authors[0]}:`,
      cuerpoContexto: "En relación a su comunicación previa, mediante la cual eleva una solicitud formal de soporte institucional, me permito comunicarle la resolución adoptada por esta Dirección General:",
      cuerpoAntecedentes: `Que tras analizar detalladamente la viabilidad técnica y operativa del proyecto "${title}", y verificar el cumplimiento de los lineamientos internos, se procedió a emitir opinión favorable.`,
      cuerpoDesarrollo: "En consecuencia, y facultado en las atribuciones del departamento, le informo que la solicitud ha sido aprobada formalmente. Se autorizan los recursos de infraestructura web solicitados.",
      resolucionAdoptada: [
        "Aprobar la viabilidad del expediente en todos sus términos.",
        "Disponer al departamento de TI la provisión de las cuentas de hosting requeridas.",
        "Programar las reuniones de revisión periódicas en el cronograma institucional."
      ],
      despedida: "Reiterándole mi compromiso con el éxito de sus gestiones, me suscribo expresándole sentimientos de consideración distinguida.",
      firma: {
        nombre: advisor,
        cargo: "Director General de Planificación",
        cedula: "1799999999-9",
        institucion,
        ciudad: "Quito"
      },
      copias: ["Archivo General", "Departamento Técnico"],
      anexos: ["Informe de viabilidad de infraestructura"]
    };
  }

  return {};
}

// Clase puente para la Red Neuronal
export class NeuralClassifier {
  constructor() {
    this.classes = ["riego", "security", "ecommerce", "education", "health", "finance"];
    this.vocab = [];
    this.isTrained = false;
    this.jsVectorizer = null;
    this.jsModel = null;
  }

  async train() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/train_stats`);
      if (!response.ok) {
        throw new Error(`Error en el servidor al entrenar: ${response.statusText}`);
      }
      const data = await response.json();
      this.isTrained = true;
      return data;
    } catch (err) {
      console.warn("Conexión con el backend de Python fallida. Entrenando clasificador local en JS...", err);
      
      this.jsVectorizer = new JSVectorizer();
      const texts = TRAINING_DATASET.map(item => item.text);
      const labels = TRAINING_DATASET.map(item => item.label);
      
      this.jsVectorizer.fit(texts);
      const X = texts.map(t => this.jsVectorizer.transform(t));
      const y = labels.map(l => this.classes.indexOf(l));
      
      const inputDim = this.jsVectorizer.vocab.length;
      const hiddenDim = 24;
      const outputDim = this.classes.length;
      
      this.jsModel = new JSMLP(inputDim, hiddenDim, outputDim);
      const { history, logs } = this.jsModel.trainBatch(X, y, 150, 0.15);
      
      this.isTrained = true;
      return {
        vocabSize: inputDim,
        numClasses: outputDim,
        finalLoss: history[history.length - 1].loss,
        finalAccuracy: history[history.length - 1].accuracy,
        history: history,
        logs: logs
      };
    }
  }

  async predict(text) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text })
      });
      if (!response.ok) {
        throw new Error(`Error en el servidor al clasificar: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Backend predict fallido, usando clasificador local en JS...", err);
      
      if (!this.jsModel || !this.jsVectorizer) {
        await this.train();
      }
      
      const x = this.jsVectorizer.transform(text);
      const { probs } = this.jsModel.forward(x);
      
      let maxIdx = 0;
      for (let k = 1; k < probs.length; k++) {
        if (probs[k] > probs[maxIdx]) {
          maxIdx = k;
        }
      }
      
      const confidence = probs[maxIdx];
      const scores = {};
      this.classes.forEach((c, idx) => {
        scores[c] = probs[idx];
      });
      
      const category = confidence > 0.35 ? this.classes[maxIdx] : "general";
      return {
        category,
        confidence,
        scores
      };
    }
  }
}

// Delegación al backend con fallback en navegador
export async function generateLocalContent(prompt, type, predictionResult = null, reportType = 'tecnico', existingDoc = null, presentationStyle = 'informe', scientificPapers = [], wikipediaData = [], scientificSearch = true) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        docType: type,
        predictionResult,
        reportType,
        existingDoc,
        presentationStyle,
        scientificPapers,
        wikipediaData,
        scientificSearch
      })
    });
    if (!response.ok) {
      throw new Error(`Error de red al generar documento: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn("Error al generar contenido mediante Python backend. Usando motor local en JS...", err);
    return generateLocalContentJS(prompt, type, predictionResult, reportType, presentationStyle, scientificPapers, wikipediaData);
  }
}

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

// Reconstruir abstract a partir del inverted index de OpenAlex
function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return "";
  try {
    const words = [];
    Object.entries(invertedIndex).forEach(([word, positions]) => {
      positions.forEach(pos => {
        words[pos] = word;
      });
    });
    return words.filter(w => w !== undefined).join(" ").substring(0, 250) + "...";
  } catch {
    return "";
  }
}

// Función para buscar resúmenes de temas en Wikipedia (Internet, CORS-ready)
export async function fetchWikipediaSummary(query) {
  try {
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const searchResults = searchData.query?.search;
    if (!searchResults || searchResults.length === 0) return [];

    const pagesInfo = [];
    for (let i = 0; i < Math.min(searchResults.length, 2); i++) {
      const pageTitle = searchResults[i].title;
      const extractUrl = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
      const extractRes = await fetch(extractUrl);
      if (extractRes.ok) {
        const extractData = await extractRes.json();
        const pages = extractData.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== "-1" && pages[pageId].extract) {
            pagesInfo.push({
              title: pageTitle,
              extract: pages[pageId].extract
            });
          }
        }
      }
    }
    return pagesInfo;
  } catch (err) {
    console.error("Error fetching from Wikipedia:", err);
    return [];
  }
}

// Función para buscar artículos científicos reales en OpenAlex (Internet)
export async function fetchScientificPapers(query) {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=5`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("OpenAlex search failed:", response.status);
      return [];
    }
    const data = await response.json();
    if (!data || !data.results) return [];

    return data.results.map((work) => {
      let authorsStr = "Autor Desconocido";
      if (work.authorships && work.authorships.length > 0) {
        const authorNames = work.authorships.slice(0, 3).map(a => a.author?.display_name || "");
        if (work.authorships.length > 3) {
          authorsStr = `${authorNames.join(", ")} et al.`;
        } else if (authorNames.length === 2) {
          authorsStr = `${authorNames[0]} y ${authorNames[1]}`;
        } else {
          authorsStr = authorNames.join(", ");
        }
      }

      const sourceName = work.primary_location?.source?.display_name || "Journal or Conference proceedings";

      return {
        title: work.title || "Artículo Científico sin Título",
        authors: authorsStr,
        year: work.publication_year || new Date().getFullYear(),
        venue: sourceName,
        doi: work.doi || `https://openalex.org/${work.id.split('/').pop()}`,
        abstract: work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : ""
      };
    });
  } catch (err) {
    console.error("Error fetching from OpenAlex:", err);
    return [];
  }
}

// Función para interactuar con la API de Gemini Cloud (conservado opcionalmente)
export async function generateGeminiContent(prompt, docType, apiKey, customMetadataObj = {}, attachedFiles = [], reportType = 'tecnico', existingDoc = null, scientificPapers = [], wikipediaData = []) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  let schemaDescription = "";
  if (docType === 'report' || docType === 'docx' || docType === 'pdf') {
    let wordCounts = reportType === 'corto' ? {
      introduccion: "150 - 200 palabras",
      antecedente: "150 - 200 palabras",
      definicionProblema: "150 - 200 palabras",
      justificacion: "80 - 100 palabras",
      marcoConceptual: "250 - 300 palabras",
      marcoMetodologico: "200 - 250 palabras",
      resultadosObtenidos: "150 - 200 palabras",
      analisisResultados: "100 - 150 palabras"
    } : {
      introduccion: "500 - 700 palabras",
      antecedente: "500 - 700 palabras",
      definicionProblema: "500 - 700 palabras",
      justificacion: "250 - 350 palabras",
      marcoConceptual: "1500 - 2000 palabras",
      marcoMetodologico: "800 - 1000 palabras",
      resultadosObtenidos: "700 - 900 palabras",
      analisisResultados: "500 - 700 palabras"
    };

    schemaDescription = `Return a JSON object conforming to:
{
  "title": "TEMA EN MAYÚSCULAS",
  "type": "report",
  "institution": "Name of Institution",
  "authors": "Nombre y Apellido",
  "course": "Curso y Paralelo",
  "advisor": "Name of Advisor",
  "date": "2025 - 2026",
  "primeraParte": {
    "introduccion": "Introducción (${wordCounts.introduccion})",
    "antecedente": "Antecedente (${wordCounts.antecedente})",
    "definicionProblema": "Definición del problema (${wordCounts.definicionProblema})",
    "justificacion": "Justificación (${wordCounts.justificacion})",
    "objetivos": {
      "general": "Objetivo general",
      "especificos": ["Objetivo especifico 1", "Objetivo especifico 2"]
    }
  },
  "segundaParte": {
    "marcoConceptual": "Marco Conceptual (${wordCounts.marcoConceptual})",
    "marcoMetodologico": "Marco Metodológico (${wordCounts.marcoMetodologico})",
    "resultadosObtenidos": "Resultados (${wordCounts.resultadosObtenidos})",
    "analisisResultados": "Análisis (${wordCounts.analisisResultados})"
  },
  "terceraParte": {
    "conclusiones": ["Conclusión 1", "Conclusión 2"],
    "recomendaciones": ["Recomendación 1", "Recomendación 2"]
  },
  "cuartaParte": {
    "referencias": ["Referencia 1", "Referencia 2"],
    "anexos": "Detalle de anexos"
  }
}`;
  } else if (docType === 'presentation' || docType === 'pptx') {
    schemaDescription = `Return a JSON object:
{
  "title": "Title",
  "type": "presentation",
  "members": "Authors",
  "institution": "Institution",
  "date": "Date",
  "slides": [
    { "num": 1, "title": "Portada", "content": "Title: ...\\nIntegrantes: ..." },
    { "num": 2, "title": "Introducción", "content": "..." }
  ]
}`;
  } else if (docType === 'spreadsheet' || docType === 'xlsx') {
    schemaDescription = `Return a JSON object:
{
  "title": "Title",
  "type": "spreadsheet",
  "members": "Authors",
  "date": "Date",
  "hoja1": { "titulo": "PORTADA", "proyecto": "Title", "integrantes": ["Author"], "fecha": "Date", "institucion": "Institution" },
  "hoja2": { "titulo": "Cronograma", "headers": ["Actividad", "Inicio", "Fin", "Responsable", "Estado"], "rows": [["Act", "2025-01-01", "2025-01-10", "Author", "Completado"]] }
}`;
  }

  const promptText = `You are a document generator. Generate structured JSON for docType "${docType}" based on: "${prompt}".
Schema details: ${schemaDescription}
Output raw JSON only. All text must be in Spanish.`;

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) throw new Error("Gemini API request failed");
  const result = await response.json();
  const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(textResponse.trim());
}
