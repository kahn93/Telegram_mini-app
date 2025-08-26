import * as React from 'react';

const storyChapters = [
  'You awaken as a Guardian Angel, tasked with saving lost souls across the realms...',
  'The first realm is peaceful, but darkness stirs. New dangers await.',
  'You sense a powerful evil in the next realm. The fate of many souls hangs in the balance.',
  'The final realm: only the bravest angels may enter. Will you succeed?',
];

export const GuardianAngelStory: React.FC<{ level: number }> = ({ level }) => (
  <div style={{ margin: '16px 0', color: '#fff', fontSize: 18, textAlign: 'center' }}>
    <p>{storyChapters[level] || 'Your legend continues...'}</p>
  </div>
);
