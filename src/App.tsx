import { useState, useCallback } from 'react';
import { AppScreen, QuestionBank, CustomQuestion } from './types';
import { getAllBanks, saveBank, deleteBank, saveResult, getDefaultTemplates } from './storage';
import { saveQuizResult } from './supabase';
import MenuScreen from './components/MenuScreen';
import BankEditor from './components/BankEditor';
import SelectScreen from './components/SelectScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import AdminScreen from './components/AdminScreen';

// ⚠️ GANTI PASSWORD ADMIN SESUAI KEINGINAN ANDA
const ADMIN_PASSWORD = 'admin123';

interface GameSession {
  playerName: string;
  bankName: string;
  questions: CustomQuestion[];
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  maxStreak: number;
  avgTime: number;
}

type ExtendedScreen = AppScreen | 'admin';

export default function App() {
  const [screen, setScreen] = useState<ExtendedScreen>('menu');
  const [banks, setBanks] = useState<QuestionBank[]>(getAllBanks());
  const [editingBank, setEditingBank] = useState<QuestionBank | null | undefined>(undefined);
  const [session, setSession] = useState<GameSession>({
    playerName: '', bankName: '', questions: [], score: 0, correct: 0, wrong: 0, skipped: 0, maxStreak: 0, avgTime: 0,
  });
  const [gameKey, setGameKey] = useState(0);
  const templates = getDefaultTemplates();

  const refreshBanks = () => setBanks(getAllBanks());

  // Menu handlers
  const handlePlay = useCallback(() => setScreen('select'), []);
  const handleAdmin = useCallback(() => setScreen('admin'), []);

  const handleEditBank = useCallback((bank: QuestionBank | null) => {
    setEditingBank(bank);
    setScreen('editor');
  }, []);

  const handleDeleteBank = useCallback((id: string) => {
    deleteBank(id);
    refreshBanks();
  }, []);

  const handleImportTemplate = useCallback((bank: QuestionBank) => {
    saveBank(bank);
    refreshBanks();
  }, []);

  // Editor handlers
  const handleSaveBank = useCallback((bank: QuestionBank) => {
    saveBank(bank);
    refreshBanks();
    setScreen('menu');
  }, []);

  const handleCancelEdit = useCallback(() => {
    setScreen('menu');
  }, []);

  // Select handlers
  const handleStartGame = useCallback((playerName: string, questions: CustomQuestion[], bankName: string) => {
    setSession(s => ({ ...s, playerName, bankName, questions }));
    setGameKey(k => k + 1);
    setScreen('playing');
  }, []);

  // Game handlers
  const handleFinishGame = useCallback((score: number, correct: number, wrong: number, skipped: number, maxStreak: number, avgTime: number) => {
    setSession(s => {
      const updated = { ...s, score, correct, wrong, skipped, maxStreak, avgTime };

      // Save to local storage
      saveResult({
        playerName: updated.playerName,
        bankName: updated.bankName,
        score,
        totalQuestions: updated.questions.length,
        correctAnswers: correct,
        wrongAnswers: wrong,
        skipped,
        maxStreak,
        date: new Date().toLocaleDateString('id-ID'),
        avgTime,
      });

      // Save to Supabase (async, no await needed)
      saveQuizResult({
        player_name: updated.playerName,
        bank_name: updated.bankName,
        score,
        total_questions: updated.questions.length,
        correct_answers: correct,
        wrong_answers: wrong,
        skipped,
        max_streak: maxStreak,
        avg_time: avgTime,
      });

      return updated;
    });
    setScreen('result');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen('playing');
  }, []);

  const handleMenu = useCallback(() => {
    refreshBanks();
    setScreen('menu');
  }, []);

  return (
    <>
      {screen === 'menu' && (
        <MenuScreen
          banks={banks}
          onPlay={handlePlay}
          onEditBank={handleEditBank}
          onDeleteBank={handleDeleteBank}
          onImportTemplate={handleImportTemplate}
          templates={templates}
          onAdmin={handleAdmin}
        />
      )}
      {screen === 'editor' && (
        <BankEditor
          bank={editingBank === undefined ? null : editingBank}
          onSave={handleSaveBank}
          onCancel={handleCancelEdit}
        />
      )}
      {screen === 'select' && (
        <SelectScreen
          banks={banks}
          onStart={handleStartGame}
          onBack={handleMenu}
        />
      )}
      {screen === 'playing' && (
        <GameScreen
          key={gameKey}
          playerName={session.playerName}
          questions={session.questions}
          bankName={session.bankName}
          onFinish={handleFinishGame}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          playerName={session.playerName}
          bankName={session.bankName}
          score={session.score}
          correct={session.correct}
          wrong={session.wrong}
          skipped={session.skipped}
          maxStreak={session.maxStreak}
          total={session.questions.length}
          avgTime={session.avgTime}
          onPlayAgain={handlePlayAgain}
          onMenu={handleMenu}
        />
      )}
      {screen === 'admin' && (
        <AdminScreen
          onBack={handleMenu}
          adminPassword={ADMIN_PASSWORD}
        />
      )}
    </>
  );
}
