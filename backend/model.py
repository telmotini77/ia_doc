import re
import numpy as np
import unicodedata
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier

# List of Spanish stop words
SPANISH_STOP_WORDS = {
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "para", "con", "en", "y", "o", "a", "al", "sobre", 
    "su", "sus", "por", "que", "como", "esta", "este", "se", "bajo", "desde", "mi", "tu", "nos", "les", "os", "lo", "le",
    "un", "otra", "otro", "otros", "otras", "es", "son", "con", "una", "un", "unos", "unas", "de", "del", "al", "el", "la"
}

def spanish_stemmer(word):
    if not word or len(word) <= 3:
        return word
    
    # Remove common plurals and suffixes in Spanish
    # Order from longest to shortest to avoid partial stripping of shorter suffixes
    suffixes = [
        "abilidad", "abilidades", "amiento", "amientos", "aciones", "acion", 
        "amente", "mente", "idades", "idad", "ismos", "ismo", "adores", "ador", 
        "adoras", "adora", "tivos", "tivo", "tivas", "tiva", "ados", "ado", 
        "adas", "ada", "idos", "ido", "idas", "ida", "ando", "iendo", 
        "ieros", "iero", "ieras", "era", "ar", "er", "ir", "as", "es", "os", "o", "a", "e"
    ]
    
    for suffix in suffixes:
        if word.endswith(suffix):
            # Keep at least 3 characters of the root
            if len(word) - len(suffix) >= 3:
                return word[:-len(suffix)]
            break
    return word

def spanish_preprocessor(text):
    if not text:
        return ""
    # Convert to lowercase
    text = text.lower()
    # Normalize unicode to remove accents/diacritics (e.g. á -> a, ñ -> ñ)
    normalized = unicodedata.normalize('NFD', text)
    text = "".join(c for c in normalized if unicodedata.category(c) != 'Mn')
    # Replace non-alphanumeric with spaces
    text = re.sub(r'[^a-zA-Z0-9\s-]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def spanish_tokenizer(text):
    # Splits by spaces, filters out stop words/short terms, and stems
    words = text.split()
    return [spanish_stemmer(w) for w in words if w not in SPANISH_STOP_WORDS and len(w) > 1]

TRAINING_DATASET = [
  # --- Riego e IoT (riego) ---
  { "text": "sistema de riego automatizado con sensores de humedad de suelo y esp32", "label": "riego" },
  { "text": "riego por goteo inteligente usando sensores de lluvia y microcontroladores", "label": "riego" },
  { "text": "monitoreo de humedad de suelo y temperatura en cultivos agricolas iot", "label": "riego" },
  { "text": "automatizacion de riego para invernadero utilizando reles y electrovalvulas", "label": "riego" },
  { "text": "sensores capacitivos de humedad y control autonomo de agua para plantas", "label": "riego" },
  { "text": "riego inteligente con conectividad wifi protocolo mqtt para agricultura", "label": "riego" },
  { "text": "riego automatico por goteo en plantaciones de hortalizas y sensores", "label": "riego" },
  { "text": "plataforma iot de riego de precision con sensores de humedad y flujo", "label": "riego" },
  { "text": "diseño de sistema de riego con esp32 y valvula selenoide automatizada", "label": "riego" },
  { "text": "monitoreo de cultivos con sensores de humedad de suelo y control de aspersores", "label": "riego" },
  { "text": "riego inteligente hidroponico automatizado por microcontrolador arduino", "label": "riego" },
  { "text": "control de humedad de suelo y temperatura ambiental en invernaderos de tomate", "label": "riego" },
  { "text": "sistema automatico de bombeo de agua con sensor ultrasonico y reles iot", "label": "riego" },
  { "text": "riego automatizado con sensores de flujo de agua y telemetria lora", "label": "riego" },
  { "text": "plataforma de riego inteligente con sensores capacitivos y reles wifi", "label": "riego" },

  # --- Ciberseguridad y Redes (security) ---
  { "text": "auditoria de ciberseguridad sobre la infraestructura de red corporativa nmap", "label": "security" },
  { "text": "analisis de vulnerabilidades con metasploit y owasp zap en servidores web", "label": "security" },
  { "text": "implementacion de cortafuegos pfsense y sistema ips ids wazuh para red", "label": "security" },
  { "text": "fortalecimiento de seguridad de redes locales y politicas de contraseñas", "label": "security" },
  { "text": "pentesting de caja negra y escaneo de puertos tls cifrado de datos", "label": "security" },
  { "text": "politicas de seguridad informatica e implementacion de vpn con 2fa", "label": "security" },
  { "text": "analisis de trafico con wireshark y mitigacion de ataques de denegacion", "label": "security" },
  { "text": "auditoria de redes y proteccion contra ransomware y fugas de datos", "label": "security" },
  { "text": "seguridad informatica y prevencion de ataques de inyeccion sql owasp", "label": "security" },
  { "text": "analisis de vulnerabilidad en servidores web y cifrado ssl tls", "label": "security" },
  { "text": "configuracion de cortafuegos perimetral pfsense vpn ipsec de alta seguridad", "label": "security" },
  { "text": "auditoria de seguridad e implementacion de politicas de accesos mfa", "label": "security" },
  { "text": "deteccion de intrusos con snort y monitoreo de logs con wazuh", "label": "security" },
  { "text": "pentest de caja blanca en aplicaciones web y mitigacion de ataques csrf", "label": "security" },
  { "text": "analisis forense digital y mitigacion de ataques ddos ransomware", "label": "security" },

  # --- E-Commerce y Ventas (ecommerce) ---
  { "text": "plataforma de comercio electronico con carrito de compras pasarela stripe", "label": "ecommerce" },
  { "text": "tienda digital de productos locales con transacciones de pago seguras", "label": "ecommerce" },
  { "text": "sistema de facturacion e inventario para ventas online e-commerce", "label": "ecommerce" },
  { "text": "pagina web de compras y carrito interactivo pasarela de pago tokenizada", "label": "ecommerce" },
  { "text": "tienda virtual de ropa y catalogo de productos con checkout en linea", "label": "ecommerce" },
  { "text": "integracion de pagos online stripe paypal en plataforma e-commerce react", "label": "ecommerce" },
  { "text": "portal de ventas por internet con carrito y gestion de despachos", "label": "ecommerce" },
  { "text": "aplicacion de mercado virtual y control de stock contabilidad de ventas", "label": "ecommerce" },
  { "text": "desarrollo de tienda online con carrito e integracion con pasarela mercadopago", "label": "ecommerce" },
  { "text": "sistema de ventas e-commerce con facturacion integrada y stock en tiempo real", "label": "ecommerce" },
  { "text": "tienda virtual interactiva de repuestos con pasarela stripe y checkout seguro", "label": "ecommerce" },
  { "text": "plataforma de comercio electronico b2b de calzado catalogo interactivo", "label": "ecommerce" },
  { "text": "tienda digital con carrito de compras integrado y procesamiento de pagos paypal", "label": "ecommerce" },
  { "text": "comercio electronico para pymes gestion de despachos y pedidos en linea", "label": "ecommerce" },
  { "text": "aplicacion web de ventas por internet checkout optimizado stripe", "label": "ecommerce" },

  # --- Educacion y E-Learning (education) ---
  { "text": "plataforma de de educacion virtual lms aula inteligente adaptativa react", "label": "education" },
  { "text": "sistema de de aprendizaje personalizado y cursos virtuales formato scorm", "label": "education" },
  { "text": "aula virtual interactiva para escuelas tareas y calificaciones escolares", "label": "education" },
  { "text": "plataforma e-learning con recomendaciones academicas para estudiantes", "label": "education" },
  { "text": "software de de gestion de examenes en linea y matriculacion de alumnos", "label": "education" },
  { "text": "sistema adaptativo para colegios con seguimiento del rendimiento escolar", "label": "education" },
  { "text": "portal de de de capacitacion docente y foros de de discusion estudiantil", "label": "education" },
  { "text": "aula interactiva de de de educacion a distancia con videos y cuestionarios", "label": "education" },
  { "text": "desarrollo de aula virtual interactiva moodle y matriculacion de estudiantes", "label": "education" },
  { "text": "plataforma lms de educacion virtual adaptativa con seguimiento academico", "label": "education" },
  { "text": "sistema e-learning de aprendizaje y examenes en linea automatizados", "label": "education" },
  { "text": "portal de cursos escolares interactivo calificaciones y foros virtuales", "label": "education" },
  { "text": "capacitacion virtual para docentes y material didactico interactivo scorm", "label": "education" },
  { "text": "aula digital interactiva para clases virtuales y gestion de tareas", "label": "education" },
  { "text": "plataforma para colegios y universidades con foros de debate estudiantil", "label": "education" },

  # --- Salud y Telemedicina (health) ---
  { "text": "sistema de de de telemedicina y monitoreo de de pacientes clinicos webrtc", "label": "health" },
  { "text": "expediente clinico digital historias clinicas bajo estandar hl7", "label": "health" },
  { "text": "monitoreo de de signos vitales con sensores biomedicos iot alertas medicas", "label": "health" },
  { "text": "plataforma de de teleconsulta medica receta electronica firma digital", "label": "health" },
  { "text": "gestion hospitalaria base de de datos de de de pacientes cronicos clinica", "label": "health" },
  { "text": "monitoreo de de ritmo cardiaco a distancia webrtc videoconsulta medica", "label": "health" },
  { "text": "aplicacion de de telemedicina con turnos medicos y proteccion hipaa", "label": "health" },
  { "text": "sistema de de monitoreo de de de salud remoto para personas de de la tercera edad", "label": "health" },
  { "text": "plataforma de teleconsulta medica con videollamada webrtc e historial clinico", "label": "health" },
  { "text": "expediente medico digital para clinicas y recetas medicas firmadas digitalmente", "label": "health" },
  { "text": "monitoreo clinico remoto de signos vitales ritmo cardiaco y oximetro iot", "label": "health" },
  { "text": "historia clinica digital de pacientes bajo normas de seguridad hipaa", "label": "health" },
  { "text": "sistema de gestion de turnos medicos telemedicina y alertas al paciente", "label": "health" },
  { "text": "plataforma hospitalaria de monitoreo cardiaco remoto y salud preventiva", "label": "health" },
  { "text": "aplicacion de teleconsulta e integracion de farmacia y recetas electronicas", "label": "health" },

  # --- Finanzas y Contabilidad (finance) ---
  { "text": "sistema contable inteligente conciliacion financiera extractos bancarios", "label": "finance" },
  { "text": "analisis predictivo de de flujo de de de caja y gestion de de presupuestos dobles", "label": "finance" },
  { "text": "conciliacion automatica de de de movimientos bancarios y cuentas por cobrar", "label": "finance" },
  { "text": "software financiero para control de de de ingresos egresos contabilidad", "label": "finance" },
  { "text": "algoritmos de de conciliacion contable y balance general empresarial", "label": "finance" },
  { "text": "sistema de de facturacion electronica y prevision de de de liquidez en caja", "label": "finance" },
  { "text": "gestion contable multi-moneda open banking conciliacion automatizada", "label": "finance" },
  { "text": "presupuestos contables prediccion de de de gastos mensuales en la nube", "label": "finance" },
  { "text": "sistema contable e integracion de conciliacion bancaria automatica de extractos", "label": "finance" },
  { "text": "analisis de flujo de caja contabilidad general balance y facturacion electronica", "label": "finance" },
  { "text": "conciliacion de movimientos financieros y cuentas por cobrar empresa pyme", "label": "finance" },
  { "text": "software de contabilidad multi-moneda y conciliacion de transacciones bancarias", "label": "finance" },
  { "text": "control de presupuestos corporativos balance general y flujo de caja predictivo", "label": "finance" },
  { "text": "conciliador bancario automatico open banking y contabilidad automatizada", "label": "finance" },
  { "text": "sistema de auditoria contable facturas balances y liquidez de caja diaria", "label": "finance" }
]

class PythonClassifier:
    def __init__(self):
        self.classes = ["riego", "security", "ecommerce", "education", "health", "finance"]
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            preprocessor=spanish_preprocessor,
            tokenizer=spanish_tokenizer,
            sublinear_tf=True
        )
        self.clf = MLPClassifier(
            hidden_layer_sizes=(64, 32),
            activation='relu',
            solver='sgd',
            random_state=42,
            learning_rate_init=0.08,
            momentum=0.9,
            alpha=0.01,
            max_iter=1,
            warm_start=True
        )
        self.is_trained = False
        self.logs = []
        self.stats = {}

    def train(self):
        self.logs = [
            "[INFO] Inicializando Python Neural Engine con Scikit-Learn...",
            f"[INFO] Cargando dataset: {len(TRAINING_DATASET)} frases etiquetadas...",
            "[INFO] Iniciando entrenamiento de red neuronal (MLPClassifier)..."
        ]
        
        texts = [item["text"] for item in TRAINING_DATASET]
        labels = [item["label"] for item in TRAINING_DATASET]
        
        # Deterministic stratified split (80% train, 20% validation)
        from collections import defaultdict
        class_indices = defaultdict(list)
        for idx, label in enumerate(labels):
            class_indices[label].append(idx)
            
        train_indices = []
        val_indices = []
        
        for label, indices in class_indices.items():
            state = np.random.RandomState(42)
            shuffled = state.permutation(indices)
            split_idx = int(len(shuffled) * 0.8)
            # Ensure at least 1 in validation per class
            if split_idx >= len(shuffled):
                split_idx = len(shuffled) - 1
            if split_idx <= 0:
                split_idx = 1
            train_indices.extend(shuffled[:split_idx])
            val_indices.extend(shuffled[split_idx:])
            
        train_texts = [texts[i] for i in train_indices]
        train_labels = [labels[i] for i in train_indices]
        val_texts = [texts[i] for i in val_indices]
        val_labels = [labels[i] for i in val_indices]
        
        # Fit vectorizer only on training set
        X_train = self.vectorizer.fit_transform(train_texts).toarray()
        y_train = np.array([self.classes.index(label) for label in train_labels])
        
        X_val = self.vectorizer.transform(val_texts).toarray()
        y_val = np.array([self.classes.index(label) for label in val_labels])
        
        vocab_size = len(self.vectorizer.vocabulary_)
        self.logs.append(f"[INFO] Vocabulario indexado: {vocab_size} términos únicos (unigramas y bigramas).")
        self.logs.append(f"[INFO] Partición de datos: {len(train_texts)} entrenamiento | {len(val_texts)} validación.")
        
        # Re-initialize the MLP classifier to ensure fresh training
        self.clf = MLPClassifier(
            hidden_layer_sizes=(64, 32),
            activation='relu',
            solver='sgd',
            random_state=42,
            learning_rate_init=0.08,
            momentum=0.9,
            alpha=0.01,
            max_iter=1,
            warm_start=True
        )
        
        history = []
        for epoch in range(1, 151):
            self.clf.partial_fit(X_train, y_train, classes=np.arange(len(self.classes)))
            loss = self.clf.loss_
            
            # Train accuracy
            train_preds = self.clf.predict(X_train)
            train_accuracy = np.mean(train_preds == y_train)
            
            # Validation accuracy
            val_preds = self.clf.predict(X_val)
            val_accuracy = np.mean(val_preds == y_val)
            
            history.append({
                "epoch": epoch,
                "loss": float(loss),
                "accuracy": float(train_accuracy),
                "valAccuracy": float(val_accuracy)
            })
            
            if epoch == 1 or epoch % 30 == 0 or epoch == 150:
                self.logs.append(
                    f"[ÉPOCA {epoch}/150] Pérdida: {loss:.4f} | "
                    f"Precisión Entr.: {(train_accuracy * 100):.1f}% | "
                    f"Precisión Val.: {(val_accuracy * 100):.1f}%"
                )
                
        self.logs.append("[INFO] ¡Entrenamiento completo! Red neuronal en Python lista para predicciones.")
        self.is_trained = True
        
        self.stats = {
            "vocabSize": vocab_size,
            "numClasses": len(self.classes),
            "finalLoss": float(self.clf.loss_),
            "finalAccuracy": float(train_accuracy),
            "finalValAccuracy": float(val_accuracy),
            "logs": self.logs,
            "history": history
        }
        return self.stats

    def predict(self, text):
        if not self.is_trained:
            self.train()
            
        # preprocess input text using the custom preprocessor
        cleaned_text = spanish_preprocessor(text)
        X_test = self.vectorizer.transform([cleaned_text]).toarray()
        
        # Obtener probabilidades
        probs = self.clf.predict_proba(X_test)[0]
        max_idx = np.argmax(probs)
        confidence = probs[max_idx]
        
        # Mapear puntuaciones
        scores = {}
        for idx, class_name in enumerate(self.classes):
            scores[class_name] = float(probs[idx])
            
        category = self.classes[max_idx] if confidence > 0.35 else "general"
        
        return {
            "category": category,
            "confidence": float(confidence),
            "scores": scores
        }
