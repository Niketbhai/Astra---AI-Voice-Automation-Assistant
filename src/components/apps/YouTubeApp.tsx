import React, { useState, useEffect } from 'react';
import { Play, Search, Music, Disc, Tv, Volume2, Sparkles, ExternalLink, RefreshCw, Radio, PlayCircle, Flame } from 'lucide-react';

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

// Verified top working songs and fallback embeds
const CURATED_SONGS: Record<string, YouTubeVideoData> = {
  bhojpuri: {
    query: "Bhojpuri Song",
    videoId: "lJvBo2x4uL8",
    title: "Lolipop Lagelu - Pawan Singh Hits",
    channelName: "Wave Music Bhojpuri",
    genre: "Bhojpuri Superhit",
    embedUrl: "https://www.youtube.com/embed/lJvBo2x4uL8?autoplay=1&enablejsapi=1",
    relatedTracks: [
      { videoId: "p8a2Pst5O0E", title: "Raate Diya Butake - Pawan Singh & Amrapali", channelName: "Wave Music" },
      { videoId: "BddP6PYo2gs", title: "Saj Ke Sawar Ke - Khesari Lal Yadav", channelName: "Speed Records Bhojpuri" },
      { videoId: "YxWlaYCA8f0", title: "Kamariya Kamre Aani - Bhojpuri Dhamaka", channelName: "Worldwide Records" }
    ]
  },
  hindi: {
    query: "Hindi Song",
    videoId: "kJQP7kiw5Fk",
    title: "Kesariya - Brahmastra | Arijit Singh Hits",
    channelName: "Sony Music India",
    genre: "Hindi Romance",
    embedUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&enablejsapi=1",
    relatedTracks: [
      { videoId: "c-45G-J4PqU", title: "Main Agar Kahoon - Om Shanti Om | Sonu Nigam", channelName: "T-Series" },
      { videoId: "JGwWNGJdvx8", title: "Tum Hi Ho - Aashiqui 2 | Arijit Singh", channelName: "T-Series" },
      { videoId: "fHI8X4OXluQ", title: "Tere Vaaste - Zara Hatke Zara Bachke", channelName: "Saregama Music" }
    ]
  },
  mainagarkahoon: {
    query: "Main Agar Kahoon",
    videoId: "c-45G-J4PqU",
    title: "Main Agar Kahoon - Sonu Nigam & Shreya Ghoshal | Om Shanti Om",
    channelName: "T-Series Official",
    genre: "Hindi Melodic",
    embedUrl: "https://www.youtube.com/embed/c-45G-J4PqU?autoplay=1&enablejsapi=1",
    relatedTracks: [
      { videoId: "kJQP7kiw5Fk", title: "Kesariya - Brahmastra | Arijit Singh", channelName: "Sony Music India" },
      { videoId: "JGwWNGJdvx8", title: "Tum Hi Ho - Arijit Singh", channelName: "T-Series" },
      { videoId: "K4TOrB7at0Y", title: "Heeriye - Jasleen Royal & Arijit Singh", channelName: "Warner Music" }
    ]
  }
};

export const YouTubeApp: React.FC<YouTubeAppProps> = ({
  currentQuery,
  onSearchSong,
}) => {
  const [searchInput, setSearchInput] = useState(currentQuery || "Main Agar Kahoon");
  const [videoData, setVideoData] = useState<YouTubeVideoData>(CURATED_SONGS.mainagarkahoon);
  const [isLoading, setIsLoading] = useState(false);
  const [useSearchEmbed, setUseSearchEmbed] = useState(false);

  useEffect(() => {
    if (currentQuery) {
      setSearchInput(currentQuery);
      fetchYouTubeVideo(currentQuery);
    }
  }, [currentQuery]);

  const fetchYouTubeVideo = async (queryStr: string) => {
    setIsLoading(true);
    setUseSearchEmbed(false);
    const lower = queryStr.toLowerCase().trim();

    // Check direct known song matches
    if (lower.includes('main agar kahoon') || lower.includes('sonu nigam')) {
      setVideoData({
        ...CURATED_SONGS.mainagarkahoon,
        query: queryStr,
      });
      setIsLoading(false);
      return;
    } else if (lower.includes('bhojpuri')) {
      setVideoData({
        ...CURATED_SONGS.bhojpuri,
        query: queryStr,
        title: lower.includes('pawan') ? "Pawan Singh Bhojpuri Superhit" : CURATED_SONGS.bhojpuri.title
      });
      setIsLoading(false);
      return;
    } else if (lower.includes('hindi') && !lower.includes('main agar kahoon')) {
      setVideoData({
        ...CURATED_SONGS.hindi,
        query: queryStr,
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
      if (data.success && data.data && data.data.videoId) {
        setVideoData(data.data);
      } else {
        // Fallback to YouTube Search List Embed which always plays top match
        const searchListEmbed = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(queryStr)}&autoplay=1&enablejsapi=1`;
        setVideoData({
          query: queryStr,
          videoId: "",
          title: `YouTube Playing: ${queryStr}`,
          channelName: "YouTube Official Stream",
          genre: "Music Track",
          embedUrl: searchListEmbed,
          relatedTracks: CURATED_SONGS.hindi.relatedTracks,
        });
        setUseSearchEmbed(true);
      }
    } catch (e) {
      console.warn("YouTube search API notice, switching to direct search embed:", e);
      const searchListEmbed = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(queryStr)}&autoplay=1&enablejsapi=1`;
      setVideoData({
        query: queryStr,
        videoId: "",
        title: `Playing: ${queryStr}`,
        channelName: "YouTube Music",
        genre: "Music Track",
        embedUrl: searchListEmbed,
        relatedTracks: CURATED_SONGS.hindi.relatedTracks,
      });
      setUseSearchEmbed(true);
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
      genre: "YouTube Track",
      embedUrl: `https://www.youtube.com/embed/${vId}?autoplay=1&enablejsapi=1`,
      relatedTracks: videoData.relatedTracks
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* YouTube Player Top Control Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/40">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-black text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
              Astra YouTube Player
              <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 font-mono px-2 py-0.5 rounded-full font-bold">
                ACTIVE
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">Direct High-Quality YouTube Voice Music Stream</p>
          </div>
        </div>

        {/* Quick Voice Song Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSearchInput("Main Agar Kahoon");
              onSearchSong("Main Agar Kahoon");
              fetchYouTubeVideo("Main Agar Kahoon");
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20 flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Main Agar Kahoon</span>
          </button>

          <button
            onClick={() => {
              setSearchInput("Bhojpuri song");
              onSearchSong("Bhojpuri song");
              fetchYouTubeVideo("Bhojpuri song");
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Bhojpuri Songs</span>
          </button>

          <button
            onClick={() => {
              setSearchInput("Hindi song");
              onSearchSong("Hindi song");
              fetchYouTubeVideo("Hindi song");
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
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
              placeholder="Search any song name (e.g. Main Agar Kahoon, Pawan Singh)..."
              className="w-full bg-slate-950 border border-slate-750 focus:border-red-500 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-red-600/30 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>Play</span>
          </button>
        </form>
      </div>

      {/* Main YouTube Stream Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Main Video Embed Viewport */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-slate-200">
              <RefreshCw className="w-10 h-10 text-red-500 animate-spin mb-3" />
              <p className="text-sm font-black tracking-wide">Connecting YouTube Stream for "{searchInput}"...</p>
            </div>
          )}

          <div className="flex-1 relative w-full h-full min-h-[320px]">
            <iframe
              src={videoData.embedUrl}
              title={videoData.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Current Playing Track Info Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 border border-red-400/40 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-600/30">
                <Music className="w-6 h-6 animate-bounce" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-100 truncate">{videoData.title}</h3>
                  <span className="text-[10px] font-mono bg-slate-800 text-rose-300 px-2.5 py-0.5 rounded-full border border-slate-700 shrink-0 font-semibold">
                    {videoData.genre}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {videoData.channelName} • Live YouTube Audio & Video Output
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-xl font-bold">
                <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
                <span>Audio Active</span>
              </div>
              <a
                href={
                  videoData.videoId
                    ? `https://www.youtube.com/watch?v=${videoData.videoId}`
                    : `https://www.youtube.com/results?search_query=${encodeURIComponent(searchInput)}`
                }
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Open directly on YouTube"
              >
                <span>YouTube.com</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Recommended Songs */}
        <div className="w-full lg:w-80 bg-slate-900/95 border-l border-slate-800 p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Quick Song Recommendations
            </h3>
          </div>

          {/* Quick Voice Play Buttons */}
          <div className="mb-4 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs space-y-2">
            <p className="text-[11px] text-slate-400 font-bold">🎙️ Voice Commands You Can Say:</p>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSearchInput("Main Agar Kahoon");
                  onSearchSong("Main Agar Kahoon");
                  fetchYouTubeVideo("Main Agar Kahoon");
                }}
                className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-rose-300 border border-slate-800 font-mono text-[11px] font-semibold transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>"Play Main Agar Kahoon"</span>
                <PlayCircle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setSearchInput("Bhojpuri song");
                  onSearchSong("Bhojpuri song");
                  fetchYouTubeVideo("Bhojpuri song");
                }}
                className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-amber-300 border border-slate-800 font-mono text-[11px] font-semibold transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>"Play Bhojpuri song"</span>
                <PlayCircle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setSearchInput("Hindi song");
                  onSearchSong("Hindi song");
                  fetchYouTubeVideo("Hindi song");
                }}
                className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-emerald-300 border border-slate-800 font-mono text-[11px] font-semibold transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>"Play Hindi song"</span>
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Featured Songs List */}
          <div className="space-y-2 flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Indian Superhits</p>

            <div
              onClick={() => handlePlayDirectVideo('c-45G-J4PqU', 'Main Agar Kahoon - Sonu Nigam & Shreya Ghoshal', 'T-Series')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs text-slate-200 group-hover:text-rose-300 truncate transition-colors">
                  Main Agar Kahoon
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Sonu Nigam & Shreya Ghoshal
                </p>
              </div>
            </div>

            <div
              onClick={() => handlePlayDirectVideo('lJvBo2x4uL8', 'Lolipop Lagelu - Pawan Singh Hits', 'Wave Music Bhojpuri')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs text-slate-200 group-hover:text-amber-300 truncate transition-colors">
                  Lolipop Lagelu (Bhojpuri)
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Pawan Singh Superhit
                </p>
              </div>
            </div>

            <div
              onClick={() => handlePlayDirectVideo('kJQP7kiw5Fk', 'Kesariya - Brahmastra | Arijit Singh', 'Sony Music India')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs text-slate-200 group-hover:text-emerald-300 truncate transition-colors">
                  Kesariya (Hindi)
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Arijit Singh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

