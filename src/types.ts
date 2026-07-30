export type AstraStatus = 
  | 'idle' 
  | 'listening_wake_word' 
  | 'wake_word_detected' 
  | 'listening_command' 
  | 'processing' 
  | 'executing' 
  | 'clarifying' 
  | 'completed' 
  | 'error';

export type AppId = 'vscode' | 'chrome' | 'explorer' | 'terminal' | 'notes' | 'youtube' | 'system';

export interface FileItem {
  id: string;
  name: string;
  path: string; // e.g. '/Portfolio/index.html'
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  size?: number;
  updatedAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
}

export interface TerminalLog {
  id: string;
  command?: string;
  output: string;
  type: 'input' | 'output' | 'error' | 'system' | 'success';
  timestamp: string;
}

export interface AutomationStep {
  id: string;
  title: string;
  description: string;
  app: AppId;
  actionType: 
    | 'open_app' 
    | 'close_app' 
    | 'create_folder' 
    | 'create_file' 
    | 'write_code' 
    | 'run_terminal' 
    | 'web_search' 
    | 'open_url' 
    | 'play_youtube'
    | 'take_note' 
    | 'file_op';
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: any;
  payload?: any;
}

export interface AstraCommandResult {
  isUnclear: boolean;
  followUpQuestion?: string;
  confirmationMessage?: string; // e.g. "Done, Sir."
  targetApps: AppId[];
  summary: string;
  steps: {
    title: string;
    description: string;
    app: AppId;
    actionType: AutomationStep['actionType'];
    payload?: {
      appName?: string;
      folderName?: string;
      folderPath?: string;
      fileName?: string;
      filePath?: string;
      fileContent?: string;
      terminalCommand?: string;
      searchQuery?: string;
      webUrl?: string;
      noteTitle?: string;
      noteContent?: string;
      sourcePath?: string;
      targetPath?: string;
      operation?: 'copy' | 'move' | 'rename' | 'delete';
    };
  }[];
}

export interface VoiceSettings {
  wakeWord: string;
  ttsEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  selectedVoiceName: string;
  autoExecute: boolean;
  permissionGranted: boolean;
}
