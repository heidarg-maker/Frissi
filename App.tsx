import React, { useState } from 'react';
import { ChallengeStatus, ChallengeType, GameState } from './types';
import { SlidingPuzzle } from './components/SlidingPuzzle';
import { RiddleChallenge } from './components/RiddleChallenge';
import { MouseMaze } from './components/MouseMaze';
import { VideoIntro } from './components/VideoIntro';
import { Lock, Unlock, CheckCircle2, Map, Grid3X3, BrainCircuit, ShieldCheck, QrCode, PlayCircle } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    puzzle: ChallengeStatus.ACTIVE,
    riddle: ChallengeStatus.LOCKED,
    maze: ChallengeStatus.LOCKED
  });

  const [activeTab, setActiveTab] = useState<ChallengeType | 'REWARD'>(ChallengeType.PUZZLE);

  const completeChallenge = (type: ChallengeType) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      if (type === ChallengeType.PUZZLE) {
        newState.puzzle = ChallengeStatus.COMPLETED;
        // Don't unlock Riddle yet, go to Video
        setActiveTab(ChallengeType.VIDEO);
      } else if (type === ChallengeType.VIDEO) {
        // Video watched, unlock Riddle
        newState.riddle = ChallengeStatus.ACTIVE;
        setActiveTab(ChallengeType.RIDDLE);
      } else if (type === ChallengeType.RIDDLE) {
        newState.riddle = ChallengeStatus.COMPLETED;
        newState.maze = ChallengeStatus.ACTIVE;
        setActiveTab(ChallengeType.MAZE);
      } else if (type === ChallengeType.MAZE) {
        newState.maze = ChallengeStatus.COMPLETED;
        setActiveTab('REWARD');
      }
      return newState;
    });
  };

  const getStatusIcon = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.LOCKED: return <Lock size={16} className="text-gray-500" />;
      case ChallengeStatus.ACTIVE: return <Unlock size={16} className="text-amber-500 animate-pulse" />;
      case ChallengeStatus.COMPLETED: return <CheckCircle2 size={16} className="text-green-500" />;
    }
  };

  const renderContent = () => {
    if (activeTab === 'REWARD' && gameState.maze === ChallengeStatus.COMPLETED) {
      return (
        <div className="flex flex-col items-center justify-center space-y-8 py-12 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-display text-green-500 tracking-widest">MÁLI LOKIÐ</h2>
            <p className="text-gray-400">Allar öryggisráðstafanir hafa verið gerðar óvirkar.</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-2xl shadow-green-900/50 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative bg-white p-2 rounded">
              {/* Dynamic QR code linking to the requested URL */}
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ibb.co/7JPPvb4Z" 
                alt="Reward QR Code" 
                className="w-48 h-48"
              />
            </div>
          </div>
          
          <div className="text-center p-4 border border-green-900/30 bg-green-900/10 rounded-lg max-w-md">
            <p className="font-mono text-green-400 text-sm">
              &gt;&gt; NIÐURHALI_LOKIÐ<br/>
              &gt;&gt; STAÐA_ÚTSENDARA: STAÐFEST
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case ChallengeType.PUZZLE:
        return <SlidingPuzzle onComplete={() => completeChallenge(ChallengeType.PUZZLE)} onSkip={() => completeChallenge(ChallengeType.PUZZLE)} />;
      case ChallengeType.VIDEO:
        return <VideoIntro onComplete={() => completeChallenge(ChallengeType.VIDEO)} />;
      case ChallengeType.RIDDLE:
        return <RiddleChallenge onComplete={() => completeChallenge(ChallengeType.RIDDLE)} onSkip={() => completeChallenge(ChallengeType.RIDDLE)} />;
      case ChallengeType.MAZE:
        return <MouseMaze onComplete={() => completeChallenge(ChallengeType.MAZE)} onSkip={() => completeChallenge(ChallengeType.MAZE)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1012] text-slate-200 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#151618] p-4 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-amber-600" size={28} />
          <div>
            <h1 className="text-xl font-display font-bold text-slate-100 tracking-wider">HRAFNTINNU DULMÁLIÐ</h1>
            <p className="text-xs text-slate-500 font-mono">MÁLSKJAL #892-ALPHA</p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-xs text-slate-500 uppercase tracking-widest">Öryggisstig</div>
          <div className="text-amber-600 font-bold">HÁLEYNIGT</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">
        
        {/* Sidebar / Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
          <div className="bg-[#1a1c1e] border border-slate-800 rounded-lg p-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
              Öryggisþrep
            </h3>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab(ChallengeType.PUZZLE)}
                disabled={gameState.puzzle === ChallengeStatus.LOCKED}
                className={`w-full flex items-center justify-between p-3 rounded text-left transition-all duration-200 border-l-2
                  ${activeTab === ChallengeType.PUZZLE 
                    ? 'bg-slate-800 border-amber-500 text-amber-500' 
                    : 'border-transparent hover:bg-slate-800 text-slate-400'}
                  ${gameState.puzzle === ChallengeStatus.LOCKED ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <Grid3X3 size={18} />
                  <span className="font-bold text-sm">Þrep 01</span>
                </div>
                {getStatusIcon(gameState.puzzle)}
              </button>

              {/* Explicit Video Step in Navigation (Optional, or just hidden) */}
              {activeTab === ChallengeType.VIDEO && (
                 <button
                 className="w-full flex items-center justify-between p-3 rounded text-left transition-all duration-200 border-l-2 bg-slate-800 border-amber-500 text-amber-500"
               >
                 <div className="flex items-center gap-3">
                   <PlayCircle size={18} />
                   <span className="font-bold text-sm">Skilaboð</span>
                 </div>
                 <Unlock size={16} className="text-amber-500 animate-pulse" />
               </button>
              )}

              <button
                onClick={() => setActiveTab(ChallengeType.RIDDLE)}
                disabled={gameState.riddle === ChallengeStatus.LOCKED}
                className={`w-full flex items-center justify-between p-3 rounded text-left transition-all duration-200 border-l-2
                  ${activeTab === ChallengeType.RIDDLE 
                    ? 'bg-slate-800 border-amber-500 text-amber-500' 
                    : 'border-transparent hover:bg-slate-800 text-slate-400'}
                  ${gameState.riddle === ChallengeStatus.LOCKED ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <BrainCircuit size={18} />
                  <span className="font-bold text-sm">Þrep 02</span>
                </div>
                {getStatusIcon(gameState.riddle)}
              </button>

              <button
                onClick={() => setActiveTab(ChallengeType.MAZE)}
                disabled={gameState.maze === ChallengeStatus.LOCKED}
                className={`w-full flex items-center justify-between p-3 rounded text-left transition-all duration-200 border-l-2
                  ${activeTab === ChallengeType.MAZE 
                    ? 'bg-slate-800 border-amber-500 text-amber-500' 
                    : 'border-transparent hover:bg-slate-800 text-slate-400'}
                  ${gameState.maze === ChallengeStatus.LOCKED ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <Map size={18} />
                  <span className="font-bold text-sm">Þrep 03</span>
                </div>
                {getStatusIcon(gameState.maze)}
              </button>
              
              {gameState.maze === ChallengeStatus.COMPLETED && (
                <button
                  onClick={() => setActiveTab('REWARD')}
                  className={`w-full flex items-center justify-between p-3 rounded text-left transition-all duration-200 border-l-2 mt-4
                    ${activeTab === 'REWARD'
                      ? 'bg-green-900/20 border-green-500 text-green-500' 
                      : 'border-transparent hover:bg-green-900/10 text-green-600'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <QrCode size={18} />
                    <span className="font-bold text-sm">GÖGNIN</span>
                  </div>
                  <Unlock size={16} />
                </button>
              )}
            </nav>
          </div>

          <div className="bg-[#1a1c1e] border border-slate-800 rounded-lg p-4 shadow-xl">
             <div className="flex justify-between text-xs text-slate-500 mb-2">
               <span>FRAMVUNDA AFKÓÐUNAR</span>
               <span>{
                 Object.values(gameState).filter(s => s === ChallengeStatus.COMPLETED).length
               }/3</span>
             </div>
             <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
               <div 
                 className="bg-amber-600 h-full transition-all duration-500 ease-out"
                 style={{ width: `${(Object.values(gameState).filter(s => s === ChallengeStatus.COMPLETED).length / 3) * 100}%` }}
               />
             </div>
          </div>
        </aside>

        {/* Game Area */}
        <section className="flex-1 bg-[#1a1c1e] border border-slate-800 rounded-lg shadow-2xl p-6 min-h-[500px] flex items-center justify-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-900/50 to-transparent"></div>
          <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
            <ShieldCheck size={200} />
          </div>

          <div className="w-full max-w-3xl relative z-10">
            {renderContent()}
          </div>
        </section>

      </main>
    </div>
  );
}