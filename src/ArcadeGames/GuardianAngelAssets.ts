// Asset registry for Guardian Angel game (sprites, backgrounds, powerups, weapons, trophies, shop items)
// This is a placeholder for future asset imports and management.
export const GUARDIAN_ANGEL_ASSETS = {
  angelSprites: [
    '/assets/guardian_angel_1.png',
    '/assets/guardian_angel_2.png',
    '/assets/guardian_angel_3.png',
  ],
  demonSprites: [
    '/assets/demon_1.png',
    '/assets/demon_2.png',
    '/assets/demon_3.png',
  ],
  soulSprites: [
    '/assets/soul_1.png',
    '/assets/soul_2.png',
  ],
  powerups: [
    { name: 'Wings of Speed', effect: 'Double movement speed for 10s', icon: '/assets/powerup_wings.png' },
    { name: 'Divine Shield', effect: 'Invulnerable for 8s', icon: '/assets/powerup_shield.png' },
    { name: 'Holy Light', effect: 'Destroys all demons on screen', icon: '/assets/powerup_light.png' },
    { name: 'Soul Magnet', effect: 'Attracts all souls for 10s', icon: '/assets/powerup_magnet.png' },
  ],
  specialWeapons: [
    { name: 'Heavenly Blade', desc: 'Slices through all demons in a line', icon: '/assets/weapon_blade.png' },
    { name: 'Celestial Bow', desc: 'Shoots piercing arrows', icon: '/assets/weapon_bow.png' },
    { name: 'Seraph Bomb', desc: 'Explodes and purifies a large area', icon: '/assets/weapon_bomb.png' },
  ],
  trophies: [
    { name: 'Savior', desc: 'Rescue 10 souls in one run', icon: '/assets/trophy_savior.png', reward: 100 },
    { name: 'Demon Slayer', desc: 'Defeat 20 demons in one run', icon: '/assets/trophy_slayer.png', reward: 150 },
    { name: 'Untouchable', desc: 'Complete a level without losing a life', icon: '/assets/trophy_untouchable.png', reward: 200 },
    { name: 'Ascendant', desc: 'Complete all levels', icon: '/assets/trophy_ascendant.png', reward: 500 },
  ],
  shopItems: [
    { name: 'Revive Feather', desc: 'Revive instantly on death', priceLisa: 50, priceTon: 0.1, icon: '/assets/shop_revive.png', type: 'consumable' },
    { name: 'Blessed Armor', desc: 'Start each level with a shield', priceLisa: 100, priceTon: 0.2, icon: '/assets/shop_armor.png', type: 'upgrade' },
    { name: 'Miracle Elixir', desc: 'Fully restore lives', priceLisa: 80, priceTon: 0.15, icon: '/assets/shop_elixir.png', type: 'consumable' },
    { name: 'Wings of Fortune', desc: 'Increase LISA coin drop rate', priceLisa: 120, priceTon: 0.25, icon: '/assets/shop_fortune.png', type: 'upgrade' },
  ],
};
