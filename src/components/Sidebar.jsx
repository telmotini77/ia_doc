import React, { useState } from 'react';
import { 
  FileText, Presentation, FileSpreadsheet, Mail, RefreshCw, 
  Terminal, Shield, Settings, CheckSquare, Square, ChevronDown, ChevronUp, Cpu, Cloud
} from 'lucide-react';

export default function Sidebar({
  docType,
  setDocType,
  customMetadata,
  setCustomMetadata,
  title,
  setTitle,
  institution,
  setInstitution,
  authors,
  setAuthors,
  advisor,
  setAdvisor,
  selectedCharts,
  onChartToggle,
  aiMode,
  trainStats,
  trainingLogs,
  onOpenSettings,
  reportFormat,
  setReportFormat,
  coverLogo,
  setCoverLogo,
  coverAlign,
  setCoverAlign,
  coverSizes,
  setCoverSizes
}) {
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isFormatOpen, setIsFormatOpen] = useState(true);

  const handleFormatChange = (key, value) => {
    setReportFormat(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCoverLogo(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChange = (key, value) => {
    setCoverSizes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const docTypes = [
    { id: 'report', label: 'Informe Técnico', icon: FileText, desc: 'Estructura formal con marco teórico y metodología.' },
    { id: 'presentation', label: 'Presentación', icon: Presentation, desc: 'Diapositivas 16:9 ajustadas al tamaño de la pantalla.' },
    { id: 'spreadsheet', label: 'Hoja de Cálculo', icon: FileSpreadsheet, desc: 'Libro de Excel con fórmulas y dashboards gráficos.' },
    { id: 'petition', label: 'Oficio de Petición', icon: Mail, desc: 'Documento administrativo formal para solicitudes.' },
    { id: 'response', label: 'Oficio de Respuesta', icon: Mail, desc: 'Contestación administrativa de peticiones.' }
  ];

  return (
    <aside className="sidebar-container glassmorphism">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <span className="logo-sparkle">✦</span>
        </div>
        <div className="brand-text">
          <h2>DocuGenius</h2>
          <span>Neural Doc Generator</span>
        </div>
      </div>

      <div className="sidebar-scrollable">
        {/* Selector de Tipo de Documento */}
        <div className="sidebar-section">
          <label className="section-label">Tipo de Documento</label>
          <div className="doc-type-list">
            {docTypes.map((type) => {
              const Icon = type.icon;
              const isActive = docType === type.id;
              return (
                <button
                  key={type.id}
                  className={`doc-type-item ${isActive ? 'active' : ''}`}
                  onClick={() => setDocType(type.id)}
                >
                  <Icon size={18} className={isActive ? 'icon-purple' : ''} />
                  <div className="doc-type-info">
                    <span className="doc-type-name">{type.label}</span>
                    <span className="doc-type-desc">{type.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de Gráficos (Sólo si es Excel/Spreadsheet) */}
        {docType === 'spreadsheet' && (
          <div className="sidebar-section animate-fade-in">
            <label className="section-label">Gráficos para Dashboard</label>
            <div className="charts-config-panel">
              <p className="charts-info-text">
                Elige qué gráficos SVG estructurar en el previsualizador y en el instructivo de Excel:
              </p>
              <div className="charts-checklist">
                {[
                  { id: 'pie', label: 'Diagrama de Pastel (Torta)' },
                  { id: 'bar', label: 'Gráfico de Barras Agrupadas' },
                  { id: 'line', label: 'Gráfico de Tendencia de Línea' }
                ].map((chart) => {
                  const isChecked = selectedCharts.includes(chart.id);
                  return (
                    <button
                      key={chart.id}
                      className={`checklist-item ${isChecked ? 'checked' : ''}`}
                      onClick={() => onChartToggle(chart.id)}
                    >
                      {isChecked ? (
                        <CheckSquare size={16} className="icon-purple" />
                      ) : (
                        <Square size={16} />
                      )}
                      <span>{chart.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Formato del Documento (Solo para Informe Técnico) */}
        {docType === 'report' && (
          <div className="sidebar-section animate-fade-in">
            <button 
              className="section-header-btn" 
              onClick={() => setIsFormatOpen(!isFormatOpen)}
            >
              <span className="section-label">Formato del Documento</span>
              {isFormatOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isFormatOpen && (
              <div className="metadata-form-panel animate-slide-down">
                <div className="meta-inputs-grid">
                  <div className="meta-field">
                    <label>Tamaño de Papel</label>
                    <select
                      value={reportFormat.paperSize}
                      onChange={(e) => handleFormatChange('paperSize', e.target.value)}
                      className="premium-select"
                    >
                      <option value="carta">Carta (21.59 x 27.94 cm)</option>
                      <option value="a4">A4 (21.00 x 29.70 cm)</option>
                    </select>
                  </div>

                  <div className="meta-field">
                    <label>Fuentes y Tamaños</label>
                    <select
                      value={reportFormat.font}
                      onChange={(e) => handleFormatChange('font', e.target.value)}
                      className="premium-select"
                    >
                      <option value="times12">Times New Roman: 12 pt (Con Serifa)</option>
                      <option value="georgia11">Georgia: 11 pt (Con Serifa)</option>
                      <option value="computer10">Computer Modern: 10 pt (Con Serifa)</option>
                      <option value="calibri11">Calibri: 11 pt (Sin Serifa)</option>
                      <option value="arial11">Arial: 11 pt (Sin Serifa)</option>
                      <option value="lucida10">Lucida Sans Unicode: 10 pt (Sin Serifa)</option>
                    </select>
                  </div>

                  <div className="meta-field">
                    <label>Márgenes</label>
                    <select
                      value={reportFormat.margin}
                      onChange={(e) => handleFormatChange('margin', e.target.value)}
                      className="premium-select"
                    >
                      <option value="2.54">Estilo APA (2.54 cm por lado)</option>
                      <option value="standard">Estándar (2.00 cm por lado)</option>
                    </select>
                  </div>

                  <div className="meta-field">
                    <label>Interlineado</label>
                    <select
                      value={reportFormat.spacing}
                      onChange={(e) => handleFormatChange('spacing', e.target.value)}
                      className="premium-select"
                    >
                      <option value="2.0">Interlineado 2.0 (Doble)</option>
                      <option value="1.5">Interlineado 1.5</option>
                      <option value="1.15">Interlineado 1.15 (Sencillo)</option>
                    </select>
                  </div>

                  <div className="meta-field">
                    <label>Alineación</label>
                    <select
                      value={reportFormat.alignment}
                      onChange={(e) => handleFormatChange('alignment', e.target.value)}
                      className="premium-select"
                    >
                      <option value="left">A la izquierda sin justificar</option>
                      <option value="justify">Justificado completo</option>
                    </select>
                  </div>

                  <div className="meta-field">
                    <label>Sangría de Párrafo</label>
                    <select
                      value={reportFormat.indent}
                      onChange={(e) => handleFormatChange('indent', e.target.value)}
                      className="premium-select"
                    >
                      <option value="1.27">Primera línea a 1.27 cm</option>
                      <option value="0">Sin sangría de primera línea</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadatos Personalizados */}
        <div className="sidebar-section">
          <button 
            className="section-header-btn" 
            onClick={() => setIsMetadataOpen(!isMetadataOpen)}
          >
            <span className="section-label">Metadatos del Documento</span>
            {isMetadataOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isMetadataOpen && (
            <div className="metadata-form-panel animate-slide-down">
              <div className="custom-meta-toggle">
                <button
                  className={`toggle-switch-btn ${customMetadata ? 'active' : ''}`}
                  onClick={() => setCustomMetadata(!customMetadata)}
                >
                  <div className="switch-dot"></div>
                </button>
                <span>Forzar metadatos personalizados</span>
              </div>

              {customMetadata && (
                <div className="meta-inputs-grid">
                  <div className="meta-field">
                    <label>Título del Proyecto / Tema</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Sistema de Riego Automatizado"
                      className="premium-input"
                    />
                  </div>
                  <div className="meta-field">
                    <label>Institución (Opcional)</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Ej. Universidad Central (Opcional)"
                      className="premium-input"
                    />
                  </div>
                  <div className="meta-field">
                    <label>Integrantes / Autores</label>
                    <input
                      type="text"
                      value={authors}
                      onChange={(e) => setAuthors(e.target.value)}
                      placeholder="Ej. Telmo Tini, Juan Pérez"
                      className="premium-input"
                    />
                  </div>
                  <div className="meta-field">
                    <label>Tutor / Docente</label>
                    <input
                      type="text"
                      value={advisor}
                      onChange={(e) => setAdvisor(e.target.value)}
                      placeholder="Ej. Ing. Carlos Ruiz"
                      className="premium-input"
                    />
                  </div>
                  
                  {/* Logo / Imagen de Portada */}
                  <div className="meta-field">
                    <label>Logo de Portada</label>
                    <div className="logo-upload-container">
                      {coverLogo ? (
                        <div className="logo-preview-wrapper">
                          <img src={coverLogo} alt="Logo Portada" className="logo-preview-thumbnail" />
                          <button 
                            type="button" 
                            className="btn-remove-logo"
                            onClick={() => setCoverLogo('')}
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <div className="logo-upload-button-wrapper">
                          <label className="logo-upload-label">
                            <span>Subir Imagen</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alineación de Portada */}
                  <div className="meta-field">
                    <label>Alineación en Portada</label>
                    <div className="align-buttons-group">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          type="button"
                          className={`align-btn ${coverAlign === align ? 'active' : ''}`}
                          onClick={() => setCoverAlign(align)}
                        >
                          {align === 'left' ? 'Izquierda' : align === 'center' ? 'Centro' : 'Derecha'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tamaños de Letras en Portada */}
                  <div className="meta-field">
                    <label className="sub-section-label">Tamaños en Portada</label>
                    <div className="sliders-container">
                      <div className="slider-item">
                        <div className="slider-labels">
                          <span>Título:</span>
                          <span className="slider-value">{coverSizes.title}px</span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="40"
                          value={coverSizes.title}
                          onChange={(e) => handleSizeChange('title', parseInt(e.target.value))}
                          className="premium-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-labels">
                          <span>Autores:</span>
                          <span className="slider-value">{coverSizes.authors}px</span>
                        </div>
                        <input
                          type="range"
                          min="9"
                          max="20"
                          value={coverSizes.authors}
                          onChange={(e) => handleSizeChange('authors', parseInt(e.target.value))}
                          className="premium-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-labels">
                          <span>Tutor:</span>
                          <span className="slider-value">{coverSizes.advisor}px</span>
                        </div>
                        <input
                          type="range"
                          min="9"
                          max="20"
                          value={coverSizes.advisor}
                          onChange={(e) => handleSizeChange('advisor', parseInt(e.target.value))}
                          className="premium-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-labels">
                          <span>Curso:</span>
                          <span className="slider-value">{coverSizes.course}px</span>
                        </div>
                        <input
                          type="range"
                          min="9"
                          max="20"
                          value={coverSizes.course}
                          onChange={(e) => handleSizeChange('course', parseInt(e.target.value))}
                          className="premium-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-labels">
                          <span>Institución:</span>
                          <span className="slider-value">{coverSizes.institution}px</span>
                        </div>
                        <input
                          type="range"
                          min="9"
                          max="20"
                          value={coverSizes.institution}
                          onChange={(e) => handleSizeChange('institution', parseInt(e.target.value))}
                          className="premium-slider"
                        />
                      </div>

                      <div className="slider-item">
                        <div className="slider-labels">
                          <span>Fecha:</span>
                          <span className="slider-value">{coverSizes.date}px</span>
                        </div>
                        <input
                          type="range"
                          min="9"
                          max="18"
                          value={coverSizes.date}
                          onChange={(e) => handleSizeChange('date', parseInt(e.target.value))}
                          className="premium-slider"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Consola de Entrenamiento ML o Estado de Gemini */}
        <div className="sidebar-section">
          <button 
            className="section-header-btn"
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          >
            <span className="section-label">
              {aiMode === 'local' ? 'Consola Neuronal ML' : 'Estatus Gemini API'}
            </span>
            {isConsoleOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isConsoleOpen && (
            <div className="console-wrapper animate-slide-down">
              {aiMode === 'local' ? (
                <>
                  <div className="console-meta-stats">
                    <div className="stat-card">
                      <span className="stat-val">
                        {trainStats ? `${(trainStats.finalAccuracy * 100).toFixed(0)}%` : '0%'}
                      </span>
                      <span className="stat-lbl">Precisión</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-val">
                        {trainStats ? trainStats.finalLoss.toFixed(3) : '1.000'}
                      </span>
                      <span className="stat-lbl">Pérdida</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-val">
                        {trainStats ? trainStats.vocabSize : '0'}
                      </span>
                      <span className="stat-lbl">Vocabulario</span>
                    </div>
                  </div>
                  <div className="console-logs-display">
                    <div className="console-header-bar">
                      <Terminal size={12} />
                      <span>LOGS DE ENTRENAMIENTO</span>
                    </div>
                    <div className="console-text-area">
                      {trainingLogs.map((log, index) => (
                        <div key={index} className="log-line">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="gemini-status-panel">
                  <div className="gemini-status-header">
                    <Cloud className="icon-purple animate-pulse" size={20} />
                    <h4>Modo Gemini Activo</h4>
                  </div>
                  <p className="gemini-status-desc">
                    Generación de alta fidelidad basada en Inteligencia Artificial en la Nube con <strong>gemini-1.5-flash</strong>.
                  </p>
                  <div className="gemini-badge-row">
                    <span className="gemini-badge success">Online</span>
                    <span className="gemini-badge info">JSON Mode</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón inferior de configuración */}
      <div className="sidebar-footer">
        <button className="premium-btn btn-settings" onClick={onOpenSettings}>
          <Settings size={18} />
          <span>Configuración IA</span>
        </button>
      </div>
    </aside>
  );
}
