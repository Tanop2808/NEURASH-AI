import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatientPage() {
  const [form, setForm] = useState({
    name: '', id: '', age: '', email: '', gender: ''
  });
  const [error, setError] = useState('');
  const [mounted] = useState(true);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.id || !form.age || !form.email || !form.gender) {
      setError('Please fill in all fields.');
      return;
    }
    // Save patient info to localStorage
    localStorage.setItem('patient', JSON.stringify(form));
    navigate('/upload');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className={`mb-8 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <span className="badge mb-3 inline-block" style={{ background: 'rgba(0,210,200,0.1)', color: '#00d2c8', border: '1px solid rgba(0,210,200,0.2)' }}>
            Step 1 · Patient Details
          </span>
          <h1 className="text-4xl font-bold mb-2">Patient Information</h1>
          <p style={{ color: 'rgba(232,240,254,0.45)' }}>Enter patient details before proceeding to scan analysis</p>
        </div>

        {/* Card */}
        <div className={`glass rounded-2xl p-8 ${mounted ? 'animate-fadeInUp delay-1' : 'opacity-0'}`} style={{ border: '1px solid rgba(0,210,200,0.12)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name + ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.5)', fontFamily: 'Syne' }}>
                  Patient Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handle}
                  className="input-neo w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.5)', fontFamily: 'Syne' }}>
                  Patient ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={form.id}
                  onChange={handle}
                  className="input-neo w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="e.g. P-00123"
                />
              </div>
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.5)', fontFamily: 'Syne' }}>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handle}
                  className="input-neo w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="Years"
                  min="0"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.5)', fontFamily: 'Syne' }}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handle}
                  className="input-neo w-full rounded-xl px-4 py-3 text-sm"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="" style={{ background: '#080d1a' }}>Select gender</option>
                  <option value="Male" style={{ background: '#080d1a' }}>Male</option>
                  <option value="Female" style={{ background: '#080d1a' }}>Female</option>
                  <option value="Other" style={{ background: '#080d1a' }}>Other</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(232,240,254,0.5)', fontFamily: 'Syne' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                className="input-neo w-full rounded-xl px-4 py-3 text-sm"
                placeholder="patient@email.com"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm animate-fadeIn" style={{
                background: 'rgba(255,80,80,0.08)',
                border: '1px solid rgba(255,80,80,0.2)',
                color: '#ff8080'
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-glow w-full rounded-xl py-3.5 text-sm mt-2"
            >
              Continue to Scan Upload →
            </button>
          </form>
        </div>

        {/* Info */}
        <div className={`grid grid-cols-3 gap-3 mt-4 ${mounted ? 'animate-fadeInUp delay-2' : 'opacity-0'}`}>
          {[
            { icon: '🔒', label: 'Secure', sub: 'Data encrypted' },
            { icon: '📋', label: 'Required', sub: 'All fields needed' },
            { icon: '⚡', label: 'Quick', sub: 'Takes 30 seconds' },
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