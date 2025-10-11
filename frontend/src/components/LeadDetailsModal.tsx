import React, { useState, useEffect } from 'react';

interface LeadDetailsModalProps {
  isVisible: boolean;
  lead: any;
  onClose: () => void;
  onSaveNotes: (leadId: number, notes: string) => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  isVisible,
  lead,
  onClose,
  onSaveNotes
}) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
    }
  }, [lead]);

  if (!isVisible || !lead) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSaveNotes(lead.id, notes);
    setSaving(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        className="modern-card p-8 w-1/2 max-w-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-200 text-2xl font-bold transition-all duration-200 hover:scale-110"
        >
          ×
        </button>
        
        <div className="modern-title mb-8 flex items-center gap-3">
          <span className="text-3xl">👁️</span>
          Dettagli Lead
        </div>
        
        {/* Lead Info */}
        <div className="modern-grid modern-grid-2 gap-6 mb-8">
          <div className="modern-form-group">
            <label className="modern-form-label">Azienda</label>
            <div className="modern-text">{lead.company_name}</div>
          </div>
          <div className="modern-form-group">
            <label className="modern-form-label">Email</label>
            <div className="modern-text">{lead.email}</div>
          </div>
          <div className="modern-form-group">
            <label className="modern-form-label">Città</label>
            <div className="modern-text">{lead.city}</div>
          </div>
          <div className="modern-form-group">
            <label className="modern-form-label">Regione</label>
            <div className="modern-text">{lead.region || 'N/A'}</div>
          </div>
          <div className="modern-form-group">
            <label className="modern-form-label">Telefono</label>
            <div className="modern-text">{lead.phone || 'N/A'}</div>
          </div>
          <div className="modern-form-group">
            <label className="modern-form-label">Website</label>
            <div className="modern-text">
              {lead.website ? (
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 transition-colors underline"
                >
                  {lead.website}
                </a>
              ) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Email Status */}
        {lead.email_sent_date && (
          <div className="modern-card mb-8">
            <div className="modern-subtitle mb-4 flex items-center gap-2">
              <span className="text-xl">📧</span>
              Stato Email
            </div>
            <div className="modern-grid modern-grid-2 gap-6">
              <div className="modern-form-group">
                <label className="modern-form-label">Mail Inviata</label>
                <div className="modern-text text-green-400 flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  Sì
                </div>
              </div>
              <div className="modern-form-group">
                <label className="modern-form-label">Template</label>
                <div className="modern-text">{lead.last_template_name || lead.template_name || 'N/A'}</div>
              </div>
              <div className="modern-form-group">
                <label className="modern-form-label">Data Invio</label>
                <div className="modern-text">
                  {new Date(lead.email_sent_date).toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="modern-form-group">
                <label className="modern-form-label">Ora Invio</label>
                <div className="modern-text">
                  {new Date(lead.email_sent_date).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email History */}
        <div className="mb-8">
          <div className="modern-subtitle mb-4 flex items-center gap-2">
            <span className="text-xl">📧</span>
            Cronologia Email
          </div>
          <div className="modern-card p-6">
            {lead.email_sent_date ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="modern-text font-medium">Email inviata</span>
                  <span className="modern-text-muted text-sm">
                    {new Date(lead.email_sent_date).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <div className="modern-text-muted text-sm">
                  Template: {lead.template_used || 'Template predefinito'}
                </div>
              </div>
            ) : (
              <div className="modern-text-muted">Nessuna email inviata</div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <div className="modern-subtitle mb-4 flex items-center gap-2">
            <span className="text-xl">📝</span>
            Note
          </div>
          <div className="modern-card p-6" style={{
            background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.15) 0%, rgba(0, 200, 255, 0.1) 100%)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 resize-none bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-0 border-0 p-0"
              placeholder="Aggiungi note su questo lead..."
              style={{
                background: 'transparent',
                color: '#ffffff',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="modern-btn modern-btn-primary flex-1"
          >
            {saving ? '⏳ Salvando...' : '💾 Salva Note'}
          </button>
          <button
            onClick={onClose}
            className="modern-btn modern-btn-secondary flex-1"
          >
            ❌ Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
