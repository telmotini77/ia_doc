import React, { useState } from 'react';
import { Settings, X, Cpu, Cloud, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  aiMode, 
  setAiMode, 
  geminiApiKey, 
  setGeminiApiKey 
}) {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey || '');

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(tempKey);
    // Guardar en localStorage
    localStorage.setItem('docgenius_ai_mode', aiMode);
    localStorage.setItem('docgenius_api_key', tempKey);
    onClose();
  };

  const handleModeChange = (mode) => {
    setAiMode(mode);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container glassmorphism animate-fade-in">
        <div className="modal-header">
          <div className="modal-title">
            <Settings className="icon-purple" />
            <span>Configuración de Inteligencia Artificial</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-section">
            <label className="section-label">Motor de Generación de Contenido</label>
            <div className="ai-mode-selector">
              <div 
                className={`mode-card ${aiMode === 'local' ? 'active' : ''}`}
                onClick={() => handleModeChange('local')}
              >
                <div className="mode-card-header">
                  <Cpu size={24} className="mode-icon" />
                  {aiMode === 'local' && <CheckCircle2 size={16} className="active-badge" />}
                </div>
                <h3>Red Neuronal Local</h3>
                <p>Gratuito, offline e instantáneo. Clasifica con Machine Learning local y utiliza plantillas inteligentes estructuradas.</p>
              </div>

              <div 
                className={`mode-card ${aiMode === 'gemini' ? 'active' : ''}`}
                onClick={() => handleModeChange('gemini')}
              >
                <div className="mode-card-header">
                  <Cloud size={24} className="mode-icon" />
                  {aiMode === 'gemini' && <CheckCircle2 size={16} className="active-badge" />}
                </div>
                <h3>Gemini Cloud API</h3>
                <p>Requiere clave API. Acceso a modelos avanzados de Google en la nube para generar textos dinámicos, creativos y personalizados.</p>
              </div>
            </div>
          </div>

          {aiMode === 'gemini' && (
            <div className="settings-section animate-slide-down">
              <label className="section-label" htmlFor="apiKeyInput">Gemini API Key (Google AI Studio)</label>
              <div className="api-key-input-wrapper">
                <input
                  id="apiKeyInput"
                  type={showKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="premium-input text-monospace"
                />
                <button 
                  type="button" 
                  className="toggle-visibility-btn"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="helper-text">
                Tu clave se almacena únicamente de forma local en tu navegador y no es enviada a ningún otro servidor que no sea la API oficial de Google Gemini.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="premium-btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="premium-btn btn-primary" onClick={handleSave}>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
