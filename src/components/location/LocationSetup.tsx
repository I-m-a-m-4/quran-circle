'use client';

import React, { useState } from 'react';
import { MapPin, Compass, Search, Globe, Sparkles, Navigation, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationSetupProps {
  onLocationSet: (lat: number, lng: number, city?: string, country?: string) => void;
  onSkip?: () => void;
}

const POPULAR_CITIES = [
  { name: 'Ibadan', country: 'Nigeria', lat: 7.3775, lng: 3.9470, flag: '🇳🇬' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, flag: '🇳🇬' },
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262, flag: '🕋' },
  { name: 'Madinah', country: 'Saudi Arabia', lat: 24.5247, lng: 39.5692, flag: '🕌' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, flag: '🇬🇧' },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, flag: '🇪🇬' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, flag: '🇹🇷' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, flag: '🇦🇪' },
  { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, flag: '🇺🇸' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, flag: '🇮🇩' },
];

export function LocationSetup({ onLocationSet, onSkip }: LocationSetupProps) {
  const [loading, setLoading] = useState(false);
  const [ipDetecting, setIpDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Instant Auto-Detect via IP without browser prompt
  async function handleAutoDetect() {
    setIpDetecting(true);
    setError(null);
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      let detectedCity = 'Your City';
      let detectedCountry = '';

      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          lat = parseFloat(data.latitude);
          lng = parseFloat(data.longitude);
          detectedCity = data.city || detectedCity;
          detectedCountry = data.country_name || '';
        }
      }

      if (!lat || !lng) {
        const res2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.latitude && data2.longitude) {
            lat = parseFloat(data2.latitude);
            lng = parseFloat(data2.longitude);
            detectedCity = data2.city || detectedCity;
            detectedCountry = data2.country || '';
          }
        }
      }

      if (lat && lng) {
        onLocationSet(lat, lng, detectedCity, detectedCountry);
      } else {
        setError('Could not auto-detect IP location. Please select or search your city below.');
      }
    } catch {
      setError('IP lookup timed out. Please select your city from the list or search below.');
    } finally {
      setIpDetecting(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          city
        )}&format=json&limit=1`
      );
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, name, display_name } = data[0];
        onLocationSet(parseFloat(lat), parseFloat(lon), name || city, display_name);
      } else {
        setError('Location not found. Please try a different city name.');
      }
    } catch {
      setError('Failed to search location. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      // Default to Makkah if skipped
      onLocationSet(21.4225, 39.8262, 'Makkah (Default)', 'Saudi Arabia');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-xl rounded-3xl border border-border/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-300">
      
      {/* Decorative Islamic Map Header */}
      <div className="relative bg-gradient-to-br from-primary/15 via-amber-500/10 to-transparent p-8 md:p-10 border-b border-border/60 overflow-hidden">
        {/* Radar / Map Grid Effect */}
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        
        {/* Top bar with Skip button */}
        <div className="flex items-center justify-between relative z-10 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Compass className="w-3.5 h-3.5" />
            <span>Prayer Times & Qibla Precision</span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full hover:bg-muted/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Skip for now</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Where are you praying from?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Muslim Desk calculates astronomical sunrise, sunset, and prayer times tailored to your exact horizon. You can auto-detect with your network or pick your city.
          </p>
        </div>

        {/* Quick Auto-Detect Button */}
        <div className="mt-6 relative z-10 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleAutoDetect}
            disabled={ipDetecting}
            className="rounded-full px-6 bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25 hover:bg-primary/90 gap-2 h-11"
          >
            <Sparkles className={`w-4 h-4 ${ipDetecting ? 'animate-spin' : ''}`} />
            <span>{ipDetecting ? 'Detecting your city...' : 'Auto-Detect via Network (IP)'}</span>
          </Button>
          <span className="text-xs text-muted-foreground">No GPS permission required</span>
        </div>
      </div>

      {/* Main Body: Search & Quick Cities */}
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="space-y-2">
          <label htmlFor="city-search" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Search Any City Worldwide
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                id="city-search"
                type="text"
                placeholder="e.g. Ibadan, Cairo, London, Toronto, Jakarta..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !city.trim()}
              className="px-6 rounded-2xl h-auto font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all"
            >
              {loading ? 'Searching...' : 'Set Location'}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive font-medium pt-1">{error}</p>}
        </form>

        {/* Quick Select Popular Cities */}
        <div className="space-y-2.5 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Popular Cities Quick Select</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setSelectedCity(c.name);
                  onLocationSet(c.lat, c.lng, c.name, c.country);
                }}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedCity === c.name
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/40 hover:bg-muted text-foreground/80 hover:text-foreground border-border/70 hover:border-primary/50'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
                <span className="text-[10px] opacity-60 font-normal">({c.country})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer / Skip confirmation */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            Location is stored locally and never shared
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            I&apos;ll set this later →
          </button>
        </div>

      </div>

    </div>
  );
}
