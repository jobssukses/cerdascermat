import { useState, useEffect } from 'react';
import { QuizResult, getAllQuizResults, deleteQuizResult, clearAllQuizResults, isSupabaseConfigured } from '../supabase';
import { sfx } from '../useSound';

interface Props {
  onBack: () => void;
  adminPassword: string;
}

export default function AdminScreen({ onBack, adminPassword }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, avgAccuracy: 0, topPlayer: '' });

  const configured = isSupabaseConfigured();

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsLoggedIn(true);
      setError('');
      sfx.correct();
      fetchResults();
    } else {
      setError('Password salah!');
      sfx.wrong();
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    const data = await getAllQuizResults();
    setResults(data);
    
    // Calculate stats
    if (data.length > 0) {
      const totalScore = data.reduce((sum, r) => sum + r.score, 0);
      const totalAccuracy = data.reduce((sum, r) => sum + (r.correct_answers / r.total_questions) * 100, 0);
      const topPlayer = data.reduce((top, r) => r.score > (top?.score || 0) ? r : top, data[0]);
      setStats({
        total: data.length,
        avgScore: Math.round(totalScore / data.length),
        avgAccuracy: Math.round(totalAccuracy / data.length),
        topPlayer: topPlayer?.player_name || '-',
      });
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteQuizResult(id);
    if (success) {
      sfx.click();
      fetchResults();
    }
    setDeleteConfirm(null);
  };

  const handleClearAll = async () => {
    const success = await clearAllQuizResults();
    if (success) {
      sfx.click();
      setResults([]);
      setStats({ total: 0, avgScore: 0, avgAccuracy: 0, topPlayer: '' });
    }
    setClearConfirm(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchResults();
  }, [isLoggedIn]);

  // Not configured screen
  if (!configured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border border-white/10">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Supabase Belum Dikonfigurasi
            </h1>
            <p className="text-white/50 text-sm">
              Untuk menggunakan fitur Admin & Database online, Anda perlu setup Supabase terlebih dahulu.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-300 text-sm font-medium mb-2">📋 Langkah Setup:</p>
            <ol className="text-amber-200/70 text-xs space-y-1 list-decimal list-inside">
              <li>Buka <span className="text-amber-300">supabase.com</span> → Buat project</li>
              <li>Buat table <span className="text-amber-300">quiz_results</span> (lihat README)</li>
              <li>Copy URL & Anon Key dari Settings → API</li>
              <li>Tambahkan ke Environment Variables di Vercel</li>
            </ol>
          </div>

          <button onClick={() => { sfx.click(); onBack(); }}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/15 text-white font-medium hover:bg-white/15 transition-all">
            ← Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full border border-white/10">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Admin Panel
            </h1>
            <p className="text-white/40 text-sm mt-1">Masukkan password untuk melanjutkan</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-red-300 text-sm text-center">⚠️ {error}</p>
            </div>
          )}

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password Admin"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all mb-4"
          />

          <button onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-lg transition-all mb-3">
            🔓 Masuk
          </button>

          <button onClick={() => { sfx.click(); onBack(); }}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/15 text-white/60 font-medium hover:bg-white/15 hover:text-white transition-all">
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { sfx.click(); onBack(); }}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <span className="text-xl">←</span><span className="text-sm font-medium">Kembali</span>
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            🛡️ Admin Panel
          </h1>
          <button onClick={() => { sfx.click(); setIsLoggedIn(false); setPassword(''); }}
            className="text-red-400/60 hover:text-red-400 text-sm transition-colors">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Permainan', value: stats.total, emoji: '🎮', color: 'from-blue-500 to-cyan-500' },
            { label: 'Rata-rata Skor', value: stats.avgScore, emoji: '⭐', color: 'from-yellow-500 to-orange-500' },
            { label: 'Rata-rata Akurasi', value: `${stats.avgAccuracy}%`, emoji: '🎯', color: 'from-green-500 to-emerald-500' },
            { label: 'Top Player', value: stats.topPlayer, emoji: '🏆', color: 'from-purple-500 to-pink-500' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-lg`}>
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-white font-bold text-lg truncate" style={{ fontFamily: 'Fredoka, sans-serif' }}>{stat.value}</div>
              <div className="text-white/70 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            📊 Riwayat Hasil Kuis ({results.length})
          </h2>
          <div className="flex gap-2">
            <button onClick={() => fetchResults()}
              className="px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:text-white text-sm transition-all hover:bg-white/15">
              🔄 Refresh
            </button>
            {results.length > 0 && !clearConfirm && (
              <button onClick={() => setClearConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300/70 hover:text-red-300 text-sm transition-all hover:bg-red-500/30">
                🗑️ Hapus Semua
              </button>
            )}
            {clearConfirm && (
              <div className="flex gap-1">
                <button onClick={handleClearAll}
                  className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-medium">Ya, Hapus!</button>
                <button onClick={() => setClearConfirm(false)}
                  className="px-3 py-2 rounded-xl bg-white/10 text-white/60 text-sm">Batal</button>
              </div>
            )}
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="text-center py-20 text-white/40">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <p>Memuat data...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-3">📭</div>
            <p>Belum ada data hasil kuis.</p>
          </div>
        ) : (
          <div className="bg-white/[0.05] rounded-2xl border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 bg-white/5 text-white/50 text-xs font-medium border-b border-white/10">
              <div className="col-span-2">Pemain</div>
              <div className="col-span-2">Bank Soal</div>
              <div className="col-span-1 text-center">Skor</div>
              <div className="col-span-2 text-center">Hasil</div>
              <div className="col-span-1 text-center">Streak</div>
              <div className="col-span-1 text-center">Waktu</div>
              <div className="col-span-2 text-center">Tanggal</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5 max-h-[50vh] overflow-y-auto">
              {results.map((r) => {
                const accuracy = r.total_questions > 0 ? Math.round((r.correct_answers / r.total_questions) * 100) : 0;
                return (
                  <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 hover:bg-white/5 transition-colors items-center">
                    {/* Mobile: stacked layout */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{r.player_name}</span>
                        <span className="text-yellow-400 font-bold">{r.score} pts</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/40">{r.bank_name}</span>
                        <span className="text-green-400">{r.correct_answers}/{r.total_questions} ({accuracy}%)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/30">
                        <span>{r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '-'}</span>
                        <button onClick={() => deleteConfirm === r.id ? handleDelete(r.id!) : setDeleteConfirm(r.id!)}
                          className={`px-2 py-1 rounded-lg text-xs ${deleteConfirm === r.id ? 'bg-red-500 text-white' : 'text-red-400/50 hover:text-red-400'}`}>
                          {deleteConfirm === r.id ? 'Konfirmasi?' : '🗑️'}
                        </button>
                      </div>
                    </div>

                    {/* Desktop: grid layout */}
                    <div className="hidden md:block col-span-2 text-white font-medium truncate">{r.player_name}</div>
                    <div className="hidden md:block col-span-2 text-white/50 text-sm truncate">{r.bank_name}</div>
                    <div className="hidden md:block col-span-1 text-center text-yellow-400 font-bold">{r.score}</div>
                    <div className="hidden md:block col-span-2 text-center">
                      <span className="text-green-400">{r.correct_answers}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-red-400">{r.wrong_answers}</span>
                      <span className="text-white/30">/</span>
                      <span className="text-amber-400">{r.skipped}</span>
                      <span className="text-white/20 text-xs ml-1">({accuracy}%)</span>
                    </div>
                    <div className="hidden md:block col-span-1 text-center text-orange-400 text-sm">{r.max_streak}x</div>
                    <div className="hidden md:block col-span-1 text-center text-white/40 text-sm">{r.avg_time}s</div>
                    <div className="hidden md:block col-span-2 text-center text-white/30 text-xs">
                      {r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '-'}
                    </div>
                    <div className="hidden md:flex col-span-1 justify-center">
                      {deleteConfirm === r.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(r.id!)} className="text-xs text-red-400 hover:text-red-300">Ya</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-white/40">Tidak</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(r.id!)} className="text-red-400/40 hover:text-red-400 text-sm">🗑️</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/30">
          <span><span className="text-green-400">●</span> Benar</span>
          <span><span className="text-red-400">●</span> Salah</span>
          <span><span className="text-amber-400">●</span> Timeout</span>
        </div>
      </div>
    </div>
  );
}
