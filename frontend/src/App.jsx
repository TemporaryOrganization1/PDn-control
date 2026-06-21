import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import CheckPage from './pages/CheckPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [screen, setScreen] = useState('check');
  const [url, setUrl] = useState('');

  const startScan = (scanUrl) => {
    setUrl(scanUrl);
    setScreen('results');
  };

  const openResult = (domain) => {
    setUrl(domain);
    setScreen('results');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans">
        <Navbar screen={screen} onNavigate={setScreen} />

        <main className="max-w-6xl mx-auto py-12 px-6">
          <AnimatePresence mode="wait">
            {screen === 'check' && (
              <motion.div key="check" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckPage onStartScan={startScan} onNavigate={setScreen} />
              </motion.div>
            )}

            {screen === 'results' && (
              <motion.div key={`results-${url}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResultsPage url={url} onBack={() => setScreen('check')} />
              </motion.div>
            )}

            {screen === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfilePage onOpenResult={openResult} onNavigate={setScreen} />
              </motion.div>
            )}

            {screen === 'register' && (
              <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RegisterPage
                  onBackToLogin={() => setScreen('profile')}
                  onRegisterSuccess={() => setScreen('profile')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <div className="fixed bottom-6 right-6">
          <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <span className="font-bold">?</span>
          </button>
        </div>
      </div>
    </AuthProvider>
  );
}