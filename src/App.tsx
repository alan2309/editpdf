import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import PDFEditor from './components/PDFEditor';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SecurePdfEditorPage from './pages/SecurePdfEditorPage';
import BankStatementPdfEditorPage from './pages/BankStatementPdfEditorPage';
import RedactPdfInBrowserPage from './pages/RedactPdfInBrowserPage';
import ChromePdfEditorPage from './pages/ChromePdfEditorPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';

// PDF Tools Pages
import MergePdfPage from './pages/tools/MergePdfPage';
import SplitPdfPage from './pages/tools/SplitPdfPage';
import ExtractPagesPage from './pages/tools/ExtractPagesPage';
import DeletePagesPage from './pages/tools/DeletePagesPage';
import ReorderPagesPage from './pages/tools/ReorderPagesPage';
import RotatePdfPage from './pages/tools/RotatePdfPage';
import CompressPdfPage from './pages/tools/CompressPdfPage';
import PdfToJpgPage from './pages/tools/PdfToJpgPage';
import PdfToPngPage from './pages/tools/PdfToPngPage';
import JpgToPdfPage from './pages/tools/JpgToPdfPage';
import PngToPdfPage from './pages/tools/PngToPdfPage';
import WatermarkPdfPage from './pages/tools/WatermarkPdfPage';
import PageNumbersPage from './pages/tools/PageNumbersPage';
import FlattenPdfPage from './pages/tools/FlattenPdfPage';
import ProtectPdfPage from './pages/tools/ProtectPdfPage';

import { RouterProvider, useRouter } from './context/RouterContext';
import { usePDFEditor } from './hooks/usePDFEditor';

function MainApp() {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const { currentPath } = useRouter();

  const {
    state, loadPDF, renderPage, cancelPageRender,
    beginTextEdit, updateTextWithoutHistory, commitTextEdit, cancelTextEdit,
    updateText, updateFormat, updatePosition, deleteItem,
    addTextField, addRedactionBox, updateRedactionBox, deleteRedactionBox,
    addSignature, updateSignature, deleteSignature, setActiveSignature,
    addStamp, updateStamp, deleteStamp, setActiveStamp,
    searchDocumentMatches, replaceSingleMatch, replaceAllMatches, redactAllMatches,
    setActiveRedaction, setActiveTool, setExportMode, setSanitizeMetadata,
    setVerifyOnExport, setVerificationReport, runStandaloneVerification,
    undo, redo, setActiveItem, setCurrentPage, setScale, exportPDF, resetEditor
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

  // Page Routing
  const renderCurrentPage = () => {
    const normalized = currentPath === '' || currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

    switch (normalized) {
      // PDF Tool Routes
      case '/merge-pdf':
        return <MergePdfPage />;
      case '/split-pdf':
        return <SplitPdfPage />;
      case '/extract-pdf-pages':
        return <ExtractPagesPage />;
      case '/delete-pdf-pages':
        return <DeletePagesPage />;
      case '/reorder-pdf-pages':
        return <ReorderPagesPage />;
      case '/rotate-pdf':
        return <RotatePdfPage />;
      case '/compress-pdf':
        return <CompressPdfPage />;
      case '/pdf-to-jpg':
        return <PdfToJpgPage />;
      case '/pdf-to-png':
        return <PdfToPngPage />;
      case '/jpg-to-pdf':
        return <JpgToPdfPage />;
      case '/png-to-pdf':
        return <PngToPdfPage />;
      case '/watermark-pdf':
        return <WatermarkPdfPage />;
      case '/pdf-page-numbers':
        return <PageNumbersPage />;
      case '/flatten-pdf':
        return <FlattenPdfPage />;
      case '/protect-pdf':
        return <ProtectPdfPage />;

      // Use Case Landing Pages
      case '/secure-pdf-editor':
        return <SecurePdfEditorPage onFileSelected={handleFileSelected} />;
      case '/edit-bank-statement-pdf':
        return <BankStatementPdfEditorPage onFileSelected={handleFileSelected} />;
      case '/redact-pdf-in-browser':
        return <RedactPdfInBrowserPage onFileSelected={handleFileSelected} />;
      case '/chrome-pdf-editor':
        return <ChromePdfEditorPage onFileSelected={handleFileSelected} />;
      case '/privacy-policy':
        return <PrivacyPolicyPage />;
      case '/about':
        return <AboutPage />;
      case '/terms':
        return <TermsPage />;
      case '/':
      default:
        return <HomePage onFileSelected={handleFileSelected} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Active Editor — shown after PDF is loaded on ANY editor page */}
        {pdfLoaded && state.totalPages > 0 ? (
          <PDFEditor
            state={state}
            renderPage={renderPage}
            cancelPageRender={cancelPageRender}
            beginTextEdit={beginTextEdit}
            updateTextWithoutHistory={updateTextWithoutHistory}
            commitTextEdit={commitTextEdit}
            cancelTextEdit={cancelTextEdit}
            updateText={updateText}
            updateFormat={updateFormat}
            updatePosition={updatePosition}
            deleteItem={deleteItem}
            addTextField={addTextField}
            addRedactionBox={addRedactionBox}
            updateRedactionBox={updateRedactionBox}
            deleteRedactionBox={deleteRedactionBox}
            addSignature={addSignature}
            updateSignature={updateSignature}
            deleteSignature={deleteSignature}
            setActiveSignature={setActiveSignature}
            addStamp={addStamp}
            updateStamp={updateStamp}
            deleteStamp={deleteStamp}
            setActiveStamp={setActiveStamp}
            searchDocumentMatches={searchDocumentMatches}
            replaceSingleMatch={replaceSingleMatch}
            replaceAllMatches={replaceAllMatches}
            redactAllMatches={redactAllMatches}
            setActiveRedaction={setActiveRedaction}
            setActiveTool={setActiveTool}
            setExportMode={setExportMode}
            setSanitizeMetadata={setSanitizeMetadata}
            setVerifyOnExport={setVerifyOnExport}
            setVerificationReport={setVerificationReport}
            runStandaloneVerification={runStandaloneVerification}
            undo={undo}
            redo={redo}
            setActiveItem={setActiveItem}
            setCurrentPage={setCurrentPage}
            setScale={setScale}
            exportPDF={exportPDF}
            resetEditor={handleReset}
          />
        ) : (
          renderCurrentPage()
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <MainApp />
    </RouterProvider>
  );
}
