import { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle2, Clock, XCircle, FileText, Globe, Server, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Gauge from '../components/Gauge';
import { getProgress, getCheckInfo, calcRiskScore, downloadReport } from '../api';

function getHostname(url) {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    return url || 'example.ru';
  }
}

function formatDate() {
  const d = new Date();
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ViolationDetails({ v }) {
  const data = v.data;
  if (!data) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 pt-3 border-t border-gray-100">
        {v.about && v.about !== '<nil>' && v.about !== '' && (
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{v.about}</p>
        )}

        {v.pages && v.pages.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-400 mb-1">Страницы с нарушением:</p>
            {v.pages.map((page, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 font-mono ml-1 mb-0.5">
                <FileText size={10} className="text-gray-400 shrink-0" />
                <span className="truncate">{page}</span>
              </div>
            ))}
          </div>
        )}

        {v.id === 'https' && data.endpoints && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">HTTP-эндпоинты:</p>
            {data.endpoints.map((ep, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 font-mono ml-1 mb-0.5">
                <Globe size={10} className="text-red-400 shrink-0" />
                <span className="truncate">{ep}</span>
              </div>
            ))}
          </div>
        )}

        {v.id === 'ssl/tls' && data.endpoints && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Небезопасные соединения:</p>
            {Object.entries(data.endpoints).map(([domain, status], i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 font-mono ml-1 mb-0.5">
                <Lock size={10} className="text-red-400 shrink-0" />
                <span className="truncate">{domain}</span>
                <span className="text-gray-400">— {status === 'self-signed' ? 'самоподписанный' : status}</span>
              </div>
            ))}
          </div>
        )}

        {v.id === 'cookie-ads' && data.endpoints && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Сторонние трекеры:</p>
            {data.endpoints.map((ep, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 font-mono ml-1 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="truncate">{ep}</span>
              </div>
            ))}
          </div>
        )}

        {v.id === 'ips' && data.services && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Серверы за пределами РФ:</p>
            {data.services.map((svc, i) => (
              <div key={i} className="flex flex-col gap-0.5 text-xs text-gray-600 font-mono ml-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Server size={10} className="text-orange-400 shrink-0" />
                  <span className="truncate">{svc.domain}</span>
                </div>
                {svc.ip?.map((ip, j) => (
                  <div key={j} className="ml-4 text-gray-400">
                    {ip} — {svc.country?.[j] || 'unknown'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {![ 'https', 'ssl/tls', 'cookie-ads', 'ips' ].includes(v.id) && data && !v.pages && (
          <div>
            {Object.entries(data).filter(([k]) => k !== 'pages' && k !== 'about').map(([key, val]) => (
              <div key={key} className="text-xs text-gray-500 mb-0.5">
                <span className="font-medium text-gray-400">{key}: </span>
                <span className="font-mono">
                  {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ResultsPage({ url, reqId, onBack }) {
  const [scanning, setScanning] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [reportId, setReportId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const pollRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function init() {
      try {
        const poll = async () => {
          try {
            const task = await getProgress(reqId);
            if (cancelledRef.current) return;

            setProgress(task.progress || 0);

            if (task.status === 'completed') {
              setResults(task.results || []);
              console.log('Task completed, report_id:', task.report_id);
              if (task.report_id) setReportId(task.report_id);
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

    if (reqId) init();
    return () => {
      cancelledRef.current = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [reqId]);

  const violations = results.filter(r => r.result === 'fail' || r.result === 'warn');
  const passed = results.filter(r => r.result === 'ok');
  const score = calcRiskScore(results);
  const hostname = getHostname(url);

  const resultStyle = (result) => {
    if (result === 'fail') return { severity: 'Критично', color: 'bg-red-500', text: 'bg-red-50 text-red-600' };
    if (result === 'warn') return { severity: 'Высокий', color: 'bg-orange-500', text: 'bg-orange-50 text-orange-600' };
    return { severity: 'OK', color: 'bg-green-500', text: 'bg-green-50 text-green-600' };
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
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
              {reportId ? (
                <button
                  onClick={() => {
                    console.log('Downloading report:', reportId);
                    downloadReport(reportId).catch(err => {
                      console.error('Download error:', err);
                      alert('Не удалось скачать PDF: ' + err.message);
                    });
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium"
                >
                  <Download size={16} /> PDF
                </button>
              ) : (
                <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium cursor-not-allowed">
                  <Download size={16} /> PDF
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {violations.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="font-bold mb-2">Нарушений не найдено</h3>
                <p className="text-sm text-gray-500">Все проверки пройдены успешно</p>
              </div>
            ) : (
              violations.map((v, i) => {
                const info = getCheckInfo(v.id, v.result);
                const style = resultStyle(v.result);
                const isExpanded = expandedId === (v.id || i);
                const hasDetails = v.data || (v.pages && v.pages.length > 0) || (v.about && v.about !== '<nil>' && v.about !== '');
                return (
                  <div
                    key={v.id || i}
                    className="bg-white p-5 rounded-xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer"
                    onClick={() => hasDetails && toggleExpand(v.id || i)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${style.color} shrink-0`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">{info.art}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.text}`}>{style.severity}</span>
                            {v.pages && v.pages.length > 0 && <span className="text-[10px] text-gray-400">{v.pages.length} стр.</span>}
                          </div>
                          <p className="text-sm font-medium truncate">{info.label}</p>
                        </div>
                      </div>
                      {hasDetails && (
                        <div className="shrink-0 ml-3">
                          {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                        </div>
                      )}
                    </div>
                    <AnimatePresence>
                      {isExpanded && <ViolationDetails v={v} />}
                    </AnimatePresence>
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
                    const info = getCheckInfo(v.id, v.result);
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
