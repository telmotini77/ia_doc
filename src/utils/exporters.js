/**
 * Módulo de Exportación de Archivos.
 * Contiene los exportadores a DOCX, PDF, XLSX y PPTX.
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  HeadingLevel, 
  AlignmentType, 
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

// Ajusta el ancho de las columnas de una hoja de cálculo según el contenido
function autofitColumns(ws, rows) {
  if (!rows || rows.length === 0) return;
  const colWidths = [];
  rows.forEach(row => {
    if (!row) return;
    row.forEach((cell, colIdx) => {
      let cellText = "";
      if (cell !== null && cell !== undefined) {
        if (typeof cell === 'object') {
          if (cell.v !== undefined) {
            cellText = cell.v.toString();
          } else if (cell.f) {
            cellText = "123,456.78"; // valor estimado para fórmulas
          }
        } else {
          cellText = cell.toString();
        }
      }
      const len = cellText.length;
      if (!colWidths[colIdx] || len > colWidths[colIdx]) {
        colWidths[colIdx] = len;
      }
    });
  });
  ws["!cols"] = colWidths.map(w => ({ wch: Math.max(w + 3, 10) }));
}

// Obtiene el contenido de una pestaña como Array of Arrays (con soporte de fórmulas y formatos de celda)
function getSheetAOAData(data, sheetKey, selectedCharts = ['pie', 'bar', 'line']) {
  const sheet = data[sheetKey];
  if (!sheet) return [];

  if (sheetKey === 'hoja1') {
    const integrantes = Array.isArray(sheet.integrantes) ? sheet.integrantes.join(", ") : sheet.integrantes || "";
    const portadaData = [
      ["PROYECTO:", sheet.proyecto],
      ["INSTITUCIÓN:", sheet.institucion],
      ["INTEGRANTES:", integrantes],
      ["FECHA:", sheet.fecha],
      ["GENERADOR:", "DocuGenius Neural AI Engine"]
    ];
    return [
      [sheet.titulo.toUpperCase()],
      [],
      ...portadaData
    ];
  }

  const titleLower = (sheet.titulo || "").toLowerCase();

  // Si es la hoja de Presupuesto clásica
  if (sheetKey === 'hoja3' && titleLower.includes("presupuesto")) {
    const budgetRows = sheet.rows.map((row, idx) => {
      const rowNum = idx + 4;
      const qty = Number(row[1]) || 0;
      const price = Number(row[2]) || 0;
      return [
        row[0],
        { t: 'n', v: qty, z: '0' },
        { t: 'n', v: price, z: '"$"#,##0.00' },
        { t: 'n', f: `B${rowNum}*C${rowNum}`, z: '"$"#,##0.00' }
      ];
    });

    const totalRowNum = sheet.rows.length + 4;
    const formulas = sheet.formulas || { label: "Total General", value: 0 };
    return [
      [sheet.titulo.toUpperCase()],
      [],
      sheet.headers,
      ...budgetRows,
      [formulas.label, "", "", { t: 'n', f: `SUM(D4:D${totalRowNum - 1})`, z: '"$"#,##0.00' }]
    ];
  }

  // Si es la hoja de Estadísticas clásica
  if (sheetKey === 'hoja5' && titleLower.includes("estadística")) {
    const statsRows = sheet.rows.map(row => {
      return row.map((cell, colIdx) => {
        if (colIdx > 0) {
          const strVal = String(cell).trim();
          if (strVal.endsWith('%')) {
            const num = parseFloat(strVal) / 100;
            return { t: 'n', v: num, z: '0.0%' };
          }
          const numVal = parseFloat(strVal);
          if (!isNaN(numVal)) {
            if (colIdx === 3) {
              return { t: 'n', v: numVal / 100, z: '0.0%' };
            }
            return { t: 'n', v: numVal, z: '0.0' };
          }
        }
        return cell;
      });
    });

    return [
      [sheet.titulo.toUpperCase()],
      [],
      sheet.headers,
      ...statsRows
    ];
  }

  // Si es la hoja de instrucciones de Gráficos clásica
  if (sheetKey === 'hoja6' && titleLower.includes("gráfico") && sheet.rows && sheet.rows[0] && sheet.rows[0].length === 3) {
    const chartTypesMapping = {
      'pie': "Diagrama de Pastel (Torta)",
      'bar': "Gráfico de Barras (Comparativo)",
      'line': "Gráfico de Líneas (Tendencias)"
    };

    const chartRows = sheet.rows.map(row => {
      return [
        row[0],
        { t: 'n', v: Number(row[1]) || 0, z: '0' },
        { t: 'n', v: Number(row[2]) || 0, z: '0' }
      ];
    });

    const tableStartRow = 3 + 2 + (selectedCharts.length * 2) + 2; 
    const rangeLabels = `A${tableStartRow}:A${tableStartRow + sheet.rows.length}`;
    const rangeReal = `C${tableStartRow}:C${tableStartRow + sheet.rows.length}`;
    const rangeAll = `A${tableStartRow - 1}:C${tableStartRow + sheet.rows.length - 1}`;

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

    return [
      [sheet.titulo.toUpperCase()],
      [],
      ...chartInstructions,
      sheet.headers,
      ...chartRows
    ];
  }

  // De lo contrario, renderizar la pestaña de forma genérica
  const formattedRows = sheet.rows.map(row => {
    return row.map((cell, colIdx) => {
      if (cell === null || cell === undefined) return "";
      
      const header = (sheet.headers[colIdx] || "").toLowerCase();
      const isPercentageHeader = header.includes('%');
      const isCurrencyHeader = header.includes('$') || header.includes('costo') || header.includes('total');
      
      const numVal = parseFloat(cell);
      if (typeof cell === 'number' || (!isNaN(numVal) && isFinite(cell))) {
        const val = typeof cell === 'number' ? cell : numVal;
        if (isPercentageHeader) {
          return { t: 'n', v: val, z: '0.0"%"' };
        } else if (isCurrencyHeader) {
          return { t: 'n', v: val, z: '"$"#,##0.00' };
        } else {
          return { t: 'n', v: val, z: '0' };
        }
      }
      return cell;
    });
  });

  return [
    [sheet.titulo.toUpperCase()],
    [],
    sheet.headers,
    ...formattedRows
  ];
}

// 3. Exportador a Hojas de Cálculo (Soporta .xlsx, .xls y .csv)
export function downloadXLSX(data, filename, selectedCharts = ['pie', 'bar', 'line'], format = 'xlsx', activeSheetKey = 'hoja1') {
  if (format === 'csv') {
    // Generar CSV para la pestaña activa
    const sheetData = getSheetAOAData(data, activeSheetKey, selectedCharts);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    autofitColumns(ws, sheetData);
    
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    // Incluir UTF-8 BOM para soporte correcto de tildes y caracteres especiales en Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    const cleanSheetTitle = data[activeSheetKey].titulo.replace(/\s+/g, '_');
    a.download = filename || `${data.title.replace(/\s+/g, '_')}_${cleanSheetTitle}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const wb = XLSX.utils.book_new();

  // Determinar si es la plantilla de presupuesto original para agrupar resultados y estadísticas
  const isOriginalTemplate = data.hoja4 && data.hoja4.titulo === "Resultados" && data.hoja5 && data.hoja5.titulo === "Estadísticas";

  if (isOriginalTemplate) {
    // Portada
    const ws1Data = getSheetAOAData(data, 'hoja1', selectedCharts);
    const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
    autofitColumns(ws1, ws1Data);
    XLSX.utils.book_append_sheet(wb, ws1, data.hoja1.titulo);

    // Cronograma
    const ws2Data = getSheetAOAData(data, 'hoja2', selectedCharts);
    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
    autofitColumns(ws2, ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, data.hoja2.titulo);

    // Presupuesto
    const ws3Data = getSheetAOAData(data, 'hoja3', selectedCharts);
    const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
    autofitColumns(ws3, ws3Data);
    XLSX.utils.book_append_sheet(wb, ws3, data.hoja3.titulo);

    // Resultados y KPIs (Consolidado hoja4 + hoja5)
    const ws4Data = [
      ...getSheetAOAData(data, 'hoja4', selectedCharts),
      [],
      [],
      ...getSheetAOAData(data, 'hoja5', selectedCharts)
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
    autofitColumns(ws4, ws4Data);
    XLSX.utils.book_append_sheet(wb, ws4, "Resultados y KPIs");

    // Datos Gráficos
    if (data.hoja6) {
      const ws6Data = getSheetAOAData(data, 'hoja6', selectedCharts);
      const ws6 = XLSX.utils.aoa_to_sheet(ws6Data);
      autofitColumns(ws6, ws6Data);
      XLSX.utils.book_append_sheet(wb, ws6, data.hoja6.titulo);
    }

    // Evidencias
    if (data.hoja7) {
      const ws7Data = getSheetAOAData(data, 'hoja7', selectedCharts);
      const ws7 = XLSX.utils.aoa_to_sheet(ws7Data);
      autofitColumns(ws7, ws7Data);
      XLSX.utils.book_append_sheet(wb, ws7, data.hoja7.titulo);
    }
  } else {
    // Generación dinámica de pestañas basada en las hojas reales presentes
    const sheetKeys = Object.keys(data).filter(key => key.startsWith('hoja') && data[key]);
    sheetKeys.forEach(sheetKey => {
      const sheet = data[sheetKey];
      const wsData = getSheetAOAData(data, sheetKey, selectedCharts);
      if (wsData && wsData.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        autofitColumns(ws, wsData);
        XLSX.utils.book_append_sheet(wb, ws, sheet.titulo);
      }
    });
  }

  // Escribir el libro según el formato elegido
  if (format === 'xls') {
    XLSX.writeFile(wb, filename || `${data.title.replace(/\s+/g, '_')}.xls`, { bookType: 'xls' });
  } else {
    XLSX.writeFile(wb, filename || `${data.title.replace(/\s+/g, '_')}.xlsx`, { bookType: 'xlsx' });
  }
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

  // Portada
  let s1 = pptx.addSlide();
  s1.background = bgDark;
  
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: primaryCol } });
  s1.addText(data.title.toUpperCase(), textTitle);
  s1.addText(`INTEGRANTES:\n${data.members}\n\nINSTITUCIÓN:\n${data.institution}\n\nFECHA:\n${data.date}`, textSubtitle);
  
  // Footer portada
  s1.addText("DocuGenius Neural AI Presentation System", { x: 0.8, y: 6.8, w: 6.0, h: 0.4, fontSize: 9.5, color: mutedCol, fontFace: 'Arial' });
  s1.addText("Diapositiva 1 de " + data.slides.length, { x: 6.8, y: 6.8, w: 5.7, h: 0.4, fontSize: 9.5, color: mutedCol, fontFace: 'Arial', align: 'right' });

  // Slides restantes
  data.slides.forEach((slideData, idx) => {
    if (idx === 0) return;
    
    let s = pptx.addSlide();
    
    // 1. Detectar si es una diapositiva separadora de sección (Agenda, Conclusiones, Recomendaciones, etc.)
    const isDividerSlide = ['agenda', 'conclusiones', 'recomendaciones', 'preguntas', 'agradecimientos', 'referencias'].some(term => 
      slideData.title.toLowerCase().includes(term)
    );

    if (isDividerSlide) {
      s.background = { color: primaryCol };
      
      // Detalles estéticos
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.15, fill: { color: cardCol } });
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.35, w: 13.3, h: 0.15, fill: { color: cardCol } });
      
      s.addText(slideData.title, { 
        x: 1.0, 
        y: 1.8, 
        w: 11.3, 
        h: 1.2, 
        fontSize: 38, 
        bold: true, 
        color: 'FFFFFF', 
        fontFace: 'Trebuchet MS', 
        align: 'center', 
        valign: 'middle' 
      });
      
      const parsed = parseSlideText(slideData.content);
      const textPara = [];
      
      if (parsed.type === 'blocks') {
        parsed.data.forEach(block => {
          if (block.title) {
            textPara.push({ text: block.title + "\n\n", options: { bold: true, color: 'FFFFFF', fontSize: 18 } });
          }
          block.bullets.forEach((bullet, bIdx) => {
            const isLast = bIdx === block.bullets.length - 1;
            textPara.push({ 
              text: bullet + (isLast ? "" : "\n"), 
              options: { color: 'FFFFFF', fontSize: 14, fontFace: 'Arial', bullet: bullet.length > 2 } 
            });
          });
        });
      } else {
        textPara.push({ text: slideData.content, options: { color: 'FFFFFF', fontSize: 14, fontFace: 'Arial', align: 'center' } });
      }
      
      s.addText(textPara, { 
        x: 1.5, 
        y: 3.2, 
        w: 10.3, 
        h: 3.2, 
        valign: 'top', 
        align: 'center', 
        shrinkText: true 
      });
      
      s.addText("DocuGenius Neural AI Engine", { x: 0.8, y: 6.8, w: 6.0, h: 0.4, fontSize: 9.5, color: 'FFFFFF', fontFace: 'Arial' });
      s.addText(`Diapositiva ${slideData.num} de ${data.slides.length}`, { x: 6.8, y: 6.8, w: 5.7, h: 0.4, fontSize: 9.5, color: 'FFFFFF', fontFace: 'Arial', align: 'right' });
      return;
    }

    // Configurar fondo de pantalla de la diapositiva normal
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
        
        // Comprobar si la tabla contiene comparaciones numéricas para agregar un gráfico nativo
        let chartData = null;
        const chartLabels = [];
        const series1Data = [];
        const series2Data = [];

        rows.forEach(row => {
          if (row.length >= 3) {
            const label = row[0];
            const val1Str = row[1].replace(/[^0-9.]/g, '');
            const val2Str = row[2].replace(/[^0-9.]/g, '');
            const val1 = parseFloat(val1Str);
            const val2 = parseFloat(val2Str);
            if (!isNaN(val1) && !isNaN(val2)) {
              chartLabels.push(label);
              series1Data.push(val1);
              series2Data.push(val2);
            }
          }
        });

        if (chartLabels.length > 0) {
          const series1Name = headers[1] || "Antes";
          const series2Name = headers[2] || "Después";
          chartData = [
            { name: series1Name, labels: chartLabels, values: series1Data },
            { name: series2Name, labels: chartLabels, values: series2Data }
          ];
        }

        // Si tenemos datos de gráfico y no hay imagen lateral, renderizamos tabla a la izq y gráfico a la der.
        if (chartData && !hasImage) {
          // Tabla en la izquierda
          const tableData = [
            headers.map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: primaryCol }, align: 'center', shrinkText: true } })),
            ...rows.map(row => row.map(c => ({ text: c, options: { color: textCol, fill: { color: cardCol }, shrinkText: true } })))
          ];
          s.addTable(tableData, { 
            x: 0.8, 
            y: 1.6, 
            w: 5.6, 
            colWidths: headers.length === 2 ? [2.8, 2.8] : [1.8, 1.9, 1.9], 
            border: { type: 'solid', color: borderCol, size: 1 } 
          });

          // Gráfico de Columnas nativo en la derecha
          const chartOptions = {
            x: 6.8,
            y: 1.6,
            w: 5.6,
            h: 4.4,
            showLegend: true,
            legendPos: 'b',
            title: "Comparación Estadística",
            titleColor: titleCol,
            titleFontSize: 12,
            chartColors: [primaryCol, '10B981'],
            valAxisLabelColor: textCol,
            catAxisLabelColor: textCol,
            valAxisLineColor: borderCol,
            catAxisLineColor: borderCol
          };
          s.addChart(pptx.ChartType.col, chartData, chartOptions);
        } else {
          // Comportamiento estándar de tabla completa
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

            s.addShape(pptx.ShapeType.roundRect, { x: textX, y: cardY, w: textW, h: cardH, fill: { color: cardCol }, line: { color: borderCol, width: 1 }, rectRadius: 0.04 });
            
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
          s.addShape(pptx.ShapeType.roundRect, { x: textX, y: 1.6, w: textW, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 }, rectRadius: 0.04 });

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

          s.addText(textPara, { x: textInnerX, y: textInnerW, w: textInnerW, h: 4.0, valign: 'top', shrinkText: true });
        }
      } else {
        // Sin imagen: comportamiento estándar de 1 o 2 columnas de tarjetas
        if (blocks.length === 2) {
          // Diseño de 2 Columnas (Left & Right Cards)
          const leftBlock = blocks[0];
          const rightBlock = blocks[1];

          // Tarjeta Izquierda
          s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 5.6, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 }, rectRadius: 0.04 });
          
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
          s.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.6, w: 5.6, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 }, rectRadius: 0.04 });
          
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
          s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.6, w: 11.7, h: 4.4, fill: { color: cardCol }, line: { color: borderCol, width: 1 }, rectRadius: 0.04 });

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
    
    // Page numbering and branding in regular slides
    s.addText("DocuGenius Neural AI Engine", { x: 0.8, y: 6.8, w: 6.0, h: 0.4, fontSize: 9.5, color: mutedCol, fontFace: 'Arial' });
    s.addText(`Diapositiva ${slideData.num} de ${data.slides.length}`, { x: 6.8, y: 6.8, w: 5.7, h: 0.4, fontSize: 9.5, color: mutedCol, fontFace: 'Arial', align: 'right' });
  });

  pptx.writeFile({ fileName: filename || `${data.title.replace(/\s+/g, '_')}.pptx` });
}

// ==========================================================================
// 5. Exportador PPTX para Oficios (IOficioSolicitud / IOficioRespuesta)
//    Estructura basada en los tipos:
//      - IOficioSolicitud: lugarFecha, numeroOficio, destinatario(Persona),
//        asunto, cuerpo{ saludo, antecedentes, peticion }, despedida,
//        remitente(Persona), cc[], anexos[]
//      - IOficioRespuesta: + referenciaOficioSolicitud,
//        cuerpo{ acuseRecibo, resolucion, detallesAdicionales }
// ==========================================================================
export function downloadOficioPPTX(data, filename, paletteColors) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const palette = paletteColors || PPTX_PALETTES.galactic;
  const isResponse = data.type === 'response';

  // ── Color tokens ──────────────────────────────────────────────────────────
  const bgCol     = cleanHex(palette.background);
  const cardCol   = cleanHex(palette.cardBg);
  const primCol   = cleanHex(palette.primary);
  const titleCol  = cleanHex(palette.title);
  const textCol   = cleanHex(palette.text);
  const mutedCol  = cleanHex(palette.muted);
  // Accent para respuesta = verde; para solicitud = primario de la paleta
  const accentCol = isResponse ? '10B981' : primCol;

  const SLIDE_W = 13.3;
  const SLIDE_H = 7.5;
  const MARGIN  = 0.6;
  const BAR_W   = 0.22;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const bg = (s) => { s.background = { color: bgCol }; };

  const addAccentBar = (s) => {
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: BAR_W, h: SLIDE_H,
      fill: { color: accentCol }
    });
  };

  const addFooter = (s, pageLabel) => {
    s.addText('DocuGenius · Oficio Oficial', {
      x: BAR_W + MARGIN, y: SLIDE_H - 0.38, w: 7, h: 0.3,
      fontSize: 8.5, color: mutedCol, fontFace: 'Arial'
    });
    if (pageLabel) {
      s.addText(pageLabel, {
        x: SLIDE_W - 3.5, y: SLIDE_H - 0.38, w: 3.2, h: 0.3,
        fontSize: 8.5, color: mutedCol, fontFace: 'Arial', align: 'right'
      });
    }
  };

  const addSectionHeader = (s, text) => {
    s.addShape(pptx.ShapeType.rect, {
      x: BAR_W + MARGIN, y: 0.18, w: SLIDE_W - BAR_W - MARGIN * 2, h: 0.72,
      fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }
    });
    s.addText(text.toUpperCase(), {
      x: BAR_W + MARGIN + 0.15, y: 0.22, w: SLIDE_W - BAR_W - MARGIN * 2 - 0.3, h: 0.62,
      fontSize: 13, bold: true, color: titleCol, fontFace: 'Trebuchet MS',
      valign: 'middle', shrinkText: true
    });
  };

  const fieldBox = (s, label, value, x, y, w, h, accentBackground = false) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: accentBackground ? accentCol : cardCol },
      line: { color: accentBackground ? accentCol : accentCol, width: 0.5 },
      rectRadius: 0.04
    });
    const labelPart = { text: label + '  ', options: { bold: true, color: accentBackground ? 'FFFFFF' : titleCol, fontSize: 9.5, fontFace: 'Trebuchet MS' } };
    const valuePart = { text: value || '—', options: { color: accentBackground ? 'FFFFFF' : textCol, fontSize: 11, fontFace: 'Arial' } };
    s.addText([labelPart, valuePart], {
      x: x + 0.12, y: y + 0.05, w: w - 0.24, h: h - 0.1,
      valign: 'middle', shrinkText: true
    });
  };

  const textBlock = (s, label, body, x, y, w, h) => {
    // Encabezado de sección
    s.addText(label, {
      x, y, w, h: 0.34,
      fontSize: 10, bold: true, color: accentCol === primCol ? titleCol : `${accentCol}`,
      fontFace: 'Trebuchet MS'
    });
    // Cuerpo de texto
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: y + 0.38, w, h: h - 0.38,
      fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }, rectRadius: 0.04
    });
    s.addText(body || '', {
      x: x + 0.14, y: y + 0.48, w: w - 0.28, h: h - 0.58,
      fontSize: 11, color: textCol, fontFace: 'Arial',
      valign: 'top', wrap: true, shrinkText: true
    });
  };

  // ── Helper: extraer Persona display ──────────────────────────────────────
  const personaLine = (p) => {
    if (!p) return '—';
    const parts = [p.nombre, p.cargo, p.institucion, p.ciudad].filter(Boolean);
    return parts.join('  ·  ');
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 1 — PORTADA DEL OFICIO
  // ══════════════════════════════════════════════════════════════════════════
  const s1 = pptx.addSlide();
  bg(s1);
  addAccentBar(s1);

  // Encabezado institucional
  s1.addShape(pptx.ShapeType.rect, {
    x: BAR_W, y: 0, w: SLIDE_W - BAR_W, h: 1.3,
    fill: { color: cardCol }
  });
  s1.addShape(pptx.ShapeType.rect, {
    x: BAR_W, y: 1.3, w: SLIDE_W - BAR_W, h: 0.04,
    fill: { color: accentCol }
  });
  s1.addText(data.encabezado?.logoText || (isResponse ? 'OFICIO DE RESPUESTA' : 'OFICIO DE SOLICITUD'), {
    x: BAR_W + MARGIN, y: 0.05, w: SLIDE_W - BAR_W - MARGIN * 2, h: 1.2,
    fontSize: 14, bold: true, color: titleCol, fontFace: 'Trebuchet MS',
    valign: 'middle', shrinkText: true
  });

  // Número de oficio + Fecha  (dos cajas lado a lado)
  fieldBox(s1, 'N.º Oficio:', data.encabezado?.oficioNum || data.numeroOficio || '—',
    BAR_W + MARGIN, 1.52, 5.5, 0.62);
  fieldBox(s1, 'Lugar y Fecha:', data.encabezado?.lugarFecha || data.lugarYFecha || '—',
    BAR_W + MARGIN + 5.7, 1.52, SLIDE_W - BAR_W - MARGIN - 5.7 - MARGIN, 0.62);

  // Referencia a oficio previo (solo en respuesta)
  if (isResponse && data.referenciaOficioPrevio) {
    fieldBox(s1, 'En referencia a:', data.referenciaOficioPrevio,
      BAR_W + MARGIN, 2.32, SLIDE_W - BAR_W - MARGIN * 2, 0.55, true);
  }

  // DESTINATARIO
  const destY = isResponse && data.referenciaOficioPrevio ? 3.08 : 2.32;
  s1.addText((isResponse ? 'PARA:' : 'DIRIGIDO A:'), {
    x: BAR_W + MARGIN, y: destY, w: 2, h: 0.3,
    fontSize: 9, bold: true, color: accentCol === primCol ? mutedCol : accentCol, fontFace: 'Trebuchet MS'
  });
  s1.addShape(pptx.ShapeType.roundRect, {
    x: BAR_W + MARGIN, y: destY + 0.3, w: SLIDE_W - BAR_W - MARGIN * 2, h: 1.0,
    fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }, rectRadius: 0.04
  });
  const destData = data.destinatario || {};
  s1.addText([
    { text: (destData.tratamiento ? destData.tratamiento + ' ' : '') + (destData.nombre || '—'), options: { bold: true, color: titleCol, fontSize: 14, fontFace: 'Trebuchet MS' } },
    { text: '\n' + [destData.cargo, destData.institucion, destData.ciudad].filter(Boolean).join('  ·  '), options: { color: mutedCol, fontSize: 11, fontFace: 'Arial' } }
  ], {
    x: BAR_W + MARGIN + 0.15, y: destY + 0.35, w: SLIDE_W - BAR_W - MARGIN * 2 - 0.3, h: 0.9,
    valign: 'middle', shrinkText: true
  });

  // ASUNTO
  const asuntoY = destY + 1.45;
  fieldBox(s1, 'ASUNTO:', data.asunto || '—',
    BAR_W + MARGIN, asuntoY, SLIDE_W - BAR_W - MARGIN * 2, 0.72);

  // TIPO badge
  s1.addShape(pptx.ShapeType.roundRect, {
    x: BAR_W + MARGIN, y: asuntoY + 0.9, w: 3.2, h: 0.44,
    fill: { color: accentCol }, rectRadius: 0.06
  });
  s1.addText(isResponse ? '✅  Oficio de Respuesta' : '📋  Oficio de Solicitud', {
    x: BAR_W + MARGIN + 0.1, y: asuntoY + 0.92, w: 3.0, h: 0.38,
    fontSize: 10, bold: true, color: 'FFFFFF', fontFace: 'Trebuchet MS', valign: 'middle'
  });

  addFooter(s1, null);

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — SALUDO + ANTECEDENTES / CONTEXTO
  // IOficioSolicitud: cuerpo.saludo + cuerpo.antecedentes
  // IOficioRespuesta: cuerpo.acuseRecibo (+ saludo)
  // ══════════════════════════════════════════════════════════════════════════
  const s2 = pptx.addSlide();
  bg(s2);
  addAccentBar(s2);
  addSectionHeader(s2, isResponse ? 'Acuse de Recibo' : 'Antecedentes y Contexto');

  const saludoText = data.saludo || '';
  const antecText  = isResponse
    ? (data.cuerpoRecepcion || data.cuerpo?.acuseRecibo || '')
    : (data.cuerpoContexto || data.cuerpo?.saludo || '');
  const previoText = isResponse
    ? (data.cuerpoAnalisis || data.cuerpo?.detallesAdicionales || '')
    : (data.cuerpoAntecedentes || data.cuerpo?.antecedentes || '');

  textBlock(s2, 'Saludo', saludoText, BAR_W + MARGIN, 1.1, SLIDE_W - BAR_W - MARGIN * 2, 0.98);
  textBlock(s2, isResponse ? 'Recepción' : 'Contexto', antecText, BAR_W + MARGIN, 2.2, SLIDE_W - BAR_W - MARGIN * 2, 1.6);
  textBlock(s2, isResponse ? 'Análisis' : 'Antecedentes', previoText, BAR_W + MARGIN, 3.98, SLIDE_W - BAR_W - MARGIN * 2, 2.0);
  addFooter(s2, 'Página 2');

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 3 — PETICIÓN (solicitud) / RESOLUCIÓN (respuesta)
  // IOficioSolicitud: cuerpo.peticion (list)
  // IOficioRespuesta: cuerpo.resolucion + resolucionAdoptada
  // ══════════════════════════════════════════════════════════════════════════
  const s3 = pptx.addSlide();
  bg(s3);
  addAccentBar(s3);
  addSectionHeader(s3, isResponse ? 'Resolución Adoptada' : 'Peticiones Concretas');

  if (isResponse) {
    // Resolución en bloque destacado
    const resolucion = data.resolucionAdoptada || data.cuerpo?.resolucion || '';
    s3.addShape(pptx.ShapeType.roundRect, {
      x: BAR_W + MARGIN, y: 1.1, w: SLIDE_W - BAR_W - MARGIN * 2, h: 2.4,
      fill: { color: '063F2E' }, line: { color: accentCol, width: 1.5 }, rectRadius: 0.06
    });
    s3.addText([
      { text: '✅  ', options: { fontSize: 16, color: accentCol } },
      { text: resolucion, options: { fontSize: 13, bold: true, color: 'FFFFFF', fontFace: 'Trebuchet MS' } }
    ], {
      x: BAR_W + MARGIN + 0.18, y: 1.18, w: SLIDE_W - BAR_W - MARGIN * 2 - 0.36, h: 2.22,
      valign: 'middle', wrap: true, shrinkText: true
    });

    // Condiciones adicionales
    const condiciones = data.condiciones || [];
    if (condiciones.length > 0) {
      s3.addText('Condiciones y Observaciones:', {
        x: BAR_W + MARGIN, y: 3.7, w: SLIDE_W - BAR_W - MARGIN * 2, h: 0.35,
        fontSize: 10.5, bold: true, color: titleCol, fontFace: 'Trebuchet MS'
      });
      const condPara = condiciones.map((c, i) => ({
        text: `${i + 1}.  ${c}` + (i < condiciones.length - 1 ? '\n' : ''),
        options: { color: textCol, fontSize: 11, fontFace: 'Arial', bullet: false }
      }));
      s3.addShape(pptx.ShapeType.roundRect, {
        x: BAR_W + MARGIN, y: 4.1, w: SLIDE_W - BAR_W - MARGIN * 2, h: 2.0,
        fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }, rectRadius: 0.04
      });
      s3.addText(condPara, {
        x: BAR_W + MARGIN + 0.14, y: 4.2, w: SLIDE_W - BAR_W - MARGIN * 2 - 0.28, h: 1.8,
        valign: 'top', wrap: true, shrinkText: true
      });
    }

    // cuerpo de desarrollo adicional
    const cuerpoDesarrollo = data.cuerpoDesarrollo || data.cuerpo?.detallesAdicionales || '';
    if (!condiciones.length && cuerpoDesarrollo) {
      textBlock(s3, 'Detalles Adicionales', cuerpoDesarrollo,
        BAR_W + MARGIN, 3.7, SLIDE_W - BAR_W - MARGIN * 2, 2.3);
    }

  } else {
    // Peticiones en lista numerada
    const peticionList = Array.isArray(data.peticion) ? data.peticion : [data.cuerpo?.peticion || data.cuerpoDesarrollo || ''];
    const cuerpoDesarrolloText = data.cuerpoDesarrollo || data.cuerpo?.peticion || '';

    // Encabezado de petición
    textBlock(s3, 'Por lo expuesto, solicito respetuosamente:', cuerpoDesarrolloText,
      BAR_W + MARGIN, 1.1, SLIDE_W - BAR_W - MARGIN * 2, 1.5);

    if (peticionList.length > 0 && peticionList[0] !== cuerpoDesarrolloText) {
      s3.addText('Peticiones concretas:', {
        x: BAR_W + MARGIN, y: 2.75, w: SLIDE_W - BAR_W - MARGIN * 2, h: 0.35,
        fontSize: 10.5, bold: true, color: titleCol, fontFace: 'Trebuchet MS'
      });
      s3.addShape(pptx.ShapeType.roundRect, {
        x: BAR_W + MARGIN, y: 3.15, w: SLIDE_W - BAR_W - MARGIN * 2, h: 2.95,
        fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }, rectRadius: 0.04
      });
      const petPara = peticionList.map((p, i) => ({
        text: `${i + 1}.  ${p}` + (i < peticionList.length - 1 ? '\n' : ''),
        options: { color: textCol, fontSize: 11.5, fontFace: 'Arial', bullet: false, lineSpacing: 18 }
      }));
      s3.addText(petPara, {
        x: BAR_W + MARGIN + 0.14, y: 3.25, w: SLIDE_W - BAR_W - MARGIN * 2 - 0.28, h: 2.75,
        valign: 'top', wrap: true, shrinkText: true
      });
    }
  }

  addFooter(s3, 'Página 3');

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — DESPEDIDA + FIRMA (Remitente como Persona)
  // IOficioSolicitud / IOficioRespuesta: despedida, remitente{ nombre, cargo, institucion }
  // ══════════════════════════════════════════════════════════════════════════
  const s4 = pptx.addSlide();
  bg(s4);
  addAccentBar(s4);
  addSectionHeader(s4, 'Cierre y Firma');

  textBlock(s4, 'Despedida', data.despedida || '',
    BAR_W + MARGIN, 1.1, SLIDE_W - BAR_W - MARGIN * 2, 1.6);

  // Bloque de firma visual
  s4.addText('Atentamente,', {
    x: BAR_W + MARGIN, y: 2.9, w: 4, h: 0.38,
    fontSize: 11, color: mutedCol, fontFace: 'Arial', italic: true
  });

  // Línea de firma
  s4.addShape(pptx.ShapeType.line, {
    x: BAR_W + MARGIN, y: 4.05, w: 4.5, h: 0,
    line: { color: accentCol, width: 1, dashType: 'dash' }
  });

  // Datos del remitente (Persona tipada)
  const firma = data.firma || {};
  s4.addShape(pptx.ShapeType.roundRect, {
    x: BAR_W + MARGIN, y: 4.15, w: 5.8, h: 2.05,
    fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }, rectRadius: 0.04
  });
  s4.addText([
    { text: firma.nombre || '—', options: { bold: true, color: titleCol, fontSize: 15, fontFace: 'Trebuchet MS' } },
    { text: '\n' + (firma.cargo || ''), options: { color: textCol, fontSize: 11.5, fontFace: 'Arial' } },
    { text: '\n' + (firma.institucion || ''), options: { color: mutedCol, fontSize: 10.5, fontFace: 'Arial' } },
    ...(firma.cedula ? [{ text: '\nC.I. ' + firma.cedula, options: { color: mutedCol, fontSize: 10, fontFace: 'Arial' } }] : []),
    ...(firma.ciudad ? [{ text: '\n' + firma.ciudad, options: { color: mutedCol, fontSize: 10, fontFace: 'Arial', italic: true } }] : [])
  ], {
    x: BAR_W + MARGIN + 0.2, y: 4.22, w: 5.4, h: 1.9,
    valign: 'top', shrinkText: true
  });

  addFooter(s4, 'Página 4');

  // ══════════════════════════════════════════════════════════════════════════
  // SLIDE 5 — DISTRIBUCIÓN Cc + ANEXOS (si existen)
  // IOficioSolicitud/Respuesta: cc[], anexos[]
  // ══════════════════════════════════════════════════════════════════════════
  const copias  = data.copias  || [];
  const anexos  = data.anexos  || [];
  if (copias.length > 0 || anexos.length > 0) {
    const s5 = pptx.addSlide();
    bg(s5);
    addAccentBar(s5);
    addSectionHeader(s5, 'Distribución y Anexos');

    const colW = copias.length > 0 && anexos.length > 0
      ? (SLIDE_W - BAR_W - MARGIN * 2) / 2 - 0.2
      : SLIDE_W - BAR_W - MARGIN * 2;
    const col2X = BAR_W + MARGIN + colW + 0.4;

    if (copias.length > 0) {
      s5.addText('Distribución (Cc):', {
        x: BAR_W + MARGIN, y: 1.1, w: colW, h: 0.35,
        fontSize: 10.5, bold: true, color: titleCol, fontFace: 'Trebuchet MS'
      });
      s5.addShape(pptx.ShapeType.roundRect, {
        x: BAR_W + MARGIN, y: 1.5, w: colW, h: Math.min(copias.length * 0.52 + 0.3, 4.6),
        fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }, rectRadius: 0.04
      });
      const ccPara = copias.map((c, i) => ({
        text: `• ${c}` + (i < copias.length - 1 ? '\n' : ''),
        options: { color: textCol, fontSize: 11, fontFace: 'Arial' }
      }));
      s5.addText(ccPara, {
        x: BAR_W + MARGIN + 0.14, y: 1.6, w: colW - 0.28, h: 4.4,
        valign: 'top', shrinkText: true
      });
    }

    if (anexos.length > 0) {
      const aX = copias.length > 0 ? col2X : BAR_W + MARGIN;
      const aW = copias.length > 0 ? colW : colW;
      s5.addText('Anexos:', {
        x: aX, y: 1.1, w: aW, h: 0.35,
        fontSize: 10.5, bold: true, color: titleCol, fontFace: 'Trebuchet MS'
      });
      s5.addShape(pptx.ShapeType.roundRect, {
        x: aX, y: 1.5, w: aW, h: Math.min(anexos.length * 0.52 + 0.3, 4.6),
        fill: { color: cardCol }, line: { color: accentCol, width: 0.5 }, rectRadius: 0.04
      });
      const anexoItems = Array.isArray(anexos) ? anexos : [String(anexos)];
      const anexPara = anexoItems.map((a, i) => ({
        text: `${i + 1}.  ${a}` + (i < anexoItems.length - 1 ? '\n' : ''),
        options: { color: textCol, fontSize: 11, fontFace: 'Arial' }
      }));
      s5.addText(anexPara, {
        x: aX + 0.14, y: 1.6, w: aW - 0.28, h: 4.4,
        valign: 'top', wrap: true, shrinkText: true
      });
    }

    addFooter(s5, 'Página 5');
  }

  pptx.writeFile({ fileName: filename || `oficio_${data.type || 'documento'}.pptx` });
}
