import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isLoggedIn = !!localStorage.getItem('token');
  if (!isLoggedIn) return null;

  const steps = [
    { path: '/patient', label: 'Patient', num: '01' },
    { path: '/upload', label: 'Upload', num: '02' },
    { path: '/results', label: 'Results', num: '03' },
    { path: '/report', label: 'Report', num: '04' },
    { path: '/chat', label: 'Chat', num: '05' },
  ];

  return (
    <nav className="relative z-20 px-6 py-4 flex items-center justify-between" style={{
      borderBottom: '1px solid rgba(0,210,200,0.08)',
      background: 'rgba(5,8,16,0.8)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
    }}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/upload')}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
          background: 'rgba(0,210,200,0.1)',
          border: '1px solid rgba(0,210,200,0.2)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#00d2c8" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="4" fill="rgba(0,210,200,0.2)" stroke="#00d2c8" strokeWidth="1"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#00d2c8" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-bold text-sm tracking-tight" style={{ fontFamily: 'Syne' }}>
          NEURA<span style={{ color: '#00d2c8' }}>SH</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {steps.map((step, i) => {
          const isActive = location.pathname === step.path;
          return (
            <div key={i} className="flex items-center gap-1">
              <button
                onClick={() => navigate(step.path)}
                className="nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: isActive ? 'rgba(0,210,200,0.08)' : 'transparent',
                  color: isActive ? '#00d2c8' : step.path === '/chat' ? 'rgba(0,210,200,0.6)' : 'rgba(232,240,254,0.35)',
                  border: isActive ? '1px solid rgba(0,210,200,0.15)' : step.path === '/chat' ? '1px solid rgba(0,210,200,0.15)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'Syne',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}
              >
                <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>{step.num}</span>
                {step.label}
                {step.path === '/chat' && (
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: '#00d2c8',
                    boxShadow: '0 0 6px #00d2c8',
                    display: 'inline-block'
                  }} />
                )}
              </button>
              {i < steps.length - 1 && (
                <span style={{ color: 'rgba(232,240,254,0.15)', fontSize: '0.7rem' }}>›</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        className="text-xs px-3 py-1.5 rounded-lg transition-all"
        style={{
          background: 'rgba(255,80,80,0.06)',
          border: '1px solid rgba(255,80,80,0.15)',
          color: 'rgba(255,120,120,0.7)',
          cursor: 'pointer',
          fontFamily: 'Syne',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,80,80,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,80,80,0.06)'}
      >
        Logout
      </button>
    </nav>
  );
}