import React, { useState, useRef } from 'react';
import { Sparkles, Cpu, Send, AlertCircle, RefreshCw, Plus, X, FileText, Image as ImageIcon } from 'lucide-react';
import SubirArchivos from './SubirArchivos';

export default function ChatInterface({
  prompt,
  setPrompt,
  docType,
  setDocType,
  loading,
  onSubmit,
  prediction,
  aiMode,
  attachedFiles,
  setAttachedFiles
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
    // Auto-reveal the premium uploader panel on drag-over for interactive feel
    if (!showUploader) {
      setShowUploader(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Show uploader and let the drop event propagation handle it or process here
      setShowUploader(true);
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files) => {
    files.forEach(file => {
      // Limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo ${file.name} supera el límite de 5MB.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        const base64Data = result.split(',')[1];
        
        setAttachedFiles(prev => {
          if (prev.some(f => f.name === file.name)) return prev;
          return [
            ...prev, 
            { 
              name: file.name, 
              type: file.type || 'application/octet-stream', 
              data: base64Data,
              size: file.size
            }
          ];
        });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

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
  };

  return (
    <div className="chat-interface-wrapper glassmorphism">
      <div className="suggestions-row">
        {suggestions.map((sug, index) => (
          <button
            key={index}
            className="suggestion-pill"
            onClick={() => handleSuggestionClick(sug)}
            type="button"
            disabled={loading}
          >
            <Sparkles size={12} className="icon-purple" />
            <span>{sug.label}</span>
          </button>
        ))}
      </div>

      {/* Premium File Uploader Panel */}
      {showUploader && (
        <SubirArchivos 
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          onClose={() => setShowUploader(false)}
        />
      )}

      <form onSubmit={onSubmit} className="chat-form">
        <div 
          className={`input-container ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ flexDirection: 'column', alignItems: 'flex-start' }}
        >
          {/* Show simple badges ONLY when the uploader panel is closed to avoid duplication */}
          {!showUploader && attachedFiles && attachedFiles.length > 0 && (
            <div className="attached-files-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px', width: '100%' }}>
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="attached-file-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--text-primary)' }}>
                  {file.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileText size={14} />}
                  <span className="file-name" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} className="remove-file-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="input-row" style={{ display: 'flex', width: '100%', alignItems: 'flex-end', gap: '8px' }}>
            <button 
              type="button" 
              className={`attach-btn ${showUploader ? 'active' : ''}`} 
              onClick={() => setShowUploader(!showUploader)}
              disabled={loading}
              title="Gestionar archivos de contexto"
              style={{ 
                background: showUploader ? 'rgba(170, 59, 255, 0.15)' : 'transparent', 
                border: 'none', 
                color: showUploader ? 'var(--color-purple-light)' : 'var(--text-muted)', 
                cursor: 'pointer', 
                padding: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: 'var(--radius-sm)', 
                transition: 'all 0.2s', 
                marginBottom: '4px' 
              }}
            >
              <Plus size={20} style={{ transform: showUploader ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <input 
              type="file" 
              multiple 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*,.pdf,.txt,.csv,.docx,.pptx,.xlsb"
            />

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                docType === 'report' ? "Describe el tema para tu informe técnico (ej. 'riego inteligente iot')..." :
                docType === 'presentation' ? "Describe el tema de la presentación (ej. 'seguridad corporativa')..." :
                docType === 'spreadsheet' ? "Describe el proyecto para generar el libro contable de Excel..." :
                "Describe los detalles (asunto, destinatario) para generar el oficio formal..."
              }
              className="chat-textarea"
              disabled={loading}
              rows={2}
              style={{ flexGrow: 1 }}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={loading || !prompt.trim()}
              style={{ marginBottom: '4px' }}
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Indicadores de Clasificación o IA en tiempo real */}
      <div className="chat-status-bar">
        {prediction && aiMode === 'local' && (
          <div className="prediction-badge animate-fade-in">
            <Cpu size={14} className="icon-purple" />
            <span>
              Clasificación: <strong>{prediction.category.toUpperCase()}</strong>
            </span>
            <span className="divider">•</span>
            <span>
              Confianza ML: <strong>{(prediction.confidence * 100).toFixed(1)}%</strong>
            </span>
          </div>
        )}
        
        {aiMode === 'gemini' && (
          <div className="prediction-badge mode-gemini animate-fade-in">
            <Sparkles size={14} className="icon-purple" />
            <span>Generación Inteligente vía Gemini API</span>
          </div>
        )}

        {loading && (
          <div className="loading-badge animate-pulse">
            <RefreshCw className="animate-spin" size={12} />
            <span>Diseñando y estructurando documento...</span>
          </div>
        )}
      </div>
    </div>
  );
}
