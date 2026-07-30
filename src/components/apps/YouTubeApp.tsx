import React, { useState, useEffect } from 'react';
import { Play, Search, Music, Disc, Tv, Volume2, Sparkles, ExternalLink, RefreshCw, Radio } from 'lucide-react';

interface YouTubeAppProps {
  currentQuery: string;
  onSearchSong: (query: string) => void;
}

interface YouTubeVideoData {
  query: string;
  videoId: string;
  title: string;
  channelName: string;
  genre: string;
  embedUrl: string;
  relatedTracks: { videoId: string; title: string; channelName: string }[];
}

// Popular curated backup video IDs for reliable playback
const CURATED_SONGS: Record<string, YouTubeVideoData> = {
  bhojpuri: {
    query: "Bhojpuri Hits",
    videoId: "lJvBo2x4uL8",
    title: "Lolipop Lagelu - Pawan Singh Hits",
    channelName: "Wave Music Bhojpuri",
    genre: "Bhojpuri",
    embedUrl: "https://www.youtube.com/embed/lJvBo2x4uL8?autoplay=1&enablejsapi=1",
    relatedTracks: [
      { videoId: "p8a2Pst5O0E", title: "Raate Diya Butake - Pawan Singh & Amrapali", channelName: "Wave Music" },
      { videoId: "BddP6PYo2gs", title: "Saj Ke Sawar Ke - Khesari Lal Yadav", channelName: "Speed Records Bhojpuri" },
      { videoId: "YxWlaYCA8f0", title: "Kamariya Kamre Aani - Bhojpuri Dhamaka", channelName: "Worldwide Records" }
    ]
  },
  hindi: {
    query: "Hindi Hits",
    videoId: "kJQP7kiw5Fk",
    title: "Despacito / Kesariya / Hindi Top Hits",
    channelName: "Sony Music India",
    genre: "Hindi",
    embedUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&enablejsapi=1",
    relatedTracks: [
      { videoId: "JGwWNGJdvx8", title: "Shape of You / Tum Hi Ho - Arijit Singh", channelName: "T-Series" },
      { videoId: "fHI8X4OXluQ", title: "Tere Vaaste - Zara Hatke Zara Bachke", channelName: "Saregama Music" },
      { videoId: "K4TOrB7at0Y", title: "Heeriye - Jasleen Royal & Arijit Singh", channelName: "Warner Music" }
    ]
  }
};

export const YouTubeApp: React.FC<YouTubeAppProps> = ({
  currentQuery,
  onSearchSong,
}) => {
  const [searchInput, setSearchInput] = useState(currentQuery || "Hindi Hits");
  const [videoData, setVideoData] = useState<YouTubeVideoData>(CURATED_SONGS.hindi);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'bhojpuri' | 'hindi'>('player');

  useEffect(() => {
    if (currentQuery) {
      setSearchInput(currentQuery);
      fetchYouTubeVideo(currentQuery);
    }
  }, [currentQuery]);

  const fetchYouTubeVideo = async (queryStr: string) => {
    setIsLoading(true);
    const lower = queryStr.toLowerCase();

    // Check direct category shortcuts first
    if (lower.includes('bhojpuri')) {
      setVideoData({
        ...CURATED_SONGS.bhojpuri,
        query: queryStr,
        title: lower.includes('pawan') ? "Pawan Singh Bhojpuri Superhit" : CURATED_SONGS.bhojpuri.title
      });
      setIsLoading(false);
      return;
    } else if (lower.includes('hindi')) {
      setVideoData({
        ...CURATED_SONGS.hindi,
        query: queryStr,
        title: lower.includes('arijit') ? "Arijit Singh Best Songs Collection" : CURATED_SONGS.hindi.title
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/astra/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryStr }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setVideoData(data.data);
      } else {
        // Fallback
        setVideoData({
          query: queryStr,
          videoId: "kJQP7kiw5Fk",
          title: `YouTube Search: ${queryStr}`,
          channelName: "YouTube Music Channel",
          genre: "Music",
          embedUrl: `https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&enablejsapi=1`,
          relatedTracks: CURATED_SONGS.hindi.relatedTracks,
        });
      }
    } catch (e) {
      console.warn("YouTube search error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSong(searchInput.trim());
      fetchYouTubeVideo(searchInput.trim());
    }
  };

  const handlePlayDirectVideo = (vId: string, vTitle: string, vChannel: string) => {
    setVideoData({
      query: vTitle,
      videoId: vId,
      title: vTitle,
      channelName: vChannel,
      genre: "YouTube Music",
      embedUrl: `https://www.youtube.com/embed/${vId}?autoplay=1&enablejsapi=1`,
      relatedTracks: videoData.relatedTracks
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* YouTube Player Top Control Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
              Astra YouTube Music
              <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 font-mono px-1.5 py-0.2 rounded-md">LIVE</span>
            </h2>
            <p className="text-[10px] text-slate-400">Direct YouTube Voice Audio & Video Streamer</p>
          </div>
        </div>

        {/* Quick Language Category Direct Selector Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('bhojpuri');
              setSearchInput("Bhojpuri song");
              onSearchSong("Bhojpuri song");
              fetchYouTubeVideo("Bhojpuri song");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'bhojpuri' || searchInput.toLowerCase().includes('bhojpuri')
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Bhojpuri Songs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('hindi');
              setSearchInput("Hindi song");
              onSearchSong("Hindi song");
              fetchYouTubeVideo("Hindi song");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'hindi' || searchInput.toLowerCase().includes('hindi')
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-400/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Hindi Songs</span>
          </button>
        </div>

        {/* Song Search Form Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Hindi, Bhojpuri, or any song name..."
              className="w-full bg-slate-950 border border-slate-750 focus:border-red-500 text-xs text-slate-100 pl-9 pr-3 py-2 rounded-xl focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-red-600/20 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Play</span>
          </button>
        </form>
      </div>

      {/* Main YouTube Stream Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Main Video Embed Viewport */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-slate-300">
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-2" />
              <p className="text-xs font-bold">Fetching YouTube Music Stream for "{searchInput}"...</p>
            </div>
          )}

          <div className="flex-1 relative w-full h-full min-h-[300px]">
            <iframe
              src={videoData.embedUrl}
              title={videoData.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Current Playing Track Info Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <Music className="w-5 h-5 animate-bounce" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-slate-100 truncate">{videoData.title}</h3>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
                    {videoData.genre}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {videoData.channelName} • YouTube HD Audio Stream
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-xl">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold">Playing Live</span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${videoData.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Open directly on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Recommended & Genre Playlist */}
        <div className="w-full lg:w-80 bg-slate-900/90 border-l border-slate-800 p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Astra Music Recommendations
            </h3>
          </div>

          {/* Quick Voice Prompt Suggestions */}
          <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <p className="text-[11px] text-slate-400 font-medium mb-2">🎤 Voice Commands You Can Say:</p>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onSearchSong("Play Bhojpuri song");
                  fetchYouTubeVideo("Bhojpuri song");
                }}
                className="w-full text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-amber-300 border border-slate-800 font-mono text-[11px] transition-colors"
              >
                "Astra, play Bhojpuri song"
              </button>
              <button
                onClick={() => {
                  onSearchSong("Play Hindi song");
                  fetchYouTubeVideo("Hindi song");
                }}
                className="w-full text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-emerald-300 border border-slate-800 font-mono text-[11px] transition-colors"
              >
                "Astra, play Hindi song"
              </button>
              <button
                onClick={() => {
                  onSearchSong("Play Kesariya song");
                  fetchYouTubeVideo("Kesariya song");
                }}
                className="w-full text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-cyan-300 border border-slate-800 font-mono text-[11px] transition-colors"
              >
                "Astra, play Kesariya"
              </button>
            </div>
          </div>

          {/* Playlist Track Items */}
          <div className="space-y-2 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Related Tracks</p>
            {videoData.relatedTracks && videoData.relatedTracks.map((track, i) => (
              <div
                key={track.videoId + i}
                onClick={() => handlePlayDirectVideo(track.videoId, track.title, track.channelName)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-xs text-slate-200 group-hover:text-cyan-300 truncate transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {track.channelName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
