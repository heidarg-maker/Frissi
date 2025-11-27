import React, { useState, useEffect } from 'react';
import { generateRiddle, validateRiddleAnswer } from '../services/gemini';
import { Brain, Search, Loader2 } from 'lucide-react';

interface RiddleChallengeProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const RiddleChallenge: React.FC<RiddleChallengeProps> = ({ onComplete, onSkip }) => {
  const [riddle, setRiddle] = useState<{ question: string; hint: string } | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchRiddle = async () => {
      setLoading(true);
      const data = await generateRiddle();
      setRiddle(data);
      setLoading(false);
    };
    fetchRiddle();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riddle || !input.trim()) return;

    setChecking(true);
    const isCorrect = await validateRiddleAnswer(riddle.question, input);
    setChecking(false);

    if (isCorrect) {
      setFeedback('success');
      setTimeout(onComplete, 1500);
    } else {
      setFeedback('error');
      // Clear error after 2 seconds
      setTimeout(() => setFeedback('idle'), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-slate-400 animate-pulse">Afkóða innihald skáps...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display text-amber-500 tracking-wider">LYKILORÐ ÖRYGGISSKÁPSINS</h2>
        <p className="text-sm text-gray-400">
          Öryggisskápurinn er raddstýrður. Leystu gátuna til að opna hann.
        </p>
      </div>

      <div className="w-full bg-slate-800 p-8 rounded-lg shadow-xl border-l-4 border-amber-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Brain size={120} />
        </div>
        
        <h3 className="text-lg text-gray-200 font-serif leading-relaxed mb-6 relative z-10">
          "{riddle?.question}"
        </h3>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hver/Hvað er ég?"
              disabled={feedback === 'success' || checking}
              className={`
                w-full bg-slate-900 border-2 rounded-md py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all
                ${feedback === 'error' ? 'border-red-500 animate-shake' : 'border-slate-700'}
                ${feedback === 'success' ? 'border-green-500 text-green-400' : ''}
              `}
            />
            <button
              type="submit"
              disabled={checking || !input.trim() || feedback === 'success'}
              className="absolute right-2 top-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-amber-500 disabled:opacity-50 transition-colors"
            >
              {checking ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </div>
          
          {feedback === 'error' && (
             <p className="text-red-400 text-sm font-mono text-center">AÐGANGI HAFNAÐ. REYNDU AFTUR.</p>
          )}
          {feedback === 'success' && (
             <p className="text-green-400 text-sm font-mono text-center">AÐGANGUR VEITTUR. OPNA...</p>
          )}
        </form>
      </div>

      <button 
        onClick={onSkip}
        className="text-xs text-red-900 hover:text-red-700 underline"
      >
        [DEV] Framhjá öryggiskerfi
      </button>
    </div>
  );
};