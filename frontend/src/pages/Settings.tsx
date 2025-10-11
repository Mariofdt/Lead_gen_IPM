import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS } from '../config/api';

function Settings() {
  const { getAuthHeaders } = useAuth();
  const [settings, setSettings] = useState({
    sendgrid_api_key: '',
    email_sender: '',
    max_leads_per_scrape: 25,
    scrape_delay: 2000
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.settings, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(API_ENDPOINTS.settings, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Impostazioni salvate con successo!');
      } else {
        const errorData = await response.json();
        alert(`Errore nel salvare: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="mx-8 mt-8">
        <div className="modern-card p-8 text-center">
          <div className="hud-loader mx-auto mb-4"></div>
          <p className="modern-text-secondary">Caricamento impostazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="modern-card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="modern-title flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              Impostazioni
            </h1>
            <p className="modern-text-muted">Configura le impostazioni del sistema</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="modern-card">
        <h2 className="modern-subtitle mb-8">Configurazione Email</h2>
        
        <div className="space-y-6">
          <div className="modern-form-group">
            <label className="modern-form-label">
              SendGrid API Key
            </label>
            <input
              type="password"
              value={settings.sendgrid_api_key}
              onChange={(e) => handleChange('sendgrid_api_key', e.target.value)}
              className="modern-input"
              placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <p className="modern-text-muted text-sm mt-2">
              La tua API key di SendGrid per l'invio delle email
            </p>
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">
              Email Mittente
            </label>
            <input
              type="email"
              value={settings.email_sender}
              onChange={(e) => handleChange('email_sender', e.target.value)}
              className="modern-input"
              placeholder="contact@firstdigitaltrade.com"
            />
            <p className="modern-text-muted text-sm mt-2">
              L'indirizzo email che apparirà come mittente
            </p>
          </div>
        </div>
      </div>

      {/* Scraping Settings */}
      <div className="modern-card">
        <h2 className="modern-subtitle mb-8">Configurazione Scraping</h2>
        
        <div className="space-y-6">
          <div className="modern-form-group">
            <label className="modern-form-label">
              Massimo Leads per Sessione
            </label>
            <input
              type="number"
              value={settings.max_leads_per_scrape}
              onChange={(e) => handleChange('max_leads_per_scrape', parseInt(e.target.value))}
              className="modern-input"
              min="1"
              max="100"
            />
            <p className="modern-text-muted text-sm mt-2">
              Numero massimo di leads da cercare per ogni sessione di scraping
            </p>
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">
              Ritardo tra Richieste (ms)
            </label>
            <input
              type="number"
              value={settings.scrape_delay}
              onChange={(e) => handleChange('scrape_delay', parseInt(e.target.value))}
              className="modern-input"
              min="1000"
              max="10000"
            />
            <p className="modern-text-muted text-sm mt-2">
              Ritardo in millisecondi tra le richieste per evitare il rate limiting
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="modern-card">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="modern-btn modern-btn-primary"
          >
            {saving ? '💾 Salvando...' : '💾 Salva Impostazioni'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;