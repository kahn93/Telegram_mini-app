import * as React from 'react';

const upgrades = [
  { key: 'move_speed', label: 'Wings of Speed', cost: 100, desc: 'Move faster' },
  { key: 'extra_life', label: 'Divine Heart', cost: 250, desc: 'Gain an extra life' },
  { key: 'soul_magnet', label: 'Soul Magnet', cost: 300, desc: 'Attract souls from further away' },
  { key: 'shield', label: 'Divine Shield', cost: 500, desc: 'Block one hit per level' },
  { key: 'celestial_bomb', label: 'Celestial Bomb', cost: 1000, desc: 'Clear all enemies on screen' },
];

export type GuardianAngelUpgrade = typeof upgrades[number];

export const GuardianAngelUpgrades: React.FC<{
  owned: Record<string, boolean>;
  onPurchase: (upgrade: GuardianAngelUpgrade) => void;
  lisaCoins: number;
}> = ({ owned, onPurchase, lisaCoins }) => (
  <div>
    <h3>Upgrades (LISA Coins)</h3>
    <ul>
      {upgrades.map((u) => (
        <li key={u.key}>
          <span>{u.label} - {u.desc} ({u.cost} LISA)</span>
          {owned[u.key] ? '✅' : (
            <button onClick={() => onPurchase(u)} disabled={lisaCoins < u.cost}>Buy</button>
          )}
        </li>
      ))}
    </ul>
  </div>
);
