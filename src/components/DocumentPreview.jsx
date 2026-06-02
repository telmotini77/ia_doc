import { useState } from 'react';
import {
  BookOpen, FileDown, Download, Presentation, FileSpreadsheet, Sparkles, ChevronLeft, ChevronRight,
  Upload, Trash2, Plus, ArrowUp, ArrowDown
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
  onDownload,
  reportFormat,
  coverLogo,
  coverAlign,
  coverSizes,
  isEditing,
  setGeneratedData,
  pptxPalette,
  customPptxPalette,
  onClearAll
}) {
  const [activeCharts, setActiveCharts] = useState({
    hoja2: 'bar',
    hoja3: 'pie',
    hoja4: 'bar',
    hoja5: 'bar',
    hoja6: 'bar',
    hoja7: 'bar'
  });

  const handleChartChange = (sheetKey, chartType) => {
    setActiveCharts(prev => ({
      ...prev,
      [sheetKey]: chartType
    }));
  };

  const renderGenericSheet = (sheetKey) => {
    const sheetData = generatedData[sheetKey];
    if (!sheetData) return null;
    const headers = sheetData.headers || [];
    const rows = sheetData.rows || [];

    return (
      <table className="excel-table grid">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => {
                if (isEditing) {
                  return (
                    <td key={cIdx}>
                      <input
                        type="text"
                        className="edit-grid-input"
                        value={cell !== null && cell !== undefined ? cell : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeneratedData(prev => {
                            const newRows = [...prev[sheetKey].rows];
                            newRows[rIdx] = [...newRows[rIdx]];
                            const originalVal = prev[sheetKey].rows[rIdx][cIdx];
                            if (typeof originalVal === 'number') {
                              const parsedNum = parseFloat(val);
                              newRows[rIdx][cIdx] = isNaN(parsedNum) ? val : parsedNum;
                            } else {
                              newRows[rIdx][cIdx] = val;
                            }
                            return {
                              ...prev,
                              [sheetKey]: { ...prev[sheetKey], rows: newRows }
                            };
                          });
                        }}
                      />
                    </td>
                  );
                }

                const header = headers[cIdx] || "";
                const isPercentageHeader = header.toLowerCase().includes('%');
                const isCurrencyHeader = header.toLowerCase().includes('$') || header.toLowerCase().includes('costo') || header.toLowerCase().includes('total');
                
                let displayVal = cell;
                if (typeof cell === 'number') {
                  if (isPercentageHeader) {
                    displayVal = `${cell.toFixed(1)}%`;
                  } else if (isCurrencyHeader) {
                    displayVal = `$${cell.toFixed(2)}`;
                  } else {
                    displayVal = cell.toString();
                  }
                } else if (typeof cell === 'string') {
                  displayVal = cell;
                }

                if (header.toLowerCase() === 'estado') {
                  const statusClass = String(cell).toLowerCase().includes('completado')
                    ? 'completed'
                    : String(cell).toLowerCase().includes('progreso')
                      ? 'in-progress'
                      : 'pending';
                  return <td key={cIdx} className={`status-pill ${statusClass}`}>{cell}</td>;
                }

                return <td key={cIdx} className={typeof cell === 'number' ? 'num-cell' : ''}>{displayVal}</td>;
              })}
            </tr>
          ))}
          {sheetData.formulas && sheetData.formulas.label && (
            <tr className="total-row">
              <td className="bold-cell">
                {isEditing ? (
                  <input
                    type="text"
                    className="edit-grid-input"
                    value={sheetData.formulas.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGeneratedData(prev => ({
                        ...prev,
                        [sheetKey]: {
                          ...prev[sheetKey],
                          formulas: { ...prev[sheetKey].formulas, label: val }
                        }
                      }));
                    }}
                  />
                ) : sheetData.formulas.label}
              </td>
              {headers.slice(1, headers.length - 1).map((_, i) => <td key={i}></td>)}
              <td className="num-cell bold-cell text-purple">
                {sheetData.formulas.value !== undefined ? (
                  sheetData.headers[sheetData.headers.length - 1].toLowerCase().includes('$')
                    ? `$${Number(sheetData.formulas.value).toFixed(2)}`
                    : sheetData.formulas.value
                ) : ""}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const getAIRecommendation = (sheetKey) => {
    const sheet = generatedData[sheetKey];
    const title = (sheet?.titulo || "").toLowerCase();
    
    if (title.includes("cronograma") || title.includes("actividad")) {
      return {
        type: 'bar',
        label: 'Gráfico de Barras de Progreso (Gantt)',
        justification: 'Esta tabla representa un cronograma de actividades. Un gráfico de barras horizontales (tipo Gantt) es la mejor opción para visualizar la duración y el estado de cada tarea.'
      };
    }
    if (title.includes("presupuesto") || title.includes("costo")) {
      return {
        type: 'pie',
        label: 'Diagrama de Pastel (Distribución)',
        justification: 'Esta tabla detalla un presupuesto de recursos. Un gráfico de pastel (torta) es ideal para visualizar la proporción del presupuesto consumida por cada concepto.'
      };
    }
    if (title.includes("anual") || title.includes("pib") || title.includes("crecimiento")) {
      return {
        type: 'bar',
        label: 'Gráfico de Columnas (Evolución Temporal)',
        justification: 'Esta tabla muestra variables macroeconómicas anuales. Un gráfico de columnas verticales es la mejor opción para observar tendencias temporales del PIB e inflación.'
      };
    }
    if (title.includes("quinquenal") || title.includes("promedio")) {
      return {
        type: 'bar',
        label: 'Gráfico de Barras Agrupadas',
        justification: 'Esta tabla compara indicadores promedio por periodo. Un gráfico de columnas o barras agrupadas es ideal para contrastar múltiples variables macroeconómicas simultáneamente.'
      };
    }
    if (title.includes("decada") || title.includes("década")) {
      return {
        type: 'bar',
        label: 'Gráfico de Barras General',
        justification: 'Esta tabla sintetiza el promedio de toda la década. Un gráfico de barras agrupadas es ideal para visualizar el comportamiento macroeconómico consolidado de este periodo.'
      };
    }
    
    switch (sheetKey) {
      case 'hoja2':
        return {
          type: 'bar',
          label: 'Gráfico de Barras de Progreso (Gantt)',
          justification: 'Esta tabla representa un cronograma de actividades. Un gráfico de barras horizontales (tipo Gantt) es la mejor opción para visualizar la duración y el estado de cada tarea.'
        };
      case 'hoja3':
        return {
          type: 'pie',
          label: 'Diagrama de Pastel (Distribución)',
          justification: 'Esta tabla detalla un presupuesto de recursos. Un gráfico de pastel (torta) es ideal para visualizar la proporción del presupuesto consumida por cada concepto.'
        };
      case 'hoja4':
        return {
          type: 'bar',
          label: 'Gráfico de Barras Agrupadas',
          justification: 'Esta tabla detalla objetivos y resultados cualitativos o cuantitativos. Un gráfico de barras es la forma más estructurada para comparar el avance operativo de cada variable.'
        };
      case 'hoja5':
        return {
          type: 'bar',
          label: 'Gráfico de Comparación (Meta vs Real)',
          justification: 'Esta tabla contiene métricas de KPIs con metas y logros. Un gráfico de barras agrupadas es óptimo para contrastar visualmente el valor planificado frente al obtenido.'
        };
      case 'hoja6':
        return {
          type: 'bar',
          label: 'Gráfico de Barras Comparativo',
          justification: 'Esta tabla contiene la comparación de variables de metas y mediciones reales. Un gráfico de barras es la mejor opción para contrastar la desviación en cada fase.'
        };
      case 'hoja7':
        return {
          type: 'bar',
          label: 'Gráfico de Hitos Temporales',
          justification: 'Esta tabla es un registro histórico de entregables con fechas. Un gráfico de barras horizontales o hitos temporales es el más indicado para seguir la velocidad y frecuencia de entrega de evidencias.'
        };
      default:
        return {
          type: 'bar',
          label: 'Gráfico de Barras',
          justification: 'Un gráfico de barras es la representación por defecto para comparar datos categóricos de manera legible.'
        };
    }
  };

  const renderSVGChart = (sheetKey, chartType) => {
    const sheetData = generatedData[sheetKey];
    if (!sheetData || !sheetData.rows || sheetData.rows.length === 0) {
      return <div style={{ color: '#aaa', fontSize: '12px' }}>Sin datos disponibles para graficar.</div>;
    }

    const rows = sheetData.rows;
    const headers = sheetData.headers || [];
    
    const isCronograma = (sheetData.titulo || "").toLowerCase().includes("cronograma");
    const isPresupuesto = (sheetData.titulo || "").toLowerCase().includes("presupuesto");
    
    const colors = ['#AA3BFF', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899'];
    const statusColors = {
      'Completado': '#10B981',
      'En Progreso': '#F59E0B',
      'Pendiente': '#6B7280'
    };

    if (isPresupuesto && sheetKey === 'hoja3') {
      const labels = rows.map(r => r[0] || "");
      const values = rows.map(r => Number(r[3]) || 0);
      const total = values.reduce((s, v) => s + v, 0);

      if (total === 0) return <div style={{ color: '#aaa', fontSize: '12px' }}>El presupuesto total es $0.00</div>;

      if (chartType === 'pie') {
        let currentAngle = 0;
        return (
          <svg width="340" height="220" viewBox="0 0 340 220">
            <g>
              {values.slice(0, 5).map((val, idx) => {
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

                const labelText = labels[idx].length > 15 ? labels[idx].substring(0, 15) + '...' : labels[idx];
                return (
                  <g key={idx}>
                    <path d={pathData} fill={colors[idx % colors.length]} stroke="#1e1b29" strokeWidth="1" />
                    <rect x="180" y={30 + idx * 28} width="10" height="10" rx="2" fill={colors[idx % colors.length]} />
                    <text x="198" y={39 + idx * 28} fill="#fff" fontSize="10" fontWeight="600">
                      {labelText}: ${val.toFixed(2)}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="110" r="28" fill="#1e1b29" />
              <text x="100" y="114" textAnchor="middle" fill="#aaa" fontSize="9" fontWeight="800">
                Costos
              </text>
            </g>
          </svg>
        );
      } else {
        const maxVal = Math.max(...values, 1);
        return (
          <svg width="340" height="220" viewBox="0 0 340 220">
            <line x1="45" y1="40" x2="310" y2="40" stroke="#2e2b38" strokeDasharray="3,3" />
            <line x1="45" y1="90" x2="310" y2="90" stroke="#2e2b38" strokeDasharray="3,3" />
            <line x1="45" y1="140" x2="310" y2="140" stroke="#2e2b38" strokeDasharray="3,3" />
            <line x1="45" y1="190" x2="310" y2="190" stroke="#555" strokeWidth="1.5" />

            <text x="35" y="44" fill="#888" fontSize="8" textAnchor="end">${maxVal.toFixed(0)}</text>
            <text x="35" y="94" fill="#888" fontSize="8" textAnchor="end">${(maxVal * 0.66).toFixed(0)}</text>
            <text x="35" y="144" fill="#888" fontSize="8" textAnchor="end">${(maxVal * 0.33).toFixed(0)}</text>
            <text x="35" y="194" fill="#888" fontSize="8" textAnchor="end">$0</text>

            {chartType === 'bar' ? (
              rows.slice(0, 5).map((row, idx) => {
                const val = Number(row[3]) || 0;
                const h = (val / maxVal) * 150;
                const xStart = 50 + idx * 52;
                const labelText = row[0].substring(0, 8);
                return (
                  <g key={idx}>
                    <rect x={xStart + 6} y={190 - h} width="24" height={h} fill={colors[idx % colors.length]} rx="1.5" />
                    <text x={xStart + 18} y="205" fill="#aaa" fontSize="8" textAnchor="middle" fontWeight="bold">
                      {labelText}
                    </text>
                  </g>
                );
              })
            ) : (
              (() => {
                const points = rows.slice(0, 5).map((row, idx) => ({
                  x: 65 + idx * 52,
                  y: 190 - ((Number(row[3]) || 0) / maxVal) * 150
                }));
                const path = points.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
                return (
                  <g>
                    <path d={path} fill="none" stroke="#AA3BFF" strokeWidth="2" />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="3.5" fill="#10B981" stroke="#1e1b29" strokeWidth="1" />
                        <text x={p.x} y={p.y - 7} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
                          ${values[idx].toFixed(0)}
                        </text>
                        <text x={p.x} y="205" fill="#aaa" fontSize="8" textAnchor="middle" fontWeight="bold">
                          {labels[idx].substring(0, 8)}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()
            )}
          </svg>
        );
      }
    } else if (isCronograma && sheetKey === 'hoja2') {
      const statuses = rows.map(r => r[4] || "Pendiente");
      const statusCounts = {};
      statuses.forEach(s => {
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      const labels = Object.keys(statusCounts);
      const values = Object.values(statusCounts);
      const total = values.reduce((s, v) => s + v, 0);

      if (chartType === 'pie') {
        let currentAngle = 0;
        return (
          <svg width="340" height="220" viewBox="0 0 340 220">
            <g>
              {labels.map((lbl, idx) => {
                const val = statusCounts[lbl];
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
                const iy2 = cx + ir * Math.cos((startAngle + offset) * rad);

                const largeArcFlag = angle <= 180 ? 0 : 1;
                const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${largeArcFlag} 0 ${ix2} ${iy2} Z`;

                const color = statusColors[lbl] || colors[idx % colors.length];
                return (
                  <g key={idx}>
                    <path d={pathData} fill={color} stroke="#1e1b29" strokeWidth="1" />
                    <rect x="180" y={50 + idx * 30} width="12" height="12" rx="2.5" fill={color} />
                    <text x="200" y={60 + idx * 30} fill="#fff" fontSize="11" fontWeight="600">
                      {lbl}: {val} tarea{val > 1 ? 's' : ''}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="110" r="28" fill="#1e1b29" />
              <text x="100" y="114" textAnchor="middle" fill="#aaa" fontSize="8" fontWeight="800">
                Estado
              </text>
            </g>
          </svg>
        );
      } else {
        const progressValues = rows.slice(0, 5).map(r => {
          const s = r[4] || "Pendiente";
          return s === 'Completado' ? 100 : s === 'En Progreso' ? 50 : 10;
        });
        const taskLabels = rows.slice(0, 5).map(r => r[0] || "");

        return (
          <svg width="340" height="220" viewBox="0 0 340 220">
            <text x="80" y="25" fill="#888" fontSize="8" textAnchor="middle">Inicio</text>
            <text x="280" y="25" fill="#888" fontSize="8" textAnchor="middle">Fin</text>
            <line x1="80" y1="32" x2="280" y2="32" stroke="#555" strokeWidth="1.5" />

            {taskLabels.map((lbl, idx) => {
              const progress = progressValues[idx];
              const yStart = 40 + idx * 32;
              const shortLabel = lbl.length > 18 ? lbl.substring(0, 18) + '...' : lbl;
              const color = progress === 100 ? '#10B981' : progress === 50 ? '#F59E0B' : '#6B7280';
              return (
                <g key={idx}>
                  <text x="70" y={yStart + 11} fill="#aaa" fontSize="8" textAnchor="end" fontWeight="bold">
                    {shortLabel}
                  </text>
                  <rect x="80" y={yStart} width="200" height="13" rx="3" fill="#2d2a3a" />
                  <rect x="80" y={yStart} width={(progress / 100) * 200} height="13" rx="3" fill={color} />
                  <text x={80 + (progress / 100) * 200 - 15 > 90 ? 80 + (progress / 100) * 200 - 15 : 95} y={yStart + 10} fill="#fff" fontSize="8.5" fontWeight="bold">
                    {progress}%
                  </text>
                </g>
              );
            })}
          </svg>
        );
      }
    } else {
      // Dynamic generic sheets plotting! (e.g. for macroeconomics)
      const xLabels = rows.map(r => String(r[0] || ""));
      
      const numCols = [];
      headers.forEach((h, colIdx) => {
        if (colIdx > 0) {
          const hasNum = rows.some(r => {
            const val = r[colIdx];
            return typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val));
          });
          if (hasNum) {
            numCols.push({ idx: colIdx, name: h });
          }
        }
      });
      
      if (numCols.length === 0) {
        return <div style={{ color: '#aaa', fontSize: '12px' }}>Sin datos numéricos para graficar.</div>;
      }
      
      if (chartType === 'pie') {
        let targetColIdx = numCols[0].idx;
        let targetColName = numCols[0].name;
        
        // Prefer plotting Unemployment ("desempleo") or real columns
        const specialCol = numCols.find(c => c.name.toLowerCase().includes("desempleo") || c.name.toLowerCase().includes("real"));
        if (specialCol) {
          targetColIdx = specialCol.idx;
          targetColName = specialCol.name;
        }
        
        const values = rows.map(r => Math.abs(parseFloat(r[targetColIdx])) || 0);
        const total = values.reduce((s, v) => s + v, 0);
        
        if (total === 0) {
          return <div style={{ color: '#aaa', fontSize: '12px' }}>Los valores de la columna son $0.00</div>;
        }
        
        let currentAngle = 0;
        return (
          <svg width="340" height="220" viewBox="0 0 340 220">
            <g>
              {values.slice(0, 10).map((val, idx) => {
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
                const iy2 = cx + ir * Math.cos((startAngle + offset) * rad);

                const largeArcFlag = angle <= 180 ? 0 : 1;
                const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${largeArcFlag} 0 ${ix2} ${iy2} Z`;

                const labelText = xLabels[idx] || "";
                const shortLabel = labelText.length > 10 ? labelText.substring(0, 10) + '...' : labelText;
                
                return (
                  <g key={idx}>
                    <path d={pathData} fill={colors[idx % colors.length]} stroke="#1e1b29" strokeWidth="1" />
                    {idx < 6 && (
                      <g>
                        <rect x="180" y={22 + idx * 24} width="8" height="8" rx="1.5" fill={colors[idx % colors.length]} />
                        <text x="194" y={30 + idx * 24} fill="#fff" fontSize="9" fontWeight="600">
                          {shortLabel}: {val.toFixed(1)}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              <circle cx="100" cy="110" r="28" fill="#1e1b29" />
              <text x="100" y="112" textAnchor="middle" fill="#aaa" fontSize="8" fontWeight="800">
                {targetColName.substring(0, 12)}
              </text>
            </g>
          </svg>
        );
      } else {
        const colsToPlot = numCols.slice(0, 3);
        const allValues = rows.flatMap(r => colsToPlot.map(c => parseFloat(r[c.idx]) || 0));
        let maxVal = Math.max(...allValues, 1);
        const minVal = Math.min(...allValues, 0);
        const range = maxVal - minVal;
        
        const getY = (val) => 170 - ((val - minVal) / (range || 1)) * 130;
        const zeroY = getY(0);

        return (
          <svg width="340" height="220" viewBox="0 0 340 220">
            <line x1="45" y1="40" x2="310" y2="40" stroke="#2e2b38" strokeDasharray="3,3" />
            <line x1="45" y1="105" x2="310" y2="105" stroke="#2e2b38" strokeDasharray="3,3" />
            <line x1="45" y1="170" x2="310" y2="170" stroke="#2e2b38" strokeDasharray="3,3" />
            <line x1="45" y1={zeroY} x2="310" y2={zeroY} stroke="#777" strokeWidth="1.5" />

            <text x="35" y="44" fill="#888" fontSize="8" textAnchor="end">{maxVal.toFixed(1)}%</text>
            <text x="35" y="109" fill="#888" fontSize="8" textAnchor="end">{((maxVal + minVal) / 2).toFixed(1)}%</text>
            <text x="35" y="174" fill="#888" fontSize="8" textAnchor="end">{minVal.toFixed(1)}%</text>

            {chartType === 'bar' ? (
              rows.slice(0, 10).map((row, rIdx) => {
                const groupWidth = 24;
                const step = 260 / Math.min(rows.length, 10);
                const xStart = 50 + rIdx * step;
                
                return (
                  <g key={rIdx}>
                    {colsToPlot.map((col, cIdx) => {
                      const val = parseFloat(row[col.idx]) || 0;
                      const yVal = getY(val);
                      const barH = Math.abs(zeroY - yVal);
                      const barY = val >= 0 ? yVal : zeroY;
                      const colW = groupWidth / colsToPlot.length;
                      const colX = xStart + cIdx * colW;
                      
                      return (
                        <rect 
                          key={cIdx} 
                          x={colX} 
                          y={barY} 
                          width={colW - 0.5} 
                          height={Math.max(barH, 1)} 
                          fill={colors[cIdx % colors.length]} 
                          rx="0.5" 
                        />
                      );
                    })}
                    <text x={xStart + groupWidth / 2} y="185" fill="#aaa" fontSize="7" textAnchor="middle" fontWeight="bold">
                      {String(row[0]).substring(2, 4) || row[0]}
                    </text>
                  </g>
                );
              })
            ) : (
              <g>
                {colsToPlot.map((col, cIdx) => {
                  const points = rows.slice(0, 10).map((row, rIdx) => ({
                    x: 60 + rIdx * (230 / (Math.min(rows.length, 10) - 1 || 1)),
                    y: getY(parseFloat(row[col.idx]) || 0)
                  }));
                  const path = points.reduce((str, p, i) => `${str}${i === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
                  
                  return (
                    <g key={cIdx}>
                      <path d={path} fill="none" stroke={colors[cIdx % colors.length]} strokeWidth="1.5" />
                      {points.map((p, pIdx) => (
                        <circle key={pIdx} cx={p.x} cy={p.y} r="2.5" fill={colors[cIdx % colors.length]} stroke="#1e1b29" strokeWidth="1" />
                      ))}
                    </g>
                  );
                })}
                {rows.slice(0, 10).map((row, rIdx) => {
                  const x = 60 + rIdx * (230 / (Math.min(rows.length, 10) - 1 || 1));
                  return (
                    <text key={rIdx} x={x} y="185" fill="#aaa" fontSize="7" textAnchor="middle" fontWeight="bold">
                      {String(row[0]).substring(2, 4) || row[0]}
                    </text>
                  );
                })}
              </g>
            )}
            
            {/* Legend */}
            <g transform="translate(45, 198)">
              {colsToPlot.map((col, cIdx) => (
                <g key={cIdx} transform={`translate(${cIdx * 90}, 0)`}>
                  <rect x="0" y="-6" width="6" height="6" rx="1" fill={colors[cIdx % colors.length]} />
                  <text x="10" y="0" fill="#fff" fontSize="8">{col.name.substring(0, 12)}</text>
                </g>
              ))}
            </g>
          </svg>
        );
      }
    }
  };

  const handleAddSlide = () => {
    if (!generatedData || !generatedData.slides) return;
    const newSlides = [...generatedData.slides];
    const newSlide = {
      num: activeSlide + 2,
      title: "Nueva Diapositiva",
      content: "Título de la Sección:\n- Punto clave número uno.\n- Detalle o descripción adicional."
    };
    newSlides.splice(activeSlide + 1, 0, newSlide);
    newSlides.forEach((slide, index) => {
      slide.num = index + 1;
    });
    setGeneratedData(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlide(activeSlide + 1);
  };

  const handleDeleteSlide = () => {
    if (!generatedData || !generatedData.slides || generatedData.slides.length <= 1) return;
    const newSlides = [...generatedData.slides];
    newSlides.splice(activeSlide, 1);
    newSlides.forEach((slide, index) => {
      slide.num = index + 1;
    });
    setGeneratedData(prev => ({
      ...prev,
      slides: newSlides
    }));
    if (activeSlide >= newSlides.length) {
      setActiveSlide(newSlides.length - 1);
    }
  };

  const handleMoveSlideUp = () => {
    if (activeSlide === 0 || !generatedData || !generatedData.slides) return;
    const newSlides = [...generatedData.slides];
    const temp = newSlides[activeSlide];
    newSlides[activeSlide] = newSlides[activeSlide - 1];
    newSlides[activeSlide - 1] = temp;
    newSlides.forEach((slide, index) => {
      slide.num = index + 1;
    });
    setGeneratedData(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlide(activeSlide - 1);
  };

  const handleMoveSlideDown = () => {
    if (!generatedData || !generatedData.slides || activeSlide === generatedData.slides.length - 1) return;
    const newSlides = [...generatedData.slides];
    const temp = newSlides[activeSlide];
    newSlides[activeSlide] = newSlides[activeSlide + 1];
    newSlides[activeSlide + 1] = temp;
    newSlides.forEach((slide, index) => {
      slide.num = index + 1;
    });
    setGeneratedData(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlide(activeSlide + 1);
  };
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
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-action xlsx" onClick={() => onDownload('excel-xlsx')}>
                  <FileSpreadsheet size={14} /> Excel (.xlsx)
                </button>
                <button type="button" className="btn-action xlsx" style={{ background: '#107c41' }} onClick={() => onDownload('excel-xls')}>
                  <FileSpreadsheet size={14} /> Excel 97-2003 (.xls)
                </button>
                <button type="button" className="btn-action xlsx" style={{ background: '#0284c7' }} onClick={() => onDownload('csv')}>
                  <FileSpreadsheet size={14} /> CSV (.csv)
                </button>
              </div>
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

                    <div className="slide-editor-toolbar" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleAddSlide}
                        className="premium-btn btn-settings"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                      >
                        <Plus size={14} /> Añadir Diapositiva
                      </button>
                      <button
                        type="button"
                        disabled={activeSlide === 0}
                        onClick={handleMoveSlideUp}
                        className="premium-btn btn-settings"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                      >
                        <ArrowUp size={14} /> Mover Anterior
                      </button>
                      <button
                        type="button"
                        disabled={activeSlide === generatedData.slides.length - 1}
                        onClick={handleMoveSlideDown}
                        className="premium-btn btn-settings"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                      >
                        <ArrowDown size={14} /> Mover Siguiente
                      </button>
                      <button
                        type="button"
                        disabled={generatedData.slides.length <= 1}
                        onClick={handleDeleteSlide}
                        className="premium-btn btn-settings"
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
                      >
                        <Trash2 size={14} /> Eliminar Diapositiva
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
                  {Object.keys(generatedData).filter(key => key.startsWith('hoja') && generatedData[key]).map((sheetKey) => {
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

                  {activeSheet !== 'hoja1' && (
                    activeSheet === 'hoja3' && generatedData.hoja3 && generatedData.hoja3.titulo && generatedData.hoja3.titulo.toLowerCase().includes("presupuesto") ? (
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
                    ) : (
                      renderGenericSheet(activeSheet)
                    )
                  )}

                  {activeSheet !== 'hoja1' && (
                    <div className="excel-ia-assistant-panel">
                      <div className="ia-assistant-header">
                        <div className="ia-assistant-title-row">
                          <Sparkles className="icon-sparkle animate-pulse" size={18} />
                          <h3>Asistente de Gráficos IA</h3>
                        </div>
                        <div className="ia-assistant-recommendation">
                          <span className="recommendation-badge">
                            Recomendado: {getAIRecommendation(activeSheet, generatedData[activeSheet]).label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ia-assistant-body">
                        <div className="ia-assistant-info">
                          <p className="ia-justification">
                            {getAIRecommendation(activeSheet, generatedData[activeSheet]).justification}
                          </p>
                          
                          <div className="ia-chart-controls">
                            <span className="control-label">Cambiar tipo de gráfico:</span>
                            <div className="ia-chart-buttons">
                              {['bar', 'pie', 'line'].map((type) => {
                                const recommended = getAIRecommendation(activeSheet, generatedData[activeSheet]).type;
                                const currentChart = activeCharts[activeSheet] || recommended;
                                const isActive = currentChart === type;
                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleChartChange(activeSheet, type)}
                                    className={`ia-chart-btn ${isActive ? 'active' : ''}`}
                                  >
                                    {type === 'bar' ? 'Barras' : type === 'pie' ? 'Pastel' : 'Líneas'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ia-chart-preview">
                          <div className="ia-chart-container-inner">
                            {renderSVGChart(activeSheet, activeCharts[activeSheet] || getAIRecommendation(activeSheet, generatedData[activeSheet]).type)}
                          </div>
                        </div>
                      </div>
                    </div>
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

                  {/* TYPE TAG */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: docType === 'petition' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
                    border: `1px solid ${docType === 'petition' ? '#7c3aed' : '#059669'}`,
                    borderRadius: '6px', padding: '4px 12px', marginBottom: '14px', marginTop: '2px'
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: docType === 'petition' ? '#a78bfa' : '#34d399' }}>
                      {docType === 'petition' ? '📋 Oficio de Solicitud' : '✅ Oficio de Respuesta'}
                    </span>
                  </div>

                  {/* REFERENCIA AL OFICIO PREVIO — solo en Respuesta */}
                  {docType === 'response' && generatedData.referenciaOficioPrevio && (
                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px' }}>
                      <p style={{ margin: 0, fontSize: '12px' }}>
                        <strong style={{ color: '#34d399' }}>📎 En referencia a:</strong>{' '}
                        {isEditing ? (
                          <input
                            type="text"
                            className="edit-input"
                            style={{ width: '260px', display: 'inline-block' }}
                            value={generatedData.referenciaOficioPrevio}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({ ...prev, referenciaOficioPrevio: val }));
                            }}
                          />
                        ) : generatedData.referenciaOficioPrevio}
                      </p>
                    </div>
                  )}

                  {/* DESTINATARIO (Persona tipada) */}
                  <div className="oficio-destinatario" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
                      {docType === 'petition' ? 'Dirigido a:' : 'Para:'}
                    </p>
                    {isEditing ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '110px', fontSize: '12px' }}>TRATAMIENTO:</strong>
                          <input
                            type="text"
                            className="edit-input"
                            value={generatedData.destinatario.tratamiento || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                destinatario: { ...prev.destinatario, tratamiento: val }
                              }));
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '110px', fontSize: '12px' }}>NOMBRE:</strong>
                          <input
                            type="text"
                            className="edit-input"
                            value={generatedData.destinatario.nombre}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                destinatario: { ...prev.destinatario, nombre: val }
                              }));
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '110px', fontSize: '12px' }}>CARGO:</strong>
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
                          <strong style={{ width: '110px', fontSize: '12px' }}>INSTITUCIÓN:</strong>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ width: '110px', fontSize: '12px' }}>CIUDAD:</strong>
                          <input
                            type="text"
                            className="edit-input"
                            value={generatedData.destinatario.ciudad || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeneratedData(prev => ({
                                ...prev,
                                destinatario: { ...prev.destinatario, ciudad: val }
                              }));
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {generatedData.destinatario.tratamiento && (
                          <p style={{ margin: 0, fontSize: '13px' }}>{generatedData.destinatario.tratamiento}</p>
                        )}
                        <p style={{ margin: 0, fontSize: '14px' }}><strong>{generatedData.destinatario.nombre}</strong></p>
                        <p style={{ margin: 0, fontSize: '13px' }}>{generatedData.destinatario.cargo}</p>
                        <p style={{ margin: 0, fontSize: '13px' }}>{generatedData.destinatario.institucion}</p>
                        {generatedData.destinatario.ciudad && (
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{generatedData.destinatario.ciudad}</p>
                        )}
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

      {/* Footer Clear and Reset Button */}
      <div className="preview-footer">
        <button 
          type="button" 
          className="btn-clear-all"
          onClick={onClearAll}
          title="Limpiar consulta, metadatos y restablecer colores"
        >
          <Trash2 size={15} /> Limpiar y Reiniciar Todo
        </button>
      </div>
    </div>
  );
}
