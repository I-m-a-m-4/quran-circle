'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Laptop, 
  RefreshCw,
  Compass,
  RotateCcw,
  RotateCw,
  Radio,
  Smartphone,
  Info,
  X,
  Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Qibla3DSceneProps {
  qiblaDirection: number; // e.g. 63.9 (degrees from True North)
  laptopFacing: number;   // e.g. 0 (degrees laptop is facing)
  onLaptopFacingChange: (deg: number) => void;
  deviceHeading?: number | null;
  hasCompassSensor?: boolean;
  useLiveSensor?: boolean;
  onToggleLiveSensor?: () => void;
  onRequestSensorPermission?: () => void;
  city?: string;
  country?: string;
  distanceKm?: number;
}

export function Qibla3DScene({
  qiblaDirection,
  laptopFacing,
  onLaptopFacingChange,
  deviceHeading,
  hasCompassSensor,
  useLiveSensor = true,
  onToggleLiveSensor,
  onRequestSensorPermission,
  city,
  country,
  distanceKm,
}: Qibla3DSceneProps) {
  // Camera Orbit Controls - Defaulting to Prayer View!
  const [cameraPitch, setCameraPitch] = useState<number>(28); // 28deg = Natural eye-level prayer view
  const [cameraPreset, setCameraPreset] = useState<'isometric' | 'firstPerson' | 'overhead'>('firstPerson');
  const [dragYawOffset, setDragYawOffset] = useState<number>(0);
  const [isometricYaw, setIsometricYaw] = useState<number>(-25);
  const [overheadYaw, setOverheadYaw] = useState<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; pitch: number; yaw: number }>({ x: 0, y: 0, pitch: 28, yaw: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation toggle
  const [autoRotate, setAutoRotate] = useState(false);

  // Sensor diagnostic dialog state
  const [showHardwareInfo, setShowHardwareInfo] = useState<boolean>(false);
  const [isTestingSensor, setIsTestingSensor] = useState<boolean>(false);

  // Keyboard Arrow Key Navigation for Laptops without Physical Magnetometers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onLaptopFacingChange((laptopFacing - 5 + 360) % 360);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onLaptopFacingChange((laptopFacing + 5) % 360);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [laptopFacing, onLaptopFacingChange]);

  // Handle Sensor Sync Button Click with Diagnostic Test
  const handleSensorSyncClick = () => {
    setIsTestingSensor(true);
    onRequestSensorPermission?.();
    setTimeout(() => {
      setIsTestingSensor(false);
      // If after test there is still no hardware compass detected, explain why to the user
      if (!hasCompassSensor) {
        setShowHardwareInfo(true);
      }
    }, 1200);
  };

  // Compute effective yaw for 3D world:
  // In firstPerson (Prayer View), the camera turns in real time with the laptop (-laptopFacing)!
  const effectiveYaw = useMemo(() => {
    if (cameraPreset === 'firstPerson') {
      return (-laptopFacing + dragYawOffset) % 360;
    } else if (cameraPreset === 'isometric') {
      return (isometricYaw + dragYawOffset) % 360;
    } else {
      return (overheadYaw + dragYawOffset) % 360;
    }
  }, [cameraPreset, laptopFacing, dragYawOffset, isometricYaw, overheadYaw]);

  // Preset Camera Angles
  const setPreset = useCallback((preset: 'isometric' | 'firstPerson' | 'overhead') => {
    setCameraPreset(preset);
    setDragYawOffset(0);
    if (preset === 'isometric') {
      setCameraPitch(45);
      setIsometricYaw(-25);
    } else if (preset === 'firstPerson') {
      // Clean, majestic eye-level prayer view that follows laptop rotation
      setCameraPitch(28);
    } else if (preset === 'overhead') {
      setCameraPitch(85);
      setOverheadYaw(0);
    }
  }, []);

  // Compute angle difference between prayer mat/laptop and Kaaba direction
  const angleDiff = useMemo(() => {
    const diff = (qiblaDirection - laptopFacing + 360) % 360;
    return diff > 180 ? diff - 360 : diff;
  }, [qiblaDirection, laptopFacing]);

  const isAligned = Math.abs(angleDiff) <= 5;

  // Handle Drag to Orbit View
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pitch: cameraPitch,
      yaw: dragYawOffset,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newPitch = Math.max(15, Math.min(85, dragStartRef.current.pitch + deltaY * 0.3));
    const newYaw = (dragStartRef.current.yaw + deltaX * 0.4) % 360;

    setCameraPitch(newPitch);
    setDragYawOffset(newYaw);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Continuous auto-rotation animation if enabled
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setDragYawOffset((prev) => (prev + 0.3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Relative Turn Guidance
  const turnInstruction = useMemo(() => {
    const absDiff = Math.abs(Math.round(angleDiff));
    if (absDiff <= 4) {
      return { text: 'Directly Facing Holy Kaaba! 🕋', side: 'aligned' };
    } else if (angleDiff > 0) {
      return { text: `Turn ${absDiff}° to your Right 👉`, side: 'right' };
    } else {
      return { text: `Turn ${absDiff}° to your Left 👈`, side: 'left' };
    }
  }, [angleDiff]);

  // Quick delta adjustments for laptop rotation
  const rotateLaptopBy = (delta: number) => {
    const next = (laptopFacing + delta + 360) % 360;
    onLaptopFacingChange(next);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-border/80 bg-card text-card-foreground dark:bg-neutral-950 dark:text-white shadow-xl select-none transition-colors duration-300">
      
      {/* 3D Viewport Header Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between p-4 sm:p-5 bg-muted/40 dark:bg-neutral-900/90 backdrop-blur-md border-b border-border/80 dark:border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${isAligned ? 'bg-emerald-500 shadow-[0_0_12px_#10b981] animate-ping' : 'bg-orange-500 shadow-[0_0_12px_#f97316]'}`} />
          <div>
            <h3 className="font-headline font-bold text-base sm:text-lg flex items-center gap-2 text-foreground dark:text-white">
              <span>Real-World 3D Room & Kaaba Space</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                isAligned 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                  : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30'
              }`}>
                {isAligned ? 'Aligned (0° offset)' : `${Math.abs(Math.round(angleDiff))}° Offset`}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground dark:text-neutral-400 flex items-center gap-2 flex-wrap">
              <span>Rotates with your room alignment. Facing: <strong className="text-orange-500">{laptopFacing}°</strong></span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-muted/60 dark:bg-white/5 px-2 py-0.5 rounded-md font-mono">
                <Keyboard className="w-3 h-3 text-orange-500" />
                <span>Use [←] and [→] keys</span>
              </span>
            </p>
          </div>
        </div>

        {/* Live Motion Sensor & Camera Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Sensor Status Pill */}
          {hasCompassSensor ? (
            <button
              onClick={onToggleLiveSensor}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                useLiveSensor
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
              }`}
              title="Click to toggle live motion tracking"
            >
              <Radio className={`w-3.5 h-3.5 ${useLiveSensor ? 'animate-pulse text-emerald-500' : ''}`} />
              <span>{useLiveSensor ? 'Live Motion: Active' : 'Sensor Paused'}</span>
            </button>
          ) : (
            <button
              onClick={handleSensorSyncClick}
              disabled={isTestingSensor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 transition-all cursor-pointer disabled:opacity-50"
              title="Test device motion sensor"
            >
              <Radio className={`w-3.5 h-3.5 text-orange-500 ${isTestingSensor ? 'animate-spin' : ''}`} />
              <span>{isTestingSensor ? 'Testing Sensor…' : 'Sync Device Motion'}</span>
            </button>
          )}

          {/* Camera Preset Buttons */}
          <div className="flex items-center gap-1 bg-background/80 dark:bg-neutral-800/80 p-1 rounded-xl border border-border/80 dark:border-white/10 text-xs shadow-sm">
            <button
              onClick={() => setPreset('firstPerson')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                cameraPreset === 'firstPerson' 
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20' 
                  : 'text-muted-foreground hover:text-foreground dark:text-neutral-300 dark:hover:text-white'
              }`}
            >
              Prayer View
            </button>
            <button
              onClick={() => setPreset('isometric')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                cameraPreset === 'isometric' 
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20' 
                  : 'text-muted-foreground hover:text-foreground dark:text-neutral-300 dark:hover:text-white'
              }`}
            >
              Isometric 3D
            </button>
            <button
              onClick={() => setPreset('overhead')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                cameraPreset === 'overhead' 
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20' 
                  : 'text-muted-foreground hover:text-foreground dark:text-neutral-300 dark:hover:text-white'
              }`}
            >
              Top Down
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                autoRotate ? 'text-orange-500 bg-orange-500/20' : 'text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-white'
              }`}
              title="Toggle Cinematic Orbit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Stage Container */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-[640px] sm:h-[720px] md:h-[780px] overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors duration-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-50/50 via-slate-100 to-slate-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-black"
        style={{ perspective: '1400px' }}
      >
        
        {/* Subtle celestial stars backdrop (Dark) or subtle stone grid (Light) */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-35 bg-[radial-gradient(#00000018_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:32px_32px]" />
        
        {/* Glowing alignment ambient aura when locked on */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
            isAligned ? 'opacity-35' : 'opacity-0'
          } bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.35)_0%,_transparent_75%)]`} 
        />

        {/* 3D World Transformation Group - Rotates in real time as the laptop rotates! */}
        <div
          className="relative w-[800px] h-[800px] transition-transform duration-200 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${cameraPitch}deg) rotateZ(${effectiveYaw}deg)`,
          }}
        >
          {/* Clean Floor Horizon & Compass Plane */}
          <div 
            className="absolute inset-0 rounded-full border border-slate-300 dark:border-white/10 flex items-center justify-center pointer-events-none"
            style={{ transform: 'translateZ(-1px)' }}
          >
            {/* Concentric rings */}
            <div className="w-[720px] h-[720px] rounded-full border border-slate-300/60 dark:border-white/5" />
            <div className="w-[480px] h-[480px] rounded-full border border-slate-300/40 dark:border-white/5" />

            {/* Subtle Cardinal Markers - Clean, non-distracting */}
            <span className="absolute top-2 text-xs font-bold tracking-widest text-orange-600 dark:text-orange-400">TRUE NORTH (0°)</span>
            <span className="absolute right-4 text-[10px] font-semibold tracking-widest text-slate-500 dark:text-neutral-500">EAST (90°)</span>
            <span className="absolute bottom-3 text-[10px] font-semibold tracking-widest text-slate-500 dark:text-neutral-500">SOUTH (180°)</span>
            <span className="absolute left-4 text-[10px] font-semibold tracking-widest text-slate-500 dark:text-neutral-500">WEST (270°)</span>

            {/* Faint North Guide Axis */}
            <div className="absolute top-6 w-0.5 h-[360px] bg-gradient-to-t from-transparent via-orange-500/25 to-orange-500/70" />
          </div>

          {/* ==================================================================== */}
          {/* 🕋 THE HOLY KAABA (Grand 128px x 128px Cube)                           */}
          {/* ==================================================================== */}
          {(() => {
            const rad = ((qiblaDirection - 90) * Math.PI) / 180;
            const kx = 400 + 320 * Math.cos(rad);
            const ky = 400 + 320 * Math.sin(rad);

            return (
              <div
                className="absolute z-10 transition-all duration-700"
                style={{
                  left: `${kx}px`,
                  top: `${ky}px`,
                  transform: 'translate(-50%, -50%)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Grand Circular Marble Plaza (Mataf Courtyard) */}
                <div 
                  className="absolute -inset-16 rounded-full bg-white/70 dark:bg-neutral-100/10 border-2 border-slate-300/60 dark:border-white/20 backdrop-blur-md -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-2xl"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translateZ(-1px)',
                    boxShadow: '0 0 60px rgba(249, 115, 22, 0.4)',
                  }}
                />

                {/* Holy Celestial Pillar of Light */}
                <div 
                  className="absolute w-28 h-[400px] bg-gradient-to-t from-orange-500/60 via-amber-400/25 to-transparent pointer-events-none blur-lg"
                  style={{
                    left: '50%',
                    bottom: '0',
                    transform: 'translateX(-50%) rotateX(-90deg)',
                    transformOrigin: 'bottom center',
                  }}
                />

                {/* 3D KAABA CUBE: 32 = 128px, translateZ = 64px */}
                <div 
                  className="relative w-32 h-32"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(64px) rotateZ(12deg)',
                  }}
                >
                  {/* Top Roof Face */}
                  <div 
                    className="absolute inset-0 bg-neutral-900 border border-neutral-700 flex items-center justify-center shadow-inner"
                    style={{ 
                      transform: 'translateZ(64px)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-orange-500/40 flex items-center justify-center text-xl text-orange-300 font-bold bg-neutral-950/80 shadow-md">
                      🕋
                    </div>
                  </div>

                  {/* Front Face (with Golden Door - Bab al-Kaaba & Calligraphy Belt) */}
                  <div 
                    className="absolute inset-0 bg-neutral-950 border border-neutral-800 flex flex-col justify-between p-2 shadow-2xl"
                    style={{
                      transform: 'rotateX(-90deg) translateZ(64px)',
                      background: 'linear-gradient(180deg, #1c1c1e 0%, #0a0a0c 100%)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Golden-Orange Hizam Calligraphy Belt */}
                    <div className="w-full h-5 bg-gradient-to-r from-orange-600 via-amber-300 to-orange-600 rounded-sm border-b-2 border-orange-300 shadow-md flex items-center justify-center px-1">
                      <span className="text-[9px] text-neutral-950 font-black tracking-widest font-mono">ALLAHU AKBAR</span>
                    </div>

                    {/* Golden Door of Kaaba */}
                    <div className="self-end mr-2 w-7 h-14 bg-gradient-to-t from-orange-600 via-orange-400 to-amber-300 rounded-t-sm border-2 border-orange-200 shadow-2xl flex items-center justify-center">
                      <div className="w-0.5 h-8 bg-neutral-950/80" />
                    </div>
                  </div>

                  {/* Back Face */}
                  <div 
                    className="absolute inset-0 bg-neutral-950 border border-neutral-800 p-2"
                    style={{
                      transform: 'rotateX(90deg) translateZ(64px)',
                      background: 'linear-gradient(180deg, #1c1c1e 0%, #0a0a0c 100%)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-full h-5 bg-gradient-to-r from-orange-600 via-amber-300 to-orange-600 rounded-sm border-b-2 border-orange-300" />
                  </div>

                  {/* Left Face */}
                  <div 
                    className="absolute inset-0 bg-neutral-950 border border-neutral-800 p-2"
                    style={{
                      transform: 'rotateY(-90deg) translateZ(64px)',
                      background: 'linear-gradient(180deg, #1c1c1e 0%, #0a0a0c 100%)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-full h-5 bg-gradient-to-r from-orange-600 via-amber-300 to-orange-600 rounded-sm border-b-2 border-orange-300" />
                  </div>

                  {/* Right Face */}
                  <div 
                    className="absolute inset-0 bg-neutral-950 border border-neutral-800 p-2"
                    style={{
                      transform: 'rotateY(90deg) translateZ(64px)',
                      background: 'linear-gradient(180deg, #1c1c1e 0%, #0a0a0c 100%)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-full h-5 bg-gradient-to-r from-orange-600 via-amber-300 to-orange-600 rounded-sm border-b-2 border-orange-300" />
                  </div>
                </div>

                {/* Floating Kaaba Bearing Tag */}
                <div 
                  className="absolute top-20 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-xl bg-card/95 dark:bg-neutral-900/95 border border-orange-500/70 text-xs font-black text-orange-600 dark:text-orange-400 shadow-2xl whitespace-nowrap pointer-events-none backdrop-blur-md"
                  style={{
                    transform: 'translateZ(150px) rotateX(-35deg)',
                  }}
                >
                  Holy Kaaba ({qiblaDirection.toFixed(1)}°)
                </div>
              </div>
            );
          })()}

          {/* ==================================================================== */}
          {/* ⚡ THE 3D LUMINOUS QIBLA RAY (Clean, Unbroken Laser of Light)          */}
          {/* ==================================================================== */}
          {(() => {
            const rayLength = 320;

            return (
              <div
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `translate(-50%, -50%) rotateZ(${qiblaDirection - 90}deg)`,
                }}
              >
                {/* Core Laser Beam */}
                <div
                  className={`rounded-full transition-all duration-500 ${
                    isAligned
                      ? 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-orange-400 shadow-[0_0_30px_rgba(52,211,153,0.95)] h-2.5'
                      : 'bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 shadow-[0_0_24px_rgba(249,115,22,0.9)] h-2'
                  }`}
                  style={{
                    width: `${rayLength}px`,
                    transform: 'translateY(-50%)',
                  }}
                />

                {/* Energy pulses flowing along the ray */}
                <div
                  className={`absolute left-[35%] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 ${
                    isAligned ? 'border-emerald-300 animate-ping' : 'border-orange-500 opacity-75 animate-pulse'
                  }`}
                />
                <div
                  className={`absolute left-[70%] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 ${
                    isAligned ? 'border-emerald-300 animate-ping' : 'border-orange-500 opacity-75 animate-pulse'
                  }`}
                />
              </div>
            );
          })()}

          {/* ==================================================================== */}
          {/* 🕌 USER PRAYER STATION                                              */}
          {/* ==================================================================== */}
          <div
            className="absolute left-1/2 top-1/2 transition-transform duration-200 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translate(-50%, -50%) rotateZ(${laptopFacing - 90}deg)`,
            }}
          >
            {/* Elegant Prayer Mat (Sajjadah) */}
            <div
              className={`absolute -top-32 -left-14 w-28 h-48 rounded-2xl border-2 shadow-2xl transition-all duration-500 ${
                isAligned 
                  ? 'bg-emerald-900/90 dark:bg-emerald-950/95 border-emerald-500 shadow-emerald-500/50 ring-4 ring-emerald-500/30' 
                  : 'bg-slate-900/90 dark:bg-neutral-900/95 border-orange-500 shadow-orange-500/30 ring-2 ring-orange-500/20'
              }`}
              style={{
                transform: 'translateZ(1px)',
              }}
            >
              {/* Islamic Mihrab Arch on Mat */}
              <div className="absolute inset-2 rounded-xl border border-white/20 flex flex-col items-center justify-between p-2.5">
                {/* Mihrab Dome Arch */}
                <div className="w-16 h-16 border-t-2 border-x-2 border-orange-400/90 rounded-t-full mt-1 flex items-center justify-center">
                  <span className="text-sm text-orange-300 font-bold">✦</span>
                </div>

                {/* Clean Mat Heading */}
                <span className="text-[9px] font-black text-orange-400 tracking-widest uppercase">
                  YOUR PRAYER MAT
                </span>
                
                {/* Standing Spot Indicator at base of mat */}
                <div className="flex flex-col items-center pb-1">
                  <div className="w-12 h-6 rounded-md bg-white/15 border border-white/25 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">STAND HERE</span>
                  </div>
                </div>
              </div>

              {/* Velvet Fringe / Tassels */}
              <div className="absolute -top-2 left-3 right-3 h-1.5 bg-orange-400/90 rounded-full" />
              <div className="absolute -bottom-2 left-3 right-3 h-1.5 bg-orange-400/90 rounded-full" />
            </div>

            {/* Clean Directional Pointer from top of mat */}
            <div
              className={`absolute -top-34 left-1/2 -translate-x-1/2 w-1.5 h-10 pointer-events-none transition-colors ${
                isAligned ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-orange-500 shadow-[0_0_12px_#f97316]'
              }`}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-t-2 border-l-2 border-inherit" />
            </div>

            {/* Laptop Direction Pill (Theme Adaptive) */}
            <div 
              className="absolute top-24 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-card/95 dark:bg-neutral-900/95 border border-border dark:border-white/15 text-[10px] font-bold text-foreground dark:text-neutral-300 shadow-xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md"
              style={{
                transform: 'translateZ(10px) rotateX(-28deg)',
              }}
            >
              <Laptop className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
              <span>Facing: {laptopFacing}°</span>
            </div>
          </div>

        </div>

        {/* Real-Time On-Screen Guidance Overlay */}
        <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
          {/* Main instruction badge */}
          <div className="pointer-events-auto bg-card/95 dark:bg-neutral-900/95 border border-border/80 dark:border-white/10 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3.5 text-card-foreground dark:text-white">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
              isAligned ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
            }`}>
              {isAligned ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : '🧭'}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground dark:text-neutral-400 uppercase tracking-wider">How to Align in Your Room</p>
              <p className="text-base sm:text-lg font-black text-foreground dark:text-white">
                {turnInstruction.text}
              </p>
            </div>
          </div>

          {/* Quick Auto-Align & Rotation Steppers */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Quick Turn Left / Right Steppers */}
            <div className="bg-card/95 dark:bg-neutral-900/90 border border-border/80 dark:border-white/10 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 shadow-md">
              <button
                onClick={() => rotateLaptopBy(-15)}
                className="px-2.5 py-1.5 rounded-lg hover:bg-muted dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1 text-foreground dark:text-white transition-all cursor-pointer"
                title="Rotate Room / Laptop Left by 15° (or press ← key)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-orange-500" />
                <span>-15°</span>
              </button>
              <button
                onClick={() => rotateLaptopBy(15)}
                className="px-2.5 py-1.5 rounded-lg hover:bg-muted dark:hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1 text-foreground dark:text-white transition-all cursor-pointer"
                title="Rotate Room / Laptop Right by 15° (or press → key)"
              >
                <RotateCw className="w-3.5 h-3.5 text-orange-500" />
                <span>+15°</span>
              </button>
              <button
                onClick={() => rotateLaptopBy(90)}
                className="px-2.5 py-1.5 rounded-lg hover:bg-muted dark:hover:bg-neutral-800 text-xs font-semibold text-foreground dark:text-white transition-all cursor-pointer"
                title="Rotate by 90°"
              >
                +90°
              </button>
            </div>

            {!isAligned && (
              <Button
                size="sm"
                onClick={() => onLaptopFacingChange(Math.round(qiblaDirection))}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs gap-1.5 shadow-lg shadow-orange-500/30 px-3.5 py-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Snap to Kaaba</span>
              </Button>
            )}
          </div>
        </div>

        {/* Diagnostic Modal: Explains Laptop Magnetometer Hardware Limitation */}
        {showHardwareInfo && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-background/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-card border border-border shadow-2xl rounded-3xl p-6 text-foreground space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 text-orange-500">
                  <Laptop className="w-5 h-5" />
                  <h4 className="font-headline font-bold text-base">No Compass Hardware on Laptops</h4>
                </div>
                <button
                  onClick={() => setShowHardwareInfo(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Unlike smartphones, <strong>99% of laptops and desktop PCs do not have a built-in magnetic compass (magnetometer) chip</strong> inside their hardware.
                </p>
                <p>
                  Because there is no sensor chip in your laptop, your browser cannot know when you physically turn your laptop in your hands.
                </p>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/80 text-xs space-y-2">
                <span className="font-bold text-foreground block">💡 3 Easy Ways to Align on Your Laptop:</span>
                <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                  <li>
                    Press the <strong className="text-foreground">[←] and [→] arrow keys</strong> on your keyboard to turn the room.
                  </li>
                  <li>
                    Click the <strong className="text-foreground">-15° / +15° / +90°</strong> buttons on screen.
                  </li>
                  <li>
                    Pick which wall you face: <strong className="text-foreground">North, East, South, or West</strong>.
                  </li>
                </ul>
              </div>

              <div className="pt-1 flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-orange-500" />
                  <span>Phones have physical compasses!</span>
                </span>
                <Button
                  size="sm"
                  onClick={() => setShowHardwareInfo(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs px-4"
                >
                  Got It!
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Controls & Fine-Tuning Drawer */}
      <div className="p-6 bg-card dark:bg-neutral-900/90 border-t border-border/80 dark:border-white/10 space-y-6 transition-colors duration-300">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-neutral-400 block">
              Step 1: Which wall is your laptop facing in your room?
            </label>
            <span className="text-xs text-muted-foreground">
              Current angle: <strong className="text-orange-500 font-mono">{laptopFacing}°</strong>
            </span>
          </div>

          {/* Quick Wall / Cardinal Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Facing North', deg: 0, icon: '⬆️', desc: 'Towards North wall' },
              { label: 'Facing East', deg: 90, icon: '➡️', desc: 'Towards Sunrise wall' },
              { label: 'Facing South', deg: 180, icon: '⬇️', desc: 'Towards South wall' },
              { label: 'Facing West', deg: 270, icon: '⬅️', desc: 'Towards Sunset wall' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onLaptopFacingChange(item.deg)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  laptopFacing === item.deg
                    ? 'bg-orange-500/15 border-orange-500 text-orange-600 dark:text-white dark:bg-orange-500/20 shadow-md ring-2 ring-orange-500/40'
                    : 'bg-muted/40 hover:bg-muted dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border-border/80 dark:border-neutral-700/60 text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">{item.deg}°</span>
                </div>
                <p className="font-bold text-sm text-foreground dark:text-white">{item.label}</p>
                <p className="text-[11px] text-muted-foreground dark:text-neutral-400">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Precision Fine-Tune Slider */}
        <div className="bg-muted/40 dark:bg-neutral-800/50 p-4 rounded-2xl border border-border/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm font-medium text-foreground dark:text-neutral-300">
            <Laptop className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <span>
              Fine-tune laptop facing angle: <strong className="text-orange-600 dark:text-orange-400 font-mono text-base">{laptopFacing}°</strong>
            </span>
          </div>

          <div className="w-full sm:w-80 flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="359"
              value={laptopFacing}
              onChange={(e) => onLaptopFacingChange(parseInt(e.target.value, 10))}
              className="w-full accent-orange-500 cursor-pointer h-2"
            />
            <span className="text-sm font-mono text-orange-600 dark:text-orange-400 w-10 text-right font-bold">{laptopFacing}°</span>
          </div>
        </div>

        {/* Informative Stats Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs border-t border-border/80 dark:border-white/5 text-muted-foreground dark:text-neutral-400">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 dark:text-neutral-500 block mb-0.5">Qibla True Bearing</span>
            <span className="font-bold text-foreground dark:text-white text-base">
              {qiblaDirection.toFixed(1)}° True North
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 dark:text-neutral-500 block mb-0.5">Distance to Makkah</span>
            <span className="font-bold text-foreground dark:text-white text-base">
              {distanceKm ? `${distanceKm.toLocaleString()} km away` : 'Connecting...'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 dark:text-neutral-500 block mb-0.5">Current Location</span>
            <span className="font-bold text-foreground dark:text-white text-base truncate block">
              {city ? `${city}${country ? `, ${country}` : ''}` : 'Calibrated Location'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
