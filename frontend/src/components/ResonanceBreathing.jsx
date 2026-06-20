import BasePractice from './BasePractice';

function ResonanceBreathing({ methods, saveHistory, setIsSessionActive }) {
  return (
    <BasePractice
      selectedMethod="resonance"
      methods={methods}
      saveHistory={saveHistory}
      setIsSessionActive={setIsSessionActive}
    />
  );
}

export default ResonanceBreathing;
