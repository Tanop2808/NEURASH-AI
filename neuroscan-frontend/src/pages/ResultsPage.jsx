import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!state?.result) { navigate('/upload'); return; }
    setTimeout(() => setMounted(true), 100);
  }, []);

  if (!state?.result) return null;

  const { prediction, confidence, all_probabilities } = state.result;
  const imageUrl = state.imageUrl;

  const isTumor = prediction === 'Tumor';
  const isUnsupported = prediction === 'Unsupported Image';
  const statusColor = isTumor ? '#ff6b6b' : isUnsupported ? '#ffa94d' : '#00d2c8';
  const statusBorder = isTumor ? 'rgba(255,107,107,0.2)' : isUnsupported ? 'rgba(255,169,77,0.2)' : 'rgba(0,210,200,0.2)';
  const statusBg = isTumor ? 'rgba(255,107,107,0.08)' : isUnsupported ? 'rgba(255,169,77,0.08)' : 'rgba(0,210,200,0.08)';

  return (
    <div className="min-h-screen relative z-10 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className={`mb-8 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <span className="badge mb-3 inline-block" style={{ background: 'rgba(0,210,200,0.1)', color: '#00d2c8', border: '1px solid rgba(0,210,200,0.2)' }}>
            Step 2 of 3 · Analysis Complete
          </span>
          <h1 className="text-4xl font-bold mb-2">Scan Results</h1>
          <p style={{ color: 'rgba(232,240,254,0.45)' }}>AI-powered neural network analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className={`glass rounded-2xl p-4 ${mounted ? 'animate-fadeInUp delay-1' : 'opacity-0'}`} style={{ border: '1px solid rgba(0,210,200,0.1)' }}>
            <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.4)', fontFamily: 'Syne' }}>Input Scan</p>
            {imageUrl ? (
              <img src={imageUrl} alt="MRI Scan" className="w-full rounded-xl"
                style={{ maxHeight: 240, objectFit: 'contain', filter: 'contrast(1.1) brightness(1.05)' }}
              />
            ) : (
              <div className="w-full h-48 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <span style={{ color: 'rgba(232,240,254,0.2)' }}>No preview</span>
              </div>
            )}
          </div>

          <div className={`glass rounded-2xl p-6 flex flex-col justify-between ${mounted ? 'animate-fadeInUp delay-2' : 'opacity-0'}`} style={{ border: `1px solid ${statusBorder}` }}>
            <div>
              <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.4)', fontFamily: 'Syne' }}>Diagnosis</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4" style={{
                background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block', boxShadow: `0 0 6px ${statusColor}` }}/>
                {isTumor ? 'Critical Finding' : isUnsupported ? 'Image Issue' : 'Clear'}
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: statusColor, fontFamily: 'Syne' }}>
                {prediction}
              </h2>
              <p className="text-sm" style={{ color: 'rgba(232,240,254,0.45)' }}>
                {isTumor ? 'Tumor detected. Please consult a specialist immediately.'
                  : isUnsupported ? 'Image quality insufficient for reliable analysis.'
                  : 'No tumor detected in the provided MRI scan.'}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.4)', fontFamily: 'Syne' }}>Confidence</span>
                <span className="text-2xl font-bold" style={{ color: statusColor, fontFamily: 'Syne' }}>{confidence.toFixed(1)}%</span>
              </div>
              <div className="rounded-full overflow-hidden h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  width: mounted ? `${confidence}%` : '0%',
                  height: '100%',
                  background: `linear-gradient(90deg, ${statusColor}, ${statusColor}aa)`,
                  boxShadow: `0 0 10px ${statusColor}66`,
                  borderRadius: 'inherit',
                  transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)'
                }} />
              </div>
            </div>
          </div>
        </div>

        <div className={`glass rounded-2xl p-6 mb-4 ${mounted ? 'animate-fadeInUp delay-3' : 'opacity-0'}`} style={{ border: '1px solid rgba(0,210,200,0.1)' }}>
          <p className="text-xs font-semibold mb-5 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.4)', fontFamily: 'Syne' }}>
            Class Probability Distribution
          </p>
          <div className="space-y-4">
            {Object.entries(all_probabilities).map(([label, prob]) => {
              const isActive = label === prediction;
              const barColor = label === 'Tumor' ? '#ff6b6b' : label === 'No Tumor' ? '#00d2c8' : '#ffa94d';
              return (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium flex items-center gap-2" style={{ fontFamily: 'Syne' }}>
                      {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: barColor, display: 'inline-block', boxShadow: `0 0 6px ${barColor}` }}/>}
                      {label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: barColor, fontFamily: 'Syne' }}>{prob.toFixed(2)}%</span>
                  </div>
                  <div className="rounded-full overflow-hidden h-1.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{
                      width: mounted ? `${prob}%` : '0%',
                      height: '100%',
                      background: `linear-gradient(90deg, ${barColor}, ${barColor}88)`,
                      boxShadow: isActive ? `0 0 8px ${barColor}66` : 'none',
                      borderRadius: 'inherit',
                      transition: `width 1.5s cubic-bezier(0.16,1,0.3,1) ${Object.keys(all_probabilities).indexOf(label) * 0.1}s`
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-3 ${mounted ? 'animate-fadeInUp delay-4' : 'opacity-0'}`}>
          <button onClick={() => navigate('/upload')}
            className="rounded-xl py-3.5 text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(232,240,254,0.7)', fontFamily: 'Syne', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            ← New Scan
          </button>
          <button onClick={() => navigate('/report', { state: { result: state.result, imageUrl } })}
            className="btn-glow rounded-xl py-3.5 text-sm"
          >
            Generate Report →
          </button>
        </div>
      </div>
    </div>
  );
}