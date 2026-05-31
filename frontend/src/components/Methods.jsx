import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Quote as QuoteIcon } from 'lucide-react';

function Methods({ methods, selectedMethod, onMethodChange }) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-2xl py-8 px-4 animate-fadeIn">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-thin tracking-tight mb-4">Breathing Techniques</h1>
        <p className="text-lg font-light text-dim tracking-wide">Select a method to begin your session.</p>
      </header>

      <div className="flex flex-col gap-4">
        {Object.entries(methods).map(([key, method]) => (
          <button
            key={key}
            className="w-full text-left p-6 rounded-squircle-lg border bg-white/5 border-white/10 text-text hover:bg-white/10 transition-all duration-300"
            onClick={() => {
              onMethodChange(key);
              navigate('/practice');
            }}
          >
            <div>
              <h3 className="text-xl font-medium mb-1">{method.name}</h3>
              <p className="text-sm text-dim">
                Pattern: {method.pattern.join('-')}
              </p>
            </div>
          </button>
        ))}
      </div>

      <section className="mt-12 p-8 bg-white/5 border border-white/5 rounded-squircle-lg italic text-text/60 text-center font-light leading-relaxed flex flex-col items-center gap-4">
        <QuoteIcon size={24} className="text-dim/30" />
        <p>"Breath is the bridge which connects life to consciousness, which unites your body to your thoughts."</p>
      </section>
    </div>
  );
}

export default Methods;
