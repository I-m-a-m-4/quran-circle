import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-gray-400 p-8 pt-24 max-w-3xl mx-auto space-y-8 font-serif leading-relaxed">
      <h1 className="text-4xl font-bold text-white font-sans tracking-tight">Privacy Policy</h1>
      <section className="space-y-4">
        <p className="text-white font-bold">1. Data Collection</p>
        <p>Quran Circle collects minimal data to facilitate habit tracking. We use your email and display name provided by the Quran Foundation via OAuth2.</p>
      </section>
      <section className="space-y-4">
        <p className="text-white font-bold">2. Quran Foundation Integration</p>
        <p>Our application integrates with the Quran Foundation Content and User APIs. Your spiritual progress (streaks) is stored securely and only visible to members of your Quran Circle.</p>
      </section>
      <section className="space-y-4">
        <p className="text-white font-bold">3. Contact</p>
        <p>For inquiries regarding your data, please contact the developer via the hackathon portal.</p>
      </section>
    </div>
  );
}
