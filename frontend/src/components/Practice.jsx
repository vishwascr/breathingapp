import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PracticeDetail from './PracticeDetail';
import BasePractice from './BasePractice';
const ChakraAscent = lazy(() => import('./ChakraAscent'));

const URL_TO_METHOD_KEY = {
  '4-7-8': '478',
  '478': '478',
  'box': 'box',
  'complete-breath': 'completeBreath',
  'completebreath': 'completeBreath',
  'resonance': 'resonance',
  'aum': 'aum',
  'chakra-ascent': 'chakraAscent',
  'chakraascent': 'chakraAscent'
};

function Practice({ methods, saveHistory, setIsSessionActive }) {
  const { methodKey } = useParams();
  const navigate = useNavigate();
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  const selectedMethodKey = URL_TO_METHOD_KEY[methodKey];

  useEffect(() => {
    // If no valid method, redirect to dashboard
    if (!selectedMethodKey || !methods[selectedMethodKey]) {
      navigate('/');
    }
  }, [selectedMethodKey, methods, navigate]);

  useEffect(() => {
    // Reset session started state when methodKey changes
    setIsSessionStarted(false);
  }, [methodKey]);

  if (!selectedMethodKey || !methods[selectedMethodKey]) {
    return null;
  }

  if (!isSessionStarted) {
    return (
      <PracticeDetail
        selectedMethod={selectedMethodKey}
        methods={methods}
        onStart={() => setIsSessionStarted(true)}
      />
    );
  }

  if (selectedMethodKey === 'chakraAscent') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center p-20 text-accent animate-pulse">
          Loading Chakra Ascent...
        </div>
      }>
        <ChakraAscent
          initialStage="meditating"
          setIsSessionActive={setIsSessionActive}
        />
      </Suspense>
    );
  }

  return (
    <BasePractice
      selectedMethod={selectedMethodKey}
      methods={methods}
      saveHistory={saveHistory}
      setIsSessionActive={setIsSessionActive}
    />
  );
}

export default Practice;
