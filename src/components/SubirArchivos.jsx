import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, 
  FileText, 
  FileCode, 
  FileUp, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
import './SubirArchivos.css';

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation' // pptx
];

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function SubirArchivos({ 
  attachedFiles, 
  setAttachedFiles, 
  onClose 
}) {
  const [localFiles, setLocalFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info'); // 'info' | 'error' | 'success'
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const acceptedMime = useMemo(() => ACCEPTED_FILE_TYPES.join(','), []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      localFiles.forEach(f => {
        if (f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, [localFiles]);

  const handleFiles = (fileList) => {
    const allowed = [];
    const rejected = [];

    if (attachedFiles.length + fileList.length > 30) {
      setMessageType('error');
      setMessage(`No se pueden subir más de 30 archivos por consulta (actualmente tienes ${attachedFiles.length}).`);
      return;
    }

    Array.from(fileList).forEach((file) => {
      // Check for duplicate in local or global files
      const isDuplicate = localFiles.some(f => f.file.name === file.name && f.file.size === file.size) ||
                          attachedFiles.some(f => f.name === file.name);

      if (isDuplicate) {
        rejected.push(`${file.name} (duplicado)`);
        return;
      }

      // Check size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        rejected.push(`${file.name} (>5MB)`);
        return;
      }

      // Check mime type or extension
      const isAccepted = ACCEPTED_FILE_TYPES.includes(file.type) || 
                          /\.(pdf|jpg|jpeg|png|svg|txt|csv|docx|xlsx|pptx)$/i.test(file.name);

      if (isAccepted) {
        let previewUrl;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }

        allowed.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl,
          progress: 0,
          status: 'pending'
        });
      } else {
        rejected.push(file.name);
      }
    });

    if (rejected.length > 0) {
      setMessageType('error');
      setMessage(`No permitidos o exceden límite: ${rejected.join(', ')}`);
    } else if (allowed.length > 0) {
      setMessageType('success');
      setMessage('¡Archivos listos para procesar!');
    }

    if (allowed.length > 0) {
      setLocalFiles(prev => [...prev, ...allowed]);
      // Trigger auto-upload/processing simulation
      triggerUpload(allowed);
    }
  };

  const triggerUpload = (filesToUpload) => {
    filesToUpload.forEach(fileObj => {
      // Set to uploading status
      setLocalFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f));

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Convert to base64 once loaded
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Data = e.target.result.split(',')[1];
            
            // Add to global attachedFiles state
            setAttachedFiles(prev => {
              // Avoid duplicates in global state
              if (prev.some(f => f.name === fileObj.file.name)) return prev;
              return [
                ...prev,
                {
                  name: fileObj.file.name,
                  type: fileObj.file.type || 'application/octet-stream',
                  data: base64Data,
                  size: fileObj.file.size
                }
              ];
            });

            setLocalFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f));
          };
          reader.readAsDataURL(fileObj.file);
        } else {
          setLocalFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress } : f));
        }
      }, 100 + Math.random() * 100);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const removeFile = (id, fileName) => {
    setLocalFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
    setAttachedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const getFileIcon = (file, previewUrl) => {
    if (previewUrl) {
      return (
        <div className="file-thumbnail">
          <img src={previewUrl} alt={file.name} className="thumbnail-img" />
        </div>
      );
    }
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'pdf') {
      return <FileText className="file-type-icon pdf-icon" size={24} />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileCode className="file-type-icon sheet-icon" size={24} />;
    }
    if (['docx', 'doc', 'txt'].includes(ext)) {
      return <FileText className="file-type-icon doc-icon" size={24} />;
    }
    return <FileText className="file-type-icon general-icon" size={24} />;
  };

  return (
    <div className="subir-archivos-panel glassmorphism animate-slide-down">
      <div className="panel-header-row">
        <div className="panel-title">
          <FileUp size={18} className="icon-purple animate-pulse" />
          <span>Gestor de Archivos de Contexto</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Cerrar Panel">
          <X size={16} />
        </button>
      </div>

      <div 
        className={`premium-dropzone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          multiple 
          hidden 
          onChange={handleInput}
          accept={acceptedMime}
        />
        <div className="dropzone-inner">
          <div className="cloud-icon-circle">
            <Upload size={24} className="cloud-icon" />
          </div>
          <div className="dropzone-text">
            <strong>Arrastra tus archivos aquí o haz clic para explorar</strong>
            <span>Soporta PDF, JPG, PNG, SVG, TXT, CSV, DOCX, XLSX y PPTX (Máx. 5MB)</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message-banner message-${messageType} animate-slide-down`}>
          {messageType === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          <span className="message-text">{message}</span>
          <button className="close-message-btn" onClick={() => setMessage(null)}>
            <X size={12} />
          </button>
        </div>
      )}

      {localFiles.length > 0 && (
        <div className="files-list-wrapper">
          <div className="list-subheader">
            <span>Archivos Cargados ({localFiles.length})</span>
            <button 
              className="clear-all-action"
              onClick={() => {
                localFiles.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
                setLocalFiles([]);
                setAttachedFiles([]);
                setMessage(null);
              }}
              disabled={localFiles.some(f => f.status === 'uploading')}
            >
              Limpiar todo
            </button>
          </div>

          <ul className="premium-file-list">
            {localFiles.map((fileObj) => {
              const { id, file, previewUrl, progress, status } = fileObj;
              return (
                <li key={id} className={`premium-file-item status-${status}`}>
                  <div className="item-details">
                    {getFileIcon(file, previewUrl)}
                    <div className="item-text-info">
                      <span className="item-name" title={file.name}>{file.name}</span>
                      <span className="item-size">{formatBytes(file.size)}</span>
                    </div>
                  </div>

                  <div className="item-actions-status">
                    {status === 'uploading' && (
                      <div className="upload-progress-circle-wrap">
                        <RefreshCw size={14} className="animate-spin text-purple" />
                        <span className="progress-text">{progress}%</span>
                      </div>
                    )}
                    {status === 'success' && (
                      <span className="success-check-badge">
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                    
                    <button 
                      type="button" 
                      className="delete-item-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(id, file.name);
                      }}
                      disabled={status === 'uploading'}
                      title="Eliminar archivo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {status === 'uploading' && (
                    <div className="item-progress-bar-container">
                      <div 
                        className="item-progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
