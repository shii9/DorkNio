import React, { useState, useRef, useEffect } from 'react';

export interface AccentOption {
  id: string;
  name: string;
  color: string;
  bg: string;
  glow: string;
  tint: string;
  s1: string;
}

export const ACCENTS: AccentOption[] = [
  { id: 'cyan', name: 'Cyan', color: '#17a2b8', bg: 'rgba(23,162,184,0.12)', glow: 'rgba(23,162,184,0.15)', tint: '#080c0d', s1: '#0c1214' },
  { id: 'blue', name: 'Blue', color: '#4a7cf2', bg: 'rgba(74,124,242,0.12)', glow: 'rgba(74,124,242,0.15)', tint: '#08090d', s1: '#0c0e14' },
  { id: 'purple', name: 'Purple', color: '#8a6df2', bg: 'rgba(138,109,242,0.12)', glow: 'rgba(138,109,242,0.15)', tint: '#0a080d', s1: '#100c14' },
  { id: 'emerald', name: 'Emerald', color: '#2ab88b', bg: 'rgba(42,184,139,0.12)', glow: 'rgba(42,184,139,0.15)', tint: '#080d09', s1: '#0c140e' },
  { id: 'rose', name: 'Rose', color: '#d84b65', bg: 'rgba(216,75,101,0.12)', glow: 'rgba(216,75,101,0.15)', tint: '#0d0808', s1: '#140c0c' },
];

interface ThemePickerProps {
  currentAccent: string;
  onSelect: (accent: AccentOption) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({ currentAccent, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="theme-picker-container" ref={containerRef}>
      <button 
        className="nav-icon-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme Color"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.72 1.5-1.5 0-.45-.18-.85-.45-1.2-.28-.35-.45-.81-.45-1.3 0-1.1.9-2 2-2h1.9c3 0 5.5-2.5 5.5-5.5 0-4.97-4.48-9-10-9z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="theme-popover">
          <div className="theme-popover-content">
            <div className="theme-swatch-grid">
              {ACCENTS.map((acc) => (
                <button
                  key={acc.id}
                  className={`theme-swatch ${currentAccent === acc.id ? 'active' : ''}`}
                  style={{ backgroundColor: acc.color }}
                  onClick={() => {
                    onSelect(acc);
                    setIsOpen(false);
                  }}
                  title={acc.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
