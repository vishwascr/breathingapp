import BasePractice from './BasePractice';

function FourSevenEightBreathing({ methods, saveHistory, setIsSessionActive }) {
  return (
    <BasePractice
      selectedMethod="478"
      methods={methods}
      saveHistory={saveHistory}
      setIsSessionActive={setIsSessionActive}
    />
  );
}

export default FourSevenEightBreathing;
