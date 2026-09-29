'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, type AppSettings } from '@/lib/storage/local';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city?: string;
  country?: string;
  permissionStatus: 'pending' | 'granted' | 'denied' | 'manual' | 'skipped';
  loading: boolean;
  error: string | null;
}

async function fetchIpLocation(): Promise<{ latitude: number; longitude: number; city?: string; country?: string } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          city: data.city || undefined,
          country: data.country_name || undefined,
        };
      }
    }
  } catch {}

  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude && data.longitude) {
        return {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          city: data.city || undefined,
          country: data.country || undefined,
        };
      }
    }
  } catch {}

  return null;
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
    let isMounted = true;
    const settings = getSettings();

    // 1. If we already have saved coordinates, use them immediately
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
    }

    // 2. Fast background auto-detection: trigger IP lookup immediately so user never waits
    fetchIpLocation().then((ipLoc) => {
      if (!isMounted) return;
      if (ipLoc) {
        // If no coordinates yet or previous was default, set instantly
        setLocation((prev) => {
          if (!prev.latitude || prev.permissionStatus === 'pending') {
            saveSettings({
              latitude: ipLoc.latitude,
              longitude: ipLoc.longitude,
              city: ipLoc.city,
              country: ipLoc.country,
              locationMode: 'auto',
            });
            return {
              latitude: ipLoc.latitude,
              longitude: ipLoc.longitude,
              city: ipLoc.city,
              country: ipLoc.country,
              permissionStatus: 'granted',
              loading: false,
              error: null,
            };
          }
          return prev;
        });
      }
    });

    // 3. Simultaneously request high-accuracy GPS silently if available
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          const { latitude, longitude } = pos.coords;
          saveSettings({ latitude, longitude, locationMode: 'auto' });
          setLocation((prev) => ({
            ...prev,
            latitude,
            longitude,
            permissionStatus: 'granted',
            loading: false,
            error: null,
          }));
        },
        async () => {
          if (!isMounted) return;
          // Silently handle GPS refusal - we already triggered IP detection
          setLocation((prev) => {
            if (!prev.latitude) {
              // Fallback to Ibadan/Lagos or Makkah default if IP also failed
              return {
                ...prev,
                loading: false,
                permissionStatus: 'denied',
              };
            }
            return { ...prev, loading: false };
          });
        },
        { timeout: 4000, enableHighAccuracy: true }
      );
    } else {
      // Geolocation not supported
      setLocation((prev) => ({ ...prev, loading: false }));
    }

    return () => {
      isMounted = false;
    };
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

  function skipLocation() {
    const defaultLat = 21.4225;
    const defaultLng = 39.8262;
    saveSettings({
      latitude: defaultLat,
      longitude: defaultLng,
      city: 'Makkah (Default)',
      country: 'Saudi Arabia',
      locationMode: 'manual'
    });
    setLocation({
      latitude: defaultLat,
      longitude: defaultLng,
      city: 'Makkah (Default)',
      country: 'Saudi Arabia',
      permissionStatus: 'granted',
      loading: false,
      error: null,
    });
  }

  return { ...location, setManualLocation, skipLocation };
}

