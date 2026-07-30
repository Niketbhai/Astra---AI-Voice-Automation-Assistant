import React, { useState } from 'react';
import { FileCode, Folder, Play, Globe, Terminal, Save, CheckCircle2, ChevronRight, Copy, Code2 } from 'lucide-react';
import { FileItem } from '../../types';

interface VSCodeAppProps {
  files: FileItem[];
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onSaveFile: (path: string, content: string) => void;
  onRunLiveServer: () => void;
  isLiveServerRunning: boolean;
}

export const VSCodeApp: React.FC<VSCodeAppProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onSaveFile,
  onRunLiveServer,
  isLiveServerRunning
}) => {
  const activeFile = files.find(f => f.path === activeFilePath) || files[0];
  const [editorCode, setEditorCode] = useState(activeFile?.content || '');
  const [isSaved, setIsSaved] = useState(true);

  // Sync editorCode when activeFile changes
  React.useEffect(() => {
    if (activeFile) {
      setEditorCode(activeFile.content || '');
      setIsSaved(true);
    }
  }, [activeFile?.path, activeFile?.content]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorCode(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (activeFile) {
      onSaveFile(activeFile.path, editorCode);
      setIsSaved(true);
    }
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 font-mono text-xs select-none overflow-hidden rounded-b-xl">
      {/* VS Code Left Activity Bar */}
      <div className="w-12 bg-slate-900 border-r border-slate-800/80 flex flex-col items-center py-3 gap-4 text-slate-400">
        <button className="p-2 text-cyan-400 bg-slate-800/80 rounded-lg border border-cyan-500/30" title="Explorer">
          <Folder className="w-4 h-4" />
        </button>
        <button className="p-2 hover:text-slate-200" title="Source Control">
          <Code2 className="w-4 h-4" />
        </button>
        <button onClick={onRunLiveServer} className={`p-2 rounded-lg transition-colors ${isLiveServerRunning ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'hover:text-slate-200'}`} title="Live Server">
          <Globe className="w-4 h-4" />
        </button>
      </div>

      {/* VS Code File Tree Explorer Sidebar */}
      <div className="w-48 bg-slate-900/90 border-r border-slate-800/80 flex flex-col">
        <div className="p-2.5 font-sans uppercase font-bold text-[10px] text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-800">
          <span>EXPLORER</span>
          <span className="text-[9px] bg-slate-800 text-cyan-400 px-1 rounded font-mono">VS CODE</span>
        </div>

        <div className="p-2 overflow-y-auto flex-1 space-y-1">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => onSelectFile(file.path)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
                activeFile?.path === file.path
                  ? 'bg-cyan-500/15 text-cyan-300 font-medium border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {file.type === 'folder' ? (
                <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              )}
              <span className="truncate">{file.name}</span>
            </button>
          ))}
          {files.length === 0 && (
            <div className="text-slate-500 text-center py-6 text-[11px] italic font-sans">
              No files in workspace yet. Ask Astra to create code files!
            </div>
          )}
        </div>

        {/* Live Server Action */}
        <div className="p-2 border-t border-slate-800 bg-slate-900/80">
          <button
            onClick={onRunLiveServer}
            className={`w-full py-1.5 px-2 rounded flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all ${
              isLiveServerRunning
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isLiveServerRunning ? "Live Server Active (Port 5500)" : "Open Live Server"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Main Panel */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Active Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 flex items-center overflow-x-auto">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.path)}
              className={`px-3 py-2 flex items-center gap-2 text-xs border-r border-slate-800 cursor-pointer font-sans ${
                activeFile?.path === file.path
                  ? 'bg-slate-950 text-cyan-300 border-t-2 border-t-cyan-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-850'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>{file.name}</span>
              {!isSaved && activeFile?.path === file.path && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </div>
          ))}
          {activeFile && (
            <div className="ml-auto pr-3 flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-all ${
                  isSaved
                    ? 'text-slate-500 hover:text-slate-300'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                <Save className="w-3 h-3" />
                <span>{isSaved ? "Saved" : "Save Code"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Code Content Textarea */}
        {activeFile ? (
          <div className="flex-1 relative flex">
            {/* Line Numbers */}
            <div className="w-10 bg-slate-950/60 border-r border-slate-800/60 py-3 text-right pr-2 text-slate-600 font-mono text-xs select-none">
              {(editorCode || '').split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>

            <textarea
              value={editorCode}
              onChange={handleCodeChange}
              spellCheck={false}
              className="w-full h-full bg-slate-950 text-slate-200 font-mono text-xs p-3 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-sans p-6 text-center">
            <FileCode className="w-12 h-12 mb-3 text-slate-700" />
            <p className="font-semibold text-slate-400 text-sm">Visual Studio Code Workspace</p>
            <p className="text-xs max-w-sm mt-1">
              Ask Astra to create files or generate project boilerplate (e.g. Portfolio project index.html, style.css, script.js).
            </p>
          </div>
        )}

        {/* Status Bar */}
        <div className="bg-cyan-950/90 border-t border-cyan-800/40 px-3 py-1 flex items-center justify-between text-[11px] text-cyan-300 font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Ready
            </span>
            <span>{activeFile?.language || 'UTF-8'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span className="font-semibold text-emerald-400">
              {isLiveServerRunning ? "Live Server :5500" : "Go Live"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
