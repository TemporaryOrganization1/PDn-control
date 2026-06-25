import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getMe, logout as apiLogout } from './api';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import AccountPage from './pages/AccountPage';
import CheckPage from './pages/CheckPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  const [screen, setScreen] = useState('check');
  const [scan, setScan] = useState(null);
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null);

  const refreshAuth = async () => {
    try {
      const data = await getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const startScan = (scanUrl, reqId) => {
    setScan({ url: scanUrl, reqId });
    setScreen('results');
  };

  const handleLogout = async () => {
    await apiLogout().catch(() => {});
    await refreshAuth();
    setScreen('check');
  };

  const navigate = (nextScreen) => {
    if (nextScreen === 'results' && !scan) return;
    if (nextScreen === 'account' && !user) {
      setAuthModal('login');
      return;
    }
    setScreen(nextScreen);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans">
      <Navbar
        screen={screen}
        onNavigate={navigate}
        user={user}
        onLogin={() => setAuthModal('login')}
        onRegister={() => setAuthModal('register')}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {screen === 'check' && (
            <motion.div key="check" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CheckPage
                user={user}
                onStartScan={startScan}
                onAuthRequired={() => setAuthModal('register')}
              />
            </motion.div>
          )}

          {screen === 'results' && scan && (
            <motion.div key={`results-${scan.reqId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultsPage url={scan.url} reqId={scan.reqId} onBack={() => setScreen('check')} />
            </motion.div>
          )}

          {screen === 'account' && user && (
            <motion.div key="account" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AccountPage user={user} onAuthed={(data) => setUser(data.user)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onAuthed={(data) => {
            setUser(data.user);
            setAuthModal(null);
          }}
        />
      )}

      <div className="fixed bottom-6 right-6">
        <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <span className="font-bold">?</span>
        </button>
      </div>
    </div>
  );
}