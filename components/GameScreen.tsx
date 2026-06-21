import { useState, useEffect, useCallback, useRef } from 'react';
import { CustomQuestion } from '../types';
import { sfx } from '../useSound';

interface Props {
  playerName: string;
  questions: CustomQuestion[];
  bankName: string;
  onFinish: (score: number, correct: number, wrong: number, skipped: number, maxStreak: number, avgTime: number) => void;
}

type Phase = 'countdown' | 'question' | 'feedback';

export default function GameScreen({ playerName, questions, bankName, onFinish }: Props) {
  const total = questions.length;
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('countdown');
  const [cdNum, setCdNum] = useState(3);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit ?? 15);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [bonus, setBonus] = useState<number | null>(null);
  const [comboText, setComboText] = useState('');
  const totalTimeUsed = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to track latest values for finish callback
  const scoreRef = useRef(score);
  const correctRef = useRef(correct);
  const wrongRef = useRef(wrong);
  const skippedRef = useRef(skipped);
  const maxStreakRef = useRef(maxStreak);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { correctRef.current = correct; }, [correct]);
  useEffect(() => { wrongRef.current = wrong; }, [wrong]);
  useEffect(() => { skippedRef.current = skipped; }, [skipped]);
  useEffect(() => { maxStreakRef.current = maxStreak; }, [maxStreak]);

  // Current question
  const q = questions[qIdx];

  // ========== COUNTDOWN ==========
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (cdNum <= 0) {
      setPhase('question');
      return;
    }
    const t = setTimeout(() => { sfx.countdown(); setCdNum(c => c - 1); }, 700);
    return () => clearTimeout(t);
  }, [phase, cdNum]);

  // ========== QUESTION TIMER ==========
  useEffect(() => {
    if (phase !== 'question') return;
    setTimeLeft(q.timeLimit);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        if (prev <= 4) sfx.tick();
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, qIdx]);

  // ========== HANDLERS ==========
  const handleTimeout = useCallback(() => {
    totalTimeUsed.current += q.timeLimit;
    setPhase('feedback');
    setSelected(null);
    setSkipped(s => s + 1);
    setStreak(0);
    sfx.wrong();
    setTimeout(nextQuestion, 1800);
  }, [qIdx]);

  const handleAnswer = useCallback((optIdx: number) => {
    if (phase !== 'question') return;
    if (timerRef.current) clearInterval(timerRef.current);

    const usedTime = q.timeLimit - timeLeft;
    totalTimeUsed.current += usedTime;

    setSelected(optIdx);
    setPhase('feedback');

    if (optIdx === q.correctIndex) {
      const newStreak = streak + 1;
      const baseScore = 10;
      const timeBonus = Math.max(0, Math.floor(timeLeft * 2));
      const streakBonus = Math.min(newStreak, 5) * 5;
      const pts = baseScore + timeBonus + streakBonus;

      setCorrect(c => c + 1);
      setScore(s => s + pts);
      setStreak(newStreak);
      setMaxStreak(ms => Math.max(ms, newStreak));
      setBonus(pts);
      setComboText(newStreak >= 3 ? `🔥 ${newStreak}x Combo!` : '');
      if (newStreak >= 3) sfx.combo(newStreak); else sfx.correct();
    } else {
      setWrong(w => w + 1);
      setStreak(0);
      setComboText('');
      sfx.wrong();
    }

    setTimeout(nextQuestion, 1800);
  }, [phase, timeLeft, streak, qIdx]);

  const nextQuestion = useCallback(() => {
    const next = qIdx + 1;
    if (next >= total) {
      setTimeout(() => {
        const avg = total > 0 ? Math.round(totalTimeUsed.current / total) : 0;
        onFinish(scoreRef.current, correctRef.current, wrongRef.current, skippedRef.current, maxStreakRef.current, avg);
      }, 50);
      return;
    }
    setQIdx(next);
    setPhase('question');
    setSelected(null);
    setBonus(null);
    setComboText('');
  }, [qIdx, total, onFinish]);

  const progress = (qIdx / total) * 100;
  const timePercent = q ? (timeLeft / q.timeLimit) * 100 : 100;

  // ========== COUNTDOWN SCREEN ==========
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-300 mb-4 text-lg">{bankName}</p>
          <div className="text-8xl font-bold text-white animate-pulse" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {cdNum > 0 ? cdNum : '🚀'}
          </div>
          <p className="text-purple-200 mt-6 text-xl" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {cdNum > 0 ? 'Bersiap...' : 'Mulai!'}
          </p>
        </div>
      </div>
    );
  }

  // ========== GAME SCREEN ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white/[0.06] backdrop-blur-sm border-b border-white/10">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white/50 text-sm">👤</span>
              <span className="text-white font-medium text-sm truncate max-w-[120px]">{playerName}</span>
            </div>
            <div className="text-center">
              {streak >= 2 && <span className="text-xs text-orange-400 animate-pulse font-semibold">🔥 {streak}x</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400 text-sm">⭐</span>
              <span className="text-yellow-400 font-bold">{score}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-mono">{qIdx + 1}/{total}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          {/* Timer */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/50 text-sm">⏱️ Waktu</span>
              <span className={`font-bold text-lg ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : timeLeft <= 10 ? 'text-amber-400' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-linear
                ${timeLeft <= 5 ? 'bg-gradient-to-r from-red-500 to-red-400' : timeLeft <= 10 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                style={{ width: `${timePercent}%` }} />
            </div>
          </div>

          {/* Question Card */}
          <div className={`bg-white/[0.08] backdrop-blur-xl rounded-3xl p-7 border transition-all duration-300 mb-6 relative
            ${phase === 'feedback' && selected === q.correctIndex ? 'border-green-400/40 shadow-lg shadow-green-500/10' :
              phase === 'feedback' ? 'border-red-400/40 shadow-lg shadow-red-500/10 animate-[shake_0.4s_ease-in-out]' :
              'border-white/15'}`}>

            {comboText && (
              <div className="text-center mb-2 animate-bounce">
                <span className="text-orange-400 font-bold text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>{comboText}</span>
              </div>
            )}

            {q.category && (
              <div className="text-center mb-2">
                <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">{q.category}</span>
              </div>
            )}

            <p className="text-center text-2xl font-bold text-white leading-relaxed" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {q.question}
            </p>

            {bonus !== null && (
              <div className="absolute top-3 right-4 animate-bounce">
                <span className="text-yellow-400 font-bold">+{bonus}</span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, oIdx) => {
              let cls = 'bg-white/[0.08] border-white/15 hover:bg-white/[0.14] hover:scale-[1.02] hover:border-white/25';
              if (phase === 'feedback') {
                if (oIdx === q.correctIndex) cls = 'bg-green-500/25 border-green-400/50 scale-[1.03]';
                else if (oIdx === selected) cls = 'bg-red-500/25 border-red-400/50 scale-[0.97]';
                else cls = 'bg-white/[0.03] border-white/5 opacity-40';
              }
              return (
                <button key={oIdx} onClick={() => handleAnswer(oIdx)} disabled={phase !== 'question'}
                  className={`relative p-4 sm:p-5 rounded-2xl border-2 text-white font-bold text-lg transition-all duration-200 active:scale-95 ${cls}`}
                  style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  <span className="absolute top-2 left-3 text-xs text-white/30 font-mono">{String.fromCharCode(65 + oIdx)}</span>
                  {opt}
                  {phase === 'feedback' && oIdx === q.correctIndex && <span className="absolute top-2 right-3 text-green-400 text-sm">✓</span>}
                  {phase === 'feedback' && oIdx === selected && oIdx !== q.correctIndex && <span className="absolute top-2 right-3 text-red-400 text-sm">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Timeout message */}
          {phase === 'feedback' && selected === null && (
            <div className="text-center mt-4">
              <span className="text-red-400 font-medium animate-pulse">⏰ Waktu habis! Jawaban: <span className="text-green-400">{q.options[q.correctIndex]}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
