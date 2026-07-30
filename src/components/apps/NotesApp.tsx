import React, { useState } from 'react';
import { FileText, Plus, Trash2, Tag, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { NoteItem } from '../../types';

interface NotesAppProps {
  notes: NoteItem[];
  onCreateNote: (title: string, content: string, category?: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesApp: React.FC<NotesAppProps> = ({
  notes,
  onCreateNote,
  onDeleteNote
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const selectedNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      onCreateNote(newTitle.trim(), newContent.trim(), newCategory);
      setNewTitle('');
      setNewContent('');
    }
  };

  return (
    <div className="flex h-full bg-slate-900 rounded-b-xl text-slate-100 font-sans overflow-hidden">
      {/* Left Notes List Sidebar */}
      <div className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
            <FileText className="w-4 h-4" />
            <span>Astra Notes</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {notes.length} Notes
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedNote?.id === note.id
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
              }`}
            >
              <h4 className="font-semibold text-xs truncate">{note.title}</h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{note.content}</p>
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                <span className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400/80 font-mono">
                  {note.category}
                </span>
                <span>{note.timestamp}</span>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No notes saved yet. Tell Astra "Take a note about..."
            </div>
          )}
        </div>
      </div>

      {/* Note View & Editor */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {selectedNote ? (
          <div className="flex-1 p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {selectedNote.title}
                </h2>
                <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                  Saved on {selectedNote.timestamp} • Category: {selectedNote.category}
                </span>
              </div>

              <button
                onClick={() => onDeleteNote(selectedNote.id)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {selectedNote.content}
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddNote} className="flex-1 p-5 flex flex-col space-y-3">
            <h3 className="font-bold text-sm text-slate-200">Create New Note</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write note contents..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold self-end"
            >
              Save Note
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
