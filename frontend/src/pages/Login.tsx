import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-12">
      <div className="modern-card w-full max-w-2xl">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img 
              src="https://scontent-mxp2-1.xx.fbcdn.net/v/t39.30808-1/495378485_10235460410787652_8117124632259264711_n.jpg?stp=dst-jpg_s720x720_tt3&_nc_cat=110&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=PUuD01H58F8Q7kNvwGHQJ4b&_nc_oc=AdlPx--1P7zPEZC40lzczU2G2NVEAwANoCC6d7bdInas_GcLSFnG7kq6tPWwtQKibAU&_nc_zt=24&_nc_ht=scontent-mxp2-1.xx&_nc_gid=RtkqPdK1MoQ5nHb8hRe1uw&oh=00_AffBSJzHZPd_AL1hjUfIGwwwPq2vUVnPqZDuaz8EQRwUMA&oe=68E90103" 
              alt="IperMoney Logo" 
              className="h-24 w-auto rounded-2xl shadow-xl shadow-cyan-500/30"
            />
          </div>
          <h1 className="modern-title text-5xl mb-4 flex items-center justify-center gap-4">
            <span className="text-cyan-400">🚀</span>
            Benvenuto
          </h1>
          <p className="modern-text-muted text-xl">Accedi al sistema avanzato di lead generation</p>
          <div className="mt-6 flex justify-center gap-4">
            <span className="modern-badge modern-badge-info">Powered by AI</span>
            <span className="modern-badge modern-badge-success">Secure System</span>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-10">
          <div className="modern-form-group">
            <label className="modern-form-label flex items-center gap-3 mb-4">
              <span className="text-2xl">📧</span>
              <span className="text-lg">Email</span>
            </label>
            <input
              type="email"
              className="modern-input text-lg"
              placeholder="nome@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="modern-form-group">
            <label className="modern-form-label flex items-center gap-3 mb-4">
              <span className="text-2xl">🔒</span>
              <span className="text-lg">Password</span>
            </label>
            <input
              type="password"
              className="modern-input text-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="modern-badge modern-badge-error p-4 text-center">
              ⚠️ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="modern-btn modern-btn-primary w-full text-lg py-4"
          >
            {loading ? '⏳ Accesso in corso...' : '🚀 Accedi al Sistema'}
          </button>
        </form>
        
        <div className="mt-16 text-center">
          <p className="modern-text-muted text-base">
            Non hai un account?{' '}
            <a href="/landing" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold">
              Registrati qui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

