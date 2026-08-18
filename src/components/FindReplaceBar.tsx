import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Replace, ChevronDown, ChevronUp, X, EyeOff,
  Check, ArrowRight
} from 'lucide-react';

export interface SearchMatch {
  itemId: string;
  pageNumber: number;
  originalText: string;
  matchedText: string;
}

interface FindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, matchCase: boolean, wholeWord: boolean) => Promise<SearchMatch[]>;
  onReplaceCurrent: (match: SearchMatch, replaceWith: string) => void;
  onReplaceAll: (query: string, replaceWith: string, matchCase: boolean, wholeWord: boolean) => Promise<number>;
  onRedactAll: (query: string, matchCase: boolean, wholeWord: boolean) => Promise<number>;
  onNavigateToMatch: (match: SearchMatch) => void;
  currentMatchIndex: number;
  matches: SearchMatch[];
  setMatches: React.Dispatch<React.SetStateAction<SearchMatch[]>>;
  setCurrentMatchIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function FindReplaceBar({
  isOpen,
  onClose,
  onSearch,
  onReplaceCurrent,
  onReplaceAll,
  onRedactAll,
  onNavigateToMatch,
  currentMatchIndex,
  matches,
  setMatches,
  setCurrentMatchIndex,
}: FindReplaceBarProps) {
  const [query, setQuery] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [showReplace, setShowReplace] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Execute Search whenever query or options change
  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const found = await onSearch(query.trim(), matchCase, wholeWord);
        if (isMounted) {
          setMatches(found);
          if (found.length > 0) {
            setCurrentMatchIndex(0);
            onNavigateToMatch(found[0]);
          } else {
            setCurrentMatchIndex(-1);
          }
          setIsSearching(false);
        }
      } catch (err) {
        console.error('Search failed:', err);
        if (isMounted) setIsSearching(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, matchCase, wholeWord, isOpen, onSearch, onNavigateToMatch, setMatches, setCurrentMatchIndex]);

  if (!isOpen) return null;

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    const next = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(next);
    onNavigateToMatch(matches[next]);
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    const prev = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prev);
    onNavigateToMatch(matches[prev]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    }
  };

  const handleReplaceCurrent = () => {
    if (matches.length === 0 || currentMatchIndex < 0 || !matches[currentMatchIndex]) return;
    const current = matches[currentMatchIndex];
    onReplaceCurrent(current, replaceWith);

    // Re-run search after small delay to refresh matches
    setTimeout(async () => {
      const refreshed = await onSearch(query.trim(), matchCase, wholeWord);
      setMatches(refreshed);
      if (refreshed.length > 0) {
        const nextIdx = Math.min(currentMatchIndex, refreshed.length - 1);
        setCurrentMatchIndex(nextIdx);
        onNavigateToMatch(refreshed[nextIdx]);
      } else {
        setCurrentMatchIndex(-1);
      }
    }, 50);
  };

  const handleReplaceAllClick = async () => {
    if (!query.trim()) return;
    const count = await onReplaceAll(query.trim(), replaceWith, matchCase, wholeWord);
    setNotification(`Replaced ${count} occurrence${count === 1 ? '' : 's'} across document!`);
    setTimeout(() => setNotification(null), 3000);
    setMatches([]);
    setCurrentMatchIndex(-1);
  };

  const handleRedactAllClick = async () => {
    if (!query.trim()) return;
    const count = await onRedactAll(query.trim(), matchCase, wholeWord);
    setNotification(`Redacted ${count} occurrence${count === 1 ? '' : 's'} across document!`);
    setTimeout(() => setNotification(null), 3000);
    setMatches([]);
    setCurrentMatchIndex(-1);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 18,
      zIndex: 1000,
      width: 420,
      maxWidth: 'calc(100vw - 36px)',
      background: 'rgba(20, 20, 32, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '1rem',
      padding: '0.85rem 1rem',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(77,107,250,0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
    }}>
      {/* Top Search Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '0.6rem',
          padding: '0.35rem 0.6rem',
        }}>
          <Search size={14} color="rgba(240,240,240,0.5)" style={{ marginRight: '0.4rem', flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in document…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f0f0f0',
              fontSize: '0.84rem',
              width: '100%',
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setMatches([]);
                setCurrentMatchIndex(-1);
              }}
              style={{ background: 'transparent', border: 'none', color: 'rgba(240,240,240,0.4)', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Counter Badge */}
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: matches.length > 0 ? '#4ade80' : 'rgba(240,240,240,0.4)',
          minWidth: 55,
          textAlign: 'center',
          flexShrink: 0,
        }}>
          {isSearching ? (
            'Searching…'
          ) : query ? (
            matches.length > 0 ? `${currentMatchIndex + 1} of ${matches.length}` : '0 matches'
          ) : (
            '0 found'
          )}
        </div>

        {/* Nav arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
          <button
            className="btn-icon"
            style={{ width: 28, height: 28 }}
            onClick={handlePrevMatch}
            disabled={matches.length === 0}
            title="Previous match (Shift+Enter)"
          >
            <ChevronUp size={14} />
          </button>
          <button
            className="btn-icon"
            style={{ width: 28, height: 28 }}
            onClick={handleNextMatch}
            disabled={matches.length === 0}
            title="Next match (Enter)"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Close Button */}
        <button
          className="btn-icon"
          style={{ width: 28, height: 28 }}
          onClick={onClose}
          title="Close (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* Options Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setMatchCase(p => !p)}
            style={{
              padding: '0.18rem 0.45rem',
              borderRadius: 4,
              background: matchCase ? 'rgba(77,107,250,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${matchCase ? '#4d6bfa' : 'rgba(255,255,255,0.1)'}`,
              color: matchCase ? '#7c9aff' : 'rgba(240,240,240,0.6)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Match Case"
          >
            Aa Match Case
          </button>

          <button
            onClick={() => setWholeWord(p => !p)}
            style={{
              padding: '0.18rem 0.45rem',
              borderRadius: 4,
              background: wholeWord ? 'rgba(77,107,250,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${wholeWord ? '#4d6bfa' : 'rgba(255,255,255,0.1)'}`,
              color: wholeWord ? '#7c9aff' : 'rgba(240,240,240,0.6)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Whole Word Only"
          >
            [W] Whole Word
          </button>
        </div>

        <button
          onClick={() => setShowReplace(p => !p)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#7c9aff',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
          }}
        >
          <Replace size={12} />
          {showReplace ? 'Hide Replace' : 'Replace…'}
        </button>
      </div>

      {/* Replace Panel */}
      {showReplace && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.55rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '0.6rem',
            padding: '0.35rem 0.6rem',
          }}>
            <ArrowRight size={14} color="rgba(240,240,240,0.5)" style={{ marginRight: '0.4rem', flexShrink: 0 }} />
            <input
              type="text"
              value={replaceWith}
              onChange={e => setReplaceWith(e.target.value)}
              placeholder="Replace with…"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f0f0f0',
                fontSize: '0.84rem',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '0.35rem 0.65rem',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
              onClick={handleReplaceCurrent}
              disabled={matches.length === 0 || currentMatchIndex < 0}
              title="Replace active matching occurrence"
            >
              <Check size={12} /> Replace
            </button>

            <button
              className="btn-primary"
              style={{
                flex: 1.2,
                padding: '0.35rem 0.65rem',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                background: '#4d6bfa',
              }}
              onClick={handleReplaceAllClick}
              disabled={matches.length === 0}
              title="Replace all occurrences across all pages"
            >
              <Replace size={12} /> Replace All ({matches.length})
            </button>

            <button
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                background: 'rgba(239,68,68,0.15)',
                borderColor: 'rgba(239,68,68,0.3)',
                color: '#fca5a5',
              }}
              onClick={handleRedactAllClick}
              disabled={matches.length === 0}
              title="Blackout / Redact all matching terms across all pages"
            >
              <EyeOff size={12} /> Redact All
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div style={{
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 6,
          padding: '0.35rem 0.6rem',
          color: '#86efac',
          fontSize: '0.75rem',
          textAlign: 'center',
          fontWeight: 600,
        }}>
          ✓ {notification}
        </div>
      )}
    </div>
  );
}
