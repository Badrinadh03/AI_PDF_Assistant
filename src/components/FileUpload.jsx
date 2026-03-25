import React, { useState, useRef, useCallback } from 'react';
import { uploadDocument } from '../api';

const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.txt'];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function FileUpload({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      return `Unsupported file type. Please upload: ${ACCEPTED_TYPES.join(', ')}`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback(async (file) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await uploadDocument(file);
      onUploadSuccess(data);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [onUploadSuccess]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); };

  return (
    <div className="upload-wrapper">
      <div
        className={`dropzone ${dragging ? 'dragging' : ''} ${loading ? 'loading' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !loading && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        {loading ? (
          <div className="upload-state">
            <div className="spinner" />
            <p>Reading your document…</p>
          </div>
        ) : (
          <div className="upload-state">
            <div className="upload-icon">📂</div>
            <p className="upload-main">Drag & drop your file here</p>
            <p className="upload-sub">or click to browse</p>
            <div className="file-types">
              {ACCEPTED_TYPES.map(t => (
                <span key={t} className="file-type-badge">{t}</span>
              ))}
            </div>
            <p className="upload-limit">Max file size: {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
