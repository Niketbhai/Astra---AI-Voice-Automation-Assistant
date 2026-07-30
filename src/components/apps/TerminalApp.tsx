import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Trash2, CheckCircle, Play } from 'lucide-react';
import { TerminalLog } from '../../types';

interface TerminalAppProps {
  logs: TerminalLog[];
  onExecuteCommand: (cmd: string) => void;
  onClearLogs: () => void;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  logs,
  onExecuteCommand,
  onClearLogs
}) => {
  const [cmdInput, setCmdInput] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cmdInput.trim()) {
      onExecuteCommand(cmdInput.trim());
      setCmdInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs text-slate-200 rounded-b-xl overflow-hidden border-t border-slate-800">
      {/* Terminal Top Control Bar */}
      <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-[11px] text-slate-300">Astra System Terminal (bash/zsh)</span>
        </div>

        <button
          onClick={onClearLogs}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded text-[11px] flex items-center gap-1"
          title="Clear Logs"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono leading-relaxed">
        <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-900">
          Astra Automation Terminal v2.4 [x86_64-pc-linux-gnu]
          <br />
          Type terminal commands or say "Astra, run command in terminal".
        </div>

        {logs.map((log) => (
          <div key={log.id} className="space-y-0.5">
            {log.command && (
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="text-emerald-400 font-bold">astra@desktop:~/Portfolio$</span>
                <span>{log.command}</span>
              </div>
            )}
            <div
              className={`pl-3 whitespace-pre-wrap ${
                log.type === 'error'
                  ? 'text-rose-400'
                  : log.type === 'success'
                  ? 'text-emerald-300'
                  : log.type === 'system'
                  ? 'text-purple-300 font-semibold'
                  : 'text-slate-300'
              }`}
            >
              {log.output}
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Terminal Input Line */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <span className="text-emerald-400 font-bold shrink-0">astra@desktop:~/Portfolio$</span>
        <input
          type="text"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          placeholder="Execute shell command (e.g., node script.js, npm test)..."
          className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none"
        />
        <button
          type="submit"
          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
