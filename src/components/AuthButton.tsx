import React from 'react';
import { User, ShieldCheck, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthButtonProps {
  isAdmin: boolean;
  userProfile: UserProfile;
  onClick: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  isAdmin,
  userProfile,
  onClick,
}) => {
  if (isAdmin) {
    return (
      <button
        type="button"
        id="topbar-auth-btn-admin"
        onClick={onClick}
        className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-xs transition-all cursor-pointer border border-stone-700"
        title="Панель администратора / Сменить роль"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">Администратор</span>
        <span className="sm:hidden">Админ</span>
      </button>
    );
  }

  if (userProfile.isRegistered && userProfile.name) {
    return (
      <button
        type="button"
        id="topbar-auth-btn-user"
        onClick={onClick}
        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-1.5 px-3 rounded-full transition-colors cursor-pointer border border-rose-200/80"
        title="Профиль арендатора / Сменить роль"
      >
        <User className="w-3.5 h-3.5 text-rose-500" />
        <span className="truncate max-w-[90px] sm:max-w-[120px]">{userProfile.name}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      id="topbar-auth-btn-login"
      onClick={onClick}
      className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-1.5 px-3.5 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer"
      title="Войти в систему"
    >
      <LogIn className="w-3.5 h-3.5 text-stone-300" />
      <span>Войти</span>
    </button>
  );
};
