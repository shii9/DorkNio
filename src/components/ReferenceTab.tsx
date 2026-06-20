import { useState, useMemo } from 'react';
import { OPERATORS } from '../data/operators';

function sanitizeInput(val: string, maxLen: number): string {
  if (!val) return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip script protocol
    .slice(0, maxLen);
}

interface Props { onCopy: (s: string) => void; }

const CAT_LABELS: Record<string, { label: string; icon: string }> = {
  layer: { label: 'Layer Ops', icon: '🏷️' },
  scope: { label: 'Scope Ops', icon: '📡' },
  file: { label: 'File Ops', icon: '📄' },
  meta: { label: 'Meta Ops', icon: '⚙️' },
  boolean: { label: 'Logic', icon: '🧮' },
};

export default function ReferenceTab({ onCopy }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() =>
    OPERATORS.filter(op => {
      const matchSearch = !search ||
        op.operator.toLowerCase().includes(search.toLowerCase()) ||
        op.description.toLowerCase().includes(search.toLowerCase()) ||
        op.scans.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || op.category === filter;
      return matchSearch && matchFilter;
    }), [search, filter]);

  return (
    <div className="reference-layout fade-up">
      {/* HEADER SECTION */}
      <div className="page-hero" style={{ textAlign: 'left' }}>
        <div className="section-title" style={{ fontSize: '3.2rem', marginBottom: 12, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, animation: 'slideInUp 0.39s ease-out' }}>Operator <span style={{ color: 'var(--accent)' }}>Guideline</span></div>
        <div className="section-desc" style={{ fontSize: '1.1rem', color: 'var(--muted)', fontWeight: 400, animation: 'slideInUp 0.39s ease-out' }}>
          The complete technical guide to every Dorking operator — Complete search engine compatibility matrices.
        </div>
      </div>

      {/* QUICK OVERVIEW - TOP TWO */}
      <div className="overview-section" style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="glow-card" style={{ background: 'var(--s1)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.28s ease-out' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, fontSize: 60 }}>🔍</div>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>
             What is Dorking?
          </div>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, opacity: 0.9 }}>
            Think of Google Dorking as <strong>"Advanced Searching."</strong> By using special commands (operators), you can find hidden data that regular searches won't show—like exposed files, admin consoles, or specific technical details.
          </div>
        </div>

        <div className="glow-card" style={{ background: 'var(--s1)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', animation: 'slideInUp 0.28s ease-out' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, fontSize: 60 }}>⚙️</div>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>
             How it Works
          </div>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, opacity: 0.9 }}>
            You combine a <strong>Keyword</strong> with an <strong>Operator</strong> (like <code style={{ color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--mono)' }}>filetype:pdf</code>). This tells the search engine exactly what to find, filtering out billions of irrelevant pages.
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="search-bar-wrap" style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--s1)', padding: '6px 16px', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap', marginBottom: 14, animation: 'slideInUp 0.31s ease-out' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 16, opacity: 0.6, marginRight: 12 }}>🔍</span>
          <input className="form-input" placeholder="Search operators, descriptions, or syntax..." value={search} onChange={e => setSearch(sanitizeInput(e.target.value, 100))}
            style={{
              width: '100%',
              padding: '14px 0',
              fontSize: '16px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontFamily: 'var(--body)'
            }} />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`btn btn-xs ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: filter === 'all' ? 'var(--accent)' : 'var(--s1)',
              color: filter === 'all' ? 'var(--bg)' : 'var(--muted)',
              border: filter === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
              fontSize: 12
            }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              All
            </span>
          </button>
          {Object.entries(CAT_LABELS).map(([key, info]) => (
            <button key={key} className={`btn btn-xs ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: filter === key ? 'var(--accent)' : 'var(--s1)',
                color: filter === key ? 'var(--bg)' : 'var(--muted)',
                border: filter === key ? '1px solid var(--accent)' : '1px solid var(--border)',
                fontWeight: filter === key ? 700 : 400,
                fontSize: 12
              }}>
              {info.icon} {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* OPERATORS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((op) => (
          <div key={op.operator} className="op-field" style={{ margin: 0, padding: 18, borderRadius: '12px', background: 'var(--s2)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12, animation: `slideInUp 0.31s ease-out` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16, fontFamily: 'var(--mono)' }}>{op.operator}</div>
              <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: '4px', background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-bg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{op.category}</div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{op.description}</div>

            <div style={{
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--s3)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginTop: 'auto'
            }}>
              <div style={{
                color: 'var(--dim)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span>🔭</span> SCANS
              </div>
              <div style={{ width: 1, height: 12, background: 'var(--border)' }} />
              <div style={{ color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '11.5px' }}>
                {op.scans}
              </div>
            </div>

            <div onClick={() => onCopy(op.example)} style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '8px', background: 'var(--s1)', border: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 8 }} className="hover-accent">
              <span style={{ opacity: 0.5 }}>⚡</span>
              <span style={{ color: 'var(--accent)' }}>{op.example}</span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: op.googleSupport ? 'var(--green)' : 'var(--dim)' }} />
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>Google</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: op.bingSupport ? 'var(--green)' : 'var(--dim)' }} />
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>Bing</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ETHICAL GUIDELINE */}
      <div className="glow-card" style={{ marginBottom: 16, background: 'var(--accent-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--accent-bg)', cursor: 'default', animation: 'slideInUp 0.31s ease-out' }}>
        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🛡️</span> Ethical Usage
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
          Dorking is a powerful tool for researchers and developers. <strong>Always use it ethically.</strong> It is designed for finding publicly indexed information more efficiently, helping you audit your own security posture.
        </div>
      </div>

      {/* FOOTER TIPS SECTION */}
      <div className="card" style={{ padding: 24, background: 'var(--s2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Recon Avoidance: Common Mistakes</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[
            ['intitle:admin login', 'intitle:"admin login"', 'Multi-word values need quotes'],
            ['site: example.com', 'site:example.com', 'No space after operator colon'],
            ['filetype:.pdf', 'filetype:pdf', 'Extensions should not have dots'],
            ['OR', 'or', 'Syntax operators must be UPPERCASE'],
          ].map(([wrong, right, note], i) => (
            <div key={i} style={{ background: 'var(--s1)', padding: 16, borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ color: 'var(--red)', fontSize: 12, fontFamily: 'var(--mono)' }}>❌ {wrong}</div>
                <div style={{ color: 'var(--green)', fontSize: 12, fontFamily: 'var(--mono)' }}>✅ {right}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
