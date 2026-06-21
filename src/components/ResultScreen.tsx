import { useEffect, useState } from 'react';
import { sfx } from '../useSound';

interface Props {
  playerName: string;
  bankName: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  maxStreak: number;
  total: number;
  avgTime: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

function grade(pct: number) {
  if (pct >= 90) return { emoji: '🏆', title: 'Luar Biasa!', msg: 'Kamu jenius!', color: 'text-yellow-400' };
  if (pct >= 75) return { emoji: '🌟', title: 'Hebat!', msg: 'Hampir sempurna!', color: 'text-green-400' };
  if (pct >= 60) return { emoji: '👍', title: 'Bagus!', msg: 'Cukup baik, terus berlatih!', color: 'text-blue-400' };
  if (pct >= 40) return { emoji: '💪', title: 'Lumayan!', msg: 'Masih bisa lebih baik!', color: 'text-orange-400' };
  return { emoji: '📚', title: 'Semangat!', msg: 'Jangan menyerah!', color: 'text-red-400' };
}

export default function ResultScreen({ playerName, bankName, score, correct, wrong, skipped, maxStreak, total, avgTime, onPlayAgain, onMenu }: Props) {
  const [show, setShow] = useState(false);
  const [animScore, setAnimScore] = useState(0);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const g = grade(pct);

  useEffect(() => {
    sfx.finish();
    setTimeout(() => setShow(true), 200);
    const steps = 50;
    const inc = score / steps;
    let cur = 0;
    const t = setInterval(() => { cur += inc; if (cur >= score) { setAnimScore(score); clearInterval(t); } else setAnimScore(Math.floor(cur)); }, 30);
    return () => clearInterval(t);
  }, [score]);

  const stats = [
    { label: 'Benar', val: correct, emoji: '✅', color: 'text-green-400' },
    { label: 'Salah', val: wrong, emoji: '❌', color: 'text-red-400' },
    { label: 'Timeout', val: skipped, emoji: '⏰', color: 'text-amber-400' },
    { label: 'Streak Maks', val: `${maxStreak}x`, emoji: '🔥', color: 'text-orange-400' },
    { label: 'Akurasi', val: `${pct}%`, emoji: '🎯', color: 'text-cyan-400' },
    { label: 'Rata² Waktu', val: `${avgTime}s`, emoji: '⏱️', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {pct >= 60 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="absolute animate-bounce"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${1 + Math.random() * 2}s`, fontSize: `${12 + Math.random() * 16}px`, opacity: 0.5 }}>
              {['⭐', '✨', '🎉', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className={`relative z-10 w-full max-w-lg transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/15">
          {/* Grade */}
          <div className="text-center mb-5">
            <div className="text-7xl mb-2 animate-bounce">{g.emoji}</div>
            <h1 className={`text-3xl font-bold ${g.color} mb-1`} style={{ fontFamily: 'Fredoka, sans-serif' }}>{g.title}</h1>
            <p className="text-purple-200">{g.msg}</p>
          </div>

          <p className="text-center text-white/40 text-sm mb-5">👤 {playerName} • 📚 {bankName}</p>

          {/* Score */}
          <div className="bg-white/[0.08] rounded-2xl p-6 mb-5 text-center">
            <p className="text-purple-300 text-sm mb-1">Total Skor</p>
            <p className="text-5xl font-bold text-yellow-400" style={{ fontFamily: 'Fredoka, sans-serif' }}>{animScore}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/[0.05] rounded-xl p-3 text-center border border-white/5">
                <div className="text-xl mb-0.5">{s.emoji}</div>
                <div className={`text-lg font-bold ${s.color}`} style={{ fontFamily: 'Fredoka, sans-serif' }}>{s.val}</div>
                <div className="text-white/30 text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Jawaban</span><span>{correct}/{total}</span>
            </div>
            <div className="h-3.5 bg-white/10 rounded-full overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000" style={{ width: `${(correct / total) * 100}%` }} />
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-1000" style={{ width: `${(wrong / total) * 100}%` }} />
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000" style={{ width: `${(skipped / total) * 100}%` }} />
            </div>
            <div className="flex items-center justify-center gap-3 mt-1.5">
              <span className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Benar</span>
              <span className="text-[10px] text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Salah</span>
              <span className="text-[10px] text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Timeout</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onPlayAgain}
              className="py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
              🔄 Main Lagi
            </button>
            <button onClick={onMenu}
              className="py-4 rounded-2xl bg-white/10 border-2 border-white/15 text-white font-bold text-lg hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
              🏠 Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
