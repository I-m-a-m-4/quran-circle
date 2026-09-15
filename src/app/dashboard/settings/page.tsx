'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getSettings, saveSettings, type AppSettings } from '@/lib/storage/local';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Palette, MapPin, Compass, Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="pt-10 pb-6 px-8 max-w-4xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your app preferences and prayer configurations.</p>
      </div>

      <div className="px-8 max-w-4xl mx-auto space-y-8">
        
        {/* Appearance */}
        <Card className="glass-card border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="w-5 h-5 text-primary" /> Appearance
            </CardTitle>
            <CardDescription>Customize how Muslim Desk looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme Preference</p>
                <p className="text-sm text-muted-foreground">Select a light or dark theme.</p>
              </div>
              <Select value={theme || 'system'} onValueChange={setTheme}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System (Auto)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location & Prayer */}
        <Card className="glass-card border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Compass className="w-5 h-5 text-primary" /> Location & Prayer
            </CardTitle>
            <CardDescription>Configure how your prayer times are calculated.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Location Mode</p>
                    {settings.locationMode === 'auto' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {settings.city 
                      ? `Currently configured for ${settings.city}${settings.country ? `, ${settings.country}` : ''}`
                      : 'How should we determine your location?'}
                  </p>
                </div>
                <Select 
                  value={settings.locationMode} 
                  onValueChange={(val) => updateSetting('locationMode', val)}
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic (GPS)</SelectItem>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div>
                  <p className="font-medium">Calculation Method</p>
                  <p className="text-sm text-muted-foreground mt-1">Authority used for prayer times.</p>
                </div>
                <Select 
                  value={settings.calculationMethod.toString()} 
                  onValueChange={(val) => updateSetting('calculationMethod', parseInt(val))}
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">ISNA (North America)</SelectItem>
                    <SelectItem value="3">Muslim World League</SelectItem>
                    <SelectItem value="4">Umm Al-Qura (Makkah)</SelectItem>
                    <SelectItem value="5">Egyptian General Authority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div>
                  <p className="font-medium">Asr Juristic Method (Madhab)</p>
                  <p className="text-sm text-muted-foreground mt-1">Method for calculating Asr time.</p>
                </div>
                <Select 
                  value={settings.school.toString()} 
                  onValueChange={(val) => updateSetting('school', parseInt(val))}
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Select Madhab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Shafi, Maliki, Hanbali (Standard)</SelectItem>
                    <SelectItem value="1">Hanafi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="glass-card border-border/40 shadow-sm overflow-hidden bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="w-5 h-5 text-primary" /> About Muslim Desk
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
              <p>
                <strong>Muslim Desk</strong> is a comprehensive Islamic dashboard built to help you maintain consistency and focus in your daily spiritual habits.
              </p>
              <div>
                <p className="font-medium text-foreground mb-2">Data Sources:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Prayer Times & Qibla: <a href="https://aladhan.com" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">AlAdhan API</a></li>
                  <li>Quran text & audio: <a href="https://alquran.cloud" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">AlQuran Cloud API</a></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
