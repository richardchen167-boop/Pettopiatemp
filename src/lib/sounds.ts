class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    const soundUrls = {
      feed: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      play: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      clean: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
      water: 'https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3',
      levelup: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      coin: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
      adopt: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
      click: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      error: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
      success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
    };

    Object.entries(soundUrls).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = 0.3;
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    });
  }

  play(soundName: string) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => {
        console.log('Sound play failed:', err);
      });
    }
  }

  setVolume(volume: number) {
    this.sounds.forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
