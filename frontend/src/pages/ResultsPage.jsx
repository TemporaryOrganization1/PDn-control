import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Download, CheckCircle2, Clock, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Gauge from '../components/Gauge';
import { startCheck, getProgress, getCheckInfo, calcRiskScore } from '../api';

function getHostname(url) {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname; }
  catch { return url || 'example.ru'; }
}

function formatDate() {
  const d = new Date();
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ResultsPage({ url, onBack }) {
  const [activeTab, setActiveTab] = useState('violations');
  const [scanning, setScanning] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const pollRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function init() {
      try {
        const resp = await startCheck(url, 'detail');
        if (cancelledRef.current) return;

        const poll = async () => {
          try {
            const task = await getProgress(resp['req-id']);
            if (cancelledRef.current) return;

            setProgress(task.progress || 0);

            if (task.status === 'completed' && task.results && task.results.length > 0) {
              setResults(task.results);
              setScanning(false);
              return;
            }

            if (task.status === 'failed' || (task.errors && task.errors.length > 0)) {
              setError(task.errors?.[0] || 'Проверка завершилась ошибкой');
              setScanning(false);
              return;
            }

            pollRef.current = setTimeout(poll, 2000);
          } catch {
            if (!cancelledRef.current) pollRef.current = setTimeout(poll, 2000);
          }
        };

        pollRef.current = setTimeout(poll, 2000);
      } catch (e) {
        if (!cancelledRef.current) {
          setError(e.message || 'Не удалось запустить проверку');
          setScanning(false);
        }
      }
    }

    init();
    return () => {
      cancelledRef.current = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [url]);

  const violations = results.filter(r => r.result === 'fail' || r.result === 'warn');
  const passed = results.filter(r => r.result === 'ok');
  const score = calcRiskScore(results);
  const hostname = getHostname(url);

  const resultStyle = (result) => {
    if (result === 'fail') return { severity: 'Критично', color: 'bg-red-500', text: 'bg-red-50 text-red-600' };
    if (result === 'warn') return { severity: 'Высокий', color: 'bg-orange-500', text: 'bg-orange-50 text-orange-600' };
    return { severity: 'OK', color: 'bg-green-500', text: 'bg-green-50 text-green-600' };
  };

  return (
    <AnimatePresence mode="wait">
      {scanning ? (
        <motion.div key="scanning" className="flex flex-col items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full mb-8"
          />
          <h2 className="text-xl font-bold mb-2">Анализируем {hostname}...</h2>
          <div className="w-64 h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-black rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.max(progress, 5)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {progress >= 20 ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : (
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}
              Запуск браузера
            </div>
            <div className="flex items-center gap-2">
              {progress >= 50 ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : progress >= 20 ? (
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              ) : (
                <Clock size={16} className="text-gray-300" />
              )}
              Сканирование страниц
            </div>
            <div className="flex items-center gap-2">
              {progress >= 80 ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : progress >= 50 ? (
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              ) : (
                <Clock size={16} className="text-gray-300" />
              )}
              AI-аудит юридических текстов
            </div>
            <div className="flex items-center gap-2">
              {progress >= 100 ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : (
                <Clock size={16} className="text-gray-300" />
              )}
              Расчёт финансовых рисков
            </div>
          </div>
        </motion.div>
      ) : error ? (
        <motion.div key="error" className="flex flex-col items-center justify-center py-20">
          <XCircle size={48} className="text-red-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Ошибка проверки</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md text-center">{error}</p>
          <button onClick={onBack} className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium">
            Назад
          </button>
        </motion.div>
      ) : (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <button onClick={onBack} className="text-xs text-gray-400 mb-2 hover:text-black flex items-center gap-1">
                ← Назад
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{hostname}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${score <= 40 ? 'bg-red-100 text-red-600' : score <= 70 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  {score <= 40 ? 'Высокий риск' : score <= 70 ? 'Средний риск' : 'Низкий риск'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Проверено: {results.length} проверок · {violations.length} нарушений · {formatDate()}
              </p>
            </div>
            <div className="flex items-center gap-10">
              <div className="flex flex-col items-center">
                <Gauge score={score} />
                <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Риск-скор</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Нарушений</p>
                <p className="text-2xl font-bold text-red-500">{violations.length}</p>
              </div>
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium">
                <Download size={16} /> PDF
              </button>
            </div>
          </div>

          <div className="flex gap-8 border-b border-gray-200 mb-6 text-sm font-medium">
            {[
              { id: 'violations', label: 'Нарушения' },
              { id: 'pages', label: 'Страницы' },
              { id: 'ai', label: 'AI-анализ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition-colors ${activeTab === tab.id ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'violations' && (
            <div className="flex flex-col gap-3">
              {violations.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                  <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                  <h3 className="font-bold mb-2">Нарушений не найдено</h3>
                  <p className="text-sm text-gray-500">Все проверки пройдены успешно</p>
                </div>
              ) : (
                violations.map((v, i) => {
                  const info = getCheckInfo(v.id);
                  const style = resultStyle(v.result);
                  return (
                    <div key={v.id || i} className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-300 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${style.color}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">{info.art}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.text}`}>{style.severity}</span>
                            {v.pages && v.pages.length > 0 && <span className="text-[10px] text-gray-400">{v.pages.length} стр.</span>}
                          </div>
                          <p className="text-sm font-medium">{info.label}</p>
                          {v.about && v.about !== '<nil>' && (
                            <p className="text-xs text-gray-400 mt-0.5">{v.about}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {passed.length > 0 && (
                <details className="mt-4">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-black font-medium">
                    Пройдено успешно: {passed.length} проверок
                  </summary>
                  <div className="flex flex-col gap-2 mt-3">
                    {passed.map((v, i) => {
                      const info = getCheckInfo(v.id);
                      return (
                        <div key={v.id || i} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span className="text-xs font-mono text-gray-500">{info.art}</span>
                          <span className="text-sm">{info.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold mb-4">Проверенные страницы</h3>
              {results.filter(r => r.pages && r.pages.length > 0).length > 0 ? (
                <div className="flex flex-col gap-2">
                  {results.filter(r => r.pages && r.pages.length > 0).map((r, i) => (
                    <div key={i}>
                      <p className="text-xs font-medium text-gray-500 mb-1">{getCheckInfo(r.id).label}</p>
                      {r.pages.map((page, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-gray-700 ml-2 mb-1">
                          <FileText size={12} className="text-gray-400" />
                          <span className="font-mono text-xs truncate">{page}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Информация о страницах отсутствует</p>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <ShieldCheck className="mx-auto text-blue-500 mb-4" size={48} />
              <h3 className="font-bold mb-2">AI-анализ соответствия ФЗ-152</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                {results.some(r => r.id === 'sep-consent' || r.id === 'privacy-policy' || r.id === 'cookie-banner')
                  ? 'AI-анализ проверен. Все результаты отображены на вкладке "Нарушения".'
                  : 'AI-анализ не выполнялся для данного домена.'}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
