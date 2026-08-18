import React from 'react';
import { parsePageRanges } from '../../pdf/pageRangeParser';

interface PageRangeSelectorProps {
  totalPages: number;
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
}

export default function PageRangeSelector({
  totalPages,
  value,
  onChange,
  label = 'Select Pages / Ranges',
  placeholder = 'e.g. 1-5, 8, 11-14',
}: PageRangeSelectorProps) {
  const parsed = parsePageRanges(value, totalPages);
  const selectedCount = parsed.pages.length;

  const handlePresetAll = () => {
    onChange(`1-${totalPages}`);
  };

  const handlePresetOdd = () => {
    const odds: number[] = [];
    for (let p = 1; p <= totalPages; p += 2) odds.push(p);
    onChange(odds.join(', '));
  };

  const handlePresetEven = () => {
    const evens: number[] = [];
    for (let p = 2; p <= totalPages; p += 2) evens.push(p);
    onChange(evens.join(', '));
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f0f0' }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
            onClick={handlePresetAll}
          >
            All
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
            onClick={handlePresetOdd}
          >
            Odd
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
            onClick={handlePresetEven}
          >
            Even
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      <input
        type="text"
        className="input-dark"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.65rem 0.85rem',
          fontSize: '0.9rem',
          borderRadius: '0.65rem',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>
        <span>Document contains <strong>{totalPages}</strong> page(s)</span>
        <span style={{ color: selectedCount > 0 ? '#4ade80' : 'rgba(240,240,240,0.4)', fontWeight: 600 }}>
          {selectedCount} page(s) selected
        </span>
      </div>

      {parsed.error && value.trim().length > 0 && (
        <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>
          {parsed.error}
        </div>
      )}
    </div>
  );
}
