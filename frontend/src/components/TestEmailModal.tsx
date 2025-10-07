import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface TestEmailModalProps {
  isVisible: boolean;
  onClose: () => void;
  templateId: number;
  templateName: string;
  onSuccess: (email: string) => void;
}

export function TestEmailModal({ isVisible, onClose, templateId, templateName, onSuccess }: TestEmailModalProps) {
  const { getAuthHeaders } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSendTest = async () => {
    if (!email.trim()) {
      setError('Inserisci un indirizzo email valido');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Formato email non valido');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          email: email.trim(),
          templateId: templateId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(email.trim());
        setEmail('');
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Errore nell\'invio della email di test');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setSending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="modern-subtitle">📧 Test Email</h2>
            <button
              onClick={onClose}
              className="modern-btn modern-btn-ghost p-2"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <p className="modern-text-muted mb-4">
              Invia una email di test del template <strong>"{templateName}"</strong> all'indirizzo specificato.
            </p>
          </div>
          
          <div className="modern-form-group">
            <label className="modern-form-label">
              Indirizzo Email di Test
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modern-input"
              placeholder="esempio@email.com"
              disabled={sending}
            />
            {error && (
              <div className="modern-form-error mt-2">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="modern-btn modern-btn-secondary"
              disabled={sending}
            >
              Annulla
            </button>
            <button
              onClick={handleSendTest}
              className="modern-btn modern-btn-primary"
              disabled={sending || !email.trim()}
            >
              {sending ? '⏳ Invio...' : '📧 Invia Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
