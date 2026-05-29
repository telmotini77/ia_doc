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
  WidthType,
  Header,
  TextRun,
  PageNumber
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

const docxFontMapping = {
  times12: { name: "Times New Roman", size: 24, heading1Size: 32, heading2Size: 28, heading3Size: 24 },
  georgia11: { name: "Georgia", size: 22, heading1Size: 30, heading2Size: 26, heading3Size: 22 },
  computer10: { name: "Courier New", size: 20, heading1Size: 28, heading2Size: 24, heading3Size: 20 },
  calibri11: { name: "Calibri", size: 22, heading1Size: 30, heading2Size: 26, heading3Size: 22 },
  arial11: { name: "Arial", size: 22, heading1Size: 30, heading2Size: 26, heading3Size: 22 },
  lucida10: { name: "Lucida Sans Unicode", size: 20, heading1Size: 28, heading2Size: 24, heading3Size: 20 }
};

// 1. Exportador a Word (.docx)
export async function downloadDOCX(data, type, filename, reportFormat) {
  let docChildren = [];
  
  const format = reportFormat || {
    paperSize: 'carta',
    font: 'times12',
    margin: '2.54',
    spacing: '2.0',
    alignment: 'left',
    indent: '1.27'
  };

  const fontInfo = docxFontMapping[format.font] || docxFontMapping.times12;
  const isAPA = format.margin === '2.54';
  const marginSize = isAPA ? 1440 : 1134; // 1 inch (1440 dxa) vs 2 cm (1134 dxa)
  const lineSpacing = format.spacing === '2.0' ? 480 : (format.spacing === '1.5' ? 360 : 276); // double (480), 1.5 (360), single/1.15 (276)
  const docAlignment = format.alignment === 'left' ? AlignmentType.LEFT : AlignmentType.JUSTIFY;
  const firstLineIndent = format.indent === '1.27' ? 720 : 0; // 1.27 cm = 720 dxa

  // Helpers for formatting
  const createHeading1 = (text) => new Paragraph({
    children: [new TextRun({ text, font: fontInfo.name, size: fontInfo.heading1Size, bold: true })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    indent: { firstLine: 0 }
  });

  const createHeading2 = (text) => new Paragraph({
    children: [new TextRun({ text, font: fontInfo.name, size: fontInfo.heading2Size, bold: true })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    indent: { firstLine: 0 }
  });

  const createHeading3 = (text) => new Paragraph({
    children: [new TextRun({ text, font: fontInfo.name, size: fontInfo.heading3Size, bold: true })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    indent: { firstLine: 0 }
  });

  const createPara = (text) => new Paragraph({
    children: [new TextRun({ text, font: fontInfo.name, size: fontInfo.size })],
    alignment: docAlignment,
    spacing: { line: lineSpacing, lineRule: "auto", before: 0, after: 0 },
    indent: { firstLine: firstLineIndent }
  });

  const createListItem = (text) => new Paragraph({
    children: [new TextRun({ text, font: fontInfo.name, size: fontInfo.size })],
    spacing: { line: lineSpacing, lineRule: "auto", before: 0, after: 120 },
    indent: { firstLine: 0 }
  });

  const createReference = (text) => new Paragraph({
    children: [new TextRun({ text, font: fontInfo.name, size: fontInfo.size })],
    alignment: docAlignment,
    spacing: { line: lineSpacing, lineRule: "auto", before: 0, after: 120 },
    indent: { hanging: 720 }
  });

  if (type === 'report' || type === 'docx' || type === 'pdf') {
    docChildren = [
      // Portada (Estudio de Caso)
      new Paragraph({ 
        children: [new TextRun({ text: "ESTUDIO DE CASO", bold: true, size: 36, font: fontInfo.name })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
        indent: { firstLine: 0 }
      }),
      new Paragraph({ text: "", spacing: { before: 800 } }),
      new Paragraph({ 
        children: [new TextRun({ text: data.title.toUpperCase(), bold: true, size: 28, font: fontInfo.name })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 240 },
        indent: { firstLine: 0 }
      }),
      new Paragraph({ text: "", spacing: { before: 800 } }),
      new Paragraph({ children: [new TextRun({ text: `Estudiante: ${data.authors}`, font: fontInfo.name, size: fontInfo.size })], alignment: AlignmentType.CENTER, indent: { firstLine: 0 } }),
      new Paragraph({ children: [new TextRun({ text: `Curso: ${data.course}`, font: fontInfo.name, size: fontInfo.size })], alignment: AlignmentType.CENTER, indent: { firstLine: 0 } }),
      new Paragraph({ children: [new TextRun({ text: `TUTOR: ${data.advisor}`, font: fontInfo.name, size: fontInfo.size })], alignment: AlignmentType.CENTER, indent: { firstLine: 0 } }),
      new Paragraph({ text: "", spacing: { before: 800 } }),
      new Paragraph({ children: [new TextRun({ text: data.date, font: fontInfo.name, size: fontInfo.size })], alignment: AlignmentType.CENTER, indent: { firstLine: 0 } }),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      
      // Primera Parte
      createHeading1("Primera Parte: Antecedentes"),
      createHeading2("Introducción"),
      createPara(data.primeraParte.introduccion),
      
      createHeading2("Antecedente"),
      createPara(data.primeraParte.antecedente),
      
      createHeading2("Definición del Problema"),
      createPara(data.primeraParte.definicionProblema),
      
      createHeading2("Justificación del Estudio"),
      createPara(data.primeraParte.justificacion),
      
      createHeading2("Objetivos del Estudio de Caso"),
      createHeading3("Objetivo General"),
      createPara(data.primeraParte.objetivos.general),
      createHeading3("Objetivos Específicos"),
      ...data.primeraParte.objetivos.especificos.map(obj => createListItem(`• ${obj}`)),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      
      // Segunda Parte
      createHeading1("Segunda Parte: Desarrollo"),
      createHeading2("Marco Conceptual"),
      createPara(data.segundaParte.marcoConceptual),
      
      createHeading2("Marco Metodológico"),
      createPara(data.segundaParte.marcoMetodologico),
      
      createHeading2("Resultados Obtenidos"),
      createPara(data.segundaParte.resultadosObtenidos),
      
      createHeading2("Análisis de Resultados"),
      createPara(data.segundaParte.analisisResultados),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      
      // Tercera Parte
      createHeading1("Tercera Parte: Conclusiones y Recomendaciones"),
      createHeading2("Conclusiones"),
      ...data.terceraParte.conclusiones.map((c, i) => createPara(`${i + 1}. ${c}`)),
      
      createHeading2("Recomendaciones"),
      ...data.terceraParte.recomendaciones.map((r, i) => createPara(`${i + 1}. ${r}`)),
      
      new Paragraph({ text: "", pageBreakBefore: true }),
      
      // Cuarta Parte
      createHeading1("Cuarta Parte"),
      createHeading2("Referencias"),
      ...data.cuartaParte.referencias.map(ref => createReference(ref)),
      
      createHeading2("Anexos"),
      createPara(data.cuartaParte.anexos)
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
      properties: {
        page: {
          size: {
            width: (type === 'report' && format.paperSize === 'carta') ? 12240 : 11906, // Letter vs A4
            height: (type === 'report' && format.paperSize === 'carta') ? 15840 : 16838
          },
          margin: {
            top: (type === 'report') ? marginSize : 1134, // 2.54 cm = 1440, Standard = 1134
            bottom: (type === 'report') ? marginSize : 1134,
            left: (type === 'report') ? marginSize : 1134,
            right: (type === 'report') ? marginSize : 1134,
          }
        },
        headers: (type === 'report') ? {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 },
                indent: { firstLine: 0 },
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: fontInfo.name,
                    size: 20 // 10pt
                  })
                ]
              })
            ]
          })
        } : undefined
      },
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
export function downloadPDF(data, type, filename, reportFormat) {
  const format = reportFormat || {
    paperSize: 'carta',
    font: 'times12',
    margin: '2.54',
    spacing: '2.0',
    alignment: 'left',
    indent: '1.27'
  };

  const isCarta = format.paperSize === 'carta';
  const pageWidth = isCarta ? 215.9 : 210.0;
  const pageHeight = isCarta ? 279.4 : 297.0;
  const margin = format.margin === '2.54' ? 25.4 : 20.0; // 2.54cm vs 2.00cm
  const contentWidth = pageWidth - (2 * margin);

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: isCarta ? [215.9, 279.4] : 'a4'
  });

  const fontMapping = {
    times12: { name: "times", size: 12 },
    georgia11: { name: "times", size: 11 },
    computer10: { name: "times", size: 10 },
    calibri11: { name: "helvetica", size: 11 },
    arial11: { name: "helvetica", size: 11 },
    lucida10: { name: "helvetica", size: 10 }
  };
  const fontInfo = fontMapping[format.font] || fontMapping.times12;
  const pdfFont = fontInfo.name;
  const fontSize = fontInfo.size;
  const spacingMultiplier = Number(format.spacing) || 2.0;
  const lineHeightMm = fontSize * 0.353 * spacingMultiplier;
  const paragraphSpacing = 0; 
  const isJustify = format.alignment === 'justify';
  const firstLineIndent = format.indent === '1.27' ? 12.7 : 0; // 1.27 cm = 12.7 mm

  // Header/Footer page numbering helper (Externo superior derecho, en números arábigos)
  const addHeaderFooter = () => {
    const pageCount = doc.internal.getNumberOfPages();
    if (pageCount === 1) return;

    doc.setFont(pdfFont, "normal");
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(String(pageCount), pageWidth - margin, 12.7, { align: "right" });
  };

  // Helper to write styled paragraph with overflow checking
  const writeParagraph = (text, startY, isReference = false) => {
    doc.setFont(pdfFont, "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(50, 50, 50);

    const xPos = margin;
    const currentLines = doc.splitTextToSize(text, contentWidth);
    const paraHeight = currentLines.length * lineHeightMm;

    if (startY + paraHeight > pageHeight - margin) {
      doc.addPage();
      addHeaderFooter();
      startY = margin + 10;
    }

    if (isReference) {
      if (currentLines.length > 0) {
        doc.text(currentLines[0], xPos, startY, { align: isJustify ? "justify" : "left", maxWidth: contentWidth });
        if (currentLines.length > 1) {
          const remainingText = currentLines.slice(1).join(" ");
          const subLines = doc.splitTextToSize(remainingText, contentWidth - 12.7);
          subLines.forEach((line, idx) => {
            doc.text(line, xPos + 12.7, startY + lineHeightMm + (idx * lineHeightMm), { align: isJustify ? "justify" : "left", maxWidth: contentWidth - 12.7 });
          });
          return startY + lineHeightMm + (subLines.length * lineHeightMm) + paragraphSpacing;
        }
      }
    } else {
      if (firstLineIndent > 0 && currentLines.length > 0) {
        doc.text(currentLines[0], xPos + firstLineIndent, startY, { align: isJustify ? "justify" : "left", maxWidth: contentWidth - firstLineIndent });
        if (currentLines.length > 1) {
          const remainingText = currentLines.slice(1).join(" ");
          const subLines = doc.splitTextToSize(remainingText, contentWidth);
          subLines.forEach((line, idx) => {
            doc.text(line, xPos, startY + lineHeightMm + (idx * lineHeightMm), { align: isJustify ? "justify" : "left", maxWidth: contentWidth });
          });
          return startY + lineHeightMm + (subLines.length * lineHeightMm) + paragraphSpacing;
        }
      } else {
        doc.text(currentLines, xPos, startY, { align: isJustify ? "justify" : "left", maxWidth: contentWidth });
      }
    }

    return startY + paraHeight + paragraphSpacing;
  };

  const writeHeading1 = (text, startY) => {
    doc.setFont(pdfFont, "bold");
    doc.setFontSize(fontSize + 3);
    doc.setTextColor(170, 59, 255); // Purple
    if (startY + 15 > pageHeight - margin) {
      doc.addPage();
      addHeaderFooter();
      startY = margin + 10;
    }
    doc.text(text, margin, startY);
    return startY + 8;
  };

  const writeHeading2 = (text, startY) => {
    doc.setFont(pdfFont, "bold");
    doc.setFontSize(fontSize + 1);
    doc.setTextColor(8, 6, 13);
    if (startY + 15 > pageHeight - margin) {
      doc.addPage();
      addHeaderFooter();
      startY = margin + 10;
    }
    doc.text(text, margin, startY);
    return startY + 8;
  };

  const writeHeading3 = (text, startY) => {
    doc.setFont(pdfFont, "bold");
    doc.setFontSize(fontSize);
    doc.setTextColor(8, 6, 13);
    if (startY + 12 > pageHeight - margin) {
      doc.addPage();
      addHeaderFooter();
      startY = margin + 10;
    }
    doc.text(text, margin, startY);
    return startY + 6;
  };

  if (type === 'report' || type === 'docx' || type === 'pdf') {
    // Portada
    doc.setFillColor(170, 59, 255);
    doc.rect(0, 0, 8, pageHeight, "F");

    doc.setFont(pdfFont, "bold");
    doc.setFontSize(22);
    doc.setTextColor(8, 6, 13);
    doc.text("ESTUDIO DE CASO", 25, 60);

    const titleLines = doc.splitTextToSize(data.title.toUpperCase(), pageWidth - 45);
    doc.text(titleLines, 25, 100);

    doc.setFontSize(11);
    doc.text("ESTUDIANTE:", 25, 160);
    doc.setFont(pdfFont, "normal");
    doc.text(data.authors, 25, 166);

    doc.setFont(pdfFont, "bold");
    doc.text("CURSO:", 25, 185);
    doc.setFont(pdfFont, "normal");
    doc.text(data.course, 25, 191);

    doc.setFont(pdfFont, "bold");
    doc.text("TUTOR:", 25, 210);
    doc.setFont(pdfFont, "normal");
    doc.text(data.advisor, 25, 216);

    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(data.date, 25, 260);

    // Primera Parte: Antecedentes
    doc.addPage();
    addHeaderFooter();
    let y = margin + 10;
    
    y = writeHeading1("Primera Parte: Antecedentes", y);
    y = writeHeading2("Introducción", y);
    y = writeParagraph(data.primeraParte.introduccion, y);
    
    y = writeHeading2("Antecedente", y);
    y = writeParagraph(data.primeraParte.antecedente, y);
    
    y = writeHeading2("Definición del Problema", y);
    y = writeParagraph(data.primeraParte.definicionProblema, y);
    
    y = writeHeading2("Justificación del Estudio", y);
    y = writeParagraph(data.primeraParte.justificacion, y);

    y = writeHeading2("Objetivos del Estudio de Caso", y);
    y = writeHeading3("Objetivo General", y);
    y = writeParagraph(data.primeraParte.objetivos.general, y);
    
    y = writeHeading3("Objetivos Específicos", y);
    data.primeraParte.objetivos.especificos.forEach(obj => {
      y = writeParagraph(`• ${obj}`, y);
    });

    // Segunda Parte: Desarrollo
    doc.addPage();
    addHeaderFooter();
    y = margin + 10;
    
    y = writeHeading1("Segunda Parte: Desarrollo", y);
    y = writeHeading2("Marco Conceptual", y);
    y = writeParagraph(data.segundaParte.marcoConceptual, y);
    
    y = writeHeading2("Marco Metodológico", y);
    y = writeParagraph(data.segundaParte.marcoMetodologico, y);
    
    y = writeHeading2("Resultados Obtenidos", y);
    y = writeParagraph(data.segundaParte.resultadosObtenidos, y);
    
    y = writeHeading2("Análisis de Resultados", y);
    y = writeParagraph(data.segundaParte.analisisResultados, y);

    // Tercera Parte: Conclusiones y Recomendaciones
    doc.addPage();
    addHeaderFooter();
    y = margin + 10;
    
    y = writeHeading1("Tercera Parte: Conclusiones y Recomendaciones", y);
    y = writeHeading2("Conclusiones", y);
    data.terceraParte.conclusiones.forEach((c, idx) => {
      y = writeParagraph(`${idx + 1}. ${c}`, y);
    });

    y = writeHeading2("Recomendaciones", y);
    data.terceraParte.recomendaciones.forEach((r, idx) => {
      y = writeParagraph(`${idx + 1}. ${r}`, y);
    });

    // Cuarta Parte
    doc.addPage();
    addHeaderFooter();
    y = margin + 10;
    
    y = writeHeading1("Cuarta Parte", y);
    y = writeHeading2("Referencias", y);
    data.cuartaParte.referencias.forEach(ref => {
      y = writeParagraph(ref, y, true);
    });
    
    y = writeHeading2("Anexos", y);
    y = writeParagraph(data.cuartaParte.anexos, y);

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
export const PPTX_PALETTES = {
  galactic: {
    name: 'Violeta Galáctico',
    primary: '#AA3BFF',
    background: '#15111E',
    cardBg: '#20192B',
    title: '#DDBBFF',
    text: '#E5E3EB',
    muted: '#A5A0B2',
    isLight: false
  },
  ocean: {
    name: 'Océano Profundo',
    primary: '#00D2FF',
    background: '#0B132B',
    cardBg: '#1C2541',
    title: '#BCEEFF',
    text: '#E2E8F0',
    muted: '#94A3B8',
    isLight: false
  },
  emerald: {
    name: 'Bosque Esmeralda',
    primary: '#10B981',
    background: '#061F1A',
    cardBg: '#0B3C32',
    title: '#D1FAE5',
    text: '#F0FDF4',
    muted: '#A7F3D0',
    isLight: false
  },
  sunset: {
    name: 'Cálido Atardecer',
    primary: '#F59E0B',
    background: '#1E1510',
    cardBg: '#2F221B',
    title: '#FEF3C7',
    text: '#FFFBEB',
    muted: '#FDE68A',
    isLight: false
  },
  lightMinimal: {
    name: 'Mínimo Claro',
    primary: '#4F46E5',
    background: '#F9FAFB',
    cardBg: '#FFFFFF',
    title: '#111827',
    text: '#374151',
    muted: '#6B7280',
    isLight: true
  },
  monochrome: {
    name: 'Monocromo Oscuro',
    primary: '#9CA3AF',
    background: '#111827',
    cardBg: '#1F2937',
    title: '#F9FAFB',
    text: '#E5E7EB',
    muted: '#9CA3AF',
    isLight: false
  }
};

const cleanHex = (color) => {
  if (!color) return 'FFFFFF';
  return color.replace('#', '');
};

export function downloadPPTX(data, filename, paletteColors) {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';

  const palette = paletteColors || PPTX_PALETTES.galactic;

  const bgCol = cleanHex(palette.background);
  const cardCol = cleanHex(palette.cardBg);
  const primaryCol = cleanHex(palette.primary);
  const titleCol = cleanHex(palette.title);
  const textCol = cleanHex(palette.text);
  const mutedCol = cleanHex(palette.muted);
  const borderCol = primaryCol; // Usamos el acento primario para el borde de tarjetas

  const bgDark = { color: bgCol };
  const textTitle = { x: 0.8, y: 1.4, w: 11.7, h: 2.2, fontSize: 34, bold: true, color: titleCol, fontFace: 'Trebuchet MS', shrinkText: true };
  const textSubtitle = { x: 0.8, y: 3.8, w: 11.7, h: 2.0, fontSize: 16, color: mutedCol, fontFace: 'Arial', shrinkText: true };
  const textFooter = { x: 0.8, y: 6.3, w: 11.7, h: 0.4, fontSize: 9.5, color: mutedCol, fontFace: 'Arial', shrinkText: true };

  // Portada
  let s1 = pptx.addSlide();
  s1.background = bgDark;
  
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: primaryCol } });
  s1.addText(data.title.toUpperCase(), textTitle);
  s1.addText(`INTEGRANTES:\n${data.members}\n\nINSTITUCIÓN:\n${data.institution}\n\nFECHA:\n${data.date}`, textSubtitle);
  s1.addText("DocuGenius Neural AI Presentation System", textFooter);

  // Slides restantes
  data.slides.forEach((slideData, idx) => {
    if (idx === 0) return;
    
    let s = pptx.addSlide();
    
    // Configurar fondo de pantalla de la diapositiva
    if (slideData.image && slideData.imagePosition === 'background') {
      if (slideData.image.startsWith('data:')) {
        s.background = { data: slideData.image };
      } else {
        s.background = { path: slideData.image };
      }
    } else {
      s.background = bgDark;
    }
    
    // Encabezado
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.95, fill: { color: cardCol } });
    s.addText(slideData.title, { x: 0.8, y: 0.2, w: 11.5, h: 0.6, fontSize: 22, bold: true, color: titleCol, fontFace: 'Trebuchet MS', shrinkText: true });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.9, w: 13.3, h: 0.05, fill: { color: primaryCol } });
    
    const parsed = parseSlideText(slideData.content);
    const hasImage = slideData.image && slideData.imagePosition !== 'background';
    const imgPos = slideData.imagePosition || 'right';

    // 1. Agregar Imagen si está configurada en posición lateral
    if (hasImage) {
      const imgOptions = {};
      if (slideData.image.startsWith('data:')) {
        imgOptions.data = slideData.image;
      } else {
        imgOptions.path = slideData.image;
      }

      if (imgPos === 'left') {
        imgOptions.x = 0.8;
        imgOptions.y = 1.6;
        imgOptions.w = 5.6;
        imgOptions.h = 4.4;
      } else {
        // right (predeterminado)
        imgOptions.x = 6.8;
        imgOptions.y = 1.6;
        imgOptions.w = 5.6;
        imgOptions.h = 4.4;
      }
      imgOptions.sizing = { type: 'contain', w: 5.6, h: 4.4 };
      s.addImage(imgOptions);
    }

    // Definición de coordenadas para el texto según la presencia de imagen
    let textX = 0.8;
    let textW = 11.7;
    let textInnerX = 1.1;
    let textInnerW = 11.1;

    if (hasImage) {
      if (imgPos === 'left') {
        textX = 6.8;
        textW = 5.6;
        textInnerX = 7.1;
        textInnerW = 5.0;
      } else {
        textX = 0.8;
        textW = 5.6;
        textInnerX = 1.1;
        textInnerW = 5.0;
      }
    }

    if (parsed.type === 'table') {
      const lines = parsed.raw.split("\n").filter(l => l.trim().length > 0 && !l.includes("---"));
      if (lines.length > 1) {
        const headers = lines[0].split("|").map(h => h.trim());
        const rows = lines.slice(1).map(r => r.split("|").map(c => c.trim()));
        
        const tableData = [
          headers.map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: primaryCol }, align: 'center', shrinkText: true } })),
          ...rows.map(row => row.map(c => ({ text: c, options: { color: textCol, fill: { color: cardCol }, shrinkText: true } })))
        ];
        
        const colW = hasImage
          ? (headers.length === 2 ? [2.8, 2.8] : [1.8, 1.9, 1.9])
          : (headers.length === 2 ? [5.8, 5.9] : [3.5, 4.1, 4.1]);

        s.addTable(tableData, { 
          x: textX, 
          y: 1.6, 
          w: textW, 
          colWidths: colW, 
          border: { type: 'solid', color: borderCol, size: 1 } 
        });
      }
    } else if (parsed.type === 'blocks') {
      const blocks = parsed.data;

      if (hasImage) {
        // Diseño adaptativo con Imagen:
        // Si hay 2 bloques de texto, los apilamos verticalmente en el lado opuesto a la imagen
        if (blocks.length === 2) {
          blocks.forEach((block, bIdx) => {
            const cardY = 1.6 + bIdx * 2.3;
            const cardH = 2.1;
            const textY = cardY + 0.2;
            const textH = cardH - 0.4;

            s.addShape(pptx.ShapeType.rect, { x: textX, y: cardY, w: textW, h: cardH, fill: { color: cardCol }, line: { color: borderCol, width: 1 } });
            
            const bLength = block.bullets.reduce((sum, b) => sum + b.length, 0) + (block.title?.length || 0);
            const bCount = block.bullets.length;
            let titleSize = 15;
            let fontSize = 11.5;
            let lineSpacing = 16;
            if (bLength > 200 || bCount > 4) {
              titleSize = 13;
              fontSize = 9.5;
              lineSpacing = 12;
            }

            const textPara = [];
            if (block.title) {
              textPara.push({ text: block.title + "\n\n", options: { bold: true, color: titleCol, fontSize: titleSize, fontFace: 'Trebuchet MS' } });
            }
            block.bullets.forEach((bullet, bBulletIdx) => {
              const isLast = bBulletIdx === block.bullets.length - 1;
              const isBullet = bullet.length > 2;
              textPara.push({ 
                text: bullet + (isLast ? "" : "\n"), 
                options: { color: textCol, fontSize: fontSize, fontFace: 'Arial', bullet: isBullet, lineSpacing: lineSpacing } 
              });
            });
            s.addText(textPara, { x: textInnerX, y: textY, w: textInnerW, h: textH, valign: 'top', shrinkText: true });
          });
        } else {
          // Un solo bloque de texto
          const mainBlock = blocks[0] || { title: "", bullets: [] };
          s.addShape(pptx.ShapeType.rect, { x: textX, y: 1.6, w: textW, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 } });

          const mainLength = mainBlock.bullets.reduce((sum, b) => sum + b.length, 0) + (mainBlock.title?.length || 0);
          const mainCount = mainBlock.bullets.length;
          let titleSize = 18;
          let fontSize = 13;
          let lineSpacing = 20;

          if (mainLength > 300 || mainCount > 5) {
            titleSize = 15;
            fontSize = 10.5;
            lineSpacing = 13;
          } else if (mainLength > 150 || mainCount > 3) {
            titleSize = 16.5;
            fontSize = 11.5;
            lineSpacing = 16;
          }

          const textPara = [];
          if (mainBlock.title) {
            textPara.push({ text: mainBlock.title + "\n\n", options: { bold: true, color: titleCol, fontSize: titleSize, fontFace: 'Trebuchet MS' } });
          }
          mainBlock.bullets.forEach((bullet, bIdx) => {
            const isLast = bIdx === mainBlock.bullets.length - 1;
            const useBullet = bullet.length > 2 && !bullet.includes("Contacto:");
            textPara.push({ 
              text: bullet + (isLast ? "" : "\n"), 
              options: { color: textCol, fontSize: fontSize, fontFace: 'Arial', bullet: useBullet, lineSpacing: lineSpacing } 
            });
          });

          s.addText(textPara, { x: textInnerX, y: 1.8, w: textInnerW, h: 4.0, valign: 'top', shrinkText: true });
        }
      } else {
        // Sin imagen: comportamiento estándar de 1 o 2 columnas de tarjetas
        if (blocks.length === 2) {
          // Diseño de 2 Columnas (Left & Right Cards)
          const leftBlock = blocks[0];
          const rightBlock = blocks[1];

          // Tarjeta Izquierda
          s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.6, w: 5.6, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 } });
          
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
            leftTextPara.push({ text: leftBlock.title + "\n\n", options: { bold: true, color: titleCol, fontSize: leftTitleSize, fontFace: 'Trebuchet MS' } });
          }
          leftBlock.bullets.forEach((bullet, bIdx) => {
            const isLast = bIdx === leftBlock.bullets.length - 1;
            const isBullet = bullet.length > 2;
            leftTextPara.push({ 
              text: bullet + (isLast ? "" : "\n"), 
              options: { color: textCol, fontSize: leftFontSize, fontFace: 'Arial', bullet: isBullet, lineSpacing: leftLineSpacing } 
            });
          });
          s.addText(leftTextPara, { x: 1.1, y: 1.8, w: 5.0, h: 4.0, valign: 'top', shrinkText: true });

          // Tarjeta Derecha
          s.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 5.6, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 } });
          
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
            rightTextPara.push({ text: rightBlock.title + "\n\n", options: { bold: true, color: titleCol, fontSize: rightTitleSize, fontFace: 'Trebuchet MS' } });
          }
          rightBlock.bullets.forEach((bullet, bIdx) => {
            const isLast = bIdx === rightBlock.bullets.length - 1;
            const isBullet = bullet.length > 2;
            rightTextPara.push({ 
              text: bullet + (isLast ? "" : "\n"), 
              options: { color: textCol, fontSize: rightFontSize, fontFace: 'Arial', bullet: isBullet, lineSpacing: rightLineSpacing } 
            });
          });
          s.addText(rightTextPara, { x: 7.1, y: 1.8, w: 5.0, h: 4.0, valign: 'top', shrinkText: true });

        } else {
          // Diseño de Tarjeta Única Centrada
          s.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.6, w: 11.7, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 } });

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
            textPara.push({ text: mainBlock.title + "\n\n", options: { bold: true, color: titleCol, fontSize: mainTitleSize, fontFace: 'Trebuchet MS' } });
          }

          mainBlock.bullets.forEach((bullet, bIdx) => {
            const isLast = bIdx === mainBlock.bullets.length - 1;
            const useBullet = bullet.length > 2 && !bullet.includes("Contacto:");
            textPara.push({ 
              text: bullet + (isLast ? "" : "\n"), 
              options: { color: textCol, fontSize: mainFontSize, fontFace: 'Arial', bullet: useBullet, lineSpacing: mainLineSpacing } 
            });
          });

          s.addText(textPara, { x: 1.1, y: 1.8, w: 11.1, h: 4.0, valign: 'top', shrinkText: true });
        }
      }
    }
    
    s.addText(`Slide ${slideData.num} / ${data.slides.length}`, textFooter);
  });

  pptx.writeFile({ fileName: filename || `${data.title.replace(/\s+/g, '_')}.pptx` });
}
