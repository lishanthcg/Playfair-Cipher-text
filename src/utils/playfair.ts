import { CipherMode, MatrixCell, PlayfairStep } from '../types';

/**
 * Generate 5x5 Playfair Matrix from a keyword.
 * Replaces 'J' with 'I', removes duplicates, and fills remainder with alphabet.
 */
export function generatePlayfairMatrix(keyword: string): {
  matrix: string[][];
  cells: MatrixCell[];
  posMap: Record<string, { row: number; col: number }>;
  keyLetters: Set<string>;
} {
  const cleanKey = keyword
    .toUpperCase()
    .replace(/J/g, 'I')
    .replace(/[^A-Z]/g, '');

  const keyLetters = new Set<string>();
  const matrixLetters: string[] = [];

  // Add unique letters from keyword
  for (const char of cleanKey) {
    if (!keyLetters.has(char)) {
      keyLetters.add(char);
      matrixLetters.push(char);
    }
  }

  // Fill in rest of alphabet (skipping 'J')
  for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    if (char === 'J') continue;
    if (!keyLetters.has(char)) {
      matrixLetters.push(char);
    }
  }

  // Construct 5x5 grid
  const matrix: string[][] = [];
  const cells: MatrixCell[] = [];
  const posMap: Record<string, { row: number; col: number }> = {};

  for (let row = 0; row < 5; row++) {
    const rowArray: string[] = [];
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      const letter = matrixLetters[index];
      rowArray.push(letter);

      const isFromKey = keyLetters.has(letter);
      cells.push({ letter, row, col, isFromKey });
      posMap[letter] = { row, col };
    }
    matrix.push(rowArray);
  }

  return { matrix, cells, posMap, keyLetters };
}

/**
 * Prepare plaintext by converting to uppercase, replacing J with I,
 * breaking into digraphs, inserting 'X' for duplicates, and padding odd length.
 */
export function preparePlaintext(text: string): {
  cleanText: string;
  digraphs: [string, string][];
  prepSteps: string[];
} {
  const prepSteps: string[] = [];
  let upper = text.toUpperCase();

  if (upper.includes('J')) {
    prepSteps.push("Replaced all occurrences of 'J' with 'I'.");
    upper = upper.replace(/J/g, 'I');
  }

  // Filter non A-Z
  const sanitized = upper.replace(/[^A-Z]/g, '');
  if (sanitized !== upper) {
    prepSteps.push('Removed non-alphabetic characters and spaces.');
  }

  const digraphs: [string, string][] = [];
  let i = 0;

  let insertedFillersCount = 0;
  while (i < sanitized.length) {
    const char1 = sanitized[i];
    if (i + 1 < sanitized.length) {
      const char2 = sanitized[i + 1];
      if (char1 === char2) {
        // Insert filler 'X' (or 'Q' if char1 is 'X')
        const filler = char1 === 'X' ? 'Q' : 'X';
        digraphs.push([char1, filler]);
        prepSteps.push(`Split repeated '${char1}${char2}' by inserting filler '${filler}'.`);
        insertedFillersCount++;
        i += 1; // move to next letter
      } else {
        digraphs.push([char1, char2]);
        i += 2;
      }
    } else {
      // Single trailing character, add filler
      const filler = char1 === 'X' ? 'Q' : 'X';
      digraphs.push([char1, filler]);
      prepSteps.push(`Appended filler '${filler}' to pair trailing single letter '${char1}'.`);
      i += 1;
    }
  }

  if (digraphs.length === 0) {
    prepSteps.push('No valid alphabetic characters found.');
  } else {
    const formattedDigraphs = digraphs.map(([a, b]) => `${a}${b}`).join(' ');
    prepSteps.push(`Formed ${digraphs.length} digraph pair${digraphs.length > 1 ? 's' : ''}: [ ${formattedDigraphs} ]`);
  }

  const cleanText = digraphs.map(([a, b]) => `${a}${b}`).join('');

  return { cleanText, digraphs, prepSteps };
}

/**
 * Prepare ciphertext for decryption.
 */
export function prepareCiphertext(text: string): {
  cleanText: string;
  digraphs: [string, string][];
  prepSteps: string[];
} {
  const prepSteps: string[] = [];
  let upper = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');

  if (upper.length % 2 !== 0) {
    upper += 'X';
    prepSteps.push("Appended filler 'X' because ciphertext character count was odd.");
  }

  const digraphs: [string, string][] = [];
  for (let i = 0; i < upper.length; i += 2) {
    digraphs.push([upper[i], upper[i + 1]]);
  }

  const formattedDigraphs = digraphs.map(([a, b]) => `${a}${b}`).join(' ');
  prepSteps.push(`Parsed ${digraphs.length} ciphertext pair${digraphs.length > 1 ? 's' : ''}: [ ${formattedDigraphs} ]`);

  return { cleanText: upper, digraphs, prepSteps };
}

/**
 * Execute Playfair Encryption or Decryption step-by-step.
 */
export function processPlayfair(
  digraphs: [string, string][],
  matrixData: ReturnType<typeof generatePlayfairMatrix>,
  mode: CipherMode
): {
  resultText: string;
  formattedResult: string;
  steps: PlayfairStep[];
} {
  const { matrix, posMap } = matrixData;
  const steps: PlayfairStep[] = [];
  let resultText = '';

  digraphs.forEach((pair, index) => {
    let [c1, c2] = pair;
    if (!posMap[c1]) c1 = 'I';
    if (!posMap[c2]) c2 = 'I';

    const pos1 = posMap[c1];
    const pos2 = posMap[c2];

    let newPos1: { row: number; col: number };
    let newPos2: { row: number; col: number };
    let rule: 'same_row' | 'same_column' | 'rectangle';
    let ruleTitle: string;
    let description: string;

    if (pos1.row === pos2.row) {
      // Same Row Rule
      rule = 'same_row';
      ruleTitle = 'Same Row Rule';
      const shift = mode === 'encrypt' ? 1 : 4; // +1 or -1 (+4 mod 5)
      newPos1 = { row: pos1.row, col: (pos1.col + shift) % 5 };
      newPos2 = { row: pos2.row, col: (pos2.col + shift) % 5 };

      const dir = mode === 'encrypt' ? 'right' : 'left';
      description = `'${c1}' and '${c2}' are in the same row (${pos1.row + 1}). Shift both 1 position ${dir} (wrapping around if needed).`;
    } else if (pos1.col === pos2.col) {
      // Same Column Rule
      rule = 'same_column';
      ruleTitle = 'Same Column Rule';
      const shift = mode === 'encrypt' ? 1 : 4; // +1 or -1 (+4 mod 5)
      newPos1 = { row: (pos1.row + shift) % 5, col: pos1.col };
      newPos2 = { row: (pos2.row + shift) % 5, col: pos2.col };

      const dir = mode === 'encrypt' ? 'down' : 'up';
      description = `'${c1}' and '${c2}' are in the same column (${pos1.col + 1}). Shift both 1 position ${dir} (wrapping around if needed).`;
    } else {
      // Rectangle Rule
      rule = 'rectangle';
      ruleTitle = 'Rectangle Corner Rule';
      // Swap columns (same row, opposite corner)
      newPos1 = { row: pos1.row, col: pos2.col };
      newPos2 = { row: pos2.row, col: pos1.col };

      description = `'${c1}' at (${pos1.row + 1},${pos1.col + 1}) and '${c2}' at (${pos2.row + 1},${pos2.col + 1}) form a rectangle. Replace with opposite corners in the same row.`;
    }

    const res1 = matrix[newPos1.row][newPos1.col];
    const res2 = matrix[newPos2.row][newPos2.col];

    resultText += res1 + res2;

    steps.push({
      stepIndex: index + 1,
      totalSteps: digraphs.length,
      originalPair: [c1, c2],
      transformedPair: [res1, res2],
      pos1,
      pos2,
      newPos1,
      newPos2,
      rule,
      ruleTitle,
      description,
      mode,
    });
  });

  const formattedResult = resultText.match(/.{1,2}/g)?.join(' ') || resultText;

  return { resultText, formattedResult, steps };
}

/**
 * Sample Preset Keywords & Plaintexts for instant testing.
 */
export const SAMPLE_PRESETS = [
  {
    title: 'Monarchy Classic',
    keyword: 'MONARCHY',
    plaintext: 'INSTRUMENT',
    description: 'The iconic textbook example demonstrating Playfair matrix layout and rectangle swaps.',
  },
  {
    title: 'Secret Mission',
    keyword: 'CRYPTOGRAPHY',
    plaintext: 'MEET ME AT THE BRIDGE AT MIDNIGHT',
    description: 'Demonstrates letter repetition handling (EE -> EX) and filler insertion.',
  },
  {
    title: 'Wheatstone Legacy',
    keyword: 'WHEATSTONE',
    plaintext: 'THE QUICK BROWN FOX JUMPS OVER LAZY DOG',
    description: 'Includes rare letters and J replacement (J -> I).',
  },
  {
    title: 'Cyber Security',
    keyword: 'CYBERSECURITY',
    plaintext: 'ENCRYPT ALL SENSITIVE MESSAGES NOW',
    description: 'Modern military style communication cipher test.',
  },
];

export const RANDOM_PLAINTEXTS = [
  'MEET ME AT THE SECRET BRIDGE AT MIDNIGHT',
  'HIDE THE GOLD IN THE TREE STUMP',
  'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
  'ATTACK AT DAWN WITH FULL FORCE',
  'PLAYFAIR CIPHER IS A CLASSIC MANUAL SUBSTITUTION CIPHER',
  'SEND REINFORCEMENTS IMMEDIATELY',
  'SWORD AND SHIELD DEFEND THE CASTLE',
  'TOP SECRET CODEWORDS ARE CHANGED DAILY',
];

export const RANDOM_KEYWORDS = [
  'MONARCHY',
  'KEYWORD',
  'SECRET',
  'CRYPTOGRAPHY',
  'PLAYFAIR',
  'CYBERSECURITY',
  'SECURITY',
  'ENIGMA',
  'MATRIX',
  'WHEATSTONE',
];
