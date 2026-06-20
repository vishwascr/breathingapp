import BasePractice from './BasePractice';

function AumChanting({ methods, saveHistory, setIsSessionActive }) {
  return (
    <BasePractice
      selectedMethod="aum"
      methods={methods}
      saveHistory={saveHistory}
      setIsSessionActive={setIsSessionActive}
    />
  );
}

export default AumChanting;
