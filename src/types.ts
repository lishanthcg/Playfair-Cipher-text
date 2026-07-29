export type CipherMode = 'encrypt' | 'decrypt';

export interface MatrixCell {
  letter: string;
  row: number;
  col: number;
  isFromKey: boolean;
}

export interface PlayfairStep {
  stepIndex: number;
  totalSteps: number;
  originalPair: [string, string];
  transformedPair: [string, string];
  pos1: { row: number; col: number };
  pos2: { row: number; col: number };
  newPos1: { row: number; col: number };
  newPos2: { row: number; col: number };
  rule: 'same_row' | 'same_column' | 'rectangle';
  ruleTitle: string;
  description: string;
  mode: CipherMode;
}

export interface DigraphDetail {
  pair: [string, string];
  index: number;
  status: 'pending' | 'active' | 'completed';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PresetExample {
  title: string;
  keyword: string;
  plaintext: string;
  description: string;
}
