import type { BuilderInputs, GeneratedQuery, HighlightedToken, FollowUpDork, SearchGoal, ExplanationPart } from '../types';
import { TECH_PATTERNS } from '../data/operators';
import { v4 as uuidv4 } from '../utils/uuid';

function quote(s: string): string {
  return s.includes(' ') ? `"${s}"` : s;
}

export function buildQuery(inputs: BuilderInputs): string {
  const parts: string[] = [];

  // 1. Domain scope
  if (inputs.domain.trim()) {
    const d = inputs.domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (inputs.includeSubdomains) {
      parts.push(`site:*.${d}`);
    } else {
      parts.push(`site:${d}`);
    }
  }

  // 2. Exclude subdomains
  inputs.excludeSubdomains.filter(Boolean).forEach(sub => {
    parts.push(`-site:${sub.trim()}`);
  });

  // 3. File types
  if (inputs.fileTypes.length === 1) {
    parts.push(`filetype:${inputs.fileTypes[0]}`);
  } else if (inputs.fileTypes.length > 1) {
    parts.push(inputs.fileTypes.map(f => `filetype:${f}`).join(' OR '));
  }

  // 4. Technology patterns
  if (inputs.technology && TECH_PATTERNS[inputs.technology]) {
    parts.push(TECH_PATTERNS[inputs.technology]);
  }

  // 5. Title keywords
  if (inputs.titleKeywords.length === 1) {
    parts.push(`intitle:${quote(inputs.titleKeywords[0])}`);
  } else if (inputs.titleKeywords.length > 1) {
    parts.push(`allintitle:${inputs.titleKeywords.join(' ')}`);
  }

  // 6. URL pattern
  if (inputs.urlPattern.trim()) {
    // Support multiple URL pattern tags (space separated in the inputs.urlPattern string).
    // If there's one pattern, use `inurl:`. If multiple, use `allinurl:` to require all terms in the URL,
    // matching the behavior used for title keywords (intitle/allintitle).
    const urlParts = inputs.urlPattern.trim().split(/\s+/).filter(Boolean);
    if (urlParts.length === 1) {
      parts.push(`inurl:${quote(urlParts[0])}`);
    } else if (urlParts.length > 1) {
      parts.push(`allinurl:${urlParts.join(' ')}`);
    }
  }

  // 7. URL parameters
  if (inputs.paramNames.length > 0) {
    if (inputs.paramNames.length === 1) {
      parts.push(`inurl:"?${inputs.paramNames[0]}="`);
    } else {
      parts.push(inputs.paramNames.map(p => `inurl:"?${p}="`).join(' OR '));
    }
  }

  // 8. Body keywords
  if (inputs.bodyKeywords.length === 1) {
    parts.push(`intext:${quote(inputs.bodyKeywords[0])}`);
  } else if (inputs.bodyKeywords.length > 1) {
    parts.push(`allintext:${inputs.bodyKeywords.join(' ')}`);
  }

  // 8.5. Anchor keywords
  if (inputs.anchorKeywords && inputs.anchorKeywords.length === 1) {
    parts.push(`inanchor:${quote(inputs.anchorKeywords[0])}`);
  } else if (inputs.anchorKeywords && inputs.anchorKeywords.length > 1) {
    parts.push(`allinanchor:${inputs.anchorKeywords.join(' ')}`);
  }

  // 9. Exact phrases
  inputs.exactPhrases.filter(Boolean).forEach(phrase => {
    parts.push(`"${phrase.replace(/"/g, '')}"`);
  });

  // 10. Goal-driven defaults
  const goalParts = getGoalDefaults(inputs.searchGoal, inputs.domain);
  goalParts.forEach(p => { if (!parts.join(' ').includes(p)) parts.push(p); });

  // 11. Noise reduction
  inputs.noiseReduction.forEach(n => parts.push(`-inurl:${n}`));

  // 12. Exclude keywords
  inputs.excludeKeywords.filter(Boolean).forEach(kw => {
    parts.push(`-${quote(kw.trim())}`);
  });

  // 13. Range
  if (inputs.rangeMin && inputs.rangeMax) {
    parts.push(`${inputs.rangeMin}..${inputs.rangeMax}`);
  }

  // 14. Cache/Info/Related prefix (separate query)
  let prefix = '';
  if (inputs.useCache && inputs.domain) {
    prefix = `cache:${inputs.domain.trim()} `;
  } else if (inputs.useInfo && inputs.domain) {
    prefix = `info:${inputs.domain.trim()} `;
  } else if (inputs.useRelated && inputs.domain) {
    prefix = `related:${inputs.domain.trim()} `;
  }

  return (prefix + parts.join(' ')).trim();
}

function getGoalDefaults(goal: SearchGoal, _domain: string): string[] {
  switch (goal) {
    case 'surface-mapping':
      return ['inurl:www OR inurl:api OR inurl:dev OR inurl:staging'];
    case 'admin-login':
      return ['intitle:"login" OR intitle:"signin" OR inurl:login'];
    case 'exposed-files':
      return ['intitle:"index of" "backup"'];
    case 'config-credential':
      return ['"DB_PASSWORD" OR "DB_USERNAME" OR "SECRET_KEY"'];
    case 'open-directory':
      return ['intitle:"index of"'];
    case 'error-pages':
      return ['intext:"error" OR intext:"exception" OR intext:"stack trace"'];
    case 'api-endpoints':
      return ['inurl:/api/v1 OR inurl:/api/v2 OR inurl:swagger'];
    case 'source-control':
      return ['inurl:"/.git/" OR inurl:"/.svn/" OR inurl:"/.env"'];
    case 'cloud-storage':
      return ['site:s3.amazonaws.com OR site:storage.googleapis.com'];
    case 'credential-hunt':
      return ['"password" OR "passwd" OR "api_key"'];
    case 'vuln-params':
      return ['inurl:"?id=" OR inurl:"?cat=" OR inurl:"?page="'];
    case 'tech-fingerprint':
      return ['inurl:/wp-content/ OR inurl:/node_modules/'];
    default:
      return [];
  }
}

export function tokenize(query: string): HighlightedToken[] {
  const tokens: HighlightedToken[] = [];
  const regex = /(site:|intitle:|allintitle:|inurl:|allinurl:|intext:|allintext:|inanchor:|allinanchor:|filetype:|ext:|cache:|related:|info:|-inurl:|-site:|-intitle:|"[^"]*"|-\w+|\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(query)) !== null) {
    const text = match[0];
    tokens.push({ text: text + ' ', type: classifyToken(text) });
  }
  return tokens;
}

function classifyToken(token: string): HighlightedToken['type'] {
  if (token.startsWith('site:') || token.startsWith('-site:')) return 'site';
  if (token.startsWith('intitle:') || token.startsWith('allintitle:')) return 'intitle';
  if (token.startsWith('inurl:') || token.startsWith('allinurl:') || token.startsWith('-inurl:')) return 'inurl';
  if (token.startsWith('intext:') || token.startsWith('allintext:')) return 'intext';
  if (token.startsWith('inanchor:') || token.startsWith('allinanchor:')) return 'intext'; // Style as intext
  if (token.startsWith('filetype:') || token.startsWith('ext:')) return 'filetype';
  if (token.startsWith('cache:') || token.startsWith('related:') || token.startsWith('info:')) return 'meta';
  if (token.startsWith('"') && token.endsWith('"')) return 'phrase';
  if (token.startsWith('-')) return 'exclude';
  if (token === 'OR' || token === '|') return 'boolean';
  return 'plain';
}

export function scoreQuery(query: string): number {
  if (!query.trim()) return 0;
  let score = 0;
  if (/site:/.test(query)) score += 2;
  if (/filetype:/.test(query)) score += 2;
  if (/intitle:|allintitle:/.test(query)) score += 1.5;
  if (/inurl:|allinurl:/.test(query)) score += 1.5;
  if (/intext:|allintext:|inanchor:|allinanchor:/.test(query)) score += 1;
  if (/"[^"]+"/.test(query)) score += 1;
  if (/-\w+/.test(query)) score += 0.5;
  if (/OR/.test(query)) score += 0.5;
  const operatorCount = (query.match(/\w+:/g) || []).length;
  if (operatorCount >= 3) score += 1;
  return Math.min(10, Math.round(score));
}

export function explainQueryStructured(query: string): ExplanationPart[] {
  const parts: ExplanationPart[] = [];
  
  if (/site:(\S+)/.test(query)) {
    const m = query.match(/site:(\S+)/);
    parts.push({ operator: `site:${m?.[1]}`, desc: `Restricts the search scope strictly to the ${m?.[1]} domain.` });
  }
  
  if (/filetype:(\S+)/.test(query)) {
    const m = query.match(/filetype:(\S+)/);
    parts.push({ operator: `filetype:${m?.[1]}`, desc: `Filters results to only include ${m?.[1].toUpperCase()} files.` });
  }

  if (/intitle:"?([^"\s]+)"?/.test(query)) {
    const m = query.match(/intitle:"?([^"]+)"?/);
    parts.push({ operator: `intitle:${m?.[1]}`, desc: `Requires the specified keyword to appear in the page title.` });
  }

  if (/inurl:(\S+)/.test(query)) {
    const m = query.match(/inurl:(\S+)/);
    parts.push({ operator: `inurl:${m?.[1]}`, desc: `Ensures the URL string contains the technical pattern: ${m?.[1]}.` });
  }

  if (/intext:"?([^"\s]+)"?/.test(query)) {
    const m = query.match(/intext:"?([^"]+)"?/);
    parts.push({ operator: `intext:${m?.[1]}`, desc: `Scans the visible body text of the page for the specific term.` });
  }

  if (/inanchor:"?([^"\s]+)"?/.test(query)) {
    const m = query.match(/inanchor:"?([^"]+)"?/);
    parts.push({ operator: `inanchor:${m?.[1]}`, desc: `Scans for hyperlinks containing the specified anchor text.` });
  }

  const exclusions = (query.match(/-\w+/g) || []).filter(e => e !== '-site:' && e !== '-inurl:');
  if (exclusions.length > 0) {
    parts.push({ operator: exclusions.join(' '), desc: `Excludes irrelevant results containing these specific strings or patterns.` });
  }

  return parts;
}

export function explainQuery(query: string, goal: string): string {
  const parts = explainQueryStructured(query);
  if (parts.length === 0) return `Advanced search for ${goal}.`;
  return parts.map(p => p.desc).join(' ') + ` Context: ${goal}.`;
}

export function getFollowUps(inputs: BuilderInputs): FollowUpDork[] {
  const domain = inputs.domain ? `site:${inputs.domain}` : '';
  const followUps: FollowUpDork[] = [];

  switch (inputs.searchGoal) {
    case 'admin-login':
      followUps.push(
        { query: `${domain} inurl:/wp-login.php`.trim(), purpose: 'Check for WordPress login', risk: 'high' },
        { query: `${domain} filetype:env "DB_PASSWORD"`.trim(), purpose: 'Hunt for credential leaks', risk: 'critical' },
        { query: `${domain} intitle:"phpinfo()"`.trim(), purpose: 'Check for exposed PHP info', risk: 'high' },
      );
      break;
    case 'exposed-files':
      followUps.push(
        { query: `${domain} intitle:"index of" "backup"`.trim(), purpose: 'Check open backup directories', risk: 'high' },
        { query: `${domain} inurl:"/.git/" intitle:"index of"`.trim(), purpose: 'Hunt exposed git repos', risk: 'critical' },
        { query: `${domain} filetype:log intext:"password"`.trim(), purpose: 'Find password in log files', risk: 'critical' },
      );
      break;
    case 'config-credential':
      followUps.push(
        { query: `site:github.com "${inputs.domain}" "password"`.trim(), purpose: 'Check GitHub for credential leaks', risk: 'critical' },
        { query: `site:pastebin.com "${inputs.domain}"`.trim(), purpose: 'Check Pastebin for leaks', risk: 'critical' },
        { query: `${domain} filetype:yml intext:"password:"`.trim(), purpose: 'Find YAML configs with passwords', risk: 'critical' },
      );
      break;
    case 'api-endpoints':
      followUps.push(
        { query: `${domain} inurl:swagger`.trim(), purpose: 'Find Swagger/OpenAPI docs', risk: 'medium' },
        { query: `${domain} inurl:"?id=" OR inurl:"?page="`.trim(), purpose: 'Find injectable parameters', risk: 'medium' },
        { query: `${domain} intitle:"Grafana" inurl:/login`.trim(), purpose: 'Find Grafana dashboards', risk: 'high' },
      );
      break;
    default:
      followUps.push(
        { query: `${domain} intitle:"index of"`.trim(), purpose: 'Check for open directories', risk: 'medium' },
        { query: `${domain} filetype:env OR filetype:log OR filetype:sql`.trim(), purpose: 'Sweep sensitive file types', risk: 'critical' },
        { query: `site:*.${inputs.domain} -www`.trim(), purpose: 'Enumerate subdomains', risk: 'low' },
      );
  }
  return followUps.slice(0, 3);
}

export function getSearchUrl(query: string, engine: string): string {
  const encoded = encodeURIComponent(query);
  switch (engine) {
    case 'bing': return `https://www.bing.com/search?q=${encoded}`;
    case 'duckduckgo': return `https://duckduckgo.com/?q=${encoded}`;
    default: return `https://www.google.com/search?q=${encoded}`;
  }
}

export function createGeneratedQuery(inputs: BuilderInputs, raw: string): GeneratedQuery {
  return {
    id: uuidv4(),
    raw,
    highlighted: tokenize(raw),
    score: scoreQuery(raw),
    explanation: explainQuery(raw, inputs.searchGoal),
    structuredExplanation: explainQueryStructured(raw),
    intent: inputs.searchGoal,
    searchUrl: getSearchUrl(raw, inputs.searchEngines[0] || 'google'),
    followUps: getFollowUps(inputs),
    inputs,
    goal: inputs.searchGoal,
    engines: inputs.searchEngines,
    timestamp: new Date().toISOString(),
    starred: false,
  };
}

/**
 * Parses a raw dork string into BuilderInputs.
 * This is a best-effort parser used to populate the builder UI from a string template.
 */
export function parseDorkToInputs(dork: string, current: BuilderInputs): BuilderInputs {
  const next = { ...current };
  
  // Extract site:
  const siteMatch = dork.match(/site:([^\s]+)/) || dork.match(/host:([^\s]+)/);
  if (siteMatch) next.domain = siteMatch[1];

  // Extract filetype:
  const ftMatches = dork.matchAll(/(?:filetype:|ext:)([^\s"|]+)/g);
  for (const m of ftMatches) {
    const ft = m[1].startsWith('.') ? m[1] : '.' + m[1];
    if (!next.fileTypes.includes(ft)) next.fileTypes = [...next.fileTypes, ft];
  }

  // Extract intitle:
  const titleMatches = dork.matchAll(/intitle:(?:"([^"]+)"|([^\s]+))/g);
  for (const m of titleMatches) {
    const val = m[1] || m[2];
    if (val && !next.titleKeywords.includes(val)) next.titleKeywords = [...next.titleKeywords, val];
  }

  // Extract inurl:
  const urlMatches = dork.matchAll(/inurl:(?:"([^"]+)"|([^\s]+))/g);
  for (const m of urlMatches) {
    const val = m[1] || m[2];
    if (val && !next.urlPattern.includes(val)) {
      next.urlPattern = next.urlPattern ? next.urlPattern + ' ' + val : val;
    }
  }

  // Extract intext:
  const textMatches = dork.matchAll(/intext:(?:"([^"]+)"|([^\s]+))/g);
  for (const m of textMatches) {
    const val = m[1] || m[2];
    if (val && !next.bodyKeywords.includes(val)) next.bodyKeywords = [...next.bodyKeywords, val];
  }

  // Extract inanchor:
  const anchorMatches = dork.matchAll(/inanchor:(?:"([^"]+)"|([^\s]+))/g);
  for (const m of anchorMatches) {
    const val = m[1] || m[2];
    if (val && !next.anchorKeywords.includes(val)) {
      if (!next.anchorKeywords) next.anchorKeywords = [];
      next.anchorKeywords = [...next.anchorKeywords, val];
    }
  }

  // Extract -site: (exclude subdomains)
  const excludeSiteMatches = dork.matchAll(/-site:([^\s]+)/g);
  for (const m of excludeSiteMatches) {
    const val = m[1];
    if (val && !next.excludeSubdomains.includes(val)) next.excludeSubdomains = [...next.excludeSubdomains, val];
  }

  // Extract -inurl: (noise reduction)
  const excludeUrlMatches = dork.matchAll(/-inurl:([^\s]+)/g);
  for (const m of excludeUrlMatches) {
    const val = m[1];
    if (val && !next.noiseReduction.includes(val)) next.noiseReduction = [...next.noiseReduction, val];
  }

  // Extract -keywords (exclude keywords)
  const excludeKwMatches = dork.matchAll(/(?:\s|^)-([^\s:]+)/g);
  for (const m of excludeKwMatches) {
    const val = m[1];
    if (val && !next.excludeKeywords.includes(val)) next.excludeKeywords = [...next.excludeKeywords, val];
  }

  // Extract exact phrases
  const phraseMatches = dork.matchAll(/"([^"]+)"/g);
  for (const m of phraseMatches) {
    const val = m[1];
    // Avoid double-counting if it was part of an operator
    if (!dork.includes(':' + m[0]) && !next.exactPhrases.includes(val)) {
      next.exactPhrases = [...next.exactPhrases, val];
    }
  }

  return next;
}

/**
 * Merges two BuilderInputs objects additively.
 */
export function mergeInputs(current: BuilderInputs, incoming: BuilderInputs): BuilderInputs {
  const merged = { ...current };
  
  // Array fields - merge and unique
  const arrayFields: (keyof BuilderInputs)[] = [
    'excludeSubdomains', 'titleKeywords', 'bodyKeywords', 'exactPhrases',
    'anchorKeywords', 'excludeKeywords', 'fileTypes', 'paramNames', 
    'noiseReduction', 'searchEngines'
  ];
  
  arrayFields.forEach(field => {
    const currentVal = Array.isArray(current[field]) ? (current[field] as any[]) : [];
    const incomingVal = Array.isArray(incoming[field]) ? (incoming[field] as any[]) : [];
    (merged as any)[field] = Array.from(new Set([...currentVal, ...incomingVal]));
  });

  // String fields - overwrite if current is empty or if incoming is non-empty
  const stringFields: (keyof BuilderInputs)[] = ['domain', 'urlPattern', 'technology', 'rangeMin', 'rangeMax'];
  stringFields.forEach(field => {
    const incomingVal = incoming[field] as string;
    if (incomingVal && incomingVal.trim()) {
      if (!merged[field] || (merged[field] as string).trim() === '') {
        (merged as any)[field] = incomingVal;
      } else if (merged[field] !== incomingVal) {
        // For urlPattern, maybe append?
        if (field === 'urlPattern') {
          if (!(merged[field] as string).includes(incomingVal)) {
            (merged as any)[field] = merged[field] + ' ' + incomingVal;
          }
        } else {
           (merged as any)[field] = incomingVal;
        }
      }
    }
  });

  // Booleans - OR
  const boolFields: (keyof BuilderInputs)[] = ['includeSubdomains', 'useWildcard', 'useCache', 'useInfo', 'useRelated'];
  boolFields.forEach(field => {
    (merged as any)[field] = (current[field] as boolean) || (incoming[field] as boolean);
  });

  // Goal - usually incoming takes priority if it's not custom
  if (incoming.searchGoal && incoming.searchGoal !== 'custom') {
    merged.searchGoal = incoming.searchGoal;
  }

  return merged;
}
