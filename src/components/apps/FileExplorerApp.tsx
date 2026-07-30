import React, { useState } from 'react';
import { Folder, FileCode, FolderPlus, FilePlus, Trash2, Edit3, ArrowUpRight, HardDrive, CornerDownRight } from 'lucide-react';
import { FileItem } from '../../types';

interface FileExplorerAppProps {
  files: FileItem[];
  onCreateFile: (name: string, isFolder: boolean) => void;
  onDeleteFile: (path: string) => void;
  onOpenFileInVSCode: (path: string) => void;
}

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({
  files,
  onCreateFile,
  onDeleteFile,
  onOpenFileInVSCode
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  const handleCreate = (isFolder: boolean) => {
    if (newItemName.trim()) {
      onCreateFile(newItemName.trim(), isFolder);
      setNewItemName('');
      setIsAddingFolder(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-900 rounded-b-xl text-slate-100 font-sans overflow-hidden">
      {/* File Explorer Navigation Sidebar */}
      <div className="w-48 bg-slate-950 border-r border-slate-800 p-3 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <HardDrive className="w-4 h-4" />
          <span>This PC / Drives</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="p-2 bg-slate-900 text-slate-200 rounded font-medium flex items-center justify-between border border-slate-800">
            <span>Primary Disk (C:)</span>
            <span className="text-[10px] text-emerald-400 font-mono">1.2 TB</span>
          </div>
          <div className="p-2 text-slate-400 hover:text-slate-200 rounded cursor-pointer">
            📁 Desktop / Workspace
          </div>
          <div className="p-2 text-slate-400 hover:text-slate-200 rounded cursor-pointer">
            📁 Documents / Portfolio
          </div>
          <div className="p-2 text-slate-400 hover:text-slate-200 rounded cursor-pointer">
            📁 Downloads
          </div>
        </div>
      </div>

      {/* Main File Explorer View */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Top Explorer Actions Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
              /Workspace/Portfolio
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsAddingFolder(true)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded flex items-center gap-1 font-medium border border-slate-700"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setIsAddingFolder(false)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded flex items-center gap-1 font-medium border border-slate-700"
            >
              <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New File</span>
            </button>
          </div>
        </div>

        {/* Quick Add Item Bar */}
        <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={isAddingFolder ? "New folder name..." : "New file name (e.g. script.js)..."}
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleCreate(isAddingFolder)}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
          >
            Create
          </button>
        </div>

        {/* Files Grid View */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col justify-between group transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {file.type === 'folder' ? (
                    <Folder className="w-6 h-6 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode className="w-6 h-6 text-cyan-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 truncate max-w-[120px]">
                      {file.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {file.type === 'folder' ? 'Directory' : `${file.size || 1024} B`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                {file.type === 'file' && (
                  <button
                    onClick={() => onOpenFileInVSCode(file.path)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-200 flex items-center gap-0.5 font-medium"
                  >
                    <span>Edit VS Code</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={() => onDeleteFile(file.path)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              Folder is empty. Ask Astra: "Create an HTML project named Portfolio with files".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
