import { useState } from 'react';
import { CheckCircle2, History, KeyRound, Settings } from 'lucide-react';
import { changePassword } from '../api';

export default function AccountPage({ user, onAuthed }) {
  const [activeTab, setActiveTab] = useState('history');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'history', label: 'История проверок', icon: History },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    resetMessages();

    if (newPassword !== confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают.');
      return;
    }

    setLoading(true);
    try {
      const data = await changePassword(currentPassword, newPassword);
      onAuthed(data);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Пароль успешно изменен.');
    } catch (err) {
      if (err.code === 'ERR_INVALID_CREDENTIALS') setError('Текущий пароль указан неверно.');
      else if (err.code === 'ERR_WEAK_PASSWORD') setError('Новый пароль должен быть не короче 8 символов.');
      else if (err.code === 'ERR_UNAUTHORIZED') setError('Сессия истекла. Войдите снова.');
      else setError(err.message || 'Не удалось изменить пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-xs text-gray-400 mb-2">Личный кабинет</p>
        <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
        <p className="text-sm text-gray-500 mt-2">{user?.email}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  resetMessages();
                }}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-black text-black bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'history' && (
            <div className="min-h-56 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <History size={22} className="text-gray-500" />
              </div>
              <h2 className="font-bold text-lg mb-2">История проверок пока пуста</h2>
              <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                Позже здесь появятся сохраненные проверки сайтов и быстрый доступ к их результатам.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-5">
                <KeyRound size={18} />
                <h2 className="font-bold text-lg">Изменить пароль</h2>
              </div>

              <form onSubmit={submitPassword} className="flex flex-col gap-4">
                <label className="text-xs font-medium text-gray-500">
                  Текущий пароль
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </label>

                <label className="text-xs font-medium text-gray-500">
                  Новый пароль
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>

                <label className="text-xs font-medium text-gray-500">
                  Повторите новый пароль
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>

                {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
                {success && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound size={16} />
                  {loading ? 'Сохраняем...' : 'Сменить пароль'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
