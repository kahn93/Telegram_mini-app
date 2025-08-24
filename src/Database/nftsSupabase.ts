import { supabase } from '../supabaseClient';

export interface NFT {
  id?: number;
  userid: string;
  nft_id: string;
  name?: string;
  image_url?: string;
  description?: string;
  minted_at?: string;
  ton_tx_hash?: string;
}

export async function getUserNFTs(userid: string): Promise<NFT[]> {
  const { data } = await supabase.from('nfts').select('*').eq('userid', userid);
  return data || [];
}

export async function mintNFT(nft: Omit<NFT, 'id' | 'minted_at'>) {
  const { data, error } = await supabase.from('nfts').insert([nft]);
  return { data, error };
}
