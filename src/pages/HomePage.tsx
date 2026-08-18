import React from 'react';
import Hero from '../components/Hero';
import ToolCatalog from '../components/ToolCatalog';
import HowItWorks from '../components/HowItWorks';
import UltimateGuide from '../components/UltimateGuide';
import FAQ from '../components/FAQ';
import ClientSideSecurityDeepDive from '../components/ClientSideSecurityDeepDive';
import { SEO_DATA } from '../utils/seo';

interface HomePageProps {
  onFileSelected: (file: File) => void;
}

export default function HomePage({ onFileSelected }: HomePageProps) {
  const seo = SEO_DATA['/'];

  return (
    <div>
      {/* Optimized Hero */}
      <Hero
        onFileSelected={onFileSelected}
        badgeText={seo.badge}
        h1Title={seo.h1}
        h1Highlight={seo.h1Highlight}
        h1Subtitle={seo.h1Subtitle}
        description="Edit text, sign contracts, insert rubber stamps, find & replace, or use our complete suite of 15+ private client-side PDF tools — all processed 100% locally in your browser. Your files never leave your device."
      />

      {/* PDF Toolbox Catalog Section */}
      <ToolCatalog />

      {/* 4 Step Workflow */}
      <HowItWorks />

      {/* Deep Authoritative Content & Comparison Matrix */}
      <UltimateGuide />

      {/* Complete DOM-Rendered FAQ for Search Indexing */}
      <FAQ
        items={seo.faqs}
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about 100% private in-browser PDF editing and toolbox utilities."
      />

      {/* Detailed Security Deep-Dive & On-Page Long-Form Content */}
      <ClientSideSecurityDeepDive />
    </div>
  );
}
