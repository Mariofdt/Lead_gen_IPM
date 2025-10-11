import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ScrapingProgress } from '../components/ScrapingProgress';
import { LeadDetailsModal } from '../components/LeadDetailsModal';
import { API_ENDPOINTS } from '../config/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, getAuthHeaders } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [templates, setTemplates] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [q, setQ] = useState('');
  const [stats, setStats] = useState<any | null>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [scrapeCityName, setScrapeCityName] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeAbort, setScrapeAbort] = useState<AbortController | null>(null);
  const [sortField, setSortField] = useState<string>('company_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [scrapeProgress, setScrapeProgress] = useState({ processed: 0, found: 0, currentSite: '' });
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtri avanzati
  const [filters, setFilters] = useState({
    city: '',
    dateFrom: '',
    dateTo: '',
    searchType: '',
    businessCategory: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      if (!session) return;
      
      setLoading(true);
      console.log('🔄 Caricamento dati dashboard...');
      
      try {
        // Carica tutti i dati in parallelo per velocizzare
        const [leadsRes, templatesRes, statsRes, citiesRes] = await Promise.all([
          fetch(API_ENDPOINTS.leads, { headers: getAuthHeaders() }),
          fetch(API_ENDPOINTS.emailTemplates, { headers: getAuthHeaders() }),
          fetch(API_ENDPOINTS.stats, { headers: getAuthHeaders() }),
          fetch(API_ENDPOINTS.cities, { headers: getAuthHeaders() })
        ]);

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(leadsData);
          console.log(`✅ Caricati ${leadsData.length} leads`);
        }
        
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData);
          if (templatesData.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templatesData[0].id);
          }
          console.log(`✅ Caricati ${templatesData.length} template`);
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
          console.log('✅ Caricate statistiche');
        }
        
        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData);
          console.log(`✅ Caricate ${citiesData.length} città`);
        }
        
        console.log('🎉 Caricamento completato!');
      } catch (error) {
        console.error('❌ Errore nel caricamento:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSendCampaign = async () => {
    if (!templates.length) {
      alert('Nessun template disponibile');
      return;
    }
    
    if (!selectedTemplateId) {
      alert('Seleziona un template per la campagna');
      return;
    }

    // Get selected lead IDs
    const selectedLeadIds = Object.keys(selected).filter((id) => selected[Number(id)]);
    if (selectedLeadIds.length === 0) {
      alert('Seleziona almeno un lead per inviare la campagna');
      return;
    }
    
    setSending(true);
    try {
      if (!session) return;
      const res = await fetch(API_ENDPOINTS.sendCampaign, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          templateId: selectedTemplateId,
          leadIds: selectedLeadIds.map(Number)
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const selectedCount = selectedLeadIds.length;
        alert(`Campagna inviata con successo!\n\n📧 Email inviate: ${data.sent}\n👥 Lead selezionati: ${selectedCount}\n✅ Lead processati: ${data.sent}`);
        // Clear selection
        setSelected({});
        // Reload leads and stats
        const leadsRes = await fetch(API_ENDPOINTS.leads, {
          headers: getAuthHeaders(),
        });
        if (leadsRes.ok) setLeads(await leadsRes.json());
        const statsRes = await fetch(API_ENDPOINTS.stats, {
          headers: getAuthHeaders(),
        });
        if (statsRes.ok) setStats(await statsRes.json());
      } else {
        const errorData = await res.json();
        alert(`Errore nell'invio della campagna: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Errore nell\'invio della campagna');
    } finally {
      setSending(false);
    }
  };

  const handleScrape = async () => {
    if (!scrapeCityName) return;
    setScraping(true);
    setScrapeProgress({ processed: 0, found: 0, currentSite: '' });
    
    const abortController = new AbortController();
    setScrapeAbort(abortController);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setScrapeProgress(prev => ({
        ...prev,
        processed: Math.min(prev.processed + 1, 25),
        currentSite: `Sito ${prev.processed + 1} di 25`
      }));
    }, 2000);

    try {
      if (!session) return;
      const res = await fetch(API_ENDPOINTS.scrape, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ city: scrapeCityName }),
        signal: abortController.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setScrapeProgress(prev => ({ ...prev, found: data.scraped }));
        // Reload leads and stats
        const leadsRes = await fetch(API_ENDPOINTS.leads, {
          headers: getAuthHeaders(),
        });
        if (leadsRes.ok) setLeads(await leadsRes.json());
        const statsRes = await fetch(API_ENDPOINTS.stats, {
          headers: getAuthHeaders(),
        });
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } finally {
      clearInterval(progressInterval);
      setScraping(false);
      setScrapeAbort(null);
      setScrapeProgress({ processed: 0, found: 0, currentSite: '' });
    }
  };

  const handleCancelScrape = () => {
    if (scrapeAbort) {
      scrapeAbort.abort();
      setScraping(false);
      setScrapeAbort(null);
      setScrapeProgress({ processed: 0, found: 0, currentSite: '' });
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedLeads = () => {
    return leads
      .filter(l => {
        // Filtro di ricerca generale
        const matchesSearch = !q || l.company_name.toLowerCase().includes(q.toLowerCase()) || l.city.toLowerCase().includes(q.toLowerCase());
        
        // Filtro per città
        const matchesCity = !filters.city || l.city.toLowerCase().includes(filters.city.toLowerCase());
        
        // Filtro per data contatto
        const matchesDate = !filters.dateFrom || !filters.dateTo || (l.email_sent_date && 
          new Date(l.email_sent_date) >= new Date(filters.dateFrom) && 
          new Date(l.email_sent_date) <= new Date(filters.dateTo));
        
        // Filtro per tipo di ricerca (se presente nel lead)
        const matchesSearchType = !filters.searchType || (l.search_type && l.search_type.toLowerCase().includes(filters.searchType.toLowerCase()));
        
        // Filtro per categoria business (se presente nel lead)
        const matchesBusinessCategory = !filters.businessCategory || (l.business_category && l.business_category.toLowerCase().includes(filters.businessCategory.toLowerCase()));
        
        return matchesSearch && matchesCity && matchesDate && matchesSearchType && matchesBusinessCategory;
      })
      .sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
  };

  const handleDeleteSelected = async () => {
    if (!confirm('Sei sicuro di voler eliminare i lead selezionati?')) return;
    const selectedIds = Object.keys(selected).filter(id => selected[parseInt(id)]);
    if (selectedIds.length === 0) return;
    
    try {
      if (!session) return;
      
      for (const id of selectedIds) {
        await fetch(`/api/leads/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      }
      
      // Reload leads and stats
      const leadsRes = await fetch(API_ENDPOINTS.leads, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (leadsRes.ok) setLeads(await leadsRes.json());
      const statsRes = await fetch(API_ENDPOINTS.stats, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (statsRes.ok) setStats(await statsRes.json());
      
      setSelected({});
    } catch (error) {
      console.error('Error deleting leads:', error);
    }
  };

  const handleSaveNotes = async (leadId: number, notes: string) => {
    try {
      if (!session) return;
      
      await fetch(API_ENDPOINTS.updateLead(leadId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });
      
      // Reload leads
      const leadsRes = await fetch(API_ENDPOINTS.leads, {
        headers: getAuthHeaders(),
      });
      if (leadsRes.ok) setLeads(await leadsRes.json());
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      if (!session) return;
      
      const res = await fetch(API_ENDPOINTS.sendTestEmail, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: 'mario@ipermoney.com' }),
      });
      
      if (res.ok) {
        alert('Email di test inviata con successo!');
      } else {
        alert('Errore nell\'invio dell\'email di test');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Errore nell\'invio dell\'email di test');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      dateFrom: '',
      dateTo: '',
      searchType: '',
      businessCategory: ''
    });
  };

  const getUniqueCities = () => {
    const citySet = new Set(leads.map(l => l.city).filter(Boolean));
    return Array.from(citySet).sort();
  };

  const sortedLeads = getSortedLeads();

  // Mostra loading se i dati stanno caricando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="modern-text-muted text-lg">Caricamento dati...</p>
          <p className="modern-text-muted text-sm mt-2">Ottimizzando le prestazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="modern-card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="modern-title">🚀 Dashboard Clienti</h1>
            <p className="modern-text-muted">Panoramica completa delle applicazioni e gestione avanzata delle transazioni bancarie</p>
            <p className="modern-text-muted text-sm mt-2">Powered by Futuristic Technology</p>
          </div>
          <button
            onClick={handleLogout}
            className="modern-btn modern-btn-ghost"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="modern-grid modern-grid-4">
          <div className="modern-stat-card">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-white text-2xl">👥</span>
              </div>
            </div>
            <div className="modern-stat-value">{stats.total}</div>
            <div className="modern-stat-label">Totale Clienti</div>
            <div className="modern-text-muted text-sm mt-2">Applicazioni totali</div>
          </div>
          <div className="modern-stat-card">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="text-white text-2xl">✅</span>
              </div>
            </div>
            <div className="modern-stat-value">{stats.email_sent}</div>
            <div className="modern-stat-label">Completati</div>
            <div className="modern-text-muted text-sm mt-2">Processi finalizzati</div>
          </div>
          <div className="modern-stat-card">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white text-2xl">🆕</span>
              </div>
            </div>
            <div className="modern-stat-value">{stats.new_last_7d}</div>
            <div className="modern-stat-label">In Attesa</div>
            <div className="modern-text-muted text-sm mt-2">Nuovi (7 giorni)</div>
          </div>
          <div className="modern-stat-card">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                <span className="text-white text-2xl">⏳</span>
              </div>
            </div>
            <div className="modern-stat-value">{stats.not_contacted}</div>
            <div className="modern-stat-label">Rifiutati</div>
            <div className="modern-text-muted text-sm mt-2">Da Contattare</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="modern-card">
        <h2 className="modern-subtitle mb-8 flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          Azioni Avanzate
        </h2>
        <div className="modern-grid modern-grid-2 gap-12">
          <div>
            <h3 className="modern-form-label mb-8 flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              Scraping Intelligente
            </h3>
            <div className="flex gap-6">
              <select
                value={scrapeCityName}
                onChange={(e) => setScrapeCityName(e.target.value)}
                className="modern-input flex-1"
              >
                <option value="">Seleziona città</option>
                {cities.map(city => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
              <button
                onClick={handleScrape}
                disabled={scraping || !scrapeCityName}
                className="modern-btn modern-btn-primary px-8"
              >
                {scraping ? '⏳ Scraping...' : '🚀 Cerca Dati'}
              </button>
            </div>
          </div>
          <div>
            <h3 className="modern-form-label mb-8 flex items-center gap-3">
              <span className="text-3xl">📧</span>
              Campagna Email
            </h3>
            <div className="space-y-6">
              <div>
                <label className="modern-form-label mb-4">Template Email</label>
                {templates.length > 0 ? (
                  <select
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
                    className="modern-input"
                    disabled={sending}
                  >
                    <option value="">Seleziona template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="modern-text-muted p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600">
                    Nessun template disponibile. Vai alla sezione Template Email per crearne uno.
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {Object.values(selected).some(v => v) && (
                  <div className="modern-text-muted text-sm bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 rounded-xl border border-cyan-500/20">
                    {Object.values(selected).filter(v => v).length} lead selezionati
                  </div>
                )}
                <div className="flex gap-6">
                  <button
                    onClick={handleSendCampaign}
                    disabled={sending || !templates.length || !selectedTemplateId || Object.values(selected).every(v => !v)}
                    className="modern-btn modern-btn-primary px-8"
                  >
                    {sending ? '⏳ Invio...' : '📧 Invia Campagna'}
                  </button>
                  <button
                    onClick={handleSendTestEmail}
                    className="modern-btn modern-btn-secondary px-6"
                  >
                    🧪 Test Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="modern-card">
        <div className="flex justify-between items-center mb-12">
          <h2 className="modern-subtitle flex items-center gap-4">
            <span className="text-4xl">👥</span>
            Lista Clienti
          </h2>
          <div className="flex gap-6">
            <input
              type="text"
              placeholder="🔍 Cerca leads..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="modern-input w-80"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="modern-btn modern-btn-ghost px-6"
            >
              🔧 Filtri Avanzati {Object.values(filters).some(v => v) && '●'}
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={Object.values(selected).every(v => !v)}
              className="modern-btn modern-btn-secondary px-6"
            >
              🗑️ Elimina Selezionati
            </button>
          </div>
        </div>

        {/* Filtri Avanzati */}
        {showFilters && (
          <div className="modern-card mb-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600">
            <h3 className="modern-form-label mb-8 flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              Filtri Avanzati
            </h3>
            <div className="modern-grid modern-grid-3 gap-8">
              <div>
                <label className="modern-form-label mb-4">Città</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="modern-input"
                >
                  <option value="">Tutte le città</option>
                  {getUniqueCities().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="modern-form-label mb-4">Data Contatto Da</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="modern-input"
                />
              </div>
              <div>
                <label className="modern-form-label mb-4">Data Contatto A</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="modern-input"
                />
              </div>
              <div>
                <label className="modern-form-label mb-4">Tipo di Ricerca</label>
                <input
                  type="text"
                  placeholder="es. registratori di cassa"
                  value={filters.searchType}
                  onChange={(e) => handleFilterChange('searchType', e.target.value)}
                  className="modern-input"
                />
              </div>
              <div>
                <label className="modern-form-label mb-4">Categoria Business</label>
                <input
                  type="text"
                  placeholder="es. ristoranti, negozi"
                  value={filters.businessCategory}
                  onChange={(e) => handleFilterChange('businessCategory', e.target.value)}
                  className="modern-input"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="modern-btn modern-btn-ghost w-full px-6"
                >
                  🗑️ Cancella Filtri
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="modern-table">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-700">
                <th className="px-8 py-6">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const newSelected: Record<number, boolean> = {};
                      if (e.target.checked) {
                        sortedLeads.forEach(l => newSelected[l.id] = true);
                      }
                      setSelected(newSelected);
                    }}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => handleSort('company_name')}
                    className="flex items-center gap-3 font-semibold text-gray-200 hover:text-cyan-400 transition-colors text-lg"
                  >
                    Azienda
                    {sortField === 'company_name' ? (
                      sortDirection === 'asc' ? '↑' : '↓'
                    ) : (
                      <span className="text-gray-400">↕️</span>
                    )}
                  </button>
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => handleSort('city')}
                    className="flex items-center gap-3 font-semibold text-gray-200 hover:text-cyan-400 transition-colors text-lg"
                  >
                    Città
                    {sortField === 'city' ? (
                      sortDirection === 'asc' ? '↑' : '↓'
                    ) : (
                      <span className="text-gray-400">↕️</span>
                    )}
                  </button>
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-3 font-semibold text-gray-200 hover:text-cyan-400 transition-colors text-lg"
                  >
                    Email
                    {sortField === 'email' ? (
                      sortDirection === 'asc' ? '↑' : '↓'
                    ) : (
                      <span className="text-gray-400">↕️</span>
                    )}
                  </button>
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => handleSort('email_sent_date')}
                    className="flex items-center gap-3 font-semibold text-gray-200 hover:text-cyan-400 transition-colors text-lg"
                  >
                    Data Contatto
                    {sortField === 'email_sent_date' ? (
                      sortDirection === 'asc' ? '↑' : '↓'
                    ) : (
                      <span className="text-gray-400">↕️</span>
                    )}
                  </button>
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => handleSort('last_template_name')}
                    className="flex items-center gap-3 font-semibold text-gray-200 hover:text-cyan-400 transition-colors text-lg"
                  >
                    Template Inviato
                    {sortField === 'last_template_name' ? (
                      sortDirection === 'asc' ? '↑' : '↓'
                    ) : (
                      <span className="text-gray-400">↕️</span>
                    )}
                  </button>
                </th>
                <th className="px-8 py-6 font-semibold text-gray-200 text-lg">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead, index) => (
                <tr key={lead.id} className={`${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'} hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300`}>
                  <td className="px-8 py-6">
                    <input
                      type="checkbox"
                      checked={selected[lead.id] || false}
                      onChange={(e) => setSelected({ ...selected, [lead.id]: e.target.checked })}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-8 py-6 font-medium text-gray-100 text-lg">
                    {lead.company_name}
                  </td>
                  <td className="px-8 py-6 text-gray-300 text-lg">
                    {lead.city}
                  </td>
                  <td className="px-8 py-6 text-gray-300 text-lg">
                    {lead.email}
                  </td>
                  <td className="px-8 py-6">
                    {lead.email_sent_date 
                      ? (
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm text-gray-300">
                              {new Date(lead.email_sent_date).toLocaleString('it-IT', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )
                      : (
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                            <span className="text-gray-500 text-sm">Mai contattato</span>
                          </div>
                        )
                    }
                  </td>
                  <td className="px-8 py-6">
                    {lead.last_template_name || lead.template_name ? (
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-sm text-gray-300">
                          {lead.last_template_name || lead.template_name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                        <span className="text-gray-500 text-sm">Nessuno</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowLeadModal(true);
                      }}
                      className="modern-btn modern-btn-ghost text-lg px-4 py-2"
                      title="Visualizza dettagli"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedLeads.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="modern-text-muted text-xl">Nessun lead trovato</p>
              <p className="modern-text-muted text-sm mt-2">Prova a modificare i filtri o aggiungi nuovi leads</p>
            </div>
          )}
        </div>
      </div>

      {/* Scraping Progress Modal */}
      <ScrapingProgress
        isVisible={scraping}
        processed={scrapeProgress.processed}
        found={scrapeProgress.found}
        currentSite={scrapeProgress.currentSite}
        onCancel={handleCancelScrape}
      />

      {/* Lead Details Modal */}
      <LeadDetailsModal
        isVisible={showLeadModal}
        lead={selectedLead}
        onClose={() => setShowLeadModal(false)}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}