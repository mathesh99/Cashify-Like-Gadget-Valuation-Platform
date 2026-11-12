import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_API = 'http://localhost:3000/api/admin';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('adminToken')) navigate('/admin/dashboard');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div style={s.root}>
      <div style={s.glow1} />
      <div style={s.glow2} />
      <div style={s.split}>
        {/* Left decorative panel */}
        <div style={s.leftPanel}>
          <div style={s.orb} />
          <div style={s.leftContent}>
            <div style={s.bigIcon}>⚡</div>
            <h2 style={s.leftTitle}>Cell Master Pro Admin</h2>
            <p style={s.leftSub}>Manage your entire mobile phone catalog, brands, and inventory from one powerful dashboard.</p>
            <div style={s.featureList}>
              {['📱 Add & manage mobile brands', '🖼️ Upload product images', '📊 Track platform stats', '🗑️ Full product CRUD'].map((f, i) => (
                <div key={i} style={s.featureItem}><span style={s.featureCheck}>✓</span>{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div style={s.rightPanel}>
          <div style={s.card}>
            <div style={s.badge}>🔐 ADMIN PORTAL</div>
            <h1 style={s.title}>Welcome Back</h1>
            <p style={s.subtitle}>Sign in to access the owner dashboard.</p>

            {error && <div style={s.errorBox}>⚠ {error}</div>}

            <form onSubmit={handleLogin}>
              <div style={s.inputGroup}>
                <label style={s.label}>Admin Email</label>
                <input
                  type="email"
                  style={s.input}
                  placeholder="Enter Admin Email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Password</label>
                <input
                  type="password"
                  style={s.input}
                  placeholder="Enter Admin Password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
                {loading ? (
                  <span style={s.spinner}>⟳ Signing in...</span>
                ) : 'Access Dashboard →'}
              </button>
            </form>

            <div style={s.hint}>
              <span style={s.hintBadge}>Default credentials</span>
              <code style={s.hintCode}>admin@cellmasterpro.com / admin@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflow: 'hidden', display: 'flex' },
  glow1: { position: 'fixed', top: '-20%', left: '-10%', width: '55%', height: '55%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none' },
  glow2: { position: 'fixed', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' },
  split: { display: 'flex', width: '100%', minHeight: '100vh' },
  leftPanel: { flex: 1, background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(236,72,153,0.04) 100%)', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', position: 'relative', overflow: 'hidden' },
  orb: { position: 'absolute', top: '10%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' },
  leftContent: { position: 'relative', zIndex: 1, maxWidth: '400px' },
  bigIcon: { fontSize: '4rem', marginBottom: '1.5rem' },
  leftTitle: { fontSize: '3rem', fontWeight: 900, margin: '0 0 1rem', background: 'linear-gradient(135deg, #0f172a, #7c3aed)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: '-1.5px' },
  leftSub: { color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '0.9rem' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#334155', fontSize: '1rem' },
  featureCheck: { width: '22px', height: '22px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#7c3aed', flexShrink: 0 },
  rightPanel: { width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' },
  card: { width: '100%', maxWidth: '420px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' },
  badge: { display: 'inline-block', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '50px', padding: '0.35rem 1rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', color: '#7c3aed', marginBottom: '1.5rem' },
  title: { fontSize: '2.6rem', fontWeight: 900, margin: '0 0 0.5rem', color: '#0f172a', letterSpacing: '-1px' },
  subtitle: { color: '#64748b', fontSize: '1rem', margin: '0 0 2rem' },
  errorBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.9rem' },
  inputGroup: { marginBottom: '1.4rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.88rem', color: '#334155', fontWeight: 600 },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.9rem 1.2rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' },
  btn: { width: '100%', padding: '1.05rem', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem', transition: 'all 0.3s', boxShadow: '0 8px 25px rgba(124,58,237,0.25)', letterSpacing: '0.3px' },
  spinner: { display: 'inline-block', animation: 'spin 1s linear infinite' },
  hint: { marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' },
  hintBadge: { fontSize: '0.72rem', fontWeight: 600, letterSpacing: '1px', color: '#64748b', textTransform: 'uppercase' },
  hintCode: { fontSize: '0.82rem', color: '#475569', background: '#f1f5f9', padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace' },
};