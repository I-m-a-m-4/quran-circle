'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Laptop, 
  Sun, 
  Navigation, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  Info, 
  HelpCircle,
  Smartphone,
  Eye
} from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { getQibla } from '@/lib/api/aladhan';
import { LocationSetup } from '@/components/location/LocationSetup';
import { Button } from '@/components/ui/button';

// Mathematical accurate Qibla calculation (Haversine & Spherical Trig)
function computeQibla(lat: number, lng: number): number {
  const PI = Math.PI;
  const kaabaLat = 21.4225 * (PI / 180);
  const kaabaLng = 39.8262 * (PI / 180);
  const userLat = lat * (PI / 180);
  const userLng = lng * (PI / 180);

  const deltaLng = kaabaLng - userLng;
  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLng);

  let qibla = Math.atan2(y, x) * (180 / PI);
  return (qibla + 360) % 360;
}

// Distance to Holy Kaaba
function computeDistanceToKaaba(lat: number, lng: number) {
  const R = 6371; // km
  const kaabaLat = 21.4225 * (Math.PI / 180);
  const kaabaLng = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLng = lng * (Math.PI / 180);

  const dLat = kaabaLat - userLat;
  const dLng = kaabaLng - userLng;

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLat) * Math.cos(kaabaLat) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(R * c);
  const miles = Math.round(km * 0.621371);
  return { km, miles };
}

function getCardinalName(deg: number): string {
  const cardinals = ['North (N)', 'North-Northeast (NNE)', 'Northeast (NE)', 'East-Northeast (ENE)', 'East (E)', 'East-Southeast (ESE)', 'Southeast (SE)', 'South-Southeast (SSE)', 'South (S)', 'South-Southwest (SSW)', 'Southwest (SW)', 'West-Southwest (WSW)', 'West (W)', 'West-Northwest (WNW)', 'Northwest (NW)', 'North-Northwest (NNW)'];
  const index = Math.round(deg / 22.5) % 16;
  return cardinals[index];
}

function getSunAzimuth(lat: number, lng: number): number | null {
  const now = new Date();
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const solarTime = (hours + lng / 15 + 24) % 24;
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const hourAngle = (solarTime - 12) * 15 * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);
  const decRad = declination * (Math.PI / 180);

  const altitude = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngle)
  );

  if (altitude <= 0) return null; // Sun below horizon

  const azimuthRad = Math.acos(
    (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altitude)) /
    (Math.cos(latRad) * Math.cos(altitude))
  );

  let azimuthDeg = (azimuthRad * 180) / Math.PI;
  if (hourAngle > 0) azimuthDeg = 360 - azimuthDeg;
  return Math.round((azimuthDeg + 360) % 360);
}

export default function QiblaPage() {
  const location = useLocation();
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSensor, setHasCompassSensor] = useState(false);
  const [loading, setLoading] = useState(false);

  // Desk & Room Alignment Mode (for laptops / indoor positioning)
  const [activeTab, setActiveTab] = useState<'compass' | 'room'>('compass');
  const [laptopFacing, setLaptopFacing] = useState<number>(0); // 0 = North, 90 = East, 180 = South, 270 = West

  // Calculate local coordinates Qibla direction immediately
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const computed = computeQibla(location.latitude, location.longitude);
      setQiblaDirection(computed);

      // Verify with AlAdhan API as validation
      getQibla({ latitude: location.latitude, longitude: location.longitude })
        .then((res) => {
          if (res?.direction) setQiblaDirection(res.direction);
        })
        .catch(() => {});
    }
  }, [location.latitude, location.longitude]);

  // Mobile Device Orientation
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if ('webkitCompassHeading' in e && typeof e.webkitCompassHeading === 'number') {
        setDeviceHeading(e.webkitCompassHeading);
        setHasCompassSensor(true);
      } else if (e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
        setHasCompassSensor(true);
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const distance = useMemo(() => {
    if (!location.latitude || !location.longitude) return null;
    return computeDistanceToKaaba(location.latitude, location.longitude);
  }, [location.latitude, location.longitude]);

  const sunAzimuth = useMemo(() => {
    if (!location.latitude || !location.longitude) return null;
    return getSunAzimuth(location.latitude, location.longitude);
  }, [location.latitude, location.longitude]);

  // Compass rotation angle
  const rotation = qiblaDirection !== null && deviceHeading !== null
    ? qiblaDirection - deviceHeading
    : qiblaDirection || 0;

  // Is aligned within 5 degrees
  const isAligned = Math.abs(rotation % 360) <= 5 || Math.abs((rotation % 360) - 360) <= 5;

  // Relative Room Guidance (how to turn relative to laptop)
  const relativeTurn = useMemo(() => {
    if (qiblaDirection === null) return null;
    const diff = (qiblaDirection - laptopFacing + 360) % 360;
    
    if (diff <= 6 || diff >= 354) {
      return {
        text: 'Facing directly ahead towards Kaaba! 🕋',
        action: 'Directly ahead',
        angle: 0,
        aligned: true,
      };
    } else if (diff > 6 && diff <= 170) {
      return {
        text: `Turn ${Math.round(diff)}° to your right 👉`,
        action: `Right by ${Math.round(diff)}°`,
        angle: diff,
        aligned: false,
      };
    } else if (diff >= 190 && diff < 354) {
      const leftAngle = Math.round(360 - diff);
      return {
        text: `Turn ${leftAngle}° to your left 👈`,
        action: `Left by ${leftAngle}°`,
        angle: -leftAngle,
        aligned: false,
      };
    } else {
      return {
        text: 'The Kaaba is directly behind you 🔄',
        action: 'Turn 180° around',
        angle: 180,
        aligned: false,
      };
    }
  }, [qiblaDirection, laptopFacing]);

  if (!location.loading && location.permissionStatus === 'denied' && !location.latitude) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <LocationSetup onLocationSet={location.setManualLocation} onSkip={location.skipLocation} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-primary/20 pb-20">
      
      {/* Header */}
      <div className="pt-8 pb-4 px-6 border-b border-border/80">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight text-foreground flex items-center gap-3">
              <span>Qibla Direction</span>
              {qiblaDirection !== null && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-sans font-semibold">
                  🕋 {qiblaDirection.toFixed(1)}° {getCardinalName(qiblaDirection).split(' ')[1]}
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {location.city ? `Calibrated for ${location.city}${location.country ? `, ${location.country}` : ''}` : 'Astronomical bearing towards the Holy Kaaba in Makkah'}
            </p>
          </div>

          {/* Mode Switch: Live Compass vs Desk/Room Mode */}
          <div className="flex bg-muted/60 p-1 rounded-2xl border border-border/80">
            <button
              onClick={() => setActiveTab('compass')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'compass'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Full Compass</span>
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'room'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Laptop className="w-4 h-4 text-primary" />
              <span>Desk & Room Mode</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-8 space-y-8 flex-1">

        {/* Tab 1: Full High-Precision Compass */}
        {activeTab === 'compass' && (
          <div className="flex flex-col items-center justify-center space-y-8">
            
            {/* Status notification banner */}
            {isAligned && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-lg shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>You are facing the Holy Kaaba! Ready for Salah</span>
              </div>
            )}

            {/* Massive Luxury Islamic Astrolabe Compass */}
            <div className="relative w-[340px] h-[340px] sm:w-[410px] sm:h-[410px] select-none my-2">
              
              {/* Outer decorative gold ring */}
              <div className="absolute inset-0 rounded-full border-8 border-primary/20 bg-card/60 backdrop-blur-md shadow-2xl shadow-primary/10 flex items-center justify-center" />
              
              {/* Dial with degree ticks */}
              <div className="absolute inset-3 rounded-full border border-border/80 flex items-center justify-center">
                {/* 12 Major Hour / 30-deg Markers */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-full flex justify-center items-start pt-2 pointer-events-none"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  >
                    <div className={`w-0.5 ${i % 3 === 0 ? 'h-4 bg-primary' : 'h-2 bg-border'}`} />
                  </div>
                ))}

                {/* Cardinal Points with Arabic */}
                <span className="absolute top-5 text-sm font-extrabold font-headline text-primary flex flex-col items-center">
                  <span>N</span>
                  <span className="text-[9px] font-arabic font-normal opacity-70">الشمال</span>
                </span>
                <span className="absolute right-5 text-sm font-extrabold font-headline text-muted-foreground flex flex-col items-center">
                  <span>E</span>
                  <span className="text-[9px] font-arabic font-normal opacity-70">الشرق</span>
                </span>
                <span className="absolute bottom-5 text-sm font-extrabold font-headline text-muted-foreground flex flex-col items-center">
                  <span>S</span>
                  <span className="text-[9px] font-arabic font-normal opacity-70">الجنوب</span>
                </span>
                <span className="absolute left-5 text-sm font-extrabold font-headline text-muted-foreground flex flex-col items-center">
                  <span>W</span>
                  <span className="text-[9px] font-arabic font-normal opacity-70">الغرب</span>
                </span>

                {/* Kaaba Golden Badge placed at exact bearing on dial */}
                {qiblaDirection !== null && (
                  <div
                    className="absolute w-full h-full flex justify-center items-start pt-1 pointer-events-none transition-transform duration-700"
                    style={{ transform: `rotate(${qiblaDirection}deg)` }}
                  >
                    <div className="flex flex-col items-center -translate-y-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center text-sm shadow-md shadow-amber-500/40 border-2 border-background">
                        🕋
                      </div>
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Kaaba</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Needle Wrapper */}
              <div 
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* North/Qibla Arrow */}
                  <div className="w-3 h-44 sm:h-52 bg-gradient-to-t from-primary/80 to-primary rounded-t-full shadow-xl relative -top-20 sm:-top-24 flex flex-col items-center">
                    <div className="absolute -top-4 w-7 h-7 bg-primary rotate-45 rounded-sm shadow-lg flex items-center justify-center" />
                    <div className="w-0.5 h-full bg-white/40" />
                  </div>
                  {/* South Counterbalance */}
                  <div className="w-2.5 h-20 bg-muted-foreground/30 rounded-b-full absolute top-1/2" />
                </div>
              </div>

              {/* Ornate Center Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-card border-4 border-primary rounded-full z-20 shadow-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
              </div>

            </div>

            {/* Angle & Distance Highlights */}
            {qiblaDirection !== null && (
              <div className="text-center space-y-2">
                <p className="text-6xl font-extrabold font-headline tabular-nums tracking-tighter text-foreground">
                  {qiblaDirection.toFixed(1)}°
                </p>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  {getCardinalName(qiblaDirection)}
                </p>
              </div>
            )}

            {/* Desktop / Laptop Helpful Notice */}
            {!hasCompassSensor && (
              <div className="max-w-md w-full bg-muted/40 border border-border/80 rounded-2xl p-5 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                  <Laptop className="w-4 h-4" />
                  <span>Viewing on a Laptop or Desktop?</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Laptops do not have a built-in magnetic gyroscope. Switch to <strong>Desk & Room Mode</strong> above to align your prayer direction with your desk, room window, or the sun!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('room')}
                  className="rounded-full text-xs font-semibold gap-1.5"
                >
                  <span>Open Desk & Room Helper</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Desk & Room Alignment Mode (Made for laptops & indoor prayer) */}
        {activeTab === 'room' && (
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in duration-300">
            
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2">
                <Laptop className="w-4 h-4" />
                <span>Indoor Prayer Positioning Guide</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-headline text-foreground mb-2">
                Align Your Prayer in Your Room
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You don&apos;t need a magnetic compass. Simply tell Muslim Desk which direction your laptop screen is facing right now, and we will tell you exactly which way to turn your prayer mat!
              </p>
            </div>

            {/* Step 1: Pick Laptop Direction */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Step 1: Which direction is your laptop facing?
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Facing North', deg: 0, icon: '⬆️', desc: 'Towards North wall' },
                  { label: 'Facing East', deg: 90, icon: '➡️', desc: 'Towards East / Sunrise' },
                  { label: 'Facing South', deg: 180, icon: '⬇️', desc: 'Towards South wall' },
                  { label: 'Facing West', deg: 270, icon: '⬅️', desc: 'Towards West / Sunset' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setLaptopFacing(item.deg)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      laptopFacing === item.deg
                        ? 'bg-primary/10 border-primary text-foreground shadow-sm ring-2 ring-primary/20'
                        : 'bg-muted/30 border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="font-bold text-sm text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom Degree Slider */}
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-medium text-muted-foreground">
                  Fine-tune laptop facing angle: <strong className="text-foreground">{laptopFacing}°</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={laptopFacing}
                  onChange={(e) => setLaptopFacing(parseInt(e.target.value, 10))}
                  className="w-full sm:w-64 accent-primary"
                />
              </div>
            </div>

            {/* Step 2: The Direct Plain-English Instruction */}
            {relativeTurn && (
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                relativeTurn.aligned 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-primary/10 border-primary/30'
              }`}>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Step 2: How you should stand
                </span>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-extrabold font-headline text-foreground mb-2">
                      {relativeTurn.text}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Stand where your laptop is located. {relativeTurn.aligned ? 'Lay your prayer mat facing directly forward.' : `Rotate your body and prayer mat ${relativeTurn.action} to align with the Qibla.`}
                    </p>
                  </div>

                  {/* Visual Standing Diagram */}
                  <div className="relative w-36 h-36 rounded-2xl bg-card border border-border/80 flex items-center justify-center shrink-0 shadow-inner">
                    {/* User Standing at center */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                        YOU
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1 font-semibold">Your Desk</span>
                    </div>

                    {/* Beam to Kaaba */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                      style={{ transform: `rotate(${relativeTurn.angle}deg)` }}
                    >
                      <div className="w-1 h-14 bg-gradient-to-t from-primary to-amber-500 rounded-full relative -top-10 shadow-lg shadow-primary/50">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm">🕋</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sun Reference for Indoor Orientation */}
            {sunAzimuth !== null && qiblaDirection !== null && (
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Natural Sun Reference</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The sun is currently at approximately <strong>{sunAzimuth}° ({getCardinalName(sunAzimuth).split(' ')[1]})</strong> in the sky. If you can see sunlight or the window, the Qibla is at <strong>{qiblaDirection.toFixed(0)}°</strong> ({Math.abs(Math.round(qiblaDirection - sunAzimuth))}° {qiblaDirection > sunAzimuth ? 'to the right' : 'to the left'} of the sun).
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Global Details Grid: Coordinates & Distance to Kaaba */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Exact Bearing</p>
              <p className="text-lg font-bold font-headline text-foreground">
                {qiblaDirection !== null ? `${qiblaDirection.toFixed(1)}° True North` : 'Calculating...'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 text-xl">
              🕋
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Distance to Kaaba</p>
              <p className="text-lg font-bold font-headline text-foreground">
                {distance ? `${distance.km.toLocaleString()} km (${distance.miles.toLocaleString()} mi)` : 'Calculating...'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Location</p>
              <p className="text-sm font-bold text-foreground truncate">
                {location.city ? `${location.city}${location.country ? `, ${location.country}` : ''}` : `${location.latitude?.toFixed(2)}°, ${location.longitude?.toFixed(2)}°`}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
