import React, { useState } from 'react';
import { 
  MessageCircle, 
  Calendar, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Bot, 
  Clock, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { Apartment, ApartmentChat } from '../types';

interface DialoguesSectionProps {
  matchedApartments: Apartment[];
  chats: Record<string, ApartmentChat>;
  onOpenChat: (apartment: Apartment) => void;
  onExploreMore: () => void;
}

export const DialoguesSection: React.FC<DialoguesSectionProps> = ({
  matchedApartments,
  chats,
  onOpenChat,
  onExploreMore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Apartments that have an initialized chat or have been liked
  const activeDialogues = matchedApartments.filter((apt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.title.toLowerCase().includes(query) ||
      apt.district.toLowerCase().includes(query) ||
      apt.address.toLowerCase().includes(query)
    );
  });

  if (matchedApartments.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
          <MessageCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">Нет активных диалогов</h3>
        <p className="text-sm text-stone-500 mt-2 max-w-xs mx-auto leading-relaxed">
          Чтобы начать диалог и забронировать осмотр квартиры, свайпайте понравившиеся варианты вправо в ленте!
        </p>
        <button
          type="button"
          onClick={onExploreMore}
          className="mt-6 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Найти квартиру
        </button>
      </div>
    );
  }

  return (
    <div id="dialogues-section" className="max-w-3xl mx-auto py-2 sm:py-4 px-1 sm:px-4 space-y-2.5 sm:space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-1">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
            <span>Диалоги по аренде</span>
            <span className="text-xs bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-full">
              {activeDialogues.length}
            </span>
          </h2>
          <p className="hidden sm:block text-xs text-stone-500 mt-0.5">
            Обсуждение условий и согласование времени осмотра квартир в Тбилиси
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по диалогам..."
            className="w-full bg-white border border-stone-200 rounded-xl sm:rounded-2xl pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Dialogues list */}
      <div className="space-y-2 sm:space-y-3">
        {activeDialogues.map((apt) => {
          const chat = chats[apt.id];
          const messages = chat?.messages || [];
          const lastMsg = messages[messages.length - 1];
          const isViewingConfirmed = chat?.viewingConfirmed;

          return (
            <div
              key={apt.id}
              id={`dialogue-item-${apt.id}`}
              onClick={() => onOpenChat(apt)}
              className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border border-stone-200/90 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-2.5 sm:gap-3 group"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                {/* Image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={apt.images[0]}
                    alt={apt.title}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-stone-100 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center border sm:border-2 border-white shadow-xs">
                    <Bot className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Top row: Title + Price + Time */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {apt.title}
                      </h4>
                      <span className="text-[11px] sm:text-xs text-rose-600 font-extrabold flex-shrink-0">
                        {apt.currency === 'GEL' ? `${apt.priceGel || Math.round(apt.priceUsd * 2.72)} ₾` : `$${apt.priceUsd}`}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium flex-shrink-0">
                      {lastMsg ? lastMsg.timestamp : 'Недавно'}
                    </span>
                  </div>

                  {/* Message snippet */}
                  <p className="text-[11px] sm:text-xs text-stone-600 truncate mt-0.5 leading-snug">
                    {lastMsg ? (
                      <>
                        <span className="font-semibold text-stone-700">
                          {lastMsg.sender === 'user' ? 'Вы: ' : lastMsg.sender === 'bot' ? '🤖 Бот: ' : 'Менеджер: '}
                        </span>
                        {lastMsg.text}
                      </>
                    ) : (
                      'Робот готов забронировать осмотр...'
                    )}
                  </p>

                  {/* Status chip */}
                  <div className="mt-1 flex items-center gap-2">
                    {isViewingConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">
                          Осмотр: {chat.viewingSlot?.date} ({chat.viewingSlot?.time})
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-100">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 flex-shrink-0" />
                        <span className="truncate">Выбрать время осмотра</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chevron */}
              <div className="flex items-center text-stone-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
