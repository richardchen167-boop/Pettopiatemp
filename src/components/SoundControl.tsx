import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../lib/sounds';

export function SoundControl() {
  const [isEnabled, setIsEnabled] = useState(soundManager.isEnabled());

  const toggleSound = () => {
    const newState = soundManager.toggleEnabled();
    setIsEnabled(newState);
  };

  return (
    <button
      onClick={toggleSound}
      className={`fixed bottom-24 left-4 z-50 p-4 rounded-full shadow-lg transition-all hover:scale-105 ${
        isEnabled
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
          : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
      } text-white`}
      title={isEnabled ? 'Sound effects on' : 'Sound effects off'}
    >
      {isEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
    </button>
  );
}
