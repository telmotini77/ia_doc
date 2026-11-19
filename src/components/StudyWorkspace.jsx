import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown, ArrowUp, BookOpen, BrainCircuit, ChevronRight,
  Download, FileUp, GraduationCap, Highlighter, Layers3, MessageSquarePlus,
  Network, NotebookPen, Sparkles, Stethoscope, Table2, Target,
} from 'lucide-react';
import { downloadStudyDOCX, downloadStudyPDF, downloadStudyXLSX } from '../utils/studyExporters';
import './StudyWorkspace.css';

const STORAGE_KEY = 'docgenius-study-workspace-v1';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const studyApi = (path) => `${API_BASE_URL}${path}`;
const authHeader = () => {
  const token = localStorage.getItem('docgenius_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const anatomyStructures = [
  {
    id: 'biceps', category: 'Músculo', name: 'Bíceps braquial',
    region: 'miembro-superior', system: 'Muscular', description: 'Músculo fusiforme de la cara anterior del brazo, con dos cabezas proximales.',
    origin: 'Cabeza larga: tubérculo supraglenoideo. Cabeza corta: proceso coracoides.',
    insertion: 'Tuberosidad del radio y aponeurosis bicipital.',
    innervation: 'Nervio musculocutáneo (C5–C6).',
    function: 'Flexiona el codo y supina el antebrazo; participa en la flexión del hombro.',
  },
  {
    id: 'triceps', category: 'Músculo', name: 'Tríceps braquial',
    region: 'miembro-superior', system: 'Muscular', description: 'Músculo posterior del brazo formado por cabezas larga, lateral y medial.',
    origin: 'Cabeza larga: tubérculo infraglenoideo; cabezas lateral y medial: cara posterior del húmero.',
    insertion: 'Olécranon de la ulna mediante tendón común.',
    innervation: 'Nervio radial (C6–C8).',
    function: 'Extiende el antebrazo; la cabeza larga también ayuda a extender y aducir el hombro.',
  },
  {
    id: 'femur', category: 'Hueso', name: 'Fémur',
    region: 'miembro-inferior', system: 'Óseo', description: 'Hueso largo del muslo y el más robusto del cuerpo humano.',
    origin: 'No aplica: estructura ósea.', insertion: 'No aplica: estructura ósea.',
    innervation: 'Periostio y cápsulas articulares reciben sensibilidad de nervios regionales.',
    function: 'Soporta y transmite peso entre pelvis y rodilla; sirve como palanca muscular.',
    landmarks: 'Cabeza, cuello, trocánter mayor, trocánter menor, línea áspera, cóndilos medial y lateral.',
  },
  {
    id: 'humerus', category: 'Hueso', name: 'Húmero',
    region: 'miembro-superior', system: 'Óseo', description: 'Hueso largo del brazo entre la cintura escapular y el antebrazo.',
    origin: 'No aplica: estructura ósea.', insertion: 'No aplica: estructura ósea.',
    innervation: 'El nervio radial recorre el surco radial; otros nervios se relacionan con sus epicóndilos.',
    function: 'Conecta hombro y codo y aporta inserciones para músculos del brazo y antebrazo.',
    landmarks: 'Cabeza, tubérculos mayor y menor, surco intertubercular, tuberosidad deltoidea, epicóndilos y tróclea.',
  },
  {
    id: 'sternocleidomastoid', category: 'Músculo', name: 'Esternocleidomastoideo',
    region: 'cabeza-cuello', system: 'Muscular', description: 'Músculo superficial del cuello que delimita los triángulos cervicales anterior y posterior.',
    origin: 'Manubrio del esternón (cabeza esternal) y tercio medial de la clavícula (cabeza clavicular).',
    insertion: 'Proceso mastoides del temporal y mitad lateral de la línea nucal superior.',
    innervation: 'Nervio accesorio (XI) para función motora; ramos cervicales C2–C3 para propiocepción y dolor.',
    function: 'Unilateralmente rota la cabeza al lado opuesto e inclina al mismo lado; bilateralmente flexiona el cuello y puede elevar el esternón en inspiración forzada.',
  },
  {
    id: 'trapezius', category: 'Músculo', name: 'Trapecio',
    region: 'tronco-posterior', system: 'Muscular', description: 'Músculo superficial amplio de la nuca y espalda superior, dividido funcionalmente en fibras superiores, medias e inferiores.',
    origin: 'Protuberancia occipital externa, tercio medial de línea nucal superior, ligamento nucal y apófisis espinosas C7–T12.',
    insertion: 'Tercio lateral de la clavícula, acromion y espina de la escápula.',
    innervation: 'Nervio accesorio (XI) motor; ramos anteriores C3–C4 para sensibilidad y propiocepción.',
    function: 'Eleva, retrae y rota superiormente la escápula; las fibras inferiores contribuyen a su depresión.',
  },
  {
    id: 'diaphragm', category: 'Músculo', name: 'Diafragma',
    region: 'torax', system: 'Muscular', description: 'Tabique musculotendinoso que separa tórax y abdomen; principal músculo de la inspiración.',
    origin: 'Porciones esternal, costal y lumbar: proceso xifoides, caras internas de costillas y cartílagos 7–12, y pilares lumbares.',
    insertion: 'Centro tendinoso del diafragma.',
    innervation: 'Nervios frénicos C3–C5.',
    function: 'Al contraerse desciende el centro tendinoso y aumenta el volumen torácico; también aumenta la presión intraabdominal.',
  },
  {
    id: 'rectus-abdominis', category: 'Músculo', name: 'Recto del abdomen',
    region: 'abdomen-pelvis', system: 'Muscular', description: 'Músculo par vertical de la pared abdominal anterior, segmentado por intersecciones tendinosas.',
    origin: 'Cresta y sínfisis del pubis.',
    insertion: 'Proceso xifoides y cartílagos costales de las costillas 5.ª a 7.ª.',
    innervation: 'Nervios toracoabdominales T6–T11 y nervio subcostal T12.',
    function: 'Flexiona el tronco, estabiliza y comprime las vísceras abdominales; participa en espiración forzada.',
  },
  {
    id: 'gluteus-maximus', category: 'Músculo', name: 'Glúteo mayor',
    region: 'miembro-inferior', system: 'Muscular', description: 'Músculo superficial de la región glútea, especialmente potente al levantarse o subir escaleras.',
    origin: 'Ilion posterior a la línea glútea posterior, dorso de sacro y cóccix, y ligamento sacrotuberoso.',
    insertion: 'Tracto iliotibial y tuberosidad glútea del fémur.',
    innervation: 'Nervio glúteo inferior L5–S2.',
    function: 'Extiende y rota lateralmente el muslo; estabiliza la cadera y la rodilla a través del tracto iliotibial.',
  },
  {
    id: 'quadriceps', category: 'Músculo', name: 'Cuádriceps femoral',
    region: 'miembro-inferior', system: 'Muscular', description: 'Grupo anterior del muslo formado por recto femoral y vastos lateral, medial e intermedio.',
    origin: 'Recto femoral: espina ilíaca anteroinferior; vastos: caras anterior y lateral del fémur.',
    insertion: 'Base de la rótula por tendón cuadricipital y tuberosidad tibial por ligamento patelar.',
    innervation: 'Nervio femoral L2–L4.',
    function: 'Extiende la rodilla; el recto femoral también flexiona la cadera.',
  },
  {
    id: 'tibia', category: 'Hueso', name: 'Tibia',
    region: 'miembro-inferior', system: 'Óseo', description: 'Hueso medial de la pierna que soporta la mayor parte del peso corporal.',
    origin: 'No aplica: estructura ósea.', insertion: 'No aplica: estructura ósea.',
    innervation: 'Su periostio recibe sensibilidad de nervios regionales de la pierna.',
    function: 'Transmite carga entre el fémur y el pie y aporta inserciones musculares y ligamentarias.',
    landmarks: 'Cóndilos medial y lateral, eminencia intercondílea, tuberosidad tibial, borde anterior, maléolo medial.',
  },
  {
    id: 'sciatic-nerve', category: 'Nervio', name: 'Nervio ciático',
    region: 'miembro-inferior', system: 'Nervioso', description: 'Nervio periférico de gran calibre que emerge del plexo sacro y recorre la región glútea y posterior del muslo.',
    origin: 'Ramos anteriores L4–S3 del plexo sacro.', insertion: 'No aplica: nervio periférico.',
    innervation: 'Conduce fibras motoras y sensitivas; se divide habitualmente en nervios tibial y fibular común.',
    function: 'Inerva músculos posteriores del muslo y, mediante sus ramas terminales, gran parte de pierna y pie.',
    landmarks: 'Sale por foramen isquiático mayor, usualmente inferior al piriforme; desciende entre tuberosidad isquiática y trocánter mayor.',
  },
  {
    id: 'brain', category: 'Órgano', name: 'Encéfalo',
    region: 'cabeza-cuello', system: 'Nervioso', description: 'Conjunto de cerebro, cerebelo y tronco encefálico alojado en la cavidad craneal; integra información sensorial, motora y autónoma.',
    origin: 'No aplica: órgano del sistema nervioso central.', insertion: 'No aplica: órgano del sistema nervioso central.',
    innervation: 'No recibe inervación periférica para su función; se comunica con el cuerpo por pares craneales, médula espinal y vías autónomas.',
    function: 'Coordina cognición, movimiento, sensibilidad, equilibrio, conducta y funciones vitales mediante redes neuronales.',
    landmarks: 'Hemisferios y lóbulos cerebrales, tálamo, hipotálamo, cerebelo, mesencéfalo, puente y bulbo raquídeo.',
    relations: 'Está protegido por cráneo, meninges y líquido cefalorraquídeo; continúa inferiormente con la médula espinal a nivel del foramen magno.',
    clinicalNote: 'Los déficits neurológicos se localizan según el territorio y la vía afectados; esta ficha es de estudio y no sirve para diagnosticar.',
  },
  {
    id: 'heart', category: 'Órgano', name: 'Corazón',
    region: 'torax', system: 'Cardiovascular', description: 'Órgano muscular hueco situado en el mediastino medio que impulsa sangre hacia la circulación pulmonar y sistémica.',
    origin: 'No aplica: órgano.', insertion: 'No aplica: órgano.',
    innervation: 'Plexo cardíaco: fibras simpáticas torácicas y parasimpáticas del nervio vago; el nodo sinoauricular inicia el ritmo normal.',
    function: 'Mantiene el gasto cardíaco mediante contracción coordinada de aurículas y ventrículos.',
    landmarks: 'Ápice, base, aurícula derecha e izquierda, ventrículo derecho e izquierdo, surcos coronario e interventriculares.',
    relations: 'Se apoya sobre el diafragma, está entre ambos pulmones y se encuentra dentro del pericardio.',
    clinicalNote: 'La irrigación del miocardio depende de arterias coronarias; dolor torácico agudo requiere valoración médica inmediata.',
  },
  {
    id: 'lungs', category: 'Órgano', name: 'Pulmones',
    region: 'torax', system: 'Respiratorio', description: 'Órganos pares esponjosos de intercambio gaseoso, divididos en lóbulos y recubiertos por pleura visceral.',
    origin: 'No aplica: órgano.', insertion: 'No aplica: órgano.',
    innervation: 'Plexos pulmonares con fibras vagales parasimpáticas y simpáticas; el parénquima tiene escasa sensibilidad al dolor.',
    function: 'Permiten el intercambio de oxígeno y dióxido de carbono entre aire alveolar y sangre capilar.',
    landmarks: 'Ápice, base, hilio; pulmón derecho con lóbulos superior, medio e inferior; izquierdo con lóbulos superior e inferior y língula.',
    relations: 'Flanquean el mediastino y descansan sobre el diafragma; cada raíz pulmonar conecta el hilio con el mediastino.',
    clinicalNote: 'La pleura parietal es sensible y su irritación puede producir dolor que aumenta con la respiración.',
  },
  {
    id: 'liver', category: 'Órgano', name: 'Hígado',
    region: 'abdomen-pelvis', system: 'Digestivo', description: 'Glándula abdominal grande con funciones metabólicas, de síntesis, detoxificación y producción de bilis.',
    origin: 'No aplica: órgano.', insertion: 'No aplica: órgano.',
    innervation: 'Plexo hepático con fibras simpáticas y parasimpáticas; la cápsula hepática puede transmitir dolor por estiramiento.',
    function: 'Procesa nutrientes, sintetiza proteínas plasmáticas, almacena glucógeno, metaboliza sustancias y produce bilis.',
    landmarks: 'Lóbulos derecho e izquierdo anatómicos, porta hepatis, vesícula biliar, ligamento falciforme y segmentos vasculobiliares.',
    relations: 'Predomina en hipocondrio derecho y epigastrio, inferior al diafragma y en contacto con estómago, duodeno, riñón derecho y colon.',
    clinicalNote: 'La tríada portal reúne conducto biliar, arteria hepática propia y vena porta; es una referencia frecuente en anatomía clínica.',
  },
  {
    id: 'kidney', category: 'Órgano', name: 'Riñón',
    region: 'abdomen-pelvis', system: 'Urinario', description: 'Órgano retroperitoneal par que filtra plasma, regula equilibrio hidroelectrolítico y produce orina.',
    origin: 'No aplica: órgano.', insertion: 'No aplica: órgano.',
    innervation: 'Plexo renal, principalmente fibras simpáticas T10–L1 y aferencias viscerales asociadas.',
    function: 'Forma orina, contribuye al control de presión arterial y equilibrio ácido-base, y participa en funciones endocrinas.',
    landmarks: 'Polos superior e inferior, corteza, médula, pirámides, papilas, cálices, pelvis renal e hilio.',
    relations: 'Son retroperitoneales; el riñón derecho suele estar algo más bajo por el hígado. El hilio se orienta anteromedialmente.',
    clinicalNote: 'El dolor renal puede irradiarse siguiendo el uréter hacia ingle; su interpretación clínica requiere valoración profesional.',
  },
  {
    id: 'thyroid', category: 'Glándula', name: 'Glándula tiroides',
    region: 'cabeza-cuello', system: 'Endocrino', description: 'Glándula endocrina cervical anterior formada por dos lóbulos unidos por un istmo, adosada a la tráquea.',
    origin: 'No aplica: glándula.', insertion: 'No aplica: glándula.',
    innervation: 'Fibras simpáticas posganglionares de ganglios cervicales regulan sobre todo el tono vascular; la secreción depende de TSH.',
    function: 'Sintetiza hormonas tiroideas y calcitonina, implicadas en metabolismo y homeostasis del calcio.',
    landmarks: 'Lóbulos derecho e izquierdo, istmo, polos superior e inferior y posible lóbulo piramidal.',
    relations: 'Se ubica anterior y lateral a laringe y tráquea; los nervios laríngeos recurrentes se relacionan con su cara posterior.',
    clinicalNote: 'La relación con el nervio laríngeo recurrente es relevante en cirugía cervical por su función en la voz.',
  },
  {
    id: 'skin', category: 'Órgano', name: 'Piel',
    region: 'todo', system: 'Tegumentario', description: 'Órgano de cobertura formado por epidermis y dermis, con anexos como folículos, glándulas y uñas.',
    origin: 'No aplica: órgano de cobertura.', insertion: 'No aplica: órgano de cobertura.',
    innervation: 'Terminaciones nerviosas libres y receptores especializados conectados con nervios cutáneos regionales.',
    function: 'Actúa como barrera, participa en sensibilidad, termorregulación, síntesis de vitamina D y defensa inmunitaria.',
    landmarks: 'Epidermis, dermis papilar y reticular, hipodermis, folículo piloso, glándulas sudoríparas y sebáceas.',
    relations: 'Recubre todo el cuerpo y se continúa con mucosas en orificios corporales.',
    clinicalNote: 'El grosor, vascularización y sensibilidad cambian por región corporal; las quemaduras se valoran por profundidad y extensión.',
  },
];

const atlasRegions = [
  ['todo', 'Cuerpo completo'], ['cabeza-cuello', 'Cabeza y cuello'], ['miembro-superior', 'Miembro superior'],
  ['torax', 'Tórax'], ['tronco-posterior', 'Espalda y columna'], ['abdomen-pelvis', 'Abdomen y pelvis'], ['miembro-inferior', 'Miembro inferior'],
];
const atlasSystems = ['Todos', 'Muscular', 'Óseo', 'Nervioso', 'Cardiovascular', 'Respiratorio', 'Digestivo', 'Urinario', 'Endocrino', 'Tegumentario'];

const biologyLevels = [
  ['Subatómico', 'Protones, neutrones y electrones forman la materia.'],
  ['Atómico y molecular', 'Átomos y biomoléculas como agua, ADN, proteínas y lípidos.'],
  ['Orgánulos y célula', 'La célula es la unidad funcional; sus orgánulos coordinan procesos.'],
  ['Uniones celulares', 'Uniones estrechas, adherentes, desmosomas y comunicantes organizan tejidos.'],
  ['Tejidos', 'Epitelial, conectivo, muscular y nervioso agrupan células especializadas.'],
  ['Órganos', 'Estructuras compuestas por tejidos con una función definida.'],
  ['Sistemas', 'Conjuntos de órganos coordinados, como el nervioso, circulatorio o locomotor.'],
  ['Organismo', 'Integración de sistemas para conservar la homeostasis.'],
];

const initialStudy = {
  documents: [], mainBookId: '', learningOrder: [], notes: [], highlights: [],
  resources: {}, mistakes: [], atlasStructures: [], examFormat: { description: '', fileName: '' },
  examSettings: { topicIds: [], questionCount: 10 },
};

const dateLabel = () => new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date());
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const words = (text) => (text.toLowerCase().match(/[a-záéíóúñü]{5,}/gi) || []);
const uniqueTerms = (text, limit = 12) => [...new Set(words(text))].slice(0, limit);
const sourceSentences = (text) => text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g)?.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 25) || [];

function inferTopics(text, documentId, documentName) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headings = lines.filter((line) => /^(cap[íi]tulo|tema|unidad|lecci[oó]n|\d+[.)-])/i.test(line)).slice(0, 20);
  const list = headings.length ? headings : [documentName.replace(/\.[^.]+$/, '')];
  return list.map((title, index) => ({
    id: `${documentId}-${index}`, title, status: 'pendiente', lastStudied: '', documentId,
  }));
}

function textForTopic(text, topicTitle) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === topicTitle.trim().toLowerCase());
  if (start < 0) return text;
  const endOffset = lines.slice(start + 1).findIndex((line) => /^(cap[íi]tulo|tema|unidad|lecci[oó]n|\d+[.)-])/i.test(line.trim()));
  return lines.slice(start, endOffset < 0 ? undefined : start + 1 + endOffset).join('\n').trim() || text;
}

function atlasEntriesFromJson(text) {
  try {
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed.structures) ? parsed.structures : [];
    return items
      .filter((item) => item && typeof item === 'object' && item.name)
      .map((item) => ({
        id: item.id || `atlas-${makeId()}`,
        category: item.category || 'Estructura anatómica',
        name: item.name,
        region: item.region || 'personalizado',
        system: item.system || item.category || 'Personalizado',
        description: item.description || 'Sin descripción adicional en el atlas cargado.',
        origin: item.origin || 'No especificado en el atlas cargado.',
        insertion: item.insertion || 'No especificado en el atlas cargado.',
        innervation: item.innervation || 'No especificado en el atlas cargado.',
        function: item.function || 'No especificada en el atlas cargado.',
        landmarks: item.landmarks || '',
        relations: item.relations || '',
        clinicalNote: item.clinicalNote || '',
      }));
  } catch { return []; }
}

async function extractText(file) {
  const isText = /\.(txt|md|csv|json)$/i.test(file.name) || file.type.startsWith('text/');
  if (isText) return (await file.text()).slice(0, 120_000);
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(studyApi('/api/study/extract'), { method: 'POST', headers: authHeader(), body: form });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'No se pudo extraer texto del archivo.');
  }
  const data = await response.json();
  return (data.text || '').slice(0, 120_000);
}

function buildResources(topic, text, learningOrder, notes = [], examFormat = {}, questionCount = 4) {
  const sentences = sourceSentences(text);
  const terms = uniqueTerms(text);
  const summarySentences = sentences.slice(0, 5);
  const priorTopics = learningOrder.filter((item) => item.status === 'completado' && item.id !== topic.id).map((item) => item.title);
  const teacherEmphasis = notes.filter((note) => note.topicId === topic.id).map((note) => note.text);
  const examStyle = examFormat.description?.trim() || '';
  const source = summarySentences.join(' ');
  const evidenceSentence = sentences.find((sentence) => terms.some((term) => new RegExp(`\\b${term}\\b`, 'i').test(sentence))) || summarySentences[0] || '';
  const correctTerm = terms.find((term) => new RegExp(`\\b${term}\\b`, 'i').test(evidenceSentence)) || terms[0] || '';
  const options = [correctTerm, ...terms.filter((term) => term !== correctTerm && !new RegExp(`\\b${term}\\b`, 'i').test(evidenceSentence)).slice(0, 3)]
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);
  const matchingPairs = terms.slice(0, 3).map((term, index) => ({ left: term, right: summarySentences[index] || source }));
  const baseQuiz = [
    { id: makeId(), type: 'multiple', question: `¿Qué término aparece explícitamente en este extracto? “${evidenceSentence}”`, options, answer: correctTerm, excerpt: evidenceSentence || source, priorTopics, teacherEmphasis, examStyle },
    { id: makeId(), type: 'blank', question: `Completa según el texto: ${evidenceSentence.replace(new RegExp(`\\b${correctTerm}\\b`, 'i'), '_____') || 'Añade más texto para construir esta pregunta.'}`, answer: correctTerm, excerpt: evidenceSentence || source, priorTopics, teacherEmphasis, examStyle },
    { id: makeId(), type: 'truefalse', question: summarySentences[1] || 'Añade más texto para construir esta pregunta.', answer: 'verdadero', excerpt: source, priorTopics, teacherEmphasis, examStyle },
    { id: makeId(), type: 'match', question: 'Relaciona cada concepto con su pista en el texto.', pairs: matchingPairs, matchOptions: matchingPairs.map((pair) => pair.right).sort(() => Math.random() - 0.5), excerpt: source, priorTopics, teacherEmphasis, examStyle },
  ];
  const requestedCount = Math.max(4, Math.min(Number(questionCount) || 4, 30));
  const quiz = Array.from({ length: requestedCount }, (_, index) => {
    if (index < baseQuiz.length) return baseQuiz[index];
    const excerpt = sentences[index % Math.max(sentences.length, 1)] || source;
    const focus = terms[index % Math.max(terms.length, 1)] || correctTerm;
    const type = ['multiple', 'blank', 'truefalse'][index % 3];
    if (type === 'multiple') return { id: makeId(), type, question: `Según el texto, ¿cuál de estos términos se relaciona con el extracto: “${excerpt}”?`, options: [...options].sort(() => Math.random() - 0.5), answer: correctTerm, excerpt, priorTopics, teacherEmphasis, examStyle };
    if (type === 'blank') return { id: makeId(), type, question: `Completa con el término del texto: ${excerpt.replace(new RegExp(`\\b${focus}\\b`, 'i'), '_____')}`, answer: focus, excerpt, priorTopics, teacherEmphasis, examStyle };
    return { id: makeId(), type, question: excerpt, answer: 'verdadero', excerpt, priorTopics, teacherEmphasis, examStyle };
  });
  return {
    title: topic.title,
    source,
    teacherEmphasis,
    examStyle,
    summary: summarySentences.join(' ') || 'El documento no contiene suficiente texto extraíble para crear un resumen fiel.',
    mindMap: terms.slice(0, 6).map((term) => `${topic.title} → ${term}`),
    organizer: summarySentences.slice(0, 4),
    synoptic: terms.slice(0, 6),
    comparison: terms.slice(0, 4).map((term, index) => ({ concepto: term, relación: terms[index + 1] || 'tema central' })),
    flashcards: terms.slice(0, 8).map((term) => ({ front: `Define o explica: ${term}`, back: source || 'Consulta el texto principal.' })),
    quiz,
  };
}

export default function StudyWorkspace({ onReturn }) {
  const [study, setStudy] = useState(() => {
    try { return { ...initialStudy, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { return initialStudy; }
  });
  const [activeTab, setActiveTab] = useState('biblioteca');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [selectedStructure, setSelectedStructure] = useState(anatomyStructures[0]);
  const [atlasRegion, setAtlasRegion] = useState('todo');
  const [atlasSystem, setAtlasSystem] = useState('Todos');
  const [generatedAtlas, setGeneratedAtlas] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState({});
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedBiologyLevel, setSelectedBiologyLevel] = useState(0);
  const [bioPrompt, setBioPrompt] = useState({ objective: '', variable: '', population: '', design: '' });
  const [jarvisAnswer, setJarvisAnswer] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(study)), [study]);
  const mainBook = useMemo(() => study.documents.find((document) => document.id === study.mainBookId), [study.documents, study.mainBookId]);
  const selectedTopic = useMemo(() => study.learningOrder.find((topic) => topic.id === selectedTopicId) || study.learningOrder[0], [study.learningOrder, selectedTopicId]);
  const selectedText = mainBook?.text || '';
  const topicText = useMemo(() => textForTopic(selectedText, selectedTopic?.title || ''), [selectedText, selectedTopic?.title]);
  const atlasStructures = useMemo(() => [...anatomyStructures, ...(study.atlasStructures || [])], [study.atlasStructures]);
  const filteredAtlasStructures = useMemo(() => atlasStructures.filter((structure) => (
    (atlasRegion === 'todo' || structure.region === atlasRegion || structure.region === 'todo')
    && (atlasSystem === 'Todos' || structure.system === atlasSystem)
  )), [atlasRegion, atlasStructures, atlasSystem]);
  const visibleAtlasStructures = generatedAtlas?.structures || filteredAtlasStructures;
  const examSettings = study.examSettings || initialStudy.examSettings;
  const selectedExamTopics = useMemo(() => study.learningOrder.filter((topic) => examSettings.topicIds.includes(topic.id)), [study.learningOrder, examSettings.topicIds]);

  const updateStudy = (change) => setStudy((previous) => ({ ...previous, ...change }));

  const generateAtlas = () => {
    const structures = filteredAtlasStructures;
    if (!structures.length) {
      setGeneratedAtlas({ structures: [], label: 'Sin coincidencias' });
      setStatus('No hay fichas para esa combinación todavía. Importa un atlas JSON con región y sistema para ampliarlo.');
      return;
    }
    const regionName = atlasRegions.find(([id]) => id === atlasRegion)?.[1] || 'Cuerpo completo';
    const systemName = atlasSystem === 'Todos' ? 'todos los sistemas disponibles' : `sistema ${atlasSystem}`;
    setGeneratedAtlas({ structures, label: `${regionName} · ${systemName}` });
    setSelectedStructure(structures[0]);
    setStatus(`Atlas generado: ${structures.length} estructura(s) para ${regionName}, ${systemName}.`);
  };

  const importDocuments = async (files) => {
    setStatus('Extrayendo contenido de los documentos…');
    const imported = [];
    for (const file of Array.from(files)) {
      try {
        const text = await extractText(file);
        const id = makeId();
        imported.push({ id, name: file.name, type: file.type, text, importedAt: dateLabel(), extractionReady: Boolean(text), topics: inferTopics(text, id, file.name) });
      } catch (error) {
        imported.push({ id: makeId(), name: file.name, type: file.type, text: '', importedAt: dateLabel(), extractionReady: false, issue: error.message, topics: [] });
      }
    }
    setStudy((previous) => {
      const documents = [...previous.documents, ...imported];
      const learningOrder = [...previous.learningOrder, ...imported.flatMap((document) => document.topics)];
      const importedAtlas = imported.flatMap((document) => /\.json$/i.test(document.name) ? atlasEntriesFromJson(document.text) : []);
      return {
        ...previous, documents, learningOrder,
        atlasStructures: [...(previous.atlasStructures || []), ...importedAtlas],
        mainBookId: previous.mainBookId || imported[0]?.id || '',
      };
    });
    const extracted = imported.filter((document) => document.extractionReady);
    const failed = imported.filter((document) => !document.extractionReady);
    setSelectedTopicId(extracted[0]?.topics[0]?.id || selectedTopicId);
    setStatus(extracted.length
      ? `${extracted.length} documento(s) listo(s) para estudiar.${failed.length ? ` ${failed.length} archivo(s) requieren revisión en la lista.` : ''}`
      : `No se pudo extraer texto. Revisa el mensaje del archivo; si es un PDF escaneado, usa una versión con texto seleccionable.`);
  };

  const selectMainBook = (documentId) => {
    const book = study.documents.find((document) => document.id === documentId);
    updateStudy({ mainBookId: documentId, learningOrder: book?.topics || [] });
    setSelectedTopicId(book?.topics?.[0]?.id || '');
  };

  const moveTopic = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= study.learningOrder.length) return;
    const learningOrder = [...study.learningOrder];
    [learningOrder[index], learningOrder[target]] = [learningOrder[target], learningOrder[index]];
    updateStudy({ learningOrder });
  };

  const updateTopic = (topicId, change) => updateStudy({ learningOrder: study.learningOrder.map((topic) => topic.id === topicId ? { ...topic, ...change } : topic) });

  const generateResources = () => {
    if (!selectedTopic || !selectedText) {
      setStatus('Designa un libro principal con texto extraíble antes de generar recursos.');
      return;
    }
    const resources = buildResources(selectedTopic, topicText, study.learningOrder, study.notes, study.examFormat);
    updateStudy({ resources });
    setQuizAnswers({});
    setQuizFeedback({});
    setStatus('Recursos creados únicamente con el texto extraído del libro principal.');
  };

  const toggleExamTopic = (topicId) => {
    const topicIds = examSettings.topicIds.includes(topicId)
      ? examSettings.topicIds.filter((id) => id !== topicId)
      : [...examSettings.topicIds, topicId];
    updateStudy({ examSettings: { ...examSettings, topicIds } });
  };

  const generateExam = () => {
    if (!selectedText || !mainBook) {
      setActiveTab('biblioteca');
      setStatus('Aún no hay un libro principal. En Biblioteca, sube el libro o guía que contiene los temas y pulsa “Usar como libro”.');
      return;
    }
    const topics = selectedExamTopics.length ? selectedExamTopics : (selectedTopic ? [selectedTopic] : []);
    if (!topics.length) {
      setActiveTab('plan');
      setStatus('Selecciona al menos un tema del plan para generar la evaluación.');
      return;
    }
    const examTopic = { id: `exam-${makeId()}`, title: `Examen: ${topics.map((topic) => topic.title).join(' · ')}` };
    const sourceText = topics.map((topic) => textForTopic(selectedText, topic.title)).filter(Boolean).join('\n\n');
    const linkedNotes = study.notes
      .filter((note) => topics.some((topic) => topic.id === note.topicId))
      .map((note) => ({ ...note, topicId: examTopic.id }));
    const resources = buildResources(examTopic, sourceText, study.learningOrder, linkedNotes, study.examFormat, examSettings.questionCount);
    updateStudy({ resources });
    setQuizAnswers({});
    setQuizFeedback({});
    setSelectedTopicId(topics[0].id);
    setIsExamModalOpen(true);
    setStatus(`Examen generado con ${resources.quiz.length} preguntas sobre ${topics.length} tema(s), basado solo en el libro principal.`);
  };

  const addTeacherNote = () => {
    if (!teacherNote.trim() || !selectedTopic) return;
    updateStudy({ notes: [...study.notes, { id: makeId(), text: teacherNote.trim(), topicId: selectedTopic.id, date: dateLabel(), priority: 'clave' }] });
    setTeacherNote('');
  };

  const addHighlight = () => {
    const excerpt = window.getSelection()?.toString().trim();
    if (!excerpt || !selectedTopic) {
      setStatus('Selecciona una frase del lector antes de subrayarla.');
      return;
    }
    updateStudy({ highlights: [...study.highlights, { id: makeId(), excerpt, topicId: selectedTopic.id, date: dateLabel() }] });
    setStatus('Idea principal subrayada y vinculada al tema actual.');
  };

  const gradeQuiz = (question) => {
    const submitted = quizAnswers[question.id] || '';
    const correct = question.type === 'match'
      ? question.pairs.every((pair) => submitted[pair.left] === pair.right)
      : String(submitted).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
    const emphasis = question.teacherEmphasis?.length ? ` Nota docente vinculada: ${question.teacherEmphasis.join(' · ')}.` : '';
    const explanation = `${correct ? 'Correcto.' : 'Revisa el material.'} Evidencia: ${question.excerpt || 'No hay fragmento suficiente.'} ${question.priorTopics?.length ? `Repaso acumulativo: ${question.priorTopics.join(', ')}.` : ''}${emphasis}`;
    setQuizFeedback((previous) => ({ ...previous, [question.id]: { correct, explanation } }));
    if (!correct) updateStudy({ mistakes: [...study.mistakes, { id: makeId(), topic: selectedTopic?.title || '', question: question.question, explanation, date: dateLabel() }] });
  };

  const askJarvis = async () => {
    if (!study.resources?.source) return setStatus('Genera recursos antes de pedir una explicación a Jarvis.');
    setStatus('Consultando Jarvis Unificado…');
    try {
      const response = await fetch(studyApi('/api/study/explain'), {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ text: study.resources.source }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'El motor integrado no está disponible.');
      setJarvisAnswer(data.content || 'El motor integrado no devolvió una explicación.');
      setStatus('Explicación creada por el motor integrado con contexto limitado al extracto.');
    } catch (error) { setStatus(error.message); }
  };

  const tabs = [
    ['biblioteca', BookOpen, 'Biblioteca'], ['plan', Target, 'Plan'], ['recursos', BrainCircuit, 'Recursos'],
    ['atlas', Layers3, 'Atlas'], ['evaluacion', GraduationCap, 'Evaluación'], ['bioestadistica', Table2, 'Bioestadística'],
  ];

  return (
    <main className="study-workspace">
      <header className="study-header">
        <div><span className="eyebrow">DOCUGENIUS · MODO ESTUDIO</span><h1>Estudia con tu propio material</h1><p>Organiza tu secuencia real, registra las claves del docente y genera práctica basada en tus textos.</p></div>
        <button className="study-secondary" onClick={onReturn}>Volver a documentos</button>
      </header>
      <nav className="study-tabs" aria-label="Módulos de estudio">
        {tabs.map(([id, Icon, label]) => <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}><Icon size={16} />{label}</button>)}
      </nav>
      {status && <div className="study-status"><Sparkles size={16} />{status}</div>}

      {activeTab === 'biblioteca' && <section className="study-grid two-columns">
        <article className="study-card"><div className="card-heading"><FileUp size={18} /><h2>Libros y material</h2></div><label className="upload-study"><input type="file" multiple accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.json" onChange={(event) => importDocuments(event.target.files)} /><FileUp size={22} /><strong>Subir documentos, atlas o guía del docente</strong><span>PDF, DOCX, XLSX, CSV y texto con contenido seleccionable. Las imágenes se usan en el formato del examen docente.</span></label><div className="study-list">{study.documents.map((document) => <div className={`study-list-item ${study.mainBookId === document.id ? 'selected' : ''}`} key={document.id}><div><strong>{document.name}</strong><small>{document.extractionReady ? `${document.topics.length} tema(s) detectado(s)` : document.issue || 'Pendiente de extracción'}</small></div><button onClick={() => selectMainBook(document.id)}>{study.mainBookId === document.id ? 'Libro principal' : 'Usar como libro'}</button></div>)}</div></article>
        <article className="study-card reader"><div className="card-heading"><Highlighter size={18} /><h2>Lector principal</h2><button className="study-link" onClick={addHighlight}>Subrayar selección</button></div>{mainBook ? <><p className="reader-help">Selecciona una frase y usa “Subrayar selección”. Los resaltados y notas se vinculan al tema activo.</p><div className="reader-text">{sourceSentences(selectedText).slice(0, 80).map((sentence, index) => <p key={`${sentence}-${index}`} className={study.highlights.some((item) => item.excerpt === sentence) ? 'highlighted' : ''}>{sentence}</p>)}</div></> : <div className="empty-state">Carga y designa un libro principal para leerlo aquí.</div>}</article>
      </section>}

      {activeTab === 'plan' && <section className="study-grid two-columns">
        <article className="study-card"><div className="card-heading"><Target size={18} /><h2>Secuencia real de aprendizaje</h2></div><p className="muted">El orden no depende de la numeración del libro. Muévelo según la clase y marca el avance diario.</p>{study.learningOrder.map((topic, index) => <div key={topic.id} className="topic-row"><button className="topic-title" onClick={() => setSelectedTopicId(topic.id)}><span>{index + 1}</span>{topic.title}</button><select value={topic.status} onChange={(event) => updateTopic(topic.id, { status: event.target.value, lastStudied: dateLabel() })}><option value="pendiente">Pendiente</option><option value="en curso">En curso</option><option value="completado">Completado</option></select><button title="Subir" onClick={() => moveTopic(index, -1)}><ArrowUp size={15} /></button><button title="Bajar" onClick={() => moveTopic(index, 1)}><ArrowDown size={15} /></button></div>)}</article>
        <article className="study-card"><div className="card-heading"><NotebookPen size={18} /><h2>Bitácora del docente</h2></div><p className="muted">Tema vinculado: <strong>{selectedTopic?.title || 'Selecciona un tema'}</strong></p><textarea value={teacherNote} onChange={(event) => setTeacherNote(event.target.value)} placeholder="Ej.: El doctor indicó que este concepto es clave para el examen." /><button className="study-primary" onClick={addTeacherNote}><MessageSquarePlus size={16} />Guardar nota clave</button><div className="notes-list">{study.notes.map((note) => <div key={note.id}><strong>{study.learningOrder.find((topic) => topic.id === note.topicId)?.title || 'Tema'}</strong><p>{note.text}</p><small>{note.date}</small></div>)}</div></article>
      </section>}

      {activeTab === 'recursos' && <section className="study-grid resources-layout">
        <article className="study-card resources-command"><div><span className="eyebrow">TEMA ACTIVO</span><h2>{selectedTopic?.title || 'Selecciona un tema en el plan'}</h2><p>Los resúmenes, tarjetas, organizadores y preguntas se construyen solo a partir del texto del libro principal.</p></div><div className="resource-actions"><button className="study-primary" onClick={generateResources}><Sparkles size={16} />Generar recursos</button><button className="study-secondary" onClick={askJarvis}>Explicar con Jarvis</button><button onClick={() => downloadStudyPDF(study)}><Download size={15} />PDF</button><button onClick={() => downloadStudyDOCX(study)}><Download size={15} />Word</button><button onClick={() => downloadStudyXLSX(study)}><Download size={15} />Excel</button></div></article>
        <article className="study-card"><div className="card-heading"><BookOpen size={18} /><h2>Resumen</h2></div><p>{study.resources?.summary || 'Genera recursos para ver un resumen.'}</p>{study.resources?.teacherEmphasis?.length > 0 && <div className="teacher-emphasis"><strong>Claves del docente</strong><ul>{study.resources.teacherEmphasis.map((note) => <li key={note}>{note}</li>)}</ul></div>}{jarvisAnswer && <div className="jarvis-answer"><strong>Explicación de Jarvis</strong><p>{jarvisAnswer}</p></div>}</article>
        <article className="study-card"><div className="card-heading"><Network size={18} /><h2>Mapa mental y cuadro sinóptico</h2></div><ul className="resource-list">{(study.resources?.mindMap || []).map((item) => <li key={item}>{item}</li>)}</ul><div className="synoptic">{(study.resources?.synoptic || []).map((item) => <span key={item}>{item}</span>)}</div></article>
        <article className="study-card"><div className="card-heading"><Table2 size={18} /><h2>Tabla comparativa</h2></div><table><thead><tr><th>Concepto</th><th>Relación en el texto</th></tr></thead><tbody>{(study.resources?.comparison || []).map((row) => <tr key={row.concepto}><td>{row.concepto}</td><td>{row.relación}</td></tr>)}</tbody></table><div className="flashcards">{(study.resources?.flashcards || []).map((card) => <details key={card.front}><summary>{card.front}</summary><p>{card.back}</p></details>)}</div></article>
      </section>}

      {activeTab === 'atlas' && <section className="study-grid two-columns">
        <article className="study-card">
          <div className="card-heading"><Stethoscope size={18} /><h2>Generador de atlas anatómico</h2></div>
          <p className="muted">Elige una región y sistema. Cada ficha muestra descripción, relaciones, origen, inserción, inervación y función cuando esos campos aplican.</p>
          <div className="atlas-generator">
            <label>Región corporal<select value={atlasRegion} onChange={(event) => { setAtlasRegion(event.target.value); setGeneratedAtlas(null); }}>{atlasRegions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label>Sistema<select value={atlasSystem} onChange={(event) => { setAtlasSystem(event.target.value); setGeneratedAtlas(null); }}>{atlasSystems.map((system) => <option key={system} value={system}>{system}</option>)}</select></label>
            <button className="study-primary" onClick={generateAtlas}><Sparkles size={16} />Generar atlas detallado</button>
          </div>
          <p className="atlas-result" aria-live="polite">{generatedAtlas ? `${generatedAtlas.label}: ${visibleAtlasStructures.length} ficha(s).` : `${filteredAtlasStructures.length} ficha(s) disponibles con los filtros actuales.`}</p>
          <div className="atlas-chips">{visibleAtlasStructures.map((structure) => <button key={structure.id} className={selectedStructure.id === structure.id ? 'active' : ''} onClick={() => setSelectedStructure(structure)}>{structure.name}</button>)}</div>
          {selectedStructure && <div className="anatomy-card">
            <span>{selectedStructure.category} · {selectedStructure.system || 'Sistema no indicado'}</span><h3>{selectedStructure.name}</h3>
            {selectedStructure.description && <p className="anatomy-description">{selectedStructure.description}</p>}
            {selectedStructure.landmarks && <p><strong>Referencias anatómicas:</strong> {selectedStructure.landmarks}</p>}
            {selectedStructure.relations && <p><strong>Relaciones:</strong> {selectedStructure.relations}</p>}
            <dl><dt>Origen</dt><dd>{selectedStructure.origin}</dd><dt>Inserción</dt><dd>{selectedStructure.insertion}</dd><dt>Inervación</dt><dd>{selectedStructure.innervation}</dd><dt>Función</dt><dd>{selectedStructure.function}</dd></dl>
            {selectedStructure.clinicalNote && <p className="clinical-note"><strong>Clave clínica:</strong> {selectedStructure.clinicalNote}</p>}
          </div>}
          <p className="atlas-sources">Fuentes para ampliar el atlas: <a href="https://openstax.org/subjects/anatomy-and-physiology" target="_blank" rel="noreferrer">OpenStax Anatomy &amp; Physiology</a> · <a href="https://www.nlm.nih.gov/research/visible/index.html" target="_blank" rel="noreferrer">Visible Human Project (NLM)</a> · <a href="https://anatomy.app/help" target="_blank" rel="noreferrer">Anatomy.app</a>.</p>
        </article>
        <article className="study-card"><div className="card-heading"><Layers3 size={18} /><h2>Atlas de biología</h2></div><p className="muted">Selecciona un nivel para desplegar su ficha de estudio.</p><div className="biology-ladder">{biologyLevels.map(([level, explanation], index) => <button key={level} className={selectedBiologyLevel === index ? 'active' : ''} aria-pressed={selectedBiologyLevel === index} onClick={() => { setSelectedBiologyLevel(index); setStatus(`Nivel seleccionado: ${level}.`); }}><span>{index + 1}</span><div><strong>{level}</strong><p>{explanation}</p></div><ChevronRight size={16} /></button>)}</div><div className="biology-detail" aria-live="polite"><span>NIVEL {selectedBiologyLevel + 1}</span><h3>{biologyLevels[selectedBiologyLevel][0]}</h3><p>{biologyLevels[selectedBiologyLevel][1]}</p><p className="muted">Este nivel se integra con el siguiente para formar estructuras biológicas más complejas.</p></div></article>
      </section>}

      {activeTab === 'evaluacion' && <section className="study-grid two-columns">
        <article className="study-card"><div className="card-heading"><GraduationCap size={18} /><h2>Quiz acumulativo</h2></div><p className="muted">Incluye el tema activo y temas previamente completados. Los distractores provienen de términos del mismo material.</p>{study.resources?.examStyle && <p className="quiz-style">Formato docente aplicado: {study.resources.examStyle}</p>}{(study.resources?.quiz || []).map((question) => <div className="quiz-card" key={question.id}><span className="quiz-type">{question.type}</span><h3>{question.question}</h3>{question.type === 'multiple' && question.options.map((option) => <label key={option}><input type="radio" name={question.id} onChange={() => setQuizAnswers({ ...quizAnswers, [question.id]: option })} />{option}</label>)}{question.type === 'blank' && <input placeholder="Escribe la respuesta" onChange={(event) => setQuizAnswers({ ...quizAnswers, [question.id]: event.target.value })} />}{question.type === 'truefalse' && <div className="quiz-options"><button onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: 'verdadero' })}>Correcto</button><button onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: 'falso' })}>Incorrecto</button></div>}{question.type === 'match' && <div className="matching-list">{question.pairs.map((pair) => <label key={pair.left}><strong>{pair.left}</strong><select value={quizAnswers[question.id]?.[pair.left] || ''} onChange={(event) => setQuizAnswers((previous) => ({ ...previous, [question.id]: { ...(previous[question.id] || {}), [pair.left]: event.target.value } }))}><option value="">Selecciona la relación</option>{question.matchOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}</div>}<button className="study-primary" onClick={() => gradeQuiz(question)}>Comprobar</button>{quizFeedback[question.id] && <div className={quizFeedback[question.id].correct ? 'feedback success' : 'feedback error'}>{quizFeedback[question.id].explanation}{!quizFeedback[question.id].correct && <p>Si necesitas una aplicación clínica, añádela al material: la app no la inventará fuera del texto.</p>}</div>}</div>)}</article>
        <article className="study-card"><div className="card-heading"><FileUp size={18} /><h2>Formato del examen docente</h2></div><p>Sube una imagen o documento de referencia y registra su estructura para replicarla en prácticas futuras sin usar su contenido como respuesta.</p><input type="file" accept="image/*,.pdf,.docx" onChange={(event) => updateStudy({ examFormat: { ...study.examFormat, fileName: event.target.files[0]?.name || '' } })} /><textarea value={study.examFormat.description} onChange={(event) => updateStudy({ examFormat: { ...study.examFormat, description: event.target.value } })} placeholder="Ej.: 60% opción múltiple, 20% completar, dificultad media, preguntas con casos." />{study.examFormat.fileName && <p className="format-file">Referencia: {study.examFormat.fileName}</p>}<div className="exam-generator"><div><h3>Generar evaluación</h3><p className="muted">Elige los temas y la cantidad. Las preguntas se crean únicamente con el contenido del libro principal.</p></div><p className={`exam-source ${mainBook ? 'ready' : ''}`}><strong>Fuente de preguntas:</strong> {mainBook?.name || 'Sin libro principal'}</p>{!mainBook && <button className="study-secondary" onClick={() => setActiveTab('biblioteca')}>Ir a cargar libro principal</button>}<label className="exam-count">Preguntas<input type="number" min="4" max="30" value={examSettings.questionCount} onChange={(event) => updateStudy({ examSettings: { ...examSettings, questionCount: Math.max(4, Math.min(30, Number(event.target.value) || 4)) } })} /></label><div className="exam-topics">{study.learningOrder.length ? study.learningOrder.map((topic) => <label key={topic.id}><input type="checkbox" checked={examSettings.topicIds.includes(topic.id)} onChange={() => toggleExamTopic(topic.id)} />{topic.title}</label>) : <p className="muted">Carga un libro y organiza sus temas en el plan.</p>}</div><button className="study-primary" onClick={generateExam}><GraduationCap size={16} />Generar examen de temas seleccionados</button></div><div className="error-review"><h3>Errores para repasar ({study.mistakes.length})</h3>{study.mistakes.map((mistake) => <details key={mistake.id}><summary>{mistake.topic}</summary><p>{mistake.question}</p><small>{mistake.explanation}</small></details>)}</div></article>
      </section>}

      {activeTab === 'bioestadistica' && <section className="study-grid two-columns">
        <article className="study-card"><div className="card-heading"><Table2 size={18} /><h2>Asistente de prompts bioestadísticos</h2></div><p>Construye un prompt técnico con objetivo, variables, población y diseño metodológico.</p>{[['objective', 'Objetivo o pregunta clínica'], ['variable', 'Variables y escalas de medición'], ['population', 'Población, muestra y criterios'], ['design', 'Diseño, prueba estadística y nivel de significancia']].map(([field, label]) => <label className="study-field" key={field}>{label}<textarea value={bioPrompt[field]} onChange={(event) => setBioPrompt({ ...bioPrompt, [field]: event.target.value })} /></label>)}</article>
        <article className="study-card prompt-output"><div className="card-heading"><BrainCircuit size={18} /><h2>Prompt técnico preparado</h2></div><code>Actúa como asistente de bioestadística. Con base exclusivamente en los datos proporcionados, formula un plan de análisis. Objetivo: {bioPrompt.objective || '[definir]'}. Variables: {bioPrompt.variable || '[definir]'}. Población/muestra: {bioPrompt.population || '[definir]'}. Diseño y método: {bioPrompt.design || '[definir]'}. Explica supuestos, medidas descriptivas, prueba inferencial, intervalo de confianza y limitaciones; no inventes datos.</code><p className="muted">Este módulo enseña estructura metodológica; no sustituye asesoría estadística profesional.</p></article>
      </section>}
      {isExamModalOpen && <div className="exam-modal-backdrop" role="presentation" onMouseDown={() => setIsExamModalOpen(false)}><section className="exam-modal" role="dialog" aria-modal="true" aria-labelledby="exam-modal-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow">EVALUACIÓN GENERADA</span><h2 id="exam-modal-title">{study.resources?.title || 'Cuestionario'}</h2><p>{(study.resources?.quiz || []).length} preguntas · {Object.values(quizFeedback).filter((feedback) => feedback.correct).length} correctas comprobadas</p></div><button className="study-secondary" onClick={() => setIsExamModalOpen(false)}>Cerrar</button></header><div className="exam-modal-body">{(study.resources?.quiz || []).map((question, index) => <article className="exam-question" key={question.id}><span>Pregunta {index + 1} de {study.resources.quiz.length} · {question.type}</span><h3>{question.question}</h3>{question.type === 'multiple' && question.options.map((option) => <label key={option}><input type="radio" name={`exam-${question.id}`} checked={quizAnswers[question.id] === option} onChange={() => setQuizAnswers({ ...quizAnswers, [question.id]: option })} />{option}</label>)}{question.type === 'blank' && <input value={quizAnswers[question.id] || ''} placeholder="Escribe la respuesta" onChange={(event) => setQuizAnswers({ ...quizAnswers, [question.id]: event.target.value })} />}{question.type === 'truefalse' && <div className="quiz-options"><button className={quizAnswers[question.id] === 'verdadero' ? 'selected-answer' : ''} onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: 'verdadero' })}>Correcto</button><button className={quizAnswers[question.id] === 'falso' ? 'selected-answer' : ''} onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: 'falso' })}>Incorrecto</button></div>}{question.type === 'match' && <div className="matching-list">{question.pairs.map((pair) => <label key={pair.left}><strong>{pair.left}</strong><select value={quizAnswers[question.id]?.[pair.left] || ''} onChange={(event) => setQuizAnswers((previous) => ({ ...previous, [question.id]: { ...(previous[question.id] || {}), [pair.left]: event.target.value } }))}><option value="">Selecciona la relación</option>{question.matchOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}</div>}<button className="study-primary" onClick={() => gradeQuiz(question)}>Comprobar respuesta</button>{quizFeedback[question.id] && <div className={quizFeedback[question.id].correct ? 'feedback success' : 'feedback error'}>{quizFeedback[question.id].explanation}</div>}</article>)}</div></section></div>}
    </main>
  );
}
