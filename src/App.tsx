import Marketplace from './Pages/Marketplace';
import { triggerAnalytics } from './utils/webhooks';
import { requestNotificationPermission, sendBrowserNotification } from './notifications';
import { useState, useEffect, useCallback } from 'react';
import { NotificationProvider } from './Components/NotificationProvider';
import styles from './App.module.scss';
import { supabase } from './supabaseClient';
import { addUserSupabase, getUserSupabase } from './Database/dbSupabase';
import { coinBalanceSaveLoad, userUpgradePurchase, achievementUnlock } from './Database/edgeFunctions';
import { getUserByReferralCode, addReferral } from './Database/referralSupabase';
import { countries } from './Database/countries';
import Leaderboard from './Components/Leaderboard/Leaderboard';
// import populateDB from './Database/populateDB';
import NavBar from './Components/NavBar';
import Shop from './Pages/Shop';
import AdminAnalytics from './Pages/AdminAnalytics';
import Trophies from './Pages/Trophies';
import { Trophy } from './Pages/trophiesData';
import Tasks from './Pages/Tasks';
import Upgrades from './Pages/Upgrades';
import Friends from './Pages/Friends';

import Profile from './Pages/Profile';
import Chat from './Pages/Chat';
import Events from './Pages/Events';
import NFTGallery from './Pages/NFTGallery';


// MarketplaceNFTTabs: unified tabbed view for Marketplace and NFT Gallery
const MarketplaceNFTTabs: React.FC<{ userId: string }> = ({ userId }) => {
  const [tab, setTab] = useState<'marketplace' | 'nfts'>('marketplace');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
        <button onClick={() => setTab('marketplace')} style={{ fontWeight: tab === 'marketplace' ? 700 : 400, background: tab === 'marketplace' ? '#ffe259' : '#fff', borderRadius: 6, padding: '4px 16px', border: '1px solid #eee' }}>Marketplace Listings</button>
        <button onClick={() => setTab('nfts')} style={{ fontWeight: tab === 'nfts' ? 700 : 400, background: tab === 'nfts' ? '#ffe259' : '#fff', borderRadius: 6, padding: '4px 16px', border: '1px solid #eee' }}>NFT Gallery & Mint</button>
      </div>
      {tab === 'marketplace' ? <Marketplace /> : <NFTGallery userId={userId} />}
    </div>
  );
};
import UserAnalytics from './Pages/UserAnalytics';
import Boosts from './Pages/Boosts';
import Arcade from './Pages/Arcade';
import Airdrop from './Pages/Airdrop';


import clickImg from './assets/clickimg.png';
import CoinsPerTap from './Components/CoinsPerTap';
import MiningButton from './Components/MiningButton';
import CoinBalance from './Components/CoinBalance';
import PassiveIncome from './Components/PassiveIncome';
import EnergyBar from './Components/EnergyBar';
import { getCoinsPerTap } from './Database/coinsPerTapLogic'; // used in getEffectiveCoinsPerTap
import { getPassiveIncomePerHour } from './Database/passiveIncomeLogic';
import { MAX_ENERGY, getInitialEnergy } from './Database/energyLogic';




function App() {

  // ...existing code...

  // Example: Trigger anti-cheat event (replace with real logic)
  // triggerAntiCheat(userId, 'suspicious_action');

  // Example: Trigger NFT event (replace with real logic)
  // triggerNFT('nft123', userId, 'mint');

  // Example: Trigger notification event (replace with real logic)
  // triggerNotify('You have a new reward!');

  // Trophy/achievement state
  const [trophiesEarned, setTrophiesEarned] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('trophiesEarned') || '{}');
    } catch {
      return {};
    }
  });


  // Trophy unlock logic
  const handleTrophyEarn = (trophy: Trophy) => {
    if (!trophiesEarned[trophy.key]) {
      setTrophiesEarned((prev) => {
        const updated = { ...prev, [trophy.key]: true };
        localStorage.setItem('trophiesEarned', JSON.stringify(updated));
        return updated;
      });
      setCoinCount((prev) => prev + trophy.reward);
      // Call Edge Function for achievement unlock
      if (userId) achievementUnlock({ userId, achievement: trophy.key });
      // Optionally: show animation or notification for trophy unlock
    }
  };
  const [coinCount, setCoinCount] = useState<number>(0);
  // Track last saved coin count for auto-save
  const [lastSavedCoin, setLastSavedCoin] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  // Example: Trigger analytics event after userId is set
  useEffect(() => {
    if (userId) {
      triggerAnalytics('app_loaded', userId);
    }
  }, [userId]);
  const [currentView, setCurrentView] = useState<string>('coin');
  const [energy, setEnergy] = useState<number>(getInitialEnergy());
  // Shop state
  const [purchased, setPurchased] = useState<{ [key: string]: boolean }>(() => {
    try {
      return JSON.parse(localStorage.getItem('purchasedItems') || '{}');
    } catch {
      return {};
    }
  });
  // Upgrades state
  const [upgrades, setUpgrades] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('upgrades') || '{}');
    } catch {
      return {};
    }
  });
  // Multiplier state
  const [coinMultiplier, setCoinMultiplier] = useState(1);
  const [energyMultiplier, setEnergyMultiplier] = useState(1);
  // Timed effects state
  const [activeEffects, setActiveEffects] = useState<{ [key: string]: number }>({});
  // Passive income effect (with passive boost and upgrades)
  useEffect(() => {
    const interval = setInterval(() => {
      let passive = getPassiveIncomePerHour();
      // Upgrades
      if (upgrades['passiveIncome']) passive += 100 * Math.pow(2, upgrades['passiveIncome'] - 1);
      if (upgrades['hungerDrive']) passive += 500 * Math.pow(2, upgrades['hungerDrive'] - 1);
      if (upgrades['autoMiner']) passive += 50 * Math.pow(2, upgrades['autoMiner'] - 1);
      if (upgrades['magnet']) passive += 100 * Math.pow(2, upgrades['magnet'] - 1);
      if (activeEffects['passiveboost'] && activeEffects['passiveboost'] > Date.now()) {
        passive *= 2;
      }
      setCoinCount((prev) => prev + passive / 3600);
    }, 1000);
    return () => clearInterval(interval);
  }, [upgrades, activeEffects]);

  // Notification permission and daily check-in reminder logic
  useEffect(() => {
    requestNotificationPermission();
    // Daily check-in reminder (example: 10am local time)
    const now = new Date();
    const checkinHour = 10;
    if (now.getHours() === checkinHour && Notification.permission === 'granted') {
      sendBrowserNotification('Don’t forget your daily check-in!', { body: 'Earn your daily bonus in the app.' });
    }
  }, []);

  // Initialization logic (user, referral, etc)
  useEffect(() => {
    const initializeApp = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        const user = await getUserSupabase(storedUserId);
        if (user) {
          setCoinCount(user.coins);
          setLastSavedCoin(user.coins);
          setSelectedCountry(user.country);
        }
      } else {
        // Check for referral code in URL
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('start');
        const newUserId = 'You';
        localStorage.setItem('userId', newUserId);
        setUserId(newUserId);
        if (refCode) {
          // Find referrer by code
          const referrer = await getUserByReferralCode(refCode);
          if (referrer && referrer.userid !== newUserId) {
            // Add direct referral (parentReferralId undefined for direct)
            await addReferral(referrer.userid, newUserId, undefined, 1);
            // Check if referrer was also referred (multi-level)
            const { data: parentReferral } = await supabase
              .from('referrals')
              .select('id, referrer_id, referral_level')
              .eq('referred_id', referrer.userid)
              .single();
            if (parentReferral) {
              // Add indirect referral (level 2)
              await addReferral(parentReferral.referrer_id, newUserId, parentReferral.id, parentReferral.referral_level + 1);
            }
          }
        }
      }
    };
    initializeApp();
  }, []);

  // Auto-save coin balance to Supabase Edge Function when it changes
  useEffect(() => {
    if (!userId || !selectedCountry) return;
    if (coinCount !== lastSavedCoin) {
      coinBalanceSaveLoad({ userId, coins: coinCount });
      setLastSavedCoin(coinCount);
    }
  }, [coinCount, userId, selectedCountry, lastSavedCoin]);

  // Periodic auto-save (in case of missed updates)
  useEffect(() => {
    if (!userId || !selectedCountry) return;
    const interval = setInterval(() => {
      coinBalanceSaveLoad({ userId, coins: coinCount });
      setLastSavedCoin(coinCount);
    }, 30000); // every 30s
    return () => clearInterval(interval);
  }, [coinCount, userId, selectedCountry]);

  // Handle upgrade purchase
  const handleUpgradePurchase = async (key: string) => {
    setUpgrades((prev) => {
      const level = prev[key] || 0;
      if (level >= 5000) return prev;
      // Get base price and value
      const UPGRADE_BASE_PRICES: Record<string, number> = {
        coinPerTap: 400,
        passiveIncome: 500,
        energy: 300,
        hungerDrive: 500,
        energyRegen: 350,
        tapStreak: 600,
        criticalTap: 700,
        autoMiner: 800,
        energySaver: 900,
        magnet: 1000,
        ultraBoost: 2000,
        goldenTouch: 2500,
      };
      const price = UPGRADE_BASE_PRICES[key] * Math.pow(2, level);
      if (coinCount < price) return prev;
      // Deduct coins
      setCoinCount((c) => c - price);
      // Call Edge Function for purchase
      if (userId) userUpgradePurchase({ userId, upgrade: key, cost: price });
      // Apply upgrade effect
      if (key === 'energy') setEnergy((e) => e + 100 * Math.pow(2, level));
      if (key === 'ultraBoost') {
        setCoinMultiplier((m) => m * 2);
        setEnergyMultiplier((m) => m * 2);
        setTimeout(() => {
          setCoinMultiplier((m) => m / 2);
          setEnergyMultiplier((m) => m / 2);
        }, 60 * 60 * 1000);
      }
      const updated = { ...prev, [key]: level + 1 };
      localStorage.setItem('upgrades', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const country = event.target.value;
    setSelectedCountry(country);
    if (userId) {
      await addUserSupabase({ userid: userId, country, coins: 0 });
    }
  };

  // (handleLogout is unused, so removed to fix lint error)

  // Calculate coins per tap with multipliers, upgrades, and effects
  const getEffectiveCoinsPerTap = useCallback(() => {
    let base = getCoinsPerTap(coinCount);
    if (upgrades['coinPerTap']) base += 2 * Math.pow(2, upgrades['coinPerTap'] - 1);
    if (upgrades['goldenTouch']) base += 10 * Math.pow(2, upgrades['goldenTouch'] - 1);
    if (activeEffects['doubletap'] && activeEffects['doubletap'] > Date.now()) base *= 2;
    if (activeEffects['megatap'] && activeEffects['megatap'] > Date.now()) base *= 100;
    if (activeEffects['doubleCoins'] && activeEffects['doubleCoins'] > Date.now()) base *= 2;
    if (purchased['goldentap']) base += 100;
    return base * coinMultiplier;
  }, [coinCount, upgrades, activeEffects, purchased, coinMultiplier]);
  // AutoMiner boost effect: periodically add coins per tap for 1 hour
  useEffect(() => {
    if (activeEffects['autoMiner'] && activeEffects['autoMiner'] > Date.now()) {
      const interval = setInterval(() => {
        setCoinCount((prev) => prev + getEffectiveCoinsPerTap());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeEffects, getEffectiveCoinsPerTap]);

  // Mining button click handler
  const handleButtonClick = async () => {
    if (energy <= 0) return;
    let coinsToAdd = getEffectiveCoinsPerTap();
    // Tap streak upgrade
    if (upgrades['tapStreak']) coinsToAdd += 10 * Math.pow(2, upgrades['tapStreak'] - 1);
    // Critical tap upgrade
    if (upgrades['criticalTap'] && Math.random() < 0.05 * upgrades['criticalTap']) coinsToAdd *= 2;
    setCoinCount((prev) => prev + coinsToAdd);
    // Energy saver upgrade
    let energyCost = 1;
    if (upgrades['energySaver']) energyCost = Math.max(1, energyCost - upgrades['energySaver']);
    setEnergy((prev) => Math.max(0, prev - energyCost));
    if (userId && selectedCountry) {
      coinBalanceSaveLoad({ userId, coins: coinCount + coinsToAdd });
    }
    // Handle one-time effects
    if (activeEffects['megatap'] && activeEffects['megatap'] > Date.now()) {
      setActiveEffects((prev) => ({ ...prev, megatap: 0 }));
    }
  };

  // Shop purchase handler (to be passed to Shop)
  const handleShopPurchase = (item: { label: string; value?: number; effect?: string }) => {
    setPurchased((prev) => {
      const updated = { ...prev, [item.label]: true };
      localStorage.setItem('purchasedItems', JSON.stringify(updated));
      return updated;
    });
    // Apply multipliers
    if (item.label.includes('Coin Multiplier') && item.value) {
      setCoinMultiplier(item.value);
    }
    if (item.label.includes('Energy Multiplier') && item.value) {
      setEnergyMultiplier(item.value);
    }
    // Timed effects
    const now = Date.now();
    if (item.effect === 'autoclicker') {
      // Simulate auto mining for 1hr (every second)
      const interval = setInterval(() => {
        setCoinCount((prev) => prev + getEffectiveCoinsPerTap());
      }, 1000);
      setTimeout(() => clearInterval(interval), 60 * 60 * 1000);
    }
    if (item.effect === 'doubletap') setActiveEffects((prev) => ({ ...prev, doubletap: now + 60 * 60 * 1000 }));
    if (item.effect === 'refill') setEnergy(MAX_ENERGY * energyMultiplier);
    if (item.effect === 'passiveboost') setActiveEffects((prev) => ({ ...prev, passiveboost: now + 60 * 60 * 1000 }));
    if (item.effect === 'luckyspin') {
      // 10% chance to win 10x coins
      if (Math.random() < 0.1) setCoinCount((prev) => prev * 10);
    }
    if (item.effect === 'megatap') setActiveEffects((prev) => ({ ...prev, megatap: now + 10 * 1000 }));
    if (item.effect === 'energysaver') setActiveEffects((prev) => ({ ...prev, energysaver: now + 60 * 60 * 1000 }));
    if (item.effect === 'magnet') {
      // Attract bonus coins for 1hr
      const interval = setInterval(() => {
        setCoinCount((prev) => prev + 100);
      }, 5000);
      setTimeout(() => clearInterval(interval), 60 * 60 * 1000);
    }
    if (item.effect === 'goldentap') setActiveEffects((prev) => ({ ...prev, goldentap: Infinity }));
    if (item.effect === 'ultraboost') {
      setCoinMultiplier((prev) => prev * 2);
      setEnergyMultiplier((prev) => prev * 2);
      setTimeout(() => {
        setCoinMultiplier((prev) => prev / 2);
        setEnergyMultiplier((prev) => prev / 2);
      }, 10 * 60 * 1000);
    }
  };

  const renderContent = () => {
    if (!selectedCountry) {
      return (
        <div className={styles.countrySelection}>
          <h1>Select Your Country</h1>
          <select onChange={handleCountryChange} defaultValue="">
            <option value="" disabled>
              Choose your country
            </option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      );
    }

  switch (currentView) {
    case 'Marketplace':
      return <MarketplaceNFTTabs userId={userId} />;
      case 'AdminAnalytics':
        return <AdminAnalytics />;
      case 'coin':
        return (
          <div className={styles.centerContent}>
            {/* Top row: coins per tap (left), coin balance (center), passive income (right) */}
            <div className={styles.topRow}>
              <div className={styles.coinsPerTapTopLeft}>
                <CoinsPerTap coinCount={coinCount} />
              </div>
              <div className={styles.coinBalanceCenter}>
                <CoinBalance coinCount={Math.floor(coinCount)} />
              </div>
              <div className={styles.passiveIncomeTopRight}>
                <PassiveIncome coinsPerHour={getPassiveIncomePerHour()} />
              </div>
            </div>
            <EnergyBar energy={energy} maxEnergy={MAX_ENERGY} />
            <p>Country: {selectedCountry}</p>
            <MiningButton onClick={handleButtonClick} imgSrc={clickImg} />
          </div>
        );
      case 'leaderboard':
        return <Leaderboard />;
      case 'Shop':
        return <Shop onPurchase={handleShopPurchase} purchased={purchased} />;
      case 'Trophies': {
        const shopPurchasesCount = Object.keys(purchased).length;
        return (
          <Trophies
            coinCount={Math.floor(coinCount)}
            energy={Math.floor(energy)}
            shopPurchases={shopPurchasesCount}
            earned={trophiesEarned}
            onEarn={handleTrophyEarn}
          />
        );
      }
      case 'Tasks':
        return <Tasks />;
      case 'Upgrades':
        return <Upgrades upgrades={upgrades} coins={coinCount} onPurchase={handleUpgradePurchase} />;
      case 'Friends':
        return <Friends />;
  case 'Boosts':
    return (
      <Boosts
        coinCount={coinCount}
        activeBoosts={activeEffects}
  onPurchase={(boostKey: string) => {
          const now = Date.now();
          if (boostKey === 'doubleCoins') {
            setActiveEffects((prev) => ({ ...prev, doubleCoins: now + 60 * 60 * 1000 }));
            setCoinCount((prev) => prev - 1000);
          } else if (boostKey === 'energyRefill') {
            setEnergy(MAX_ENERGY * energyMultiplier);
            setCoinCount((prev) => prev - 500);
          } else if (boostKey === 'autoMiner') {
            setActiveEffects((prev) => ({ ...prev, autoMiner: now + 60 * 60 * 1000 }));
            setCoinCount((prev) => prev - 2000);
          } else if (boostKey === 'passiveBoost') {
            setActiveEffects((prev) => ({ ...prev, passiveboost: now + 60 * 60 * 1000 }));
            setCoinCount((prev) => prev - 1500);
          }
        }}
      />
    );
      case 'Arcade':
        return <Arcade
          userId={userId}
          coinBalance={coinCount}
          onDeposit={(amount: number) => setCoinCount((prev) => prev + amount)}
          onWithdraw={(amount: number) => setCoinCount((prev) => Math.max(0, prev - amount))}
          onScore={(score: number) => setCoinCount((prev) => prev + score)}
        />;
      case 'Airdrop':
        return <Airdrop />;
  // case 'referrals':
  //   return <ReferralLeaderboard />;
      case 'profile':
        return <Profile userId={userId} />;
      case 'chat':
        return <Chat userId={userId} />;
      case 'events':
        return <Events userId={userId} />;
      case 'nfts':
        return <NFTGallery userId={userId} />;
      case 'useranalytics':
        return <UserAnalytics userId={userId} />;
      default:
        return null;
    }
  };

    // Add LayoutEditor to NavBar for devs
    return (
      <NotificationProvider>
        <div className={styles.background}>
          <div className={styles.app}>
            {renderContent()}
            {selectedCountry && (
              <NavBar onNavigate={setCurrentView} />
            )}
          </div>
        </div>
      </NotificationProvider>
    );
}

export default App;
