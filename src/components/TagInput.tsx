import React, { useState, type KeyboardEvent } from 'react';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  color?: string;
}

export default function TagInput({ value, onChange, placeholder = 'Type and press Enter...', color = 'var(--accent-primary)' }: Props) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="tag-input-wrap">
      {value.map(tag => (
        <span key={tag} className="tag" style={{ '--tag-color': color } as React.CSSProperties}>
          {tag}
          <button className="tag-remove" onClick={() => onChange(value.filter(t => t !== tag))}>×</button>
        </span>
      ))}
      <input className="tag-bare-input" value={input} placeholder={value.length === 0 ? placeholder : ''}
        onChange={e => setInput(e.target.value)} onKeyDown={handleKey} onBlur={addTag} />
    </div>
  );
}
