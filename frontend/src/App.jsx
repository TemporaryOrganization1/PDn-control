import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, Scale, BarChart3, FileText, 
  History, Settings, ChevronRight, Download, 
  AlertTriangle, CheckCircle2, Clock, Wallet, Menu, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_VIOLATIONS = [
  { id: 1, art: "Ст. 18.1", severity: "Критично", color: "bg-red-500", label: "Отсутствует политика обработки персональных данных", fine: "60 000 ₽", pages: 1 },
  { id: 2, art: "Ст. 9", severity: "Высокий", color: "bg-orange-500", label: "Нет формы получения согласия субъекта ПД", fine: "150 000 ₽", pages: 3 },
  { id: 3, art: "Ст. 22", severity: "Высокий", color: "bg-orange-500", label: "Не подана уведомление об обработке ПД в Роскомнадзор", fine: "5 000 ₽", pages: 0 },
  { id: 4, art: "Ст. 18.1 ч.5", severity: "Средний", color: "bg-blue-500", label: "Политика конфиденциальности не опубликована в открытом доступе", fine: "30 000 ₽", pages: 0 },
  { id: 5, art: "Ст. 7", severity: "Средний", color: "bg-blue-500", label: "Передача ПД третьим лицам без явного согласия", fine: "75 000 ₽", pages: 2 },
  { id: 6, art: "Ст. 23", severity: "Низкий", color: "bg-gray-400", label: "Отсутствует контактная информация ответственного лица", fine: "10 000 ₽", pages: 0 },
];

const MOCK_HISTORY = [
  { domain: 'company.ru', date: '08.06.2026 14:22', score: 38, violations: 6, fine: '330 000 ₽' },
  { domain: 'startup.io', date: '07.06.2026 09:11', score: 71, violations: 2, fine: '40 000 ₽' },
  { domain: 'ecom-store.ru', date: '05.06.2026 16:05', score: 55, violations: 4, fine: '185 000 ₽' },
  { domain: 'clinic-saratov.ru', date: '03.06.2026 11:30', score: 22, violations: 8, fine: '520 000 ₽' },
  { domain: 'media-portal.ru', date: '01.06.2026 08:44', score: 84, violations: 1, fine: '5 000 ₽' },
];

const Gauge = ({ score }) => {
  const color = score > 70 ? '#22c55e' : score > 40 ? '#f97316' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * score) / 100}
                strokeLinecap="round" style={{ color }} />
      </svg>
      <span className="absolute text-sm font-bold">{score}</span>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState('check');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('violations');

  const startScan = (e) => {
    e.preventDefault();
    if (!url) return;
    setScreen('scanning');
    setTimeout(() => setScreen('results'), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('check')}>
          <div className="bg-black text-white p-1 rounded">
            <Menu size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">ФЗ-152 Checker <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded ml-1 text-gray-500 uppercase">beta</span></span>
        </div>
        
        <div className="flex gap-8 text-sm font-medium text-gray-500">
          <button onClick={() => setScreen('check')} className={screen === 'check' ? 'text-black border-b-2 border-black pb-1' : 'hover:text-black'}>Проверка</button>
          <button onClick={() => setScreen('results')} className={screen === 'results' ? 'text-black border-b-2 border-black pb-1' : 'hover:text-black'}>Результаты</button>
          <button onClick={() => setScreen('history')} className={screen === 'history' ? 'text-black border-b-2 border-black pb-1' : 'hover:text-black'}>История</button>
        </div>

        <div className="bg-gray-100 p-1.5 rounded-full">
          <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">АИ</div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6">
        
        {screen === 'check' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mt-10">
            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-4">ФЗ-152</div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Проверьте ваш сайт<br />на нарушения закона</h1>
            <p className="text-gray-500 max-w-lg mb-10 leading-relaxed">
              AI-анализ политики конфиденциальности, обнаружение нарушений, оценка рисков и подсчёт возможных штрафов — за несколько секунд.
            </p>

            <form onSubmit={startScan} className="w-full max-w-2xl relative mb-4">
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
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7c7c82] hover:bg-black text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium">
                Проверить <ChevronRight size={16} />
              </button>
            </form>
            
            <div className="flex gap-4 text-xs text-gray-400 mb-16">
              Попробуйте: <span className="underline cursor-pointer hover:text-black">gosuslugi.ru</span> <span className="underline cursor-pointer hover:text-black">sberbank.ru</span> <span className="underline cursor-pointer hover:text-black">yandex.ru</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {[
                { icon: <ShieldCheck className="text-pink-500" />, title: "AI-анализ", desc: "Проверка политики конфиденциальности и обязательных условий ФЗ-152" },
                { icon: <Scale className="text-orange-400" />, title: "Оценка штрафов", desc: "Расчёт максимально возможного штрафа по каждому нарушению" },
                { icon: <BarChart3 className="text-green-500" />, title: "Риск-скоринг", desc: "Приоритизация нарушений по критичности и вероятности проверки" },
                { icon: <FileText className="text-blue-500" />, title: "PDF-отчёт", desc: "Готовый отчёт для юриста, клиента или внутреннего аудита" },
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 text-left hover:shadow-md transition-shadow">
                  <div className="mb-4">{card.icon}</div>
                  <h3 className="font-bold mb-2 text-sm">{card.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {screen === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full mb-8"
            />
            <h2 className="text-xl font-bold mb-2">Анализируем {url}...</h2>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Парсинг страниц</div>
              <div className="flex items-center gap-2"><motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> AI-аудит юридических текстов</div>
              <div className="flex items-center gap-2 text-gray-300"><Clock size={16} /> Расчёт финансовых рисков</div>
            </div>
          </div>
        )}

        {screen === 'results' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <button onClick={() => setScreen('check')} className="text-xs text-gray-400 mb-2 hover:text-black flex items-center gap-1">← Назад</button>
                <div className="flex items-center gap-3">
                   <h1 className="text-2xl font-bold">{url || 'example.ru'}</h1>
                   <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Высокий риск</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Проверено: 47 страниц · 6 нарушений ФЗ-152 · 08.06.2026</p>
              </div>
              <div className="flex items-center gap-10">
                <div className="flex flex-col items-center">
                   <Gauge score={38} />
                   <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Риск-скор</span>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-gray-400 uppercase font-bold">Макс. штраф</p>
                   <p className="text-2xl font-bold text-red-500">330 000 ₽</p>
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
                { id: 'fines', label: 'Штрафы' },
              ].map(tab => (
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
                <p className="text-xs text-gray-400 mb-2">Нажмите на нарушение для отбора</p>
                {MOCK_VIOLATIONS.map(v => (
                  <div key={v.id} className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-300 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${v.color}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{v.art}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.color} bg-opacity-10`}>
                            {v.severity}
                          </span>
                          {v.pages > 0 && <span className="text-[10px] text-gray-400">{v.pages} стр.</span>}
                        </div>
                        <p className="text-sm font-medium">{v.label}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-red-500 opacity-80 group-hover:opacity-100 transition-opacity">
                      {v.fine}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'ai' && (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
                <ShieldCheck className="mx-auto text-blue-500 mb-4" size={48} />
                <h3 className="font-bold mb-2">AI-анализ политики</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">Интеллектуальный поиск отсутствующих пунктов в вашем соглашении на обработку персональных данных.</p>
              </div>
            )}
          </motion.div>
        )}

        {screen === 'history' && (
          <div className="flex gap-10">
            <aside className="w-64 flex flex-col justify-between min-h-[60vh]">
              <div>
                <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Навигация</h3>
                <nav className="flex flex-col gap-1">
                  <button className="flex items-center gap-3 bg-black text-white p-3 rounded-xl text-sm font-medium shadow-sm">
                    <History size={18} /> История проверок
                  </button>
                  <button className="flex items-center gap-3 text-gray-500 hover:bg-gray-100 p-3 rounded-xl text-sm font-medium">
                    <Settings size={18} /> Настройки нарушений
                  </button>
                </nav>
              </div>
              
              <div className="bg-gray-100/50 p-6 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Всего проверок</p>
                <p className="text-2xl font-bold mb-4">5</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Баланс</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-600 font-bold">₽ 2 340</span>
                </div>
                <button className="w-full bg-black text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                   Пополнить
                </button>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">История проверок</h2>
                <select className="bg-white border-none text-xs font-medium p-2 rounded-lg outline-none cursor-pointer">
                  <option>Фильтр: Все</option>
                  <option>Высокий риск</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-3">
                {MOCK_HISTORY.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold ${item.score > 70 ? 'border-green-500 text-green-600' : 'border-orange-400 text-orange-500'}`}>
                          {item.score}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{item.domain}</span>
                          <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1 rounded uppercase">{item.violations} нар.</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-bold text-red-500/80">{item.fine}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setUrl(item.domain); setScreen('results'); }} className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Открыть</button>
                        <button className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-50">PDF</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6">
        <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <span className="font-bold">?</span>
        </button>
      </div>
    </div>
  );
}
