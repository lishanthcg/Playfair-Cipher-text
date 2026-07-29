import React from 'react';
import { motion } from 'motion/react';
import { MatrixCell, PlayfairStep } from '../types';
import { Key, Grid } from 'lucide-react';

interface MatrixGridProps {
  cells: MatrixCell[];
  activeStep?: PlayfairStep | null;
  keyword: string;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({ cells, activeStep, keyword }) => {
  // Check if cell is pos1, pos2, newPos1, or newPos2 in activeStep
  const isPos1 = (r: number, c: number) => activeStep && activeStep.pos1.row === r && activeStep.pos1.col === c;
  const isPos2 = (r: number, c: number) => activeStep && activeStep.pos2.row === r && activeStep.pos2.col === c;
  const isNewPos1 = (r: number, c: number) => activeStep && activeStep.newPos1.row === r && activeStep.newPos1.col === c;
  const isNewPos2 = (r: number, c: number) => activeStep && activeStep.newPos2.row === r && activeStep.newPos2.col === c;

  // Check if cell is inside rule region
  const isInRuleRegion = (r: number, c: number) => {
    if (!activeStep) return false;
    const { pos1, pos2, rule } = activeStep;

    if (rule === 'same_row') {
      return r === pos1.row;
    }
    if (rule === 'same_column') {
      return c === pos1.col;
    }
    if (rule === 'rectangle') {
      const minRow = Math.min(pos1.row, pos2.row);
      const maxRow = Math.max(pos1.row, pos2.row);
      const minCol = Math.min(pos1.col, pos2.col);
      const maxCol = Math.max(pos1.col, pos2.col);
      return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
    }
    return false;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Grid Container */}
      <div className="relative p-3 sm:p-4 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 bg-slate-900/5 dark:bg-slate-900/40 w-full max-w-md shadow-xl">
        {/* Top Header info */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <Grid className="w-4 h-4 text-cyan-500" />
            <span>5×5 Playfair Matrix</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Keyword
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Alphabet
            </span>
          </div>
        </div>

        {/* 5x5 Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {cells.map((cell) => {
            const pos1 = isPos1(cell.row, cell.col);
            const pos2 = isPos2(cell.row, cell.col);
            const newPos1 = isNewPos1(cell.row, cell.col);
            const newPos2 = isNewPos2(cell.row, cell.col);
            const inRegion = isInRuleRegion(cell.row, cell.col);

            // Determine styling priority
            let bgClass = 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100';

            if (pos1 && newPos1 && pos1 === newPos1) {
              // Same cell input/output
              bgClass = 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white font-extrabold border-cyan-300 active-cell-pulse shadow-lg';
            } else if (pos1) {
              bgClass = 'bg-cyan-500 text-white font-extrabold border-cyan-400 active-cell-pulse shadow-lg shadow-cyan-500/30';
            } else if (pos2) {
              bgClass = 'bg-purple-600 text-white font-extrabold border-purple-400 active-cell-pulse shadow-lg shadow-purple-500/30';
            } else if (newPos1) {
              bgClass = 'bg-emerald-500 text-white font-extrabold border-emerald-400 result-cell-pulse shadow-lg shadow-emerald-500/30';
            } else if (newPos2) {
              bgClass = 'bg-teal-500 text-white font-extrabold border-teal-400 result-cell-pulse shadow-lg shadow-teal-500/30';
            } else if (inRegion) {
              bgClass = 'bg-indigo-500/15 dark:bg-indigo-500/25 border-indigo-400/50 text-indigo-900 dark:text-indigo-200';
            } else if (cell.isFromKey) {
              bgClass = 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/30 text-amber-900 dark:text-amber-200';
            }

            return (
              <motion.div
                key={`${cell.row}-${cell.col}`}
                whileHover={{ scale: 1.05 }}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center font-mono text-base sm:text-lg transition-all duration-300 cursor-default group select-none ${bgClass}`}
              >
                {/* Cell Letter */}
                <span className="font-bold tracking-wider">
                  {cell.letter}
                  {cell.letter === 'I' && (
                    <span className="text-[9px] opacity-70 block -mt-1 font-sans">I/J</span>
                  )}
                </span>

                {/* Badges for active step */}
                {pos1 && (
                  <span className="absolute -top-1.5 -left-1.5 px-1 py-0.2 rounded bg-cyan-600 text-white text-[9px] font-sans font-bold shadow">
                    P1
                  </span>
                )}
                {pos2 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded bg-purple-700 text-white text-[9px] font-sans font-bold shadow">
                    P2
                  </span>
                )}
                {newPos1 && !pos1 && (
                  <span className="absolute -bottom-1.5 -left-1.5 px-1 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-sans font-bold shadow">
                    R1
                  </span>
                )}
                {newPos2 && !pos2 && (
                  <span className="absolute -bottom-1.5 -right-1.5 px-1 py-0.2 rounded bg-teal-600 text-white text-[9px] font-sans font-bold shadow">
                    R2
                  </span>
                )}

                {/* Keyword indicator icon */}
                {cell.isFromKey && !pos1 && !pos2 && !newPos1 && !newPos2 && (
                  <span className="absolute top-1 right-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Key className="w-2.5 h-2.5 text-amber-500" />
                  </span>
                )}

                {/* Coordinate badge on hover */}
                <span className="absolute bottom-1 text-[9px] opacity-0 group-hover:opacity-80 transition-opacity font-sans text-slate-500 dark:text-slate-400">
                  ({cell.row + 1},{cell.col + 1})
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Legend Footnote */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <span>Note: 'I' and 'J' share the same cell.</span>
          {activeStep && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-medium text-cyan-600 dark:text-cyan-400">
                <span className="w-2 h-2 rounded bg-cyan-500"></span> Input
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded bg-emerald-500"></span> Output
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
