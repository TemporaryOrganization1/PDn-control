import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { register as apiRegister } from '../api';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function RegisterPage({ onBackToLogin, onRegisterSuccess }) {
  const [form, setForm] = useState({ email: '', name: '', surname: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errors = {};

    if (!form.email.trim()) {
      errors.email = 'Введите email';
    } else if (!EMAIL_REGEX.test(form.email)) {
      errors.email = 'Неверный формат email';
    } else if (!form.email.toLowerCase().endsWith('.ru')) {
      errors.email = 'Разрешены только российские email-адреса (.ru)';
    }

    if (!form.name.trim()) {
      errors.name = 'Введите имя';
    } else if (form.name.trim().length > 100) {
      errors.name = 'Имя не должно превышать 100 символов';
    }

    if (!form.surname.trim()) {
      errors.surname = 'Введите фамилию';
    } else if (form.surname.trim().length > 100) {
      errors.surname = 'Фамилия не должна превышать 100 символов';
    }

    if (!form.password) {
      errors.password = 'Введите пароль';
    } else if (form.password.length < 8) {
      errors.password = 'Пароль должен содержать минимум 8 символов';
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Пароль должен содержать заглавную букву';
    } else if (!/[a-z]/.test(form.password)) {
      errors.password = 'Пароль должен содержать строчную букву';
    } else if (!/[0-9]/.test(form.password)) {
      errors.password = 'Пароль должен содержать цифру';
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await apiRegister(
        form.email.trim(),
        form.name.trim(),
        form.surname.trim(),
        form.password,
      );
      setSuccess(true);
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Регистрация выполнена успешно!</h2>
          <p className="text-sm text-gray-500 mb-6">Сейчас вы будете перенаправлены на страницу входа</p>
          <button
            onClick={onBackToLogin}
            className="bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Перейти ко входу
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-8">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Регистрация</h2>
          <p className="text-sm text-gray-500 mt-1">Создайте аккаунт для доступа ко всем функциям</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="example@mail.ru"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-sm transition-colors
                  ${fieldErrors.email ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-black'}`}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </div>
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Имя</label>
              <input
                type="text"
                placeholder="Иван"
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors
                  ${fieldErrors.name ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-black'}`}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Фамилия</label>
              <input
                type="text"
                placeholder="Иванов"
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors
                  ${fieldErrors.surname ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-black'}`}
                value={form.surname}
                onChange={(e) => setField('surname', e.target.value)}
              />
              {fieldErrors.surname && <p className="text-red-500 text-xs mt-1">{fieldErrors.surname}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Пароль</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 rounded-xl border outline-none text-sm transition-colors
                  ${fieldErrors.password ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-black'}`}
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            {!fieldErrors.password && form.password && (
              <div className="mt-2 flex gap-1.5">
                <div className={`h-1 flex-1 rounded-full ${form.password.length >= 8 ? 'bg-green-400' : 'bg-gray-200'}`} />
                <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(form.password) ? 'bg-green-400' : 'bg-gray-200'}`} />
                <div className={`h-1 flex-1 rounded-full ${/[a-z]/.test(form.password) ? 'bg-green-400' : 'bg-gray-200'}`} />
                <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-400' : 'bg-gray-200'}`} />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Подтверждение пароля</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-sm transition-colors
                  ${fieldErrors.confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-black'}`}
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
              />
            </div>
            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-3">Уже есть аккаунт?</p>
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Вернуться ко входу
          </button>
        </div>
      </div>
    </motion.div>
  );
}