import { useEffect, useState } from 'react';
import { CheckCircle2, Download, History, KeyRound, Settings, ExternalLink, FileText } from 'lucide-react';
import { changePassword, getReports, downloadReport } from '../api';

export default function AccountPage({ user, onAuthed }) {
  const [activeTab, setActiveTab] = useState('history');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');

  const tabs = [
    { id: 'history', label: 'История проверок', icon: History },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    if (activeTab !== 'history') return;

    setReportsLoading(true);
    setReportsError('');
    getReports()
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load reports:', err);
        setReports([]);
        setReportsError(err.message || 'Не удалось загрузить историю проверок.');
      })
      .finally(() => setReportsLoading(false));
  }, [activeTab]);

  const handleDownload = async (reportId) => {
    if (!reportId) return;

    try {
      await downloadReport(reportId);
    } catch (err) {
      console.error('Download failed:', err);
      setError(err.message || 'Не удалось скачать отчёт');
      setTimeout(() => setError(''), 5000);
    }
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

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
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
            reportsLoading ? (
              <div className="min-h-56 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
              </div>
            ) : reportsError ? (
              <div className="min-h-56 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                  <History size={22} className="text-red-500" />
                </div>
                <h2 className="font-bold text-lg mb-2">История временно недоступна</h2>
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">{reportsError}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="min-h-56 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <History size={22} className="text-gray-500" />
                </div>
                <h2 className="font-bold text-lg mb-2">История проверок пока пустая</h2>
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  Запустите проверку сайта, и результаты появятся здесь после завершения.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{report.url}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-400">{formatDate(report.created_at)}</p>
                          {report.check_type && (
                            <p className="text-xs text-gray-400 uppercase">{report.check_type}</p>
                          )}
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={10} />
                            Открыть
                          </a>
                        </div>
                      </div>
                    </div>
                    {report.report_id ? (
                      <button
                        type="button"
                        onClick={() => handleDownload(report.report_id)}
                        className="bg-black text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors shrink-0 ml-3"
                      >
                        <Download size={14} />
                        PDF-отчёт
                      </button>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-xs font-medium shrink-0 ml-3">
                        PDF недоступен
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
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
