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

const dummyHandler = () => {};

function renderRouteComponent(path: string) {
  const normalized = path === '' || path === '/' ? '/' : path.replace(/\/$/, '');

  switch (normalized) {
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
