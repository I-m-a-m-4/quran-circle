'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, type AppSettings } from '@/lib/storage/local';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city?: string;
  country?: string;
  permissionStatus: 'pending' | 'granted' | 'denied' | 'manual';
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    permissionStatus: 'pending',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const settings = getSettings();

    // Already have saved coordinates
    if (settings.latitude && settings.longitude) {
      setLocation({
        latitude: settings.latitude,
        longitude: settings.longitude,
        city: settings.city,
        country: settings.country,
        permissionStatus: settings.locationMode === 'manual' ? 'manual' : 'granted',
        loading: false,
        error: null,
      });
      return;
    }

    // Try geolocation
    if (!navigator.geolocation) {
      setLocation((s) => ({
        ...s,
        permissionStatus: 'denied',
        loading: false,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        saveSettings({ latitude, longitude, locationMode: 'auto' });
        setLocation({
          latitude,
          longitude,
          permissionStatus: 'granted',
          loading: false,
          error: null,
        });
      },
      (_err) => {
        setLocation((s) => ({
          ...s,
          permissionStatus: 'denied',
          loading: false,
          error: null, // Don't show error — just prompt manual
        }));
      },
      { timeout: 8000 }
    );
  }, []);

  function setManualLocation(
    lat: number,
    lng: number,
    city?: string,
    country?: string
  ) {
    saveSettings({ latitude: lat, longitude: lng, city, country, locationMode: 'manual' });
    setLocation({
      latitude: lat,
      longitude: lng,
      city,
      country,
      permissionStatus: 'manual',
      loading: false,
      error: null,
    });
  }

  return { ...location, setManualLocation };
}
