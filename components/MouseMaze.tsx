import React, { useState, useRef, useEffect } from 'react';
import { MousePointer2, AlertTriangle, Flag } from 'lucide-react';

interface MouseMazeProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const MouseMaze: React.FC<MouseMazeProps> = ({ onComplete, onSkip }) => {
  const [gameState, setGameState] = useState<'IDLE' | 'ACTIVE' | 'WON' | 'LOST'>('IDLE');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartEnter = () => {
    if (gameState !== 'WON') {
      setGameState('ACTIVE');
    }
  };

  const handlePathLeave = () => {
    if (gameState === 'ACTIVE') {
      setGameState('LOST');
    }
  };

  const handleFinishEnter = () => {
    if (gameState === 'ACTIVE') {
      setGameState('WON');
      setTimeout(onComplete, 1000);
    }
  };

  const resetGame = () => {
    setGameState('IDLE');
  };

  // SVG Path for the "Safe Zone"
  // It's a winding path. We use a thick stroke for the safe area.
  // The 'd' attribute defines the maze corridor.
  const pathD = "M 50 250 L 150 250 L 150 100 L 300 100 L 300 200 L 200 200 L 200 300 L 400 300 L 400 50 L 550 50 L 550 250";

  return (
    <div className="flex flex-col items-center space-y-6 select-none">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display text-amber-500 tracking-wider">LASER GRID NAVIGATION</h2>
        <p className="text-sm text-gray-400">
          Guide your cursor through the secure channel. Do not touch the walls.
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative bg-slate-900 rounded-lg shadow-2xl overflow-hidden border-2 border-slate-700"
        style={{ width: 600, height: 400 }}
        onMouseLeave={() => {
            // If they leave the entire game area while active, they lose
            if (gameState === 'ACTIVE') setGameState('LOST');
        }}
      >
        {/* Background Pattern (Hazards) */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <svg width="600" height="400" className="absolute inset-0 pointer-events-none">
           {/* Visual Guide for the Path */}
           <path 
             d={pathD} 
             fill="none" 
             stroke="#334155" 
             strokeWidth="50" 
             strokeLinecap="round"
             strokeLinejoin="round"
           />
           {/* The actual hitbox for the maze path - If we LEAVE this, we die. 
               Wait, MouseLeave on the path is tricky because if you move too fast you might skip events.
               Better approach: The Background is the "Lava". The Path is safe.
               So the container has onMouseEnter = Lose. The Path has onMouseEnter = Safe? 
               
               Let's try standard approach:
               1. Container background is LAVA.
               2. Path is SAFE.
               
               If user is on Container but NOT on Path, they lose.
               
               Events propagate. 
               Inner Path onMouseEnter -> setSafe(true)
               Inner Path onMouseLeave -> setSafe(false) (which means we are now on container)
               Container onMouseMove -> if (!safe) lose.
           */}
        </svg>

        {/* 
            Implementation Strategy for Robustness:
            We render the maze walls as SVG polygons or paths that trigger 'LOSE'.
            The safe path is the empty space, or vice versa.
            
            Easiest: 
            The safe path is a distinct SVG element. 
            We use `onMouseEnter` on the safe path to stay alive? No.
            
            Let's inverse: 
            The PATH is an element. If you leave the PATH element, you lose.
            We add `pointer-events-auto` to the path and `onMouseLeave` handler.
        */}

        <svg width="600" height="400" className="absolute inset-0">
          {/* The Safe Path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="transparent" 
            strokeWidth="40" /* Slightly smaller than visual to be strict */
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-crosshair pointer-events-auto outline-none"
            onMouseEnter={() => {
                // If we enter the path from the void (impossible logically if start is inside)
                // Just keeping track
            }}
            onMouseLeave={handlePathLeave}
          />
          
          {/* Start Point */}
          <circle cx="50" cy="250" r="20" fill={gameState === 'ACTIVE' ? '#10b981' : '#3b82f6'} className="pointer-events-auto cursor-pointer" onMouseEnter={handleStartEnter} />
          <text x="50" y="250" textAnchor="middle" dy="5" fontSize="10" fill="white" fontWeight="bold" className="pointer-events-none">START</text>

          {/* End Point */}
          <circle cx="550" cy="250" r="20" fill={gameState === 'WON' ? '#10b981' : '#ef4444'} className="pointer-events-auto" onMouseEnter={handleFinishEnter} />
          <text x="550" y="250" textAnchor="middle" dy="5" fontSize="10" fill="white" fontWeight="bold" className="pointer-events-none">END</text>
        </svg>

        {/* Overlay for Game States */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
            <div className="bg-slate-800 p-4 rounded border border-blue-500 text-blue-200 flex items-center gap-2">
              <MousePointer2 className="animate-bounce" />
              <span>Hover over START to begin</span>
            </div>
          </div>
        )}

        {gameState === 'LOST' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md z-20">
            <AlertTriangle size={64} className="text-red-200 mb-4 animate-pulse" />
            <h3 className="text-3xl font-bold text-white mb-4 font-display">ALARM TRIGGERED</h3>
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-red-100 text-red-900 font-bold rounded hover:bg-white transition-colors"
            >
              RETRY
            </button>
          </div>
        )}

        {gameState === 'WON' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/80 backdrop-blur-md z-20">
             <Flag size={64} className="text-green-200 mb-4" />
             <h3 className="text-3xl font-bold text-white mb-2 font-display">SYSTEM BYPASSED</h3>
          </div>
        )}
      </div>

       <button 
        onClick={onSkip}
        className="text-xs text-red-900 hover:text-red-700 underline"
      >
        [DEV] Teleport to Exit
      </button>
    </div>
  );
};