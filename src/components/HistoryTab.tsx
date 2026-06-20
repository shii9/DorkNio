import { useState, useMemo } from 'react';
import type { HistoryItem } from '../types';

function sanitizeInput(val: string, maxLen: number): string {
  if (!val) return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip script protocol
    .slice(0, maxLen);
}

interface Props {
  history: HistoryItem[];
  onCopy: (s: string) => void;
  onDelete: (id: string) => void;
  onStar: (id: string) => void;
  onSendToBuilder: (item: HistoryItem) => void;
  onClear: () => void;
  runProcess: (msg: string, duration: number, callback: () => void) => void;
  showToast: (msg: string) => void;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function exportData(items: HistoryItem[], format: 'txt' | 'csv' | 'json' | 'md' | 'pdf') {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');

  if (format === 'pdf') {
    const now = new Date().toLocaleString();
    const totalQueries = items.length;
    const avgScore = totalQueries
      ? (items.reduce((a, i) => a + i.score, 0) / totalQueries).toFixed(1)
      : '0.0';
    const starred = items.filter(i => i.starred).length;

    const rows = items.map((item, idx) => {
      const risk = item.score > 7 ? '#EF4444' : item.score > 5 ? '#F97316' : item.score > 3 ? '#EAB308' : '#22C55E';
      const riskLabel = item.score > 7 ? 'CRITICAL' : item.score > 5 ? 'HIGH' : item.score > 3 ? 'MEDIUM' : 'LOW';
      
      const cleanQuery = escapeHtml(item.query);
      const cleanGoal = escapeHtml(item.goal.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      const cleanEngines = escapeHtml((item.engines || ['google']).join(', '));
      const cleanTime = escapeHtml(new Date(item.timestamp).toLocaleString());

      return `
        <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="idx">#${String(idx + 1).padStart(2, '0')}</td>
          <td class="query"><code>${cleanQuery}</code></td>
          <td class="goal">${cleanGoal}</td>
          <td class="score"><span class="badge" style="border-color:${risk};color:${risk}">${item.score}/10 ${riskLabel}</span></td>
          <td class="engines">${cleanEngines}</td>
          <td class="ts">${cleanTime}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>DorkNio Recon Report – ${dateStr}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#0a0a0d;color:#fafafa;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .cover{background:linear-gradient(135deg,#0f0f14 0%,#13131a 100%);padding:60px 64px 48px;border-bottom:2px solid #27272a}
  .cover-logo{font-size:11px;font-family:'IBM Plex Mono',monospace;color:#52525b;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:32px}
  .cover-title{font-size:42px;font-weight:900;letter-spacing:-0.04em;line-height:1;color:#fafafa;margin-bottom:8px}
  .cover-title span{color:#22d3ee}
  .cover-sub{font-size:15px;color:#71717a;margin-bottom:40px;font-weight:400}
  .cover-meta{display:flex;gap:32px;flex-wrap:wrap}
  .meta-item{background:#111113;border:1px solid #27272a;border-radius:10px;padding:14px 20px;min-width:120px}
  .meta-label{font-size:10px;font-family:'IBM Plex Mono',monospace;color:#52525b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px}
  .meta-val{font-size:22px;font-weight:900;font-family:'IBM Plex Mono',monospace;color:#22d3ee}
  .section{padding:40px 64px}
  .section-hd{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #27272a}
  .section-badge{background:rgba(34,211,238,0.1);color:#22d3ee;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:700;padding:4px 10px;border-radius:5px;text-transform:uppercase;letter-spacing:0.05em}
  .section-title{font-size:16px;font-weight:700;color:#fafafa;letter-spacing:-0.01em}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#111113;color:#71717a;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;padding:10px 14px;text-align:left;border-bottom:1px solid #27272a}
  td{padding:10px 14px;vertical-align:top;border-bottom:1px solid #1c1c20}
  .row-even td{background:#0d0d10}
  .row-odd td{background:#0f0f13}
  td.idx{font-family:'IBM Plex Mono',monospace;color:#52525b;font-size:11px;width:40px;white-space:nowrap}
  td.query code{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#22d3ee;word-break:break-all;background:rgba(34,211,238,0.05);padding:3px 7px;border-radius:4px;border:1px solid rgba(34,211,238,0.15)}
  td.goal{color:#a1a1aa;font-size:12px;white-space:nowrap}
  td.engines{color:#71717a;font-size:11px;font-family:'IBM Plex Mono',monospace}
  td.ts{color:#52525b;font-size:11px;font-family:'IBM Plex Mono',monospace;white-space:nowrap}
  .badge{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;border:1px solid;letter-spacing:0.04em}
  .footer{background:#0d0d10;border-top:1px solid #27272a;padding:20px 64px;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#3f3f46;text-transform:uppercase;letter-spacing:0.08em}
  .footer-ts{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#3f3f46}
  @media print{body{background:#0a0a0d!important}@page{margin:0;size:A4 landscape}}
  @media(prefers-color-scheme:light){body{background:#0a0a0d!important}}
</style>
</head>
<body>
<div class="cover">
  <div class="cover-logo">DorkNio · Recon Workspace · Export Report</div>
  <div class="cover-title">Recon <span>Intelligence</span><br/>Report</div>
  <div class="cover-sub">Generated on ${now} — Confidential. For authorized use only.</div>
  <div class="cover-meta">
    <div class="meta-item"><div class="meta-label">Total Queries</div><div class="meta-val">${String(totalQueries).padStart(2, '0')}</div></div>
    <div class="meta-item"><div class="meta-label">Avg. Complexity</div><div class="meta-val">${avgScore}<span style="font-size:14px;color:#52525b">/10</span></div></div>
    <div class="meta-item"><div class="meta-label">Starred</div><div class="meta-val">${starred}</div></div>
    <div class="meta-item"><div class="meta-label">Export Date</div><div class="meta-val" style="font-size:13px;padding-top:6px">${dateStr.replace(/_/g, '-')}</div></div>
  </div>
</div>
<div class="section">
  <div class="section-hd">
    <div class="section-badge">LOG</div>
    <div class="section-title">Full Query Registry — ${totalQueries} Records</div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Generated Query</th><th>Objective</th><th>Risk Score</th><th>Engines</th><th>Timestamp</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<div class="footer">
  <div class="footer-brand">DorkNio · Automated Recon Platform</div>
  <div class="footer-ts">Report ID: RECON-${Date.now()}</div>
</div>
</body>
</html>`;


    // Also trigger a download of the HTML report file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // 1. Open in new tab for immediate viewing/printing
    const reportWin = window.open('', '_blank');
    if (reportWin) {
      reportWin.document.write(html);
      reportWin.document.close();
    }

    // 2. Trigger automatic download
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `dorknio_recon_${dateStr}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    return;

  }

  let content = '';
  let mimeType = 'text/plain';
  const filename = `dorknio_recon_${dateStr}.${format}`;

  if (format === 'txt') {
    content = items.map(i => i.query).join('\r\n');
    mimeType = 'text/plain';
  } else if (format === 'csv') {
    const headers = ['Query', 'Goal', 'Engines', 'Score', 'Timestamp'];
    const rows = items.map(i => [
      i.query,
      i.goal,
      (i.engines || (i as any).engine || ['google']).join(';'),
      i.score,
      new Date(i.timestamp).toISOString()
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    content = [headers.join(','), ...rows].join('\r\n');
    mimeType = 'text/csv';
  } else if (format === 'json') {
    const clean = items.map((i, idx) => ({
      index: idx + 1,
      query: i.query,
      goal: i.goal,
      score: i.score,
      engines: i.engines || ['google'],
      starred: i.starred || false,
      timestamp: new Date(i.timestamp).toLocaleString(),
    }));
    content = JSON.stringify(clean, null, 2);
    mimeType = 'application/json';

  } else if (format === 'md') {
    const dateStr2 = new Date().toLocaleString();
    const rows = items.map((i, idx) =>
      `### #${String(idx + 1).padStart(2, '0')} — ${i.goal.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\n\`\`\`\n${i.query}\n\`\`\`\n\n| Field | Value |\n|---|---|\n| Score | ${i.score}/10 |\n| Engines | ${(i.engines || ['google']).join(', ')} |\n| Starred | ${i.starred ? '⭐ Yes' : 'No'} |\n| Timestamp | ${new Date(i.timestamp).toLocaleString()} |`
    ).join('\n\n---\n\n');
    content = `# DorkNio Recon Report\n\n> Generated: ${dateStr2} · ${items.length} queries\n\n---\n\n${rows}\n`;
    mimeType = 'text/markdown';

  }

  // Download the file
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);

  // Build a styled HTML preview page and write it directly to a new tab (same as PDF)
  const escaped = escapeHtml(content);
  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>DorkNio – ${format.toUpperCase()} Preview</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0a0a0d;color:#fafafa;font-family:'IBM Plex Mono',monospace;padding:40px 64px;line-height:1.8;font-size:13px;min-height:100vh}
  .header{border-bottom:1px solid #27272a;padding-bottom:20px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-end}
  .brand{font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:0.1em}
  .badge{background:rgba(34,211,238,0.1);color:#22d3ee;font-size:10px;font-weight:700;padding:4px 10px;border-radius:5px;letter-spacing:0.05em;text-transform:uppercase}
  pre{white-space:pre-wrap;word-break:break-word;color:#a1a1aa}
</style>
</head>
<body>
<div class="header">
  <div class="brand">DorkNio · Recon Workspace · ${format.toUpperCase()} Report</div>
  <div class="badge">${items.length} Records</div>
</div>
<pre>${escaped}</pre>
</body>
</html>`;

  const previewWin = window.open('', '_blank');
  if (previewWin) {
    previewWin.document.write(previewHtml);
    previewWin.document.close();
    previewWin.blur();
    window.focus();
  }
}

function RiskBadge({ score }: { score: number }) {
  const cls = score > 7 ? 'risk-critical' : score > 5 ? 'risk-high' : score > 3 ? 'risk-medium' : 'risk-low';
  return <span className={`risk ${cls}`}>{score}/10</span>;
}

function getSourceLabel(item: HistoryItem): string {
  if (item.presetName) return item.presetName;
  if (item.origin === 'execute') return 'Executed Query';
  if (item.origin === 'copy') return 'Copied Query';
  return 'Builder Query';
}

const GOAL_LABELS: { [key: string]: string } = {
  'surface-mapping': 'Surface Mapping',
  'admin-login': 'Admin Login',
  'exposed-files': 'Exposed Files',
  'config-credential': 'Config & Creds',
  'open-directory': 'Open Directory',
  'error-pages': 'Error Pages',
  'api-endpoints': 'API Endpoints',
  'source-control': 'Source Control',
  'cloud-storage': 'Cloud Storage',
  'credential-hunt': 'Credential Hunt',
  'vuln-params': 'Vuln Parameters',
  'tech-fingerprint': 'Tech Fingerprint',
  'custom': 'Custom',
};

const GOAL_ICONS: { [key: string]: string } = {
  'surface-mapping': '🗺️',
  'admin-login': '🔐',
  'exposed-files': '📄',
  'config-credential': '🔑',
  'open-directory': '📁',
  'error-pages': '⚠️',
  'api-endpoints': '🔌',
  'source-control': '📦',
  'cloud-storage': '☁️',
  'credential-hunt': '🎣',
  'vuln-params': '⚡',
  'tech-fingerprint': '🔍',
  'custom': '✏️',
};

export default function HistoryTab({ history, onCopy, onDelete, onStar, onSendToBuilder, onClear: _onClear, runProcess, showToast }: Props) {
  const [search, setSearch] = useState('');
  const [filterGoal] = useState('');
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const list = history.filter(h =>
      (h.query.toLowerCase().includes(term) || h.goal.toLowerCase().includes(term)) &&
      (!filterGoal || h.goal === filterGoal)
    );
    // Professional Sort: Starred items always on top, then by most recent
    return list.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [history, search, filterGoal]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const starred = filtered.filter(h => h.starred).length;
    const avgScore = total
      ? (filtered.reduce((acc, h) => acc + h.score, 0) / total).toFixed(1)
      : '0.0';

    return { total, starred, avgScore };
  }, [filtered]);

  const topGoals = useMemo(() => {
    const goalCounts = filtered.reduce((acc, item) => {
      if (!acc[item.goal]) {
        acc[item.goal] = { count: 0, totalScore: 0 };
      }
      acc[item.goal].count += 1;
      acc[item.goal].totalScore += item.score;
      return acc;
    }, {} as { [key: string]: { count: number; totalScore: number } });

    return Object.entries(goalCounts)
      .map(([goal, data]) => ({
        goal,
        label: GOAL_LABELS[goal] || goal,
        icon: GOAL_ICONS[goal] || '📊',
        count: data.count,
        avgScore: data.totalScore / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filtered]);

  return (
    <div className="history-layout fade-up">
      <div className="page-hero">
        <div className="section-title" style={{ fontSize: 'clamp(1.8rem, 6vw, 3.2rem)', marginBottom: 12, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, animation: 'slideInUp 0.39s ease-out' }}>Query <span style={{ color: 'var(--accent)' }}>History & Logs</span></div>
        <div className="section-desc" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: 'var(--muted)', fontWeight: 400, animation: 'slideInUp 0.39s ease-out' }}>Review, manage, and export your previously generated recon queries with technical precision.</div>
      </div>

      <div
        className="history-top-row"
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'stretch',
          width: '100%',
          marginBottom: 14,
          animation: 'slideInUp 0.31s ease-out'
        }}
      >
        <div className="history-chart-card" style={{ flex: '1 1 auto', alignSelf: 'stretch', minWidth: 0 }}>
          <div
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 16,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                🎯 Top 7 Search Types
              </div>
              {hoveredBar && (
                <div className="fade-in" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ opacity: 0.5 }}>ANALYZE:</span> {GOAL_LABELS[hoveredBar] || hoveredBar.toUpperCase().replace(/-/g, ' ')}
                </div>
              )}
            </div>

            <div className="chart-scroll-area">
              {topGoals.map((goal) => {
                const totalCount = filtered.length;
                const percentageFill = (goal.count / totalCount) * 100;

                return (
                  <div
                    key={goal.goal}
                    className="chart-bar-wrapper"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      height: '100%',
                      justifyContent: 'flex-end',
                      flex: '0 0 auto',
                      width: 110,
                    }}
                  >
                    <div className="chart-tooltip">
                      {goal.label} <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>({goal.count})</span>
                    </div>
                    <div
                      style={{
                        width: 68,
                        height: '100%',
                        background: 'var(--s2)',
                        borderRadius: '5px',
                        transition: 'all 0.3s ease',
                        cursor: 'default',
                        position: 'relative',
                        overflow: 'hidden',
                        border: `1px solid ${hoveredBar === goal.goal ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                      onMouseEnter={(e) => {
                        setHoveredBar(goal.goal);
                        const fill = e.currentTarget.querySelector('[data-fill]') as HTMLElement;
                        if (fill) fill.style.opacity = '0.7';
                      }}
                      onMouseLeave={(e) => {
                        setHoveredBar(null);
                        const fill = e.currentTarget.querySelector('[data-fill]') as HTMLElement;
                        if (fill) fill.style.opacity = '0.9';
                      }}
                    >
                      <div
                        data-fill
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: `${percentageFill}%`,
                          background: 'var(--accent)', // Solid color
                          borderRadius: '5px 5px 0 0',
                          transition: 'all 0.3s ease',
                          opacity: 0.9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'white', textAlign: 'center' }}>
                          {Math.round(percentageFill)}%
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)', textAlign: 'center', padding: '0 4px', width: '100%', lineHeight: 1.2, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ 
                        fontSize: 10, 
                        fontWeight: hoveredBar === goal.goal ? 800 : 600, 
                        color: hoveredBar === goal.goal ? 'var(--accent)' : 'var(--text)', 
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'normal', // Allow wrap but height is fixed
                        wordBreak: 'break-word'
                      }}>
                        {goal.icon}{goal.label.split(' ')[0]} ({goal.count})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {topGoals.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--dim)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                  <div style={{ fontSize: 13 }}>No search history yet</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="history-actions-card" style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <div style={{ border: '1px solid var(--border)', background: 'var(--s2)', borderRadius: 10, padding: 12, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>Total Queries</div>
            <div style={{ fontFamily: 'var(--heading)', color: 'var(--accent)', fontWeight: 900, fontSize: 22, marginTop: 6 }}>
              {stats.total}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', background: 'var(--s2)', borderRadius: 10, padding: 12, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>Starred</div>
            <div style={{ fontFamily: 'var(--heading)', color: 'var(--accent)', fontWeight: 900, fontSize: 22, marginTop: 6 }}>
              {stats.starred}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', background: 'var(--s2)', borderRadius: 10, padding: 12, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'slideInUp 0.28s ease-out' }}>
            <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)' }}>Avg Score</div>
            <div style={{ fontFamily: 'var(--heading)', color: 'var(--accent)', fontWeight: 900, fontSize: 22, marginTop: 6 }}>
              {stats.avgScore}
            </div>
          </div>
        </div>
      </div>

      <div className="template-domain-bar" style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--s1)', padding: '0', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', flexWrap: 'wrap', width: '100%', marginBottom: 14, animation: 'slideInUp 0.31s ease-out' }}>
        <input className="form-input" style={{ flex: 1, padding: '18px 24px', fontSize: '17px', border: 'none', background: 'transparent' }} placeholder="🔍 Search queries..." value={search} onChange={e => setSearch(sanitizeInput(e.target.value, 100))} />
      </div>


      {/* HISTORY LIST */}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{history.length === 0 ? '🕐' : '🔍'}</div>
          <div className="empty-state-text">{history.length === 0 ? 'No queries saved yet. Build a query and click Save.' : 'No queries match your filter.'}</div>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map(item => {
            return (
              <div key={item.id} className={`history-item${item.starred ? ' starred' : ''}`} style={{ marginBottom: 8, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
                  <div className="history-query-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--dim)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>Generated Query</div>
                    <div className="history-query" onClick={() => onCopy(item.query)} style={{ margin: 0, padding: '4px 0', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', cursor: 'copy', width: 'fit-content', minWidth: '200px', maxWidth: '800px' }}>
                      {item.query.split(/(\s+OR\s+|\s+AND\s+)/i).map((part, i) => {
                        const operatorMatch = part.match(/^\s*(OR|AND)\s*$/i);
                        if (operatorMatch) {
                          return <span key={i} style={{ fontWeight: 800, color: '#fafafa', fontSize: '13.5px', fontFamily: 'var(--mono)', padding: '0 4px' }}>{operatorMatch[1].toUpperCase()}</span>;
                        }
                        if (!part.trim()) return null;
                        return (
                          <span key={i} style={{
                            background: 'rgba(34,211,238,0.05)',
                            color: 'var(--accent)',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(34,211,238,0.15)',
                            fontFamily: 'var(--mono)',
                            fontSize: '13.5px',
                            wordBreak: 'break-all'
                          }}>
                            {part.trim()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="history-right-cluster" style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
                  <div className="history-meta-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="meta-tag" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 999 }}>
                      {getSourceLabel(item)}
                    </span>
                    <span className="meta-tag" style={{ color: item.starred ? 'var(--amber)' : 'var(--dim)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.goal}</span>
                    <RiskBadge score={item.score} />
                    <span className="meta-time" style={{ opacity: 0.6, fontSize: 11, fontFamily: 'var(--mono)' }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="history-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="btn-icon" onClick={() => onStar(item.id)} title={item.starred ? 'Unstar' : 'Star'} style={{ color: item.starred ? 'var(--amber)' : 'inherit', borderColor: item.starred ? 'var(--amber)' : 'inherit', background: item.starred ? 'rgba(255,191,0,0.1)' : 'transparent', width: 28, height: 28 }}>
                      {item.starred ? '★' : '☆'}
                    </button>
                    <button className="btn-icon" onClick={() => onSendToBuilder(item)} title="Load in Builder" style={{ width: 28, height: 28 }}>⚡</button>
                    <button className="btn-icon" onClick={() => onDelete(item.id)} title="Delete" style={{ width: 28, height: 28 }}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <div className="export-panel" style={{
          marginTop: 12,
          padding: '12px 20px',
          background: 'var(--s1)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          textAlign: 'left'
        }}>
          <div className="section-header" style={{ margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="section-badge" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '10px', padding: '2px 8px' }}>EXT</div>
            <div className="section-title" style={{ fontSize: '24px', margin: 0, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', fontFamily: 'var(--heading)', textTransform: 'none' }}>
              Report <span style={{ color: 'var(--accent)', marginLeft: 4 }}>Generation</span>
            </div>
          </div>
          <div className="history-export-grid export-toolbar" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10
          }}>
            {(['txt', 'csv', 'json', 'md', 'pdf'] as const).map(f => (
              <button key={f}
                className="btn-export"
                onClick={() => {
                  exportData(history, f);
                  runProcess(`Compiling ${f.toUpperCase()} Archive...`, 800, () => {
                    showToast(`${f.toUpperCase()} report generated successfully`);
                  });
                }}
                style={{
                  padding: '11px 22px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--s2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.03em',
                  width: '100%',
                  justifyContent: 'center'
                }}>
                <span style={{ opacity: 0.8, fontSize: 14, marginRight: 4 }}>⬇</span> {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
