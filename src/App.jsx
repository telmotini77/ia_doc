import { useState, useEffect } from 'react';
import { 
  FileText, Play, Download, Sparkles, Settings, Cpu,
  ChevronLeft, ChevronRight, FileSpreadsheet, Presentation, Mail, 
  ArrowRight, Shield, Activity, GraduationCap, DollarSign, RefreshCw, 
  AlertCircle, CheckCircle, FileDown, BookOpen, Terminal, Percent
} from 'lucide-react';
import { 
  generateLocalContent, 
  downloadDOCX, 
  downloadPDF, 
  downloadXLSX, 
  downloadPPTX,
  NeuralClassifier,
  TRAINING_DATASET,
  parseSlideText
} from './utils/documentGenerator';
import './App.css';

function App() {
  // State variables
  const [prompt, setPrompt] = useState('');
  const [docType, setDocType] = useState('report'); // 'report', 'presentation', 'spreadsheet', 'petition', 'response'
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  
  // Machine Learning classifier state
  const [classifier, setClassifier] = useState(null);
  const [trainStats, setTrainStats] = useState(null);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [showConsole, setShowConsole] = useState(true);
  
  // Custom metadata (optional override)
  const [customMetadata, setCustomMetadata] = useState(false);
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [authors, setAuthors] = useState('');
  const [advisor, setAdvisor] = useState('');

  // Excel chart selection state
  const [selectedCharts, setSelectedCharts] = useState(['pie', 'bar', 'line']);

  // UI state
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSheet, setActiveSheet] = useState('hoja1');
  const [toast, setToast] = useState(null);

  // Train the Neural Network Classifier on mount (takes <10ms but we log it visually)
  useEffect(() => {
    try {
      const model = new NeuralClassifier();
      const stats = model.train(TRAINING_DATASET, 60, 0.25);
      
      setClassifier(model);
      setTrainStats(stats);

      // Create detailed visual console logs of training epochs
      const logs = [
        `[INFO] Inicializando DocuGenius Neural Engine...`,
        `[INFO] Cargando dataset: ${TRAINING_DATASET.length} frases etiquetadas en español...`,
        `[INFO] Vocabulario indexado: ${stats.vocabSize} palabras únicas.`,
        `[INFO] Iniciando entrenamiento por Descenso de Gradiente (SGD) en navegador...`,
      ];

      // Extract loss checkpoints every 10 epochs
      stats.history.forEach((h) => {
        if (h.epoch === 1 || h.epoch % 15 === 0 || h.epoch === 60) {
          logs.push(`[ÉPOCA ${h.epoch}/60] Pérdida: ${h.loss.toFixed(4)} | Precisión: ${(h.accuracy * 100).toFixed(1)}%`);
        }
      });

      logs.push(`[INFO] ¡Entrenamiento completo! Red Neuronal lista.`);
      setTrainingLogs(logs);
    } catch (err) {
      console.error(err);
      setTrainingLogs([`[ERROR] Error inicializando red neuronal: ${err.message}`]);
    }
  }, []);

  // Show auto-expiring toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Suggestion pills
  const suggestions = [
    { 
      label: "Riego Automatizado", 
      prompt: "Diseña un sistema de riego automatizado con sensores de humedad de suelo y ESP32 en un huerto de hortalizas por Telmo y equipo.",
      type: "report"
    },
    { 
      label: "Auditoría Seguridad", 
      prompt: "Auditoría de ciberseguridad sobre la infraestructura de red corporativa aplicando controles ISO 27001 por el Consultor Telmo.",
      type: "presentation"
    },
    { 
      label: "E-Commerce", 
      prompt: "Plataforma de comercio electrónico con carrito de compras y pasarela de pago Stripe para tiendas locales por Ing. Telmo.",
      type: "spreadsheet"
    },
    { 
      label: "LMS Aula Virtual", 
      prompt: "Crear un sistema de aula virtual adaptativa y LMS de aprendizaje personalizado para la Universidad Central por Profesor Telmo.",
      type: "petition"
    },
    { 
      label: "Telemedicina", 
      prompt: "Sistema de telemedicina con expedientes clínicos HL7 y consulta médica WebRTC remota por Telmo y Asistentes.",
      type: "response"
    }
  ];

  const handleSuggestionClick = (sug) => {
    setPrompt(sug.prompt);
    setDocType(sug.type);
    showToast("Sugerencia cargada. Haz clic en 'Generar Documento'.", "info");
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
    e.preventDefault();
    if (!prompt.trim()) {
      showToast("Por favor, describe el tema o prompt para iniciar.", "error");
      return;
    }

    if (!classifier) {
      showToast("La Red Neuronal local se está inicializando. Espera un momento.", "error");
      return;
    }

    setLoading(true);
    setGeneratedData(null);
    setPrediction(null);
    setActiveSlide(0);
    setActiveSheet('hoja1');

    try {
      // 1. Run Machine Learning Local Prediction
      const pred = classifier.predict(prompt);
      setPrediction(pred);

      // 2. Generate structured document passing prediction data
      const data = generateLocalContent(prompt, docType, pred);

      // Override metadata if custom metadata fields were filled out
      if (customMetadata) {
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

      setGeneratedData(data);
      showToast(`¡Documento clasificado como '${pred.category.toUpperCase()}' y generado con éxito!`, "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error al clasificar o generar el documento.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Download Actions
  const handleDownload = async (format) => {
    if (!generatedData) {
      showToast("Primero debes generar el documento.", "error");
      return;
    }

    try {
      const cleanTitle = generatedData.title.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 30);
      const baseFilename = `${cleanTitle.replace(/\s+/g, '_')}`;

      if (format === 'pdf') {
        downloadPDF(generatedData, docType, `${baseFilename}.pdf`);
        showToast("Descarga de PDF iniciada con éxito.", "success");
      } else if (format === 'word' && (docType === 'report' || docType === 'petition' || docType === 'response')) {
        await downloadDOCX(generatedData, docType, `${baseFilename}.docx`);
        showToast("Descarga de Word (.docx) iniciada.", "success");
      } else if (format === 'excel' && docType === 'spreadsheet') {
        downloadXLSX(generatedData, `${baseFilename}.xlsx`, selectedCharts);
        showToast("Descarga de Excel (.xlsx) iniciada con éxito.", "success");
      } else if (format === 'powerpoint' && docType === 'presentation') {
        downloadPPTX(generatedData, `${baseFilename}.pptx`);
        showToast("Descarga de PowerPoint (.pptx) iniciada.", "success");
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
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : toast.type === 'success' ? <CheckCircle size={18} /> : <Sparkles size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        
        {/* SIDEBAR: Configuration Panel */}
        <aside className="sidebar">
          <div className="brand">
            <Cpu className="logo-sparkle" size={24} />
            <h2>DocuGenius <span className="logo-badge">Neural AI</span></h2>
          </div>

          {/* ML Training Status Console */}
          <div className="sidebar-section">
            <div className="metadata-header" onClick={() => setShowConsole(!showConsole)}>
              <h3><Terminal size={13} /> CONSOLA NEURONAL ML</h3>
              <span className={`arrow-toggle ${showConsole ? 'rotated' : ''}`}>▼</span>
            </div>
            
            {showConsole && (
              <div className="ml-console-wrapper slide-down">
                <div className="ml-status-bar">
                  <span className="ml-status-dot trained"></span>
                  <span className="ml-status-text">Red Neuronal Activa</span>
                </div>
                
                <div className="ml-stats-grid">
                  <div className="ml-stat-card">
                    <span className="ml-stat-val">{trainStats?.vocabSize || 0}</span>
                    <span className="ml-stat-lbl">Vocabulario</span>
                  </div>
                  <div className="ml-stat-card">
                    <span className="ml-stat-val">{trainStats?.finalLoss.toFixed(3) || "0.000"}</span>
                    <span className="ml-stat-lbl">Pérdida (Loss)</span>
                  </div>
                  <div className="ml-stat-card">
                    <span className="ml-stat-val">{(trainStats?.finalAccuracy * 100).toFixed(0) || 0}%</span>
                    <span className="ml-stat-lbl">Precisión</span>
                  </div>
                </div>

                <div className="ml-console-logs">
                  {trainingLogs.map((log, index) => (
                    <div key={index} className="ml-log-line">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>TIPO DE DOCUMENTO</h3>
            <div className="doc-type-list">
              <button 
                type="button"
                className={docType === 'report' ? 'active' : ''} 
                onClick={() => setDocType('report')}
              >
                <FileText size={16} />
                <div className="btn-lbl">
                  <span>Informe Académico / Técnico</span>
                  <small>Word (.docx) / PDF</small>
                </div>
              </button>

              <button 
                type="button"
                className={docType === 'presentation' ? 'active' : ''} 
                onClick={() => setDocType('presentation')}
              >
                <Presentation size={16} />
                <div className="btn-lbl">
                  <span>Presentación de Slides</span>
                  <small>PowerPoint (.pptx)</small>
                </div>
              </button>

              <button 
                type="button"
                className={docType === 'spreadsheet' ? 'active' : ''} 
                onClick={() => setDocType('spreadsheet')}
              >
                <FileSpreadsheet size={16} />
                <div className="btn-lbl">
                  <span>Hoja de Cálculo</span>
                  <small>Excel (.xlsx)</small>
                </div>
              </button>

              <button 
                type="button"
                className={docType === 'petition' ? 'active' : ''} 
                onClick={() => setDocType('petition')}
              >
                <Mail size={16} />
                <div className="btn-lbl">
                  <span>Oficio de Petición Formal</span>
                  <small>Word (.docx) / PDF</small>
                </div>
              </button>

              <button 
                type="button"
                className={docType === 'response' ? 'active' : ''} 
                onClick={() => setDocType('response')}
              >
                <Mail size={16} />
                <div className="btn-lbl">
                  <span>Oficio de Respuesta Formal</span>
                  <small>Word (.docx) / PDF</small>
                </div>
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="metadata-header" onClick={() => setCustomMetadata(!customMetadata)}>
              <h3>METADATOS PERSONALIZADOS</h3>
              <span className={`arrow-toggle ${customMetadata ? 'rotated' : ''}`}>▼</span>
            </div>
            {customMetadata && (
              <div className="metadata-form slide-down">
                <div className="form-group">
                  <label>Título del Proyecto</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Auto-detectado por la IA" />
                </div>
                <div className="form-group">
                  <label>Institución / Entidad</label>
                  <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Ej: Universidad Central" />
                </div>
                <div className="form-group">
                  <label>Integrantes / Autores</label>
                  <input type="text" value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="Ej: Juan Pérez, María Gómez" />
                </div>
                <div className="form-group">
                  <label>Docente / Supervisor</label>
                  <input type="text" value={advisor} onChange={(e) => setAdvisor(e.target.value)} placeholder="Ej: Dr. Alfonso Ramos" />
                </div>
              </div>
            )}
          </div>

          {docType === 'spreadsheet' && (
            <div className="sidebar-section slide-down">
              <h3>GRÁFICOS PARA EXCEL</h3>
              <div className="chart-selector-list">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedCharts.includes('pie')} 
                    onChange={() => handleChartToggle('pie')} 
                  />
                  <span className="checkmark"></span>
                  <div className="checkbox-lbl">
                    <span>Diagrama de Pastel (Torta)</span>
                    <small>Proporción y distribución</small>
                  </div>
                </label>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedCharts.includes('bar')} 
                    onChange={() => handleChartToggle('bar')} 
                  />
                  <span className="checkmark"></span>
                  <div className="checkbox-lbl">
                    <span>Gráfico de Barras</span>
                    <small>Comparativa entre fases</small>
                  </div>
                </label>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedCharts.includes('line')} 
                    onChange={() => handleChartToggle('line')} 
                  />
                  <span className="checkmark"></span>
                  <div className="checkbox-lbl">
                    <span>Gráfico de Líneas</span>
                    <small>Tendencia de cumplimiento</small>
                  </div>
                </label>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="workspace">
          
          {/* Header Banner */}
          <header className="workspace-header">
            <h1>Generador de Documentos por Red Neuronal Local</h1>
            <p>Escribe tu requerimiento. Una Red Neuronal Artificial monocapa tokenizará y clasificará semánticamente tu prompt en el navegador para redactar el documento.</p>
          </header>

          {/* Prompt Entry Box */}
          <section className="prompt-container">
            <form onSubmit={handleGenerate}>
              <div className="prompt-box">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe de qué trata tu proyecto. Ej: 'Crea un informe sobre un sistema de riego inteligente con sensores de humedad de suelo y ESP32 por Telmo'..."
                  rows="3"
                />
                <button type="submit" className={`btn-generate ${loading ? 'loading' : ''}`} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="spinner" size={18} />
                      <span>Clasificando...</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      <span>Generar</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Suggestion Pills */}
            <div className="suggestions-bar">
              <span>Sugerencias de entrenamiento:</span>
              <div className="pills-scroll">
                {suggestions.map((sug, idx) => (
                  <button 
                    key={idx}
                    type="button" 
                    className="pill" 
                    onClick={() => handleSuggestionClick(sug)}
                  >
                    {sug.type === 'report' && <FileText size={12} />}
                    {sug.type === 'presentation' && <Presentation size={12} />}
                    {sug.type === 'spreadsheet' && <FileSpreadsheet size={12} />}
                    {sug.type === 'petition' && <Mail size={12} />}
                    {sug.type === 'response' && <Mail size={12} />}
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* PREVIEW CONTAINER */}
          <section className="preview-container">
            
            {/* Top Preview Action Bar */}
            <div className="preview-header">
              <div className="preview-title-block">
                <h2><BookOpen size={16} /> Previsualización</h2>
                {prediction && (
                  <div className="ml-prediction-badge">
                    <Percent size={11} />
                    <span>Clasificado: <strong>{prediction.category.toUpperCase()}</strong> ({ (prediction.confidence * 100).toFixed(0) }% de confianza neuronal)</span>
                  </div>
                )}
              </div>
              
              {generatedData && (
                <div className="preview-actions">
                  {(docType === 'report' || docType === 'petition' || docType === 'response') && (
                    <>
                      <button type="button" className="btn-action word" onClick={() => handleDownload('word')}>
                        <FileDown size={14} /> Word (.docx)
                      </button>
                      <button type="button" className="btn-action pdf" onClick={() => handleDownload('pdf')}>
                        <Download size={14} /> PDF (.pdf)
                      </button>
                    </>
                  )}

                  {docType === 'presentation' && (
                    <button type="button" className="btn-action pptx" onClick={() => handleDownload('powerpoint')}>
                      <Presentation size={14} /> PowerPoint (.pptx)
                    </button>
                  )}

                  {docType === 'spreadsheet' && (
                    <button type="button" className="btn-action xlsx" onClick={() => handleDownload('excel')}>
                      <FileSpreadsheet size={14} /> Excel (.xlsx)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Preview Body */}
            <div className="preview-canvas">
              {loading ? (
                <div className="canvas-state">
                  <div className="skeleton-loader">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line header"></div>
                    <div className="skeleton-line body"></div>
                    <div className="skeleton-line body"></div>
                    <div className="skeleton-line body"></div>
                  </div>
                  <p>La Red Neuronal está clasificando el texto y estructurando los bloques de información...</p>
                </div>
              ) : generatedData ? (
                
                // RENDER PREVIEW BASED ON TYPE
                <div className="canvas-content animate-fade-in">
                  
                  {/* TYPE A: Report Preview */}
                  {docType === 'report' && (
                    <div className="preview-report">
                      <div className="pdf-page cover-page">
                        <div className="cover-stripe"></div>
                        <div className="cover-details">
                          <p className="cover-inst">{generatedData.institution}</p>
                          <p className="cover-dept">{generatedData.department}</p>
                          <h1 className="cover-title">{generatedData.title}</h1>
                          <p className="cover-subtitle">INFORME TÉCNICO DE INVESTIGACIÓN</p>
                          <div className="cover-meta">
                            <p><strong>INTEGRANTES:</strong> {generatedData.authors}</p>
                            <p><strong>DOCENTE:</strong> {generatedData.advisor}</p>
                          </div>
                          <p className="cover-date">{generatedData.place}, {generatedData.date}</p>
                        </div>
                      </div>

                      <div className="pdf-page">
                        <h2>Resumen</h2>
                        <p>{generatedData.abstract.resumen}</p>
                        
                        <h2 style={{ marginTop: '24px' }}>Abstract</h2>
                        <p style={{ fontStyle: 'italic' }}>{generatedData.abstract.abstract}</p>
                      </div>

                      <div className="pdf-page">
                        <h2>1. Introducción</h2>
                        <p>{generatedData.introduccion}</p>

                        <h2>2. Objetivos</h2>
                        <h3>2.1. Objetivo General</h3>
                        <p>{generatedData.objetivos.general}</p>
                        
                        <h3>2.2. Objetivos Específicos</h3>
                        <ul>
                          {generatedData.objetivos.especificos.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pdf-page">
                        <h2>3. Marco Teórico</h2>
                        <p>{generatedData.marcoTeorico}</p>

                        <h2>4. Metodología</h2>
                        <p><strong>Tipo de Investigación:</strong> {generatedData.metodologia.tipo}</p>
                        <p><strong>Herramientas:</strong> {generatedData.metodologia.herramientas}</p>
                        <p><strong>Materiales:</strong> {generatedData.metodologia.materiales}</p>
                        <p><strong>Fases del Ciclo:</strong> {generatedData.metodologia.fases}</p>
                        <h3>Procedimiento Operativo:</h3>
                        <p>{generatedData.metodologia.procedimiento}</p>
                      </div>

                      <div className="pdf-page">
                        <h2>5. Desarrollo del Proyecto</h2>
                        <p>{generatedData.desarrollo}</p>

                        <h2>6. Resultados y Discusión</h2>
                        <p>{generatedData.resultados.descripcion}</p>
                        
                        <table className="preview-table">
                          <thead>
                            <tr>
                              <th>Métrica Evaluada</th>
                              <th>Antes (Sin Proyecto)</th>
                              <th>Después (Con Proyecto)</th>
                              <th>Mejora (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedData.resultados.tablaResultados.map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.metrica}</td>
                                <td>{row.sinProyecto}</td>
                                <td>{row.conProyecto}</td>
                                <td className="text-highlight">{row.mejora}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        <h3 style={{ marginTop: '20px' }}>Discusión</h3>
                        <p>{generatedData.discusion}</p>
                      </div>

                      <div className="pdf-page">
                        <h2>7. Conclusiones</h2>
                        <ol>
                          {generatedData.conclusiones.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ol>

                        <h2>8. Recomendaciones</h2>
                        <ol>
                          {generatedData.recomendaciones.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ol>

                        <h2>9. Referencias Bibliográficas</h2>
                        <ul className="ref-list">
                          {generatedData.referencias.map((ref, i) => (
                            <li key={i}>{ref}</li>
                          ))}
                        </ul>

                        <h2>Anexos</h2>
                        <p style={{ whiteSpace: 'pre-line' }}>{generatedData.anexos}</p>
                      </div>
                    </div>
                  )}

                  {/* TYPE B: Presentation Preview */}
                  {docType === 'presentation' && (
                    <div className="preview-presentation">
                      <div className="slideshow-container">
                        <div className="slide-card animate-fade-in" key={activeSlide}>
                          <div className="slide-side-accent"></div>
                          
                          {activeSlide === 0 ? (
                            // Slide 1 Layout (Cover)
                            <div className="slide-cover">
                              <span className="slide-inst">{generatedData.institution}</span>
                              <h2 className="slide-main-title">{generatedData.title}</h2>
                              <div className="slide-members">
                                <p><strong>Autores:</strong> {generatedData.members}</p>
                                <p><strong>Fecha:</strong> {generatedData.date}</p>
                              </div>
                            </div>
                          ) : (
                            // Standard Slide Layout
                            <div className="slide-body-content">
                              <div className="slide-header-block">
                                <span className="slide-num">Slide {generatedData.slides[activeSlide].num}</span>
                                <h2>{generatedData.slides[activeSlide].title}</h2>
                              </div>
                              
                              {(() => {
                                const parsed = parseSlideText(generatedData.slides[activeSlide].content);
                                
                                if (parsed.type === 'table') {
                                  return (
                                    <div className="slide-text">
                                      <table className="slide-table">
                                        <tbody>
                                          {parsed.raw.split("\n").filter(l => l.trim().length > 0 && !l.includes("---")).map((line, lIdx) => (
                                            <tr key={lIdx} className={lIdx === 0 ? 'th-row' : ''}>
                                              {line.split("|").map((cell, cIdx) => (
                                                <td key={cIdx}>{cell.trim()}</td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                } else {
                                  const blocks = parsed.data;
                                  if (blocks.length === 2) {
                                    const leftBlock = blocks[0];
                                    const rightBlock = blocks[1];

                                    const leftLength = leftBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (leftBlock.title?.length || 0);
                                    const leftCount = leftBlock.bullets.length;
                                    let leftFontSize = '13px';
                                    let leftTitleSize = '15px';
                                    let leftGap = '6px';
                                    if (leftLength > 300 || leftCount > 5) {
                                      leftFontSize = '10.5px';
                                      leftTitleSize = '13px';
                                      leftGap = '4px';
                                    } else if (leftLength > 150 || leftCount > 3) {
                                      leftFontSize = '11.5px';
                                      leftTitleSize = '14px';
                                      leftGap = '5px';
                                    }

                                    const rightLength = rightBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (rightBlock.title?.length || 0);
                                    const rightCount = rightBlock.bullets.length;
                                    let rightFontSize = '13px';
                                    let rightTitleSize = '15px';
                                    let rightGap = '6px';
                                    if (rightLength > 300 || rightCount > 5) {
                                      rightFontSize = '10.5px';
                                      rightTitleSize = '13px';
                                      rightGap = '4px';
                                    } else if (rightLength > 150 || rightCount > 3) {
                                      rightFontSize = '11.5px';
                                      rightTitleSize = '14px';
                                      rightGap = '5px';
                                    }

                                    return (
                                      <div className="slide-dual-layout">
                                        <div className="slide-col-card" style={{ gap: leftGap }}>
                                          {leftBlock.title && <h4 style={{ fontSize: leftTitleSize }}>{leftBlock.title}</h4>}
                                          <ul className="slide-ul" style={{ gap: leftGap }}>
                                            {leftBlock.bullets.map((bullet, idx) => (
                                              <li key={idx} style={{ fontSize: leftFontSize }} className={bullet.length > 2 ? 'bullet' : 'para-line'}>{bullet}</li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div className="slide-col-card" style={{ gap: rightGap }}>
                                          {rightBlock.title && <h4 style={{ fontSize: rightTitleSize }}>{rightBlock.title}</h4>}
                                          <ul className="slide-ul" style={{ gap: rightGap }}>
                                            {rightBlock.bullets.map((bullet, idx) => (
                                              <li key={idx} style={{ fontSize: rightFontSize }} className={bullet.length > 2 ? 'bullet' : 'para-line'}>{bullet}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    const mainBlock = blocks[0] || { title: "", bullets: [] };
                                    const mainLength = mainBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (mainBlock.title?.length || 0);
                                    const mainCount = mainBlock.bullets.length;
                                    let mainFontSize = '14.5px';
                                    let mainTitleSize = '17px';
                                    let mainGap = '8px';
                                    if (mainLength > 450 || mainCount > 6) {
                                      mainFontSize = '11.5px';
                                      mainTitleSize = '14px';
                                      mainGap = '4px';
                                    } else if (mainLength > 250 || mainCount > 4) {
                                      mainFontSize = '13px';
                                      mainTitleSize = '15.5px';
                                      mainGap = '6px';
                                    }

                                    return (
                                      <div className="slide-single-layout">
                                        <div className="slide-single-card" style={{ gap: mainGap }}>
                                          {mainBlock.title && <h4 style={{ fontSize: mainTitleSize }}>{mainBlock.title}</h4>}
                                          <ul className="slide-ul" style={{ gap: mainGap }}>
                                            {mainBlock.bullets.map((bullet, idx) => (
                                              <li key={idx} style={{ fontSize: mainFontSize }} className={bullet.length > 2 && !bullet.includes("Contacto:") ? 'bullet' : 'para-line'}>{bullet}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    );
                                  }
                                }
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Navigation controls */}
                        <div className="slideshow-controls">
                          <button 
                            type="button" 
                            disabled={activeSlide === 0} 
                            onClick={() => setActiveSlide(activeSlide - 1)}
                            className="btn-slide-nav"
                          >
                            <ChevronLeft size={16} /> Anterior
                          </button>
                          
                          <span className="slide-index">Diapositiva {activeSlide + 1} de {generatedData.slides.length}</span>
                          
                          <button 
                            type="button" 
                            disabled={activeSlide === generatedData.slides.length - 1} 
                            onClick={() => setActiveSlide(activeSlide + 1)}
                            className="btn-slide-nav"
                          >
                            Siguiente <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TYPE C: Spreadsheet Preview */}
                  {docType === 'spreadsheet' && (
                    <div className="preview-spreadsheet">
                      {/* Excel Tabs */}
                      <div className="excel-tabs">
                        {['hoja1', 'hoja2', 'hoja3', 'hoja4', 'hoja5', 'hoja6', 'hoja7'].map((sheetKey) => {
                          const tabTitle = generatedData[sheetKey].titulo;
                          return (
                            <button
                              key={sheetKey}
                              type="button"
                              className={`excel-tab ${activeSheet === sheetKey ? 'active' : ''}`}
                              onClick={() => setActiveSheet(sheetKey)}
                            >
                              {tabTitle}
                            </button>
                          );
                        })}
                      </div>

                      {/* Sheet Grid View */}
                      <div className="excel-grid-container">
                        {activeSheet === 'hoja1' && (
                          <table className="excel-table grid">
                            <tbody>
                              <tr><td className="cell-header bold-cell">{generatedData.hoja1.titulo}</td><td></td></tr>
                              <tr><td></td><td></td></tr>
                              <tr><td className="bold-cell gray-cell">PROYECTO:</td><td>{generatedData.hoja1.proyecto}</td></tr>
                              <tr><td className="bold-cell gray-cell">INSTITUCIÓN:</td><td>{generatedData.hoja1.institucion}</td></tr>
                              <tr><td className="bold-cell gray-cell">INTEGRANTES:</td><td>{generatedData.hoja1.integrantes.join(", ")}</td></tr>
                              <tr><td className="bold-cell gray-cell">FECHA:</td><td>{generatedData.hoja1.fecha}</td></tr>
                            </tbody>
                          </table>
                        )}

                        {activeSheet === 'hoja2' && (
                          <table className="excel-table grid">
                            <thead>
                              <tr>
                                {generatedData.hoja2.headers.map((h, i) => <th key={i}>{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {generatedData.hoja2.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => {
                                    if (cIdx === 4) {
                                      const statusClass = cell.toLowerCase().includes('completado') 
                                        ? 'completed' 
                                        : cell.toLowerCase().includes('progreso') 
                                          ? 'in-progress' 
                                          : 'pending';
                                      return <td key={cIdx} className={`status-pill ${statusClass}`}>{cell}</td>;
                                    }
                                    return <td key={cIdx}>{cell}</td>;
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {activeSheet === 'hoja3' && (
                          <table className="excel-table grid">
                            <thead>
                              <tr>
                                {generatedData.hoja3.headers.map((h, i) => <th key={i}>{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {generatedData.hoja3.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  <td>{row[0]}</td>
                                  <td className="num-cell">{row[1]}</td>
                                  <td className="num-cell">${Number(row[2]).toFixed(2)}</td>
                                  <td className="num-cell bold-cell">${Number(row[3]).toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr className="total-row">
                                <td className="bold-cell">{generatedData.hoja3.formulas.label}</td>
                                <td></td>
                                <td></td>
                                <td className="num-cell bold-cell text-purple">${Number(generatedData.hoja3.formulas.value).toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {activeSheet === 'hoja4' && (
                          <table className="excel-table grid">
                            <thead>
                              <tr>
                                {generatedData.hoja4.headers.map((h, i) => <th key={i}>{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {generatedData.hoja4.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => <td key={cIdx} className={cIdx === 1 ? 'bold-cell' : ''}>{cell}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {activeSheet === 'hoja5' && (
                          <table className="excel-table grid">
                            <thead>
                              <tr>
                                {generatedData.hoja5.headers.map((h, i) => <th key={i}>{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {generatedData.hoja5.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  <td>{row[0]}</td>
                                  <td>{row[1]}</td>
                                  <td>{row[2]}</td>
                                  <td className="num-cell bold-cell">{row[3]}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {activeSheet === 'hoja6' && (
                          <div className="excel-charts-tab-layout">
                            <div className="excel-table-wrapper">
                              <table className="excel-table grid">
                                <thead>
                                  <tr>
                                    {generatedData.hoja6.headers.map((h, i) => <th key={i}>{h}</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  {generatedData.hoja6.rows.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                      <td>{row[0]}</td>
                                      <td className="num-cell">{row[1]}</td>
                                      <td className="num-cell">{row[2]}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              
                              <div className="excel-chart-notice">
                                <AlertCircle size={14} style={{ color: '#AA3BFF' }} />
                                <span>Los datos de esta tabla se representarán en los gráficos activos a la derecha.</span>
                              </div>
                            </div>
                            
                            <div className="excel-charts-grid">
                              {selectedCharts.length === 0 ? (
                                <div className="excel-chart-card empty-state">
                                  <AlertCircle size={28} />
                                  <p>No se ha seleccionado ningún gráfico en la barra lateral. Activa al menos uno para visualizarlo.</p>
                                </div>
                              ) : (
                                <>
                                  {selectedCharts.includes('pie') && (
                                    <div className="excel-chart-card animate-fade-in">
                                      <h4>Diagrama de Pastel (Proporción Real)</h4>
                                      <svg width="360" height="230" viewBox="0 0 360 230">
                                        {(() => {
                                          const values = generatedData.hoja6.rows.map(r => Number(r[2]));
                                          const labels = generatedData.hoja6.rows.map(r => r[0]);
                                          const total = values.reduce((s, v) => s + v, 0);
                                          const colors = ['#AA3BFF', '#10B981', '#3B82F6', '#F59E0B'];
                                          
                                          let currentAngle = 0;
                                          return (
                                            <g>
                                              {values.map((val, idx) => {
                                                const angle = (val / total) * 360;
                                                const startAngle = currentAngle;
                                                const endAngle = currentAngle + angle;
                                                currentAngle = endAngle;
                                                
                                                const cx = 110, cy = 115, r = 70, ir = 42;
                                                const rad = Math.PI / 180;
                                                const offset = -90;
                                                
                                                const x1 = cx + r * Math.cos((startAngle + offset) * rad);
                                                const y1 = cy + r * Math.sin((startAngle + offset) * rad);
                                                const x2 = cx + r * Math.cos((endAngle + offset) * rad);
                                                const y2 = cy + r * Math.sin((endAngle + offset) * rad);
                                                
                                                const ix1 = cx + ir * Math.cos((endAngle + offset) * rad);
                                                const iy1 = cy + ir * Math.sin((endAngle + offset) * rad);
                                                const ix2 = cx + ir * Math.cos((startAngle + offset) * rad);
                                                const iy2 = cy + ir * Math.sin((startAngle + offset) * rad);
                                                
                                                const largeArcFlag = angle <= 180 ? 0 : 1;
                                                const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${largeArcFlag} 0 ${ix2} ${iy2} Z`;
                                                
                                                return (
                                                  <g key={idx} className="chart-donut-slice">
                                                    <path d={pathData} fill={colors[idx]} stroke="#fff" strokeWidth="1" />
                                                    <rect x="200" y={40 + idx * 30} width="12" height="12" rx="2" fill={colors[idx]} />
                                                    <text x="218" y={50 + idx * 30} fill="#333" fontSize="10.5" fontWeight="600">
                                                      {labels[idx].split(" - ")[1] || labels[idx]}: {val}
                                                    </text>
                                                  </g>
                                                );
                                              })}
                                              <circle cx="110" cy="115" r="30" fill="#fff" />
                                              <text x="110" y="119" textAnchor="middle" fill="#555" fontSize="11" fontWeight="800">
                                                Real
                                              </text>
                                            </g>
                                          );
                                        })()}
                                      </svg>
                                    </div>
                                  )}

                                  {selectedCharts.includes('bar') && (
                                    <div className="excel-chart-card animate-fade-in">
                                      <h4>Gráfico de Barras (Meta vs Real)</h4>
                                      <svg width="360" height="230" viewBox="0 0 360 230">
                                        <line x1="45" y1="30" x2="330" y2="30" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="72.5" x2="330" y2="72.5" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="115" x2="330" y2="115" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="157.5" x2="330" y2="157.5" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="200" x2="330" y2="200" stroke="#ccc" strokeWidth="1.5" />
                                        
                                        <text x="35" y="34" fill="#666" fontSize="9" textAnchor="end">100%</text>
                                        <text x="35" y="76.5" fill="#666" fontSize="9" textAnchor="end">75%</text>
                                        <text x="35" y="119" fill="#666" fontSize="9" textAnchor="end">50%</text>
                                        <text x="35" y="161.5" fill="#666" fontSize="9" textAnchor="end">25%</text>
                                        <text x="35" y="204" fill="#666" fontSize="9" textAnchor="end">0%</text>

                                        {generatedData.hoja6.rows.map((row, idx) => {
                                          const label = row[0].split(" - ")[0] || row[0];
                                          const valA = Number(row[1]);
                                          const valB = Number(row[2]);
                                          
                                          const hA = (valA / 100) * 170;
                                          const hB = (valB / 100) * 170;
                                          const xStart = 45 + idx * 70;
                                          
                                          return (
                                            <g key={idx}>
                                              <rect x={xStart + 12} y={200 - hA} width="16" height={hA} fill="#AA3BFF" rx="2" />
                                              <rect x={xStart + 30} y={200 - hB} width="16" height={hB} fill="#10B981" rx="2" />
                                              <text x={xStart + 29} y="215" fill="#555" fontSize="10" textAnchor="middle" fontWeight="bold">
                                                {label}
                                              </text>
                                            </g>
                                          );
                                        })}

                                        <rect x="250" y="5" width="10" height="10" rx="2" fill="#AA3BFF" />
                                        <text x="264" y="14" fill="#333" fontSize="9.5" fontWeight="600">Meta</text>
                                        <rect x="300" y="5" width="10" height="10" rx="2" fill="#10B981" />
                                        <text x="314" y="14" fill="#333" fontSize="9.5" fontWeight="600">Real</text>
                                      </svg>
                                    </div>
                                  )}

                                  {selectedCharts.includes('line') && (
                                    <div className="excel-chart-card animate-fade-in">
                                      <h4>Gráfico de Líneas (Evolución de Metas)</h4>
                                      <svg width="360" height="230" viewBox="0 0 360 230">
                                        <line x1="45" y1="30" x2="330" y2="30" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="72.5" x2="330" y2="72.5" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="115" x2="330" y2="115" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="157.5" x2="330" y2="157.5" stroke="#eaeaea" strokeDasharray="3,3" />
                                        <line x1="45" y1="200" x2="330" y2="200" stroke="#ccc" strokeWidth="1.5" />
                                        
                                        <text x="35" y="34" fill="#666" fontSize="9" textAnchor="end">100</text>
                                        <text x="35" y="76.5" fill="#666" fontSize="9" textAnchor="end">75</text>
                                        <text x="35" y="119" fill="#666" fontSize="9" textAnchor="end">50</text>
                                        <text x="35" y="161.5" fill="#666" fontSize="9" textAnchor="end">25</text>
                                        <text x="35" y="204" fill="#666" fontSize="9" textAnchor="end">0</text>

                                        {(() => {
                                          const pointsA = generatedData.hoja6.rows.map((row, idx) => ({
                                            x: 70 + idx * 75,
                                            y: 200 - (Number(row[1]) / 100) * 170
                                          }));
                                          const pointsB = generatedData.hoja6.rows.map((row, idx) => ({
                                            x: 70 + idx * 75,
                                            y: 200 - (Number(row[2]) / 100) * 170
                                          }));
                                          
                                          const pathA = pointsA.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
                                          const pathB = pointsB.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
                                          
                                          return (
                                            <g>
                                              <path d={pathA} fill="none" stroke="#AA3BFF" strokeWidth="2" strokeDasharray="1,1" />
                                              <path d={pathB} fill="none" stroke="#10B981" strokeWidth="2.5" />
                                              
                                              {pointsA.map((p, i) => (
                                                <circle key={`a-${i}`} cx={p.x} cy={p.y} r="3.5" fill="#AA3BFF" />
                                              ))}
                                              {pointsB.map((p, i) => (
                                                <g key={`b-${i}`}>
                                                  <circle cx={p.x} cy={p.y} r="4" fill="#10B981" stroke="#fff" strokeWidth="1" />
                                                  <text x={p.x} y={p.y - 7} fill="#111" fontSize="8" fontWeight="bold" textAnchor="middle">
                                                    {generatedData.hoja6.rows[i][2]}
                                                  </text>
                                                </g>
                                              ))}

                                              {generatedData.hoja6.rows.map((row, idx) => {
                                                const label = row[0].split(" - ")[0] || row[0];
                                                return (
                                                  <text key={idx} x={70 + idx * 75} y="215" fill="#555" fontSize="9.5" textAnchor="middle" fontWeight="bold">
                                                    {label}
                                                  </text>
                                                );
                                              })}
                                            </g>
                                          );
                                        })()}

                                        <line x1="250" y1="10" x2="262" y2="10" stroke="#AA3BFF" strokeWidth="2" strokeDasharray="2,2" />
                                        <text x="268" y="13" fill="#333" fontSize="9.5" fontWeight="600">Meta</text>
                                        <line x1="300" y1="10" x2="312" y2="10" stroke="#10B981" strokeWidth="2" />
                                        <text x="318" y="13" fill="#333" fontSize="9.5" fontWeight="600">Real</text>
                                      </svg>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {activeSheet === 'hoja7' && (
                          <table className="excel-table grid">
                            <thead>
                              <tr>
                                {generatedData.hoja7.headers.map((h, i) => <th key={i}>{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {generatedData.hoja7.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TYPE D & E: Oficio Preview */}
                  {(docType === 'petition' || docType === 'response') && (
                    <div className="preview-oficio">
                      <div className="oficio-paper">
                        
                        {/* Header logo text */}
                        <div className="oficio-header-logo">
                          <p>{generatedData.encabezado.logoText}</p>
                          <hr />
                        </div>

                        {/* Document numbering and date */}
                        <div className="oficio-meta-row">
                          <p className="oficio-num"><strong>{generatedData.encabezado.oficioNum}</strong></p>
                          <p className="oficio-date">{generatedData.encabezado.lugarFecha}</p>
                        </div>

                        {/* Destinatario block */}
                        <div className="oficio-destinatario">
                          <p><strong>{generatedData.destinatario.nombre}</strong></p>
                          <p>{generatedData.destinatario.cargo}</p>
                          <p>{generatedData.destinatario.institucion}</p>
                        </div>

                        {/* Subject */}
                        <div className="oficio-asunto">
                          <p><strong>ASUNTO:</strong> {generatedData.asunto}</p>
                        </div>

                        {/* Greeting */}
                        <p className="oficio-greeting">{generatedData.saludo}</p>

                        {/* Body */}
                        <p className="oficio-body">{generatedData.cuerpo}</p>

                        {/* Petition specific list */}
                        {docType === 'petition' && (
                          <div className="oficio-list-section">
                            <p><strong>Peticiones concretas:</strong></p>
                            <ul>
                              {generatedData.peticion.map((p, idx) => (
                                <li key={idx}>{p}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Response specific conclusion */}
                        {docType === 'response' && (
                          <p className="oficio-body bold-text">{generatedData.conclusion}</p>
                        )}

                        {/* Farewell */}
                        <p className="oficio-body">{generatedData.despedida}</p>

                        {/* Signature block */}
                        <div className="oficio-signature">
                          <p>Atentamente,</p>
                          <div className="signature-line"></div>
                          <p><strong>{generatedData.firma.nombre}</strong></p>
                          <p>{generatedData.firma.cargo}</p>
                          {generatedData.firma.cedula && <p>C.I. {generatedData.firma.cedula}</p>}
                          {generatedData.firma.institucion && <p>{generatedData.firma.institucion}</p>}
                        </div>

                        {/* Annexes */}
                        <div className="oficio-anexos">
                          <p><strong>Anexos:</strong></p>
                          <p>{generatedData.anexos}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                
                // PLACEHOLDER STATE: No document generated yet
                <div className="canvas-state placeholder-state animate-fade-in">
                  <div className="icon-circle">
                    <Sparkles className="pulsate" size={32} />
                  </div>
                  <h3>Tu documento aparecerá aquí</h3>
                  <p>Escribe una descripción, la Red Neuronal local la clasificará de inmediato y redactará los contenidos.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
