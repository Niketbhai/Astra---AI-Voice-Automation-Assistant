import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shared Gemini client initialization
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Astra Voice Automation Assistant" });
  });

  // Main Astra Command Parser Endpoint
  app.post("/api/astra/parse-command", async (req, res) => {
    try {
      const { command, activeContext } = req.body;

      if (!command || typeof command !== "string") {
        return res.status(400).json({ error: "Command string is required." });
      }

      const ai = getGeminiClient();

      const systemInstruction = `
You are Astra, an advanced AI Voice Automation Assistant for desktop and web systems.
Your wake word is "Astra".
When woken up, you acknowledge with "Yes Sir, tell me."
When a task is completed, you end with confirmation "Done, Sir."

You take voice or text commands from the user and break them down into concrete, step-by-step automation actions.

System Capabilities:
1. Open/close applications: 'vscode', 'chrome', 'explorer', 'terminal', 'notes', 'youtube', 'system'.
2. YouTube & Music Player: Play Hindi, Bhojpuri, or named songs directly on YouTube player (e.g. "Play Bhojpuri song", "Play Hindi song", "Play Kesariya", "Play Pawan Singh song"). Set app to 'youtube' or 'chrome' with actionType 'play_youtube'.
3. Folder & File Operations: create folders, create files, write full realistic code/content (HTML, CSS, JS, Python, Markdown, etc.), save files, copy/move/rename/delete files.
4. Code Generation & Projects: generate complete, production-ready starter or feature code for web projects (HTML, CSS, JS, React, Node.js, etc.).
5. Web Search & Browsing: search google, open specific websites, fetch information, open Live Server previews.
6. Notes & Organization: create notes with titles, categories, and formatted markdown content.
7. Terminal Command Execution: run shell/terminal commands (e.g. mkdir, touch, npm init, node script.js, git status, live-server).

Rules:
- If the command mentions playing a song or YouTube video (e.g., "Play Bhojpuri song", "Play Hindi song", "Play Lolipop Lagelu", "Play Kesariya"), set app to 'youtube' (or 'chrome'), actionType to 'play_youtube', and put the song query or song title in payload.searchQuery and payload.webUrl.
- If the command is vague, ambiguous, or lacks crucial information to proceed, set "isUnclear": true, specify "followUpQuestion" (one short polite question addressed as "Sir..."), and leave steps empty or minimal.
- If the command is clear, set "isUnclear": false, set "confirmationMessage": "Done, Sir.", specify "targetApps" (list of app IDs involved), a clear "summary", and a chronological list of "steps".
- Always write REAL, HIGH QUALITY starter code or document contents when creating files.
`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          isUnclear: {
            type: Type.BOOLEAN,
            description: "Whether the user command requires clarification.",
          },
          followUpQuestion: {
            type: Type.STRING,
            description: "A short, clear follow-up question if unclear (e.g. 'Sir, what name would you like for the HTML project?').",
          },
          confirmationMessage: {
            type: Type.STRING,
            description: "The confirmation phrase upon task completion, default 'Done, Sir.'",
          },
          targetApps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of app IDs affected: 'vscode', 'chrome', 'explorer', 'terminal', 'notes', 'youtube', 'system'.",
          },
          summary: {
            type: Type.STRING,
            description: "A concise 1-sentence summary of what Astra will automate.",
          },
          steps: {
            type: Type.ARRAY,
            description: "Ordered sequence of automated execution steps.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                app: { type: Type.STRING },
                actionType: {
                  type: Type.STRING,
                  description: "One of: 'open_app', 'close_app', 'create_folder', 'create_file', 'write_code', 'run_terminal', 'web_search', 'open_url', 'play_youtube', 'take_note', 'file_op'",
                },
                payload: {
                  type: Type.OBJECT,
                  properties: {
                    appName: { type: Type.STRING },
                    folderName: { type: Type.STRING },
                    folderPath: { type: Type.STRING },
                    fileName: { type: Type.STRING },
                    filePath: { type: Type.STRING },
                    fileContent: { type: Type.STRING },
                    terminalCommand: { type: Type.STRING },
                    searchQuery: { type: Type.STRING },
                    webUrl: { type: Type.STRING },
                    noteTitle: { type: Type.STRING },
                    noteContent: { type: Type.STRING },
                    sourcePath: { type: Type.STRING },
                    targetPath: { type: Type.STRING },
                    operation: { type: Type.STRING },
                  },
                },
              },
              required: ["title", "description", "app", "actionType"],
            },
          },
        },
        required: ["isUnclear", "targetApps", "summary", "steps"],
      };

      const result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `User Voice/Text Command: "${command}".
Active Desktop Context: ${JSON.stringify(activeContext || {})}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
        },
      });

      const parsedJson = JSON.parse(result.text || "{}");
      return res.json({ success: true, data: parsedJson });
    } catch (error: any) {
      console.error("Error parsing Astra command:", error);
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to parse command with Astra AI.",
      });
    }
  });

  // YouTube Music Search & Embed Endpoint
  app.post("/api/astra/youtube-search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Query required" });

      const ai = getGeminiClient();
      const result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Find popular YouTube video details for the music query: "${query}". Return the primary video ID (a valid 11-character YouTube video ID or a top iconic song ID like 'lJvBo2x4uL8', 'p8a2Pst5O0E', 'BddP6PYo2gs', 'YxWlaYCA8f0', 'kJQP7kiw5Fk', 'JGwWNGJdvx8', 'fHI8X4OXluQ', 'K4TOrB7at0Y', '2g811Ko7K8U', '09R8_2nJtjg'), title, channelName, genre (Bhojpuri / Hindi / Pop / Classical), and 3 related recommended songs.`,
        config: {
          systemInstruction: "You are a YouTube music metadata provider returning accurate video embed details in JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              videoId: { type: Type.STRING, description: "11-character YouTube video ID" },
              title: { type: Type.STRING },
              channelName: { type: Type.STRING },
              genre: { type: Type.STRING },
              embedUrl: { type: Type.STRING },
              relatedTracks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    videoId: { type: Type.STRING },
                    title: { type: Type.STRING },
                    channelName: { type: Type.STRING },
                  },
                },
              },
            },
            required: ["query", "videoId", "title", "channelName", "genre", "relatedTracks"],
          },
        },
      });

      const data = JSON.parse(result.text || "{}");
      if (!data.embedUrl) {
        data.embedUrl = `https://www.youtube.com/embed/${data.videoId}?autoplay=1&enablejsapi=1`;
      }
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Web search / summary query route for Astra Chrome browser
  app.post("/api/astra/web-search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Query required" });

      const ai = getGeminiClient();
      const result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Provide a realistic web search result page content for the search query: "${query}". Include 3-4 top search result summaries with title, snippet, and simulated URL.`,
        config: {
          systemInstruction: "You are generating rich web search engine response data in JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              overview: { type: Type.STRING },
              results: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    snippet: { type: Type.STRING },
                    url: { type: Type.STRING },
                  },
                },
              },
            },
            required: ["query", "overview", "results"],
          },
        },
      });

      const data = JSON.parse(result.text || "{}");
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Astra AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
