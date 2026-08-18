import React from 'react';
import { ChevronLeft, ChevronRight, EyeOff, PenTool, Tag, Edit3, Layers } from 'lucide-react';
import type { RedactionBox, PDFSignatureItem, PDFStampItem, PDFTextItem } from '../types/pdf';

interface PageThumbnailsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  totalPages: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
  pageItems: Record<number, PDFTextItem[]>;
  redactions: Record<number, RedactionBox[]>;
  signatures: Record<number, PDFSignatureItem[]>;
  stamps: Record<number, PDFStampItem[]>;
}

export default function PageThumbnailsSidebar({
  isOpen,
  onToggle,
  totalPages,
  currentPage,
  onSelectPage,
  pageItems,
  redactions,
  signatures,
  stamps,
}: PageThumbnailsSidebarProps) {
  if (totalPages <= 0) return null;

  return (
    <aside
      aria-label="Document Page Navigation and Thumbnails"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: isOpen ? 220 : 44,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(15, 15, 26, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem 0 0 1rem',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Header with Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        padding: '0.75rem 0.6rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        {isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={14} color="#4d6bfa" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0f0f0' }}>Pages ({totalPages})</span>
          </div>
        )}
        <button
          className="btn-icon"
          style={{ width: 28, height: 28 }}
          onClick={onToggle}
          aria-label={isOpen ? 'Collapse page thumbnails sidebar' : 'Expand page thumbnails sidebar'}
          title={isOpen ? 'Collapse thumbnails (Esc)' : 'Show thumbnails'}
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Pages List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isOpen ? '0.75rem 0.6rem' : '0.5rem 0.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
          const isCurrent = currentPage === pageNum;
          const pageRedacts = redactions[pageNum] || [];
          const pageSigs = signatures[pageNum] || [];
          const pageStamps = stamps[pageNum] || [];
          const items = pageItems[pageNum] || [];
          const editedItemsCount = items.filter(it => it.editedText !== it.originalText || it.isDeleted || it.isAdded).length;

          if (!isOpen) {
            // Collapsed Mini Indicator Button
            return (
              <button
                key={pageNum}
                onClick={() => onSelectPage(pageNum)}
                style={{
                  width: 32,
                  height: 38,
                  borderRadius: 6,
                  background: isCurrent ? 'rgba(77,107,250,0.3)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isCurrent ? '#4d6bfa' : 'rgba(255,255,255,0.1)'}`,
                  color: isCurrent ? '#7c9aff' : 'rgba(240,240,240,0.6)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '0 auto',
                  position: 'relative',
                }}
                title={`Page ${pageNum}${pageRedacts.length ? ` · ${pageRedacts.length} redactions` : ''}`}
              >
                {pageNum}
                {(pageRedacts.length > 0 || pageSigs.length > 0 || pageStamps.length > 0) && (
                  <span style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: pageRedacts.length > 0 ? '#ef4444' : '#4ade80',
                  }} />
                )}
              </button>
            );
          }

          // Expanded Full Card
          return (
            <div
              key={pageNum}
              onClick={() => onSelectPage(pageNum)}
              style={{
                borderRadius: '0.65rem',
                background: isCurrent ? 'rgba(77,107,250,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${isCurrent ? '#4d6bfa' : 'rgba(255,255,255,0.08)'}`,
                padding: '0.55rem 0.65rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isCurrent) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={e => {
                if (!isCurrent) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: isCurrent ? '#7c9aff' : '#f0f0f0',
                }}>
                  Page {pageNum}
                </span>
                {isCurrent && (
                  <span style={{
                    fontSize: '0.65rem',
                    background: '#4d6bfa',
                    color: '#fff',
                    padding: '0.1rem 0.35rem',
                    borderRadius: 4,
                    fontWeight: 700,
                  }}>
                    Active
                  </span>
                )}
              </div>

              {/* Status Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.68rem' }}>
                {editedItemsCount > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    background: 'rgba(77,107,250,0.15)', color: '#93c5fd',
                    padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 600,
                  }}>
                    <Edit3 size={10} /> {editedItemsCount}
                  </span>
                )}
                {pageRedacts.length > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    background: 'rgba(239,68,68,0.2)', color: '#fca5a5',
                    padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 600,
                  }}>
                    <EyeOff size={10} /> {pageRedacts.length}
                  </span>
                )}
                {pageSigs.length > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    background: 'rgba(147,51,234,0.2)', color: '#d8b4fe',
                    padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 600,
                  }}>
                    <PenTool size={10} /> {pageSigs.length}
                  </span>
                )}
                {pageStamps.length > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    background: 'rgba(34,197,94,0.2)', color: '#86efac',
                    padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 600,
                  }}>
                    <Tag size={10} /> {pageStamps.length}
                  </span>
                )}
                {editedItemsCount === 0 && pageRedacts.length === 0 && pageSigs.length === 0 && pageStamps.length === 0 && (
                  <span style={{ color: 'rgba(240,240,240,0.4)' }}>Unmodified</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
