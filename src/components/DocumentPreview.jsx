import React from 'react';
import { 
  BookOpen, FileDown, Download, Presentation, FileSpreadsheet, AlertCircle, Sparkles, ChevronLeft, ChevronRight,
  Upload, Image, Trash2
} from 'lucide-react';
import { parseSlideText } from '../utils/documentGenerator';
import { PPTX_PALETTES } from '../utils/exporters';

const fontMapping = {
  times12: { family: "'Times New Roman', Times, serif", size: '12pt' },
  georgia11: { family: "Georgia, serif", size: '11pt' },
  computer10: { family: "'Computer Modern', 'Courier New', serif", size: '10pt' },
  calibri11: { family: "Calibri, sans-serif", size: '11pt' },
  arial11: { family: "Arial, sans-serif", size: '11pt' },
  lucida10: { family: "'Lucida Sans Unicode', sans-serif", size: '10pt' }
};

export default function DocumentPreview({
  docType,
  loading,
  generatedData,
  activeSlide,
  setActiveSlide,
  activeSheet,
  setActiveSheet,
  selectedCharts,
  prediction,
  onDownload,
  reportFormat,
  coverLogo,
  coverAlign,
  coverSizes,
  isEditing,
  setIsEditing,
  setGeneratedData,
  pptxPalette,
  customPptxPalette
}) {
  return (
    <div className="preview-container glassmorphism">
      {/* Top Preview Action Bar */}
      <div className="preview-header">
        <div className="preview-title-block">
          <h2><BookOpen size={16} /> Previsualización</h2>
        </div>
        
        {generatedData && !loading && (
          <div className="preview-actions animate-fade-in">
            {(docType === 'report' || docType === 'petition' || docType === 'response') && (
              <>
                <button type="button" className="btn-action word" onClick={() => onDownload('word')}>
                  <FileDown size={14} /> Word (.docx)
                </button>
                <button type="button" className="btn-action pdf" onClick={() => onDownload('pdf')}>
                  <Download size={14} /> PDF (.pdf)
                </button>
              </>
            )}

            {docType === 'presentation' && (
              <button type="button" className="btn-action pptx" onClick={() => onDownload('powerpoint')}>
                <Presentation size={14} /> PowerPoint (.pptx)
              </button>
            )}

            {docType === 'spreadsheet' && (
              <button type="button" className="btn-action xlsx" onClick={() => onDownload('excel')}>
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
            <p>La inteligencia artificial está estructurando y redactando los bloques de información...</p>
          </div>
        ) : generatedData ? (
          
          <div className="canvas-content animate-fade-in">
            
            {/* TYPE A: Report Preview */}
            {docType === 'report' && (
              <div 
                className="preview-report"
                style={{
                  '--page-margin': (reportFormat?.margin === '2.54' ? '2.54cm' : '2.00cm'),
                  '--page-font': fontMapping[reportFormat?.font || 'times12'].family,
                  '--page-font-size': fontMapping[reportFormat?.font || 'times12'].size,
                  '--page-line-height': reportFormat?.spacing || '2.0',
                  '--page-text-align': reportFormat?.alignment === 'left' ? 'left' : 'justify',
                  '--page-text-indent': reportFormat?.indent === '1.27' ? '1.27cm' : '0cm',
                  '--page-aspect-ratio': reportFormat?.paperSize === 'carta' ? '215.9 / 279.4' : '210 / 297'
                }}
              >
                <div className="pdf-page cover-page">
                  {coverAlign !== 'center' && <div className="cover-stripe"></div>}
                  <div 
                    className="cover-details"
                    style={{
                      textAlign: coverAlign || 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: coverAlign === 'center' ? 'center' : coverAlign === 'right' ? 'flex-end' : 'flex-start',
                      padding: '50px'
                    }}
                  >
                    {coverLogo && (
                      <div className="cover-logo-preview-container" style={{ marginBottom: '20px', maxHeight: '100px', display: 'flex', justifyContent: coverAlign === 'center' ? 'center' : coverAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                        <img src={coverLogo} alt="Logo" className="cover-logo-img" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                    
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }} 
                        value={generatedData.title} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeneratedData(prev => ({ ...prev, title: val }));
                        }}
                      />
                    ) : (
                      <h1 
                        className="cover-title" 
                        style={{ 
                          marginTop: coverLogo ? '10px' : '40px',
                          fontSize: coverSizes?.title ? `${coverSizes.title}px` : '24px',
                          textAlign: coverAlign || 'left',
                          marginRight: '0px',
                          marginLeft: '0px',
                          width: '100%'
                        }}
                      >
                        {generatedData.title}
                      </h1>
                    )}
                    
                    <p 
                      className="cover-subtitle"
                      style={{
                        fontSize: '13px',
                        textAlign: coverAlign || 'left',
                        width: '100%',
                        color: 'var(--text-muted)'
                      }}
                    >
                      ESTUDIO DE CASO
                    </p>
                    
                    <div 
                      className="cover-meta" 
                      style={{ 
                        marginTop: '40px',
                        width: '100%',
                        textAlign: coverAlign || 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      {isEditing ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ width: '120px', fontSize: '12px' }}>INSTITUCIÓN:</strong>
                            <input type="text" className="edit-input" value={generatedData.institution || ''} onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({ ...prev, institution: val }));
                            }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ width: '120px', fontSize: '12px' }}>ESTUDIANTE:</strong>
                            <input type="text" className="edit-input" value={generatedData.authors || ''} onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({ ...prev, authors: val }));
                            }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ width: '120px', fontSize: '12px' }}>CURSO:</strong>
                            <input type="text" className="edit-input" value={generatedData.course || ''} onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({ ...prev, course: val }));
                            }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ width: '120px', fontSize: '12px' }}>TUTOR:</strong>
                            <input type="text" className="edit-input" value={generatedData.advisor || ''} onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({ ...prev, advisor: val }));
                            }} />
                          </div>
                        </>
                      ) : (
                        <>
                          {generatedData.institution && (
                            <p style={{ fontSize: coverSizes?.institution ? `${coverSizes.institution}px` : '13px', margin: '0' }}>
                              <strong>INSTITUCIÓN:</strong> {generatedData.institution}
                            </p>
                          )}
                          <p style={{ fontSize: coverSizes?.authors ? `${coverSizes.authors}px` : '13px', margin: '0' }}>
                            <strong>ESTUDIANTE:</strong> {generatedData.authors}
                          </p>
                          <p style={{ fontSize: coverSizes?.course ? `${coverSizes.course}px` : '13px', margin: '0' }}>
                            <strong>CURSO:</strong> {generatedData.course}
                          </p>
                          <p style={{ fontSize: coverSizes?.advisor ? `${coverSizes.advisor}px` : '13px', margin: '0' }}>
                            <strong>TUTOR:</strong> {generatedData.advisor}
                          </p>
                        </>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <input type="text" className="edit-input" style={{ width: '200px', marginTop: '30px' }} value={generatedData.date || ''} onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({ ...prev, date: val }));
                      }} />
                    ) : (
                      <p 
                        className="cover-date" 
                        style={{ 
                          marginTop: '50px',
                          fontSize: coverSizes?.date ? `${coverSizes.date}px` : '11.5px',
                          width: '100%',
                          textAlign: coverAlign || 'left'
                        }}
                      >
                        {generatedData.date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pdf-page">
                  <div className="page-number-top-right">2</div>
                  <h2 className="section-title">Primera Parte: Antecedentes</h2>
                  
                  <h3>Introducción</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.primeraParte.introduccion} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          primeraParte: { ...prev.primeraParte, introduccion: val }
                        }));
                      }}
                    />
                  ) : (
                    <p>{generatedData.primeraParte.introduccion}</p>
                  )}
                  
                  <h3>Antecedente</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.primeraParte.antecedente} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          primeraParte: { ...prev.primeraParte, antecedente: val }
                        }));
                      }}
                    />
                  ) : (
                    <p>{generatedData.primeraParte.antecedente}</p>
                  )}

                  <h3>Definición del Problema</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.primeraParte.definicionProblema} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          primeraParte: { ...prev.primeraParte, definicionProblema: val }
                        }));
                      }}
                    />
                  ) : (
                    <p>{generatedData.primeraParte.definicionProblema}</p>
                  )}

                  <h3>Justificación del Estudio</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.primeraParte.justificacion} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          primeraParte: { ...prev.primeraParte, justificacion: val }
                        }));
                      }}
                    />
                  ) : (
                    <p>{generatedData.primeraParte.justificacion}</p>
                  )}

                  <h3>Objetivos del Estudio de Caso</h3>
                  <h4>Objetivo General</h4>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="edit-input" 
                      value={generatedData.primeraParte.objetivos.general} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          primeraParte: {
                            ...prev.primeraParte,
                            objetivos: { ...prev.primeraParte.objetivos, general: val }
                          }
                        }));
                      }}
                    />
                  ) : (
                    <p>{generatedData.primeraParte.objetivos.general}</p>
                  )}
                  
                  <h4>Objetivos Específicos</h4>
                  {isEditing ? (
                    <div className="edit-list">
                      {generatedData.primeraParte.objetivos.especificos.map((obj, i) => (
                        <input 
                          key={i}
                          type="text"
                          className="edit-input"
                          value={obj}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedData(prev => {
                              const newEsp = [...prev.primeraParte.objetivos.especificos];
                              newEsp[i] = val;
                              return {
                                ...prev,
                                primeraParte: {
                                  ...prev.primeraParte,
                                  objetivos: { ...prev.primeraParte.objetivos, especificos: newEsp }
                                }
                              };
                            });
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ul>
                      {generatedData.primeraParte.objetivos.especificos.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pdf-page">
                  <div className="page-number-top-right">3</div>
                  <h2 className="section-title">Segunda Parte: Desarrollo</h2>
                  
                  <h3>Marco Conceptual</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.segundaParte.marcoConceptual} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          segundaParte: { ...prev.segundaParte, marcoConceptual: val }
                        }));
                      }}
                      style={{ minHeight: '150px' }}
                    />
                  ) : (
                    <p>{generatedData.segundaParte.marcoConceptual}</p>
                  )}

                  <h3>Marco Metodológico</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.segundaParte.marcoMetodologico} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          segundaParte: { ...prev.segundaParte, marcoMetodologico: val }
                        }));
                      }}
                      style={{ minHeight: '120px' }}
                    />
                  ) : (
                    <p>{generatedData.segundaParte.marcoMetodologico}</p>
                  )}

                  <h3>Resultados Obtenidos</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.segundaParte.resultadosObtenidos} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          segundaParte: { ...prev.segundaParte, resultadosObtenidos: val }
                        }));
                      }}
                    />
                  ) : (
                    <p>{generatedData.segundaParte.resultadosObtenidos}</p>
                  )}

                  <h3>Análisis de Resultados</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.segundaParte.analisisResultados} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          segundaParte: { ...prev.segundaParte, analisisResultados: val }
                        }));
                      }}
                    />
                  ) : (
                    <p>{generatedData.segundaParte.analisisResultados}</p>
                  )}
                </div>

                <div className="pdf-page">
                  <div className="page-number-top-right">4</div>
                  <h2 className="section-title">Tercera Parte: Conclusiones y Recomendaciones</h2>
                  
                  <h3>Conclusiones</h3>
                  {isEditing ? (
                    <div className="edit-list">
                      {generatedData.terceraParte.conclusiones.map((c, i) => (
                        <textarea 
                          key={i}
                          className="edit-textarea"
                          value={c}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedData(prev => {
                              const newList = [...prev.terceraParte.conclusiones];
                              newList[i] = val;
                              return { ...prev, terceraParte: { ...prev.terceraParte, conclusiones: newList } };
                            });
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ol>
                      {generatedData.terceraParte.conclusiones.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ol>
                  )}

                  <h3>Recomendaciones</h3>
                  {isEditing ? (
                    <div className="edit-list">
                      {generatedData.terceraParte.recomendaciones.map((r, i) => (
                        <textarea 
                          key={i}
                          className="edit-textarea"
                          value={r}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedData(prev => {
                              const newList = [...prev.terceraParte.recomendaciones];
                              newList[i] = val;
                              return { ...prev, terceraParte: { ...prev.terceraParte, recomendaciones: newList } };
                            });
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ol>
                      {generatedData.terceraParte.recomendaciones.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="pdf-page">
                  <div className="page-number-top-right">5</div>
                  <h2 className="section-title">Cuarta Parte</h2>
                  
                  <h3>Referencias</h3>
                  {isEditing ? (
                    <div className="edit-list">
                      {generatedData.cuartaParte.referencias.map((ref, i) => (
                        <input 
                          key={i}
                          type="text"
                          className="edit-input"
                          value={ref}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedData(prev => {
                              const newList = [...prev.cuartaParte.referencias];
                              newList[i] = val;
                              return { ...prev, cuartaParte: { ...prev.cuartaParte, referencias: newList } };
                            });
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ul className="ref-list">
                      {generatedData.cuartaParte.referencias.map((ref, i) => (
                        <li key={i}>{ref}</li>
                      ))}
                    </ul>
                  )}

                  <h3>Anexos</h3>
                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.cuartaParte.anexos} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          cuartaParte: { ...prev.cuartaParte, anexos: val }
                        }));
                      }}
                      style={{ minHeight: '120px' }}
                    />
                  ) : (
                    <p style={{ whiteSpace: 'pre-line' }}>{generatedData.cuartaParte.anexos}</p>
                  )}
                </div>
              </div>
            )}
                 {/* TYPE B: Presentation Preview */}
            {docType === 'presentation' && (() => {
              const activePalette = pptxPalette === 'custom' ? customPptxPalette : PPTX_PALETTES[pptxPalette || 'galactic'];
              const styleVars = {
                '--slide-bg': activePalette.background,
                '--slide-primary': activePalette.primary,
                '--slide-card-bg': activePalette.cardBg,
                '--slide-title': activePalette.title,
                '--slide-text': activePalette.text,
                '--slide-muted': activePalette.muted,
                '--slide-border': activePalette.isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
              };

              const slideData = generatedData.slides[activeSlide];
              const isBgImage = slideData?.image && slideData?.imagePosition === 'background';
              const slideCardStyle = {
                ...styleVars,
                ...(isBgImage ? { backgroundImage: `url(${slideData.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {})
              };

              return (
                <div className="preview-presentation" style={styleVars}>
                  <div className="slideshow-container">
                    <div className="slide-card animate-fade-in" key={activeSlide} style={slideCardStyle}>
                      <div className="slide-side-accent" style={{ background: 'var(--slide-primary)' }}></div>
                      
                      {isEditing ? (
                        <div className="slide-body-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', boxSizing: 'border-box' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Título de Diapositiva</label>
                            <input 
                              type="text" 
                              className="edit-input" 
                              value={slideData.title} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setGeneratedData(prev => {
                                  const newSlides = [...prev.slides];
                                  newSlides[activeSlide] = { ...newSlides[activeSlide], title: val };
                                  return { ...prev, slides: newSlides };
                                });
                              }}
                            />
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                            <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contenido (use viñetas o líneas separadas por saltos de línea)</label>
                            <textarea 
                              className="edit-textarea" 
                              value={slideData.content} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setGeneratedData(prev => {
                                  const newSlides = [...prev.slides];
                                  newSlides[activeSlide] = { ...newSlides[activeSlide], content: val };
                                  return { ...prev, slides: newSlides };
                                });
                              }}
                              style={{ flexGrow: 1, height: '120px' }}
                            />
                          </div>

                          {/* Image controls in edit mode */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                            <label style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Imagen de Diapositiva</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <label className="premium-btn btn-settings" style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                <Upload size={14} />
                                <span>Subir Local</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (uploadEvent) => {
                                        setGeneratedData(prev => {
                                          const newSlides = [...prev.slides];
                                          newSlides[activeSlide] = { 
                                            ...newSlides[activeSlide], 
                                            image: uploadEvent.target.result,
                                            imagePosition: newSlides[activeSlide].imagePosition || 'right'
                                          };
                                          return { ...prev, slides: newSlides };
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>

                              <div style={{ flexGrow: 1, minWidth: '150px' }}>
                                <input 
                                  type="text"
                                  className="premium-input"
                                  placeholder="O pegue URL de imagen..."
                                  style={{ padding: '6px 10px', fontSize: '12px' }}
                                  value={slideData.image && !slideData.image.startsWith('data:') ? slideData.image : ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGeneratedData(prev => {
                                      const newSlides = [...prev.slides];
                                      newSlides[activeSlide] = { 
                                        ...newSlides[activeSlide], 
                                        image: val || undefined,
                                        imagePosition: newSlides[activeSlide].imagePosition || 'right'
                                      };
                                      return { ...prev, slides: newSlides };
                                    });
                                  }}
                                />
                              </div>
                              
                              {slideData.image && (
                                <select
                                  className="premium-select"
                                  style={{ width: '120px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                                  value={slideData.imagePosition || 'right'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGeneratedData(prev => {
                                      const newSlides = [...prev.slides];
                                      newSlides[activeSlide] = { ...newSlides[activeSlide], imagePosition: val };
                                      return { ...prev, slides: newSlides };
                                    });
                                  }}
                                >
                                  <option value="right">Derecha</option>
                                  <option value="left">Izquierda</option>
                                  <option value="background">Fondo</option>
                                </select>
                              )}

                              {slideData.image && (
                                <button
                                  type="button"
                                  className="premium-btn btn-settings"
                                  style={{ padding: '6px 10px', background: '#dc2626', borderColor: '#dc2626', color: '#fff', margin: 0 }}
                                  onClick={() => {
                                    setGeneratedData(prev => {
                                      const newSlides = [...prev.slides];
                                      newSlides[activeSlide] = { 
                                        ...newSlides[activeSlide], 
                                        image: undefined,
                                        imagePosition: undefined
                                      };
                                      return { ...prev, slides: newSlides };
                                    });
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            
                            {slideData.image && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <img 
                                  src={slideData.image} 
                                  alt="Preview Mini" 
                                  style={{ height: '28px', width: 'auto', borderRadius: '4px', border: '1px solid var(--border-color)', objectFit: 'contain' }} 
                                />
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Imagen cargada ({slideData.imagePosition === 'background' ? 'Fondo de diapositiva' : `Ubicación: ${slideData.imagePosition === 'left' ? 'Izquierda' : 'Derecha'}`})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {activeSlide === 0 ? (
                            <div className="slide-cover">
                              <span className="slide-inst">{generatedData.institution}</span>
                              <h2 className="slide-main-title">{generatedData.title}</h2>
                              <div className="slide-members">
                                <p><strong>Autores:</strong> {generatedData.members}</p>
                                <p><strong>Fecha:</strong> {generatedData.date}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="slide-body-content">
                              <div className="slide-header-block">
                                <span className="slide-num">Slide {slideData.num}</span>
                                <h2>{slideData.title}</h2>
                              </div>
                              
                              {(() => {
                                const parsed = parseSlideText(slideData.content);
                                const hasImage = slideData.image && slideData.imagePosition !== 'background';
                                const imgPos = slideData.imagePosition || 'right';

                                const renderTable = () => (
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
                                );

                                const renderImage = () => (
                                  <div className="slide-image-container">
                                    <img src={slideData.image} alt={slideData.title} className="slide-inline-image" />
                                  </div>
                                );

                                if (hasImage) {
                                  // Live Image Split Layout
                                  const textContent = () => {
                                    if (parsed.type === 'table') {
                                      return <div className="slide-text">{renderTable()}</div>;
                                    } else {
                                      const blocks = parsed.data;
                                      if (blocks.length === 2) {
                                        return (
                                          <div className="slide-stacked-layout">
                                            {blocks.map((block, idx) => {
                                              const bLength = block.bullets.reduce((sum, b) => sum + b.length, 0) + (block.title?.length || 0);
                                              const bCount = block.bullets.length;
                                              let fontSize = '11px';
                                              let titleSize = '13px';
                                              let gap = '4px';
                                              if (bLength > 200 || bCount > 4) {
                                                fontSize = '9.5px';
                                                titleSize = '11px';
                                                gap = '2px';
                                              }
                                              return (
                                                <div key={idx} className="slide-col-card" style={{ gap }}>
                                                  {block.title && <h4 style={{ fontSize: titleSize }}>{block.title}</h4>}
                                                  <ul className="slide-ul" style={{ gap }}>
                                                    {block.bullets.map((bullet, bIdx) => (
                                                      <li key={bIdx} style={{ fontSize }} className={bullet.length > 2 ? 'bullet' : 'para-line'}>{bullet}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      } else {
                                        const mainBlock = blocks[0] || { title: "", bullets: [] };
                                        const mainLength = mainBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (mainBlock.title?.length || 0);
                                        const mainCount = mainBlock.bullets.length;
                                        let mainFontSize = '12px';
                                        let mainTitleSize = '14px';
                                        let mainGap = '6px';
                                        if (mainLength > 250 || mainCount > 4) {
                                          mainFontSize = '10.5px';
                                          mainTitleSize = '12px';
                                          mainGap = '4px';
                                        }
                                        return (
                                          <div className="slide-single-card" style={{ gap: mainGap, height: '100%' }}>
                                            {mainBlock.title && <h4 style={{ fontSize: mainTitleSize }}>{mainBlock.title}</h4>}
                                            <ul className="slide-ul" style={{ gap: mainGap }}>
                                              {mainBlock.bullets.map((bullet, idx) => (
                                                <li key={idx} style={{ fontSize: mainFontSize }} className={bullet.length > 2 && !bullet.includes("Contacto:") ? 'bullet' : 'para-line'}>{bullet}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        );
                                      }
                                    }
                                  };

                                  return (
                                    <div className={`slide-dual-layout-with-image ${imgPos === 'left' ? 'image-left' : 'image-right'}`}>
                                      <div className="slide-col-content">
                                        {textContent()}
                                      </div>
                                      <div className="slide-col-image">
                                        {renderImage()}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  // Standard layouts without image
                                  if (parsed.type === 'table') {
                                    return (
                                      <div className="slide-text">
                                        {renderTable()}
                                      </div>
                                    );
                                  } else {
                                    const blocks = parsed.data;
                                    if (blocks.length === 2) {
                                      const leftBlock = blocks[0];
                                      const rightBlock = blocks[1];
      
                                      const leftLength = leftBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (leftBlock.title?.length || 0);
                                      const leftCount = leftBlock.bullets.length;
                                      let leftFontSize = '12px';
                                      let leftTitleSize = '14px';
                                      let leftGap = '6px';
                                      if (leftLength > 250 || leftCount > 4) {
                                        leftFontSize = '10px';
                                        leftTitleSize = '12px';
                                        leftGap = '4px';
                                      }
      
                                      const rightLength = rightBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (rightBlock.title?.length || 0);
                                      const rightCount = rightBlock.bullets.length;
                                      let rightFontSize = '12px';
                                      let rightTitleSize = '14px';
                                      let rightGap = '6px';
                                      if (rightLength > 250 || rightCount > 4) {
                                        rightFontSize = '10px';
                                        rightTitleSize = '12px';
                                        rightGap = '4px';
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
                                      let mainFontSize = '13.5px';
                                      let mainTitleSize = '15.5px';
                                      let mainGap = '8px';
                                      if (mainLength > 350 || mainCount > 5) {
                                        mainFontSize = '11px';
                                        mainTitleSize = '13px';
                                        mainGap = '4px';
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
                                }
                              })()}
                            </div>
                          )}
                        </>
                      )}
                    </div>
  
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
              );
            })()}

            {/* TYPE C: Spreadsheet Preview */}
            {docType === 'spreadsheet' && (
              <div className="preview-spreadsheet">
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

                <div className="excel-grid-container">
                  {activeSheet === 'hoja1' && (
                    <table className="excel-table grid">
                      <tbody>
                        <tr>
                          <td className="cell-header bold-cell">
                            {isEditing ? (
                              <input type="text" className="edit-grid-input" value={generatedData.hoja1.titulo} onChange={(e) => {
                                const val = e.target.value;
                                setGeneratedData(prev => ({ ...prev, hoja1: { ...prev.hoja1, titulo: val } }));
                              }} />
                            ) : generatedData.hoja1.titulo}
                          </td>
                          <td></td>
                        </tr>
                        <tr><td></td><td></td></tr>
                        <tr>
                          <td className="bold-cell gray-cell">PROYECTO:</td>
                          <td>
                            {isEditing ? (
                              <input type="text" className="edit-grid-input" value={generatedData.hoja1.proyecto} onChange={(e) => {
                                const val = e.target.value;
                                setGeneratedData(prev => ({ ...prev, title: val, hoja1: { ...prev.hoja1, proyecto: val } }));
                              }} />
                            ) : generatedData.hoja1.proyecto}
                          </td>
                        </tr>
                        {generatedData.hoja1.institucion && (
                          <tr>
                            <td className="bold-cell gray-cell">INSTITUCIÓN:</td>
                            <td>
                              {isEditing ? (
                                <input type="text" className="edit-grid-input" value={generatedData.hoja1.institucion} onChange={(e) => {
                                  const val = e.target.value;
                                  setGeneratedData(prev => ({ ...prev, institution: val, hoja1: { ...prev.hoja1, institucion: val } }));
                                }} />
                              ) : generatedData.hoja1.institucion}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="bold-cell gray-cell">INTEGRANTES:</td>
                          <td>
                            {isEditing ? (
                              <input type="text" className="edit-grid-input" value={generatedData.hoja1.integrantes.join(", ")} onChange={(e) => {
                                const val = e.target.value;
                                setGeneratedData(prev => ({ ...prev, members: val, hoja1: { ...prev.hoja1, integrantes: val.split(",").map(s => s.trim()) } }));
                              }} />
                            ) : generatedData.hoja1.integrantes.join(", ")}
                          </td>
                        </tr>
                        <tr>
                          <td className="bold-cell gray-cell">FECHA:</td>
                          <td>
                            {isEditing ? (
                              <input type="text" className="edit-grid-input" value={generatedData.hoja1.fecha} onChange={(e) => {
                                const val = e.target.value;
                                setGeneratedData(prev => ({ ...prev, date: val, hoja1: { ...prev.hoja1, fecha: val } }));
                              }} />
                            ) : generatedData.hoja1.fecha}
                          </td>
                        </tr>
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
                              if (isEditing) {
                                return (
                                  <td key={cIdx}>
                                    <input 
                                      type="text" 
                                      className="edit-grid-input"
                                      value={cell} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setGeneratedData(prev => {
                                          const newRows = [...prev.hoja2.rows];
                                          newRows[rIdx] = [...newRows[rIdx]];
                                          newRows[rIdx][cIdx] = val;
                                          return {
                                            ...prev,
                                            hoja2: { ...prev.hoja2, rows: newRows }
                                          };
                                        });
                                      }} 
                                    />
                                  </td>
                                );
                              }
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
                            {isEditing ? (
                              <>
                                <td>
                                  <input 
                                    type="text" 
                                    className="edit-grid-input"
                                    value={row[0]} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setGeneratedData(prev => {
                                        const newRows = [...prev.hoja3.rows];
                                        newRows[rIdx] = [val, newRows[rIdx][1], newRows[rIdx][2], newRows[rIdx][3]];
                                        return { ...prev, hoja3: { ...prev.hoja3, rows: newRows } };
                                      });
                                    }} 
                                  />
                                </td>
                                <td>
                                  <input 
                                    type="number" 
                                    className="edit-grid-input"
                                    value={row[1]} 
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setGeneratedData(prev => {
                                        const newRows = [...prev.hoja3.rows];
                                        const cost = Number(newRows[rIdx][2]) || 0;
                                        const total = val * cost;
                                        newRows[rIdx] = [newRows[rIdx][0], val, cost, total];
                                        const newTotalVal = newRows.reduce((acc, curr) => acc + (Number(curr[3]) || 0), 0);
                                        return { 
                                          ...prev, 
                                          hoja3: { 
                                            ...prev.hoja3, 
                                            rows: newRows,
                                            formulas: { ...prev.hoja3.formulas, value: newTotalVal }
                                          } 
                                        };
                                      });
                                    }} 
                                  />
                                </td>
                                <td>
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    className="edit-grid-input"
                                    value={row[2]} 
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setGeneratedData(prev => {
                                        const newRows = [...prev.hoja3.rows];
                                        const qty = Number(newRows[rIdx][1]) || 0;
                                        const total = qty * val;
                                        newRows[rIdx] = [newRows[rIdx][0], qty, val, total];
                                        const newTotalVal = newRows.reduce((acc, curr) => acc + (Number(curr[3]) || 0), 0);
                                        return { 
                                          ...prev, 
                                          hoja3: { 
                                            ...prev.hoja3, 
                                            rows: newRows,
                                            formulas: { ...prev.hoja3.formulas, value: newTotalVal }
                                          } 
                                        };
                                      });
                                    }} 
                                  />
                                </td>
                                <td className="num-cell bold-cell">${Number(row[3]).toFixed(2)}</td>
                              </>
                            ) : (
                              <>
                                <td>{row[0]}</td>
                                <td className="num-cell">{row[1]}</td>
                                <td className="num-cell">${Number(row[2]).toFixed(2)}</td>
                                <td className="num-cell bold-cell">${Number(row[3]).toFixed(2)}</td>
                              </>
                            )}
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td className="bold-cell">
                            {isEditing ? (
                              <input 
                                type="text" 
                                className="edit-grid-input"
                                value={generatedData.hoja3.formulas.label} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGeneratedData(prev => ({
                                    ...prev,
                                    hoja3: {
                                      ...prev.hoja3,
                                      formulas: { ...prev.hoja3.formulas, label: val }
                                    }
                                  }));
                                }} 
                              />
                            ) : generatedData.hoja3.formulas.label}
                          </td>
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
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={cIdx === 1 ? 'bold-cell' : ''}>
                                {isEditing ? (
                                  <input 
                                    type="text" 
                                    className="edit-grid-input"
                                    value={cell} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setGeneratedData(prev => {
                                        const newRows = [...prev.hoja4.rows];
                                        newRows[rIdx] = [...newRows[rIdx]];
                                        newRows[rIdx][cIdx] = val;
                                        return { ...prev, hoja4: { ...prev.hoja4, rows: newRows } };
                                      });
                                    }} 
                                  />
                                ) : cell}
                              </td>
                            ))}
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
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={cIdx === 3 ? 'num-cell bold-cell' : ''}>
                                {isEditing ? (
                                  <input 
                                    type="text" 
                                    className="edit-grid-input"
                                    value={cell} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setGeneratedData(prev => {
                                        const newRows = [...prev.hoja5.rows];
                                        newRows[rIdx] = [...newRows[rIdx]];
                                        newRows[rIdx][cIdx] = val;
                                        return { ...prev, hoja5: { ...prev.hoja5, rows: newRows } };
                                      });
                                    }} 
                                  />
                                ) : (
                                  cIdx === 3 ? `${cell}%` : cell
                                )}
                              </td>
                            ))}
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
                                <td>
                                  {isEditing ? (
                                    <input 
                                      type="text" 
                                      className="edit-grid-input"
                                      value={row[0]} 
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setGeneratedData(prev => {
                                          const newRows = [...prev.hoja6.rows];
                                          newRows[rIdx] = [val, newRows[rIdx][1], newRows[rIdx][2]];
                                          return { ...prev, hoja6: { ...prev.hoja6, rows: newRows } };
                                        });
                                      }} 
                                    />
                                  ) : row[0]}
                                </td>
                                <td className="num-cell">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="edit-grid-input"
                                      value={row[1]} 
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setGeneratedData(prev => {
                                          const newRows = [...prev.hoja6.rows];
                                          newRows[rIdx] = [newRows[rIdx][0], val, newRows[rIdx][2]];
                                          return { ...prev, hoja6: { ...prev.hoja6, rows: newRows } };
                                        });
                                      }} 
                                    />
                                  ) : row[1]}
                                </td>
                                <td className="num-cell">
                                  {isEditing ? (
                                    <input 
                                      type="number" 
                                      className="edit-grid-input"
                                      value={row[2]} 
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setGeneratedData(prev => {
                                          const newRows = [...prev.hoja6.rows];
                                          newRows[rIdx] = [newRows[rIdx][0], newRows[rIdx][1], val];
                                          return { ...prev, hoja6: { ...prev.hoja6, rows: newRows } };
                                        });
                                      }} 
                                    />
                                  ) : row[2]}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        <div className="excel-chart-notice">
                          <AlertCircle size={14} className="icon-purple" />
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
                                <svg width="340" height="220" viewBox="0 0 340 220">
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
                                          
                                          const cx = 100, cy = 110, r = 65, ir = 38;
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
                                              <rect x="180" y={40 + idx * 30} width="10" height="10" rx="2" fill={colors[idx]} />
                                              <text x="198" y={49 + idx * 30} fill="#fff" fontSize="10" fontWeight="600">
                                                {labels[idx].split(" - ")[1] || labels[idx]}: {val}
                                              </text>
                                            </g>
                                          );
                                        })}
                                        <circle cx="100" cy="110" r="28" fill="#1e1b29" />
                                        <text x="100" y="114" textAnchor="middle" fill="#aaa" fontSize="10" fontWeight="800">
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
                                <svg width="340" height="220" viewBox="0 0 340 220">
                                  <line x1="45" y1="30" x2="310" y2="30" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="72.5" x2="310" y2="72.5" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="115" x2="310" y2="115" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="157.5" x2="310" y2="157.5" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="200" x2="310" y2="200" stroke="#555" strokeWidth="1.5" />
                                  
                                  <text x="35" y="34" fill="#888" fontSize="8" textAnchor="end">100%</text>
                                  <text x="35" y="76.5" fill="#888" fontSize="8" textAnchor="end">75%</text>
                                  <text x="35" y="119" fill="#888" fontSize="8" textAnchor="end">50%</text>
                                  <text x="35" y="161.5" fill="#888" fontSize="8" textAnchor="end">25%</text>
                                  <text x="35" y="204" fill="#888" fontSize="8" textAnchor="end">0%</text>

                                  {generatedData.hoja6.rows.map((row, idx) => {
                                    const label = row[0].split(" - ")[0] || row[0];
                                    const valA = Number(row[1]);
                                    const valB = Number(row[2]);
                                    
                                    const hA = (valA / 100) * 170;
                                    const hB = (valB / 100) * 170;
                                    const xStart = 45 + idx * 65;
                                    
                                    return (
                                      <g key={idx}>
                                        <rect x={xStart + 10} y={200 - hA} width="14" height={hA} fill="#AA3BFF" rx="1.5" />
                                        <rect x={xStart + 26} y={200 - hB} width="14" height={hB} fill="#10B981" rx="1.5" />
                                        <text x={xStart + 25} y="213" fill="#aaa" fontSize="8" textAnchor="middle" fontWeight="bold">
                                          {label}
                                        </text>
                                      </g>
                                    );
                                  })}

                                  <rect x="230" y="5" width="8" height="8" rx="1.5" fill="#AA3BFF" />
                                  <text x="242" y="12" fill="#aaa" fontSize="8" fontWeight="600">Meta</text>
                                  <rect x="275" y="5" width="8" height="8" rx="1.5" fill="#10B981" />
                                  <text x="287" y="12" fill="#aaa" fontSize="8" fontWeight="600">Real</text>
                                </svg>
                              </div>
                            )}

                            {selectedCharts.includes('line') && (
                              <div className="excel-chart-card animate-fade-in">
                                <h4>Gráfico de Líneas (Evolución de Metas)</h4>
                                <svg width="340" height="220" viewBox="0 0 340 220">
                                  <line x1="45" y1="30" x2="310" y2="30" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="72.5" x2="310" y2="72.5" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="115" x2="310" y2="115" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="157.5" x2="310" y2="157.5" stroke="#2e2b38" strokeDasharray="3,3" />
                                  <line x1="45" y1="200" x2="310" y2="200" stroke="#555" strokeWidth="1.5" />
                                  
                                  <text x="35" y="34" fill="#888" fontSize="8" textAnchor="end">100</text>
                                  <text x="35" y="76.5" fill="#888" fontSize="8" textAnchor="end">75</text>
                                  <text x="35" y="119" fill="#888" fontSize="8" textAnchor="end">50</text>
                                  <text x="35" y="161.5" fill="#888" fontSize="8" textAnchor="end">25</text>
                                  <text x="35" y="204" fill="#888" fontSize="8" textAnchor="end">0</text>

                                  {(() => {
                                    const pointsA = generatedData.hoja6.rows.map((row, idx) => ({
                                      x: 65 + idx * 70,
                                      y: 200 - (Number(row[1]) / 100) * 170
                                    }));
                                    const pointsB = generatedData.hoja6.rows.map((row, idx) => ({
                                      x: 65 + idx * 70,
                                      y: 200 - (Number(row[2]) / 100) * 170
                                    }));
                                    
                                    const pathA = pointsA.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
                                    const pathB = pointsB.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
                                    
                                    return (
                                      <g>
                                        <path d={pathA} fill="none" stroke="#AA3BFF" strokeWidth="1.5" strokeDasharray="2,2" />
                                        <path d={pathB} fill="none" stroke="#10B981" strokeWidth="2" />
                                        
                                        {pointsA.map((p, i) => (
                                          <circle key={`a-${i}`} cx={p.x} cy={p.y} r="2.5" fill="#AA3BFF" />
                                        ))}
                                        {pointsB.map((p, i) => (
                                          <g key={`b-${i}`}>
                                            <circle cx={p.x} cy={p.y} r="3" fill="#10B981" stroke="#15111E" strokeWidth="0.75" />
                                            <text x={p.x} y={p.y - 6} fill="#fff" fontSize="7" fontWeight="bold" textAnchor="middle">
                                              {generatedData.hoja6.rows[i][2]}
                                            </text>
                                          </g>
                                        ))}

                                        {generatedData.hoja6.rows.map((row, idx) => {
                                          const label = row[0].split(" - ")[0] || row[0];
                                          return (
                                            <text key={idx} x={65 + idx * 70} y="213" fill="#aaa" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                                              {label}
                                            </text>
                                          );
                                        })}
                                      </g>
                                    );
                                  })()}

                                  <line x1="230" y1="10" x2="242" y2="10" stroke="#AA3BFF" strokeWidth="1.5" strokeDasharray="2,2" />
                                  <text x="246" y="13" fill="#aaa" fontSize="8" fontWeight="600">Meta</text>
                                  <line x1="280" y1="10" x2="292" y2="10" stroke="#10B981" strokeWidth="1.5" />
                                  <text x="296" y="13" fill="#aaa" fontSize="8" fontWeight="600">Real</text>
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
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>
                                {isEditing ? (
                                  <input 
                                    type="text" 
                                    className="edit-grid-input"
                                    value={cell} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setGeneratedData(prev => {
                                        const newRows = [...prev.hoja7.rows];
                                        newRows[rIdx] = [...newRows[rIdx]];
                                        newRows[rIdx][cIdx] = val;
                                        return { ...prev, hoja7: { ...prev.hoja7, rows: newRows } };
                                      });
                                    }} 
                                  />
                                ) : cell}
                              </td>
                            ))}
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
                  
                  <div className="oficio-header-logo">
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        style={{ textAlign: 'center', width: '100%' }}
                        value={generatedData.encabezado.logoText} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeneratedData(prev => ({
                            ...prev,
                            encabezado: { ...prev.encabezado, logoText: val }
                          }));
                        }}
                      />
                    ) : (
                      <p>{generatedData.encabezado.logoText}</p>
                    )}
                    <hr />
                  </div>

                  <div className="oficio-meta-row">
                    <p className="oficio-num">
                      <strong>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="edit-input" 
                            style={{ fontWeight: 'bold', width: '180px' }}
                            value={generatedData.encabezado.oficioNum} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                encabezado: { ...prev.encabezado, oficioNum: val }
                              }));
                            }}
                          />
                        ) : generatedData.encabezado.oficioNum}
                      </strong>
                    </p>
                    <p className="oficio-date">
                      {isEditing ? (
                        <input 
                          type="text" 
                          className="edit-input" 
                          style={{ width: '220px', textAlign: 'right' }}
                          value={generatedData.encabezado.lugarFecha} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedData(prev => ({
                              ...prev,
                              encabezado: { ...prev.encabezado, lugarFecha: val }
                            }));
                          }}
                        />
                      ) : generatedData.encabezado.lugarFecha}
                    </p>
                  </div>

                  <div className="oficio-destinatario" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {isEditing ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '100px', fontSize: '12px' }}>NOMBRE:</strong>
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={generatedData.destinatario.nombre} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                advisor: val,
                                destinatario: { ...prev.destinatario, nombre: val }
                              }));
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '100px', fontSize: '12px' }}>CARGO:</strong>
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={generatedData.destinatario.cargo} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                destinatario: { ...prev.destinatario, cargo: val }
                              }));
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '100px', fontSize: '12px' }}>INSTITUCIÓN:</strong>
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={generatedData.destinatario.institucion} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                destinatario: { ...prev.destinatario, institucion: val }
                              }));
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p><strong>{generatedData.destinatario.nombre}</strong></p>
                        <p>{generatedData.destinatario.cargo}</p>
                        <p>{generatedData.destinatario.institucion}</p>
                      </>
                    )}
                  </div>

                  <div className="oficio-asunto">
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ minWidth: '80px', fontSize: '12px' }}>ASUNTO:</strong>
                        <input 
                          type="text" 
                          className="edit-input" 
                          style={{ fontWeight: 'bold' }}
                          value={generatedData.asunto} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedData(prev => ({
                              ...prev,
                              asunto: val
                            }));
                          }}
                        />
                      </div>
                    ) : (
                      <p><strong>ASUNTO:</strong> {generatedData.asunto}</p>
                    )}
                  </div>

                  {isEditing ? (
                    <input 
                      type="text" 
                      className="edit-input" 
                      value={generatedData.saludo} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          saludo: val
                        }));
                      }}
                      style={{ marginBottom: '10px' }}
                    />
                  ) : (
                    <p className="oficio-greeting">{generatedData.saludo}</p>
                  )}

                  {isEditing ? (
                    <textarea 
                      className="edit-textarea" 
                      value={generatedData.cuerpo} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          cuerpo: val
                        }));
                      }}
                      style={{ minHeight: '120px', marginBottom: '10px' }}
                    />
                  ) : (
                    <p className="oficio-body">{generatedData.cuerpo}</p>
                  )}

                  {docType === 'petition' && (
                    <div className="oficio-list-section">
                      <p><strong>Peticiones concretas:</strong></p>
                      {isEditing ? (
                        <div className="edit-list" style={{ gap: '8px', marginBottom: '10px' }}>
                          {generatedData.peticion.map((p, idx) => (
                            <input 
                              key={idx}
                              type="text" 
                              className="edit-input" 
                              value={p} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setGeneratedData(prev => {
                                  const newPet = [...prev.peticion];
                                  newPet[idx] = val;
                                  return { ...prev, peticion: newPet };
                                });
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <ul>
                          {generatedData.peticion.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {docType === 'response' && (
                    <>
                      {isEditing ? (
                        <textarea 
                          className="edit-textarea" 
                          style={{ fontWeight: 'bold', marginBottom: '10px' }}
                          value={generatedData.conclusion} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedData(prev => ({
                              ...prev,
                              conclusion: val
                            }));
                          }}
                        />
                      ) : (
                        <p className="oficio-body bold-text">{generatedData.conclusion}</p>
                      )}
                    </>
                  )}

                  {isEditing ? (
                    <input 
                      type="text" 
                      className="edit-input" 
                      value={generatedData.despedida} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedData(prev => ({
                          ...prev,
                          despedida: val
                        }));
                      }}
                      style={{ marginBottom: '10px' }}
                    />
                  ) : (
                    <p className="oficio-body">{generatedData.despedida}</p>
                  )}

                  <div className="oficio-signature" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p>Atentamente,</p>
                    <div className="signature-line"></div>
                    {isEditing ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '100px', fontSize: '12px' }}>NOMBRE:</strong>
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={generatedData.firma.nombre} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                firma: { ...prev.firma, nombre: val }
                              }));
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '100px', fontSize: '12px' }}>CARGO:</strong>
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={generatedData.firma.cargo} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                firma: { ...prev.firma, cargo: val }
                              }));
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '100px', fontSize: '12px' }}>C.I. / R.U.C.:</strong>
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={generatedData.firma.cedula || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                firma: { ...prev.firma, cedula: val }
                              }));
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '100px', fontSize: '12px' }}>INSTITUCIÓN:</strong>
                          <input 
                            type="text" 
                            className="edit-input" 
                            value={generatedData.firma.institucion || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                firma: { ...prev.firma, institucion: val }
                              }));
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p><strong>{generatedData.firma.nombre}</strong></p>
                        <p>{generatedData.firma.cargo}</p>
                        {generatedData.firma.cedula && <p>C.I. {generatedData.firma.cedula}</p>}
                        {generatedData.firma.institucion && <p>{generatedData.firma.institucion}</p>}
                      </>
                    )}
                  </div>

                  <div className="oficio-anexos">
                    <p><strong>Anexos:</strong></p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        value={generatedData.anexos} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeneratedData(prev => ({
                            ...prev,
                            anexos: val
                          }));
                        }}
                      />
                    ) : (
                      <p>{generatedData.anexos}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="canvas-state placeholder-state animate-fade-in">
            <div className="icon-circle">
              <Sparkles className="pulsate" size={32} />
            </div>
            <h3>Tu documento aparecerá aquí</h3>
            <p>Escribe tu prompt o haz clic en una sugerencia. La Inteligencia Artificial estructurará los contenidos y los previsualizará de inmediato.</p>
          </div>
        )}
      </div>
    </div>
  );
}
