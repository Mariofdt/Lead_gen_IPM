import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Campaign {
  id: number;
  name: string;
  template_id: number;
  template_name: string;
  total_sent: number;
  total_interested: number;
  created_at: string;
  open_rate?: number;
  click_rate?: number;
  total_clicks?: number;
  last_updated?: string;
}

interface SendGridStats {
  opens: number;
  clicks: number;
  unique_opens: number;
  unique_clicks: number;
}

function Campaigns() {
  const { getAuthHeaders } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        console.error('Error loading campaigns:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const refreshSendGridStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/campaigns/refresh-stats', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        await loadCampaigns();
        alert('Statistiche aggiornate con successo!');
      } else {
        const errorData = await response.json();
        alert(`Errore nell'aggiornamento: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      alert('Errore durante l\'aggiornamento delle statistiche');
    } finally {
      setRefreshing(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaignName.trim()) {
      alert('Inserisci un nome per la campagna');
      return;
    }

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newCampaignName })
      });

      if (response.ok) {
        await loadCampaigns();
        setNewCampaignName('');
        setShowCreateModal(false);
        alert('Campagna creata con successo!');
      } else {
        const errorData = await response.json();
        alert(`Errore nella creazione: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Errore durante la creazione della campagna');
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  if (loading) {
    return (
      <div className="mx-8 mt-8">
        <div className="modern-card p-8 text-center">
          <div className="hud-loader mx-auto mb-4"></div>
          <p className="modern-text-secondary">Caricamento campagne...</p>
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
              <span className="text-3xl">🚀</span>
              Campagne Email
            </h1>
            <p className="modern-text-muted">Gestisci le campagne di marketing</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={refreshSendGridStats}
              disabled={refreshing}
              className="modern-btn modern-btn-secondary"
            >
              {refreshing ? '⏳ Aggiornando...' : '🔄 Aggiorna Statistiche'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="modern-btn modern-btn-primary"
            >
              ➕ Nuova Campagna
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="modern-grid modern-grid-2 gap-8">
        {campaigns.length === 0 ? (
          <div className="modern-card col-span-2">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="modern-subtitle mb-4">Nessuna campagna trovata</h3>
              <p className="modern-text-muted mb-6">
                Crea la tua prima campagna per iniziare a inviare email
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="modern-btn modern-btn-primary"
              >
                ➕ Crea Prima Campagna
              </button>
            </div>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="modern-card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="modern-subtitle mb-2">{campaign.name}</h3>
                  <p className="modern-text-muted text-sm">
                    Creata il {new Date(campaign.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="modern-text-muted text-sm">
                    {campaign.last_updated 
                      ? `Aggiornato: ${new Date(campaign.last_updated).toLocaleDateString('it-IT')}`
                      : 'Mai aggiornato'
                    }
                  </span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="modern-stat-value text-3xl font-bold text-blue-400">
                    {campaign.total_sent}
                  </div>
                  <div className="modern-text-muted text-sm">Email Inviate</div>
                </div>
                
                <div className="text-center">
                  <div className="modern-stat-value text-3xl font-bold text-green-400">
                    {campaign.open_rate ? `${campaign.open_rate}%` : 'N/A'}
                  </div>
                  <div className="modern-text-muted text-sm">Tasso Apertura</div>
                </div>
                
                <div className="text-center">
                  <div className="modern-stat-value text-3xl font-bold text-purple-400">
                    {campaign.click_rate ? `${campaign.click_rate}%` : 'N/A'}
                  </div>
                  <div className="modern-text-muted text-sm">Tasso Click</div>
                </div>
                
                <div className="text-center">
                  <div className="modern-stat-value text-3xl font-bold text-orange-400">
                    {campaign.total_clicks || 0}
                  </div>
                  <div className="modern-text-muted text-sm">Click Totali</div>
                </div>
              </div>

              {/* Template Info */}
              <div className="mt-6 pt-6 border-t border-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-sm modern-text-muted">Template:</span>
                  <span className="text-sm modern-text">
                    {campaign.template_name || 'Nessuno'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm modern-text-muted">Interessati:</span>
                  <span className="text-sm modern-text">
                    {campaign.total_interested}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modern-card max-w-md w-full mx-4">
            <h2 className="modern-subtitle mb-6">Crea Nuova Campagna</h2>
            
            <div className="modern-form-group">
              <label className="modern-form-label">Nome Campagna</label>
              <input
                type="text"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                className="modern-input"
                placeholder="Es: Campagna Veneto Q1 2024"
                autoFocus
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createCampaign}
                className="modern-btn modern-btn-primary flex-1"
              >
                💾 Crea Campagna
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCampaignName('');
                }}
                className="modern-btn modern-btn-secondary flex-1"
              >
                ❌ Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Campaigns;