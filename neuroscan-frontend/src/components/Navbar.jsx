import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

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
    <nav 
      className="fixed left-0 top-0 z-50 flex flex-col justify-between h-full py-8 transition-all duration-300 ease-in-out" 
      style={{
        width: isHovered ? '256px' : '80px',
        borderRight: '1px solid rgba(0,210,200,0.08)',
        background: 'rgba(5,8,16,0.95)',
        backdropFilter: 'blur(20px)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col w-full px-4 overflow-hidden">
        {/* LOGO */}
        <div 
          className="flex items-center gap-3 cursor-pointer mb-8" 
          onClick={() => navigate('/upload')}
          style={{ paddingLeft: isHovered ? '8px' : '4px', transition: 'padding 0.3s' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{
            background: 'rgba(0,210,200,0.1)',
            border: '1px solid rgba(0,210,200,0.2)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#00d2c8" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="4" fill="rgba(0,210,200,0.2)" stroke="#00d2c8" strokeWidth="1"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#00d2c8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight whitespace-nowrap transition-opacity duration-300" style={{ fontFamily: 'Syne', opacity: isHovered ? 1 : 0 }}>
            NEURA<span style={{ color: '#00d2c8' }}>SH</span>
          </span>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex flex-col gap-3 w-full mt-4">
          {steps.map((step, i) => {
            const isActive = location.pathname === step.path;
            return (
              <button
                key={i}
                onClick={() => navigate(step.path)}
                className="nav-link flex items-center justify-between py-3 rounded-lg transition-all w-full text-left relative overflow-hidden"
                style={{
                  background: isActive ? 'rgba(0,210,200,0.08)' : 'transparent',
                  color: isActive ? '#00d2c8' : step.path === '/chat' ? 'rgba(0,210,200,0.6)' : 'rgba(232,240,254,0.35)',
                  border: isActive ? '1px solid rgba(0,210,200,0.15)' : step.path === '/chat' ? '1px solid rgba(0,210,200,0.15)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'Syne',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  paddingLeft: '14px',
                  paddingRight: '14px',
                }}
              >
                <div className="flex items-center gap-4">
                  <span style={{ opacity: 0.5, fontSize: '0.75rem', minWidth: '20px', textAlign: 'center' }}>{step.num}</span>
                  <span className="whitespace-nowrap transition-opacity duration-300" style={{ opacity: isHovered ? 1 : 0 }}>
                    {step.label}
                  </span>
                </div>
                {step.path === '/chat' && isHovered && (
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: '#00d2c8',
                    boxShadow: '0 0 6px #00d2c8',
                    display: 'inline-block',
                    flexShrink: 0
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="px-4">
        <button
          onClick={handleLogout}
          className="text-xs py-3 rounded-lg transition-all w-full flex items-center justify-center gap-2 overflow-hidden"
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="whitespace-nowrap transition-opacity duration-300" style={{ opacity: isHovered ? 1 : 0, width: isHovered ? 'auto' : 0 }}>
            {isHovered && "Logout"}
          </span>
        </button>
      </div>
    </nav>
  );
}