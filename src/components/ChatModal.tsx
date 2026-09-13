import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Apartment, ChatMessage, UserProfile, ApartmentChat } from '../types';

interface ChatModalProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  chats: Record<string, ApartmentChat>;
  onSendMessage: (apartmentId: string, message: ChatMessage) => void;
  onRequestRegistration: (apartment: Apartment) => void;
  onConfirmViewing: (apartmentId: string, date: string, time: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  apartment,
  isOpen,
  onClose,
  userProfile,
  chats,
  onSendMessage,
  onRequestRegistration,
  onConfirmViewing,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedDate, setSelectedDate] = useState('Завтра (14 сентября)');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = apartment ? chats[apartment.id] : null;
  const messages = currentChat?.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen || !apartment) return null;

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSendMessage(apartment.id, newMsg);
    setInputText('');

    // Simulate landlord auto-reply after short delay
    setTimeout(() => {
      const landlordReplies = [
        `Спасибо за сообщение! Квартира свободна и готова к заезду. Документы на собственность проверены.`,
        `Коммунальные платежи зимой составляют около 150-180 лари, интернет оптоволоконный 300 Мбит/с.`,
        `Буду рад показать квартиру в удобное вам время! Договор аренды оформляем на грузинском и русском/английском.`,
      ];
      const randomReply = landlordReplies[Math.floor(Math.random() * landlordReplies.length)];

      const landlordMsg: ChatMessage = {
        id: 'msg-landlord-' + Date.now(),
        sender: 'landlord',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onSendMessage(apartment.id, landlordMsg);
    }, 1200);
  };

  const handleBookingClick = () => {
    if (!userProfile.isRegistered || !userProfile.questionnaireCompleted) {
      // Step 3: Trigger questionnaire & registration flow
      onRequestRegistration(apartment);
    } else {
      // Already registered, confirm viewing directly
      onConfirmViewing(apartment.id, selectedDate, selectedTime);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="chat-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          id="chat-modal-window"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-[85vh] border border-stone-100"
        >
          {/* Header */}
          <div className="bg-stone-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={apartment.images[0]}
                  alt={apartment.title}
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-rose-500 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-stone-900 flex items-center justify-center text-[9px] font-bold text-white">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white truncate max-w-[200px] sm:max-w-xs">
                    {apartment.title}
                  </h3>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-semibold px-2 py-0.5 rounded-full border border-rose-500/30">
                    Rentch Аренда
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="truncate max-w-[200px]">{apartment.address}</span>
                  <span className="text-emerald-400 font-semibold">${apartment.priceUsd}/мес</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="close-chat-btn"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewing scheduling banner if not yet confirmed */}
          {!currentChat?.viewingConfirmed ? (
            <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-b border-rose-100 p-3.5 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span>Предложение просмотра от Rentch Bot</span>
                      <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-semibold">
                        Шаг 1
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Выберите время и нажмите «Подтвердить просмотр» (потребуется быстрая анкета)
                    </p>
                  </div>
                </div>

                {/* Date & Time Selectors */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    id="booking-date-select"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-800 font-medium shadow-2xs focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Сегодня (13 сентября)">Сегодня (13 сент)</option>
                    <option value="Завтра (14 сентября)">Завтра (14 сент)</option>
                    <option value="Послезавтра (15 сентября)">Послезавтра (15 сент)</option>
                    <option value="В выходные (19 сентября)">В субботу (19 сент)</option>
                  </select>

                  <select
                    id="booking-time-select"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-800 font-medium shadow-2xs focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="12:00">12:00 (день)</option>
                    <option value="15:00">15:00 (день)</option>
                    <option value="18:00">18:00 (вечер)</option>
                    <option value="19:30">19:30 (вечер)</option>
                    <option value="21:00">21:00 (поздний)</option>
                  </select>

                  <button
                    id="confirm-booking-header-btn"
                    onClick={handleBookingClick}
                    className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Подтвердить просмотр</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-b border-emerald-200 p-3 sm:px-6 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Просмотр забронирован на <strong className="font-bold">{currentChat.viewingSlot?.date} в {currentChat.viewingSlot?.time}</strong>
                </span>
              </div>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Бронь подтверждена
              </span>
            </div>
          )}

          {/* Messages list */}
          <div 
            id="chat-messages-container"
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50"
          >
            {messages.map((msg) => {
              if (msg.sender === 'bot') {
                return (
                  <div key={msg.id} className="flex items-start gap-3 max-w-lg">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-white border border-rose-100 rounded-3xl rounded-tl-xs p-4 shadow-sm text-stone-800 text-xs sm:text-sm">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-rose-600 text-xs flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Rentch Assistant Bot
                        </span>
                        <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                      {/* Action button inside bot message if viewing not yet confirmed */}
                      {!currentChat?.viewingConfirmed && (
                        <div className="mt-3 pt-3 border-t border-stone-100">
                          <button
                            id="bot-confirm-viewing-action-btn"
                            onClick={handleBookingClick}
                            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>
                              {!userProfile.isRegistered 
                                ? 'Подтвердить просмотр (через анкету)' 
                                : `Подтвердить слот: ${selectedDate}, ${selectedTime}`}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (msg.sender === 'landlord') {
                return (
                  <div key={msg.id} className="flex items-start gap-3 max-w-lg">
                    <div className="w-9 h-9 rounded-2xl bg-stone-800 text-amber-300 flex items-center justify-center flex-shrink-0 border border-stone-700 font-bold text-xs shadow-sm">
                      R
                    </div>
                    <div className="bg-white border border-stone-200 rounded-3xl rounded-tl-xs p-4 shadow-xs text-stone-800 text-xs sm:text-sm">
                      <div className="flex items-center justify-between gap-2 mb-1 text-xs">
                        <span className="font-semibold text-stone-900">Менеджер объекта (Rentch)</span>
                        <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              // User message
              return (
                <div key={msg.id} className="flex items-start justify-end gap-2.5">
                  <div className="bg-rose-500 text-white rounded-3xl rounded-tr-xs p-4 shadow-sm text-xs sm:text-sm max-w-lg">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-[10px] text-rose-100">{msg.timestamp}</span>
                      <span className="font-semibold text-rose-100 text-xs">Вы</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  <div className="w-9 h-9 rounded-2xl bg-stone-900 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {userProfile.name ? userProfile.name.charAt(0) : 'Я'}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-stone-100/60 border-t border-stone-200 flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
            {[
              'Какая сумма залога (депозита)?',
              'Возможен ли договор на 6 месяцев?',
              'Сколько стоят коммунальные услуги?',
              'Есть ли кондиционер во всех комнатах?',
            ].map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(promptText)}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-stone-700 hover:text-rose-600 rounded-full font-medium transition-colors cursor-pointer"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Chat input box */}
          <form 
            onSubmit={handleSendCustomMessage}
            className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              id="chat-message-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Напишите сообщение собственнику..."
              className="flex-1 bg-stone-100 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              id="send-chat-msg-btn"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
