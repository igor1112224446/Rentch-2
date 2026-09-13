import React from 'react';
import { RentchLogo } from './RentchLogo';
import { Bell, Sparkles } from 'lucide-react';
import { NotificationItem } from '../types';

interface TopBarProps {
  notifications: NotificationItem[];
  onOpenNotifications?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  notifications,
  onOpenNotifications,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 py-2.5 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo matching the uploaded image */}
        <div className="flex items-center gap-2">
          <RentchLogo size="sm" showText={true} />
          <span className="hidden xs:inline-block text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full ml-1">
            Тбилиси
          </span>
        </div>

        {/* Minimal status / alerts */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              id="top-notif-btn"
              onClick={onOpenNotifications}
              className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold px-2.5 py-1 rounded-full border border-rose-200/60 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{unreadCount} новое</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
