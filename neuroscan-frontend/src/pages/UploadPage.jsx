import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { predict } from '../api';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 85) { clearInterval(interval); return 85; }
        return p + Math.random() * 12;
      });
    }, 200);

    try {
      const data = await predict(file);
      clearInterval(interval);
      setScanProgress(100);
      setTimeout(() => {
        navigate('/results', { state: { result: data, imageUrl: preview } });
      }, 600);
    } catch (err) {
      clearInterval(interval);
      setScanProgress(0);
      setError(err.response?.data?.error || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 animate-fadeInUp delay-1">
          <span className="badge mb-3 inline-block" style={{ background: 'rgba(0,210,200,0.1)', color: '#00d2c8', border: '1px solid rgba(0,210,200,0.2)' }}>
            Step 1 of 3
          </span>
          <h1 className="text-4xl font-bold mb-2">Upload MRI Scan</h1>
          <p style={{ color: 'rgba(232,240,254,0.45)' }}>Upload a brain MRI image for AI-powered tumor detection</p>
        </div>

        <div
          className={`upload-zone rounded-2xl p-10 text-center cursor-pointer relative overflow-hidden animate-fadeInUp delay-2 ${dragging ? 'drag-over' : ''}`}
          style={{ background: 'rgba(255,255,255,0.02)' }}
          onClick={() => !loading && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {loading && (
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #00d2c8, transparent)',
              animation: 'scanline 1.5s linear infinite',
              boxShadow: '0 0 10px #00d2c8',
              zIndex: 10,
            }} />
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="MRI Preview"
                className="mx-auto rounded-xl mb-4 animate-fadeIn"
                style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain', filter: 'contrast(1.1) brightness(1.05)' }}
              />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{
                background: 'rgba(0,210,200,0.1)',
                border: '1px solid rgba(0,210,200,0.2)',
                color: '#00d2c8'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="#00d2c8" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                {file.name}
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(232,240,254,0.3)' }}>Click to change image</p>
            </div>
          ) : (
            <div className="py-6">
              <div className="w-20 h-20 rounded-2xl glass mx-auto mb-6 flex items-center justify-center animate-float" style={{ border: '1px solid rgba(0,210,200,0.2)' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M18 8v12M18 8l-4 4M18 8l4 4" stroke="#00d2c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 24v2a2 2 0 002 2h20a2 2 0 002-2v-2" stroke="rgba(0,210,200,0.5)" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="4" y="4" width="28" height="28" rx="6" stroke="rgba(0,210,200,0.1)" strokeWidth="1"/>
                </svg>
              </div>
              <p className="font-semibold mb-2" style={{ fontFamily: 'Syne', fontSize: '1.1rem' }}>Drop your MRI scan here</p>
              <p className="text-sm mb-4" style={{ color: 'rgba(232,240,254,0.4)' }}>or click to browse files</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {['JPG', 'PNG', 'JPEG', 'WEBP'].map(f => (
                  <span key={f} className="badge" style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(232,240,254,0.4)'
                  }}>{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-4 animate-fadeIn">
            <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(232,240,254,0.4)', fontFamily: 'Syne' }}>
              <span>Analyzing scan...</span>
              <span>{Math.round(scanProgress)}%</span>
            </div>
            <div className="rounded-full overflow-hidden h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="progress-bar h-full rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'rgba(232,240,254,0.3)' }}>
              Running neural network inference...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm animate-fadeIn" style={{
            background: 'rgba(255,80,80,0.08)',
            border: '1px solid rgba(255,80,80,0.2)',
            color: '#ff8080'
          }}>
            {error}
          </div>
        )}

        <div className="mt-6 animate-fadeInUp delay-3">
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="btn-glow w-full rounded-xl py-4 text-sm"
            style={{ opacity: (!file || loading) ? 0.5 : 1, cursor: (!file || loading) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Analyzing...' : 'Run AI Analysis →'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 animate-fadeInUp delay-4">
          {[
            { icon: '🧠', label: 'Deep Learning', sub: 'CNN Model' },
            { icon: '⚡', label: 'Fast Results', sub: '< 3 seconds' },
            { icon: '🎯', label: '3 Classes', sub: 'Tumor Detection' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-3 text-center" style={{ border: '1px solid rgba(0,210,200,0.08)' }}>
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs font-semibold" style={{ fontFamily: 'Syne' }}>{item.label}</div>
              <div className="text-xs" style={{ color: 'rgba(232,240,254,0.35)' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}