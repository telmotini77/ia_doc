import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import ChatInterface from './components/ChatInterface';
import DocumentPreview from './components/DocumentPreview';

import { 
  generateLocalContent, 
  generateGeminiContent,
  NeuralClassifier,
  TRAINING_DATASET,
  fetchScientificPapers,
  fetchWikipediaSummary
} from './utils/documentGenerator';

import {
  downloadDOCX,
  downloadPDF,
  downloadXLSX,
  downloadPPTX,
  PPTX_PALETTES
} from './utils/exporters';

import './App.css';

export default function App() {
  // State variables
  const [prompt, setPrompt] = useState('');
  const [docType, setDocType] = useState('report'); // 'report', 'presentation', 'spreadsheet', 'petition', 'response'
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [modifyActive, setModifyActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [scientificSearch, setScientificSearch] = useState(true);
  
  // Machine Learning classifier state
  const [classifier, setClassifier] = useState(null);
  const [trainStats, setTrainStats] = useState(null);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [prediction, setPrediction] = useState(null);
  
  // Custom metadata (optional override)
  const [customMetadata, setCustomMetadata] = useState(false);
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [authors, setAuthors] = useState('');
  const [advisor, setAdvisor] = useState('');

  // Metadatos específicos para Oficios (petition / response)
  const [oficioDignatario, setOficioDignatario] = useState(''); // Dignidad / cargo a quien se dirige
  const [oficioSolicitante, setOficioSolicitante] = useState(''); // Nombre completo del solicitante
  const [oficioSolicitanteCedula, setOficioSolicitanteCedula] = useState(''); // Número de cédula
  const [oficioMotivo, setOficioMotivo] = useState(''); // Motivo de la solicitud / respuesta

  // Cover page visual customizations
  const [coverLogo, setCoverLogo] = useState('');
  const [coverAlign, setCoverAlign] = useState('left');
  const [coverSizes, setCoverSizes] = useState({
    title: 24,
    authors: 13,
    advisor: 13,
    course: 13,
    institution: 13,
    date: 11
  });

  // Excel chart selection state
  const [selectedCharts, setSelectedCharts] = useState(['pie', 'bar', 'line']);

  // AI configuration state
  const [aiMode, setAiMode] = useState(() => {
    return localStorage.getItem('docgenius_ai_mode') || 'local';
  });
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('docgenius_api_key') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // UI state
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSheet, setActiveSheet] = useState('hoja1');
  const [toast, setToast] = useState(null);

  // PowerPoint Presentation Styling state
  const [pptxPalette, setPptxPalette] = useState('galactic');
  const [customPptxPalette, setCustomPptxPalette] = useState({
    primary: '#AA3BFF',
    background: '#15111E',
    cardBg: '#20192B',
    title: '#DDBBFF',
    text: '#E5E3EB',
    muted: '#A5A0B2'
  });
  const [presentationStyle, setPresentationStyle] = useState('informe');

  // Document formatting state (for reports)
  const [reportFormat, setReportFormat] = useState({
    paperSize: 'carta',
    font: 'times12',
    margin: '2.54',
    spacing: '2.0',
    alignment: 'left',
    indent: '1.27',
    reportType: 'tecnico',
    formatPreset: 'apa7'
  });

  // Train the Neural Network Classifier on mount
  useEffect(() => {
    const initAndTrainModel = async () => {
      try {
        const model = new NeuralClassifier();
        const stats = await model.train();
        
        setClassifier(model);
        setTrainStats(stats);

        if (stats && stats.logs) {
          setTrainingLogs(stats.logs);
        } else {
          const logs = [
            `[INFO] Inicializando DocuGenius Neural Engine...`,
            `[INFO] Vocabulario indexado: ${stats.vocabSize} palabras únicas.`,
            `[INFO] Iniciando entrenamiento por Descenso de Gradiente (SGD) en navegador...`,
          ];
          stats.history.forEach((h) => {
            if (h.epoch === 1 || h.epoch % 30 === 0 || h.epoch === 150) {
              logs.push(`[ÉPOCA ${h.epoch}/150] Pérdida: ${h.loss.toFixed(4)} | Precisión: ${(h.accuracy * 100).toFixed(1)}%`);
            }
          });
          logs.push(`[INFO] ¡Entrenamiento completo! Red Neuronal lista.`);
          setTrainingLogs(logs);
        }
      } catch (err) {
        console.error(err);
        setTrainingLogs([`[ERROR] Error inicializando red neuronal: ${err.message}`]);
      }
    };

    initAndTrainModel();
  }, []);

  // Show auto-expiring toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleChartToggle = (chartType) => {
    setSelectedCharts(prev => {
      if (prev.includes(chartType)) {
        return prev.filter(t => t !== chartType);
      } else {
        return [...prev, chartType];
      }
    });
  };

  // Generate Document Action
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      showToast("Por favor, describe el tema o prompt para iniciar.", "error");
      return;
    }

    setLoading(true);
    setIsEditing(false); // Reset edit mode on new generation
    // Don't wipe generatedData if we are modifying it
    if (!modifyActive) {
      setGeneratedData(null);
    }
    setPrediction(null);
    setActiveSlide(0);
    setActiveSheet('hoja1');

    try {
      let data = null;
      let pred = null;
      let papers = [];
      let wikipediaResults = [];

      // Buscar artículos e información en internet si está habilitado
      if (scientificSearch && (docType === 'report' || docType === 'presentation' || docType === 'spreadsheet')) {
        try {
          showToast("Investigando el tema en internet...", "info");
          
          // Ejecutar búsquedas paralelas de Wikipedia y OpenAlex
          const [openAlexPapers, wikiData] = await Promise.all([
            fetchScientificPapers(prompt).catch(err => {
              console.error("OpenAlex fetch error:", err);
              return [];
            }),
            fetchWikipediaSummary(prompt).catch(err => {
              console.error("Wikipedia fetch error:", err);
              return [];
            })
          ]);

          papers = openAlexPapers;
          wikipediaResults = wikiData;

          let successMsgs = [];
          if (papers && papers.length > 0) {
            successMsgs.push(`${papers.length} artículos científicos`);
          }
          if (wikipediaResults && wikipediaResults.length > 0) {
            successMsgs.push(`${wikipediaResults.length} fuentes enciclopédicas`);
          }

          if (successMsgs.length > 0) {
            showToast(`¡Investigación exitosa! Encontrado: ${successMsgs.join(" y ")}.`, "success");
          } else {
            showToast("No se encontraron resultados específicos en internet. Usando base local...", "info");
          }
        } catch (sErr) {
          console.error("Internet research error:", sErr);
        }
      }

      // Classify with local neural classifier for metrics representation
      if (classifier) {
        try {
          pred = await classifier.predict(prompt);
          setPrediction(pred);
        } catch (cErr) {
          console.error("Local classifier error:", cErr);
        }
      }

      const customMetadataObj = customMetadata ? { title, institution, authors, advisor } : {};
      const activeDocContext = modifyActive && generatedData ? generatedData : null;

      if (aiMode === 'gemini' && geminiApiKey.trim()) {
        try {
          data = await generateGeminiContent(
            prompt, 
            docType, 
            geminiApiKey, 
            customMetadataObj, 
            attachedFiles, 
            reportFormat.reportType,
            activeDocContext,
            papers,
            wikipediaResults
          );
          
          if (data) {
            // Apply fallbacks if properties are not fully mapped in Gemini response
            if (!data.title) data.title = title.trim() || "Proyecto Tecnológico Integrador";
            if (!data.institution) data.institution = institution.trim() || "Instituto de Educación Superior y Tecnológica";
            
            if (data.type === 'spreadsheet' && data.hoja1) {
              if (!data.hoja1.proyecto) data.hoja1.proyecto = data.title;
              if (!data.hoja1.institucion) data.hoja1.institucion = data.institution;
            }
          }

          showToast(activeDocContext ? "¡Documento modificado por Gemini API con éxito!" : "¡Documento estructurado por Gemini API con éxito!", "success");
        } catch (apiErr) {
          console.warn("Gemini API failed, falling back to local Neural AI model:", apiErr);
          showToast("Gemini API Key inválida o error en red. Usando motor local gratuito...", "info");
          data = await generateLocalContent(prompt, docType, pred, reportFormat.reportType, activeDocContext, presentationStyle, papers, wikipediaResults);
        }
      } else {
        if (aiMode === 'gemini') {
          showToast("Falta ingresar la Gemini API Key. Usando motor local gratuito...", "info");
        }
        // Local generator
        data = await generateLocalContent(prompt, docType, pred, reportFormat.reportType, activeDocContext, presentationStyle, papers, wikipediaResults);
      }

      // Override metadata fields if customMetadata is checked
      if (customMetadata && data) {
        if (title.trim()) data.title = title;
        if (institution.trim()) {
          data.institution = institution;
          if (data.hoja1) data.hoja1.institucion = institution;
        }
        if (authors.trim()) {
          data.authors = authors;
          if (data.members !== undefined) data.members = authors;
          if (data.hoja1 && data.hoja1.integrantes) data.hoja1.integrantes = [authors];
        }
        if (advisor.trim()) {
          data.advisor = advisor;
          if (data.destinatario && data.destinatario.nombre) data.destinatario.nombre = advisor;
          if (data.firma && data.firma.nombre && docType === 'response') data.firma.nombre = advisor;
        }
      }

      // Oficios: override SIEMPRE activo (no requiere el toggle de customMetadata)
      if ((docType === 'petition' || docType === 'response') && data) {
        // Dignidad / cargo del destinatario
        if (oficioDignatario.trim()) {
          if (data.destinatario) {
            data.destinatario.cargo = oficioDignatario.trim();
            if (!data.destinatario.nombre || data.destinatario.nombre.includes('Lcda.') || data.destinatario.nombre.includes('Ciudadano')) {
              data.destinatario.nombre = oficioDignatario.trim();
            }
          }
        }
        // Nombre del solicitante
        if (oficioSolicitante.trim()) {
          if (docType === 'petition') {
            if (data.firma) data.firma.nombre = oficioSolicitante.trim();
            if (data.saludo) data.saludo = data.saludo.replace('Ing. Solicitante Responsable', oficioSolicitante.trim());
            if (data.cuerpoContexto) data.cuerpoContexto = data.cuerpoContexto.replace('Ing. Solicitante Responsable', oficioSolicitante.trim());
          } else {
            // En respuesta: el peticionario es el destinatario
            if (data.destinatario) data.destinatario.nombre = oficioSolicitante.trim();
            if (data.saludo) data.saludo = `Estimado/a ${oficioSolicitante.trim()}:`;
          }
        }
        // Cédula del solicitante
        if (oficioSolicitanteCedula.trim()) {
          if (docType === 'petition' && data.firma) {
            data.firma.cedula = oficioSolicitanteCedula.trim();
          } else if (docType === 'response' && data.destinatario) {
            data.destinatario.cedula = oficioSolicitanteCedula.trim();
          }
        }
        // Motivo de la solicitud / respuesta → asunto + cuerpo
        if (oficioMotivo.trim()) {
          data.asunto = oficioMotivo.trim();
          if (docType === 'petition' && data.cuerpoDesarrollo) {
            data.cuerpoDesarrollo = `El motivo que origina esta comunicación es: ${oficioMotivo.trim()}. La presente petición se sustenta en la necesidad de dar cumplimiento a los objetivos institucionales. Se adjuntan todos los documentos habilitantes que respaldan el presente requerimiento para su revisión y visto bueno.`;
          } else if (docType === 'response' && data.cuerpoRecepcion) {
            const base = data.cuerpoRecepcion.split(',')[0];
            data.cuerpoRecepcion = `${base}, en atención al asunto: ${oficioMotivo.trim()}. Una vez analizado el expediente presentado y verificado el cumplimiento de los requisitos formales establecidos, esta Dirección procede a emitir la siguiente resolución.`;
          }
        }
      }


      setGeneratedData(data);
      if (aiMode === 'local' && pred) {
        showToast(`¡Documento clasificado como '${pred.category.toUpperCase()}' y generado con éxito!`, "success");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error al clasificar o generar el documento.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Clear and reset everything (query, metadata, and color states)
  const handleClearAll = () => {
    // Clear query space
    setPrompt('');
    setGeneratedData(null);
    setPrediction(null);
    setAttachedFiles([]);
    setIsEditing(false);

    // Clear metadata
    setCustomMetadata(false);
    setTitle('');
    setInstitution('');
    setAuthors('');
    setAdvisor('');
    setOficioDignatario('');
    setOficioSolicitante('');
    setOficioSolicitanteCedula('');
    setOficioMotivo('');
    setCoverLogo('');
    setCoverAlign('left');
    setCoverSizes({
      title: 24,
      authors: 13,
      advisor: 13,
      course: 13,
      institution: 13,
      date: 11
    });

    // Reset color states to default
    setPptxPalette('galactic');
    setCustomPptxPalette({
      primary: '#AA3BFF',
      background: '#15111E',
      cardBg: '#20192B',
      title: '#DDBBFF',
      text: '#E5E3EB',
      muted: '#A5A0B2'
    });

    // Reset document formatting
    setReportFormat({
      paperSize: 'carta',
      font: 'times12',
      margin: '2.54',
      spacing: '2.0',
      alignment: 'left',
      indent: '1.27',
      reportType: 'tecnico',
      formatPreset: 'apa7'
    });

    // Reset slide and sheet navigation
    setActiveSlide(0);
    setActiveSheet('hoja1');

    showToast("Consulta, metadatos y estados de colores reiniciados a los valores predeterminados.", "info");
  };

  // Download Action
  const handleDownload = async (format) => {
    if (!generatedData) {
      showToast("Primero debes generar el documento.", "error");
      return;
    }

    try {
      const cleanTitle = (generatedData.title || "documento").replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 30);
      const baseFilename = `${cleanTitle.replace(/\s+/g, '_')}`;

      if (format === 'pdf') {
        downloadPDF(generatedData, docType, `${baseFilename}.pdf`, reportFormat, coverLogo, coverAlign, coverSizes);
        showToast("Descarga de PDF iniciada con éxito.", "success");
      } else if (format === 'word' && (docType === 'report' || docType === 'petition' || docType === 'response')) {
        await downloadDOCX(generatedData, docType, `${baseFilename}.docx`, reportFormat, coverLogo, coverAlign, coverSizes);
        showToast("Descarga de Word (.docx) iniciada.", "success");
      } else if ((format === 'excel' || format === 'excel-xlsx') && docType === 'spreadsheet') {
        downloadXLSX(generatedData, `${baseFilename}.xlsx`, selectedCharts, 'xlsx');
        showToast("Descarga de Excel (.xlsx) iniciada con éxito.", "success");
      } else if (format === 'excel-xls' && docType === 'spreadsheet') {
        downloadXLSX(generatedData, `${baseFilename}.xls`, selectedCharts, 'xls');
        showToast("Descarga de Excel 97-2003 (.xls) iniciada con éxito.", "success");
      } else if (format === 'csv' && docType === 'spreadsheet') {
        downloadXLSX(generatedData, `${baseFilename}.csv`, selectedCharts, 'csv', activeSheet);
        showToast(`Descarga de CSV (.csv) de la pestaña '${generatedData[activeSheet]?.titulo || 'Hoja'}' iniciada.`, "success");
      } else if (format === 'powerpoint' && docType === 'presentation') {
        const activePaletteColors = pptxPalette === 'custom' ? customPptxPalette : PPTX_PALETTES[pptxPalette];
        downloadPPTX(generatedData, `${baseFilename}.pptx`, activePaletteColors);
        showToast("Descarga de PowerPoint (.pptx) iniciada con éxito.", "success");
      } else {
        showToast("Este formato no corresponde al tipo de documento seleccionado.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error al exportar el archivo: " + err.message, "error");
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type} animate-slide-down`}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} />
          ) : toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main layout */}
      <div className="main-layout">
        <Sidebar
          docType={docType}
          setDocType={setDocType}
          customMetadata={customMetadata}
          setCustomMetadata={setCustomMetadata}
          title={title}
          setTitle={setTitle}
          institution={institution}
          setInstitution={setInstitution}
          authors={authors}
          setAuthors={setAuthors}
          advisor={advisor}
          setAdvisor={setAdvisor}
          oficioDignatario={oficioDignatario}
          setOficioDignatario={setOficioDignatario}
          oficioSolicitante={oficioSolicitante}
          setOficioSolicitante={setOficioSolicitante}
          oficioSolicitanteCedula={oficioSolicitanteCedula}
          setOficioSolicitanteCedula={setOficioSolicitanteCedula}
          oficioMotivo={oficioMotivo}
          setOficioMotivo={setOficioMotivo}
          selectedCharts={selectedCharts}
          onChartToggle={handleChartToggle}
          aiMode={aiMode}
          trainStats={trainStats}
          trainingLogs={trainingLogs}
          onOpenSettings={() => setIsSettingsOpen(true)}
          reportFormat={reportFormat}
          setReportFormat={setReportFormat}
          coverLogo={coverLogo}
          setCoverLogo={setCoverLogo}
          coverAlign={coverAlign}
          setCoverAlign={setCoverAlign}
          coverSizes={coverSizes}
          setCoverSizes={setCoverSizes}
          pptxPalette={pptxPalette}
          setPptxPalette={setPptxPalette}
          customPptxPalette={customPptxPalette}
          setCustomPptxPalette={setCustomPptxPalette}
          presentationStyle={presentationStyle}
          setPresentationStyle={setPresentationStyle}
        />

        <main className="workspace">
          <header className="workspace-header">
            <h1>Workspace de Generación de Documentos</h1>
            <p>
              Crea informes técnicos, diapositivas completas, hojas de cálculo estructuradas y correspondencia oficial con Inteligencia Artificial.
            </p>
          </header>

          <ChatInterface
            prompt={prompt}
            setPrompt={setPrompt}
            docType={docType}
            setDocType={setDocType}
            loading={loading}
            onSubmit={handleGenerate}
            prediction={prediction}
            aiMode={aiMode}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
            generatedData={generatedData}
            setGeneratedData={setGeneratedData}
            modifyActive={modifyActive}
            setModifyActive={setModifyActive}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            scientificSearch={scientificSearch}
            setScientificSearch={setScientificSearch}
          />

          <DocumentPreview
            docType={docType}
            loading={loading}
            generatedData={generatedData}
            activeSlide={activeSlide}
            setActiveSlide={setActiveSlide}
            activeSheet={activeSheet}
            setActiveSheet={setActiveSheet}
            selectedCharts={selectedCharts}
            prediction={prediction}
            onDownload={handleDownload}
            reportFormat={reportFormat}
            coverLogo={coverLogo}
            coverAlign={coverAlign}
            coverSizes={coverSizes}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setGeneratedData={setGeneratedData}
            pptxPalette={pptxPalette}
            customPptxPalette={customPptxPalette}
            presentationStyle={presentationStyle}
            onClearAll={handleClearAll}
          />
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiMode={aiMode}
        setAiMode={setAiMode}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
      />
    </div>
  );
}
