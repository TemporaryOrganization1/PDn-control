import { useState, useEffect } from 'react';
import { BarChart3, ChevronRight, FileText, Scale, Search, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { startCheck as apiStartCheck, getGuestRemaining } from '../api';

export default function CheckPage({ onStartScan, onAuthRequired, user }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestRemaining, setGuestRemaining] = useState(null);
  const [guestLimit, setGuestLimit] = useState(3);

  // Fetch guest remaining count on mount if user is not authenticated
  useEffect(() => {
    if (!user) {
      getGuestRemaining()
        .then((data) => {
          setGuestRemaining(data.remaining);
          setGuestLimit(data.limit);
        })
        .catch(() => {
          setGuestRemaining(null);
        });
    } else {
      setGuestRemaining(null);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url || loading) return;

    setError('');
    setLoading(true);
    try {
      const resp = await apiStartCheck(url, 'detail');

      // Update guest remaining from response if present
      if (resp.data?.guest) {
        setGuestRemaining(resp.data.guest.remaining);
        setGuestLimit(resp.data.guest.limit);
      } else if (!user) {
        // Refetch from server
        getGuestRemaining().then((data) => {
          setGuestRemaining(data.remaining);
          setGuestLimit(data.limit);
        });
      }

      onStartScan(url, resp['req-id']);
    } catch (err) {
      if (err.code === 'ERR_GUEST_LIMIT') {
        setError('Гостевой лимит исчерпан. Войдите или зарегистрируйтесь, чтобы продолжить проверки.');
        setGuestRemaining(0);
      } else {
        setError(err.message || 'Не удалось запустить проверку');
      }
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { icon: <ShieldCheck className="text-pink-500" />, title: 'AI-анализ', desc: 'Проверка политики конфиденциальности и обязательных условий ФЗ-152.' },
    { icon: <Scale className="text-orange-400" />, title: 'Оценка штрафов', desc: 'Расчет максимального штрафа по найденным нарушениям.' },
    { icon: <BarChart3 className="text-green-500" />, title: 'Риск-скоринг', desc: 'Приоритизация нарушений по критичности и вероятности.' },
    { icon: <FileText className="text-blue-500" />, title: 'PDF-отчет', desc: 'Готовый отчет для юриста, клиента или внутреннего аудита.' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mt-10">
      <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-4">ФЗ-152</div>
      <h1 className="text-4xl font-bold mb-4 tracking-tight">
        Проверьте ваш сайт<br />на нарушения закона
      </h1>
      <p className="text-gray-500 max-w-lg mb-10 leading-relaxed">
        AI-анализ политики конфиденциальности, обнаружение нарушений, оценка рисков и подсчет возможных штрафов.
      </p>

      {error && (
        <div className="w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{error}</span>
            {error.includes('лимит') && (
              <button type="button" onClick={onAuthRequired} className="bg-red-600 text-white rounded-lg px-3 py-2 text-xs font-bold">
                Создать аккаунт
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guest remaining indicator — only for non-authenticated users */}
      {!user && guestRemaining !== null && guestRemaining > 0 && (
        <div className="w-full max-w-2xl text-xs text-gray-400 mb-4 text-left">
          Осталось гостевых проверок: {guestRemaining} из {guestLimit}
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
          disabled={loading || (!user && guestRemaining !== null && guestRemaining <= 0)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7c7c82] hover:bg-black text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Запуск...' : 'Проверить'} <ChevronRight size={16} />
        </button>
      </form>

      <div className="flex gap-4 text-xs text-gray-400 mb-16">
        Попробуйте:{' '}
        <span className="underline cursor-pointer hover:text-black" onClick={() => setUrl('gosuslugi.ru')}>gosuslugi.ru</span>
        <span className="underline cursor-pointer hover:text-black" onClick={() => setUrl('sberbank.ru')}>sberbank.ru</span>
        <span className="underline cursor-pointer hover:text-black" onClick={() => setUrl('yandex.ru')}>yandex.ru</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-6 rounded-lg border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="mb-4">{card.icon}</div>
            <h3 className="font-bold mb-2 text-sm">{card.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}