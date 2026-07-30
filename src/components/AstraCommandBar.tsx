import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles, Command, CornerDownLeft, Play, AlertCircle, FileCode, Search, Terminal, FolderPlus, Music, Disc, Radio, Tv } from 'lucide-react';
import { AstraStatus } from '../types';

interface AstraCommandBarProps {
  status: AstraStatus;
  transcript: string;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitCommand: (cmd: string) => void;
  onWakeAstra: () => void;
  speechResponseText: string;
}

const EXAMPLE_PRESETS = [
  {
    label: "Play Main Agar Kahoon",
    icon: Music,
    cmd: "Play Main Agar Kahoon song on YouTube"
  },
  {
    label: "Play Bhojpuri Song",
    icon: Radio,
    cmd: "Play Bhojpuri song on YouTube"
  },
  {
    label: "Play Hindi Song",
    icon: Disc,
    cmd: "Play Hindi song on YouTube"
  },
  {
    label: "Portfolio Web Project",
    icon: FileCode,
    cmd: "Open VS Code, create an HTML project named Portfolio, generate index.html, style.css and script.js, write the starter code, save all files and open Live Server."
  }
];

export const AstraCommandBar: React.FC<AstraCommandBarProps> = ({
  status,
  transcript,
  isListening,
  onStartListening,
  onStopListening,
  onSubmitCommand,
  onWakeAstra,
  speechResponseText
}) => {
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmitCommand(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3 z-20">
      {/* Astra Voice Assistant Wake & Speech Response Banner */}
      {speechResponseText && (
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-500/40 rounded-xl p-3 flex items-center justify-between text-slate-100 shadow-xl shadow-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-blue-400 tracking-wider font-semibold block">
                Astra Voice Reply
              </span>
              <p className="text-sm font-semibold text-blue-100 italic">
                "{speechResponseText}"
              </p>
            </div>
          </div>
          <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-full font-mono">
            VOICE ACTIVE
          </span>
        </div>
      )}

      {/* Main Command Input Box & Mic Trigger */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 flex items-center gap-2">
            <Command className="w-4 h-4 text-cyan-400" />
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              status === 'listening_command'
                ? "Listening... Say your command or request (e.g., 'Open VS Code and create Portfolio project')..."
                : "Say 'Astra' or type your automation command..."
            }
            className={`w-full bg-slate-950 border text-slate-100 rounded-xl pl-10 pr-24 py-3 text-sm focus:outline-none transition-all ${
              status === 'listening_command' || status === 'wake_word_detected'
                ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                : 'border-slate-800 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30'
            }`}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={isListening ? onStopListening : onStartListening}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
              title={isListening ? "Stop Microphone Listening" : "Start Microphone Listening"}
            >
              {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <span>Execute</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Preset Voice Command Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Example Voice Commands:
        </span>
        {EXAMPLE_PRESETS.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                onWakeAstra();
                setTimeout(() => {
                  onSubmitCommand(preset.cmd);
                }, 800);
              }}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all group cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>{preset.label}</span>
              <Play className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
