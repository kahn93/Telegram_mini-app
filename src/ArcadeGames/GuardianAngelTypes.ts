// Types for Guardian Angel game
export interface Powerup {
  name: string;
  effect: string;
  icon: string;
}

export interface SpecialWeapon {
  name: string;
  desc: string;
  icon: string;
}

export interface ShopItem {
  name: string;
  desc: string;
  priceLisa: number;
  priceTon: number;
  icon: string;
  type: string;
}

export interface Trophy {
  name: string;
  desc: string;
  icon: string;
  reward: number;
}

export interface Entity {
  x: number;
  y: number;
  alive?: boolean;
}

export interface Soul extends Entity {
  rescued?: boolean;
}

export interface Bullet extends Entity {}

export interface PlayerState {
  coins: number;
  tonBalance: number;
  powerups: Powerup[];
  weapons: SpecialWeapon[];
  trophies: Trophy[];
  inventory: { name: string }[];
  upgrades: string[];
}

export interface Level {
  name: string;
  intro: string;
}

export const STORY: Level[] = [
  { name: 'The Beginning', intro: 'Your journey as a Guardian Angel begins. Save the lost souls!' },
  { name: 'The Dark Forest', intro: 'Face the demons lurking in the shadows.' },
  { name: 'Ascension', intro: 'Prove your worth and ascend to the heavens.' },
];
