import { supabase } from '../supabaseClient';

// Upload a file to Supabase Storage bucket
export async function uploadToStorage(bucket: string, path: string, file: File | Blob) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  return { data, error };
}

// Get a public URL for a file in Supabase Storage bucket
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
