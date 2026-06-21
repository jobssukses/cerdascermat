import { QuestionBank, GameResult, CustomQuestion } from './types';

const BANKS_KEY = 'cerdas-cermat-banks';
const RESULTS_KEY = 'cerdas-cermat-results';

// ===================== QUESTION BANKS =====================

export function getAllBanks(): QuestionBank[] {
  try {
    const data = localStorage.getItem(BANKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBank(bank: QuestionBank): void {
  const banks = getAllBanks();
  const idx = banks.findIndex(b => b.id === bank.id);
  if (idx >= 0) {
    banks[idx] = { ...bank, updatedAt: new Date().toISOString() };
  } else {
    banks.push(bank);
  }
  localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
}

export function deleteBank(bankId: string): void {
  const banks = getAllBanks().filter(b => b.id !== bankId);
  localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ===================== RESULTS =====================

export function getResults(): GameResult[] {
  try {
    const data = localStorage.getItem(RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: GameResult): void {
  const results = getResults();
  results.unshift(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 50)));
}

export function clearResults(): void {
  localStorage.removeItem(RESULTS_KEY);
}

// ===================== TEMPLATES =====================

export function getDefaultTemplates(): QuestionBank[] {
  const now = new Date().toISOString();

  const mathBasic: CustomQuestion[] = [
    { id: generateId(), question: '12 + 28 = ?', options: ['38', '40', '42', '30'], correctIndex: 1, category: 'Penjumlahan', timeLimit: 15 },
    { id: generateId(), question: '56 - 19 = ?', options: ['35', '37', '47', '39'], correctIndex: 1, category: 'Pengurangan', timeLimit: 15 },
    { id: generateId(), question: '7 × 8 = ?', options: ['54', '58', '56', '48'], correctIndex: 2, category: 'Perkalian', timeLimit: 15 },
    { id: generateId(), question: '144 ÷ 12 = ?', options: ['11', '12', '14', '13'], correctIndex: 1, category: 'Pembagian', timeLimit: 15 },
    { id: generateId(), question: '25 + 37 + 18 = ?', options: ['70', '80', '75', '85'], correctIndex: 1, category: 'Penjumlahan', timeLimit: 20 },
    { id: generateId(), question: '100 - 34 - 17 = ?', options: ['49', '51', '59', '41'], correctIndex: 0, category: 'Pengurangan', timeLimit: 20 },
    { id: generateId(), question: '15 × 6 = ?', options: ['80', '85', '90', '95'], correctIndex: 2, category: 'Perkalian', timeLimit: 15 },
    { id: generateId(), question: '225 ÷ 15 = ?', options: ['13', '15', '17', '25'], correctIndex: 1, category: 'Pembagian', timeLimit: 20 },
    { id: generateId(), question: '(8 + 4) × 3 = ?', options: ['36', '24', '32', '28'], correctIndex: 0, category: 'Campuran', timeLimit: 20 },
    { id: generateId(), question: '99 + 101 = ?', options: ['190', '200', '210', '198'], correctIndex: 1, category: 'Penjumlahan', timeLimit: 10 },
  ];

  const mathAdvanced: CustomQuestion[] = [
    { id: generateId(), question: '√144 = ?', options: ['11', '12', '13', '14'], correctIndex: 1, category: 'Akar', timeLimit: 15 },
    { id: generateId(), question: '2³ = ?', options: ['6', '8', '9', '12'], correctIndex: 1, category: 'Pangkat', timeLimit: 10 },
    { id: generateId(), question: '17 × 13 = ?', options: ['201', '211', '221', '231'], correctIndex: 2, category: 'Perkalian', timeLimit: 20 },
    { id: generateId(), question: '1000 - 347 = ?', options: ['653', '663', '753', '647'], correctIndex: 0, category: 'Pengurangan', timeLimit: 15 },
    { id: generateId(), question: '5! (5 faktorial) = ?', options: ['25', '60', '120', '150'], correctIndex: 2, category: 'Faktorial', timeLimit: 20 },
    { id: generateId(), question: '3² + 4² = ?', options: ['20', '25', '24', '7'], correctIndex: 1, category: 'Pangkat', timeLimit: 15 },
    { id: generateId(), question: '256 ÷ 16 = ?', options: ['14', '15', '16', '18'], correctIndex: 2, category: 'Pembagian', timeLimit: 15 },
    { id: generateId(), question: '(15 × 4) - (12 × 3) = ?', options: ['24', '20', '28', '32'], correctIndex: 0, category: 'Campuran', timeLimit: 25 },
    { id: generateId(), question: '√81 + √49 = ?', options: ['14', '16', '12', '18'], correctIndex: 1, category: 'Akar', timeLimit: 20 },
    { id: generateId(), question: '2⁴ + 3² = ?', options: ['20', '22', '25', '28'], correctIndex: 2, category: 'Pangkat', timeLimit: 20 },
    { id: generateId(), question: '78 × 12 = ?', options: ['836', '936', '946', '856'], correctIndex: 1, category: 'Perkalian', timeLimit: 25 },
    { id: generateId(), question: '1001 - 573 = ?', options: ['428', '438', '528', '448'], correctIndex: 0, category: 'Pengurangan', timeLimit: 20 },
  ];

  const pecahan: CustomQuestion[] = [
    { id: generateId(), question: '½ + ¼ = ?', options: ['¾', '½', '⅔', '⅗'], correctIndex: 0, category: 'Pecahan', timeLimit: 20 },
    { id: generateId(), question: '⅓ + ⅙ = ?', options: ['½', '⅓', '¼', '⅔'], correctIndex: 0, category: 'Pecahan', timeLimit: 20 },
    { id: generateId(), question: '¾ - ½ = ?', options: ['¼', '⅓', '½', '⅕'], correctIndex: 0, category: 'Pecahan', timeLimit: 20 },
    { id: generateId(), question: '0.5 + 0.25 = ?', options: ['0.65', '0.75', '0.70', '0.80'], correctIndex: 1, category: 'Desimal', timeLimit: 15 },
    { id: generateId(), question: '1.5 × 4 = ?', options: ['5', '5.5', '6', '6.5'], correctIndex: 2, category: 'Desimal', timeLimit: 15 },
    { id: generateId(), question: '25% dari 200 = ?', options: ['25', '40', '50', '75'], correctIndex: 2, category: 'Persentase', timeLimit: 15 },
    { id: generateId(), question: '⅖ dari 100 = ?', options: ['20', '40', '50', '25'], correctIndex: 1, category: 'Pecahan', timeLimit: 20 },
    { id: generateId(), question: '0.1 + 0.9 = ?', options: ['0.10', '0.19', '1', '1.0'], correctIndex: 2, category: 'Desimal', timeLimit: 10 },
  ];

  return [
    {
      id: 'template-basic',
      name: '📐 Matematika Dasar',
      description: 'Penjumlahan, pengurangan, perkalian, dan pembagian dasar',
      questions: mathBasic,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'template-advanced',
      name: '🧠 Matematika Lanjutan',
      description: 'Pangkat, akar, faktorial, dan operasi campuran',
      questions: mathAdvanced,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'template-pecahan',
      name: '🍕 Pecahan & Desimal',
      description: 'Soal pecahan, desimal, dan persentase',
      questions: pecahan,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
