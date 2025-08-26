import * as React from 'react';

const trophies = [
  { key: 'first_soul', label: 'First Soul Saved', reward: 50 },
  { key: 'level_5', label: 'Reach Level 5', reward: 200 },
  { key: 'no_damage', label: 'No Damage Run', reward: 500 },
  { key: 'all_upgrades', label: 'All Upgrades Purchased', reward: 1000 },
  { key: 'final_realm', label: 'Complete Final Realm', reward: 5000 },
];

export type GuardianAngelTrophy = typeof trophies[number];

export const GuardianAngelTrophies: React.FC<{
  earned: Record<string, boolean>;
  onEarn: (trophy: GuardianAngelTrophy) => void;
}> = ({ earned, onEarn }) => (
  <div>
    <h3>Guardian Angel Trophies</h3>
    <ul>
      {trophies.map((t) => (
        <li key={t.key}>
          <span>{t.label}</span>
          {earned[t.key] ? '🏆' : <button onClick={() => onEarn(t)}>Claim ({t.reward} LISA)</button>}
        </li>
      ))}
    </ul>
  </div>
);
