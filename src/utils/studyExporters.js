import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const safeName = (title) => (title || 'material-estudio')
  .replace(/[^a-z0-9áéíóúñ ]/gi, '')
  .trim()
  .replace(/\s+/g, '-');

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const studyExportText = (study) => {
  const resource = study.resources || {};
  const notes = (study.notes || []).map((note) => `• ${note.text}`).join('\n');
  const cards = (resource.flashcards || []).map((card) => `P: ${card.front}\nR: ${card.back}`).join('\n\n');
  const quiz = (resource.quiz || []).map((item, index) => `${index + 1}. ${item.question}\nRespuesta: ${item.answer}`).join('\n\n');
  return [
    `Material de estudio: ${resource.title || 'Sin tema seleccionado'}`,
    '',
    'RESUMEN',
    resource.summary || 'Genera recursos a partir de un capítulo con texto extraíble.',
    '',
    'MAPA MENTAL',
    (resource.mindMap || []).map((item) => `• ${item}`).join('\n'),
    '',
    'NOTAS DEL DOCENTE',
    notes || 'Sin notas registradas.',
    '',
    'FLASHCARDS',
    cards || 'Sin tarjetas generadas.',
    '',
    'QUIZ',
    quiz || 'Sin cuestionario generado.',
  ].join('\n');
};

export const downloadStudyPDF = (study) => {
  const pdf = new jsPDF();
  const lines = pdf.splitTextToSize(studyExportText(study), 175);
  let y = 16;
  lines.forEach((line) => {
    if (y > 280) {
      pdf.addPage();
      y = 16;
    }
    pdf.text(line, 18, y);
    y += 6;
  });
  pdf.save(`${safeName(study.resources?.title)}.pdf`);
};

export const downloadStudyDOCX = async (study) => {
  const sections = studyExportText(study).split('\n\n');
  const document = new Document({
    sections: [{
      children: sections.map((section, index) => new Paragraph({
        text: section,
        heading: index === 0 ? HeadingLevel.TITLE : undefined,
        spacing: { after: 180 },
      })),
    }],
  });
  const blob = await Packer.toBlob(document);
  downloadBlob(blob, `${safeName(study.resources?.title)}.docx`);
};

export const downloadStudyXLSX = (study) => {
  const workbook = XLSX.utils.book_new();
  const cards = (study.resources?.flashcards || []).map((card) => ({ Pregunta: card.front, Respuesta: card.back }));
  const progress = (study.learningOrder || []).map((topic, index) => ({
    Orden: index + 1,
    Tema: topic.title,
    Estado: topic.status,
    Último_estudio: topic.lastStudied || '',
  }));
  const errors = (study.mistakes || []).map((mistake) => ({ Tema: mistake.topic, Pregunta: mistake.question, Explicación: mistake.explanation }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(cards), 'Flashcards');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(progress), 'Progreso');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(errors), 'Errores');
  XLSX.writeFile(workbook, `${safeName(study.resources?.title)}.xlsx`);
};
