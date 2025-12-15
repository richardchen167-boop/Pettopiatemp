import { useState, useRef } from 'react';
import { Music, Pause, Play, KeyRound } from 'lucide-react';

const LOFI_TRACKS = [
  {
    name: 'Chill Lofi Beat',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    name: 'Peaceful Ambience',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    name: 'Study Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  }
];

const HOLIDAY_TRACKS = [
  {
    name: 'Jingle Bells Lofi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    name: 'Silent Night Chill',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    name: 'Winter Wonderland Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  },
  {
    name: 'Cozy Christmas Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
  },
  {
    name: 'Festive Fireplace',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
];

interface MusicPlayerProps {
  onAdminUnlock?: () => void;
}

export function MusicPlayer({ onAdminUnlock }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [useHolidayMusic, setUseHolidayMusic] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isDecember = new Date().getMonth() === 11;
  const TRACKS = isDecember && useHolidayMusic ? HOLIDAY_TRACKS : LOFI_TRACKS;

  const handleAdminSubmit = () => {
    if (adminCode === 'CATSEYE101') {
      setShowAdminPopup(false);
      setAdminCode('');
      setAdminError('');
      onAdminUnlock?.();
    } else {
      setAdminError('Invalid code');
      setTimeout(() => setAdminError(''), 2000);
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = TRACKS[currentTrack].url;
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;

      audio.addEventListener('error', (e) => {
        console.error('Audio load error:', e);
      });
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Error toggling audio:', err);
      setIsPlaying(false);
    }
  };

  const changeTrack = async (index: number) => {
    const wasPlaying = isPlaying;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio();
    audio.src = TRACKS[index].url;
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    setCurrentTrack(index);
    setIsPlaying(false);

    if (wasPlaying) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Error playing new track:', err);
      }
    }
  };

  const toggleMusicType = async () => {
    const wasPlaying = isPlaying;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setUseHolidayMusic(!useHolidayMusic);
    setCurrentTrack(0);
    setIsPlaying(false);

    const newTracks = isDecember && !useHolidayMusic ? HOLIDAY_TRACKS : LOFI_TRACKS;
    const audio = new Audio();
    audio.src = newTracks[0].url;
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    if (wasPlaying) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Error playing new track:', err);
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex flex-col gap-2">
        {showPlaylist && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-2 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music size={20} className={isDecember && useHolidayMusic ? 'text-red-600' : 'text-cyan-600'} />
                <h3 className="font-semibold text-gray-800">
                  {isDecember && useHolidayMusic ? '🎄 Holiday Music' : 'Lofi Playlist'}
                </h3>
              </div>
              {isDecember && (
                <button
                  onClick={toggleMusicType}
                  className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                >
                  {useHolidayMusic ? 'Lofi' : '🎄 Holiday'}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {TRACKS.map((track, index) => (
                <button
                  key={index}
                  onClick={() => changeTrack(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    currentTrack === index
                      ? isDecember && useHolidayMusic
                        ? 'bg-red-100 text-red-700 font-medium'
                        : 'bg-cyan-100 text-cyan-700 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {track.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {showAdminPopup && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-2 animate-in slide-in-from-bottom">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound size={16} className="text-gray-700" />
              <h3 className="font-semibold text-gray-800 text-sm">Enter Admin Code</h3>
            </div>
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
              placeholder="ADMIN CODE"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none mb-2 text-sm"
              autoFocus
            />
            {adminError && (
              <div className="text-red-600 text-xs mb-2">{adminError}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAdminSubmit}
                className="flex-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowAdminPopup(false);
                  setAdminCode('');
                  setAdminError('');
                }}
                className="flex-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg transition-all hover:scale-105"
            title="Toggle playlist"
          >
            <Music size={20} />
          </button>

          <button
            onClick={toggleMusic}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105"
            title={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={() => setShowAdminPopup(!showAdminPopup)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-0.5 rounded-full shadow-lg transition-all hover:scale-105"
            title="Admin access"
          >
            <KeyRound size={8} />
          </button>
        </div>

        {isPlaying && (
          <div className={`bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-700 animate-pulse ${isDecember && useHolidayMusic ? 'border-2 border-red-200' : ''}`}>
            {isDecember && useHolidayMusic ? '🎄 ' : ''}Now playing: {TRACKS[currentTrack].name}
          </div>
        )}
      </div>
    </div>
  );
}
