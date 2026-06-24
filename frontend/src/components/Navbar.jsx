import { LogIn, LogOut, Menu, UserPlus } from 'lucide-react';

export default function Navbar({ screen, onNavigate, user, guest, onLogin, onRegister, onLogout }) {
  const navItems = [
    { id: 'check', label: 'Проверка' },
    { id: 'results', label: 'Результаты' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('check')}>
        <div className="bg-black text-white p-1 rounded">
          <Menu size={18} />
        </div>
        <span className="font-bold text-lg tracking-tight">
          ФЗ-152 Checker{' '}
          <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded ml-1 text-gray-500 uppercase">beta</span>
        </span>
      </div>

      <div className="flex gap-8 text-sm font-medium text-gray-500">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={
              screen === item.id
                ? 'text-black border-b-2 border-black pb-1'
                : 'hover:text-black'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 min-w-0">
        {user ? (
          <>
            <button
              type="button"
              onClick={() => onNavigate('account')}
              className={
                screen === 'account'
                  ? 'hidden sm:block text-xs text-black max-w-44 truncate border-b border-black'
                  : 'hidden sm:block text-xs text-gray-500 max-w-44 truncate hover:text-black'
              }
              title="Личный кабинет"
            >
              {user.email}
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Выйти"
              aria-label="Выйти"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <span className="hidden lg:block text-xs text-gray-400 whitespace-nowrap">
              Гостевых проверок: {guest?.remaining ?? 3}
            </span>
            <button
              onClick={onLogin}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Войти"
              aria-label="Войти"
            >
              <LogIn size={18} />
            </button>
            <button
              onClick={onRegister}
              className="bg-black text-white rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-1.5"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Регистрация</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
