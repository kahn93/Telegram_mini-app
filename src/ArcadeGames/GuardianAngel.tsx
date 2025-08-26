// Extend the Window interface to include Telegram
declare global {
  interface Window {
    Telegram?: any;
  }
}

import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import LeaderboardMini from './LeaderboardMini';
import { submitScoreSupabase } from './leaderboardSupabase';
import { playSound, isMuted as isMutedFn, isMuted } from '../soundManager';

import { GUARDIAN_ANGEL_ASSETS } from './GuardianAngelAssets';
import { logEvent } from '../analytics';
import {
  Powerup,
  SpecialWeapon,
  ShopItem,
  Entity,
  Soul,
  Bullet,
  PlayerState,
  Trophy,
  Level,
  STORY
} from './GuardianAngelTypes';

// ...existing code...
const GAME_WIDTH = 480;
const GAME_HEIGHT = 600;
const ANGEL_SIZE = 38;
const DEMON_SIZE = 34;
const SOUL_SIZE = 28;
const BULLET_SIZE = 8;
const DEMON_SPEED = 1.7;
const SOUL_SPEED = 1.1;
const BULLET_SPEED = 7.5;
const MAX_LIVES = 3;

// --- Main Game Component ---
interface GuardianAngelProps {
  userid?: string;
}
const GuardianAngel: React.FC<GuardianAngelProps> = ({ userid: propUserId }) => {
  // Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false);

  // Daily login reward modal state
  const [loginRewardOpen, setLoginRewardOpen] = useState(false);
  const [loginStreak] = useState(1);

  // Use props to avoid unused error
  // (They are already used below, e.g., in useEffect and playSound logic)

  // Wallet connection and airdrop logic (must be inside the component)
  // const [walletConnected, setWalletConnected] = useState(false);
  function connectWallet() {
    // Simulate wallet connection
    setWalletConnected(true);
    showToast('Wallet connected!');
  }

  function earnLisa(amount: number) {
    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }


  // User ID logic (placed before handleSubmitScore)
  const userId = React.useMemo(() => {
    if (propUserId) return propUserId;
    try {
      const tg = window.Telegram?.WebApp;
      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
        return tg.initDataUnsafe.user.id.toString();
      }
    } catch (_) { /* ignore */ }
    return localStorage.getItem('userId') || 'anon';
  }, [propUserId]);

  async function handleSubmitScore() {
    setSubmitting(true);
    try {
      const id = userId;
      await submitScoreSupabase('guardianangel', id, score);
    } catch (_) { /* ignore */ }
    setSubmitting(false);
  }

  // Toast state and showToast function
  const [toast, setToast] = useState<string | null>(null);
  function showToast(message: string, duration = 2200) {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }

  // Use userId to avoid unused variable error
  // For example, display it in the UI:
  // (If you already display it elsewhere, you can remove this line)
  // <div>User ID: {userId}</div>

  // --- Shop purchase logic (must be after playerState is declared) ---
  // (Removed duplicate purchaseItem function; the actual implementation is further below and used in the Shop Modal)

  // Place all the UI code (JSX) here, wrapped in a return statement:
  // Remove this line from here; it will be declared inside the GuardianAngel component.

  // Implement claimLoginReward inside the component
  function claimLoginReward() {
    const reward = 10 * loginStreak;
    earnLisa(reward);
    setLoginRewardOpen(false);
    showToast(`Claimed ${reward} LISA!`);
  }

  // Toast state and showToast are now declared inside the GuardianAngel component where they are used.

  // All state and function declarations are now above this line
  // ...existing code for all state, hooks, and helpers...

// --- Leaderboard Race & Special Shop Event ---
  const [raceEventActive, setRaceEventActive] = useState(false);
  // Removed unused event banner state


  // --- STRUCTURAL CLEANUP: Only one return, all UI in a single parent, all tags closed, all variables in scope ---
  // All logic and hooks must be above this line. Only JSX inside return below.

  // (Main return block is further down in the file, do not duplicate it here)

  // Remove unreachable code and duplicate JSX blocks after the main return.

  // --- LISA Coin and TON Wallet Integration ---
  // (Moved purchaseItem implementation below playerState declaration)
  // --- Trophy/Achievement System ---
  // (unlockTrophy function removed because it was unused)

  // Show/hide trophy room
  const [trophyRoomOpen, setTrophyRoomOpen] = useState(false);
  // --- Power-up and Special Weapon System ---
  // Track active power-up and weapon
  const [activePowerup, setActivePowerup] = useState<Powerup | null>(null);
  const [activeWeapon, setActiveWeapon] = useState<SpecialWeapon | null>(null);

  // Collect a power-up (e.g., from gameplay or shop)

  // Activate a power-up (e.g., from UI or auto on collect)
  const activatePowerup = (powerup: Powerup) => {
    setActivePowerup(powerup);
    // TODO: Trigger power-up effect (e.g., shield, double score, etc.)
    // Optionally set a timer to deactivate after duration
  };

  // Switch special weapon (e.g., from UI or shop)
  const switchWeapon = (weapon: SpecialWeapon) => {
    setActiveWeapon(weapon);
    // TODO: Change attack logic to use weapon's effect
  };

  // Example: Deactivate power-up after duration (placeholder logic)
  useEffect(() => {
    if (activePowerup) {
      const timer = setTimeout(() => setActivePowerup(null), 8000); // 8s duration
      return () => clearTimeout(timer);
    }
  }, [activePowerup]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // --- State for new features ---
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);

  // Add bragLeaderboard function
  function bragLeaderboard() {
    showToast('Brag Leaderboard feature coming soon!');
  }

  // Add watchAd function
  function watchAd() {
    // Simulate ad watching and reward
    earnLisa(20);
    showToast('You earned 20 LISA for watching an ad!');
  }

  // Add buyPremiumBundle function
  function buyPremiumBundle() {
    showToast('Premium Bundle purchase coming soon!');
  }

  const [lives, setLives] = useState(MAX_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [running, setRunning] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showGameOverEffect, setShowGameOverEffect] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);
  const [angel, setAngel] = useState({ x: GAME_WIDTH / 2 - ANGEL_SIZE / 2, y: GAME_HEIGHT - 80 });
  const [demons, setDemons] = useState<Entity[]>([]);
  const [souls, setSouls] = useState<Soul[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>({ coins: 0, tonBalance: 0, powerups: [], weapons: [], trophies: [], inventory: [], upgrades: [] });
  const [currentLevel] = useState(0); // index in STORY
  const [purchasePopup, setPurchasePopup] = useState<ShopItem | null>(null);

  // Shop modal open state
  const [shopOpen, setShopOpen] = useState(false);

  // --- Story/level system implementation ---
  const [levelIntro, setLevelIntro] = useState(true);

  useEffect(() => {
    if (levelIntro) {
      setRunning(false);
    } else {
      setRunning(true);
    }
  }, [levelIntro]);

  const handleStartLevel = () => {
    setLevelIntro(false);
    setRunning(true);
    // Reset level-specific state here if needed
  };

  // --- Placeholder: TON wallet connection, LISA coin airdrop, and purchase logic ---
    // --- Shop purchase logic implementation ---
    function purchaseItem(purchaseItem: ShopItem, method: 'lisa' | 'ton') {
      const isSpecial =
        raceEventActive &&
        purchaseItem.name === 'Celestial Aura'; // Example: special offer during event
      const priceLisa =
        isSpecial && typeof purchaseItem.priceLisa === 'number'
          ? Math.floor(purchaseItem.priceLisa / 2)
          : purchaseItem.priceLisa;
  
      if (method === 'lisa' && playerState.coins >= priceLisa) {
        setPlayerState((prev) => ({
          ...prev,
          coins: prev.coins - priceLisa,
          inventory: purchaseItem.type === 'consumable' ? [...prev.inventory, purchaseItem] : prev.inventory,
          upgrades: purchaseItem.type === 'upgrade' ? [...prev.upgrades, purchaseItem.name] : prev.upgrades,
        }));
        setPurchasePopup(purchaseItem);
        setTimeout(() => setPurchasePopup(null), 3000);
      } else if (method === 'ton' && playerState.tonBalance >= purchaseItem.priceTon) {
        setPlayerState((prev) => ({
          ...prev,
          tonBalance: prev.tonBalance - purchaseItem.priceTon,
          inventory: purchaseItem.type === 'consumable' ? [...prev.inventory, purchaseItem] : prev.inventory,
          upgrades: purchaseItem.type === 'upgrade' ? [...prev.upgrades, purchaseItem.name] : prev.upgrades,
        }));
        setPurchasePopup(purchaseItem);
        setTimeout(() => setPurchasePopup(null), 3000);
      } else {
        // Not enough funds
        alert('Not enough balance!');
      }
    }

  const keys = useRef<{ [k: string]: boolean }>({});

  // (Removed duplicate useEffect for propUserId; already handled inside GuardianAngel component)

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) setShowInstructions(false);
      if (!isMuted && !isMutedFn()) playSound('button');
    };
    const handleUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [isMutedFn]);

  useEffect(() => {
    if (!running) return;
    let anim: number;
    let last = performance.now();
    function loop(now: number) {
      const dt = Math.min((now - last) / 16, 2);
      last = now;
      update(dt);
      draw();
      if (running) anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
    // eslint-disable-next-line
  }, [running, angel, demons, souls, bullets, gameOver, win, lives]);

  function spawnDemons() {
    return Array.from({ length: 6 }, (_, i) => ({
      x: 40 + i * 70,
      y: 60 + Math.random() * 60,
      vx: Math.random() > 0.5 ? DEMON_SPEED : -DEMON_SPEED,
      vy: 0,
      alive: true,
    }));
  }
  function spawnSouls() {
    return Array.from({ length: 4 }, (_, i) => ({
      x: 60 + i * 110,
      y: 0,
      vy: SOUL_SPEED + Math.random() * 0.7,
      rescued: false,
    }));
  }

  useEffect(() => {
    setDemons(spawnDemons());
    setSouls(spawnSouls());
  }, []);

  function update(dt: number) {
    if (gameOver || win) return;
    let { x, y } = angel;
    if (keys.current['ArrowLeft']) x -= 4 * dt;
    if (keys.current['ArrowRight']) x += 4 * dt;
    if (keys.current['ArrowUp']) y -= 4 * dt;
    if (keys.current['ArrowDown']) y += 4 * dt;
    x = Math.max(0, Math.min(GAME_WIDTH - ANGEL_SIZE, x));
    y = Math.max(0, Math.min(GAME_HEIGHT - ANGEL_SIZE, y));
    setAngel({ x, y });
    // Fire
    if (keys.current[' '] && bullets.length < 2) {
      setBullets((bullets: any) => [
        ...bullets,
        { x: x + ANGEL_SIZE / 2 - BULLET_SIZE / 2, y, vy: -BULLET_SPEED, active: true },
      ]);
      keys.current[' '] = false;
      if (!isMutedFn()) playSound('spin');
    }
    // Move bullets
    let newBullets = bullets.map(b => ({ ...b, y: b.y + b.vy * dt }));
    newBullets = newBullets.filter(b => b.y > -BULLET_SIZE && b.active);
    // Move demons
    const newDemons = demons.map(d => {
      if (!d.alive) return d;
      const nx = d.x + d.vx * dt;
      if (nx < 0 || nx > GAME_WIDTH - DEMON_SIZE) d.vx *= -1;
      return { ...d, x: nx };
    });
    // Move souls
    const newSouls = souls.map(s => {
      if (s.rescued) return s;
      let ny = s.y + s.vy * dt;
      if (ny > GAME_HEIGHT - SOUL_SIZE) ny = GAME_HEIGHT - SOUL_SIZE;
      return { ...s, y: ny };
    });
    // Bullet hits demon
    for (const b of newBullets) {
      for (const d of newDemons) {
        if (
          d.alive &&
          b.x < d.x + DEMON_SIZE &&
          b.x + BULLET_SIZE > d.x &&
          b.y < d.y + DEMON_SIZE &&
          b.y + BULLET_SIZE > d.y
        ) {
          d.alive = false;
          b.active = false;
          setScore(s => s + 500);
          if (!isMutedFn()) playSound('win');
          setShowScorePop(true);
          setTimeout(() => setShowScorePop(false), 500);
        }
      }
    }
    // Angel rescues soul
    for (const s of newSouls) {
      if (!s.rescued && Math.abs(x - s.x) < 24 && Math.abs(y - s.y) < 24) {
        s.rescued = true;
        setScore(s => s + 1000);
        if (!isMutedFn()) playSound('bonus');
      }
    }
    // Demon hits soul
    for (const d of newDemons) {
      if (!d.alive) continue;
      for (const s of newSouls) {
        if (!s.rescued &&
          d.x < s.x + SOUL_SIZE &&
          d.x + DEMON_SIZE > s.x &&
          d.y < s.y + SOUL_SIZE &&
          d.y + DEMON_SIZE > s.y
        ) {
          s.rescued = true;
          setLives(l => l - 1);
          if (!isMutedFn()) playSound('die');
        }
      }
    }
    setBullets(newBullets);
    setDemons(newDemons);
    setSouls(newSouls);
    // Win/lose
    if (newDemons.every(d => !d.alive) && newSouls.every(s => s.rescued)) {
      setWin(true);
      setRunning(false);
      setScore(s => s + 2000);
      setShowGameOverEffect(true);
      if (!isMutedFn()) playSound('bonus');
      setTimeout(() => setShowGameOverEffect(false), 1200);
    }
    if (lives <= 0) {
      setGameOver(true);
      setRunning(false);
      setShowGameOverEffect(true);
      if (!isMutedFn()) playSound('die');
      setTimeout(() => setShowGameOverEffect(false), 1200);
    }
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Animated background
    ctx.save();
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 18; ++i) {
      ctx.beginPath();
      ctx.arc(
        30 + Math.sin(Date.now() / 900 + i) * 180 + i * 20,
        60 + Math.cos(Date.now() / 800 + i) * 80 + i * 10,
        18 + Math.sin(Date.now() / 400 + i) * 8,
        0, Math.PI * 2
      );
      ctx.fillStyle = '#ffe259';
      ctx.fill();
    }
    ctx.restore();
    // Demons
    for (const d of demons) {
      if (!d.alive) continue;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.fillStyle = '#d7263d';
      ctx.beginPath();
      ctx.arc(DEMON_SIZE / 2, DEMON_SIZE / 2, DEMON_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('👹', 2, 28);
      ctx.restore();
    }
    // Souls
    for (const s of souls) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = s.rescued ? '#b2f7ef' : '#fff';
      ctx.beginPath();
      ctx.arc(SOUL_SIZE / 2, SOUL_SIZE / 2, SOUL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#23234a';
      ctx.fillText('👻', 2, 22);
      ctx.restore();
    }
    // Angel
    ctx.save();
    ctx.translate(angel.x, angel.y);
    ctx.fillStyle = '#ffe259';
    ctx.beginPath();
    ctx.arc(ANGEL_SIZE / 2, ANGEL_SIZE / 2, ANGEL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#23234a';
    ctx.fillText('😇', 2, 32);
    ctx.restore();
    // Bullets
    for (const b of bullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, BULLET_SIZE, BULLET_SIZE);
      ctx.restore();
    }
    // Score/lives
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.save();
    if (showScorePop) ctx.shadowColor = '#ffe259', ctx.shadowBlur = 16;
    ctx.fillText(`Score: ${score}`, 10, 28);
    ctx.restore();
    ctx.fillText(`Lives: ${lives}`, 380, 28);
    if (showInstructions) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(40, 160, 400, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Guardian Angel', 160, 190);
      ctx.font = '15px sans-serif';
      ctx.fillText('Arrow keys: Move', 120, 220);
      ctx.fillText('Space: Purify (shoot)', 120, 240);
      ctx.fillText('Rescue lost souls, defeat demons!', 120, 260);
      ctx.fillText('Press any key to start', 140, 280);
    }
    if (gameOver) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#18182a';
      ctx.fillRect(80, 240, 320, 80);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fd79a8';
      ctx.font = 'bold 32px sans-serif';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = showGameOverEffect ? 24 : 0;
      ctx.fillText('Game Over', 160, 290);
      ctx.restore();
    }
    if (win) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#18182a';
      ctx.fillRect(80, 240, 320, 80);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffe259';
      ctx.font = 'bold 32px sans-serif';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = showGameOverEffect ? 24 : 0;
      ctx.fillText('You Win!', 180, 290);
      ctx.restore();
    }
  }

  function restart() {
    setAngel({ x: GAME_WIDTH / 2 - ANGEL_SIZE / 2, y: GAME_HEIGHT - 80 });
    setDemons(spawnDemons());
    setSouls(spawnSouls());
    setBullets([]);
    setScore(0);
    setLives(MAX_LIVES);
    setGameOver(false);
    setWin(false);
    setRunning(true);
  }

  // Animated glowing background dots
  const bgDots = Array.from({ length: 18 }, () => ({
    x: Math.random() * GAME_WIDTH,
    y: Math.random() * GAME_HEIGHT,
    r: 3 + Math.random() * 2,
    opacity: 0.10 + Math.random() * 0.18,
  }));

    // Remove this unused/erroneous function, as setShowEventDetails is already a useState setter.
      {/* Daily Login Reward Modal */}
        {loginRewardOpen && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(24,24,42,0.96)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ background: '#ffe259', color: '#23234a', borderRadius: 18, padding: 36, boxShadow: '0 0 32px #fd79a8', textAlign: 'center', maxWidth: 340 }}>
              <h2>Daily Login Reward</h2>
              <p>Streak: <b>{loginStreak}</b> days</p>
              <p>Today's Reward: <b>{10 * loginStreak} LISA</b></p>
              <button onClick={claimLoginReward} style={{ background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 32px', fontWeight: 700, fontSize: 20, cursor: 'pointer', boxShadow: '0 0 8px #fd79a8', marginTop: 18 }}>Claim</button>
            </div>
          </div>
        )}
      


      {levelIntro && (
          <div className="ga-cutscene-modal" style={{
            position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(24,24,42,0.96)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          }}>
            <div className="ga-cutscene-content" style={{ background: '#23234a', borderRadius: 16, padding: 32, boxShadow: '0 0 32px #fd79a8', textAlign: 'center', maxWidth: 400 }}>
              <h2 style={{ color: '#ffe259', marginBottom: 12 }}>{STORY[currentLevel].name}</h2>
              <p style={{ color: '#fff', marginBottom: 24 }}>{STORY[currentLevel].intro}</p>
              {/* Optionally add cutscene art/animation here */}
              <button className="ga-btn" style={{ background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 32px', fontWeight: 700, fontSize: 20, cursor: 'pointer', boxShadow: '0 0 8px #fd79a8' }} onClick={handleStartLevel}>Begin</button>
            </div>
          </div>
        )}

      {/* Win Screen */}
      {win && (
        <div className="ga-win-modal" style={{
          position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(24,24,42,0.98)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        }}>
          <div className="ga-win-content" style={{ background: '#ffe259', borderRadius: 16, padding: 32, boxShadow: '0 0 32px #fd79a8', textAlign: 'center', maxWidth: 400 }}>
            <h2 style={{ color: '#23234a', marginBottom: 12 }}>Congratulations!</h2>
            <p style={{ color: '#23234a', marginBottom: 24 }}>You have completed the Guardian Angel story and saved countless souls!</p>
            {/* Optionally show stats, trophies, and rewards */}
            <button className="ga-btn" style={{ background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 32px', fontWeight: 700, fontSize: 20, cursor: 'pointer', boxShadow: '0 0 8px #fd79a8' }} onClick={() => window.location.reload()}>Play Again</button>
          </div>
        </div>
      )}

      {/* Social, Viral, and Monetization UI */}
      <div style={{ position: 'absolute', right: 16, top: 64, zIndex: 3, background: '#23234a', color: '#ffe259', borderRadius: 10, padding: '10px 18px', fontWeight: 700, boxShadow: '0 0 8px #fd79a8', minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => alert('Share & Invite coming soon!')} style={{ background: '#ffe259', color: '#23234a', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Share & Invite</button>
        <button onClick={bragLeaderboard} style={{ background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Brag Leaderboard</button>
        <button onClick={watchAd} style={{ background: '#ffe259', color: '#23234a', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Watch Ad (Earn LISA)</button>
        <button onClick={buyPremiumBundle} style={{ background: 'linear-gradient(90deg,#ffe259,#fd79a8)', color: '#23234a', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>Premium Bundle</button>
      </div>
      {/* Wallet and LISA/TON Balances UI */}
      <div style={{ position: 'absolute', left: 16, bottom: 16, zIndex: 3, background: '#23234a', color: '#ffe259', borderRadius: 10, padding: '10px 18px', fontWeight: 700, boxShadow: '0 0 8px #ffe259', minWidth: 180 }}>
        <div style={{ marginBottom: 4 }}>LISA: <b>{playerState.coins}</b></div>
        <div style={{ marginBottom: 4 }}>TON: <b>{playerState.tonBalance}</b></div>
        {walletConnected ? (
          <div style={{ fontSize: 12, color: '#fff', marginBottom: 4 }}>Wallet: Connected</div>
        ) : (
          <button onClick={connectWallet} style={{ background: '#ffe259', color: '#23234a', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, cursor: 'pointer', marginBottom: 4 }}>Connect Wallet</button>
        )}

      {/* Shop Button */}
      <button onClick={() => setShopOpen(true)} style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 3, background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, boxShadow: '0 0 8px #fd79a8', cursor: 'pointer' }}>🛒 Shop</button>
  {/* Close wallet/balances UI block */}
  </div>

      {/* Shop Modal */}
      {shopOpen && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(24,24,42,0.92)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#23234a', color: '#ffe259', borderRadius: 18, padding: 36, boxShadow: '0 0 32px #fd79a8', maxWidth: 420, width: '90%', textAlign: 'center', position: 'relative' }}>
            <h2 style={{ marginBottom: 18 }}>Shop</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
              {GUARDIAN_ANGEL_ASSETS.shopItems.map((item) => {
                const isSpecial =
                  raceEventActive &&
                  item.name === 'Celestial Aura'; // Example: special offer during event
                const priceLisa =
                  isSpecial && typeof item.priceLisa === 'number'
                    ? Math.floor(item.priceLisa / 2)
                    : item.priceLisa;

                return (
                  <div key={item.name} style={{ background: isSpecial ? 'linear-gradient(90deg,#ffe259,#fd79a8)' : '#ffe259', color: '#23234a', borderRadius: 10, padding: 14, minWidth: 120, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: isSpecial ? '0 0 24px #fd79a8' : '0 0 8px #ffe259', border: isSpecial ? '2px solid #fd79a8' : undefined, animation: isSpecial ? 'popSuccess 1.2s infinite alternate' : undefined }}>
                    <img src={item.icon} alt={item.name} style={{ width: 36, height: 36, marginBottom: 6, filter: isSpecial ? 'drop-shadow(0 0 12px #fd79a8)' : undefined }} />
                    <div style={{ fontWeight: 700, fontSize: 15, margin: '6px 0' }}>{item.name}</div>
                    <div style={{ fontSize: 12, marginBottom: 8 }}>{item.desc}</div>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>LISA: <b>{priceLisa}</b> | TON: <b>{item.priceTon}</b></div>
                    {isSpecial && <div style={{ color: '#fd79a8', fontWeight: 700, fontSize: 13, marginBottom: 4, animation: 'popSuccess 1.2s infinite alternate' }}>50% OFF!</div>}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => { purchaseItem({ ...item, priceLisa }, 'lisa'); logEvent(userId, 'shop_purchase', { item: item.name, method: 'lisa', special: isSpecial }); }}>Buy LISA</button>
                      <button style={{ background: '#23234a', color: '#ffe259', border: '1px solid #ffe259', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => { purchaseItem(item, 'ton'); logEvent(userId, 'shop_purchase', { item: item.name, method: 'ton', special: isSpecial }); }}>Buy TON</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShopOpen(false)} style={{ marginTop: 24, background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 0 8px #fd79a8' }}>Close</button>
          </div>
        </div>
      )}

      {/* Purchase Popup */}
      {purchasePopup && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(24,24,42,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffe259', color: '#23234a', borderRadius: 16, padding: 32, boxShadow: '0 0 32px #fd79a8', textAlign: 'center', maxWidth: 340, animation: 'popSuccess 0.7s' }}>
            <h3 style={{ marginBottom: 8 }}>Purchased!</h3>
            {purchasePopup?.icon && (
              <>
                <img src={purchasePopup!.icon} alt={purchasePopup!.name} style={{ width: 48, height: 48, marginBottom: 8 }} />
                <div style={{ fontWeight: 700 }}>{purchasePopup!.name}</div>
                {purchasePopup!.desc && <div style={{ fontSize: 14, marginTop: 6 }}>{purchasePopup!.desc}</div>}
              </>
            )}
          </div>
        </div>
      )}
      {/* Trophy Room Button */}
      <button onClick={() => setTrophyRoomOpen(true)} style={{ position: 'absolute', left: 16, top: 16, zIndex: 3, background: '#ffe259', color: '#23234a', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 700, boxShadow: '0 0 8px #ffe259', cursor: 'pointer' }}>🏆 Trophies</button>

      {/* Trophy Room Modal */}
      {trophyRoomOpen && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(24,24,42,0.92)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#23234a', color: '#ffe259', borderRadius: 18, padding: 36, boxShadow: '0 0 32px #fd79a8', maxWidth: 420, width: '90%', textAlign: 'center', position: 'relative' }}>
            <h2 style={{ marginBottom: 18 }}>Trophy Room</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
              {GUARDIAN_ANGEL_ASSETS.trophies.map((trophy) => {
                const unlocked = playerState.trophies.some((t: { name: string; }) => t.name === trophy.name);
                return (
                  <div key={trophy.name} style={{ background: unlocked ? '#ffe259' : '#444', color: unlocked ? '#23234a' : '#aaa', borderRadius: 10, padding: 14, minWidth: 90, minHeight: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: unlocked ? '0 0 8px #ffe259' : 'none', opacity: unlocked ? 1 : 0.5 }}>
                    <img src={trophy.icon} alt={trophy.name} style={{ width: 36, height: 36, marginBottom: 6 }} />
                    <div style={{ fontWeight: 700, fontSize: 15, margin: '6px 0' }}>{trophy.name}</div>
                    <div style={{ fontSize: 12 }}>{trophy.desc}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setTrophyRoomOpen(false)} style={{ marginTop: 24, background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 0 8px #fd79a8' }}>Close</button>
          </div>
        </div>
      )}
  {/* Power-up and Weapon UI */}
      <div style={{ position: 'absolute', right: 16, top: 16, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {/* Active Power-up */}
        {activePowerup && (
          <div style={{ background: '#ffe259', color: '#23234a', borderRadius: 8, padding: '6px 14px', marginBottom: 8, fontWeight: 700, boxShadow: '0 0 8px #ffe259', animation: 'popSuccess 0.6s' }}>
            Power-up: {activePowerup?.name}
          </div>
        )}
        {/* Active Weapon */}
        {activeWeapon && (
          <div style={{ background: '#fd79a8', color: '#fff', borderRadius: 8, padding: '6px 14px', fontWeight: 700, boxShadow: '0 0 8px #fd79a8', animation: 'popSuccess 0.6s' }}>
            Weapon: {activeWeapon?.name}
          </div>
        )}
      </div>
      {/* Animated glowing dots background */}
      <><svg width={GAME_WIDTH} height={GAME_HEIGHT} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
    {bgDots.map((d, i: number) => (
        <circle key={i} cx={d.x} cy={typeof d.y === 'number' ? d.y + (Math.sin(Date.now() / 800 + i) * 10) : d.y} r={d.r} fill="#fd79a8" opacity={d.opacity} />
    ))}
</svg><h2 style={{ color: '#ffe259', textShadow: '0 0 8px #fff', marginBottom: 8, zIndex: 2, position: 'relative' }}>Guardian Angel</h2><canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{ border: '2px solid #fff', background: 'transparent', marginBottom: 16, maxWidth: '100%', height: 'auto', zIndex: 2, position: 'relative' }}
        tabIndex={0} /></>
      {/* Inventory/Upgrades UI */}
      <><div style={{ display: 'flex', gap: 18, margin: '8px 0', zIndex: 2 }}>
    {playerState.inventory.length > 0 && (
        <div style={{ color: '#ffe259', fontWeight: 600 }}>
            Inventory:
            {playerState.inventory.map((item: { name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, i: React.Key | null | undefined) => (
                <span key={i} style={{ marginLeft: 6, background: '#ffe259', color: '#23234a', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700 }}>
                    {item.name}
                </span>
            ))}
        </div>
    )}
    {playerState.upgrades.length > 0 && (
        <div style={{ color: '#fd79a8', fontWeight: 600 }}>
            Upgrades:
            {playerState.upgrades.map((name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, i: React.Key | null | undefined) => (
                <span key={i} style={{ marginLeft: 6, background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700 }}>
                    {name}
                </span>
            ))}
        </div>
    )}
</div><div style={{ display: 'flex', gap: 12, margin: '8px 0', zIndex: 2 }}>
        {playerState.powerups.length > 0 && (
            <div style={{ color: '#ffe259', fontWeight: 600 }}>
                Power-ups:
                {playerState.powerups.map((p: Powerup, i: React.Key | null | undefined) => (
                    <button key={i} style={{ marginLeft: 6, background: '#ffe259', color: '#23234a', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => activatePowerup(p)}>
                        {p.name}
                    </button>
                ))}
            </div>
        )}
        {playerState.weapons.length > 0 && (
            <div style={{ color: '#fd79a8', fontWeight: 600 }}>
                Weapons:
                {playerState.weapons.map((w: SpecialWeapon, i: React.Key | null | undefined) => (
                    <button key={i} style={{ marginLeft: 6, background: '#fd79a8', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => switchWeapon(w)}>
                        {w.name}
                    </button>
                ))}
            </div>
        )}
    </div></>
      {(gameOver || win) && (
        <div style={{ margin: 8 }}>
          <button
            onClick={restart}
            style={{
              marginRight: 12,
              background: '#fd79a8',
              color: '#fff',
              borderRadius: 10,
              padding: '8px 28px',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 0 8px #fd79a8',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >Restart</button>
          <button
            onClick={handleSubmitScore}
            disabled={submitting}
            style={{
              background: '#ffe259',
              color: '#23234a',
              borderRadius: 10,
              padding: '8px 28px',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 0 8px #ffe259',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >{submitting ? 'Submitting...' : 'Submit Score'}</button>
        </div>
      )}
      <div>
        <div style={{ color: '#ffe259', fontWeight: 600, fontSize: 14, marginTop: 8, textShadow: '0 0 6px #fff' }}>User: {userId ? userId : 'Not connected'}</div>
        <div style={{ marginTop: 24, width: '100%' }}>
          <LeaderboardMini gameId="guardianangel" />
        </div>

        {/* Notification Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#23234a', color: '#ffe259', borderRadius: 10, padding: '14px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 0 16px #fd79a8', zIndex: 100, animation: 'fadeIn 0.5s' }}>{toast}</div>
        )}

        {/* Particle Effects */}
        {/* (No particles implemented) */}
        <style>{`
          @keyframes slideDown {
            0% { transform: translateY(-60px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes popSuccess {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>

export default GuardianAngel;


