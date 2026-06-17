import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ screen, onNavigate }) {
  const { user, isAuth } = useAuth();

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
        {[
          { id: 'check', label: 'Проверка' },
          { id: 'results', label: 'Результаты' },
          { id: 'profile', label: 'Профиль' },
        ].map((item) => (
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

      <button
        onClick={() => onNavigate('profile')}
        className="bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
      >
        {isAuth ? (
          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
            АИ
          </div>
        )}
      </button>
    </nav>
  );
}
