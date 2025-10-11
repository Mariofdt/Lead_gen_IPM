import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EmailPreviewModal } from '../components/EmailPreviewModal';
import { TestEmailModal } from '../components/TestEmailModal';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export function EmailTemplates() {
  const { getAuthHeaders } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: ''
  });

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-templates', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        if (data.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data[0]);
          setFormData({
            name: data[0].name,
            subject: data[0].subject,
            body: data[0].body
          });
        }
      } else {
        console.error('Error loading templates:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, selectedTemplate]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSave = async () => {
    if (!selectedTemplate && !isCreating) return;
    
    try {
      setSaving(true);
      const url = isCreating ? '/api/email-templates' : `/api/email-templates/${selectedTemplate?.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadTemplates();
        setIsEditing(false);
        setIsCreating(false);
        alert(isCreating ? 'Template creato con successo!' : 'Template salvato con successo!');
      } else {
        alert('Errore nel salvare il template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Errore nel salvare il template');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body
    });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: ''
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsCreating(false);
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const handleTestEmail = () => {
    if (selectedTemplate) {
      setShowTestModal(true);
    }
  };

  const handleTestSuccess = (email: string) => {
    setTestSuccess(email);
    setTimeout(() => setTestSuccess(null), 5000); // Hide after 5 seconds
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo template?')) return;
    
    try {
      const response = await fetch(`/api/email-templates/${templateId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await loadTemplates();
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
          setFormData({ name: '', subject: '', body: '' });
        }
        alert('Template eliminato con successo!');
      } else {
        const errorData = await response.json();
        alert(`Errore nell'eliminazione del template: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Errore durante l\'eliminazione del template.');
    }
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body
    });
    setShowPreviewModal(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    if (selectedTemplate) {
      setFormData({
        name: selectedTemplate.name,
        subject: selectedTemplate.subject,
        body: selectedTemplate.body
      });
    }
  };

  if (loading) {
    return (
      <div className="mx-8 mt-8">
        <div className="hud-card p-8 text-center">
          <div className="hud-loader mx-auto mb-4"></div>
          <p className="hud-text-secondary">Caricamento template...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="modern-card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="modern-title flex items-center gap-4 text-5xl">
              <span className="text-cyan-400">📧</span>
              Template Email
            </h1>
            <p className="modern-text-muted text-xl mt-4">Gestisci i template per le campagne email avanzate</p>
          </div>
          <div className="flex gap-6">
            <button
              onClick={handleCreateNew}
              className="modern-btn modern-btn-primary px-8"
            >
              ➕ Nuovo Template
            </button>
            <button
              onClick={handleEdit}
              className="modern-btn modern-btn-secondary px-6"
              disabled={!selectedTemplate}
            >
              ✏️ Modifica
            </button>
            <button
              onClick={handlePreview}
              className="modern-btn modern-btn-ghost px-6"
              disabled={!selectedTemplate && !isCreating}
            >
              👁️ Preview
            </button>
            <button
              onClick={handleTestEmail}
              className="modern-btn modern-btn-ghost px-6"
              disabled={!selectedTemplate}
            >
              📧 Test Email
            </button>
          </div>
        </div>
      </div>

      <div className="modern-grid modern-grid-2">
        {/* Lista Template */}
        <div className="modern-card">
          <h2 className="modern-subtitle mb-12 flex items-center gap-4">
            <span className="text-4xl">📋</span>
            Template Disponibili
          </h2>
              <div className="space-y-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-8 rounded-2xl transition-all duration-300 ${
                      selectedTemplate?.id === template.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30'
                        : 'bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div 
                      onClick={() => handleTemplateSelect(template)}
                      className="cursor-pointer"
                    >
                      <h3 className="modern-text font-semibold mb-4 text-xl">
                        {template.name}
                      </h3>
                      <p className="modern-text-muted mb-3 text-base">
                        {template.subject}
                      </p>
                      <p className="modern-text-muted text-sm">
                        Aggiornato: {new Date(template.updated_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTemplate(template);
                        }}
                        className="modern-btn modern-btn-ghost text-sm px-4 py-2"
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestEmail();
                          setSelectedTemplate(template);
                        }}
                        className="modern-btn modern-btn-ghost text-sm px-4 py-2"
                      >
                        📧 Test
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="modern-btn modern-btn-ghost text-sm px-4 py-2 text-red-400 hover:text-red-300"
                      >
                        🗑️ Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
        </div>

        {/* Editor/Preview */}
        <div className="modern-card">
          {(selectedTemplate || isCreating) ? (
            <>
              {isEditing || isCreating ? (
                <div>
                  <h2 className="modern-subtitle mb-8 flex items-center gap-3">
                    <span className="text-2xl">{isCreating ? '➕' : '✏️'}</span>
                    {isCreating ? 'Crea Nuovo Template' : 'Modifica Template'}
                  </h2>
                  
                  <div className="modern-form-group">
                    <label className="modern-form-label">
                      Nome Template
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="modern-input"
                      placeholder="Inserisci il nome del template..."
                    />
                  </div>

                  <div className="modern-form-group">
                    <label className="modern-form-label">
                      Oggetto Email
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="modern-input"
                      placeholder="Inserisci l'oggetto dell'email..."
                    />
                  </div>

                  <div className="modern-form-group">
                    <label className="modern-form-label">
                      Contenuto Email (HTML)
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="modern-input h-96 resize-none"
                      placeholder="Inserisci il contenuto HTML dell'email..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="modern-btn modern-btn-primary"
                    >
                      {saving ? '💾 Salvando...' : (isCreating ? '💾 Crea Template' : '💾 Salva Template')}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="modern-btn modern-btn-secondary"
                    >
                      ❌ Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="modern-subtitle mb-6">📄 Vista Template</h2>
                  <div className="mb-6">
                    <h3 className="modern-form-label mb-2">Nome:</h3>
                    <p className="modern-text text-lg font-semibold">
                      {selectedTemplate?.name || formData.name || 'Nessun nome'}
                    </p>
                  </div>
                  <div className="mb-6">
                    <h3 className="modern-form-label mb-2">Oggetto:</h3>
                    <p className="modern-text text-lg font-semibold">
                      {selectedTemplate?.subject || formData.subject || 'Nessun oggetto'}
                    </p>
                  </div>
                  <div className="mb-6">
                    <h3 className="modern-form-label mb-2">Contenuto HTML:</h3>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-600">
                      <pre className="modern-text-muted text-sm whitespace-pre-wrap overflow-x-auto">
                        {selectedTemplate?.body || formData.body || 'Nessun contenuto'}
                      </pre>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="modern-btn modern-btn-primary"
                      disabled={!selectedTemplate}
                    >
                      ✏️ Modifica Template
                    </button>
                    <button
                      onClick={handlePreview}
                      className="modern-btn modern-btn-secondary"
                    >
                      👁️ Preview HTML
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="modern-text-muted">
                {isCreating ? 'Crea un nuovo template o seleziona uno esistente' : 'Seleziona un template per visualizzarlo'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modali */}
      <EmailPreviewModal
        isVisible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        subject={selectedTemplate?.subject || formData.subject || ''}
        htmlContent={selectedTemplate?.body || formData.body || ''}
      />

      <TestEmailModal
        isVisible={showTestModal}
        onClose={() => setShowTestModal(false)}
        templateId={selectedTemplate?.id || 0}
        templateName={selectedTemplate?.name || ''}
        onSuccess={handleTestSuccess}
      />

      {/* Success Popup */}
      {testSuccess && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <div className="flex-1">
                <p className="font-semibold">Email di test inviata con successo!</p>
                <p className="text-sm opacity-90">Inviata a: {testSuccess}</p>
              </div>
              <button
                onClick={() => setTestSuccess(null)}
                className="text-white hover:text-gray-200 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
