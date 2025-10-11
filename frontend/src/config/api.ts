// Configurazione API - Supabase Edge Functions
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const API_BASE_URL = `${SUPABASE_URL}/functions/v1/leads-api`;

// Endpoint API
export const API_ENDPOINTS = {
  // Pubblici (non richiedono autenticazione)
  cities: `${API_BASE_URL}/api/cities`,
  emailTemplates: `${API_BASE_URL}/api/email-templates`,
  
  // Privati (richiedono autenticazione)
  me: `${API_BASE_URL}/api/me`,
  leads: `${API_BASE_URL}/api/leads`,
  stats: `${API_BASE_URL}/api/stats`,
  campaigns: `${API_BASE_URL}/api/campaigns`,
  settings: `${API_BASE_URL}/api/settings`,
  scrape: `${API_BASE_URL}/api/scrape`,
  sendCampaign: `${API_BASE_URL}/api/send-campaign`,
  sendTestEmail: `${API_BASE_URL}/api/send-test-email`,
  emailPreview: (templateId: number) => `${API_BASE_URL}/api/email-preview/${templateId}`,
  updateLead: (id: number) => `${API_BASE_URL}/api/leads/${id}`,
  updateTemplate: (templateId: number) => `${API_BASE_URL}/api/email-templates/${templateId}`,
  refreshCampaignStats: `${API_BASE_URL}/api/campaigns/refresh-stats`,
  
  // Pubblici per il form di contatto
  publicInterest: `${API_BASE_URL}/api/public/interest`,
  
  // Test endpoints
  corsTest: `${API_BASE_URL}/api/cors-test`,
  health: `${API_BASE_URL}/health`,
};
