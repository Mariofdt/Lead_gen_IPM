import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EmailPreview() {
  const { templateId } = useParams<{ templateId: string }>();
  const [emailContent, setEmailContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmailPreview = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/email-preview/${templateId}`);
        
        if (!response.ok) {
          throw new Error('Template non trovato');
        }
        
        const html = await response.text();
        setEmailContent(html);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchEmailPreview();
    }
  }, [templateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="modern-loader mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Errore</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://www.ipermoney.com/_next/static/media/logod.9f2fba9f.svg" 
                alt="IperMoney Logo" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold">Anteprima Email</h1>
                <p className="text-gray-300 text-sm">Template ID: {templateId}</p>
              </div>
            </div>
          </div>
          <div className="p-0">
            <div 
              dangerouslySetInnerHTML={{ __html: emailContent }}
              className="email-preview"
              style={{
                maxWidth: '100%',
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1.6'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
