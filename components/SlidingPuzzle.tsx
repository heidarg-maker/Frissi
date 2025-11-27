import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, CheckCircle, RefreshCcw } from 'lucide-react';

interface SlidingPuzzleProps {
  onComplete: () => void;
  onSkip: () => void;
}

const GRID_SIZE = 3;

export const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ onComplete, onSkip }) => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  // Initialize and shuffle
  const initializeGame = useCallback(() => {
    // Start with solved state: 1, 2, 3, 4, 5, 6, 7, 8, 0 (0 is empty)
    let newTiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (i + 1) % (GRID_SIZE * GRID_SIZE));
    
    // Random valid moves to shuffle (ensures solvability)
    let emptyIdx = newTiles.indexOf(0);
    let previousIdx = -1;
    
    for (let i = 0; i < 150; i++) {
      const neighbors = [];
      const row = Math.floor(emptyIdx / GRID_SIZE);
      const col = emptyIdx % GRID_SIZE;

      if (row > 0) neighbors.push(emptyIdx - GRID_SIZE);
      if (row < GRID_SIZE - 1) neighbors.push(emptyIdx + GRID_SIZE);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < GRID_SIZE - 1) neighbors.push(emptyIdx + 1);

      // Don't undo the immediate last move to ensure better mixing
      const validNeighbors = neighbors.filter(n => n !== previousIdx);
      const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      
      [newTiles[emptyIdx], newTiles[randomNeighbor]] = [newTiles[randomNeighbor], newTiles[emptyIdx]];
      previousIdx = emptyIdx;
      emptyIdx = randomNeighbor;
    }
    
    setTiles(newTiles);
    setIsSolved(false);
  }, []);

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleTileClick = (index: number) => {
    if (isSolved) return;

    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIdx / GRID_SIZE);
    const emptyCol = emptyIdx % GRID_SIZE;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
      setTiles(newTiles);
      checkWin(newTiles);
    }
  };

  const checkWin = (currentTiles: number[]) => {
    const isWin = currentTiles.every((val, index) => {
      if (index === currentTiles.length - 1) return val === 0;
      return val === index + 1;
    });

    if (isWin) {
      setIsSolved(true);
      setTimeout(onComplete, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display text-amber-500 tracking-wider">EVIDENCE RECONSTRUCTION</h2>
        <p className="text-sm text-gray-400 max-w-md">
          The crime scene photo was shredded. Slide the pieces to restore the correct sequence (1-8).
        </p>
      </div>

      <div className="relative p-2 bg-slate-800 rounded-lg shadow-2xl border-2 border-slate-700">
        <div 
          className="grid gap-1 bg-slate-900 p-1 rounded"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {tiles.map((tile, index) => (
            <button
              key={`${index}-${tile}`}
              onClick={() => handleTileClick(index)}
              disabled={isSolved && tile !== 0}
              className={`
                w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-3xl font-bold rounded
                transition-all duration-200 transform
                ${tile === 0 
                  ? 'bg-transparent cursor-default' 
                  : isSolved 
                    ? 'bg-green-600 text-green-100' 
                    : 'bg-slate-700 text-amber-500 hover:bg-slate-600 border border-slate-600 shadow-lg active:scale-95'
                }
              `}
            >
              {tile !== 0 && (
                <span className="font-display drop-shadow-md">{tile}</span>
              )}
            </button>
          ))}
        </div>
        {isSolved && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg backdrop-blur-sm">
            <div className="bg-slate-900 p-6 rounded-xl border border-green-500 flex flex-col items-center animate-bounce-in">
              <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
              <span className="text-green-400 font-bold tracking-widest">MATCH CONFIRMED</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={initializeGame}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded transition-colors"
        >
          <RefreshCcw size={16} /> Reset
        </button>
        <button 
          onClick={onSkip}
          className="text-xs text-red-900 hover:text-red-700 underline"
        >
          [DEV] Skip Puzzle
        </button>
      </div>
    </div>
  );
};