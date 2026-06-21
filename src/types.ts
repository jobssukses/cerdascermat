export interface CustomQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  timeLimit: number; // seconds
}

export interface QuestionBank {
  id: string;
  name: string;
  description: string;
  questions: CustomQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface GameResult {
  playerName: string;
  bankName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  maxStreak: number;
  date: string;
  avgTime: number;
}

export type AppScreen = 'menu' | 'editor' | 'select' | 'playing' | 'result';
