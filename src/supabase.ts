import { createClient } from '@supabase/supabase-js';

// ⚠️ GANTI DENGAN KREDENSIAL SUPABASE ANDA
// Dapatkan dari: https://supabase.com → Project → Settings → API
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interface untuk data hasil kuis
export interface QuizResult {
  id?: number;
  player_name: string;
  bank_name: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped: number;
  max_streak: number;
  avg_time: number;
  created_at?: string;
}

// Simpan hasil kuis ke Supabase
export async function saveQuizResult(result: Omit<QuizResult, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .insert([result]);
    
    if (error) {
      console.error('Error saving to Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase connection error:', e);
    return false;
  }
}

// Ambil semua hasil kuis (untuk admin)
export async function getAllQuizResults(): Promise<QuizResult[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching from Supabase:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Supabase connection error:', e);
    return [];
  }
}

// Hapus hasil kuis berdasarkan ID
export async function deleteQuizResult(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting from Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase connection error:', e);
    return false;
  }
}

// Hapus semua hasil
export async function clearAllQuizResults(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (error) {
      console.error('Error clearing Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase connection error:', e);
    return false;
  }
}

// Cek apakah Supabase sudah dikonfigurasi
export function isSupabaseConfigured(): boolean {
  return !SUPABASE_URL.includes('YOUR_PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');
}
