import { useState, useEffect } from 'react';
import { QuestionBank, CustomQuestion } from '../types';
import { sfx } from '../useSound';

interface Props {
  banks: QuestionBank[];
  onStart: (playerName: string, selectedQuestions: CustomQuestion[], bankName: string) => void;
  onBack: () => void;
}

export default function SelectScreen({ banks, onStart, onBack }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(banks.length > 0 ? banks[0].id : null);
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set());
  const [shuffle, setShuffle] = useState(true);
  const [error, setError] = useState('');

  const selectedBank = banks.find(b => b.id === selectedBankId);
  const allQIds = selectedBank ? selectedBank.questions.map(q => q.id) : [];
  const allSelected = selectedBank ? selectedQIds.size === allQIds.length && allQIds.every(id => selectedQIds.has(id)) : false;

  const handleSelectBank = (bankId: string) => {
    sfx.click();
    setSelectedBankId(bankId);
    const bank = banks.find(b => b.id === bankId);
    if (bank) {
      setSelectedQIds(new Set(bank.questions.map(q => q.id)));
    }
  };

  const toggleQuestion = (qId: string) => {
    sfx.click();
    setSelectedQIds(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId); else next.add(qId);
      return next;
    });
  };

  const toggleAll = () => {
    sfx.click();
    if (allSelected) {
      setSelectedQIds(new Set());
    } else if (selectedBank) {
      setSelectedQIds(new Set(selectedBank.questions.map(q => q.id)));
    }
  };

  // Initialize selection when first bank selected
  useEffect(() => {
    if (selectedBank) {
      setSelectedQIds(new Set(selectedBank.questions.map(q => q.id)));
    }
  }, []);

  const handleStart = () => {
    if (!playerName.trim()) { setError('Masukkan nama pemain!'); return; }
    if (!selectedBank) { setError('Pilih bank soal!'); return; }
    if (selectedQIds.size === 0) { setError('Pilih minimal 1 soal!'); return; }
    setError('');

    let questions = selectedBank.questions.filter(q => selectedQIds.has(q.id));
    if (shuffle) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }
    sfx.start();
    onStart(playerName.trim(), questions, selectedBank.name);
  };

  if (banks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 flex items-center justify-center p-4">
        <div className="text-center bg-white/[0.07] rounded-3xl p-10 border border-white/10 max-w-md w-full">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>Belum Ada Soal</h2>
          <p className="text-white/40 mb-6">Buat bank soal terlebih dahulu atau import dari template.</p>
          <button onClick={() => { sfx.click(); onBack(); }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:shadow-lg transition-all">
            ← Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { sfx.click(); onBack(); }}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <span className="text-xl">←</span><span className="text-sm font-medium">Kembali</span>
          </button>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>🎯 Pilih Soal</h1>
          <div className="w-20" />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-300 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Player Name */}
        <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/10 mb-5">
          <label className="block text-sm text-purple-300 font-medium mb-2">👤 Nama Pemain</label>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Masukkan nama kamu..."
            maxLength={20} onKeyDown={e => e.key === 'Enter' && handleStart()}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-all" />
        </div>

        {/* Bank Selection */}
        <div className="mb-5">
          <label className="block text-sm text-purple-300 font-medium mb-2">📚 Pilih Bank Soal</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {banks.map(b => (
              <button key={b.id} onClick={() => handleSelectBank(b.id)}
                className={`shrink-0 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium
                  ${selectedBankId === b.id ? 'bg-purple-500/30 border-purple-400/50 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'}`}>
                <div className="font-semibold">{b.name}</div>
                <div className="text-xs opacity-60 mt-0.5">{b.questions.length} soal</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Selection */}
        {selectedBank && (
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/10 mb-5 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <button onClick={toggleAll}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs transition-all
                    ${allSelected ? 'bg-purple-500 border-purple-400 text-white' : 'border-white/30 text-white/30 hover:border-white/50'}`}>
                  {allSelected && '✓'}
                </button>
                <span className="text-white font-medium text-sm">Pilih Semua</span>
              </div>
              <span className="text-purple-300 text-sm">{selectedQIds.size}/{selectedBank.questions.length} dipilih</span>
            </div>

            <div className="max-h-[40vh] overflow-y-auto">
              {selectedBank.questions.map((q, idx) => {
                const checked = selectedQIds.has(q.id);
                return (
                  <div key={q.id} onClick={() => toggleQuestion(q.id)}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5
                      ${checked ? 'bg-white/[0.03]' : 'opacity-50'}`}>
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs shrink-0 transition-all
                      ${checked ? 'bg-green-500/80 border-green-400 text-white' : 'border-white/20 text-transparent'}`}>
                      ✓
                    </div>
                    <span className="text-white/30 text-xs font-mono w-5 shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{q.question}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {q.category && <span className="text-xs text-blue-300/50">{q.category}</span>}
                        <span className="text-xs text-white/20">⏱️{q.timeLimit}s</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="bg-white/[0.07] rounded-2xl p-4 border border-white/10 mb-5">
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => { sfx.click(); setShuffle(!shuffle); }}>
            <div className={`w-10 h-6 rounded-full transition-all relative ${shuffle ? 'bg-purple-500' : 'bg-white/20'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${shuffle ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-white text-sm">🔀 Acak urutan soal</span>
          </label>
        </div>

        {/* Start */}
        <button onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          style={{ fontFamily: 'Fredoka, sans-serif' }}>
          🚀 Mulai Kuis ({selectedQIds.size} soal)
        </button>
      </div>
    </div>
  );
}
