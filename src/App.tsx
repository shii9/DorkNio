import { useState, useCallback, useEffect } from 'react';
import type { ActiveTab, BuilderInputs, GeneratedQuery, HistoryItem, CustomTemplate, RiskLevel } from './types';
import { buildQuery, createGeneratedQuery, parseDorkToInputs } from './engine/queryEngine';
import { v4 as uuidv4 } from './utils/uuid';
import Toast from './components/Toast';
import BuilderTab from './components/BuilderTab';
import TemplatesTab from './components/TemplatesTab';
import HistoryTab from './components/HistoryTab';
import ReferenceTab from './components/ReferenceTab';
import ProcessingOverlay from './components/ProcessingOverlay';
import { ThemePicker, ACCENTS, type AccentOption } from './components/ThemePicker';

// SEO & Content Tabs
import HomeTab from './components/HomeTab';
const DEFAULT_INPUTS: BuilderInputs = {
  domain: '', includeSubdomains: false, excludeSubdomains: [],
  titleKeywords: [], urlPattern: '', bodyKeywords: [],
  exactPhrases: [], anchorKeywords: [], excludeKeywords: [], fileTypes: [],
  technology: '', paramNames: [],
  searchGoal: 'custom', noiseReduction: [],
  rangeMin: '', rangeMax: '', useWildcard: false,
  useCache: false, useInfo: false, useRelated: false,
  exactMatch: false,
  searchEngines: ['google'],
};

function loadHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem('dorknio_history') || '[]'); }
  catch { return []; }
}
function saveHistory(h: HistoryItem[]) {
  localStorage.setItem('dorknio_history', JSON.stringify(h.slice(0, 200)));
}
function loadCustomTemplates(): CustomTemplate[] {
  try { return JSON.parse(localStorage.getItem('dorknio_custom_templates') || '[]'); }
  catch { return []; }
}
function saveCustomTemplates(t: CustomTemplate[]) {
  localStorage.setItem('dorknio_custom_templates', JSON.stringify(t));
}

function sanitizeString(val: string, maxLength: number, onReject?: (reason: string) => void): string {
  if (!val) return '';

  let s = val;
  // Check HTML tags
  if (/<[^>]*>/g.test(s)) {
    s = s.replace(/<[^>]*>/g, '');
    onReject?.('HTML tags stripped for safety');
  }

  // Check javascript: protocol
  if (/javascript:/gi.test(s)) {
    s = s.replace(/javascript:/gi, '');
    onReject?.('Script protocol blocked');
  }

  // Check truncation
  if (s.length > maxLength) {
    s = s.slice(0, maxLength);
    onReject?.(`Maximum limit of ${maxLength} characters reached`);
  }

  return s;
}

function sanitizeArray(arr: string[], maxItems: number, maxItemLength: number, onReject?: (reason: string) => void): string[] {
  if (!Array.isArray(arr)) return [];

  let cleanArr = arr;
  if (cleanArr.length > maxItems) {
    cleanArr = cleanArr.slice(0, maxItems);
    onReject?.(`List limited to maximum of ${maxItems} items`);
  }

  return cleanArr
    .map(item => sanitizeString(item, maxItemLength, onReject))
    .filter(Boolean);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [inputs, setInputs] = useState<BuilderInputs>({ ...DEFAULT_INPUTS });
  const [query, setQuery] = useState<GeneratedQuery | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(loadCustomTemplates);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [procMessage, setProcMessage] = useState('');
  const [procColor, setProcColor] = useState<string | null>(null);
  const [isManualQuery, setIsManualQuery] = useState(false);
  const [currentAccent, setCurrentAccent] = useState<string>(localStorage.getItem('dorknio_accent') || 'cyan');

  const isExtension = window.location.protocol === 'chrome-extension:' || window.location.protocol === 'moz-extension:';



  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
  }, []);

  const handleSaveToHistory = useCallback((q: GeneratedQuery, origin: 'build' | 'execute' | 'copy' = 'build') => {
    const item: HistoryItem = {
      id: uuidv4(), query: q.raw, goal: q.goal,
      engines: q.engines,
      score: q.score,
      timestamp: q.timestamp, starred: false,
      origin,
      presetName: q.presetName,
      explanation: q.explanation,
      inputs: q.inputs,
      highlighted: q.highlighted,
      followUps: q.followUps,
    };
    setHistory(prev => {
      const next = [item, ...prev.filter(h => h.query !== item.query)];
      saveHistory(next);
      return next;
    });
    showToast('Query Copied');
  }, [showToast]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Query Copied');
      if (query && text === query.raw) handleSaveToHistory(query, 'copy');
    });
  }, [showToast, query, handleSaveToHistory]);

  const runProcess = useCallback((msg: string, duration: number = 800, callback: () => void, color?: string) => {
    setProcMessage(msg);
    if (color) setProcColor(color);
    setIsProcessing(true);
    setTimeout(() => {
      try {
        callback();
      } catch (err) {
        console.error("Process execution failed:", err);
      } finally {
        setIsProcessing(false);
        setProcColor(null);
      }
    }, duration);
  }, []);

  const handleBuild = useCallback(() => {
    runProcess("Analyzing reconnaissance objective...", 800, () => {
      const raw = buildQuery(inputs);
      if (!raw.trim()) return;
      const q = createGeneratedQuery(inputs, raw);
      setQuery(q);
      handleSaveToHistory(q, 'build');
      showToast("Dork logic synthesized successfully");
    });
  }, [inputs, runProcess, handleSaveToHistory]);

  const handleAccentChange = useCallback((acc: AccentOption) => {
    runProcess(`Calibrating ${acc.name} interface...`, 400, () => {
      setCurrentAccent(acc.id);
      localStorage.setItem('dorknio_accent', acc.id);
      document.documentElement.style.setProperty('--accent-primary', acc.color);
      document.documentElement.style.setProperty('--accent-primary-bg', acc.bg);
      document.documentElement.style.setProperty('--accent-primary-glow', acc.glow || acc.bg);
      document.documentElement.style.setProperty('--theme-tint', acc.tint);
      document.documentElement.style.setProperty('--theme-s1', acc.s1);
      showToast(`${acc.name} Theme Active`);
    }, acc.color);
  }, [runProcess, showToast]);

  // Initial accent load
  useEffect(() => {
    const saved = localStorage.getItem('dorknio_accent') || 'cyan';
    const acc = ACCENTS.find(a => a.id === saved) || ACCENTS[0];
    document.documentElement.style.setProperty('--accent-primary', acc.color);
    document.documentElement.style.setProperty('--accent-primary-bg', acc.bg);
    document.documentElement.style.setProperty('--accent-primary-glow', acc.glow || acc.bg);
    document.documentElement.style.setProperty('--theme-tint', acc.tint);
    document.documentElement.style.setProperty('--theme-s1', acc.s1);
  }, []);

  const handleStoreTemplate = useCallback((queryStr: string, name: string, purpose: string, risk: RiskLevel) => {
    const cleanName = sanitizeString(name, 60).trim();
    const cleanPurpose = sanitizeString(purpose, 200).trim();
    const cleanQuery = sanitizeString(queryStr, 1000).trim();

    if (!cleanName) {
      showToast('Template name cannot be empty');
      return;
    }

    const tpl: CustomTemplate = {
      id: uuidv4(),
      name: cleanName,
      query: cleanQuery,
      purpose: cleanPurpose,
      risk,
      timestamp: new Date().toISOString(),
    };
    setCustomTemplates(prev => {
      const next = [tpl, ...prev];
      saveCustomTemplates(next);
      return next;
    });
    showToast('Template Stored! ⭐');
  }, [showToast]);

  const handleDeleteCustomTemplate = useCallback((id: string) => {
    setCustomTemplates(prev => {
      const next = prev.filter(t => t.id !== id);
      saveCustomTemplates(next);
      return next;
    });
    showToast('Template deleted');
  }, [showToast]);

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const handleStarHistory = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.map(h => h.id === id ? { ...h, starred: !h.starred } : h);
      saveHistory(next);
      return next;
    });
  }, []);

  // Track if we are currently loading to prevent the auto-rebuild useEffect from clobbering loaded state
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  const handleSendToBuilder = useCallback((data?: HistoryItem | string, presetName?: string) => {
    // Load the selected template/query into the Builder WITHOUT clearing it when user edits.
    setIsInternalLoading(true);
    setIsManualQuery(true); // Prevent auto-rebuild collision during loading

    setActiveTab('builder');

    const msg = typeof data === 'string'
      ? "Parsing reconnaissance template..."
      : "Synchronizing session parameters...";

    runProcess(msg, 450, () => {
      let nextInputs: BuilderInputs;

      if (typeof data === 'string') {
        // Reset workspace and parse the template string into fresh inputs
        nextInputs = parseDorkToInputs(data, { ...DEFAULT_INPUTS });
        setInputs(nextInputs);
        setQuery({ ...createGeneratedQuery(nextInputs, data), presetName: presetName || 'Template Library' });
      } else if (data) {
        if (data.inputs) {
          // Replace current workspace with saved history inputs
          nextInputs = { ...data.inputs };
          setInputs(nextInputs);
          setQuery({
            ...createGeneratedQuery(nextInputs, data.query),
            id: data.id,
            timestamp: data.timestamp,
            starred: data.starred,
            presetName: data.presetName || data.goal
          });
        } else {
          // Fallback: Parse query into fresh inputs
          nextInputs = parseDorkToInputs(data.query, { ...DEFAULT_INPUTS });
          if (data.goal && data.goal !== 'custom') nextInputs.searchGoal = data.goal;
          setInputs(nextInputs);
          setQuery({ ...createGeneratedQuery(nextInputs, data.query), presetName: data.presetName || data.goal });
        }
      }

      showToast('Recon Studio Loaded');
      setIsInternalLoading(false);
    });
  }, [showToast, runProcess, inputs]);

  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULT_INPUTS });
    setQuery(null);
    showToast('Builder Cleared');
  }, [showToast]);

  const handleInputChange = useCallback(<K extends keyof BuilderInputs>(key: K, value: BuilderInputs[K]) => {
    // Allow manual edits to trigger auto-rebuild, so new additions are merged with loaded query
    setIsManualQuery(false);

    let sanitizedValue = value;
    const triggerWarning = (reason: string) => {
      showToast(`⚠️ ${reason}`);
    };

    if (typeof value === 'string') {
      if (key === 'domain' || key === 'urlPattern') {
        // Enforce standard maximum domain size limits (253 chars)
        sanitizedValue = sanitizeString(value, 253, triggerWarning) as any;
      } else if (key === 'rangeMin' || key === 'rangeMax') {
        // Numeric range inputs: block non-digits and keep under 10 chars
        const numeric = value.replace(/[^\d]/g, '');
        if (value !== numeric) {
          triggerWarning('Only numbers are allowed');
        }
        sanitizedValue = numeric.slice(0, 10) as any;
        if (numeric.length > 10) {
          triggerWarning('Numeric limit of 10 digits reached');
        }
      } else if (key === 'technology') {
        sanitizedValue = sanitizeString(value, 40, triggerWarning) as any;
      } else if (key === 'searchGoal') {
        sanitizedValue = sanitizeString(value, 30, triggerWarning) as any;
      } else {
        sanitizedValue = sanitizeString(value, 150, triggerWarning) as any;
      }
    } else if (Array.isArray(value)) {
      if (key === 'fileTypes') {
        // filetypes are short extensions (e.g. .pdf), max 15 chars per item, max 30 items
        sanitizedValue = sanitizeArray(value, 30, 15, triggerWarning) as any;
      } else {
        // standard tag arrays, max 25 items, max 100 chars per item
        sanitizedValue = sanitizeArray(value, 25, 100, triggerWarning) as any;
      }
    }

    setInputs(prev => ({ ...prev, [key]: sanitizedValue }));
  }, [showToast]);

  useEffect(() => {
    if (isInternalLoading || isManualQuery) return;

    const raw = buildQuery(inputs);
    if (raw.trim()) {
      setQuery(prev => {
        const next = createGeneratedQuery(inputs, raw);
        return prev?.presetName ? { ...next, presetName: prev.presetName } : next;
      });
    } else {
      setQuery(null);
    }
  }, [inputs, isInternalLoading, isManualQuery]);

  // Removed RightPanel condition since we will integrate stats into the BuilderTab

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('dorknio_mode') !== 'light');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('dorknio_mode', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('dorknio_mode', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    const msg = isDarkMode ? "Switching to Light Mode..." : "Switching to Dark Mode...";

    runProcess(msg, 350, () => {
      setIsDarkMode(!isDarkMode);
    });
  }, [isDarkMode, runProcess]);

  return (
    <div className="app-shell">
      {/* MOBILE DRAWER OVERLAY */}
      <div className={`nav-drawer-overlay${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      {/* MOBILE DRAWER */}
      <div className={`nav-drawer${mobileMenuOpen ? ' open' : ''}`}>
        <div className="nav-drawer-header">
          <div className="nav-logo" style={{ fontSize: 16 }}><span style={{ color: 'var(--text)' }}>Dork</span><span style={{ color: 'var(--accent-primary)' }}>Nio</span></div>
          <button className="nav-drawer-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>
        {(['home', 'builder', 'templates', 'history', 'reference'] as ActiveTab[]).map(tab => (
          <button key={tab} className={`nav-link${activeTab === tab ? ' active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}>
            {tab === 'home' ? '🏠 Home' : tab === 'builder' ? '🔧 Builder' : tab === 'templates' ? '📚 Templates' : tab === 'history' ? '🕐 History' : '📖 Guideline'}
          </button>
        ))}
        <div className="nav-drawer-icons">
          <button className="nav-icon-btn" onClick={toggleDarkMode} title={isDarkMode ? 'Day Mode' : 'Night Mode'}>
            {isDarkMode ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>}
          </button>
          <a href="https://github.com/shii9/DorkNio" target="_blank" rel="noopener noreferrer" className="nav-icon-btn" title="View Source">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
          </a>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="nav-logo"
            onClick={() => setActiveTab('builder')}
            style={{ fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em', cursor: 'pointer' }}
            title="Return to Builder">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M12 0L2 13h8l-2 11 12-14h-8l2-10z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <div><span style={{ color: 'var(--text)' }}>Dork</span><span style={{ color: 'var(--accent-primary)' }}>Nio</span></div>
            {isExtension && <span className="ext-badge" style={{ marginLeft: 8 }}>⚡ Extension</span>}
          </div>

          <div className="nav-links">
            <button className={`nav-link${activeTab === 'home' ? ' active' : ''} shine-on-click`}
              onClick={() => setActiveTab('home')}>Home</button>
            <button className={`nav-link${activeTab === 'builder' ? ' active' : ''} shine-on-click`}
              onClick={() => setActiveTab('builder')}>Builder</button>
            <button className={`nav-link${activeTab === 'templates' ? ' active' : ''} shine-on-click`}
              onClick={() => setActiveTab('templates')}>Templates</button>
            <button className={`nav-link${activeTab === 'history' ? ' active' : ''} shine-on-click`}
              onClick={() => setActiveTab('history')}>History</button>
            <button className={`nav-link${activeTab === 'reference' ? ' active' : ''} shine-on-click`}
              onClick={() => setActiveTab('reference')}>Guideline</button>
          </div>

          <div className="nav-right">
            <div className="nav-divider" />
            <button className="nav-icon-btn shine-on-click" onClick={toggleDarkMode} title={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}>
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>

            <ThemePicker currentAccent={currentAccent} onSelect={handleAccentChange} />

            <a href="https://github.com/shii9/DorkNio" target="_blank" rel="noopener noreferrer" className="nav-icon-btn shine-on-click" title="View Source">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>

          {/* HAMBURGER — mobile only */}
          <button className="nav-hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">☰</button>
        </div>
      </nav>

      <div className="app-body">
        {/* MAIN WORKSPACE */}
        <main className={`workspace${isProcessing ? ' is-processing' : ''}`}>
          <div key={activeTab} className="tab-content">
            {activeTab === 'home' && (
              <div className="tab-pane">
                <HomeTab setActiveTab={setActiveTab} />
              </div>
            )}
            {activeTab === 'builder' && (
              <div className="tab-pane">
                <BuilderTab inputs={inputs} query={query}
                  onInputChange={handleInputChange} onBuild={handleBuild}
                  onReset={handleReset}
                  onCopy={handleCopy} onSave={handleSaveToHistory}
                  onStoreTemplate={handleStoreTemplate} />
              </div>
            )}
            {activeTab === 'templates' && (
              <div className="tab-pane">
                <TemplatesTab onCopy={handleCopy}
                  onUseInBuilder={handleSendToBuilder}
                  customTemplates={customTemplates}
                  onDeleteCustomTemplate={handleDeleteCustomTemplate} />
              </div>
            )}
            {activeTab === 'history' && (
              <div className="tab-pane">
                <HistoryTab history={history} onCopy={handleCopy}
                  onDelete={handleDeleteHistory} onStar={handleStarHistory}
                  onSendToBuilder={handleSendToBuilder}
                  onClear={() => { setHistory([]); saveHistory([]); }}
                  runProcess={runProcess}
                  showToast={showToast} />
              </div>
            )}
            {activeTab === 'reference' && (
              <div className="tab-pane">
                <ReferenceTab onCopy={handleCopy} />
              </div>
            )}
            {activeTab === 'guide' && (
              <div className="tab-pane">
                <iframe src="/google_dorking_guide.html" style={{ width: '100%', height: '100%', border: 'none', background: 'var(--bg)' }} title="Dork Guide" />
              </div>
            )}
            {activeTab === 'anatomy' && (
              <div className="tab-pane">
                <iframe src="/dork_anatomy_v3.html" style={{ width: '100%', height: '100%', border: 'none', background: 'var(--bg)' }} title="Operator Anatomy" />
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Toast */}
      <Toast message={toast} visible={toastVisible} />

      {/* Processing Overlay */}
      <ProcessingOverlay isVisible={isProcessing} message={procMessage} overrideColor={procColor || undefined} />
    </div>
  );
}
