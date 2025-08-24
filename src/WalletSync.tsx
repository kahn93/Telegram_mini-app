export default WalletSync;
import { useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { supabase } from './supabaseClient';

export function WalletSync() {
  const wallet = useTonWallet();
  useEffect(() => {
    async function saveWallet() {
      if (wallet && wallet.account.address) {
        // Try to get userId from Telegram WebApp initData (if available)
        let userId = undefined;
        try {
          const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: number } } } } }).Telegram?.WebApp;
          if (tg && tg.initDataUnsafe?.user?.id) {
            userId = tg.initDataUnsafe.user.id.toString();
          }
        } catch { /* ignore error if Telegram WebApp is not available */ }
        if (userId) {
          await supabase.from('users').update({ ton_wallet: wallet.account.address }).eq('userid', userId);
        }
      }
    }
    saveWallet();
  }, [wallet]);
  return null;
}
