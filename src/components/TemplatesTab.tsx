import { useState, useMemo } from 'react';
import { TEMPLATE_CATEGORIES } from '../data/templates';
import type { CustomTemplate } from '../types';

function sanitizeInput(val: string, maxLen: number): string {
  if (!val) return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip script protocol
    .slice(0, maxLen);
}

interface Props {
  onCopy: (text: string) => void;
  onUseInBuilder: (q: string, presetName?: string) => void;
  customTemplates: CustomTemplate[];
  onDeleteCustomTemplate: (id: string) => void;
}

function RiskBadge({ risk }: { risk: string }) {
  const color = risk === 'critical' ? 'var(--red)' : risk === 'high' ? 'var(--orange)' : risk === 'medium' ? 'var(--amber)' : 'var(--green)';
  return <span className={`risk risk-${risk}`} style={{ borderColor: color, color }}>{risk === 'critical' ? '🔴' : risk === 'high' ? '🟠' : risk === 'medium' ? '🟡' : '🟢'} {risk}</span>;
}

export default function TemplatesTab({ onCopy, onUseInBuilder, customTemplates, onDeleteCustomTemplate }: Props) {
  const [domain, setDomain] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fill = (q: string) => {
    const d = domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    return d ? q.replace(/\{domain\}/g, d) : q.replace(/site:\{domain\}\s*/g, '').replace(/\{domain\}/g, '[TARGET]');
  };

  const handleLoadTemplate = (query: string, presetName: string) => {
    // Fill the template with domain from TemplatesTab and send to builder
    onUseInBuilder(fill(query), presetName);
  };

  const toggle = (id: string) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleCopy = (q: string) => {
    onCopy(fill(q));
    setCopied(q);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleCopyAll = (dorks: typeof TEMPLATE_CATEGORIES[0]['dorks']) => {
    const allQueries = dorks.map(d => fill(d.query)).join('\n');
    navigator.clipboard.writeText(allQueries).then(() => {
      setCopied('__all__');
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return TEMPLATE_CATEGORIES.map(cat => {
      const catMatch = cat.name.toLowerCase().includes(term) || cat.description.toLowerCase().includes(term);
      const filteredDorks = cat.dorks.filter(d =>
        d.query.toLowerCase().includes(term) ||
        d.purpose.toLowerCase().includes(term)
      );

      if (catMatch) return cat;
      if (filteredDorks.length > 0) return { ...cat, dorks: filteredDorks };
      return null;
    }).filter(Boolean) as typeof TEMPLATE_CATEGORIES;
  }, [searchTerm]);

  const filteredCustom = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customTemplates.filter(tpl =>
      tpl.query.toLowerCase().includes(term) ||
      tpl.purpose.toLowerCase().includes(term)
    );
  }, [customTemplates, searchTerm]);

  return (
    <div className="templates-layout fade-up">
      <div className="page-hero">
        <div className="section-title" style={{ fontSize: '3.2rem', marginBottom: 12, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, animation: 'slideInUp 0.39s ease-out' }}>Pre-built <span style={{ color: 'var(--accent)' }}>Dork Library</span></div>
        <div className="section-desc" style={{ fontSize: '1.1rem', color: 'var(--muted)', fontWeight: 400, animation: 'slideInUp 0.39s ease-out' }}>Explore our curated collection of reconnaissance templates. Your domain is automatically injected into every query in the database.</div>
      </div>

      <div className="template-domain-bar" style={{ display: 'flex', gap: 0, alignItems: 'center', background: 'var(--s1)', padding: '0', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden', width: '100%', marginBottom: 14, animation: 'slideInUp 0.31s ease-out' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, borderRight: '1px solid var(--border)', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 20, pointerEvents: 'none', zIndex: 1 }}>🌐</span>
          <input className="form-input" style={{ border: 'none', outline: 'none', background: 'transparent', padding: '18px 24px 18px 60px', fontSize: '17px', width: '100%', borderRadius: '0', boxShadow: 'none' }} 
            placeholder="Target Domain (e.g. example.com)"
            value={domain} onChange={e => setDomain(sanitizeInput(e.target.value, 253))} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 20, pointerEvents: 'none', zIndex: 1 }}>🔍</span>
          <input className="form-input" style={{ border: 'none', outline: 'none', background: 'transparent', padding: '18px 24px 18px 60px', fontSize: '17px', width: '100%', borderRadius: '0', boxShadow: 'none' }} 
            placeholder="Filter templates by title or query..."
            value={searchTerm} onChange={e => setSearchTerm(sanitizeInput(e.target.value, 100))} />
        </div>
      </div>

      <div className="template-grid">
        {/* CUSTOM TEMPLATES SECTION */}
        {filteredCustom.length > 0 && (
          <div className="template-cat-card" style={{ borderColor: 'rgba(139,92,246,0.3)', animation: 'slideInUp 0.31s ease-out' }}>
            <div className="template-cat-header" onClick={() => toggle('custom')}
              style={{ borderBottomColor: 'rgba(139,92,246,0.2)' }}>
              <span className="template-cat-icon">⭐</span>
              <div className="template-cat-info">
                <div className="template-cat-name" style={{ color: 'var(--violet)' }}>My Stored Templates</div>
                <div className="template-cat-desc">{filteredCustom.length} custom dork{filteredCustom.length !== 1 ? 's' : ''} matching search</div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--violet)', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(139,92,246,0.3)' }}>
                CUSTOM
              </span>
              <span style={{ color: 'var(--text3)', fontSize: 16, marginLeft: 8 }}>
                {expanded.includes('custom') ? '▾' : '▸'}
              </span>
            </div>
            {expanded.includes('custom') && (
              <div className="template-cat-body">
                {filteredCustom.map(tpl => (
                  <div key={tpl.id} className="template-dork-item">
                    {tpl.name && <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '8px' }}>{tpl.name}</div>}
                    <div className="template-dork-query" onClick={() => handleCopy(tpl.query)}
                      style={{ cursor: 'pointer' }} title="Click to copy">
                      {tpl.query}
                    </div>
                    <div className="template-dork-footer">
                      <div className="template-dork-purpose" style={{ flex: 1 }}>{tpl.purpose}</div>
                      {tpl.risk && <RiskBadge risk={tpl.risk} />}
                      <button className="btn btn-secondary btn-xs" onClick={() => handleCopy(tpl.query)}>
                        {copied === tpl.query ? '✓' : '📋'} Copy
                      </button>
                      <button className="btn btn-ghost btn-xs" onClick={() => handleLoadTemplate(tpl.query, tpl.name || tpl.purpose || 'Custom Template')}>
                        Load ↗
                      </button>
                      <button className="btn btn-danger btn-xs" title="Delete template"
                        onClick={() => onDeleteCustomTemplate(tpl.id)}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRE-BUILT CATEGORIES */}
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="template-cat-card" style={{ animation: `slideInUp 0.31s ease-out` }}>
            <div className="template-cat-header" onClick={() => toggle(cat.id)}>
              <span className="template-cat-icon">{cat.icon}</span>
              <div className="template-cat-info">
                <div className="template-cat-name">{cat.name}</div>
                <div className="template-cat-desc">{cat.description}</div>
              </div>
              <span className="template-cat-count">{cat.dorks.length} queries</span>
              <span style={{ color: 'var(--text3)', fontSize: 16, marginLeft: 8 }}>
                {expanded.includes(cat.id) ? '▾' : '▸'}
              </span>
            </div>
            {expanded.includes(cat.id) && (
              <div className="template-cat-body">
                {cat.dorks.map(dork => (
                  <div key={dork.id} className="template-dork-item">
                    <div className="template-dork-query" onClick={() => handleCopy(dork.query)}
                      style={{ cursor: 'pointer' }} title="Click to copy">
                      {fill(dork.query)}
                    </div>
                    <div className="template-dork-footer">
                      <div className="template-dork-purpose">{dork.purpose}</div>
                      <RiskBadge risk={dork.risk} />
                      <button className="btn btn-secondary btn-xs" onClick={() => handleCopy(dork.query)}>
                        {copied === dork.query ? '✓' : '📋'} Copy
                      </button>
                      <button className="btn btn-ghost btn-xs" onClick={() => handleLoadTemplate(dork.query, dork.purpose || cat.name)} title="Load into Builder">
                        Load ↗
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopyAll(cat.dorks)}>
                  {copied === '__all__' ? '✓ Copied All!' : `📋 Copy All (${cat.dorks.length})`}
                </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
