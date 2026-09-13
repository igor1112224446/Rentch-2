import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types';

export type UserRole = 'tenant' | 'admin';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  userProfile: UserProfile;
  onLoginTenant: (profileData: Partial<UserProfile>) => void;
  onLoginAdmin: () => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  userProfile,
  onLoginTenant,
  onLoginAdmin,
  onLogout,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(isAdmin ? 'admin' : 'tenant');
  
  // Tenant Form
  const [tenantName, setTenantName] = useState(userProfile.name || '');
  const [tenantPhone, setTenantPhone] = useState(userProfile.phone || '');
  const [tenantTelegram, setTenantTelegram] = useState(userProfile.telegramUsername || '');

  // Admin Form
  const [adminEmail, setAdminEmail] = useState('ai9292@mail.ru');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = tenantName.trim() || 'Арендатор';
    onLoginTenant({
      name: finalName,
      phone: tenantPhone.trim() || '+995 599 12-34-56',
      telegramUsername: tenantTelegram.trim().replace(/^@/, '') || 'rentch_guest',
      isRegistered: true,
    });
    onClose();
  };

  const handleQuickTenantLogin = () => {
    onLoginTenant({
      name: 'Игорь Азаров',
      phone: '+995 599 82-41-10',
      telegramUsername: 'igor_azarov',
      email: 'azarov.igor.9212@gmail.com',
      isRegistered: true,
    });
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    // Verification credentials
    if (adminEmail.trim() === 'ai9292@mail.ru' && adminPassword.trim() === 'redmay1968!') {
      setAdminSuccess(true);
      setTimeout(() => {
        onLoginAdmin();
        onClose();
      }, 400);
    } else {
      setAdminError('Неверный логин или пароль администратора');
    }
  };

  const handleAutofillAdmin = () => {
    setAdminEmail('ai9292@mail.ru');
    setAdminPassword('redmay1968!');
    setAdminError('');
  };

  return (
    <div 
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="auth-modal-content"
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Вход в Rentch</h2>
          </div>
          <p className="text-xs text-stone-300">
            Выберите вашу роль для персонализированного доступа к сервису
          </p>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-stone-950/60 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              id="role-tab-tenant"
              onClick={() => {
                setActiveRole('tenant');
                setAdminError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'tenant'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Арендатор</span>
            </button>

            <button
              type="button"
              id="role-tab-admin"
              onClick={() => {
                setActiveRole('admin');
                setAdminError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-stone-100 text-stone-900 shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Администратор</span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6">
          {/* Status banner if already authenticated */}
          {(isAdmin || userProfile.isRegistered) && (
            <div className="mb-4 p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  Текущий вход:{' '}
                  <strong className="text-stone-900">
                    {isAdmin ? 'Администратор CRM' : userProfile.name || 'Арендатор'}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setAdminSuccess(false);
                }}
                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </button>
            </div>
          )}

          {/* TAB 1: Арендатор */}
          {activeRole === 'tenant' && (
            <form onSubmit={handleTenantSubmit} className="space-y-4">
              <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3 text-xs text-rose-900 leading-relaxed">
                Вход для арендаторов позволяет сохранять мэтчи, бронировать просмотры квартир в Тбилиси и общаться с менеджерами.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Ваше имя
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Например, Игорь"
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Телефон (WhatsApp / Telegram)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="+995 599 00-00-00"
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Telegram Username (по желанию)
                </label>
                <div className="relative">
                  <span className="text-stone-400 font-bold text-xs absolute left-4 top-1/2 -translate-y-1/2">
                    @
                  </span>
                  <input
                    type="text"
                    value={tenantTelegram}
                    onChange={(e) => setTenantTelegram(e.target.value)}
                    placeholder="username"
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  id="auth-submit-tenant-btn"
                  className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Войти как арендатор</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickTenantLogin}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2 px-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Быстрый демо-вход (Игорь Азаров)</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Администратор */}
          {activeRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-stone-100 border border-stone-200 rounded-2xl p-3 text-xs text-stone-700 leading-relaxed">
                Доступ к CRM-системе Rentch, воронке лидов, управлению объявлениями и загрузке объектов из PDF/интернет-ссылок.
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold">
                  {adminError}
                </div>
              )}

              {adminSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Авторизация успешна! Переход в панель...</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email администратора
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="ai9292@mail.ru"
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    Пароль администратора
                  </label>
                  <button
                    type="button"
                    onClick={handleAutofillAdmin}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Заполнить тест
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Введите пароль..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  id="auth-submit-admin-btn"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Войти как администратор</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
