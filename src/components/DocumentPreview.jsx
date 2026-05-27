import React from 'react';
import { 
  BookOpen, FileDown, Download, Presentation, FileSpreadsheet, AlertCircle, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { parseSlideText } from '../utils/documentGenerator';

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
  onDownload
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
                        })()}
                      </div>
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
            )}

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
                        <tr><td className="cell-header bold-cell">{generatedData.hoja1.titulo}</td><td></td></tr>
                        <tr><td></td><td></td></tr>
                        <tr><td className="bold-cell gray-cell">PROYECTO:</td><td>{generatedData.hoja1.proyecto}</td></tr>
                        {generatedData.hoja1.institucion && (
                          <tr><td className="bold-cell gray-cell">INSTITUCIÓN:</td><td>{generatedData.hoja1.institucion}</td></tr>
                        )}
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
                  
                  <div className="oficio-header-logo">
                    <p>{generatedData.encabezado.logoText}</p>
                    <hr />
                  </div>

                  <div className="oficio-meta-row">
                    <p className="oficio-num"><strong>{generatedData.encabezado.oficioNum}</strong></p>
                    <p className="oficio-date">{generatedData.encabezado.lugarFecha}</p>
                  </div>

                  <div className="oficio-destinatario">
                    <p><strong>{generatedData.destinatario.nombre}</strong></p>
                    <p>{generatedData.destinatario.cargo}</p>
                    <p>{generatedData.destinatario.institucion}</p>
                  </div>

                  <div className="oficio-asunto">
                    <p><strong>ASUNTO:</strong> {generatedData.asunto}</p>
                  </div>

                  <p className="oficio-greeting">{generatedData.saludo}</p>

                  <p className="oficio-body">{generatedData.cuerpo}</p>

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

                  {docType === 'response' && (
                    <p className="oficio-body bold-text">{generatedData.conclusion}</p>
                  )}

                  <p className="oficio-body">{generatedData.despedida}</p>

                  <div className="oficio-signature">
                    <p>Atentamente,</p>
                    <div className="signature-line"></div>
                    <p><strong>{generatedData.firma.nombre}</strong></p>
                    <p>{generatedData.firma.cargo}</p>
                    {generatedData.firma.cedula && <p>C.I. {generatedData.firma.cedula}</p>}
                    {generatedData.firma.institucion && <p>{generatedData.firma.institucion}</p>}
                  </div>

                  <div className="oficio-anexos">
                    <p><strong>Anexos:</strong></p>
                    <p>{generatedData.anexos}</p>
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
