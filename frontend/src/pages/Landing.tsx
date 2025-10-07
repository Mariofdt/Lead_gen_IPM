import { useState } from 'react';

export default function Landing() {
  const [form, setForm] = useState({ company_name: '', contact_person: '', email: '', phone: '', city: '', message: '' });
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    const res = await fetch('http://localhost:4000/api/public/interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) setOk('Grazie, vi contatteremo a breve.');
  }

  return (
    <div className="mx-8 mt-8">
      <div className="max-w-xl mx-auto hud-card p-8">
        <h1 className="text-2xl font-semibold mb-4 hud-glow-text text-center">IperMoney POS - Partnership White Label</h1>
        <p className="text-sm hud-text-secondary mb-6 text-center">Compila il modulo per ricevere maggiori informazioni.</p>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3">
          {['company_name','contact_person','email','phone','city'].map((k) => (
            <input key={k} placeholder={k.replace('_',' ')} className="hud-input" value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k!=='phone'} />
          ))}
          <textarea placeholder="messaggio" className="hud-input min-h-[120px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <div className="flex gap-1">
            <button className="hud-btn hud-btn-primary flex-1">Invia</button>
          </div>
          {ok && <div className="text-green-400 hud-glow-text text-sm text-center">{ok}</div>}
        </form>
      </div>
    </div>
  );
}

