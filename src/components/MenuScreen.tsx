import { QuestionBank, GameResult } from '../types';
import { getResults, clearResults } from '../storage';
import { sfx } from '../useSound';
import { useState } from 'react';

interface Props {
  banks: QuestionBank[];
  onPlay: () => void;
  onEditBank: (bank: QuestionBank | null) => void;
  onDeleteBank: (id: string) => void;
  onImportTemplate: (bank: QuestionBank) => void;
  templates: QuestionBank[];
  onAdmin: () => void;
}

export default function MenuScreen({ banks, onPlay, onEditBank, onDeleteBank, onImportTemplate, templates, onAdmin }: Props) {
  const [tab, setTab] = useState<'banks' | 'history' | 'templates'>('banks');
  const [results, setResults] = useState<GameResult[]>(getResults());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-[0.07] animate-pulse"
            style={{ width: `${40 + Math.random() * 120}px`, height: `${40 + Math.random() * 120}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: `hsl(${220 + Math.random() * 120},70%,60%)`, animationDelay: `${Math.random() * 4}s`, animationDuration: `${2 + Math.random() * 3}s` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 mb-4 text-5xl select-none">🧮</div>
          <h1 className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>Cerdas Cermat</h1>
          <p className="text-purple-300 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>Buat Soalmu Sendiri!</p>
        </div>

        {/* Start Quiz Button */}
        <button onClick={() => { sfx.click(); onPlay(); }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mb-4"
          style={{ fontFamily: 'Fredoka, sans-serif' }}>
          🚀 Mulai Kuis
        </button>

        {/* Admin Button */}
        <button onClick={() => { sfx.click(); onAdmin(); }}
          className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-medium text-sm hover:bg-white/10 hover:text-white/70 hover:border-white/20 transition-all mb-6"
          style={{ fontFamily: 'Fredoka, sans-serif' }}>
          🛡️ Admin Panel
        </button>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-2xl p-1 mb-5">
          {([['banks', '📚 Bank Soal'], ['templates', '📦 Template'], ['history', '📊 Riwayat']] as const).map(([key, label]) => (
            <button key={key} onClick={() => { sfx.click(); setTab(key as any); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-white/15 text-white shadow' : 'text-white/50 hover:text-white/80'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Bank Soal Tab */}
        {tab === 'banks' && (
          <div className="space-y-3">
            <button onClick={() => { sfx.click(); onEditBank(null); }}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-white/20 text-white/60 hover:border-purple-400 hover:text-purple-300 hover:bg-white/5 transition-all text-lg font-medium">
              ＋ Buat Bank Soal Baru
            </button>

            {banks.length === 0 && (
              <div className="text-center py-10 text-white/30">
                <div className="text-5xl mb-3">📭</div>
                <p>Belum ada bank soal.</p>
                <p className="text-sm mt-1">Buat baru atau import dari template!</p>
              </div>
            )}

            {banks.map(bank => (
              <div key={bank.id} className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { sfx.click(); onEditBank(bank); }}>
                    <h3 className="text-white font-bold text-lg truncate group-hover:text-purple-300 transition-colors">{bank.name}</h3>
                    <p className="text-white/40 text-sm mt-1 line-clamp-2">{bank.description || 'Tidak ada deskripsi'}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full">{bank.questions.length} soal</span>
                      <span className="text-xs text-white/30">{new Date(bank.updatedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => { sfx.click(); onEditBank(bank); }}
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-500/30 text-white/50 hover:text-blue-300 flex items-center justify-center transition-all text-sm" title="Edit">✏️</button>
                    {deleteConfirm === bank.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { sfx.click(); onDeleteBank(bank.id); setDeleteConfirm(null); }}
                          className="w-9 h-9 rounded-xl bg-red-500/30 text-red-300 flex items-center justify-center text-sm hover:bg-red-500/50 transition-all">✓</button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="w-9 h-9 rounded-xl bg-white/10 text-white/50 flex items-center justify-center text-sm hover:bg-white/20 transition-all">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { sfx.click(); setDeleteConfirm(bank.id); }}
                        className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/30 text-white/50 hover:text-red-300 flex items-center justify-center transition-all text-sm" title="Hapus">🗑️</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Tab */}
        {tab === 'templates' && (
          <div className="space-y-3">
            <p className="text-white/40 text-sm text-center mb-2">Import template soal siap pakai ke bank soal kamu</p>
            {templates.map(t => {
              const alreadyImported = banks.some(b => b.id === t.id);
              return (
                <div key={t.id} className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <h3 className="text-white font-bold text-lg">{t.name}</h3>
                  <p className="text-white/40 text-sm mt-1">{t.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">{t.questions.length} soal</span>
                    {alreadyImported ? (
                      <span className="text-xs text-green-400">✅ Sudah diimport</span>
                    ) : (
                      <button onClick={() => { sfx.click(); onImportTemplate(t); }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95">
                        📥 Import
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-center py-10 text-white/30">
                <div className="text-5xl mb-3">📊</div>
                <p>Belum ada riwayat permainan.</p>
              </div>
            ) : (
              <>
                <button onClick={() => { clearResults(); setResults([]); sfx.click(); }}
                  className="w-full py-2 text-sm text-red-400/60 hover:text-red-400 transition-colors">
                  🗑️ Hapus Semua Riwayat
                </button>
                {results.map((r, i) => (
                  <div key={i} className="bg-white/[0.07] rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{r.playerName}</p>
                        <p className="text-white/40 text-xs mt-0.5">{r.bankName} • {r.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold text-xl">{r.score}</p>
                        <p className="text-white/40 text-xs">{r.correctAnswers}/{r.totalQuestions} benar</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
