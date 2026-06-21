import { useState, useEffect } from 'react';
import { Search, ChevronRight, ShieldCheck, Scale, BarChart3, FileText, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { startCheck as apiStartCheck } from '../api';

const GUEST_MAX_CHECKS = 3;
const GUEST_COUNT_KEY = 'guest_check_count';

export default function CheckPage({ onStartScan, onNavigate }) {
  const { isAuth, accessToken } = useAuth();
  const [url, setUrl] = useState('');
  const [guestCount, setGuestCount] = useState(
    () => parseInt(localStorage.getItem(GUEST_COUNT_KEY) || '0', 10)
  );
  const [limitError, setLimitError] = useState(false);

  // Clear limit error when user logs in
  useEffect(() => {
    if (isAuth) {
      setLimitError(false);
    }
  }, [isAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    if (!isAuth) {
      const currentCount = parseInt(localStorage.getItem(GUEST_COUNT_KEY) || '0', 10);
      if (currentCount >= GUEST_MAX_CHECKS) {
        setLimitError(true);
        return;
      }
    }

    // If authenticated, pass the JWT token to the API
    try {
      if (isAuth) {
        await apiStartCheck(url, 'detail', accessToken);
      } else {
        await apiStartCheck(url, 'detail');
        // Increment guest counter on success
        const newCount = parseInt(localStorage.getItem(GUEST_COUNT_KEY) || '0', 10) + 1;
        localStorage.setItem(GUEST_COUNT_KEY, newCount.toString());
        setGuestCount(newCount);
      }
      onStartScan(url);
    } catch (err) {
      if (err.message === 'GUEST_LIMIT_REACHED') {
        setLimitError(true);
      }
    }
  };

  const remaining = GUEST_MAX_CHECKS - guestCount;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mt-10">
      <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-4">ФЗ-152</div>
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        Проверьте ваш сайт<br />на нарушения закона
      </h1>
      <p className="text-gray-500 max-w-lg mb-10 leading-relaxed">
        AI-анализ политики конфиденциальности, обнаружение нарушений, оценка рисков и подсчёт возможных штрафов — за несколько секунд.
      </p>

      {/* Guest limit warning banner */}
      {limitError && !isAuth && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-left"
        >
          <h3 className="font-bold text-amber-800 mb-2">Лимит бесплатных проверок исчерпан</h3>
          <p className="text-sm text-amber-700 mb-4">
            Вы исчерпали лимит бесплатных проверок. Войдите или зарегистрируйтесь, чтобы продолжить.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate && onNavigate('profile')}
              className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <LogIn size={16} /> Войти
            </button>
            <button
              onClick={() => onNavigate && onNavigate('register')}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <UserPlus size={16} /> Зарегистрироваться
            </button>
          </div>
        </motion.div>
      )}

      {/* Guest checks remaining indicator */}
      {!isAuth && !limitError && (
        <div className="text-xs text-gray-400 mb-4">
          Осталось бесплатных проверок: {Math.max(0, remaining)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-2xl relative mb-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="example.ru или https://example.ru"
          className="w-full pl-12 pr-32 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-black outline-none font-mono text-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          disabled={!isAuth && guestCount >= GUEST_MAX_CHECKS}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7c7c82] hover:bg-black text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Проверить <ChevronRight size={16} />
        </button>
      </form>

      <div className="flex gap-4 text-xs text-gray-400 mb-16">
        Попробуйте:{' '}
        <span className="underline cursor-pointer hover:text-black" onClick={() => { setUrl('gosuslugi.ru'); }}>gosuslugi.ru</span>
        <span className="underline cursor-pointer hover:text-black" onClick={() => { setUrl('sberbank.ru'); }}>sberbank.ru</span>
        <span className="underline cursor-pointer hover:text-black" onClick={() => { setUrl('yandex.ru'); }}>yandex.ru</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          { icon: <ShieldCheck className="text-pink-500" />, title: 'AI-анализ', desc: 'Проверка политики конфиденциальности и обязательных условий ФЗ-152' },
          { icon: <Scale className="text-orange-400" />, title: 'Оценка штрафов', desc: 'Расчёт максимально возможного штрафа по каждому нарушению' },
          { icon: <BarChart3 className="text-green-500" />, title: 'Риск-скоринг', desc: 'Приоритизация нарушений по критичности и вероятности проверки' },
          { icon: <FileText className="text-blue-500" />, title: 'PDF-отчёт', desc: 'Готовый отчёт для юриста, клиента или внутреннего аудита' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="mb-4">{card.icon}</div>
            <h3 className="font-bold mb-2 text-sm">{card.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
