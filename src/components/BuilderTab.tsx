import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { BuilderInputs, GeneratedQuery, RiskLevel } from '../types';
import { getSearchUrl } from '../engine/queryEngine';
import { SEARCH_GOALS } from '../data/operators';
import TagInput from './TagInput';

interface Props {
  inputs: BuilderInputs;
  query: GeneratedQuery | null;
  onInputChange: <K extends keyof BuilderInputs>(key: K, val: BuilderInputs[K]) => void;
  onBuild: () => void;
  onReset: () => void;
  onCopy: (s: string) => void;
  onSave: (q: GeneratedQuery, origin?: 'build' | 'execute' | 'copy') => void;
  onStoreTemplate: (query: string, name: string, purpose: string, risk: RiskLevel) => void;
}

function TokenSpan({ text, type }: { text: string; type: string }) {
  return <span className={`token-${type}`}>{text}</span>;
}

function RiskBadge({ risk }: { risk: string }) {
  return <span className={`risk risk-${risk}`}>{risk === 'critical' ? '🔴' : risk === 'high' ? '🟠' : risk === 'medium' ? '🟡' : '🟢'} {risk}</span>;
}

function CustomSelect({ value, onChange, options }: { value: string; onChange: (val: any) => void; options: { value: string; label: string; icon: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--s2)',
          border: '1px solid var(--border)',
          padding: '0 16px',
          fontSize: '15px',
          height: '52px',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ marginLeft: '3px' }}>{selected.icon}</span>
          <span style={{ fontWeight: 500 }}>{selected.label}</span>
        </div>
        <div style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg) translate(1px, 1px)' : 'rotate(0) translate(-1px, -1px)', display: 'flex', alignItems: 'center', opacity: 0.5 }}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--s1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 1001,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: value === opt.value ? 'var(--accent-bg)' : 'transparent',
                  color: value === opt.value ? 'var(--accent)' : 'var(--text)',
                  borderBottom: '1px solid var(--border)'
                }}
                className="custom-select-option"
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BuilderTab({ inputs, query, onInputChange, onBuild: _onBuild, onReset, onCopy, onSave, onStoreTemplate }: Props) {
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplPurpose, setTplPurpose] = useState('');
  const [tplRisk, setTplRisk] = useState<RiskLevel>('low');

  const handleStoreTemplate = () => {
    if (!query?.raw) return;
    const name = tplName.trim() || `Query — ${inputs.searchGoal}`;
    const purpose = tplPurpose.trim() || `Custom ${inputs.searchGoal.replace(/-/g, ' ')} dork`;
    onStoreTemplate(query.raw, name, purpose, tplRisk);
    setShowStoreModal(false);
    setTplName('');
    setTplPurpose('');
    setTplRisk('low');
  };

  const openStoreAt = () => {
    setTplName('');
    setTplPurpose('');
    setShowStoreModal(true);
  };

  const closeStoreModal = () => {
    setShowStoreModal(false);
  };

  useEffect(() => {
    // lock background scroll when modal open
    if (showStoreModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return;
  }, [showStoreModal]);

  return (
    <div className="builder-layout">
      {/* HERO SECTION */}
      <div className="page-hero">
        <div className="section-title" style={{ fontSize: '3.2rem', marginBottom: 12, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, animation: 'slideInUp 0.39s ease-out', color: 'var(--text)' }}>Build Advanced <span style={{ color: 'var(--accent)' }}>Dork Queries</span></div>
        <div className="section-desc" style={{ fontSize: '1.1rem', color: 'var(--muted)', fontWeight: 400, animation: 'slideInUp 0.39s ease-out' }}>Construct high-precision Google Dorks for professional reconnaissance without memorizing technical syntax.</div>
      </div>

      <div className="builder-studio">
        {/* LEFT COLUMN: BUILDER CONFIGURATION */}
        <div className="builder-inputs-col" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="card" style={{ padding: 32, animation: 'slideInUp 0.31s ease-out' }}>
            <div className="section-header" style={{ marginTop: 0 }}>
              <div className="section-badge">01</div>
              <div className="section-title">Target Parameters</div>
            </div>

            <div className="target-params-grid" style={{ display: 'grid', gap: 24, marginBottom: 24 }}>
              <div className="form-group" style={{ marginBottom: 0, animation: 'slideInUp 0.28s ease-out' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, color: 'var(--muted)' }}>
                  <span style={{ fontSize: '1.2em' }}>🌐</span> Domain
                </label>
                <div className="form-label-hint">Scope search to a specific host</div>
                <input className="form-input" style={{ background: 'var(--s2)', border: '1px solid var(--border)', padding: '0 16px', fontSize: '15px', borderRadius: '12px', height: '52px' }} placeholder="example.com" value={inputs.domain}
                  onChange={e => onInputChange('domain', e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0, animation: 'slideInUp 0.28s ease-out' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, color: 'var(--muted)' }}>
                  <span style={{ fontSize: '1.2em' }}>🎯</span> Search Goal
                </label>
                <div className="form-label-hint">Select your primary recon objective</div>
                <CustomSelect
                  value={inputs.searchGoal}
                  onChange={v => onInputChange('searchGoal', v)}
                  options={SEARCH_GOALS}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0, animation: 'slideInUp 0.28s ease-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--muted)', fontSize: '11px' }}>
                      <span style={{ fontSize: '1.2em' }}>🔍</span> ENGINE
                    </label>
                    <div style={{ background: 'var(--s2)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: 14, height: '52px', alignItems: 'center', justifyContent: 'center' }}>
                      {(['google', 'bing'] as const).map(e => (
                        <label key={e} className="checkbox-item" style={{ fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <input type="checkbox" checked={inputs.searchEngines.includes(e)}
                            onChange={(ev) => {
                              const next = ev.target.checked
                                ? [...inputs.searchEngines, e]
                                : inputs.searchEngines.filter(x => x !== e);
                              onInputChange('searchEngines', next.length ? next : ['google']);
                            }} />
                          {e.charAt(0).toUpperCase() + e.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--muted)', fontSize: '11px' }}>
                      <span style={{ fontSize: '1.2em' }}>📡</span> SCOPE
                    </label>
                    <div style={{ background: 'var(--s2)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: 10, height: '52px', alignItems: 'center', justifyContent: 'center' }}>
                      <label className="checkbox-item" style={{ fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" checked={inputs.includeSubdomains}
                          onChange={e => onInputChange('includeSubdomains', e.target.checked)} />
                        Subdomains
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0, animation: 'slideInUp 0.28s ease-out' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--muted)', fontSize: '11px' }}>
                  <span style={{ fontSize: '1.2em' }}>⚙️</span> OPTIONS
                </label>
                <div style={{ background: 'var(--s2)', padding: '0 16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: 24, height: '52px', alignItems: 'center', width: '100%' }}>
                  <label className="checkbox-item" style={{ fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={inputs.useCache}
                      onChange={e => {
                        onInputChange('useCache', e.target.checked);
                        if (e.target.checked) {
                          onInputChange('useInfo', false);
                          onInputChange('useRelated', false);
                        }
                      }} />
                    Cache
                  </label>
                  <label className="checkbox-item" style={{ fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={inputs.useInfo}
                      onChange={e => {
                        onInputChange('useInfo', e.target.checked);
                        if (e.target.checked) {
                          onInputChange('useCache', false);
                          onInputChange('useRelated', false);
                        }
                      }} />
                    Info
                  </label>
                  <label className="checkbox-item" style={{ fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={inputs.useRelated}
                      onChange={e => {
                        onInputChange('useRelated', e.target.checked);
                        if (e.target.checked) {
                          onInputChange('useCache', false);
                          onInputChange('useInfo', false);
                        }
                      }} />
                    Related
                  </label>
                </div>
              </div>
            </div>

            <div className="section-header">
              <div className="section-badge">02</div>
              <div className="section-title">Dork Operators</div>
            </div>

            <div className="operators-grid" style={{ display: 'grid', gap: 16 }}>
              {/* MODULE: SCOPE */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>📡</span> SITE / DOMAIN SCOPE
                </div>
                <div className="form-label-hint">Target specific domain surface</div>
                <input className="form-input premium-input-mono" style={{ borderRadius: '8px', borderColor: 'var(--border)', height: '52px', padding: '0 16px', fontSize: '15px' }} placeholder="example.com" value={inputs.domain}
                  onChange={e => onInputChange('domain', e.target.value)} />
              </div>

              {/* MODULE: EXCLUDE SUBDOMAINS */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🚫</span> EXCLUDE SUBDOMAINS
                </div>
                <div className="form-label-hint">Exclude specific subdomains (e.g. static, blog)</div>
                <TagInput value={inputs.excludeSubdomains || []} onChange={v => onInputChange('excludeSubdomains', v)}
                  placeholder="static, assets, dev..." color="var(--accent-primary)" />
              </div>

              {/* MODULE: TITLE */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🏷️</span> INTITLE: KEYWORDS
                </div>
                <div className="form-label-hint">Filter by page title tags</div>
                <TagInput value={inputs.titleKeywords} onChange={v => onInputChange('titleKeywords', v)}
                  placeholder="admin, login, dashboard..." color="var(--accent-primary)" />
              </div>

              {/* MODULE: URL */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🔗</span> INURL: PATH / PATTERN
                </div>
                <div className="form-label-hint">Scan for URL path patterns</div>
                {/* Use TagInput so users can type multiple URL patterns and press Enter to add them, similar to INTITLE */}
                <TagInput value={inputs.urlPattern ? inputs.urlPattern.split(' ').filter(Boolean) : []}
                  onChange={v => onInputChange('urlPattern', v.join(' '))}
                  placeholder="admin, login, /api" color="var(--accent-primary)" />
              </div>

              {/* MODULE: URL PARAMETERS */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🧩</span> INURL: PARAMETER NAMES
                </div>
                <div className="form-label-hint">Scan for active URL parameters (e.g. id, token)</div>
                <TagInput value={inputs.paramNames || []} onChange={v => onInputChange('paramNames', v)}
                  placeholder="id, token, redirect..." color="var(--accent-primary)" />
              </div>

              {/* MODULE: TEXT */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>📝</span> INTEXT: BODY KEYWORDS
                </div>
                <div className="form-label-hint">Search visible body content</div>
                <TagInput value={inputs.bodyKeywords} onChange={v => onInputChange('bodyKeywords', v)}
                  placeholder="password, DB_PASSWORD..." color="var(--accent-primary)" />
              </div>

              {/* MODULE: PHRASES */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>💬</span> EXACT PHRASES
                </div>
                <div className="form-label-hint">Literal strings (Use * for wildcards)</div>
                <TagInput value={inputs.exactPhrases} onChange={v => onInputChange('exactPhrases', v)}
                  placeholder='index of /backup...' color="var(--accent-primary)" />
              </div>

              {/* MODULE: EXCLUDE */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🚫</span> EXCLUDE KEYWORDS
                </div>
                <div className="form-label-hint">Suppress irrelevant results</div>
                <TagInput value={inputs.excludeKeywords} onChange={v => onInputChange('excludeKeywords', v)}
                  placeholder="blog, news..." color="var(--accent-primary)" />
              </div>

              {/* MODULE: NOISE REDUCTION */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🔊</span> NOISE REDUCTION
                </div>
                <div className="form-label-hint">Exclude standard noise paths (e.g. w3, schema)</div>
                <TagInput value={inputs.noiseReduction || []} onChange={v => onInputChange('noiseReduction', v)}
                  placeholder="w3, schema, wp-includes..." color="var(--accent-primary)" />
              </div>

              {/* MODULE: ANCHORS */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🔗</span> INANCHOR: HYPERLINKS
                </div>
                <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 12, fontFamily: 'var(--mono)' }}>Search inside clickable link text</div>
                <TagInput value={inputs.anchorKeywords || []} onChange={v => onInputChange('anchorKeywords', v)}
                  placeholder="admin, login..." color="var(--accent-primary)" />
              </div>

              {/* MODULE: RANGES */}
              <div className="op-field" style={{ margin: 0, background: 'var(--s1)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                <div className="op-label" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', letterSpacing: '0.05em', marginBottom: 4 }}>
                  <span>🔢</span> NUMERIC RANGES (N..M)
                </div>
                <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 12, fontFamily: 'var(--mono)' }}>Find versions, years, or IDs</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="form-input premium-input-mono" style={{ borderRadius: '8px', minWidth: 0, flex: 1, borderColor: 'var(--border)', height: '52px', padding: '0 16px', fontSize: '15px' }} placeholder="Min (e.g. 2020)" value={inputs.rangeMin} onChange={e => onInputChange('rangeMin', e.target.value)} />
                  <span style={{ color: 'var(--dim)' }}>..</span>
                  <input className="form-input premium-input-mono" style={{ borderRadius: '8px', minWidth: 0, flex: 1, borderColor: 'var(--border)', height: '52px', padding: '0 16px', fontSize: '15px' }} placeholder="Max (e.g. 2024)" value={inputs.rangeMax} onChange={e => onInputChange('rangeMax', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="section-header">
              <div className="section-badge">03</div>
              <div className="section-title">File Types</div>
            </div>

            <div className="filetype-container">
              <div className="filetype-groups-grid">
                {/* GROUP: CONFIGS & SECRETS */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em' }}>
                    <span>🔐</span> CONFIGS & CREDENTIALS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['.env', '.conf', '.config', '.ini', '.pem', '.key', '.htpasswd'].map(ext => (
                      <button key={ext} className={`filetype-pill ${inputs.fileTypes.includes(ext) ? 'selected' : ''}`}
                        onClick={() => {
                          const next = inputs.fileTypes.includes(ext) ? inputs.fileTypes.filter(x => x !== ext) : [...inputs.fileTypes, ext];
                          onInputChange('fileTypes', next);
                        }}>{ext}</button>
                    ))}
                  </div>
                </div>

                {/* GROUP: DATA & LOGS */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em' }}>
                    <span>📊</span> DATA & SYSTEM LOGS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['.sql', '.db', '.mdb', '.dump', '.csv', '.log', '.bak', '.json', '.xml', '.yml', '.yaml'].map(ext => (
                      <button key={ext} className={`filetype-pill ${inputs.fileTypes.includes(ext) ? 'selected' : ''}`}
                        onClick={() => {
                          const next = inputs.fileTypes.includes(ext) ? inputs.fileTypes.filter(x => x !== ext) : [...inputs.fileTypes, ext];
                          onInputChange('fileTypes', next);
                        }}>{ext}</button>
                    ))}
                  </div>
                </div>

                {/* GROUP: DOCUMENTS */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em' }}>
                    <span>📄</span> OFFICE DOCUMENTS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['.pdf', '.xls', '.xlsx', '.docx', '.txt'].map(ext => (
                      <button key={ext} className={`filetype-pill ${inputs.fileTypes.includes(ext) ? 'selected' : ''}`}
                        onClick={() => {
                          const next = inputs.fileTypes.includes(ext) ? inputs.fileTypes.filter(x => x !== ext) : [...inputs.fileTypes, ext];
                          onInputChange('fileTypes', next);
                        }}>{ext}</button>
                    ))}
                  </div>
                </div>

                {/* GROUP: EXECUTABLES */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em' }}>
                    <span>⚡</span> SCRIPTS & SOURCE
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['.php', '.py', '.sh'].map(ext => (
                      <button key={ext} className={`filetype-pill ${inputs.fileTypes.includes(ext) ? 'selected' : ''}`}
                        onClick={() => {
                          const next = inputs.fileTypes.includes(ext) ? inputs.fileTypes.filter(x => x !== ext) : [...inputs.fileTypes, ext];
                          onInputChange('fileTypes', next);
                        }}>{ext}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="builder-action-row" style={{ display: 'flex', gap: 12, paddingTop: 32 }}>
              <button className="btn btn-builder-clear" onClick={onReset} style={{ flex: 1, padding: '16px 24px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>🗑️</span> RESET WORKSPACE
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUT CONSOLE */}
        <div className="builder-outputs-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div className="query-console-card" style={{ marginTop: 0 }}>
              <div className="query-console-header">
                <div className="console-dot" style={{ background: '#FF5F56' }} />
                <div className="console-dot" style={{ background: '#FFBD2E' }} />
                <div className="console-dot" style={{ background: '#27C93F' }} />
                <span className="console-title">Live Query Result</span>
              </div>
              <div className="query-console-body" 
                onClick={() => query?.raw && onCopy(query.raw)}
                title={query?.raw ? "Click to copy query" : undefined}
                style={{ cursor: query?.raw ? 'pointer' : 'default' }}>
                {!query || !query.raw
                  ? <span className="query-empty">Awaiting parameters...</span>
                  : query.highlighted.map((t, i) => <TokenSpan key={i} text={t.text} type={t.type} />)
                }
              </div>
              {query && query.raw && (
                <div className="query-console-footer">
                  <button className="btn btn-console primary" onClick={() => onCopy(query.raw)}>📋 Copy Query</button>
                  <button className="btn btn-console secondary" onClick={() => {
                    onSave(query, 'execute');
                    inputs.searchEngines.forEach(eng => {
                      window.open(getSearchUrl(query.raw, eng), '_blank');
                    });
                  }}>
                    🔍 Execute
                  </button>
                  <button className="btn btn-console ghost" onClick={openStoreAt}>
                    ⭐ Store Template
                  </button>
                </div>
              )}
            </div>
          </div>

          {query && query.raw && (
            <div className="card" style={{ background: 'var(--s1)', padding: '24px' }}>
              <div className="section-label" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📖</span> Command Explanation
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {query.structuredExplanation.length > 0 ? (
                  query.structuredExplanation.map((part, i) => (
                    <div key={i} style={{
                      background: 'var(--s2)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}>
                      <div style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 13,
                        color: 'var(--accent-primary)',
                        fontWeight: 700
                      }}>{part.operator}</div>
                      <div style={{
                        fontSize: 12,
                        color: 'var(--muted)',
                        lineHeight: 1.4
                      }}>{part.desc}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                    Generic search pattern for {inputs.searchGoal.replace(/-/g, ' ')}.
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px dashed var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="stat-label" style={{ marginBottom: 4 }}>Complexity Score</div>
                  <div className="stat-val" style={{ fontSize: 24, marginBottom: 0, color: 'var(--accent-primary)' }}>{query.score}<span style={{ fontSize: 14, color: 'var(--dim)' }}>/10</span></div>
                </div>
                <div style={{ width: 100 }}>
                  <div className="rp-score-bar" style={{ height: 6, background: 'rgba(255,255,255,0.05)' }}>
                    <div className="rp-score-fill" style={{ width: `${query.score * 10}%`, background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary-glow)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {query && query.followUps.length > 0 && (
            <div className="card" style={{ background: 'var(--s1)' }}>
              <div className="section-label" style={{ marginBottom: 12 }}>💡 Follow Up Dorking</div>
              <div className="followup-list">
                {query.followUps.map((f, i) => (
                  <div key={i} className="followup-item" onClick={() => onCopy(f.query)}>
                    <div className="followup-query" style={{ color: 'var(--text)' }}>{f.query}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div className="followup-purpose">{f.purpose}</div>
                      <RiskBadge risk={f.risk} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showStoreModal && createPortal(
        <div className="modal-overlay" onClick={() => closeStoreModal()} style={{ alignItems: 'center' }}>
          <div className="modal-box" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header" style={{ 
              borderBottom: '1px solid rgba(15,18,20,0.05)', 
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text)', fontFamily: 'var(--mono)' }}>STORE AS TEMPLATE</span>
              </div>
              <button className="btn-close" onClick={() => setShowStoreModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px 18px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.65fr', gap: 16, alignItems: 'start' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="section-label" style={{ marginBottom: 8, color: 'rgba(15,18,20,0.72)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Template Name</label>
                  <input className="form-input" style={{ width: '100%', height: '46px', borderRadius: '10px', background: '#ffffff', border: '1px solid rgba(15,18,20,0.10)', padding: '0 16px', fontSize: '14px' }} placeholder="e.g. WP Admin Hunt"
                    value={tplName} onChange={e => setTplName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStoreTemplate()}
                    autoFocus />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="section-label" style={{ marginBottom: 8, color: 'rgba(15,18,20,0.72)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Risk Level</label>
                  <div style={{ display: 'flex', gap: 8, height: '46px' }}>
                    {(['low', 'medium', 'high'] as RiskLevel[]).map(r => {
                      const colors = {
                        low: 'var(--green)',
                        medium: 'var(--amber)',
                        high: 'var(--orange)',
                        critical: 'var(--rose)'
                      };
                      const isActive = tplRisk === r;
                      return (
                        <button key={r} onClick={() => setTplRisk(r)}
                          className={`risk-btn ${isActive ? 'active' : ''}`}
                          title={r.toUpperCase()}
                          style={{ '--risk-color': colors[r] } as React.CSSProperties}>
                          {r === 'medium' ? 'Med' : r === 'critical' ? 'Crit' : r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label className="section-label" style={{ marginBottom: 8, color: 'rgba(15,18,20,0.72)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Description</label>
                <textarea className="form-input" style={{ width: '100%', flex: 1, minHeight: '92px', borderRadius: '10px', background: '#ffffff', border: '1px solid rgba(15,18,20,0.10)', padding: '14px 16px', fontSize: '14px', resize: 'none', overflowY: 'auto', lineHeight: 1.55 }} placeholder="Technical intent of this dork..."
                  value={tplPurpose} onChange={e => setTplPurpose(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleStoreTemplate();
                    }
                  }} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="section-label" style={{ marginBottom: 8, color: 'rgba(15,18,20,0.72)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Query Preview</label>
                <div 
                  className="modal-query-preview"
                  onClick={() => query?.raw && onCopy(query.raw)}
                  title="Click to copy query"
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)', opacity: 0.3 }} />
                  {query?.highlighted ? query.highlighted.map((t, i) => <TokenSpan key={i} text={t.text} type={t.type} />) : query?.raw}
                </div>
              </div>
            </div>
                        <div className="modal-footer" style={{ 
              borderTop: '1px solid rgba(15,18,20,0.05)', 
              padding: '14px 20px', 
              background: '#ffffff',
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              <button className="btn btn-secondary shine-on-click" onClick={() => setShowStoreModal(false)} style={{
                padding: '8px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-base)',
                height: '42px',
                minWidth: '118px'
              }}>Cancel</button>
              <button className="btn btn-primary shine-on-click" onClick={handleStoreTemplate} style={{ 
                background: 'var(--accent-primary)',
                borderColor: 'var(--accent-primary)',
                color: '#000',
                padding: '8px 22px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'var(--transition-base)',
                boxShadow: '0 8px 18px rgba(0,0,0,0.10)',
                height: '42px',
                minWidth: '162px',
                justifyContent: 'center',
                display: 'inline-flex'
              }}>STORE TEMPLATE</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
