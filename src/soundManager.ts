// Simple sound manager for UI/game effects
const sounds: Record<string, HTMLAudioElement> = {};

export function playSound(name: string) {
  if (isMuted()) return;
  if (!sounds[name]) {
    sounds[name] = new Audio(`/sounds/${name}.mp3`);
    sounds[name].volume = 0.5;
  }
  sounds[name].currentTime = 0;
  sounds[name].play();
}

export function isMuted(): boolean {
  return localStorage.getItem('muteSounds') === '1';
}

export function setMuted(mute: boolean) {
  localStorage.setItem('muteSounds', mute ? '1' : '0');
}
