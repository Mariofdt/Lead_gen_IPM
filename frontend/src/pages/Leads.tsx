import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const response = await fetch('http://localhost:4000/api/leads', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-card text-center">
          <div className="modern-loader">Caricamento leads...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="modern-card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="modern-title flex items-center gap-3">
              <span className="text-3xl">👥</span>
              Gestione Leads
            </h1>
            <p className="modern-text-muted">Visualizza e gestisci tutti i leads</p>
          </div>
        </div>
      </div>

      <div className="modern-card">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Azienda</th>
                <th>Email</th>
                <th>Città</th>
                <th>Regione</th>
                <th>Telefono</th>
                <th>Data Creazione</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center modern-text-muted py-8">
                    Nessun lead trovato
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.company_name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.city}</td>
                    <td>{lead.region}</td>
                    <td>{lead.phone}</td>
                    <td>{new Date(lead.created_at).toLocaleDateString('it-IT')}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        lead.email_sent_date ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lead.email_sent_date ? 'Contattato' : 'Nuovo'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
