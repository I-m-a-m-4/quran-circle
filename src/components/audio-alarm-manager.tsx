'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  getAlarms, 
  upsertAlarm, 
  deleteAlarm, 
  toggleAlarm, 
  saveCustomAudio, 
  PRESET_ALARM_SOUNDS, 
  formatRepeatDays,
  type AudioAlarm 
} from '@/lib/alarms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlarmClock, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Upload, 
  Check, 
  Sparkles, 
  Moon, 
  Clock, 
  Volume2, 
  VolumeX, 
  Calendar, 
  X,
  FileAudio,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DAY_OPTIONS = [
  { label: 'Sun', day: 0 },
  { label: 'Mon', day: 1 },
  { label: 'Tue', day: 2 },
  { label: 'Wed', day: 3 },
  { label: 'Thu', day: 4 },
  { label: 'Fri', day: 5 },
  { label: 'Sat', day: 6 },
];

export function AudioAlarmManager() {
  const [alarms, setAlarms] = useState<AudioAlarm[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Preview audio state
  const [previewingAlarmId, setPreviewingAlarmId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // New Alarm Form State
  const [time, setTime] = useState('04:30');
  const [label, setLabel] = useState('🌙 Monday & Thursday Sunnah Fasting');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 4]); // Mon & Thu by default
  const [soundType, setSoundType] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_ALARM_SOUNDS[0].id);
  const [volume, setVolume] = useState(0.9);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);

  // Custom audio upload states
  const [uploadedAudioId, setUploadedAudioId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewingCustom, setIsPreviewingCustom] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAlarms(getAlarms());

    const handleUpdate = () => {
      setAlarms(getAlarms());
    };
    window.addEventListener('md-alarms-updated', handleUpdate);
    return () => window.removeEventListener('md-alarms-updated', handleUpdate);
  }, []);

  const stopPreview = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    setPreviewingAlarmId(null);
    setIsPreviewingCustom(false);
  };

  const handleToggle = (id: string, current: boolean) => {
    toggleAlarm(id, !current);
  };

  const handleDelete = (id: string) => {
    stopPreview();
    deleteAlarm(id);
  };

  const handleTestAlarm = (alarm: AudioAlarm) => {
    stopPreview();
    window.dispatchEvent(new CustomEvent('test-trigger-alarm', { detail: { alarm } }));
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac)$/i)) {
      setUploadError('Please select a valid audio file (.mp3, .wav, .m4a, .ogg).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Audio file is too large. Please select a file under 8MB.');
      return;
    }

    setIsUploadingAudio(true);
    setUploadError(null);

    try {
      const res = await saveCustomAudio(file);
      setUploadedAudioId(res.audioId);
      setUploadedFileName(res.fileName);
      setUploadedDataUrl(res.dataUrl);
      setSoundType('custom');
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process audio file');
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const toggleCustomPreview = () => {
    if (isPreviewingCustom) {
      stopPreview();
    } else if (uploadedDataUrl) {
      stopPreview();
      const a = new Audio(uploadedDataUrl);
      a.volume = volume;
      a.onended = () => setIsPreviewingCustom(false);
      audioPreviewRef.current = a;
      a.play().catch(() => {});
      setIsPreviewingCustom(true);
    }
  };

  const handleCreateAlarm = () => {
    const preset = PRESET_ALARM_SOUNDS.find(p => p.id === selectedPresetId);

    const newAlarm: AudioAlarm = {
      id: `alarm-${Date.now()}`,
      label: label.trim() || 'Islamic Alarm',
      time,
      enabled: true,
      repeatDays,
      soundType,
      presetId: soundType === 'preset' ? preset?.id : undefined,
      presetName: soundType === 'preset' ? preset?.name : undefined,
      presetUrl: soundType === 'preset' ? preset?.url : undefined,
      customAudioId: soundType === 'custom' ? uploadedAudioId || undefined : undefined,
      customAudioFileName: soundType === 'custom' ? uploadedFileName || undefined : undefined,
      volume,
      snoozeMinutes,
      createdAt: Date.now(),
    };

    upsertAlarm(newAlarm);
    stopPreview();
    setShowAddModal(false);

    // Reset form
    setUploadedAudioId(null);
    setUploadedFileName(null);
    setUploadedDataUrl(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlarmClock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">Scheduled Audio Alarms & Fasting Suhoor</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automate audio alarms to play on specific days (like Monday & Thursday Sunnah fasting, Tahajjud, or Adhan), or upload your own custom recitation audio!
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="font-bold gap-2 px-4 rounded-xl shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Alarm
        </Button>
      </div>

      {/* Alarms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alarms.map((alarm) => (
          <Card 
            key={alarm.id} 
            className={cn(
              "rounded-2xl border transition-all duration-200 overflow-hidden",
              alarm.enabled 
                ? "bg-card border-border/80 shadow-xs" 
                : "bg-muted/30 border-border/40 opacity-70"
            )}
          >
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
                      {alarm.time}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      alarm.enabled 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      {alarm.enabled ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-foreground leading-tight">
                    {alarm.label}
                  </h4>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{formatRepeatDays(alarm.repeatDays)}</span>
                  </p>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(alarm.id, alarm.enabled)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    alarm.enabled ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  title={alarm.enabled ? "Turn Off" : "Turn On"}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                      alarm.enabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {/* Audio badge & actions footer */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[200px]">
                  <Volume2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate text-[11px] font-medium">
                    {alarm.soundType === 'custom' 
                      ? (alarm.customAudioFileName || 'Custom Audio') 
                      : (alarm.presetName || 'Makkah Adhan')}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTestAlarm(alarm)}
                    className="h-8 px-2 text-[11px] text-primary hover:bg-primary/10 rounded-lg gap-1 font-semibold"
                    title="Test Alarm Sound & Popup"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Test
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(alarm.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    title="Delete Alarm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* CREATE NEW ALARM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <AlarmClock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Create Audio Alarm</h3>
              </div>
              <button 
                onClick={() => { stopPreview(); setShowAddModal(false); }}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Quick Islamic Templates
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    title: '🌙 Monday & Thursday Sunnah Fasting',
                    time: '04:30',
                    days: [1, 4]
                  },
                  {
                    title: '🌌 Tahajjud Night Awakening',
                    time: '03:45',
                    days: [0, 1, 2, 3, 4, 5, 6]
                  },
                  {
                    title: '📖 Friday Surah Al-Kahf',
                    time: '09:30',
                    days: [5]
                  },
                  {
                    title: '🌅 Morning Adhkar Reminder',
                    time: '06:00',
                    days: [0, 1, 2, 3, 4, 5, 6]
                  },
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setLabel(tpl.title);
                      setTime(tpl.time);
                      setRepeatDays(tpl.days);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-border bg-accent/40 hover:bg-primary/10 hover:border-primary/40 text-foreground font-medium transition-colors"
                  >
                    {tpl.title.split(' ')[0]} {tpl.title.split(' ')[1]} ({tpl.time})
                  </button>
                ))}
              </div>
            </div>

            {/* Time & Label */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-foreground">Alarm Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-base font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Alarm Label / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Suhoor Fasting Alarm"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Repeat Days */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Repeat Schedule</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRepeatDays([1, 4])}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Mon & Thu Only
                  </button>
                  <span className="text-muted-foreground text-[10px]">•</span>
                  <button
                    type="button"
                    onClick={() => setRepeatDays([0, 1, 2, 3, 4, 5, 6])}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Every Day
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {DAY_OPTIONS.map(({ label: dayLabel, day }) => {
                  const isSelected = repeatDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setRepeatDays(prev => prev.filter(d => d !== day));
                        } else {
                          setRepeatDays(prev => [...prev, day].sort());
                        }
                      }}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold transition-all border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {dayLabel}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Selected: <span className="font-semibold text-foreground">{formatRepeatDays(repeatDays)}</span>
              </p>
            </div>

            {/* Audio Selection & Custom Audio Upload */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <label className="text-xs font-semibold text-foreground block">
                Audio Sound & Playback
              </label>

              {/* Segmented Sound Choice */}
              <div className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSoundType('preset')}
                  className={cn(
                    "py-1.5 text-xs font-bold rounded-lg transition-all",
                    soundType === 'preset' ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Preset Adhan Voices
                </button>
                <button
                  type="button"
                  onClick={() => setSoundType('custom')}
                  className={cn(
                    "py-1.5 text-xs font-bold rounded-lg transition-all",
                    soundType === 'custom' ? "bg-card shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Upload Custom Audio
                </button>
              </div>

              {soundType === 'preset' ? (
                <div className="space-y-2">
                  <select
                    value={selectedPresetId}
                    onChange={(e) => setSelectedPresetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {PRESET_ALARM_SOUNDS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />

                  {uploadedFileName ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileAudio className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-foreground truncate">{uploadedFileName}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Ready for alarm</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={toggleCustomPreview}
                          className="h-8 px-2.5 text-xs text-emerald-500 hover:bg-emerald-500/20 rounded-lg gap-1"
                        >
                          {isPreviewingCustom ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          {isPreviewingCustom ? 'Pause' : 'Listen'}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 px-2 text-xs rounded-lg"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-primary/5 cursor-pointer text-center space-y-2 transition-all"
                    >
                      <Upload className="w-7 h-7 mx-auto text-primary" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Click to upload custom audio file</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Supports MP3, WAV, M4A, OGG (Up to 8MB)</p>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-xs text-destructive font-medium">{uploadError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Snooze Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Snooze Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSnoozeMinutes(mins)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold border transition-colors",
                      snoozeMinutes === mins 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {mins} Minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { stopPreview(); setShowAddModal(false); }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAlarm}
                disabled={soundType === 'custom' && !uploadedAudioId}
                className="font-bold px-6 rounded-xl"
              >
                Save Alarm
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
