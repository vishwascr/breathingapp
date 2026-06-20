import BasePractice from './BasePractice';

function CompleteBreath({ methods, saveHistory, setIsSessionActive }) {
  return (
    <BasePractice
      selectedMethod="completeBreath"
      methods={methods}
      saveHistory={saveHistory}
      setIsSessionActive={setIsSessionActive}
    />
  );
}

export default CompleteBreath;
