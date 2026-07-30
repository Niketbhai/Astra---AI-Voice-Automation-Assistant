import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, ShieldCheck, Settings, Sparkles, Terminal, Activity, Cpu } from 'lucide-react';
import { AstraStatus, VoiceSettings } from '../types';
import { tts } from '../utils/speech';

interface AstraHeaderProps {
  status: AstraStatus;
  voiceSettings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
  onManualWake: () => void;
  activeAppCount: number;
}

export const AstraHeader: React.FC<AstraHeaderProps> = ({
  status,
  voiceSettings,
  onUpdateSettings,
  onManualWake,
  activeAppCount
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setAvailableVoices(tts.getVoices());
    };
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const getStatusBadge = () => {
    switch (status) {
      case 'listening_wake_word':
        return (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Listening for "Astra"...
          </div>
        );
      case 'wake_word_detected':
        return (
          <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/20 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            "Yes Sir, tell me."
          </div>
        );
      case 'listening_command':
        return (
          <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-medium">
            <Mic className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Listening to command...
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
            <Cpu className="w-3.5 h-3.5 animate-spin text-purple-400" />
            Processing AI Automation...
          </div>
        );
      case 'executing':
        return (
          <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium">
            <Activity className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            Taking PC Control & Executing...
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            "Done, Sir."
          </div>
        );
      case 'clarifying':
        return (
          <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">
            Asking Clarification...
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Astra Idle
          </div>
        );
    }
  };

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between text-slate-100 z-30 sticky top-0 shadow-xl">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
              ASTRA AI
            </h1>
            <span className="text-[10px] font-mono uppercase bg-cyan-950 border border-cyan-800/60 text-cyan-400 px-1.5 py-0.5 rounded tracking-widest font-semibold">
              Voice OS Control
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            Wake word: <code className="text-cyan-300 font-mono font-bold bg-slate-900 px-1 py-0.2 rounded border border-cyan-500/30">"Astra"</code>
          </p>
        </div>
      </div>

      {/* Center Status Wave */}
      <div className="hidden md:flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 px-4 py-1.5 rounded-full shadow-inner">
        {getStatusBadge()}
        
        {/* Animated Soundwave Visualizer */}
        <div className="flex items-center gap-1 h-4 px-1">
          {[0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.3].map((heightRatio, i) => (
            <span
              key={i}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                status === 'listening_command' || status === 'wake_word_detected' || status === 'executing'
                  ? 'bg-gradient-to-t from-cyan-500 to-blue-400 animate-pulse'
                  : 'bg-slate-700'
              }`}
              style={{
                height: status === 'listening_command' || status === 'wake_word_detected'
                  ? `${Math.max(4, heightRatio * 16)}px`
                  : '4px',
                animationDelay: `${i * 120}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onManualWake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 border border-cyan-400/40 transition-all active:scale-95 cursor-pointer"
          title="Say or trigger wake word Astra"
        >
          <Mic className="w-3.5 h-3.5 text-cyan-200" />
          <span>Say "Astra"</span>
        </button>

        <button
          onClick={() => onUpdateSettings({ ttsEnabled: !voiceSettings.ttsEnabled })}
          className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
            voiceSettings.ttsEnabled
              ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
          }`}
          title={voiceSettings.ttsEnabled ? "Astra Voice Audio Enabled" : "Astra Voice Muted"}
        >
          {voiceSettings.ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PC Control Active</span>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          title="Voice Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Settings Modal */}
      {showSettings && (
        <div className="absolute top-16 right-4 w-80 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl z-50 text-slate-200 text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              Astra Voice & Assistant Settings
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Wake Word Trigger</label>
              <input
                type="text"
                value={voiceSettings.wakeWord}
                onChange={(e) => onUpdateSettings({ wakeWord: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Speech Voice</label>
              <select
                value={voiceSettings.selectedVoiceName}
                onChange={(e) => onUpdateSettings({ selectedVoiceName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">Default System Natural Voice</option>
                {availableVoices.map((v, idx) => (
                  <option key={idx} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Voice Speed ({voiceSettings.speechRate}x)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={voiceSettings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Speak Responses ("Done Sir")</span>
              <input
                type="checkbox"
                checked={voiceSettings.ttsEnabled}
                onChange={(e) => onUpdateSettings({ ttsEnabled: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Auto-Execute System Steps</span>
              <input
                type="checkbox"
                checked={voiceSettings.autoExecute}
                onChange={(e) => onUpdateSettings({ autoExecute: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
