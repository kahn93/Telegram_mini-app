// Enhanced sound manager for UI/game effects and music
const sounds: Record<string, HTMLAudioElement> = {};
let music: HTMLAudioElement | null = null;
let currentMusic: string | null = null;

export function playSound(name: string) {
  if (isMuted()) return;
  if (!sounds[name]) {
    sounds[name] = new Audio(`/sounds/${name}.mp3`);
    sounds[name].volume = 0.5;
  }
  sounds[name].currentTime = 0;
  sounds[name].play();
}

export function playMusic(name: string, loop = true, volume = 0.35) {
  if (isMuted()) return;
  if (currentMusic === name && music) return;
  stopMusic();
  music = new Audio(`/sounds/${name}.mp3`);
  music.loop = loop;
  music.volume = volume;
  music.play();
  currentMusic = name;
}

export function stopMusic() {
  if (music) {
    music.pause();
    music.currentTime = 0;
    music = null;
    currentMusic = null;
  }
}

export function toggleMute() {
  setMuted(!isMuted());
  if (isMuted()) {
    stopMusic();
  }
}

export function isMuted(): boolean {
  return localStorage.getItem('muteSounds') === '1';
}

export function setMuted(mute: boolean) {
  localStorage.setItem('muteSounds', mute ? '1' : '0');
  if (mute) stopMusic();
}
