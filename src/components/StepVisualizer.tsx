import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayfairStep, CipherMode } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Rows3,
  Columns3,
  BoxSelect,
  Gauge,
} from 'lucide-react';

interface StepVisualizerProps {
  steps: PlayfairStep[];
  currentStepIndex: number;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
  mode: CipherMode;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speedMs: number;
  setSpeedMs: (speed: number) => void;
}

export const StepVisualizer: React.FC<StepVisualizerProps> = ({
  steps,
  currentStepIndex,
  setCurrentStepIndex,
  mode,
  isPlaying,
  setIsPlaying,
  speedMs,
  setSpeedMs,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && steps.length > 0) {
      timer = setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, speedMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, speedMs, setCurrentStepIndex, setIsPlaying]);

  if (steps.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800">
        <Sparkles className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-60" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Visualizer Ready</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter a keyword and text, then click <strong className="text-indigo-600 dark:text-indigo-400">Encrypt</strong> or{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">Decrypt</strong> to generate the step-by-step animation.
        </p>
      </div>
    );
  }

  const activeStep = steps[currentStepIndex] || steps[0];

  const getRuleIcon = (rule: PlayfairStep['rule']) => {
    switch (rule) {
      case 'same_row':
        return <Rows3 className="w-4 h-4 text-cyan-500" />;
      case 'same_column':
        return <Columns3 className="w-4 h-4 text-purple-500" />;
      case 'rectangle':
        return <BoxSelect className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getRuleBadgeColor = (rule: PlayfairStep['rule']) => {
    switch (rule) {
      case 'same_row':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20';
      case 'same_column':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'rectangle':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-5">
      {/* Step Progress & Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({mode === 'encrypt' ? 'Encryption' : 'Decryption'} Process)
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
            Digraph Step Animation
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-center bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Restart / First Step"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Play
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            disabled={currentStepIndex === steps.length - 1}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector Dropdown */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-300 dark:border-slate-700">
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value={2000} className="bg-slate-900 text-white">0.5x (2s)</option>
              <option value={1200} className="bg-slate-900 text-white">1.0x (1.2s)</option>
              <option value={600} className="bg-slate-900 text-white">2.0x (0.6s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrubber Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={currentStepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStepIndex(Number(e.target.value));
          }}
          className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
        />
      </div>

      {/* Digraph Sequence Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
        {steps.map((st, idx) => {
          const isActive = idx === currentStepIndex;
          const isDone = idx < currentStepIndex;

          return (
            <button
              key={st.stepIndex}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(idx);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 shrink-0 border transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                  : isDone
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>
                {st.originalPair[0]}
                {st.originalPair[1]}
              </span>
              <ArrowRight className="w-3 h-3 opacity-60" />
              <span>
                {st.transformedPair[0]}
                {st.transformedPair[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Transformation Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.stepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80 space-y-3"
        >
          {/* Pair Transformation Highlight */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {/* Rule Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRuleBadgeColor(
                  activeStep.rule
                )}`}
              >
                {getRuleIcon(activeStep.rule)}
                <span>{activeStep.ruleTitle}</span>
              </div>
            </div>

            {/* Pair Visual Transformation */}
            <div className="flex items-center gap-3 font-mono text-lg font-bold">
              <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                <span>{activeStep.originalPair[0]}</span>
                <span>{activeStep.originalPair[1]}</span>
              </span>

              <ArrowRight className="w-5 h-5 text-indigo-500 animate-pulse" />

              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <span>{activeStep.transformedPair[0]}</span>
                <span>{activeStep.transformedPair[1]}</span>
              </span>
            </div>
          </div>

          {/* Narrative Explanation */}
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {activeStep.description}
          </p>

          {/* Matrix Coordinate Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-slate-700 dark:text-slate-300">
              <span className="text-[10px] font-sans text-cyan-600 dark:text-cyan-400 font-bold block mb-0.5">
                CHARACTER 1 SHIFT:
              </span>
              <span>
                '{activeStep.originalPair[0]}' ({activeStep.pos1.row + 1},{activeStep.pos1.col + 1}) → '{activeStep.transformedPair[0]}' ({activeStep.newPos1.row + 1},{activeStep.newPos1.col + 1})
              </span>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-slate-700 dark:text-slate-300">
              <span className="text-[10px] font-sans text-purple-600 dark:text-purple-400 font-bold block mb-0.5">
                CHARACTER 2 SHIFT:
              </span>
              <span>
                '{activeStep.originalPair[1]}' ({activeStep.pos2.row + 1},{activeStep.pos2.col + 1}) → '{activeStep.transformedPair[1]}' ({activeStep.newPos2.row + 1},{activeStep.newPos2.col + 1})
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
