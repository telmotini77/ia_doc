import React from 'react';
import { Sparkles, Cpu, Send, AlertCircle, RefreshCw } from 'lucide-react';

export default function ChatInterface({
  prompt,
  setPrompt,
  docType,
  setDocType,
  loading,
  onSubmit,
  prediction,
  aiMode
}) {
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

      <form onSubmit={onSubmit} className="chat-form">
        <div className="input-container">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              docType === 'report' ? "Describe el tema para tu informe técnico (ej. 'riego inteligente iot')..." :
              docType === 'presentation' ? "Describe el tema de la presentación (ej. 'seguridad informática corporativa')..." :
              docType === 'spreadsheet' ? "Describe el proyecto para generar el libro contable de Excel..." :
              "Describe los detalles (asunto, destinatario) para generar el oficio formal..."
            }
            className="chat-textarea"
            disabled={loading}
            rows={2}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
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
