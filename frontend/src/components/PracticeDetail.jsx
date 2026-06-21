import { useState } from 'react';
import { Wind, Square, Maximize2, Waves, Bell, Sparkles, ArrowRight, Clock, BookOpen, Heart, Moon, Info } from 'lucide-react';
import { Button, Modal } from './common';

const METHOD_ICONS = {
  '478': Moon,
  'box': Square,
  'completeBreath': Maximize2,
  'resonance': Waves,
  'aum': Bell,
  'chakraAscent': Sparkles
};

const METHOD_BENEFITS = {
  '478': 'Specifically designed to trigger the parasympathetic nervous system, act as a natural nervous system tranquilizer, and assist with falling asleep.',
  'box': 'Designed to clear the mind, settle the nervous system, and heighten concentration. Widely utilized by Navy SEALs for stress management.',
  'completeBreath': 'Designed to maximize lung capacity, increase oxygenation in the bloodstream, and establish deep diaphragmatic control.',
  'resonance': 'Designed to balance the autonomic nervous system, reduce biological anxiety metrics, and establish heart rate coherence.',
  'aum': 'Combines controlled exhalation with sound vibrations to stimulate the vagus nerve and induce deep mental tranquility.',
  'chakraAscent': 'Designed to observe and dismantle cravings, overthinking, anxiety, or procrastination in real time.'
};

function PracticeDetail({ selectedMethod, methods, onStart }) {
  const method = methods[selectedMethod];
  const [showInfo, setShowInfo] = useState(false);

  if (!method) return null;

  const IconComponent = METHOD_ICONS[selectedMethod] || Wind;
  const benefitText = METHOD_BENEFITS[selectedMethod] || 'Focus on your breath and find your center.';

  // Format pattern text
  const getPatternText = () => {
    if (selectedMethod === 'chakraAscent') {
      return 'Sequentially breathe through 7 energy centers with slow 5s inhale/exhale pacing.';
    }
    if (selectedMethod === 'aum') {
      return 'Breathe in for 4s, then chant A-U-M sequentially on the exhale.';
    }
    const pattern = method.pattern || [4, 4, 4, 4];
    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    return pattern
      .map((val, idx) => val > 0 ? `${phases[idx]}: ${val}s` : null)
      .filter(Boolean)
      .join(' • ');
  };

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-fadeIn max-w-xl mx-auto py-6 text-center">
      {/* Visual Header */}
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center animate-pulse">
          <IconComponent className="text-accent w-8 h-8" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-thin tracking-widest text-text uppercase">
            {method.name}
          </h1>
          <button 
            onClick={() => setShowInfo(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-dim hover:text-text transition-all cursor-pointer shrink-0"
            title="View Instructions"
          >
            <Info size={20} className="md:size-[24px]" />
          </button>
        </div>
        <p className="text-dim font-light text-base md:text-lg leading-relaxed max-w-sm mx-auto">
          {method.description}
        </p>
      </div>

      {/* Info Cards (Pacing & Benefits) */}
      <div className="w-full flex flex-col gap-3 text-left">
        <div className="flex items-start gap-4 p-4 rounded-squircle-sm bg-white/[0.02] border border-white/5">
          <Clock className="text-accent w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="block text-[0.65rem] uppercase tracking-widest text-dim/60 font-semibold mb-1">Pattern & Pacing</span>
            <p className="text-xs text-dim font-light leading-relaxed">
              {getPatternText()}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-squircle-sm bg-white/[0.02] border border-white/5">
          <Heart className="text-accent w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="block text-[0.65rem] uppercase tracking-widest text-dim/60 font-semibold mb-1">Focus & Benefit</span>
            <p className="text-xs text-dim font-light leading-relaxed">
              {benefitText}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Button 
          onClick={onStart}
          variant="primary"
          size="none"
          className="w-full py-5 text-base tracking-widest uppercase font-medium"
        >
          <span>Begin Session</span>
          <ArrowRight size={18} />
        </Button>
      </div>

      {/* Modal containing instructions */}
      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        maxWidth="md"
        backdropBlur="none"
      >
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
            <BookOpen className="text-accent" size={24} />
            <h2 className="text-xl font-light tracking-wide">{method.name} Instructions</h2>
          </div>
          <ul className="text-sm text-dim font-light leading-relaxed list-disc list-inside space-y-3">
            {method.steps && method.steps.map((step, idx) => (
              <li key={idx} className="pl-2 -indent-5">{step}</li>
            ))}
          </ul>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowInfo(false)} variant="secondary" size="sm">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PracticeDetail;
