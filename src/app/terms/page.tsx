import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-400 p-8 pt-24 max-w-3xl mx-auto space-y-8 font-serif leading-relaxed">
      <h1 className="text-4xl font-bold text-white font-sans tracking-tight">Terms of Service</h1>
      <section className="space-y-4">
        <p className="text-white font-bold">1. Usage</p>
        <p>Quran Circle is a non-profit tool developed for the Ramadan 2026 Hackathon. It is intended to strengthen your connection with the Holy Quran.</p>
      </section>
      <section className="space-y-4">
        <p className="text-white font-bold">2. Compliance</p>
        <p>By using this service, you agree to comply with the Quran Foundation Developer Terms and the spirit of the hackathon.</p>
      </section>
    </div>
  );
}
