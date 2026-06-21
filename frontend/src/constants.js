export const INITIAL_METHODS = {
  box: { 
    name: 'Box Breathing', 
    category: 'Focus',
    pattern: [4, 4, 4, 4],
    description: 'A powerful stress-reliever used by Navy SEALs. It involves four equal steps of breathing, holding, and exhaling.',
    steps: [
      'Exhale all air from your lungs through your nose.',
      'Inhale slowly through your nose for 4 seconds.',
      'Hold your breath for 4 seconds.',
      'Exhale slowly through your nose for 4 seconds.',
      'Hold your breath again for 4 seconds.'
    ]
  },
  chakraAscent: { 
    name: 'Chakra Ascent', 
    category: 'Spirit',
    pattern: [0, 0, 0, 0],
    description: 'A guided meditation journey through the seven energy centers (chakras) to balance the mind and body.',
    steps: [
      'Focus on the Muladhara (Root) chakra at the base of the spine.',
      'Breathe deeply while chanting the seed mantra (LAM).',
      'Reflect on stabilization questions to ground yourself.',
      'Ascend step-by-step through all seven chakras to the Sahasrara (Crown).'
    ]
  },
  '478': { 
    name: '4-7-8 Breathing', 
    category: 'Sleep',
    pattern: [4, 7, 8, 0],
    description: 'A natural tranquilizer for the nervous system. Developed by Dr. Andrew Weil, it is excellent for falling asleep.',
    steps: [
      'Exhale completely through your nose.',
      'Close your mouth and inhale quietly through your nose for 4 seconds.',
      'Hold your breath for 7 seconds.',
      'Exhale completely through your nose for 8 seconds.'
    ]
  },
  completeBreath: {
    name: 'The Complete Breath',
    category: 'Vitality',
    pattern: [5, 3, 6, 0],
    description: 'A foundational practice that fills the entire lungs. It involves a smooth sweep from the diaphragm to the collar-bone.',
    steps: [
      'Get into position: Stand or sit erect.',
      'Inhale (5 seconds): Breathing through the nostrils, inhale steadily. First, fill the lower part of the lungs by bringing the diaphragm into play, pushing forward the abdomen.',
      'Next, fill the middle part of the lungs by pushing out the lower ribs and chest.',
      'Finally, fill the higher portion of the lungs by protruding the upper chest. Make it one smooth, 5-second sweep.',
      'Hold (3 seconds): Retain the breath, keeping your chest expanded.',
      'Exhale (6 seconds): Exhale quite slowly, drawing the abdomen in a little as the air leaves.',
      'Relax: When the air is entirely exhaled, relax your chest and abdomen completely.'
    ],
    guidance: [
      'Inhale: Fill lower, middle, then higher lungs in one smooth sweep.',
      'Hold: Retain the breath, keeping your chest expanded.',
      'Exhale: Release slowly, drawing the abdomen in slightly.',
      'Relax: Let your chest and abdomen relax completely.'
    ]
  },
  resonance: {
    name: 'Resonance Breathing',
    category: 'Balance',
    pattern: [5, 0, 5, 0],
    description: 'Breathing at a rate of 5-6 breaths per minute to balance the autonomic nervous system and reduce anxiety.',
    steps: [
      'Inhale for 5 seconds.',
      'Exhale for 5 seconds.',
      'Focus on a smooth transition between inhale and exhale.',
      'Allow your breath to be gentle and effortless.'
    ]
  },
  aum: {
    name: 'Aum Chanting',
    category: 'Vibration',
    pattern: [4, 4, 4, 5],
    phases: ['Inhale', 'Aaa', 'Uuu', 'Mmmm'],
    description: 'Combines controlled exhalation with sound vibrations to stimulate the vagus nerve and calm the mind.',
    steps: [
      'Inhale deeply through your nose.',
      'Exhale making the "Aaa" sound, feeling vibrations in your stomach.',
      'Transition to the "Uuu" sound, feeling vibrations in your throat.',
      'Finish with the "Mmmm" sound, feeling vibrations in your head.',
      'Inhale and repeat.'
    ],
    guidance: [
      'Breathe in deeply through your nose.',
      'Creates vibrations in your stomach and chest.',
      'Creates vibrations in your throat.',
      'Creates vibrations in your brain and nasal cavity.'
    ]
  }
};

export const THEMES = {
  noir: {
    name: 'Simple grayscale',
    colors: {
      bg: '#0a0a0a',
      accent: '#cccccc',
      indicator: '#eaeaea',
      glass: '#161616',
      text: '#dddddd',
      secondary: '#242424',
      dim: '#8c8c8c',
      cooldown: '#7a7a7a',
      sidebarBg: 'rgba(22, 22, 22, 0.65)',
      sidebarBlur: '20px',
      sidebarBorder: 'rgba(255, 255, 255, 0.05)',
      mobileNavBg: 'rgba(22, 22, 22, 0.65)',
      mobileNavBlur: '24px',
      mobileNavBorder: 'rgba(255, 255, 255, 0.05)'
    }
  },
  mint: {
    name: 'Mint (Fresh)',
    colors: {
      bg: '#051410',
      accent: '#42f5ad',
      indicator: '#00ffa3',
      glass: '#0D1412',
      text: '#E0FFF4',
      secondary: '#101a15',
      dim: '#80A396',
      cooldown: '#2dd4bf',
      sidebarBg: 'rgba(255, 255, 255, 0.08)',
      sidebarBlur: '20px',
      sidebarBorder: 'rgba(255, 255, 255, 0.1)',
      mobileNavBg: 'rgba(255, 255, 255, 0.08)',
      mobileNavBlur: '24px',
      mobileNavBorder: 'rgba(255, 255, 255, 0.1)'
    }
  },
  coder: {
    name: 'Coder (Synth)',
    colors: {
      bg: '#11121C',
      accent: '#FF98A4',
      indicator: '#C099FF',
      glass: '#1A1C29',
      text: '#FFFFFF',
      secondary: '#2D304A',
      dim: '#65BCFF',
      cooldown: '#65BCFF',
      sidebarBg: '#1A1C29',
      sidebarBlur: '0px',
      sidebarBorder: '#2D304A',
      mobileNavBg: '#1A1C29',
      mobileNavBlur: '0px',
      mobileNavBorder: '#2D304A'
    }
  }
};
