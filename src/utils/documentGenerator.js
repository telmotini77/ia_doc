/**
 * Módulo de generación de contenido estructurado mediante Machine Learning Local y exportación de archivos.
 * Contiene una Red Neuronal Artificial local para clasificación de texto y exportadores a Word, PDF, Excel y PowerPoint.
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  Table as DocxTable, 
  TableRow as DocxTableRow, 
  TableCell as DocxTableCell, 
  HeadingLevel, 
  AlignmentType, 
  WidthType 
} from 'docx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import pptxgen from 'pptxgenjs';
import * as XLSX from 'xlsx';

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

        // Forward Pass (Paso hacia adelante): z = xW + b
        const z = [...this.biases];
        for (let c = 0; c < numClasses; c++) {
          for (let i = 0; i < vocabSize; i++) {
            z[c] += x[i] * this.weights[i][c];
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
          for (let i = 0; i < vocabSize; i++) {
            if (x[i] > 0) {
              this.weights[i][c] -= lr * dz[c] * x[i];
            }
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

    // Forward pass
    const z = [...this.biases];
    for (let c = 0; c < numClasses; c++) {
      for (let i = 0; i < vocabSize; i++) {
        z[c] += x[i] * this.weights[i][c];
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

// Generador de Contenido Local Inteligente usando la predicción del modelo neuronal
export function generateLocalContent(prompt, type, predictionResult = null) {
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
    return {
      title,
      type: "report",
      institution,
      department: "Departamento de Innovación y Tecnología",
      authors: authors.join(", "),
      advisor,
      place,
      date,
      abstract: {
        resumen: `El presente trabajo detalla ${context.desc} En primer lugar, se analiza el contexto y la problemática actual para proponer objetivos medibles. Posteriormente, se describe el marco conceptual y los componentes clave del sistema. La metodología empleada detalla el diseño de pruebas paso a paso. Los resultados muestran la viabilidad técnica y económica de la propuesta, culminando en conclusiones operativas que guían las futuras mejoras del sistema desarrollado.`,
        abstract: `This paper presents ${context.desc.replace(/el /g, 'the ').replace(/diseño/g, 'design').replace(/de una/g, 'of a').replace(/sistema/g, 'system')}. First, the background and current issues are analyzed to propose measurable goals. Then, the conceptual framework and main components are described. The methodology provides step-by-step test designs. Results demonstrate the technical and economic feasibility, concluding with operational remarks for future enhancements of the system.`
      },
      introduccion: `${context.intro} Con esto, se busca mejorar la automatización, centralizar el monitoreo y recolectar datos de valor para el usuario. El alcance abarca desde el modelado conceptual hasta el despliegue del prototipo funcional, permitiendo evaluar de primera mano las limitaciones del proyecto. ${context.justificacion}`,
      objetivos: {
        general: `Desarrollar y evaluar ${context.desc}`,
        especificos: [
          "Analizar y seleccionar las herramientas técnicas idóneas para el cumplimiento de los requerimientos.",
          "Diseñar el esquema lógico y físico del sistema asegurando la modularidad y el bajo costo.",
          "Desplegar un prototipo funcional para verificar las tasas de error y la estabilidad general.",
          "Elaborar un informe técnico detallado de resultados y proponer un plan de escalabilidad."
        ]
      },
      marcoTeorico: `El marco conceptual de este proyecto abarca diversos temas tecnológicos. ${context.teoria} Adicionalmente, se consideran regulaciones locales sobre manejo de datos y eficiencia de recursos para asegurar la factibilidad legal y ambiental del proyecto propuesto.`,
      metodologia: {
        tipo: "Investigación experimental y desarrollo tecnológico aplicado.",
        herramientas: context.herramientas,
        materiales: "Hardware de prueba, servicios de nube, simuladores locales y documentación API.",
        procedimiento: context.procedimiento,
        fases: "Planificación -> Diseño -> Codificación/Construcción -> Pruebas de Estrés -> Evaluación Final"
      },
      desarrollo: `Durante la fase de implementación, se integraron los componentes siguiendo una arquitectura limpia. Se diseñaron diagramas de flujo del proceso y se mapearon las conexiones de bases de datos. A continuación se detallan las fases operativas más complejas y se exponen bloques de código clave configurados para el manejo de excepciones y control de flujos concurrentes.`,
      resultados: {
        descripcion: "Las pruebas preliminares arrojaron datos favorables sobre estabilidad y tiempo de respuesta.",
        tablaResultados: [
          { metrica: "Tiempo de Respuesta", sinProyecto: "45 seg (manual)", conProyecto: "1.2 seg (auto)", mejora: "97.3%" },
          { metrica: "Pérdida de Datos/Recurso", sinProyecto: "35% promedio", conProyecto: "3% controlado", mejora: "91.4%" },
          { metrica: "Horas Hombre Mensuales", sinProyecto: "80 horas", conProyecto: "6 horas", mejora: "92.5%" }
        ]
      },
      discusion: `Al interpretar los resultados, las ventajas son evidentes: mayor precisión y disminución de costos operativos. Sin embargo, existen limitaciones tales como la dependencia de conectividad de red local estable. Durante las pruebas se encontraron fallos en la latencia que fueron mitigados mediante políticas de reintento en el firmware.`,
      conclusiones: context.conclusiones,
      recomendaciones: context.recomendaciones,
      referencias: [
        `[1] A. Gómez y R. Pérez, "Monitoreo Inteligente y Aplicaciones IoT", Revista Iberoamericana de Tecnología, vol. 12, no. 3, pp. 45-56, 2025.`,
        `[2] M. Smith, "Sistemas Automatizados y Optimización de Recursos en la Industria 4.0", Academic Press, Ed. 3, pp. 110-125, 2024.`,
        `[3] ISO/IEC Standard 27001, "Information technology - Security techniques - Information security management systems - Requirements", 2022.`
      ],
      anexos: "Anexo A: Código fuente y repositorio del proyecto.\nAnexo B: Diagrama de Conexiones e Interfaces Físicas."
    };
  }

  if (type === 'presentation' || type === 'pptx') {
    return {
      title,
      type: "presentation",
      members: authors.join(", "),
      institution,
      date,
      slides: [
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
      ]
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
// EXPORTADORES A ARCHIVOS FÍSICOS
// ==========================================

// 1. Exportador a Word (.docx)
export async function downloadDOCX(data, type, filename) {
  let docChildren = [];

  if (type === 'report' || type === 'docx' || type === 'pdf') {
    docChildren = [
      // Portada
      new Paragraph({ text: data.institution.toUpperCase(), heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: data.department || "DEPARTAMENTO DE TECNOLOGÍA E INNOVACIÓN", heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
      new Paragraph({ text: data.title.toUpperCase(), heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "INFORME TÉCNICO DE INVESTIGACIÓN", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "", spacing: { before: 800 } }),
      new Paragraph({ text: `INTEGRANTES:\n${data.authors}`, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `DOCENTE / TUTOR:\n${data.advisor}`, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "", spacing: { before: 800 } }),
      new Paragraph({ text: `${data.place}, ${data.date}`, alignment: AlignmentType.CENTER }),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      
      // Resumen / Abstract
      new Paragraph({ text: "Resumen", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: data.abstract.resumen }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({ text: "Abstract", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: data.abstract.abstract }),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      
      // Introducción
      new Paragraph({ text: "1. Introducción", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: data.introduccion }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      // Objetivos
      new Paragraph({ text: "2. Objetivos", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "2.1. Objetivo General", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.objetivos.general }),
      new Paragraph({ text: "2.2. Objetivos Específicos", heading: HeadingLevel.HEADING_2 }),
      ...data.objetivos.especificos.map(obj => new Paragraph({ text: `• ${obj}` })),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      // Marco Teórico
      new Paragraph({ text: "3. Marco Teórico", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: data.marcoTeorico }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      // Metodología
      new Paragraph({ text: "4. Metodología", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: `Tipo de Investigación: ${data.metodologia.tipo}` }),
      new Paragraph({ text: `Herramientas: ${data.metodologia.herramientas}` }),
      new Paragraph({ text: `Materiales: ${data.metodologia.materiales}` }),
      new Paragraph({ text: `Fases: ${data.metodologia.fases}` }),
      new Paragraph({ text: "Procedimiento Detallado:", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.metodologia.procedimiento }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      // Desarrollo
      new Paragraph({ text: "5. Desarrollo", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: data.desarrollo }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      // Resultados
      new Paragraph({ text: "6. Resultados y Discusión", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: data.resultados.descripcion }),
      new Paragraph({ text: "", spacing: { after: 100 } }),
      
      new DocxTable({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new DocxTableRow({
            children: [
              new DocxTableCell({ children: [new Paragraph({ text: "Métrica", heading: HeadingLevel.HEADING_4 })], shading: { fill: "F3F4F6" } }),
              new DocxTableCell({ children: [new Paragraph({ text: "Sin Proyecto", heading: HeadingLevel.HEADING_4 })], shading: { fill: "F3F4F6" } }),
              new DocxTableCell({ children: [new Paragraph({ text: "Con Proyecto", heading: HeadingLevel.HEADING_4 })], shading: { fill: "F3F4F6" } }),
              new DocxTableCell({ children: [new Paragraph({ text: "Mejora", heading: HeadingLevel.HEADING_4 })], shading: { fill: "F3F4F6" } })
            ]
          }),
          ...data.resultados.tablaResultados.map(row => new DocxTableRow({
            children: [
              new DocxTableCell({ children: [new Paragraph({ text: row.metrica })] }),
              new DocxTableCell({ children: [new Paragraph({ text: row.sinProyecto })] }),
              new DocxTableCell({ children: [new Paragraph({ text: row.conProyecto })] }),
              new DocxTableCell({ children: [new Paragraph({ text: row.mejora })] })
            ]
          }))
        ]
      }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({ text: "7. Discusión", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.discusion }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      // Conclusiones
      new Paragraph({ text: "8. Conclusiones", heading: HeadingLevel.HEADING_1 }),
      ...data.conclusiones.map((c, i) => new Paragraph({ text: `${i + 1}. ${c}` })),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      new Paragraph({ text: "9. Recomendaciones", heading: HeadingLevel.HEADING_1 }),
      ...data.recomendaciones.map((r, i) => new Paragraph({ text: `${i + 1}. ${r}` })),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      new Paragraph({ text: "10. Referencias", heading: HeadingLevel.HEADING_1 }),
      ...data.referencias.map(ref => new Paragraph({ text: ref })),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      
      new Paragraph({ text: "Anexos", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: data.anexos })
    ];
  } else if (type === 'petition') {
    docChildren = [
      new Paragraph({ text: data.encabezado.logoText, heading: HeadingLevel.HEADING_5, alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: data.encabezado.oficioNum, heading: HeadingLevel.HEADING_3 }),
      new Paragraph({ text: data.encabezado.lugarFecha, alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: data.destinatario.nombre, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.destinatario.cargo }),
      new Paragraph({ text: data.destinatario.institucion }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: `ASUNTO: ${data.asunto}`, heading: HeadingLevel.HEADING_3 }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: data.saludo }),
      new Paragraph({ text: data.cuerpo }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: "Por lo expuesto, solicito cordialmente:", heading: HeadingLevel.HEADING_3 }),
      ...data.peticion.map(p => new Paragraph({ text: `- ${p}` })),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: data.despedida }),
      new Paragraph({ text: "", spacing: { before: 400 } }),
      new Paragraph({ text: "Atentamente,", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "____________________________________", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: data.firma.nombre, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: data.firma.cargo, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `C.I. ${data.firma.cedula}`, alignment: AlignmentType.CENTER }),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      new Paragraph({ text: "Anexos:", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.anexos })
    ];
  } else if (type === 'response') {
    docChildren = [
      new Paragraph({ text: data.encabezado.logoText, heading: HeadingLevel.HEADING_5, alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: data.encabezado.oficioNum, heading: HeadingLevel.HEADING_3 }),
      new Paragraph({ text: data.encabezado.lugarFecha, alignment: AlignmentType.RIGHT }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: data.destinatario.nombre, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.destinatario.cargo }),
      new Paragraph({ text: data.destinatario.institucion }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: `ASUNTO: ${data.asunto}`, heading: HeadingLevel.HEADING_3 }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: data.saludo }),
      new Paragraph({ text: data.cuerpo }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: data.conclusion, heading: HeadingLevel.HEADING_3 }),
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
      new Paragraph({ text: data.despedida }),
      new Paragraph({ text: "", spacing: { before: 400 } }),
      new Paragraph({ text: "Atentamente,", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "____________________________________", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: data.firma.nombre, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: data.firma.cargo, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: data.firma.institucion, alignment: AlignmentType.CENTER }),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      new Paragraph({ text: "Anexos:", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: data.anexos })
    ];
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${data.title.replace(/\s+/g, '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 2. Exportador a PDF (.pdf)
export function downloadPDF(data, type, filename) {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  if (type === 'report' || type === 'docx' || type === 'pdf') {
    // Portada
    doc.setFillColor(170, 59, 255);
    doc.rect(0, 0, 8, 297, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(80, 80, 80);
    doc.text(data.institution.toUpperCase(), 25, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(data.department || "DEPARTAMENTO DE TECNOLOGÍA E INNOVACIÓN", 25, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(8, 6, 13);
    const titleLines = doc.splitTextToSize(data.title.toUpperCase(), 160);
    doc.text(titleLines, 25, 90);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(120, 120, 120);
    doc.text("INFORME TÉCNICO DE INVESTIGACIÓN", 25, 125);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(8, 6, 13);
    doc.text("INTEGRANTES:", 25, 180);
    doc.setFont("helvetica", "normal");
    doc.text(data.authors, 25, 186);

    doc.setFont("helvetica", "bold");
    doc.text("DOCENTE / TUTOR:", 25, 205);
    doc.setFont("helvetica", "normal");
    doc.text(data.advisor, 25, 211);

    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(`${data.place}, ${data.date}`, 25, 260);

    // Resumen / Abstract
    doc.addPage();
    addPDFHeaderFooter(doc, data.title);
    let y = 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(170, 59, 255);
    doc.text("Resumen", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(50, 50, 50);
    let lines = doc.splitTextToSize(data.abstract.resumen, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 8;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(170, 59, 255);
    doc.text("Abstract", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.abstract.abstract, 170);
    doc.text(lines, 20, y);

    // Introducción
    doc.addPage();
    addPDFHeaderFooter(doc, data.title);
    y = 30;
    y = addPDFSection(doc, "1. Introducción", data.introduccion, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(170, 59, 255);
    doc.text("2. Objetivos", 20, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(50, 50, 50);
    doc.text("2.1. Objetivo General", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.objetivos.general, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 6;

    doc.setFont("helvetica", "bold");
    doc.text("2.2. Objetivos Específicos", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    data.objetivos.especificos.forEach(obj => {
      lines = doc.splitTextToSize(`• ${obj}`, 165);
      doc.text(lines, 24, y);
      y += (lines.length * 5.2) + 2;
    });

    // Marco Teórico & Metodología
    doc.addPage();
    addPDFHeaderFooter(doc, data.title);
    y = 30;
    y = addPDFSection(doc, "3. Marco Teórico", data.marcoTeorico, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(170, 59, 255);
    doc.text("4. Metodología", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    lines = doc.splitTextToSize(`Tipo de Investigación: ${data.metodologia.tipo}\n\nHerramientas: ${data.metodologia.herramientas}\n\nMateriales: ${data.metodologia.materiales}\n\nFases: ${data.metodologia.fases}`, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 6;

    doc.setFont("helvetica", "bold");
    doc.text("Procedimiento Detallado:", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.metodologia.procedimiento, 170);
    doc.text(lines, 20, y);

    // Desarrollo y Resultados
    doc.addPage();
    addPDFHeaderFooter(doc, data.title);
    y = 30;
    y = addPDFSection(doc, "5. Desarrollo del Proyecto", data.desarrollo, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(170, 59, 255);
    doc.text("6. Resultados y Discusión", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.resultados.descripcion, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 6;

    const tableBody = data.resultados.tablaResultados.map(row => [
      row.metrica,
      row.sinProyecto,
      row.conProyecto,
      row.mejora
    ]);

    doc.autoTable({
      startY: y,
      head: [['Métrica', 'Sin Proyecto', 'Con Proyecto', 'Mejora']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [170, 59, 255], textColor: [255, 255, 255] },
      styles: { fontSize: 9.5, cellPadding: 2.5 },
      margin: { left: 20, right: 20 }
    });

    // Discusión y Conclusiones
    doc.addPage();
    addPDFHeaderFooter(doc, data.title);
    y = 30;
    y = addPDFSection(doc, "7. Discusión de Resultados", data.discusion, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(170, 59, 255);
    doc.text("8. Conclusiones", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    data.conclusiones.forEach((c, idx) => {
      lines = doc.splitTextToSize(`${idx + 1}. ${c}`, 170);
      doc.text(lines, 20, y);
      y += (lines.length * 5.2) + 3;
    });
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.text("9. Recomendaciones", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    data.recomendaciones.forEach((r, idx) => {
      lines = doc.splitTextToSize(`${idx + 1}. ${r}`, 170);
      doc.text(lines, 20, y);
      y += (lines.length * 5.2) + 3;
    });

    // Referencias
    doc.addPage();
    addPDFHeaderFooter(doc, data.title);
    y = 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(170, 59, 255);
    doc.text("10. Referencias Bibliográficas", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    data.referencias.forEach(ref => {
      lines = doc.splitTextToSize(ref, 170);
      doc.text(lines, 20, y);
      y += (lines.length * 5.2) + 3;
    });
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Anexos", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.anexos, 170);
    doc.text(lines, 20, y);

  } else if (type === 'petition') {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text(data.encabezado.logoText, 20, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(data.encabezado.oficioNum, 20, 35);
    doc.setFont("helvetica", "normal");
    doc.text(data.encabezado.lugarFecha, 130, 35);

    let y = 55;
    doc.setFont("helvetica", "bold");
    doc.text(data.destinatario.nombre, 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(data.destinatario.cargo, 20, y);
    y += 5;
    doc.text(data.destinatario.institucion, 20, y);

    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("ASUNTO:", 20, y);
    doc.text(data.asunto, 42, y);

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.text(data.saludo, 20, y);

    y += 8;
    let lines = doc.splitTextToSize(data.cuerpo, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 8;

    doc.setFont("helvetica", "bold");
    doc.text("Por lo expuesto, solicito cordialmente:", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    data.peticion.forEach(p => {
      lines = doc.splitTextToSize(`- ${p}`, 165);
      doc.text(lines, 25, y);
      y += (lines.length * 5.2) + 2;
    });

    y += 8;
    lines = doc.splitTextToSize(data.despedida, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 20;

    doc.text("Atentamente,", 20, y);
    y += 18;
    doc.line(20, y, 90, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(data.firma.nombre, 20, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(data.firma.cargo, 20, y);
    y += 4;
    doc.text(`C.I. ${data.firma.cedula}`, 20, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Anexos:", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.anexos, 170);
    doc.text(lines, 20, y);

  } else if (type === 'response') {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text(data.encabezado.logoText, 20, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(data.encabezado.oficioNum, 20, 35);
    doc.setFont("helvetica", "normal");
    doc.text(data.encabezado.lugarFecha, 130, 35);

    let y = 55;
    doc.setFont("helvetica", "bold");
    doc.text(data.destinatario.nombre, 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(data.destinatario.cargo, 20, y);
    y += 5;
    doc.text(data.destinatario.institucion, 20, y);

    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("ASUNTO:", 20, y);
    doc.text(data.asunto, 42, y);

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.text(data.saludo, 20, y);

    y += 8;
    let lines = doc.splitTextToSize(data.cuerpo, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 8;

    doc.setFont("helvetica", "bold");
    lines = doc.splitTextToSize(data.conclusion, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 12;

    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.despedida, 170);
    doc.text(lines, 20, y);
    y += (lines.length * 5.2) + 20;

    doc.text("Atentamente,", 20, y);
    y += 18;
    doc.line(20, y, 90, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(data.firma.nombre, 20, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(data.firma.cargo, 20, y);
    y += 4;
    doc.text(data.firma.institucion, 20, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Anexos:", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(data.anexos, 170);
    doc.text(lines, 20, y);
  }

  doc.save(filename || `${data.title.replace(/\s+/g, '_')}.pdf`);
}

// 3. Exportador a Excel (.xlsx)
export function downloadXLSX(data, filename, selectedCharts = ['pie', 'bar', 'line']) {
  const wb = XLSX.utils.book_new();

  // Portada
  const portadaData = [
    ["PROYECTO:", data.hoja1.proyecto],
    ["INSTITUCIÓN:", data.hoja1.institucion],
    ["INTEGRANTES:", data.hoja1.integrantes.join(", ")],
    ["FECHA:", data.hoja1.fecha],
    ["GENERADOR:", "DocuGenius Neural AI Engine"]
  ];
  const ws1 = XLSX.utils.aoa_to_sheet([
    [data.hoja1.titulo.toUpperCase()],
    [],
    ...portadaData
  ]);
  ws1["!cols"] = [{ wch: 18 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Portada");

  // Cronograma
  const ws2 = XLSX.utils.aoa_to_sheet([
    [data.hoja2.titulo.toUpperCase()],
    [],
    data.hoja2.headers,
    ...data.hoja2.rows
  ]);
  ws2["!cols"] = [{ wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Cronograma");

  // Presupuesto
  const budgetRows = data.hoja3.rows.map((row, idx) => {
    const rowNum = idx + 4;
    return [
      row[0],
      row[1],
      row[2],
      { t: 'n', f: `B${rowNum}*C${rowNum}` }
    ];
  });

  const totalRowNum = data.hoja3.rows.length + 4;
  const budgetSheetData = [
    [data.hoja3.titulo.toUpperCase()],
    [],
    data.hoja3.headers,
    ...budgetRows,
    [data.hoja3.formulas.label, "", "", { t: 'n', f: `SUM(D4:D${totalRowNum - 1})` }]
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(budgetSheetData);
  ws3["!cols"] = [{ wch: 35 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Presupuesto");

  // Resultados
  const ws4 = XLSX.utils.aoa_to_sheet([
    [data.hoja4.titulo.toUpperCase()],
    [],
    data.hoja4.headers,
    ...data.hoja4.rows
  ]);
  ws4["!cols"] = [{ wch: 35 }, { wch: 20 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Resultados");

  // Estadísticas
  const ws5 = XLSX.utils.aoa_to_sheet([
    [data.hoja5.titulo.toUpperCase()],
    [],
    data.hoja5.headers,
    ...data.hoja5.rows
  ]);
  ws5["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws5, "Estadísticas");

  // Gráficos (Datos con Instrucciones Dinámicas)
  const chartTypesMapping = {
    'pie': "Diagrama de Pastel (Torta)",
    'bar': "Gráfico de Barras (Comparativo)",
    'line': "Gráfico de Líneas (Tendencias)"
  };

  const tableStartRow = 3 + 2 + (selectedCharts.length * 2) + 2; 
  const rangeLabels = `A${tableStartRow}:A${tableStartRow + data.hoja6.rows.length}`;
  const rangeMeta = `B${tableStartRow}:B${tableStartRow + data.hoja6.rows.length}`;
  const rangeReal = `C${tableStartRow}:C${tableStartRow + data.hoja6.rows.length}`;
  const rangeAll = `A${tableStartRow - 1}:C${tableStartRow + data.hoja6.rows.length - 1}`;

  const chartInstructions = [
    ["CONFIGURACIÓN DE GRÁFICOS SOLICITADOS"],
    ["Los siguientes tipos de gráficos se configuraron para esta tabla:"],
  ];

  selectedCharts.forEach((type, index) => {
    const name = chartTypesMapping[type] || type;
    chartInstructions.push([`${index + 1}. ${name}`]);
    if (type === 'pie') {
      chartInstructions.push([`   -> Instrucción: Seleccione la columna de Categorías (${rangeLabels}) y la de Real (${rangeReal}). Vaya a la barra superior en 'Insertar' > 'Gráfico Circular / Pastel'.`]);
    } else if (type === 'bar') {
      chartInstructions.push([`   -> Instrucción: Seleccione todo el rango de datos (${rangeAll}). Vaya a la barra superior en 'Insertar' > 'Gráfico de Columnas o Barras agrupadas'.`]);
    } else if (type === 'line') {
      chartInstructions.push([`   -> Instrucción: Seleccione todo el rango de datos (${rangeAll}). Vaya a la barra superior en 'Insertar' > 'Gráfico de Líneas con marcadores'.`]);
    }
  });

  chartInstructions.push([]);
  chartInstructions.push(["TABLA DE DATOS PARA LOS GRÁFICOS"]);

  const ws6 = XLSX.utils.aoa_to_sheet([
    [data.hoja6.titulo.toUpperCase()],
    [],
    ...chartInstructions,
    data.hoja6.headers,
    ...data.hoja6.rows
  ]);
  ws6["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws6, "Datos Gráficos");

  // Evidencias
  const ws7 = XLSX.utils.aoa_to_sheet([
    [data.hoja7.titulo.toUpperCase()],
    [],
    data.hoja7.headers,
    ...data.hoja7.rows
  ]);
  ws7["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws7, "Evidencias");

  XLSX.writeFile(wb, filename || `${data.title.replace(/\s+/g, '_')}.xlsx`);
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

    // Detectar si la línea es un encabezado (ej: "Concepto: ...")
    const isHeaderLine = trimmed.includes(":") && !trimmed.startsWith("-") && !trimmed.startsWith("•") && !/^\d+\./.test(trimmed);
    
    // Detectar si la línea es un encabezado implícito (ej: una línea de texto seguida de viñetas en la siguiente línea)
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

// 4. Exportador a PowerPoint (.pptx)
export function downloadPPTX(data, filename) {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';

  const bgDark = { color: '15111E' };
  const textTitle = { x: 0.8, y: 1.4, w: 11.7, h: 2.2, fontSize: 34, bold: true, color: 'DDBBFF', fontFace: 'Trebuchet MS' };
  const textSubtitle = { x: 0.8, y: 3.8, w: 11.7, h: 2.0, fontSize: 16, color: 'A5A0B2', fontFace: 'Arial' };
  const textFooter = { x: 0.8, y: 6.3, w: 11.7, h: 0.4, fontSize: 9.5, color: '6B6675', fontFace: 'Arial' };

  // Portada
  let s1 = pptx.addSlide();
  s1.background = bgDark;
  
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: 'AA3BFF' } });
  s1.addText(data.title.toUpperCase(), textTitle);
  s1.addText(`INTEGRANTES:\n${data.members}\n\nINSTITUCIÓN:\n${data.institution}\n\nFECHA:\n${data.date}`, textSubtitle);
  s1.addText("DocuGenius Neural AI Presentation System", textFooter);

  // Slides restantes
  data.slides.forEach((slideData) => {
    if (slideData.num === 1) return;
    
    let s = pptx.addSlide();
    s.background = bgDark;
    
    // Encabezado
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.95, fill: { color: '20192B' } });
    s.addText(slideData.title, { x: 0.8, y: 0.2, w: 11.5, h: 0.6, fontSize: 22, bold: true, color: 'DDBBFF', fontFace: 'Trebuchet MS' });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.9, w: 13.3, h: 0.05, fill: { color: 'AA3BFF' } });
    
    const parsed = parseSlideText(slideData.content);

    if (parsed.type === 'table') {
      const lines = parsed.raw.split("\n").filter(l => l.trim().length > 0 && !l.includes("---"));
      if (lines.length > 1) {
        const headers = lines[0].split("|").map(h => h.trim());
        const rows = lines.slice(1).map(r => r.split("|").map(c => c.trim()));
        
        const tableData = [
          headers.map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: 'AA3BFF' }, align: 'center' } })),
          ...rows.map(row => row.map(c => ({ text: c, options: { color: 'E5E3EB', fill: { color: '20192B' } } })))
        ];
        
        s.addTable(tableData, { 
          x: 0.8, 
          y: 1.6, 
          w: 11.7, 
          colWidths: [3.5, 4.1, 4.1], 
          border: { type: 'solid', color: '4B3E61', size: 1 } 
        });
      }
    } else if (parsed.type === 'blocks') {
      const blocks = parsed.data;

      if (blocks.length === 2) {
        // Diseño de 2 Columnas (Left & Right Cards)
        const leftBlock = blocks[0];
        const rightBlock = blocks[1];

        // Tarjeta Izquierda
        s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.6, w: 5.6, h: 4.4, fill: { color: '20192B' }, line: { color: '4B3E61', width: 1 } });
        
        const leftLength = leftBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (leftBlock.title?.length || 0);
        const leftCount = leftBlock.bullets.length;
        let leftTitleSize = 18;
        let leftFontSize = 13;
        let leftLineSpacing = 20;

        if (leftLength > 300 || leftCount > 5) {
          leftTitleSize = 15;
          leftFontSize = 10.5;
          leftLineSpacing = 13;
        } else if (leftLength > 150 || leftCount > 3) {
          leftTitleSize = 16.5;
          leftFontSize = 11.5;
          leftLineSpacing = 16;
        }

        const leftTextPara = [];
        if (leftBlock.title) {
          leftTextPara.push({ text: leftBlock.title + "\n\n", options: { bold: true, color: 'DDBBFF', fontSize: leftTitleSize, fontFace: 'Trebuchet MS' } });
        }
        leftBlock.bullets.forEach((bullet, bIdx) => {
          const isLast = bIdx === leftBlock.bullets.length - 1;
          const isBullet = bullet.length > 2;
          leftTextPara.push({ 
            text: bullet + (isLast ? "" : "\n"), 
            options: { color: 'E5E3EB', fontSize: leftFontSize, fontFace: 'Arial', bullet: isBullet, lineSpacing: leftLineSpacing } 
          });
        });
        s.addText(leftTextPara, { x: 1.1, y: 1.8, w: 5.0, h: 4.0, valign: 'top' });

        // Tarjeta Derecha
        s.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 5.6, h: 4.4, fill: { color: '20192B' }, line: { color: '4B3E61', width: 1 } });
        
        const rightLength = rightBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (rightBlock.title?.length || 0);
        const rightCount = rightBlock.bullets.length;
        let rightTitleSize = 18;
        let rightFontSize = 13;
        let rightLineSpacing = 20;

        if (rightLength > 300 || rightCount > 5) {
          rightTitleSize = 15;
          rightFontSize = 10.5;
          rightLineSpacing = 13;
        } else if (rightLength > 150 || rightCount > 3) {
          rightTitleSize = 16.5;
          rightFontSize = 11.5;
          rightLineSpacing = 16;
        }

        const rightTextPara = [];
        if (rightBlock.title) {
          rightTextPara.push({ text: rightBlock.title + "\n\n", options: { bold: true, color: 'DDBBFF', fontSize: rightTitleSize, fontFace: 'Trebuchet MS' } });
        }
        rightBlock.bullets.forEach((bullet, bIdx) => {
          const isLast = bIdx === rightBlock.bullets.length - 1;
          const isBullet = bullet.length > 2;
          rightTextPara.push({ 
            text: bullet + (isLast ? "" : "\n"), 
            options: { color: 'E5E3EB', fontSize: rightFontSize, fontFace: 'Arial', bullet: isBullet, lineSpacing: rightLineSpacing } 
          });
        });
        s.addText(rightTextPara, { x: 7.1, y: 1.8, w: 5.0, h: 4.0, valign: 'top' });

      } else {
        // Diseño de Tarjeta Única Centrada
        s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.6, w: 11.7, h: 4.4, fill: { color: '20192B' }, line: { color: '4B3E61', width: 1 } });

        const mainBlock = blocks[0] || { title: "", bullets: [] };
        const mainLength = mainBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (mainBlock.title?.length || 0);
        const mainCount = mainBlock.bullets.length;
        let mainTitleSize = 18;
        let mainFontSize = 14;
        let mainLineSpacing = 22;

        if (mainLength > 450 || mainCount > 6) {
          mainTitleSize = 16;
          mainFontSize = 11.5;
          mainLineSpacing = 16;
        } else if (mainLength > 250 || mainCount > 4) {
          mainTitleSize = 17;
          mainFontSize = 12.5;
          mainLineSpacing = 18;
        }

        const textPara = [];

        if (mainBlock.title) {
          textPara.push({ text: mainBlock.title + "\n\n", options: { bold: true, color: 'DDBBFF', fontSize: mainTitleSize, fontFace: 'Trebuchet MS' } });
        }

        mainBlock.bullets.forEach((bullet, bIdx) => {
          const isLast = bIdx === mainBlock.bullets.length - 1;
          const useBullet = bullet.length > 2 && !bullet.includes("Contacto:");
          textPara.push({ 
            text: bullet + (isLast ? "" : "\n"), 
            options: { color: 'E5E3EB', fontSize: mainFontSize, fontFace: 'Arial', bullet: useBullet, lineSpacing: mainLineSpacing } 
          });
        });

        s.addText(textPara, { x: 1.1, y: 1.8, w: 11.1, h: 4.0, valign: 'top' });
      }
    }
    
    s.addText(`Slide ${slideData.num} / ${data.slides.length}`, textFooter);
  });

  pptx.writeFile({ fileName: filename || `${data.title.replace(/\s+/g, '_')}.pptx` });
}
