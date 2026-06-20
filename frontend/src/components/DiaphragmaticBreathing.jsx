import BasePractice from './BasePractice';

function DiaphragmaticBreathing({ methods, saveHistory, setIsSessionActive }) {
  return (
    <BasePractice
      selectedMethod="deepBelly"
      methods={methods}
      saveHistory={saveHistory}
      setIsSessionActive={setIsSessionActive}
    />
  );
}

export default DiaphragmaticBreathing;
