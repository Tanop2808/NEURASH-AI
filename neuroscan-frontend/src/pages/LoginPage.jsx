import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
      <div className="absolute pointer-events-none" style={{
        width: 500, height: 500,
        border: '1px solid rgba(0,210,200,0.06)',
        borderRadius: '50%',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 700, height: 700,
        border: '1px solid rgba(0,210,200,0.04)',
        borderRadius: '50%',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
      }} />

      <div className="w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center animate-pulse-glow" style={{ border: '1px solid rgba(0,210,200,0.3)' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" stroke="#00d2c8" strokeWidth="1.5" fill="none"/>
                  <path d="M10 16c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z" stroke="#00d2c8" strokeWidth="1" fill="rgba(0,210,200,0.08)"/>
                  <path d="M16 10v2M16 20v2M10 16H8M24 16h-2" stroke="#00d2c8" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="16" cy="16" r="2" fill="#00d2c8"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" style={{ boxShadow: '0 0 8px #4ade80' }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: 'Syne' }}>
            NEURA<span style={{ color: '#00d2c8' }}>SH</span> AI
          </h1>
          <p style={{ color: 'rgba(232,240,254,0.45)', fontSize: '0.875rem' }}>
            Advanced Brain MRI Analysis Platform
          </p>
        </div>

        <div className="glass rounded-2xl p-8" style={{ border: '1px solid rgba(0,210,200,0.12)' }}>
          <div className="mb-6">
            <span className="badge" style={{ background: 'rgba(0,210,200,0.1)', color: '#00d2c8', border: '1px solid rgba(0,210,200,0.2)' }}>
              Secure Access
            </span>
            <h2 className="text-xl font-bold mt-3 mb-1">Welcome back</h2>
            <p style={{ color: 'rgba(232,240,254,0.45)', fontSize: '0.875rem' }}>Enter your credentials to access the platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.5)', fontFamily: 'Syne' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-neo w-full rounded-xl px-4 py-3 text-sm"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.5)', fontFamily: 'Syne' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-neo w-full rounded-xl px-4 py-3 text-sm"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm animate-fadeIn" style={{
                background: 'rgba(255,80,80,0.08)',
                border: '1px solid rgba(255,80,80,0.2)',
                color: '#ff8080'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full rounded-xl py-3.5 text-sm mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Access Platform →'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(232,240,254,0.25)' }}>
          NEURASH AI · Powered by TensorFlow + Gemini
        </p>
      </div>
    </div>
  );
}