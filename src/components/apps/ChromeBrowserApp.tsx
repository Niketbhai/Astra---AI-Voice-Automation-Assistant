import React, { useState, useEffect } from 'react';
import { Globe, Search, RefreshCw, ArrowLeft, ArrowRight, Shield, ExternalLink, Sparkles } from 'lucide-react';
import { FileItem } from '../../types';

interface ChromeBrowserAppProps {
  currentUrl: string;
  files: FileItem[];
  isLiveServerRunning: boolean;
  onNavigateUrl: (url: string) => void;
}

export const ChromeBrowserApp: React.FC<ChromeBrowserAppProps> = ({
  currentUrl,
  files,
  isLiveServerRunning,
  onNavigateUrl
}) => {
  const [addressBar, setAddressBar] = useState(currentUrl || 'http://localhost:5500');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAddressBar(currentUrl);
    if (currentUrl.includes('google.com') || currentUrl.startsWith('search:')) {
      const query = currentUrl.replace('https://www.google.com/search?q=', '').replace('search:', '');
      performWebSearch(query);
    }
  }, [currentUrl]);

  const performWebSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/astra/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressBar.startsWith('http://') || addressBar.startsWith('https://')) {
      onNavigateUrl(addressBar);
    } else {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(addressBar)}`;
      onNavigateUrl(searchUrl);
    }
  };

  // Extract index.html, style.css, script.js from files for Live Server preview
  const htmlFile = files.find(f => f.name.endsWith('.html') || f.path.includes('index.html'))?.content || '';
  const cssFile = files.find(f => f.name.endsWith('.css') || f.path.includes('style.css'))?.content || '';
  const jsFile = files.find(f => f.name.endsWith('.js') || f.path.includes('script.js'))?.content || '';

  const liveServerSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${cssFile}</style>
      </head>
      <body>
        ${htmlFile || '<div style="font-family:sans-serif;padding:40px;text-align:center;color:#475569;"><h2>Live Server Ready</h2><p>Ask Astra to generate index.html code!</p></div>'}
        <script>${jsFile}</script>
      </body>
    </html>
  `;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-b-xl text-slate-100 font-sans overflow-hidden border-t border-slate-800">
      {/* Chrome Top Bar & Address Bar */}
      <div className="bg-slate-950 p-2.5 border-b border-slate-800 flex items-center gap-2">
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-1 hover:text-white rounded" title="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="p-1 hover:text-white rounded" title="Forward">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => onNavigateUrl(addressBar)} className="p-1 hover:text-white rounded" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <form onSubmit={handleAddressSubmit} className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 text-xs">
            {addressBar.startsWith('http://localhost') ? (
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            )}
          </div>
          <input
            type="text"
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-full pl-9 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {isLiveServerRunning && (
          <button
            onClick={() => onNavigateUrl('http://localhost:5500')}
            className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Server 5500
          </button>
        )}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 bg-white overflow-y-auto">
        {addressBar.includes('localhost:5500') ? (
          <iframe
            title="Live Server Preview"
            srcDoc={liveServerSrcDoc}
            className="w-full h-full border-none"
          />
        ) : searchResults ? (
          <div className="p-6 max-w-3xl mx-auto text-slate-900 font-sans">
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">
                Google Search Results for: "{searchResults.query}"
              </h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-900 leading-relaxed">
              <span className="font-semibold text-blue-700 flex items-center gap-1 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" /> AI Web Summary
              </span>
              {searchResults.overview}
            </div>

            <div className="space-y-4">
              {searchResults.results?.map((res: any, idx: number) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="text-xs text-slate-500 mb-0.5">{res.url}</div>
                  <a href={res.url} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold text-base hover:underline flex items-center gap-1">
                    {res.title}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-slate-600 text-xs mt-1 leading-normal">{res.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-600">
            <Globe className="w-16 h-16 mb-3 text-slate-300" />
            <h3 className="font-bold text-lg text-slate-800">Astra Browser Engine</h3>
            <p className="text-sm text-slate-500 max-w-md mt-1">
              Ask Astra to "Open Live Server", "Search Google for React trends", or "Open websites".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
