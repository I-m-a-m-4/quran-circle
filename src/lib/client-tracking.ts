'use client';

export interface ClientGeoInfo {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export function parseDevice(ua: string): string {
  if (!ua) return 'Web Client';
  let device = 'Web Browser';
  if (/android/i.test(ua)) device = 'Android Mobile';
  else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS Mobile (Apple)';
  else if (/windows/i.test(ua)) device = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) device = 'macOS (Apple Mac)';
  else if (/linux/i.test(ua)) device = 'Linux Desktop';
  
  if (typeof window !== 'undefined' && ((window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__)) {
    device += ' • Tauri Native Desktop';
  }
  return device;
}

export async function fetchClientGeo(): Promise<ClientGeoInfo | null> {
  // Primary fast lookup: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.ip || data.city)) {
        return {
          ip: data.ip || undefined,
          city: data.city || undefined,
          region: data.region || undefined,
          country: data.country_name || undefined,
          latitude: data.latitude ? parseFloat(data.latitude) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude) : undefined,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    }
  } catch {}

  // Fallback lookup: ipwho.is
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          ip: data.ip || undefined,
          city: data.city || undefined,
          region: data.region || undefined,
          country: data.country || undefined,
          latitude: data.latitude ? parseFloat(data.latitude) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude) : undefined,
          timezone: data.timezone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
    }
  } catch {}

  return null;
}
