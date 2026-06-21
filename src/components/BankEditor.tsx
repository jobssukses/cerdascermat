import { useState, useRef } from 'react';
import { QuestionBank, CustomQuestion } from '../types';
import { generateId } from '../storage';
import { sfx } from '../useSound';

interface Props {
  bank: QuestionBank | null;
  onSave: (bank: QuestionBank) => void;
  onCancel: () => void;
}

function emptyQuestion(): CustomQuestion {
  return { id: generateId(), question: '', options: ['', '', '', ''], correctIndex: 0, category: '', timeLimit: 15 };
}

export default function BankEditor({ bank, onSave, onCancel }: Props) {
  const isNew = !bank;
  const [name, setName] = useState(bank?.name ?? '');
  const [description, setDescription] = useState(bank?.description ?? '');
  const [questions, setQuestions] = useState<CustomQuestion[]>(bank?.questions ?? [emptyQuestion()]);
  const [editingIdx, setEditingIdx] = useState<number | null>(isNew ? 0 : null);
  const [errors, setErrors] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const updateQuestion = (idx: number, patch: Partial<CustomQuestion>) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, ...patch } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[oIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const addQuestion = () => {
    const nq = emptyQuestion();
    setQuestions(qs => [...qs, nq]);
    setEditingIdx(questions.length);
    sfx.click();
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const removeQuestion = (idx: number) => {
    sfx.click();
    setQuestions(qs => qs.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
    else if (editingIdx !== null && editingIdx > idx) setEditingIdx(editingIdx - 1);
  };

  const duplicateQuestion = (idx: number) => {
    sfx.click();
    const dup = { ...questions[idx], id: generateId() };
    const nq = [...questions];
    nq.splice(idx + 1, 0, dup);
    setQuestions(nq);
    setEditingIdx(idx + 1);
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    sfx.click();
    const ni = idx + dir;
    if (ni < 0 || ni >= questions.length) return;
    const nq = [...questions];
    [nq[idx], nq[ni]] = [nq[ni], nq[idx]];
    setQuestions(nq);
    if (editingIdx === idx) setEditingIdx(ni);
    else if (editingIdx === ni) setEditingIdx(idx);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Nama bank soal harus diisi');
    if (questions.length === 0) errs.push('Minimal 1 soal');
    questions.forEach((q, i) => {
      if (!q.question.trim()) errs.push(`Soal #${i + 1}: pertanyaan kosong`);
      if (q.options.some(o => !o.trim())) errs.push(`Soal #${i + 1}: semua opsi harus diisi`);
      const unique = new Set(q.options.map(o => o.trim().toLowerCase()));
      if (unique.size !== q.options.length) errs.push(`Soal #${i + 1}: opsi tidak boleh duplikat`);
    });
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);

    const now = new Date().toISOString();
    const saved: QuestionBank = {
      id: bank?.id ?? generateId(),
      name: name.trim(),
      description: description.trim(),
      questions,
      createdAt: bank?.createdAt ?? now,
      updatedAt: now,
    };
    sfx.correct();
    onSave(saved);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { sfx.click(); onCancel(); }}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <span className="text-xl">←</span><span className="text-sm font-medium">Kembali</span>
          </button>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {isNew ? '📝 Buat Bank Soal' : '✏️ Edit Bank Soal'}
          </h1>
          <div className="w-20" />
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-5">
            {errors.map((e, i) => <p key={i} className="text-red-300 text-sm">⚠️ {e}</p>)}
          </div>
        )}

        {/* Bank Info */}
        <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/10 mb-5 space-y-4">
          <div>
            <label className="block text-sm text-purple-300 font-medium mb-1.5">Nama Bank Soal *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Matematika Kelas 6"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm text-purple-300 font-medium mb-1.5">Deskripsi</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi singkat (opsional)"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-all" />
          </div>
        </div>

        {/* Questions list */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            📋 Daftar Soal ({questions.length})
          </h2>
          <button onClick={addQuestion}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95">
            ＋ Tambah Soal
          </button>
        </div>

        <div ref={listRef} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 pb-4">
          {questions.map((q, idx) => (
            <div key={q.id}
              className={`rounded-2xl border transition-all ${editingIdx === idx ? 'bg-white/[0.12] border-purple-400/40 shadow-lg shadow-purple-500/10' : 'bg-white/[0.05] border-white/10 hover:border-white/20'}`}>
              
              {/* Question header - always visible */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => { sfx.click(); setEditingIdx(editingIdx === idx ? null : idx); }}>
                <span className="text-white/30 text-sm font-mono w-6 shrink-0 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`truncate font-medium ${q.question ? 'text-white' : 'text-white/30 italic'}`}>
                    {q.question || 'Pertanyaan belum diisi...'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {q.category && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{q.category}</span>}
                    <span className="text-xs text-white/30">⏱️ {q.timeLimit}s</span>
                    <span className="text-xs text-green-400/60">✓ {q.options[q.correctIndex] || '?'}</span>
                  </div>
                </div>
                <span className={`text-white/40 transition-transform ${editingIdx === idx ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {/* Expanded edit form */}
              {editingIdx === idx && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                  {/* Question text */}
                  <div>
                    <label className="block text-xs text-purple-300 font-medium mb-1">Pertanyaan *</label>
                    <input value={q.question} onChange={e => updateQuestion(idx, { question: e.target.value })}
                      placeholder="Contoh: 25 × 4 = ?"
                      className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-purple-400 transition-all text-sm" />
                  </div>

                  {/* Row: category + time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-purple-300 font-medium mb-1">Kategori</label>
                      <input value={q.category} onChange={e => updateQuestion(idx, { category: e.target.value })}
                        placeholder="Contoh: Perkalian"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-purple-400 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-300 font-medium mb-1">Waktu (detik)</label>
                      <input type="number" value={q.timeLimit} min={5} max={120}
                        onChange={e => updateQuestion(idx, { timeLimit: Math.max(5, Math.min(120, Number(e.target.value) || 15)) })}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white focus:outline-none focus:border-purple-400 transition-all text-sm" />
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-xs text-purple-300 font-medium mb-2">Pilihan Jawaban * (klik radio untuk jawaban benar)</label>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <button onClick={() => { sfx.click(); updateQuestion(idx, { correctIndex: oIdx }); }}
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all text-xs
                              ${q.correctIndex === oIdx ? 'border-green-400 bg-green-500/30 text-green-300' : 'border-white/20 text-white/30 hover:border-white/40'}`}>
                            {q.correctIndex === oIdx ? '✓' : String.fromCharCode(65 + oIdx)}
                          </button>
                          <input value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)}
                            placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}`}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm text-white placeholder-white/25 focus:outline-none transition-all
                              ${q.correctIndex === oIdx ? 'bg-green-500/10 border-green-500/30 focus:border-green-400' : 'bg-white/10 border-white/15 focus:border-purple-400'}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white/50 hover:text-white text-xs disabled:opacity-30 transition-all">↑ Naik</button>
                    <button onClick={() => moveQuestion(idx, 1)} disabled={idx === questions.length - 1}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white/50 hover:text-white text-xs disabled:opacity-30 transition-all">↓ Turun</button>
                    <button onClick={() => duplicateQuestion(idx)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-blue-300/70 hover:text-blue-300 text-xs transition-all">📋 Duplikat</button>
                    <div className="flex-1" />
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(idx)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300/70 hover:text-red-300 text-xs transition-all">🗑️ Hapus</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-indigo-950 via-indigo-950/95 to-transparent mt-4">
          <div className="flex gap-3">
            <button onClick={() => { sfx.click(); onCancel(); }}
              className="flex-1 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-white font-semibold hover:bg-white/15 transition-all active:scale-[0.98]">
              Batal
            </button>
            <button onClick={handleSave}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all"
              style={{ fontFamily: 'Fredoka, sans-serif' }}>
              💾 Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
