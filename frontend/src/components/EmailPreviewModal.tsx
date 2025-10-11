
interface EmailPreviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  subject: string;
  htmlContent: string;
}

export function EmailPreviewModal({ isVisible, onClose, subject, htmlContent }: EmailPreviewModalProps) {
  if (!isVisible) return null;

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="modern-subtitle">👁️ Preview Email</h2>
            <button
              onClick={onClose}
              className="modern-btn modern-btn-ghost p-2"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="modern-form-label mb-2">Oggetto:</h3>
            <p className="modern-text text-lg font-semibold bg-gray-800 p-3 rounded-lg">
              {subject || 'Nessun oggetto'}
            </p>
          </div>
          
          <div className="border border-gray-600 rounded-xl overflow-hidden">
            <div className="bg-gray-800 p-3 border-b border-gray-600">
              <span className="modern-text-muted text-sm">Anteprima Email</span>
            </div>
            <div className="bg-white p-6 max-h-96 overflow-y-auto">
              <div 
                dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Nessun contenuto</p>' }}
                className="text-gray-900"
                style={{ 
                  maxWidth: '100%',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.6'
                }}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="modern-btn modern-btn-secondary"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
