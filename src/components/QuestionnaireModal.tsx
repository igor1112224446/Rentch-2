import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Users, 
  Dog, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Sparkles,
  Phone,
  Send
} from 'lucide-react';
import { LeasePeriod, TbilisiDistrict, QuestionnaireAnswers, UserProfile } from '../types';
import { TBILISI_DISTRICTS } from '../data/mockApartments';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile, answers: QuestionnaireAnswers) => void;
  pendingApartmentTitle?: string;
  initialAnswers?: Partial<QuestionnaireAnswers>;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  pendingApartmentTitle,
  initialAnswers,
}) => {
  const [step, setStep] = useState<number>(1);
  
  // Questionnaire fields
  const [period, setPeriod] = useState<LeasePeriod>(initialAnswers?.period || 'month_to_year');
  const [peopleCount, setPeopleCount] = useState<number>(initialAnswers?.peopleCount || 2);
  const [hasPets, setHasPets] = useState<'none' | 'dog' | 'cat' | 'other'>(initialAnswers?.hasPets || 'none');
  const [district, setDistrict] = useState<TbilisiDistrict | 'all'>(initialAnswers?.preferredDistrict || 'all');

  // Registration fields
  const [fullName, setFullName] = useState<string>('Иван Смирнов');
  const [phone, setPhone] = useState<string>('+995 599 442 819');
  const [telegram, setTelegram] = useState<string>('@ivan_tbilisi');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answers: QuestionnaireAnswers = {
      period,
      peopleCount,
      hasPets,
      preferredDistrict: district,
    };

    const profile: UserProfile = {
      id: 'user-main',
      name: fullName.trim() || 'Арендатор',
      phone: phone.trim() || '+995 599 000 000',
      telegramUsername: telegram.trim() || '@rentch_user',
      isRegistered: true,
      questionnaireCompleted: true,
      questionnaire: answers,
      telegramNotificationsEnabled: true,
      telegramChatId: '849204123',
    };

    onComplete(profile, answers);
  };

  return (
    <AnimatePresence>
      <div 
        id="questionnaire-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          id="questionnaire-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 my-8"
        >
          {/* Header banner */}
          <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-6 text-white relative">
            <button
              id="close-questionnaire-btn"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-100 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Регистрация & Подбор Rentch</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight">
              Анкета арендатора
            </h2>
            <p className="text-sm text-rose-50/90 mt-1 max-w-md">
              {pendingApartmentTitle ? (
                <>Для бронирования просмотра объекта <strong className="text-white">«{pendingApartmentTitle}»</strong> ответьте на 4 вопроса — это поможет собственнику подтвердить показ, а Rentch подберет лучшие варианты!</>
              ) : (
                'Ответьте на 4 вопроса, чтобы мы подобрали идеальные квартиры в Тбилиси под ваши параметры!'
              )}
            </p>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            </div>
            <div className="flex justify-between text-xs text-white/80 mt-1">
              <span>Шаг 1: Параметры жилья</span>
              <span>Шаг 2: Контакты</span>
            </div>
          </div>

          {/* Form body */}
          <div className="p-6">
            {step === 1 ? (
              <div className="space-y-6">
                {/* Question A: Lease Period */}
                <div id="q-lease-period" className="space-y-2.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-800">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span>а) На какой период вы хотите арендовать жильё?</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { value: 'month', label: 'На месяц', desc: 'Краткосрочно' },
                      { value: 'month_to_year', label: 'От месяца до года', desc: 'Средний срок' },
                      { value: 'year_plus', label: 'От года', desc: 'Долгосрочно' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        id={`period-opt-${opt.value}`}
                        onClick={() => setPeriod(opt.value as LeasePeriod)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          period === opt.value
                            ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-sm ring-2 ring-rose-500/20'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                        }`}
                      >
                        <div className="text-xs font-semibold">{opt.label}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question B: People Count */}
                <div id="q-people-count" className="space-y-2.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-800">
                    <Users className="w-4 h-4 text-rose-500" />
                    <span>б) Сколько человек будет проживать?</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { count: 1, label: '1 человек' },
                      { count: 2, label: '2 человека' },
                      { count: 3, label: '3 человека' },
                      { count: 4, label: '4+ чел.' },
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        id={`people-opt-${item.count}`}
                        onClick={() => setPeopleCount(item.count)}
                        className={`py-2.5 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          peopleCount === item.count
                            ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-500/20'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question C: Pets */}
                <div id="q-pets" className="space-y-2.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-800">
                    <Dog className="w-4 h-4 text-rose-500" />
                    <span>в) Есть ли у вас домашние животные?</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'none', label: 'Нет животных' },
                      { key: 'cat', label: 'Кошка / Кот' },
                      { key: 'dog', label: 'Собака' },
                      { key: 'other', label: 'Другие' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        id={`pet-opt-${item.key}`}
                        onClick={() => setHasPets(item.key as any)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          hasPets === item.key
                            ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold ring-2 ring-rose-500/20'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question D: District in Tbilisi */}
                <div id="q-districts" className="space-y-2.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-800">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>г) В каком районе вы хотели бы снять жильё? (Тбилиси)</span>
                  </label>
                  <select
                    id="preferred-district-select"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer font-medium"
                  >
                    <option value="all">Все районы Тбилиси (любой подходящий)</option>
                    {TBILISI_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  id="next-step-btn"
                  onClick={() => setStep(2)}
                  className="w-full mt-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Продолжить регистрацию</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Быстрая регистрация:</span> Данные будут переданы собственнику в чате вместе с подтверждением бронирования просмотра, а также подключен Telegram-бот для моментальных уведомлений.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                    Ваше имя и фамилия
                  </label>
                  <input
                    type="text"
                    required
                    id="reg-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Например, Иван Смирнов"
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>Номер телефона (WhatsApp / Связь)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    id="reg-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+995 599 000 000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-500" />
                    <span>Telegram username (для мгновенных уведомлений)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="reg-telegram"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="absolute right-3 top-3 text-xs bg-sky-100 text-sky-700 font-medium px-2 py-0.5 rounded-md">
                      Bot Ready
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    id="back-step-btn"
                    onClick={() => setStep(1)}
                    className="px-4 py-3.5 rounded-2xl border border-stone-200 hover:border-stone-300 text-stone-700 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    id="complete-registration-btn"
                    className="flex-1 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Зарегистрироваться & Подтвердить</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
