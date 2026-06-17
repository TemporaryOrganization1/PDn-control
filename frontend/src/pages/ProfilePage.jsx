import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Settings, LogIn, LogOut, Mail, Phone, Copy, CheckCircle2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MOCK_ACCOUNT_HISTORY = [
  { domain: 'company.ru', date: '08.06.2026', score: 38, violations: 6, fine: '330 000 ₽', status: 'completed' },
  { domain: 'startup.io', date: '07.06.2026', score: 71, violations: 2, fine: '40 000 ₽', status: 'completed' },
  { domain: 'ecom-store.ru', date: '05.06.2026', score: 55, violations: 4, fine: '185 000 ₽', status: 'completed' },
  { domain: 'clinic-saratov.ru', date: '03.06.2026', score: 22, violations: 8, fine: '520 000 ₽', status: 'completed' },
  { domain: 'media-portal.ru', date: '01.06.2026', score: 84, violations: 1, fine: '5 000 ₽', status: 'completed' },
];

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Вход в личный кабинет</h2>
          <p className="text-sm text-gray-500 mt-1">Авторизуйтесь для доступа к истории проверок</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="example@mail.ru"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors mt-2">
            Войти
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-3">Ещё нет аккаунта?</p>
          <button className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm">
            Зарегистрироваться
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            В демо-режиме нажмите «Войти» для входа без пароля
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileDashboard({ onLogout, onOpenResult }) {
  const { user } = useAuth();
  const [profileTab, setProfileTab] = useState('history');

  return (
    <div className="flex gap-10">
      <aside className="w-72 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-bold">{user.name}</h3>
          <p className="text-xs text-gray-400">{user.email}</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Активен</span>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">12 проверок</span>
          </div>
        </div>

                <nav className="flex flex-col gap-1 bg-white rounded-2xl border border-gray-100 p-2">
          <button
            onClick={() => setProfileTab('history')}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${profileTab === 'history' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <History size={18} /> История проверок
          </button>
          <button
            onClick={() => setProfileTab('settings')}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${profileTab === 'settings' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings size={18} /> Настройки
          </button>
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-red-500 p-3 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Выйти
        </button>
      </aside>

      <div className="flex-1">
        {profileTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">История проверок</h2>
              <div className="flex gap-2">
                <select className="bg-white border border-gray-200 text-xs font-medium p-2 rounded-lg outline-none cursor-pointer">
                  <option>Все</option>
                  <option>Высокий риск</option>
                  <option>Средний риск</option>
                  <option>Низкий риск</option>
                </select>
                <button className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5">
                  <Download size={14} /> Экспорт
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {MOCK_ACCOUNT_HISTORY.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold ${item.score > 70 ? 'border-green-500 text-green-600' : item.score > 40 ? 'border-orange-400 text-orange-500' : 'border-red-400 text-red-500'}`}>
                        {item.score}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{item.domain}</span>
                        <span className={`text-[9px] font-bold px-1 rounded uppercase ${item.violations > 5 ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                          {item.violations} нар.
                        </span>
                        <CheckCircle2 size={12} className="text-green-400" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.date} · Штраф: {item.fine}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenResult(item.domain)}
                      className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      Открыть
                    </button>
                    <button className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-50">
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {profileTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-6">Настройки</h2>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-4">
              <h3 className="font-bold mb-4">Профиль</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Имя</label>
                  <input
                    type="text"
                    value={user.name}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={user.email}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                      readOnly
                    />
                    <Copy size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-black" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Телефон</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold mb-2">Безопасность</h3>
              <p className="text-xs text-gray-400 mb-4">Управление паролем и сессиями</p>
              <button className="border border-gray-200 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Сменить пароль
              </button>
              <button className="ml-2 border border-red-200 text-red-500 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                Удалить аккаунт
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage({ onOpenResult }) {
  const { user, isAuth, login, logout } = useAuth();

  const handleLogin = (email) => {
    login(email, 'demo');
  };

  if (!isAuth) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <ProfileDashboard onLogout={logout} onOpenResult={onOpenResult} />;
}
