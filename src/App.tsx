import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PDFEditor from './components/PDFEditor';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import { usePDFEditor } from './hooks/usePDFEditor';

export default function App() {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const {
    state, loadPDF, renderPage, updateText, updateFormat, updatePosition, deleteItem,
    addTextField, undo, redo, setActiveItem, setCurrentPage, setScale, exportPDF, resetEditor
  } = usePDFEditor();

  const handleFileSelected = useCallback(async (file: File) => {
    await loadPDF(file);
    setPdfLoaded(true);
    // Scroll to editor
    setTimeout(() => {
      document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, [loadPDF]);

  const handleReset = useCallback(() => {
    resetEditor();
    setPdfLoaded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetEditor]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero / upload section — always visible until PDF loaded */}
        {!pdfLoaded && <Hero onFileSelected={handleFileSelected} />}

        {/* Editor — shown after PDF is loaded */}
        {pdfLoaded && state.totalPages > 0 && (
          <PDFEditor
            state={state}
            renderPage={renderPage}
            updateText={updateText}
            updateFormat={updateFormat}
            updatePosition={updatePosition}
            deleteItem={deleteItem}
            addTextField={addTextField}
            undo={undo}
            redo={redo}
            setActiveItem={setActiveItem}
            setCurrentPage={setCurrentPage}
            setScale={setScale}
            exportPDF={exportPDF}
            resetEditor={handleReset}
          />
        )}

        {/* Loading state */}
        {pdfLoaded && state.isLoading && (
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem', color: 'rgba(240,240,240,0.5)' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid rgba(77,107,250,0.3)', borderTopColor: '#4d6bfa',
              borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin-slow 0.8s linear infinite',
            }} />
            <p>Loading your PDF…</p>
          </div>
        )}

        {/* Error state */}
        {pdfLoaded && state.error && (
          <div style={{ maxWidth: 600, margin: '4rem auto', padding: '0 1.5rem' }}>
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '1rem', padding: '1.5rem', textAlign: 'center',
            }}>
              <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{state.error}</p>
              <button className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }} onClick={handleReset}>
                Try Again
              </button>
            </div>
          </div>
        )}

        <HowItWorks />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
