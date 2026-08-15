import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import UltimateGuide from '../components/UltimateGuide';
import FAQ from '../components/FAQ';
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
        description="Upload your PDF, click any text to edit it, and download the modified file — all processed entirely in your browser. Your files never leave your device."
      />

      {/* 4 Step Workflow */}
      <HowItWorks />

      {/* Deep Authoritative Content & Comparison Matrix (800-1500+ words) */}
      <UltimateGuide />

      {/* Complete DOM-Rendered FAQ for Search Indexing */}
      <FAQ
        items={seo.faqs}
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about 100% private in-browser PDF editing."
      />
    </div>
  );
}
