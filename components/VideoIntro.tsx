import React, { useState, useEffect } from 'react';
import { Play, SkipForward, Radio, Activity, Terminal } from 'lucide-react';
import { analyzeTransmission } from '../services/gemini';

interface VideoIntroProps {
  onComplete: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [showContent, setShowContent] = useState(false);
  
  // Convert image to base64 for API
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      // Fetch the image to get blob/base64
      const response = await fetch('/frissi.png');
      
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const result = await analyzeTransmission(base64data);
        
        // Typewriter effect for result
        let i = 0;
        setAnalysisText("");
        const interval = setInterval(() => {
          setAnalysisText(result.substring(0, i + 1));
          i++;
          if (i === result.length) {
            clearInterval(interval);
            setShowContent(true);
            setAnalyzing(false);
          }
        }, 50);
      };
      
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error("Analysis failed", e);
      setAnalysisText("ERROR: IMAGE SOURCE NOT FOUND OR UNREADABLE");
      setAnalyzing(false);
      setShowContent(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-amber-500 animate-pulse mb-2">
          <Radio size={24} />
          <span className="font-mono tracking-widest uppercase">Dulkóðuð Sending Fundin</span>
        </div>
        <h2 className="text-2xl font-display text-white tracking-wider">SKILABOÐ ÚR FORTÍÐINNI</h2>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl group">
        
        {/* Static Image with CSS Animation */}
        <div className="relative w-full h-full overflow-hidden">
            <img 
            src="/frissi.png" 
            alt="Incoming Transmission"
            className="w-full h-full object-cover opacity-80 filter contrast-125 sepia-[.3] animate-pulse-slow"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = "https://placehold.co/600x400/000000/FFF?text=SIGNAL+LOST";
            }}
            />
            {/* Hologram/Glitch overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent opacity-50 animate-scan"></div>
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        </div>

        {/* Overlay UI */}
        {!showContent && !analyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
             <button 
                onClick={handleAnalyze}
                className="group relative px-8 py-4 bg-slate-800/80 border border-amber-500/50 rounded hover:bg-slate-700/90 transition-all overflow-hidden"
             >
                <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <Activity className="text-amber-500 animate-pulse" />
                    <span className="font-mono text-amber-500 font-bold">AFKÓÐA MYNDBAND (AI)</span>
                </div>
             </button>
             <p className="mt-4 text-xs font-mono text-amber-500/60">NANO BANANA MODEL DETECTED</p>
          </div>
        )}

        {/* Analysis Overlay */}
        {(analyzing || analysisText) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 border-t border-amber-500/30 font-mono text-xs text-green-400">
                <div className="flex items-center gap-2 mb-1 text-amber-500">
                    <Terminal size={12} />
                    <span className="font-bold">SYSTEM LOG:</span>
                </div>
                <p>{analysisText}{analyzing && <span className="animate-blink">_</span>}</p>
            </div>
        )}

        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] opacity-20"></div>
      </div>

      {showContent && (
        <div className="w-full bg-slate-900/80 p-6 rounded border-l-4 border-amber-600 space-y-4 animate-slide-up">
            <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase">Afritun:</h4>
                <p className="font-mono text-sm text-green-400 leading-relaxed mt-1">
                &gt; Sæll Frissi. <br/>
                &gt; Þetta ert þú úr fortíðinni.<br/>
                &gt; Ég er með skilaboð handa þér.<br/>
                &gt; Vonandi er hnéð á þér í lagi.
                </p>
            </div>
            
            <button 
                onClick={onComplete}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded transition-all active:scale-95 group shadow-lg shadow-amber-900/20"
            >
                <span>HALDA ÁFRAM Í ÞREP 02</span>
                <SkipForward size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      )}
    </div>
  );
};