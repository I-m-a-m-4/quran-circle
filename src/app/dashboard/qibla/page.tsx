'use client';

import { useState, useEffect } from 'react';
import { Compass, MapPin } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { getQibla } from '@/lib/api/aladhan';
import { LocationSetup } from '@/components/location/LocationSetup';

export default function QiblaPage() {
  const location = useLocation();
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;
    setLoading(true);
    getQibla({ latitude: location.latitude, longitude: location.longitude })
      .then(res => {
        if (res) setQiblaDirection(res.direction);
        else setError("Could not determine Qibla direction.");
      })
      .catch(() => setError("Error calculating Qibla."))
      .finally(() => setLoading(false));
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    // Device orientation for mobile devices
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading
      if ('webkitCompassHeading' in e) {
        setDeviceHeading(e.webkitCompassHeading as number);
      } else if (e.alpha !== null) {
        // Android absolute orientation
        setDeviceHeading(360 - e.alpha);
      }
    };

    if (window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ requires permission on click, we just show a button or rely on fallback
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  if (!location.loading && location.permissionStatus === 'denied' && !location.latitude) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <LocationSetup onLocationSet={location.setManualLocation} />
      </div>
    );
  }

  const rotation = qiblaDirection !== null && deviceHeading !== null 
    ? qiblaDirection - deviceHeading 
    : qiblaDirection || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="pt-8 pb-4 px-6 border-b border-border">
        <h1 className="text-2xl font-semibold">Qibla Direction</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        {loading || location.loading ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-64 h-64 rounded-full bg-muted mb-8" />
            <div className="h-6 w-32 bg-muted rounded" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : qiblaDirection !== null ? (
          <>
            <div className="relative w-72 h-72 mb-12">
              {/* Compass outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-muted flex items-center justify-center">
                <span className="absolute top-4 text-xs font-semibold text-muted-foreground">N</span>
                <span className="absolute bottom-4 text-xs font-semibold text-muted-foreground">S</span>
                <span className="absolute right-4 text-xs font-semibold text-muted-foreground">E</span>
                <span className="absolute left-4 text-xs font-semibold text-muted-foreground">W</span>
              </div>
              
              {/* Needle wrapper */}
              <div 
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-36 bg-primary rounded-t-full shadow-lg relative -top-16">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45" />
                  </div>
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-background border-4 border-primary rounded-full z-10" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-5xl font-light tabular-nums tracking-tighter">
                {qiblaDirection.toFixed(1)}°
              </p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                from North
              </p>
            </div>

            {!deviceHeading && (
              <div className="mt-8 p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground text-center max-w-xs border border-border">
                Device compass not available. The arrow shows the geographic bearing from North. Use a physical compass to align.
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
