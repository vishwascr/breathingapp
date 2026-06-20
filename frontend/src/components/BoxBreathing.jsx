import BasePractice from './BasePractice';

function BoxBreathing({ methods, saveHistory, setIsSessionActive }) {
  return (
    <BasePractice
      selectedMethod="box"
      methods={methods}
      saveHistory={saveHistory}
      setIsSessionActive={setIsSessionActive}
    />
  );
}

export default BoxBreathing;
