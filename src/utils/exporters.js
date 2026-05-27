/**
 * Módulo de Exportación de Archivos.
 * Contiene los exportadores a DOCX, PDF, XLSX y PPTX.
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
import { parseSlideText } from './documentGenerator';

// ==========================================================================
// FUNCIONES AUXILIARES PARA EL PREPARADO DE PDF (.pdf)
// ==========================================================================

function addPDFHeaderFooter(doc, title) {
  const pageCount = doc.internal.getNumberOfPages();
  
  // No dibujar encabezado/pie de página en la portada (página 1)
  if (pageCount === 1) return;

  // Dibujar Encabezado
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(title.toUpperCase().substring(0, 75), 20, 15);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(20, 17, 190, 17);

  // Dibujar Pie de Página
  doc.text(`Página ${pageCount}`, 105, 285, { align: "center" });
}

function addPDFSection(doc, sectionTitle, contentText, startY) {
  let y = startY;
  
  // Título de Sección
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(170, 59, 255); // Púrpura #AA3BFF
  doc.text(sectionTitle, 20, y);
  y += 6;

  // Cuerpo de Sección
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(50, 50, 50);
  const lines = doc.splitTextToSize(contentText, 170);
  doc.text(lines, 20, y);
  
  return y + (lines.length * 5.2);
}

// ==========================================================================
// EXPORTADORES A ARCHIVOS FÍSICOS
// ==========================================================================

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
      new Paragraph({ text: "", spacing: { before: 200 } }),
      
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
    y = doc.lastAutoTable.finalY + 10;
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
