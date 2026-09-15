'use client';

import { useState } from 'react';
import { MapPin, Compass, Search } from 'lucide-react';

interface LocationSetupProps {
  onLocationSet: (lat: number, lng: number, city?: string, country?: string) => void;
}

export function LocationSetup({ onLocationSet }: LocationSetupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');

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
        setError('Location not found. Please try a different city.');
      }
    } catch (err) {
      setError('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-2xl border border-border shadow-sm text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Compass className="w-8 h-8 text-primary" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">Where are you?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Muslim Desk needs your location to calculate accurate prayer times and the Qibla direction.
      </p>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative text-left">
          <label htmlFor="city-search" className="sr-only">Search City</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              id="city-search"
              type="text"
              placeholder="Enter your city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>
        
        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Set Location'}
        </button>
      </form>
    </div>
  );
}
