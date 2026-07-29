import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  generatePlayfairMatrix,
  preparePlaintext,
  prepareCiphertext,
  processPlayfair,
  RANDOM_PLAINTEXTS,
  RANDOM_KEYWORDS,
} from '../utils/playfair';
import { MatrixGrid } from './MatrixGrid';
import { StepVisualizer } from './StepVisualizer';
import { useToast } from './Toast';
import { CipherMode } from '../types';
import {
  KeyRound,
  Lock,
  Unlock,
  RotateCcw,
  Copy,
  Shuffle,
  Grid,
  FileText,
  Binary,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';

interface CipherStudioProps {
  initialKeyword?: string;
  initialPlaintext?: string;
}

export const CipherStudio: React.FC<CipherStudioProps> = ({
  initialKeyword = 'MONARCHY',
  initialPlaintext = 'INSTRUMENT',
}) => {
  const { showToast } = useToast();

  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [plaintext, setPlaintext] = useState<string>(initialPlaintext);
  const [ciphertext, setCiphertext] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<CipherMode>('encrypt');

  // Animation player states
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1200);

  // Copy state icons
  const [copiedKey, setCopiedKey] = useState<'plain' | 'cipher' | 'matrix' | null>(null);

  // Generate Matrix data memoized
  const matrixData = useMemo(() => {
    return generatePlayfairMatrix(keyword || 'KEYWORD');
  }, [keyword]);

  // Prepared digraphs & logs
  const [prepLogs, setPrepLogs] = useState<string[]>([]);
  const [steps, setSteps] = useState<any[]>([]);

  // Track executed outputs for explicit summary text display
  const [lastPreparedPlaintext, setLastPreparedPlaintext] = useState<string>('IN ST RU ME NT');
  const [lastProcessedResult, setLastProcessedResult] = useState<string>('GA TL RU RE OB');
  const [lastModeExecuted, setLastModeExecuted] = useState<'encrypt' | 'decrypt' | null>('encrypt');

  // Encryption handler
  const handleEncrypt = () => {
    if (!plaintext.trim()) {
      showToast('Input Required', 'Please enter some plaintext to encrypt.', 'error');
      return;
    }

    const mData = generatePlayfairMatrix(keyword || 'KEYWORD');
    const { digraphs, prepSteps } = preparePlaintext(plaintext);

    if (digraphs.length === 0) {
      showToast('Invalid Input', 'No valid alphabetic characters found.', 'error');
      return;
    }

    const formattedPrepared = digraphs.map(([a, b]) => `${a}${b}`).join(' ');

    const { formattedResult, steps: generatedSteps } = processPlayfair(
      digraphs,
      mData,
      'encrypt'
    );

    setCiphertext(formattedResult);
    setPrepLogs(prepSteps);
    setSteps(generatedSteps);
    setCurrentMode('encrypt');
    setCurrentStepIndex(0);
    setIsPlaying(true);

    setLastPreparedPlaintext(formattedPrepared);
    setLastProcessedResult(formattedResult);
    setLastModeExecuted('encrypt');

    showToast(
      'Encrypted Successfully!',
      `Processed ${digraphs.length} pair${digraphs.length > 1 ? 's' : ''} into ciphertext.`,
      'success'
    );
  };

  // Decryption handler
  const handleDecrypt = () => {
    const textToDecrypt = ciphertext.trim() || plaintext.trim();

    if (!textToDecrypt) {
      showToast('Input Required', 'Please enter ciphertext to decrypt.', 'error');
      return;
    }

    const mData = generatePlayfairMatrix(keyword || 'KEYWORD');
    const { digraphs, prepSteps } = prepareCiphertext(textToDecrypt);

    if (digraphs.length === 0) {
      showToast('Invalid Input', 'No valid alphabetic ciphertext found.', 'error');
      return;
    }

    const formattedPreparedCipher = digraphs.map(([a, b]) => `${a}${b}`).join(' ');

    const { formattedResult, steps: generatedSteps } = processPlayfair(
      digraphs,
      mData,
      'decrypt'
    );

    setPlaintext(formattedResult);
    setPrepLogs(prepSteps);
    setSteps(generatedSteps);
    setCurrentMode('decrypt');
    setCurrentStepIndex(0);
    setIsPlaying(true);

    setLastPreparedPlaintext(formattedPreparedCipher);
    setLastProcessedResult(formattedResult);
    setLastModeExecuted('decrypt');

    showToast(
      'Decrypted Successfully!',
      `Recovered ${digraphs.length} pair${digraphs.length > 1 ? 's' : ''} from ciphertext.`,
      'success'
    );
  };

  // Generate Random Text & Keyword
  const handleGenerateRandom = () => {
    const randomText = RANDOM_PLAINTEXTS[Math.floor(Math.random() * RANDOM_PLAINTEXTS.length)];
    const randomKey = RANDOM_KEYWORDS[Math.floor(Math.random() * RANDOM_KEYWORDS.length)];
    setPlaintext(randomText);
    setKeyword(randomKey);
    setCiphertext('');
    setSteps([]);
    setPrepLogs([]);
    showToast('Generated Random Sample', `Loaded key "${randomKey}" and text sample.`, 'info');
  };

  // Clear all fields
  const handleClear = () => {
    setPlaintext('');
    setCiphertext('');
    setSteps([]);
    setPrepLogs([]);
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setLastPreparedPlaintext('');
    setLastProcessedResult('');
    setLastModeExecuted(null);
    showToast('Cleared All Fields', 'Form inputs and animation state reset.', 'info');
  };

  // Copy helper
  const handleCopy = (type: 'plain' | 'cipher' | 'matrix') => {
    let textToCopy = '';
    if (type === 'plain') textToCopy = plaintext;
    if (type === 'cipher') textToCopy = ciphertext;
    if (type === 'matrix') {
      textToCopy = matrixData.matrix.map((row) => row.join(' ')).join('\n');
    }

    if (!textToCopy) {
      showToast('Nothing to Copy', 'Field is currently empty.', 'error');
      return;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('Copied to Clipboard!', `Copied ${type} text successfully.`, 'success');
  };

  const activeStep = steps[currentStepIndex] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Keyword Input Card */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-500" />
                <span>Keyword (5×5 Matrix Generator)</span>
              </label>

              <button
                onClick={handleGenerateRandom}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Random Sample</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                  placeholder="e.g. MONARCHY"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-sm sm:text-base font-bold tracking-widest focus:ring-2 focus:ring-cyan-500/50 focus:outline-none transition-all uppercase"
                />
              </div>

              <button
                onClick={() => {
                  showToast('Matrix Regenerated', `Updated 5x5 grid with keyword "${keyword || 'KEYWORD'}".`, 'info');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all shrink-0"
              >
                <Grid className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Generate Matrix</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Alphabet: 25 distinct letters (J replaced with I)</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                Used Key: {matrixData.keyLetters.size} unique chars
              </span>
            </div>
          </div>

          {/* Plaintext & Ciphertext Textareas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Plaintext Input Box */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Plaintext</span>
                </label>
                <button
                  onClick={() => handleCopy('plain')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Copy Plaintext"
                >
                  {copiedKey === 'plain' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <textarea
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value.toUpperCase())}
                placeholder="Enter plaintext here..."
                rows={4}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm uppercase tracking-wide focus:ring-2 focus:ring-indigo-500/50 focus:outline-none resize-none flex-1"
              />

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>{plaintext.replace(/[^A-Z]/gi, '').length} Characters</span>
                <span>{Math.ceil(plaintext.replace(/[^A-Z]/gi, '').length / 2)} Digraphs</span>
              </div>
            </div>

            {/* Ciphertext Output Box */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Ciphertext</span>
                </label>
                <button
                  onClick={() => handleCopy('cipher')}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Copy Ciphertext"
                >
                  {copiedKey === 'cipher' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <textarea
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value.toUpperCase())}
                placeholder="Ciphertext will appear here..."
                rows={4}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm uppercase tracking-wide focus:ring-2 focus:ring-cyan-500/50 focus:outline-none resize-none flex-1"
              />

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>{ciphertext.replace(/[^A-Z]/gi, '').length} Characters</span>
                <button
                  onClick={() => handleCopy('matrix')}
                  className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Matrix
                </button>
              </div>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleEncrypt}
              className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>Encrypt Text</span>
            </button>

            <button
              onClick={handleDecrypt}
              className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-98"
            >
              <Unlock className="w-4 h-4" />
              <span>Decrypt Text</span>
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              title="Reset all fields"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          {/* Generated Plaintext & Output Results Display */}
          {lastModeExecuted && (
            <div className="glass-panel rounded-2xl p-4 border border-indigo-500/30 dark:border-cyan-500/30 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {lastModeExecuted === 'encrypt' ? 'Encryption Process Summary' : 'Decryption Process Summary'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-cyan-300 border border-indigo-500/20">
                  {lastModeExecuted === 'encrypt' ? 'Plaintext → Ciphertext' : 'Ciphertext → Plaintext'}
                </span>
              </div>

              {lastModeExecuted === 'encrypt' ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">
                      Plaintext Generated After Encryption Formatting (Prepared Digraphs):
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 text-amber-300 font-mono font-bold tracking-widest border border-slate-800 select-all">
                      {lastPreparedPlaintext || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">
                      Encrypted Ciphertext Result:
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 text-cyan-400 font-mono font-bold tracking-widest border border-slate-800 select-all">
                      {lastProcessedResult || 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">
                      Input Ciphertext Processed:
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 text-cyan-300 font-mono font-bold tracking-widest border border-slate-800 select-all">
                      {lastPreparedPlaintext || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">
                      Decrypted Plaintext Result (Generated from Ciphertext):
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 text-emerald-400 font-mono font-bold tracking-widest border border-slate-800 select-all">
                      {lastProcessedResult || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preparation Log List */}
          {prepLogs.length > 0 && (
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-500" />
                <span>Text Preparation Log</span>
              </h4>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono list-disc list-inside">
                {prepLogs.map((log, index) => (
                  <li key={index}>{log}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: 5x5 Matrix Display */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <MatrixGrid cells={matrixData.cells} activeStep={activeStep} keyword={keyword} />
        </div>
      </div>

      {/* Step Visualizer Section */}
      <StepVisualizer
        steps={steps}
        currentStepIndex={currentStepIndex}
        setCurrentStepIndex={setCurrentStepIndex}
        mode={currentMode}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speedMs={speedMs}
        setSpeedMs={setSpeedMs}
      />
    </div>
  );
};
