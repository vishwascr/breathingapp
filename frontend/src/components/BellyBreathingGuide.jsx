function BellyBreathingGuide() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-extralight mb-2 tracking-tight">Adham Pranayama</h1>
        <h2 className="text-2xl font-light text-accent tracking-wide">Breathing Guide</h2>
        <p className="text-dim text-sm uppercase tracking-[0.2rem] mt-4 font-medium">Indian Yogic Tradition of Abdominal Breathing</p>
      </header>

      <div className="flex flex-col gap-10">
        <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-squircle-lg p-6 md:p-10 shadow-xl">
          <h3 className="text-xs uppercase tracking-[0.2rem] text-dim mb-8 font-medium border-b border-white/5 pb-4">Step-by-Step Procedure</h3>
          <ol className="flex flex-col gap-8 list-none p-0 m-0">
            {[
              { title: 'Preparation & Posture', text: 'Find a comfortable seated position (like Sukhasana or Vajrasana) with a straight spine. You can also lie down in Shavasana.' },
              { title: 'Hand Placement', text: 'Place one hand on your upper chest and the other on your abdomen, just below the rib cage near the navel.' },
              { title: 'Inhalation (Puraka)', text: 'Inhale slowly and deeply through your nose. Send the air deep into the lower lungs. Your abdomen should expand outward, pushing your hand up. The chest should remain relatively still.' },
              { title: 'Exhalation (Rechaka)', text: 'Exhale slowly through your nose. Feel your abdominal muscles contract as the navel moves back toward the spine.' },
              { title: 'Rhythm', text: 'Maintain a steady, rhythmic pace (e.g., 4 seconds in, 4 seconds out).' }
            ].map((step, i) => (
              <li key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start group">
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-squircle-md bg-accent/20 text-accent font-light text-lg border border-accent/10 group-hover:bg-accent group-hover:text-bg transition-all duration-300">
                  {i + 1}
                </span>
                <div>
                  <strong className="block text-xl font-light mb-2 text-text">{step.title}</strong>
                  <p className="text-text/70 font-light leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white/5 border border-white/10 rounded-squircle-lg p-8 hover:bg-white/10 transition-all">
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim mb-6 font-medium">Benefits</h3>
            <ul className="flex flex-col gap-4 list-none p-0 m-0">
              {[
                'Activates the parasympathetic nervous system (stress reduction).',
                'Maximizes use of lower lung capacity for efficient gas exchange.',
                'Massages internal organs for better digestion.'
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-text/80 font-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-indicator"></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-squircle-lg p-8">
            <h3 className="text-xs uppercase tracking-[0.2rem] text-dim mb-6 font-medium">Sources</h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0 text-sm font-light text-dim/60">
              <li>Yoga Journal: <em>Diaphragmatic Breathing Deconstructed</em></li>
              <li>Himalayan Institute: <em>Foundation for Pranayama</em></li>
              <li>Cleveland Clinic: <em>Diaphragmatic Breathing Technique</em></li>
              <li>Tummee: <em>Adham Pranayama Steps and Benefits</em></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BellyBreathingGuide;
