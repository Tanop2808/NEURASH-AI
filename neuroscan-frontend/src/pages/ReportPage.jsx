import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { generateReport } from '../api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [generated, setGenerated] = useState(false);
  const reportRef = useRef();

  useEffect(() => {
    if (!state?.result) { navigate('/upload'); return; }
    setTimeout(() => setMounted(true), 100);
  }, []);

  if (!state?.result) return null;

  const { prediction, confidence, all_probabilities } = state.result;
  const imageUrl = state.imageUrl;
  const patient = JSON.parse(localStorage.getItem('patient') || '{}');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const probsAsDecimals = Object.fromEntries(
        Object.entries(all_probabilities).map(([k, v]) => [k, v / 100])
      );
      const res = await generateReport(prediction, confidence / 100, probsAsDecimals);
      setReport(res.report);
      setWebhookStatus(res.webhook);
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Report generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ── Colors ──
      const cyan = [0, 210, 200];
      const dark = [5, 8, 16];
      const white = [232, 240, 254];
      const muted = [120, 140, 160];
      const red = [255, 107, 107];
      const green = [0, 210, 200];

      // ── Background ──
      pdf.setFillColor(...dark);
      pdf.rect(0, 0, pageW, pageH, 'F');

      // ── Header bar ──
      pdf.setFillColor(8, 13, 26);
      pdf.rect(0, 0, pageW, 28, 'F');
      pdf.setDrawColor(...cyan);
      pdf.setLineWidth(0.5);
      pdf.line(0, 28, pageW, 28);

      // Logo circle
      pdf.setFillColor(...cyan);
      pdf.circle(margin + 5, 14, 5, 'F');
      pdf.setFillColor(...dark);
      pdf.circle(margin + 5, 14, 2.5, 'F');

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(...white);
      pdf.text('NEURASH AI', margin + 14, 12);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text('Advanced Brain MRI Analysis Platform', margin + 14, 18);

      // Date
      pdf.setFontSize(7);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin, 12, { align: 'right' });
      pdf.text('Model: Gemini 2.5 Flash + TensorFlow CNN', pageW - margin, 18, { align: 'right' });

      y = 38;

      // ── Section helper ──
      const sectionTitle = (title, color = cyan) => {
        pdf.setFillColor(color[0], color[1], color[2], 0.1);
        pdf.setDrawColor(...color);
        pdf.setLineWidth(0.3);
        pdf.line(margin, y, margin + 3, y);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...color);
        pdf.text(title.toUpperCase(), margin + 5, y + 0.5);
        y += 6;
        pdf.setDrawColor(...color, 0.2);
        pdf.setLineWidth(0.2);
        pdf.line(margin, y, pageW - margin, y);
        y += 4;
      };

      const box = (h, color = [15, 20, 35]) => {
        pdf.setFillColor(...color);
        pdf.roundedRect(margin, y, contentW, h, 2, 2, 'F');
      };

      // ── 1. Patient Information ──
      sectionTitle('Patient Information');
      box(28);
      const patFields = [
        ['Patient Name', patient.name || 'N/A'],
        ['Patient ID', patient.id || 'N/A'],
        ['Age', patient.age ? `${patient.age} years` : 'N/A'],
        ['Gender', patient.gender || 'N/A'],
        ['Email', patient.email || 'N/A'],
      ];
      const col1X = margin + 4;
      const col2X = margin + 50;
      const col3X = margin + 110;
      const col4X = margin + 160;

      pdf.setFontSize(7.5);
      patFields.slice(0, 2).forEach(([label, val], i) => {
        const x = i === 0 ? col1X : col3X;
        pdf.setTextColor(...muted);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, x, y + 6);
        pdf.setTextColor(...white);
        pdf.setFont('helvetica', 'bold');
        pdf.text(val, x, y + 11);
      });
      patFields.slice(2, 4).forEach(([label, val], i) => {
        const x = i === 0 ? col1X : col3X;
        pdf.setTextColor(...muted);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, x, y + 17);
        pdf.setTextColor(...white);
        pdf.setFont('helvetica', 'bold');
        pdf.text(val, x, y + 22);
      });
      pdf.setTextColor(...muted);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Email', col1X, y + 28);
      // wait we need to fix height
      y += 32;

      y += 6;

      // ── 2. Analysis Result ──
      const isTumor = prediction === 'Tumor';
      const resultColor = isTumor ? red : green;
      sectionTitle('Analysis Result', resultColor);
      box(32, [15, 20, 35]);

      // Status badge
      pdf.setFillColor(...resultColor);
      pdf.roundedRect(margin + 4, y + 4, 35, 8, 1, 1, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(...dark);
      pdf.text(isTumor ? 'CRITICAL FINDING' : 'CLEAR', margin + 21.5, y + 9, { align: 'center' });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(...resultColor);
      pdf.text(prediction, margin + 4, y + 22);

      // Confidence
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text('Confidence Score', pageW - margin - 50, y + 8);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(...resultColor);
      pdf.text(`${confidence.toFixed(1)}%`, pageW - margin - 50, y + 22);

      // Confidence bar
      pdf.setFillColor(20, 25, 40);
      pdf.roundedRect(pageW - margin - 50, y + 24, 48, 3, 1, 1, 'F');
      pdf.setFillColor(...resultColor);
      pdf.roundedRect(pageW - margin - 50, y + 24, 48 * (confidence / 100), 3, 1, 1, 'F');

      y += 38;
      y += 4;

      // ── 3. Probability Distribution ──
      sectionTitle('Technical Findings — Class Probabilities');
      const probEntries = Object.entries(all_probabilities);
      box(probEntries.length * 12 + 6, [15, 20, 35]);

      probEntries.forEach(([label, prob], i) => {
        const barY = y + 4 + i * 12;
        const barColor = label === 'Tumor' ? red : label === 'No Tumor' ? green : [255, 169, 77];
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...white);
        pdf.text(label, margin + 4, barY + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...barColor);
        pdf.text(`${prob.toFixed(2)}%`, pageW - margin - 4, barY + 5, { align: 'right' });
        // Bar bg
        pdf.setFillColor(20, 25, 40);
        pdf.roundedRect(margin + 45, barY, contentW - 55, 4, 1, 1, 'F');
        // Bar fill
        pdf.setFillColor(...barColor);
        const fillW = Math.max((contentW - 55) * (prob / 100), 0.5);
        pdf.roundedRect(margin + 45, barY, fillW, 4, 1, 1, 'F');
      });
      y += probEntries.length * 12 + 10;
      y += 4;

      // ── 4. MRI Scan Image ──
      if (imageUrl) {
        sectionTitle('MRI Scan Image');
        try {
          const imgH = 55;
          box(imgH + 4, [15, 20, 35]);
          pdf.addImage(imageUrl, 'JPEG', margin + contentW / 2 - 35, y + 2, 70, imgH, '', 'FAST');
          y += imgH + 8;
        } catch (e) {
          y += 4;
        }
        y += 4;
      }

      // ── 5. AI Medical Report ──
      if (report) {
        // New page if needed
        if (y > 200) {
          pdf.addPage();
          pdf.setFillColor(...dark);
          pdf.rect(0, 0, pageW, pageH, 'F');
          y = margin;
        }
        sectionTitle('AI Medical Report — Gemini Analysis');
        const parseReport = (text) => {
          const sections = [];
          const lines = text.split('\n').filter(l => l.trim());
          let current = null;
          for (const line of lines) {
            const headerMatch = line.match(/^\*\*(.+?)\*\*:?$/) || line.match(/^#+\s+(.+)/);
            if (headerMatch) {
              if (current) sections.push(current);
              current = { title: headerMatch[1].replace(/\*\*/g, '').replace(/:$/, '').trim(), content: [] };
            } else if (current) {
              const clean = line.replace(/\*\*/g, '').replace(/^\*\s*/, '').trim();
              if (clean) current.content.push(clean);
            } else {
              if (!current) current = { title: '', content: [] };
              current.content.push(line.replace(/\*\*/g, '').trim());
            }
          }
          if (current) sections.push(current);
          return sections.filter(s => s.content.length > 0);
        };

        const sections = parseReport(report);
        sections.forEach(section => {
          if (y > pageH - 30) {
            pdf.addPage();
            pdf.setFillColor(...dark);
            pdf.rect(0, 0, pageW, pageH, 'F');
            y = margin;
          }
          if (section.title) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(...cyan);
            pdf.text(section.title.toUpperCase(), margin + 2, y);
            y += 5;
          }
          section.content.forEach(line => {
            if (y > pageH - 20) {
              pdf.addPage();
              pdf.setFillColor(...dark);
              pdf.rect(0, 0, pageW, pageH, 'F');
              y = margin;
            }
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7.5);
            pdf.setTextColor(...white);
            const wrapped = pdf.splitTextToSize(line, contentW - 4);
            pdf.text(wrapped, margin + 2, y);
            y += wrapped.length * 4.5;
          });
          y += 4;
        });
      }

      // ── 6. Technical Information ──
      if (y > pageH - 50) {
        pdf.addPage();
        pdf.setFillColor(...dark);
        pdf.rect(0, 0, pageW, pageH, 'F');
        y = margin;
      }
      y += 2;
      sectionTitle('Technical Information');
      box(36, [15, 20, 35]);
      const techInfo = [
        ['AI Model', 'TensorFlow CNN (brain_tumor_model.h5)'],
        ['Image Processing', 'Grayscale, 128×128px normalization'],
        ['Classification Classes', 'No Tumor / Tumor / Unsupported Image'],
        ['Report Generator', 'Google Gemini 2.5 Flash'],
        ['Backend Framework', 'Flask + PyJWT Authentication'],
        ['Platform', 'NEURASH AI v1.0'],
      ];
      techInfo.forEach(([label, val], i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const tx = col === 0 ? margin + 4 : margin + contentW / 2 + 4;
        const ty = y + 5 + row * 11;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(...muted);
        pdf.text(label, tx, ty);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...white);
        pdf.text(val, tx, ty + 5);
      });
      y += 42;

      // ── Footer ──
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(8, 13, 26);
        pdf.rect(0, pageH - 12, pageW, 12, 'F');
        pdf.setDrawColor(...cyan);
        pdf.setLineWidth(0.3);
        pdf.line(0, pageH - 12, pageW, pageH - 12);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(...muted);
        pdf.text('⚠ Medical Disclaimer: AI-generated report for informational purposes only. Not a substitute for professional medical advice.', margin, pageH - 6);
        pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' });
      }

      const patientName = patient.name ? patient.name.replace(/\s+/g, '_') : 'Patient';
      pdf.save(`NEURASH_Report_${patientName}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const isTumor = prediction === 'Tumor';
  const statusColor = isTumor ? '#ff6b6b' : prediction === 'Unsupported Image' ? '#ffa94d' : '#00d2c8';

  const parseReport = (text) => {
    const sections = [];
    const lines = text.split('\n').filter(l => l.trim());
    let current = null;
    for (const line of lines) {
      const headerMatch = line.match(/^\*\*(.+?)\*\*:?$/) || line.match(/^#+\s+(.+)/);
      if (headerMatch) {
        if (current) sections.push(current);
        current = { title: headerMatch[1].replace(/\*\*/g, '').replace(/:$/, '').trim(), content: [] };
      } else if (current) {
        const clean = line.replace(/\*\*/g, '').replace(/^\*\s*/, '').trim();
        if (clean) current.content.push(clean);
      } else {
        if (!current) current = { title: '', content: [] };
        current.content.push(line.replace(/\*\*/g, '').trim());
      }
    }
    if (current) sections.push(current);
    return sections.filter(s => s.content.length > 0);
  };

  const sections = report ? parseReport(report) : [];

  return (
    <div className="min-h-screen relative z-10 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className={`mb-8 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <span className="badge mb-3 inline-block" style={{ background: 'rgba(0,210,200,0.1)', color: '#00d2c8', border: '1px solid rgba(0,210,200,0.2)' }}>
            Step 3 of 3 · Gemini AI Report
          </span>
          <h1 className="text-4xl font-bold mb-2">Medical Report</h1>
          <p style={{ color: 'rgba(232,240,254,0.45)' }}>AI-generated clinical analysis powered by Gemini</p>
        </div>

        <div className={`glass rounded-2xl p-5 mb-4 flex items-center gap-4 ${mounted ? 'animate-fadeInUp delay-1' : 'opacity-0'}`} style={{ border: `1px solid rgba(0,210,200,0.12)` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
            <span style={{ color: statusColor, fontSize: '1.3rem' }}>{isTumor ? '⚠️' : '✓'}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold" style={{ fontFamily: 'Syne', color: statusColor }}>{prediction}</span>
              <span className="text-xs" style={{ color: 'rgba(232,240,254,0.35)' }}>·</span>
              <span className="text-sm" style={{ color: 'rgba(232,240,254,0.5)' }}>{confidence.toFixed(1)}% confidence</span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(232,240,254,0.35)' }}>
              {isTumor ? 'Requires immediate specialist attention' : 'Routine follow-up recommended'}
            </p>
          </div>
          <button onClick={() => navigate('/results', { state })}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(232,240,254,0.5)', cursor: 'pointer', fontFamily: 'Syne' }}
          >
            ← Results
          </button>
        </div>

        {!generated ? (
          <div className={`glass rounded-2xl p-10 text-center ${mounted ? 'animate-fadeInUp delay-2' : 'opacity-0'}`} style={{ border: '1px solid rgba(0,210,200,0.1)' }}>
            <div className="w-20 h-20 rounded-2xl glass mx-auto mb-6 flex items-center justify-center animate-float" style={{ border: '1px solid rgba(0,210,200,0.2)' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18 6L20.5 13H28L22 17.5L24.5 24.5L18 20L11.5 24.5L14 17.5L8 13H15.5L18 6Z" stroke="#00d2c8" strokeWidth="1.5" fill="rgba(0,210,200,0.08)" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne' }}>Generate AI Report</h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(232,240,254,0.4)', maxWidth: 360, margin: '0 auto 2rem' }}>
              Gemini AI will analyze the scan results and generate a professional medical report
            </p>
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm mb-4 mx-auto max-w-sm animate-fadeIn" style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff8080' }}>
                {error}
              </div>
            )}
            <button onClick={handleGenerate} disabled={loading} className="btn-glow rounded-xl px-10 py-3.5 text-sm mx-auto" style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Generating with Gemini...
                </span>
              ) : '✨ Generate Medical Report'}
            </button>
          </div>
        ) : (
          <div className="animate-fadeInUp delay-2">
            {webhookStatus && (
              <div className="rounded-xl px-4 py-3 text-sm mb-4 flex items-center gap-2 animate-fadeIn" style={{
                background: webhookStatus.success ? 'rgba(0,210,200,0.08)' : 'rgba(255,169,77,0.08)',
                border: `1px solid ${webhookStatus.success ? 'rgba(0,210,200,0.2)' : 'rgba(255,169,77,0.2)'}`,
                color: webhookStatus.success ? '#00d2c8' : '#ffa94d'
              }}>
                <span>{webhookStatus.success ? '📧' : '⚠️'}</span>
                <span>{webhookStatus.success ? 'Report sent to email via n8n!' : `Webhook: ${webhookStatus.message}`}</span>
              </div>
            )}

            <div ref={reportRef} className="glass rounded-2xl p-6 mb-4" style={{ border: '1px solid rgba(0,210,200,0.1)' }}>
              <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid rgba(0,210,200,0.08)' }}>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(232,240,254,0.35)', fontFamily: 'Syne' }}>
                    NEURASH AI — Clinical Report
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(232,240,254,0.25)' }}>
                    Generated: {new Date().toLocaleString()} · Model: Gemini 2.5 Flash
                  </p>
                </div>
              </div>

              {/* Patient Info in report */}
              {patient.name && (
                <div className="mb-5 report-section">
                  <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#00d2c8', fontFamily: 'Syne' }}>Patient Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'rgba(232,240,254,0.6)' }}>
                    <span><span style={{ color: 'rgba(232,240,254,0.35)' }}>Name: </span>{patient.name}</span>
                    <span><span style={{ color: 'rgba(232,240,254,0.35)' }}>ID: </span>{patient.id}</span>
                    <span><span style={{ color: 'rgba(232,240,254,0.35)' }}>Age: </span>{patient.age} years</span>
                    <span><span style={{ color: 'rgba(232,240,254,0.35)' }}>Gender: </span>{patient.gender}</span>
                    <span><span style={{ color: 'rgba(232,240,254,0.35)' }}>Email: </span>{patient.email}</span>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {sections.length > 0 ? sections.map((section, i) => (
                  <div key={i} className="report-section animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                    {section.title && (
                      <h3 className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: '#00d2c8', fontFamily: 'Syne' }}>{section.title}</h3>
                    )}
                    {section.content.map((line, j) => (
                      <p key={j} className="text-sm leading-relaxed mb-1" style={{ color: 'rgba(232,240,254,0.75)' }}>{line}</p>
                    ))}
                  </div>
                )) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(232,240,254,0.75)' }}>{report}</p>
                )}
              </div>

              <div className="mt-6 rounded-xl px-4 py-3" style={{ background: 'rgba(255,169,77,0.05)', border: '1px solid rgba(255,169,77,0.12)' }}>
                <p className="text-xs" style={{ color: 'rgba(255,169,77,0.7)' }}>
                  ⚠️ <strong>Medical Disclaimer:</strong> This report is generated by AI for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setGenerated(false); setReport(''); setError(''); }}
                className="rounded-xl py-3.5 text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(232,240,254,0.7)', fontFamily: 'Syne', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                ↻ Regenerate
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-xl py-3.5 text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(0,210,200,0.1)',
                  border: '1px solid rgba(0,210,200,0.3)',
                  color: '#00d2c8',
                  fontFamily: 'Syne',
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  opacity: downloading ? 0.7 : 1
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,200,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,210,200,0.1)'}
              >
                {downloading ? '⏳ Downloading...' : '⬇ Download PDF'}
              </button>
              <button onClick={() => navigate('/upload')} className="btn-glow rounded-xl py-3.5 text-sm">
                New Scan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}