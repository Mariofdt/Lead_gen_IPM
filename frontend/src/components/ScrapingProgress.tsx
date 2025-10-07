import React from 'react';

interface ScrapingProgressProps {
  isVisible: boolean;
  processed: number;
  found: number;
  currentSite: string;
  onCancel: () => void;
}

export const ScrapingProgress: React.FC<ScrapingProgressProps> = ({
  isVisible,
  processed,
  found,
  currentSite,
  onCancel
}) => {
  if (!isVisible) return null;

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal p-8 text-center relative">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 text-gray-400 hover:text-white text-2xl font-bold"
        >
          ×
        </button>
        
        <div className="text-center">
          <div className="modern-title mb-4">🔍 Scraping in Corso</div>
          
          <div className="modern-text mb-6">
            Elaborazione dati da Google...
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm modern-text-muted mb-2">
              <span>Processati: {processed}</span>
              <span>Trovati: {found}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((processed / 25) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Current Site */}
          {currentSite && (
            <div className="mb-6">
              <div className="modern-text-muted text-sm mb-2">Sito attuale:</div>
              <div className="modern-text text-xs break-all bg-gray-800 p-3 rounded-xl">
                {currentSite}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-center mb-6">
            <div className="modern-loader mr-3"></div>
            <span className="modern-text">
              {processed === 0 ? 'Inizializzazione...' : 
               processed < 5 ? 'Ricerca iniziale...' :
               processed < 15 ? 'Elaborazione siti...' :
               'Completamento...'}
            </span>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="modern-btn modern-btn-primary w-full"
          >
            ⏹️ Interrompi Scraping
          </button>
        </div>
      </div>
    </div>
  );
};
