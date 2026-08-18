import React from 'react';
import { renderToString } from 'react-dom/server';
import { RouterProvider } from './context/RouterContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SecurePdfEditorPage from './pages/SecurePdfEditorPage';
import BankStatementPdfEditorPage from './pages/BankStatementPdfEditorPage';
import RedactPdfInBrowserPage from './pages/RedactPdfInBrowserPage';
import ChromePdfEditorPage from './pages/ChromePdfEditorPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';

// PDF Tool Pages
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

const dummyHandler = () => {};

function renderRouteComponent(path: string) {
  const normalized = path === '' || path === '/' ? '/' : path.replace(/\/$/, '');

  switch (normalized) {
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

    case '/secure-pdf-editor':
      return <SecurePdfEditorPage onFileSelected={dummyHandler} />;
    case '/edit-bank-statement-pdf':
      return <BankStatementPdfEditorPage onFileSelected={dummyHandler} />;
    case '/redact-pdf-in-browser':
      return <RedactPdfInBrowserPage onFileSelected={dummyHandler} />;
    case '/chrome-pdf-editor':
      return <ChromePdfEditorPage onFileSelected={dummyHandler} />;
    case '/privacy-policy':
      return <PrivacyPolicyPage />;
    case '/about':
      return <AboutPage />;
    case '/terms':
      return <TermsPage />;
    case '/':
    default:
      return <HomePage onFileSelected={dummyHandler} />;
  }
}

export function render(path: string): string {
  const element = (
    <RouterProvider initialPath={path}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {renderRouteComponent(path)}
        </main>
        <Footer />
      </div>
    </RouterProvider>
  );

  return renderToString(element);
}
