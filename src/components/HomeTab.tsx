import { useState, useEffect } from 'react';
import type { ActiveTab } from '../types';

interface Props {
  setActiveTab: (tab: ActiveTab) => void;
}

const MOCK_QUERIES = [
  { dork: 'site:example.com filetype:sql "password" | "db_dump"', analysis: 'Locating exposed backup databases & structural logs passively.' },
  { dork: 'site:example.com inurl:admin | inurl:login', analysis: 'Mapping exposed administrative login panels and access paths.' },
  { dork: 'site:example.com intitle:"Index of /" "backup" | "private"', analysis: 'Searching for unprotected directory indices exposing sensitive directories.' },
  { dork: 'site:*.example.com ext:env | ext:config "DB_PASSWORD"', analysis: 'Detecting configuration tokens and environment variables leaked in production.' },
];

/*
interface TokenSegment {
  text: string;
  type: 'site' | 'intitle' | 'inurl' | 'intext' | 'filetype' | 'meta' | 'phrase' | 'exclude' | 'boolean' | 'plain';
}

function getHighlightedSegments(text: string): TokenSegment[] {
  const operators = [
    'site:', '-site:', 
    'intitle:', 'allintitle:', '-intitle:',
    'inurl:', 'allinurl:', '-inurl:',
    'intext:', 'allintext:', 
    'inanchor:', 'allinanchor:', 
    'filetype:', 'ext:',
    'cache:', 'related:', 'info:'
  ];

  const regex = new RegExp(`(${operators.join('|')})|("[^"]*"?)|(OR|\\|)|(\\s+)|([^\\s"]+)`, 'g');
  const segments: TokenSegment[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(text)) !== null) {
    const rawText = match[0];
    let type: TokenSegment['type'] = 'plain';
    
    if (match[1]) {
      const op = match[1];
      if (op.includes('site')) type = 'site';
      else if (op.includes('title')) type = 'intitle';
      else if (op.includes('url')) type = 'inurl';
      else if (op.includes('text') || op.includes('anchor')) type = 'intext';
      else if (op.includes('filetype') || op.includes('ext')) type = 'filetype';
      else type = 'meta';
    } else if (match[2]) {
      type = 'phrase';
    } else if (match[3]) {
      type = 'boolean';
    } else if (match[4]) {
      type = 'plain';
    } else if (match[5]) {
      const val = match[5];
      if (val.startsWith('-')) {
        type = 'exclude';
      } else {
        type = 'plain';
      }
    }
    
    segments.push({ text: rawText, type });
  }
  
  return segments;
}
*/

export default function HomeTab({ setActiveTab }: Props) {
  const [queryIndex, setQueryIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [builderHover, setBuilderHover] = useState(false);
  const [guideHover, setGuideHover] = useState(false);
  const typingSpeed = 80;

  useEffect(() => {
    let timer: number;
    const fullText = MOCK_QUERIES[queryIndex].dork;

    if (!isDeleting) {
      if (typedText !== fullText) {
        timer = window.setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }, typingSpeed);
      } else {
        // Pause at full text
        timer = window.setTimeout(() => setIsDeleting(true), 3000);
      }
    } else {
      if (typedText !== '') {
        timer = window.setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setQueryIndex((prev) => (prev + 1) % MOCK_QUERIES.length);
      }
    }

    return () => window.clearTimeout(timer);
  }, [typedText, isDeleting, queryIndex, typingSpeed]);

  return (
    <div className="home-layout fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 0 }}>
      
      {/* HERO SECTION */}
      <section className="home-premium-hero">
        <div className="section-title" style={{
          fontSize: 'clamp(2.2rem, 8vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          lineHeight: 1.1,
          color: 'var(--text)',
          maxWidth: 900,
          animation: 'slideInUp 0.39s ease-out'
        }}>
          Elite Google <span style={{ color: 'var(--accent)', fontWeight: 900 }}>Dorking Studio</span>
        </div>
        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 580, lineHeight: 1.6, margin: '0 auto', animation: 'slideInUp 0.39s ease-out' }}>
          Build, analyze, and export advanced search queries for passive reconnaissance and defensive security auditing.
        </p>

        {/* HERO ACTIONS */}
        <div className="hero-ctas" style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '24px 0 0 0', animation: 'slideInUp 0.39s ease-out' }}>
          <button 
            className="btn shine-on-click" 
            onClick={() => setActiveTab('builder')}
            onMouseEnter={() => setBuilderHover(true)}
            onMouseLeave={() => setBuilderHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '11px 24px',
              fontSize: 14,
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: '1px solid var(--accent)',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: builderHover ? '0 4px 20px var(--accent)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              width: '160px',
              transform: builderHover ? 'scale(1.05)' : 'scale(1)'
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Builder Studio
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setActiveTab('reference')}
            onMouseEnter={() => setGuideHover(true)}
            onMouseLeave={() => setGuideHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '11px 24px',
              fontSize: 14,
              background: 'var(--s2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: guideHover ? '0 4px 20px var(--accent)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              width: '160px',
              transform: guideHover ? 'scale(1.05)' : 'scale(1)'
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Explore Guidelines
          </button>
        </div>
      </section>


      {/* SECTION 1: CORE OBJECTIVE & PHILOSOPHY */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span className="section-badge" style={{ 
              background: 'var(--accent-bg)', 
              color: 'var(--accent)', 
              fontSize: 'clamp(11px, 3.5vw, 12px)', 
              padding: '4px 10px', 
              borderRadius: 6, 
              letterSpacing: '0.05em', 
              fontWeight: 800,
              border: '1px solid var(--accent)',
              fontFamily: 'var(--mono)',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              animation: 'slideInUp 0.35s ease-out'
            }}>
              Core Objective
            </span>
            <h2 style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', margin: 0, animation: 'slideInUp 0.39s ease-out' }}>
              Passive Audit & Recon Philosophy
            </h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ 
                background: 'var(--accent-bg)', 
                color: 'var(--accent)', 
                fontSize: 18, 
                width: 34,
                height: 34,
                borderRadius: 8, 
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                🛡️
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', margin: 0 }}>
                Safe & Defensive Auditing
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Understanding what indexing assets your system exposes is vital for defense. 
              DorkNio translates raw query strings into visually mapped parameters, 
              helping security teams spot leaks and misconfigurations before malicious vectors locate them.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ 
                background: 'var(--accent-bg)', 
                color: 'var(--accent)', 
                fontSize: 18, 
                width: 34,
                height: 34,
                borderRadius: 8, 
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                ⚡
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', margin: 0 }}>
                Syntax Optimization
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              No more syntax guesswork or search operator confusion. 
              Select file extensions, paths, exclusions, and custom rules dynamically. 
              The visual builder constructs the exact standard spacing and operator bindings automatically.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ 
                background: 'var(--accent-bg)', 
                color: 'var(--accent)', 
                fontSize: 18, 
                width: 34,
                height: 34,
                borderRadius: 8, 
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                🎓
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', margin: 0 }}>
                Educational Sandboxing
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Every search operator, filter input, and query indicator is accompanied by detailed, 
              interactive technical translations. Learn advanced open source intelligence (OSINT) 
              workflows directly while optimizing queries.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: SYSTEM CAPABILITIES & FEATURES */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span className="section-badge" style={{ 
              background: 'var(--accent-bg)', 
              color: 'var(--accent)', 
              fontSize: 'clamp(11px, 3.5vw, 12px)', 
              padding: '4px 10px', 
              borderRadius: 6, 
              letterSpacing: '0.05em', 
              fontWeight: 800,
              border: '1px solid var(--accent)',
              fontFamily: 'var(--mono)',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              animation: 'slideInUp 0.35s ease-out'
            }}>
              Capabilities
            </span>
            <h2 style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', margin: 0, animation: 'slideInUp 0.5s ease-out 0.5s backwards' }}>
              System Features & Tools
            </h2>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: 18,
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                📂
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)' }}>
                Search Query Organization
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Automatically store every query you generate in a clean history registry. 
              Toggle star flags, filter items, and reload past sessions directly into your workspace.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: 18,
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                🧩
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)' }}>
                Recon Workflow Support
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Fluidly transition from surface scope mapping to deep file searches. 
              Integrated parameters sync state dynamically to prevent redundant search attempts.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: 18,
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                🔍
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)' }}>
                Keyword-Based Search Helpers
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Select standard categories like configurations, databases, executables, or administration pathways. 
              The parser injects appropriate dork structures under the hood.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: 18,
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                📥
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)' }}>
                Structured Multi-Format Exports
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Export your saved assets with one click. Generates structured JSON, CSV lists, 
              Markdown files, or professional printed HTML/PDF reports with complexity statistics.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: 18,
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                📉
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)' }}>
                Vulnerability & Risk Analysis
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Assess query complexity against standardized scoring. Learn how search operators 
              impact the sensitivity of the data they target.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '24px 28px', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontSize: 18,
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                🎓
              </span>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)' }}>
                Learning-Friendly Translation
              </h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Understand the exact logic behind operators like `inurl:`, `intitle:`, or `inanchor:`. 
              Perfect for OSINT students and security beginners.
            </p>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL ORGANIZED FOOTER */}
      <footer className="home-footer">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col" style={{ flex: 1.5 }}>
            <div className="footer-brand-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveTab('builder')}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M12 0L2 13h8l-2 11 12-14h-8l2-10z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <div><span style={{ color: 'var(--text)' }}>Dork</span><span style={{ color: 'var(--accent)' }}>Nio</span></div>
            </div>
            <p className="footer-brand-desc">
              Elite Google Dorking Studio for security researchers, defensive analysts, and OSINT professionals. Precision-engineer search parameters with immediate diagnostic feedback.
            </p>
          </div>

          {/* Quick Navigation Column */}
          <div className="footer-col">
            <div className="footer-col-title">Studio Platform</div>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <button onClick={() => setActiveTab('home')}>🏠 Studio Home</button>
              </li>
              <li className="footer-link-item">
                <button onClick={() => setActiveTab('builder')}>🔧 Builder Studio</button>
              </li>
              <li className="footer-link-item">
                <button onClick={() => setActiveTab('templates')}>📚 Pre-built Vault</button>
              </li>
              <li className="footer-link-item">
                <button onClick={() => setActiveTab('history')}>🕐 Session History</button>
              </li>
              <li className="footer-link-item">
                <button onClick={() => setActiveTab('reference')}>📖 Syntax Guidelines</button>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="footer-col">
            <div className="footer-col-title">OSINT Links</div>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a href="https://www.exploit-db.com/google-hacking-database" target="_blank" rel="noopener noreferrer">🗄️ Google Hacking DB</a>
              </li>
              <li className="footer-link-item">
                <a href="https://osintframework.com/" target="_blank" rel="noopener noreferrer">🌐 OSINT Framework</a>
              </li>
              <li className="footer-link-item">
                <a href="https://github.com/shii9/DorkNio" target="_blank" rel="noopener noreferrer">💻 GitHub Source</a>
              </li>
              <li className="footer-link-item">
                <a href="https://www.shodan.io" target="_blank" rel="noopener noreferrer">🎯 Shodan Search</a>
              </li>
              <li className="footer-link-item">
                <a href="https://github.com/jivoi/awesome-osint" target="_blank" rel="noopener noreferrer">📂 Awesome OSINT</a>
              </li>
            </ul>
          </div>

          {/* Educational Disclaimer Column */}
          <div className="footer-col" style={{ flex: 1.2 }}>
            <div className="footer-col-title">System Disclaimer</div>
            <p className="footer-disclaimer-text">
              <span className="footer-disclaimer-brand" style={{display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
                <span className="footer-disclaimer-icon">⚡</span>
                <span className="footer-disclaimer-name">DorkNio</span>
              </span>
              {' '}is an open-source educational utility. All generated syntax configurations are for passive defensive auditing and authorized security operations only. Always adhere to legal boundaries.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
