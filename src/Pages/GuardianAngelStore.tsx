import * as React from 'react';

const storeItems = [
  { key: 'resurrect', label: 'Resurrection Feather', priceTon: 0.5, desc: 'Revive after game over' },
  { key: 'ultimate_armor', label: 'Ultimate Armor', priceTon: 1, desc: 'Invincible for 1 level' },
  { key: 'final_key', label: 'Final Realm Key', priceTon: 2, desc: 'Unlock the final level' },
];

export type GuardianAngelStoreItem = typeof storeItems[number];

export const GuardianAngelStore: React.FC<{
  onPurchase: (item: GuardianAngelStoreItem) => void;
  tonBalance: number;
}> = ({ onPurchase, tonBalance }) => (
  <div>
    <h3>Special Items (TON)</h3>
    <ul>
      {storeItems.map((item) => (
        <li key={item.key}>
          <span>{item.label} - {item.desc} ({item.priceTon} TON)</span>
          <button onClick={() => onPurchase(item)} disabled={tonBalance < item.priceTon}>Buy</button>
        </li>
      ))}
    </ul>
  </div>
);
