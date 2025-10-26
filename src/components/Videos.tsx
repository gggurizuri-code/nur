import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Play, Pause, Trash, Search, RefreshCw } from "lucide-react";

interface VideosProps {
  onNavigate: (page: string) => void;
}

interface VideoLesson {
  id: string;
  youtubeId?: string; // can be full URL or raw id — we extract ID internally
  title: string;
  description: string;
  duration: string;
  topic: string;
}

const videoLessons: VideoLesson[] = [
  { id: "1", youtubeId: "https://www.youtube.com/watch?v=-6agWdVgMa8", title: "Основы кинематики", description: "Введение в понятия скорости, ускорения и траектории движения", duration: "8:52", topic: "Кинематика" },
  { id: "2", youtubeId: "https://www.youtube.com/watch?v=PK7JQnFbeaY", title: "Законы Ньютона", description: "Три закона механики и их применение на практике", duration: "9:25", topic: "Динамика" },
  { id: "3", youtubeId: "https://www.youtube.com/watch?v=SAGBv6pfG3s", title: "Гармонические колебания", description: "Математический и физический маятник, период колебаний", duration: "11:03", topic: "Колебания" },
  { id: "4", youtubeId: "https://www.youtube.com/watch?v=7cEsVEbCbz0", title: "Баллистическое движение", description: "Движение тела под углом к горизонту", duration: "5:15", topic: "Кинематика" },
  { id: "5", youtubeId: "https://www.youtube.com/watch?v=aerA2Ci1dsA", title: "Закон сохранения импульса", description: "Столкновения тел: упругие и неупругие удары", duration: "4:41", topic: "Динамика" },
  { id: "6", youtubeId: "https://www.youtube.com/watch?v=wWerswH8w6g", title: "Энергия и работа", description: "Кинетическая и потенциальная энергия, закон сохранения энергии", duration: "13:19", topic: "Энергия" },
  { id: "7", youtubeId: "https://www.youtube.com/watch?v=i7j5-xailas", title: "Круговое движение", description: "Центростремительное ускорение и центробежная сила", duration: "9:45", topic: "Вращение" },
  { id: "8", youtubeId: "https://www.youtube.com/watch?v=X46l1McMJZQ", title: "Момент силы", description: "Вращательное движение и момент инерции", duration: "13:04", topic: "Вращение" },
];

// Extracts a YouTube video ID from a full URL or returns the input if it's already an ID
function extractYouTubeID(input?: string) {
  if (!input) return null;
  // if input already looks like an ID (only allowed chars) return it
  const cleaned = input.trim();
  const idOnly = cleaned.match(/^[a-zA-Z0-9_-]{6,}$/);
  if (idOnly) return idOnly[0];

  // try to parse common YouTube URL patterns
  const patterns = [
    /[?&]v=([^&]+)/, // watch?v=ID
    /youtu\.be\/([^?&]+)/, // youtu.be/ID
    /embed\/([^?&]+)/, // /embed/ID
    /\/v\/([^?&]+)/, // /v/ID
  ];
  for (const p of patterns) {
    const m = cleaned.match(p);
    if (m && m[1]) return m[1];
  }

  // fallback: remove non-id chars and hope for the best
  const fallback = cleaned.replace(/[^a-zA-Z0-9_-]/g, "");
  return fallback || null;
}

// --- YouTube API helper that returns a promise when API is ready ---
function loadYouTubeAPI(): Promise<typeof window.YT> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if ((window as any).YT && (window as any).YT.Player) return resolve((window as any).YT);

    const existing = document.querySelector("script[src='https://www.youtube.com/iframe_api']");
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      resolve((window as any).YT);
    };

    // Fallback timeout
    setTimeout(() => {
      if ((window as any).YT && (window as any).YT.Player) resolve((window as any).YT);
      else reject(new Error("YouTube API load timeout"));
    }, 10000);
  });
}

// --- VideoPlayer component: uses YT iframe API when available to provide rich controls ---
function VideoPlayer({ youtubeId, title, onClose }: { youtubeId: string; title: string; onClose: () => void }) {
  const playerRef = useRef<any>(null);
  const id = extractYouTubeID(youtubeId) || youtubeId || "";
  const containerId = `yt-player-${id}`;
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);

  // load player
  useEffect(() => {
    let mounted = true;
    let player: any = null;
    let tick: any = null;

    if (!id) return;

    loadYouTubeAPI()
      .then((YT) => {
        if (!mounted) return;
        player = new (YT as any).Player(containerId, {
          videoId: id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (e: any) => {
              playerRef.current = e.target;
              setReady(true);
              setDuration(playerRef.current.getDuration() || 0);

              // restore last position
              const saved = localStorage.getItem(`videoPos_${id}`);
              if (saved) {
                const t = parseFloat(saved);
                if (!Number.isNaN(t) && t > 0) {
                  try {
                    playerRef.current.seekTo(t, true);
                  } catch (e) {}
                }
              }

              try {
                playerRef.current.playVideo();
              } catch (e) {}
            },
            onStateChange: (e: any) => {
              const YT = (window as any).YT;
              if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
              else setPlaying(false);
            },
          },
        });

        // polling time updates
        tick = setInterval(() => {
          if (playerRef.current && playerRef.current.getCurrentTime) {
            const t = playerRef.current.getCurrentTime();
            setCurrent(t);
            setDuration(playerRef.current.getDuration() || 0);
            localStorage.setItem(`videoPos_${id}`, String(t));
          }
        }, 500);
      })
      .catch(() => {
        // API failed to load — we'll rely on a plain iframe fallback
        setReady(false);
      });

    // keyboard and custom event listeners for shortcuts
    const onToggle = () => {
      if (!playerRef.current) return;
      const YT = (window as any).YT;
      const state = playerRef.current.getPlayerState();
      if (state === YT.PlayerState.PLAYING) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    };
    const onSeek = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as number | undefined;
      if (!playerRef.current || typeof detail !== "number") return;
      try {
        const t = Math.max(0, (playerRef.current.getCurrentTime() || 0) + detail);
        playerRef.current.seekTo(t, true);
        setCurrent(t);
      } catch (e) {}
    };

    window.addEventListener("video-toggle-play", onToggle as EventListener);
    window.addEventListener("video-seek", onSeek as EventListener);

    return () => {
      mounted = false;
      if (tick) clearInterval(tick);
      if (player && player.destroy) player.destroy();
      window.removeEventListener("video-toggle-play", onToggle as EventListener);
      window.removeEventListener("video-seek", onSeek as EventListener);
    };
  }, [containerId, id]);

  // simple controls that call player methods when ready
  const togglePlay = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    const YT = (window as any).YT;
    if (state === YT.PlayerState.PLAYING) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const seek = (to: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(to, true);
    setCurrent(to);
  };

  const setVol = (v: number) => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setVolume(v);
      setVolume(v);
    } catch (e) {}
  };

  const setRate = (r: number) => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setPlaybackRate(r);
      setPlaybackRate(r);
    } catch (e) {}
  };

  const openYouTube = () => {
    window.open(`https://youtube.com/watch?v=${id}`, "_blank");
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            {/* player container where YT.Player mounts */}
            <div id={containerId} className="w-full h-full" />
            {/* fallback iframe (visible only if API didn't mount) */}
            {!ready && (
              <iframe
                title={title}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* controls */}
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-2 bg-slate-100 rounded-md hover:bg-slate-200" aria-label="play-pause">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <div className="flex-1">
                <input type="range" min={0} max={Math.max(1, Math.floor(duration))} value={Math.floor(current)} onChange={(e) => seek(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{formatTime(current)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select value={playbackRate} onChange={(e) => setRate(Number(e.target.value))} className="text-sm p-1 rounded">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                    <option key={r} value={r}>
                      {r}x
                    </option>
                  ))}
                </select>

                <input type="range" min={0} max={100} value={volume} onChange={(e) => setVol(Number(e.target.value))} className="w-24" />

                <button onClick={openYouTube} className="p-2 rounded-md hover:bg-slate-100" title="Open on YouTube">
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button onClick={onClose} className="p-2 rounded-md hover:bg-slate-100" title="Close player">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-64 hidden lg:block">
          <div className="text-sm font-semibold mb-2">Сейчас</div>
          <div className="text-slate-800 font-medium">{title}</div>
          <div className="text-slate-500 text-sm mt-2">Подсказки: пробел — пауза/воспроизведение, ←/→ — перемотка ±5с</div>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  if (!sec || Number.isNaN(sec)) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60).toString().padStart(1, "0");
  return `${m}:${s}`;
}

export default function Videos({ onNavigate }: VideosProps) {
  const [selected, setSelected] = useState<VideoLesson | null>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "duration" | "title">("default");

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.code === "Space") {
        e.preventDefault();
        // dispatch a custom event that component listens to
        window.dispatchEvent(new CustomEvent("video-toggle-play"));
      }
      if (e.key === "ArrowLeft") window.dispatchEvent(new CustomEvent("video-seek", { detail: -5 }));
      if (e.key === "ArrowRight") window.dispatchEvent(new CustomEvent("video-seek", { detail: 5 }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // topics list
  const topics = Array.from(new Set(videoLessons.map((v) => v.topic)));

  // filtering and sorting
  let list = videoLessons.filter((v) => {
    const q = query.trim().toLowerCase();
    if (q && !`${v.title} ${v.description}`.toLowerCase().includes(q)) return false;
    if (topic && v.topic !== topic) return false;
    return true;
  });

  if (sortBy === "title") list = list.sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === "duration") list = list.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition">
              <ArrowLeft className="w-5 h-5" />
              <span>Назад на главную</span>
            </button>

            <h1 className="text-3xl font-bold text-slate-800 ml-4">Видеоуроки</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <input className="px-3 py-2 outline-none w-64 bg-transparent" placeholder="Поиск по урокам..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <div className="px-3 border-l">
                <Search className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select value={topic ?? ""} onChange={(e) => setTopic(e.target.value || null)} className="px-3 py-2 rounded-lg">
                <option value="">Все темы</option>
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded-lg">
                <option value="default">По умолчанию</option>
                <option value="title">По названию</option>
                <option value="duration">По длительности</option>
              </select>

              <button onClick={() => { setQuery(""); setTopic(null); setSortBy("default"); }} className="p-2 rounded-lg hover:bg-slate-100" title="Сброс фильтров">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Player area */}
            {selected ? (
              <VideoPlayer youtubeId={selected.youtubeId || ""} title={selected.title} onClose={() => setSelected(null)} />
            ) : (
              <div className="rounded-2xl p-8 bg-white shadow text-center">
                <h2 className="text-xl font-semibold mb-2">Выберите урок</h2>
                <p className="text-slate-600">Нажмите «Смотреть урок», чтобы запустить видео из YouTube</p>
              </div>
            )}

            {/* learning tip */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Совет по обучению</h3>
              <p className="text-slate-700">Смотрите видео фрагментами: ставьте цель на 10–20 минут, делайте заметки и сразу закрепляйте практикой — так знания крепче усваиваются.</p>
            </div>
          </div>

          <aside className="space-y-4">
            {list.map((lesson) => {
              const id = extractYouTubeID(lesson.youtubeId) || "";
              return (
                <div key={lesson.id} className="bg-white rounded-xl shadow p-4 flex items-start gap-4">
                  <div className="w-28 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-md flex items-center justify-center text-white text-sm font-medium">
                    {id ? (
                      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={lesson.title} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <div className="px-2">{lesson.duration}</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{lesson.title}</div>
                        <div className="text-xs text-slate-500">{lesson.topic} • {lesson.duration}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => window.open(`https://youtube.com/watch?v=${id}`, "_blank")} className="text-slate-500 hover:text-slate-700 p-2 rounded" title="Открыть на YouTube">
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button onClick={() => setSelected(lesson)} className="text-blue-600 hover:text-blue-700 font-medium">Смотреть урок</button>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 mt-2">{lesson.description}</div>
                  </div>
                </div>
              );
            })}

            {list.length === 0 && (
              <div className="bg-white p-4 rounded shadow text-center text-slate-600">Ничего не найдено</div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

// helpers
function parseDuration(d: string) {
  // expected formats like "12:34" or "1:02:30"
  const parts = d.split(":").map((p) => Number(p));
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}
