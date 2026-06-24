import { useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { login, register } from '../api';

export default function AuthModal({ mode = 'login', onClose, onAuthed }) {
  const [authMode, setAuthMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = authMode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);
    try {
      const data = isRegister ? await register(email, password) : await login(email, password);
      onAuthed(data);
      onClose();
    } catch (err) {
      if (err.code === 'ERR_EMAIL_EXISTS') setError('Этот email уже зарегистрирован.');
      else if (err.code === 'ERR_WEAK_PASSWORD') setError('Пароль должен быть не короче 8 символов.');
      else if (err.code === 'ERR_INVALID_CREDENTIALS') setError('Проверьте email и пароль.');
      else setError(err.message || 'Не удалось выполнить вход.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            <h2 className="font-bold text-base">{isRegister ? 'Регистрация' : 'Вход'}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 flex flex-col gap-3">
          <label className="text-xs font-medium text-gray-500">
            Email
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="text-xs font-medium text-gray-500">
            Пароль
            <input
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            {loading ? 'Подождите...' : isRegister ? 'Создать аккаунт' : 'Войти'}
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode(isRegister ? 'login' : 'register');
              setError('');
            }}
            className="text-xs text-gray-500 hover:text-black"
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}
