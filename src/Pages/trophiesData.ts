import trophy1 from '../assets/cdollar.png';
import trophy2 from '../assets/earn.png';
import trophy3 from '../assets/ewallet.png';
import trophy4 from '../assets/gift.png';
import trophy5 from '../assets/turbo.png';
import trophy6 from '../assets/crown.png';
import trophy7 from '../assets/button.png';
import trophy8 from '../assets/axs.png';
import trophy9 from '../assets/money.png';
import trophy10 from '../assets/quest.png';

export type Trophy = {
  key: string;
  name: string;
  desc: string;
  icon: string;
  milestone: number;
  reward: number;
};

export const trophiesList: Trophy[] = [
  { key: 'firstTap', name: 'First Tap!', desc: 'Earn your first coin.', icon: trophy1, milestone: 1, reward: 100 },
  { key: 'hundredCoins', name: 'Coin Collector', desc: 'Reach 100 coins.', icon: trophy2, milestone: 100, reward: 500 },
  { key: 'thousandCoins', name: 'Thousand Club', desc: 'Reach 1,000 coins.', icon: trophy3, milestone: 1000, reward: 2000 },
  { key: 'tenKCoins', name: '10K Master', desc: 'Reach 10,000 coins.', icon: trophy4, milestone: 10000, reward: 10000 },
  { key: 'fiftyKCoins', name: '50K Tycoon', desc: 'Reach 50,000 coins.', icon: trophy5, milestone: 50000, reward: 25000 },
  { key: 'hundredKCoins', name: '100K Legend', desc: 'Reach 100,000 coins.', icon: trophy6, milestone: 100000, reward: 50000 },
  { key: 'millionCoins', name: 'Millionaire', desc: 'Reach 1,000,000 coins.', icon: trophy7, milestone: 1000000, reward: 200000 },
  { key: 'energyMax', name: 'Energy Hoarder', desc: 'Max out your energy.', icon: trophy8, milestone: 1000, reward: 10000 },
  { key: 'shopper', name: 'Shopper', desc: 'Buy 5 shop items.', icon: trophy9, milestone: 5, reward: 15000 },
  { key: 'allTrophies', name: 'Trophy Champion', desc: 'Unlock all trophies.', icon: trophy10, milestone: 10, reward: 100000 },
];