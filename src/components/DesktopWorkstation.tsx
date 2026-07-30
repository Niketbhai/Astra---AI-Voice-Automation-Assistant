import React, { useState } from 'react';
import { AppId, FileItem, NoteItem, TerminalLog, AutomationStep } from '../types';
import { VSCodeApp } from './apps/VSCodeApp';
import { ChromeBrowserApp } from './apps/ChromeBrowserApp';
import { FileExplorerApp } from './apps/FileExplorerApp';
import { TerminalApp } from './apps/TerminalApp';
import { NotesApp } from './apps/NotesApp';
import { YouTubeApp } from './apps/YouTubeApp';
import { Monitor, Code2, Globe, Folder, Terminal, FileText, X, Minus, Square, Play, CheckCircle2, AlertCircle, Cpu, Loader2, Sparkles, Tv } from 'lucide-react';

interface DesktopWorkstationProps {
  activeApps: AppId[];
  onOpenApp: (app: AppId) => void;
  onCloseApp: (app: AppId) => void;
  activeAppId: AppId;
  onSetActiveApp: (app: AppId) => void;
  
  // YouTube Music Props
  youtubeSearchQuery: string;
  onSearchYouTube: (query: string) => void;

  // Workspace Data
  files: FileItem[];
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onSaveFile: (path: string, content: string) => void;
  onCreateFile: (name: string, isFolder: boolean) => void;
  onDeleteFile: (path: string) => void;
  
  notes: NoteItem[];
  onCreateNote: (title: string, content: string, category?: string) => void;
  onDeleteNote: (id: string) => void;
  
  terminalLogs: TerminalLog[];
  onExecuteTerminalCmd: (cmd: string) => void;
  onClearTerminalLogs: () => void;
  
  browserUrl: string;
  isLiveServerRunning: boolean;
  onRunLiveServer: () => void;
  onNavigateBrowser: (url: string) => void;

  // Automation Steps Stream
  automationSteps: AutomationStep[];
  currentExecutingStepIndex: number;
  isExecuting: boolean;
}

export const DesktopWorkstation: React.FC<DesktopWorkstationProps> = ({
  activeApps,
  onOpenApp,
  onCloseApp,
  activeAppId,
  onSetActiveApp,
  youtubeSearchQuery,
  onSearchYouTube,
  files,
  activeFilePath,
  onSelectFile,
  onSaveFile,
  onCreateFile,
  onDeleteFile,
  notes,
  onCreateNote,
  onDeleteNote,
  terminalLogs,
  onExecuteTerminalCmd,
  onClearTerminalLogs,
  browserUrl,
  isLiveServerRunning,
  onRunLiveServer,
  onNavigateBrowser,
  automationSteps,
  currentExecutingStepIndex,
  isExecuting
}) => {
  const [minimizedApps, setMinimizedApps] = useState<AppId[]>([]);

  const toggleMinimize = (app: AppId) => {
    if (minimizedApps.includes(app)) {
      setMinimizedApps(minimizedApps.filter(a => a !== app));
      onSetActiveApp(app);
    } else {
      setMinimizedApps([...minimizedApps, app]);
    }
  };

  const getAppIcon = (app: AppId) => {
    switch (app) {
      case 'vscode': return <Code2 className="w-4 h-4 text-cyan-400" />;
      case 'chrome': return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'youtube': return <Tv className="w-4 h-4 text-red-500" />;
      case 'explorer': return <Folder className="w-4 h-4 text-amber-400" />;
      case 'terminal': return <Terminal className="w-4 h-4 text-purple-400" />;
      case 'notes': return <FileText className="w-4 h-4 text-yellow-400" />;
      default: return <Monitor className="w-4 h-4 text-blue-400" />;
    }
  };

  const getAppName = (app: AppId) => {
    switch (app) {
      case 'vscode': return "Visual Studio Code";
      case 'chrome': return "Google Chrome Browser";
      case 'youtube': return "YouTube Music Player";
      case 'explorer': return "File Explorer";
      case 'terminal': return "Astra Terminal";
      case 'notes': return "Astra Notes";
      default: return "System Workstation";
    }
  };

  const renderAppContent = (app: AppId) => {
    switch (app) {
      case 'vscode':
        return (
          <VSCodeApp
            files={files}
            activeFilePath={activeFilePath}
            onSelectFile={onSelectFile}
            onSaveFile={onSaveFile}
            onRunLiveServer={onRunLiveServer}
            isLiveServerRunning={isLiveServerRunning}
          />
        );
      case 'chrome':
        return (
          <ChromeBrowserApp
            currentUrl={browserUrl}
            files={files}
            isLiveServerRunning={isLiveServerRunning}
            onNavigateUrl={onNavigateBrowser}
          />
        );
      case 'youtube':
        return (
          <YouTubeApp
            currentQuery={youtubeSearchQuery}
            onSearchSong={onSearchYouTube}
          />
        );
      case 'explorer':
        return (
          <FileExplorerApp
            files={files}
            onCreateFile={onCreateFile}
            onDeleteFile={onDeleteFile}
            onOpenFileInVSCode={(path) => {
              onOpenApp('vscode');
              onSelectFile(path);
            }}
          />
        );
      case 'terminal':
        return (
          <TerminalApp
            logs={terminalLogs}
            onExecuteCommand={onExecuteTerminalCmd}
            onClearLogs={onClearTerminalLogs}
          />
        );
      case 'notes':
        return (
          <NotesApp
            notes={notes}
            onCreateNote={onCreateNote}
            onDeleteNote={onDeleteNote}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden select-none">
      {/* Desktop Wallpaper Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 pointer-events-none opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_50%)] pointer-events-none" />

      {/* Main Workspace Window Canvas */}
      <div className="flex-1 relative p-4 flex flex-col md:flex-row gap-4 overflow-hidden z-10">
        
        {/* Active Application Window Stage */}
        <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden relative">
          
          {/* Desktop Window Header */}
          <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* macOS-style Window Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onCloseApp(activeAppId)}
                  className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Close Window"
                />
                <button
                  onClick={() => toggleMinimize(activeAppId)}
                  className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer"
                  title="Minimize Window"
                />
                <button
                  className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer"
                  title="Maximize Window"
                />
              </div>

              <div className="h-4 w-px bg-slate-800" />

              {/* Active Window Title */}
              <div className="flex items-center gap-2">
                {getAppIcon(activeAppId)}
                <span className="font-bold text-xs text-slate-200">
                  {getAppName(activeAppId)}
                </span>
                <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Top Right App Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['vscode', 'chrome', 'youtube', 'explorer', 'terminal', 'notes'] as AppId[]).map((app) => {
                const isActive = activeAppId === app;
                const isOpened = activeApps.includes(app);
                return (
                  <button
                    key={app}
                    onClick={() => {
                      if (!isOpened) onOpenApp(app);
                      onSetActiveApp(app);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : isOpened
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {getAppIcon(app)}
                    <span className="capitalize hidden lg:inline">{app}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Window Main Canvas Body */}
          <div className="flex-1 relative overflow-hidden bg-slate-950">
            {minimizedApps.includes(activeAppId) ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Monitor className="w-12 h-12 mb-2 text-slate-700" />
                <p>Window Minimized to Taskbar Dock</p>
                <button
                  onClick={() => toggleMinimize(activeAppId)}
                  className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-medium"
                >
                  Restore Window
                </button>
              </div>
            ) : (
              renderAppContent(activeAppId)
            )}
          </div>
        </div>

        {/* Live Astra PC Automation Action Stream Sidebar */}
        <div className="w-full md:w-80 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                Astra PC Automation
              </h3>
            </div>
            {isExecuting && (
              <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-full font-mono animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> EXECUTING
              </span>
            )}
          </div>

          {/* Step Sequence Container */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1">
            {automationSteps.length > 0 ? (
              automationSteps.map((step, idx) => {
                const isCurrent = idx === currentExecutingStepIndex && isExecuting;
                const isDone = step.status === 'completed' || (idx < currentExecutingStepIndex);

                return (
                  <div
                    key={step.id || idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                        : isDone
                        ? 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                        : 'bg-slate-950/40 border-slate-850 text-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 font-mono text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <h4 className={`font-semibold ${isCurrent ? 'text-cyan-300' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                          {step.title}
                        </h4>
                      </div>

                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {step.app}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-normal">
                      {step.description}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Sparkles className="w-8 h-8 mb-2 text-cyan-500/40" />
                <p className="font-semibold text-slate-400 text-xs">Waiting for Voice Command</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Say <code className="text-cyan-300 font-mono font-bold">"Astra"</code> then speak your instructions.
                </p>
              </div>
            )}
          </div>

          {/* System Control Stats Footer */}
          <div className="pt-3 border-t border-slate-800 mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>PC Control: Granted</span>
            <span className="text-emerald-400 font-bold">Status: Online</span>
          </div>
        </div>
      </div>

      {/* Bottom Desktop Taskbar Dock */}
      <div className="bg-slate-950/95 border-t border-slate-800/80 px-6 py-2.5 flex items-center justify-between z-20 backdrop-blur-md">
        {/* Left Start Button & Voice Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer border border-cyan-400/40">
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>ASTRA OS</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Wake Word: <span className="text-cyan-300 font-bold">"Astra"</span>
          </span>
        </div>

        {/* Center Taskbar Dock App Icons */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          {(['vscode', 'chrome', 'youtube', 'explorer', 'terminal', 'notes'] as AppId[]).map((app) => {
            const isActive = activeAppId === app;
            const isOpened = activeApps.includes(app);

            return (
              <button
                key={app}
                onClick={() => {
                  if (!isOpened) onOpenApp(app);
                  onSetActiveApp(app);
                }}
                className={`relative p-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 scale-105'
                    : isOpened
                    ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-850'
                }`}
                title={getAppName(app)}
              >
                {getAppIcon(app)}
                {isOpened && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right System Clock & Indicators */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PC Control Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
