/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Heart, 
  X, 
  RotateCcw, 
  Info, 
  SlidersHorizontal, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { 
  Apartment, 
  UserProfile, 
  QuestionnaireAnswers, 
  FilterState, 
  ApartmentChat, 
  ChatMessage, 
  NotificationItem,
  CrmLead
} from './types';
import { INITIAL_APARTMENTS } from './data/mockApartments';
import { INITIAL_CRM_LEADS } from './data/mockCrmLeads';
import { filterAndRecommendApartments } from './utils/filterAndRecommend';
import { TopBar } from './components/TopBar';
import { BottomNavBar, AppTab } from './components/BottomNavBar';
import { SwipeCard } from './components/SwipeCard';
import { RentchMatchModal } from './components/RentchMatchModal';
import { ChatModal } from './components/ChatModal';
import { QuestionnaireModal } from './components/QuestionnaireModal';
import { FilterDrawer } from './components/FilterDrawer';
import { TbilisiMap } from './components/TbilisiMap';
import { MatchesSection } from './components/MatchesSection';
import { DialoguesSection } from './components/DialoguesSection';
import { ApartmentDetailsModal } from './components/ApartmentDetailsModal';
import { AdminPanel } from './components/AdminPanel';
import { RealTimeNotificationToast } from './components/RealTimeNotificationToast';

export default function App() {
  // App State
  const [apartments, setApartments] = useState<Apartment[]>(INITIAL_APARTMENTS);
  const [activeTab, setActiveTab] = useState<AppTab>('swipe');

  // Swiping State
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<{ id: string; action: 'like' | 'dislike' }[]>([]);

  // User Profile & Questionnaire
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-default',
    name: '',
    phone: '',
    email: '',
    isRegistered: false,
    questionnaireCompleted: false,
    telegramNotificationsEnabled: false,
  });

  // CRM Leads State (preloaded + synced with user actions)
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>(INITIAL_CRM_LEADS);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 350,
    maxPrice: 2000,
    furniture: 'any',
    district: 'all',
    period: 'any',
    petFriendlyOnly: false,
  });

  // Chats with landlords/robot
  const [chats, setChats] = useState<Record<string, ApartmentChat>>({});

  // Modals
  const [matchModalApartment, setMatchModalApartment] = useState<Apartment | null>(null);
  const [chatModalApartment, setChatModalApartment] = useState<Apartment | null>(null);
  const [detailsModalApartment, setDetailsModalApartment] = useState<Apartment | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [pendingApartmentForViewing, setPendingApartmentForViewing] = useState<Apartment | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-welcome',
      title: 'Добро пожаловать в Rentch!',
      message: 'Свайпайте вправо понравившиеся квартиры в Тбилиси, чтобы обсудить условия аренды и записаться на осмотр.',
      timestamp: 'только что',
      apartmentId: 'apt-1',
      read: false,
      type: 'new_listing',
    },
  ]);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  // Filter & recommend apartments
  const filteredApartments = useMemo(() => {
    return filterAndRecommendApartments(apartments, filters, userProfile.questionnaire);
  }, [apartments, filters, userProfile.questionnaire]);

  // Remaining cards in deck
  const remainingCards = useMemo(() => {
    return filteredApartments.filter(
      (apt) => !likedIds.includes(apt.id) && !dislikedIds.includes(apt.id)
    );
  }, [filteredApartments, likedIds, dislikedIds]);

  const currentCard = remainingCards[0] || null;
  const nextCard = remainingCards[1] || null;

  // Matched apartments list
  const matchedApartments = useMemo(() => {
    return apartments.filter((apt) => likedIds.includes(apt.id));
  }, [apartments, likedIds]);

  // Active dialogues count
  const dialoguesCount = useMemo(() => {
    return Object.keys(chats).length;
  }, [chats]);

  // Initialize bot chat for an apartment
  const ensureChatInitialized = useCallback((apt: Apartment) => {
    setChats((prev) => {
      if (prev[apt.id]) return prev;

      const welcomeBotMsg: ChatMessage = {
        id: 'bot-welcome-' + apt.id,
        sender: 'bot',
        text: `Здравствуйте! Рады приветствовать вас в Rentch 🇬🇪\nПоздравляем с взаимным мэтчем по квартире «${apt.title}».\nЯ виртуальный помощник. Мы готовы забронировать удобное время для очного или онлайн-просмотра квартиры.\n\nПожалуйста, нажмите на кнопку подтверждения просмотра или выберите подходящий слот, чтобы зафиксировать время встречи!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAction: true,
        actionType: 'confirm_viewing',
      };

      return {
        ...prev,
        [apt.id]: {
          apartmentId: apt.id,
          messages: [welcomeBotMsg],
          lastActivity: 'только что',
          viewingConfirmed: false,
        },
      };
    });
  }, []);

  // Swiping actions
  const handleSwipeRight = (apartment: Apartment) => {
    if (!apartment) return;

    setLikedIds((prev) => [...prev, apartment.id]);
    setSwipeHistory((prev) => [...prev, { id: apartment.id, action: 'like' }]);
    ensureChatInitialized(apartment);

    // Trigger celebration match modal
    setMatchModalApartment(apartment);

    // Notification
    const newNotif: NotificationItem = {
      id: 'notif-match-' + Date.now(),
      title: 'Rentch! Новый мэтч',
      message: `Квартира «${apartment.title}» (${apartment.district}) добавлена в ваши мэтчи!`,
      timestamp: 'только что',
      apartmentId: apartment.id,
      read: false,
      type: 'match',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
  };

  const handleSwipeLeft = (apartment: Apartment) => {
    if (!apartment) return;
    setDislikedIds((prev) => [...prev, apartment.id]);
    setSwipeHistory((prev) => [...prev, { id: apartment.id, action: 'dislike' }]);
  };

  const handleUndoSwipe = () => {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));

    if (last.action === 'like') {
      setLikedIds((prev) => prev.filter((id) => id !== last.id));
    } else {
      setDislikedIds((prev) => prev.filter((id) => id !== last.id));
    }
  };

  const handleResetDeck = () => {
    setLikedIds([]);
    setDislikedIds([]);
    setSwipeHistory([]);
  };

  const handleOpenChat = (apt: Apartment) => {
    ensureChatInitialized(apt);
    setMatchModalApartment(null);
    setChatModalApartment(apt);
  };

  const handleSendMessage = (apartmentId: string, message: ChatMessage) => {
    setChats((prev) => {
      const existing = prev[apartmentId] || {
        apartmentId,
        messages: [],
        lastActivity: 'только что',
        viewingConfirmed: false,
      };
      return {
        ...prev,
        [apartmentId]: {
          ...existing,
          messages: [...existing.messages, message],
          lastActivity: 'только что',
        },
      };
    });
  };

  const handleRequestRegistration = (apt: Apartment) => {
    setPendingApartmentForViewing(apt);
    setIsQuestionnaireOpen(true);
  };

  // Confirm viewing & synchronize with CRM (Column "Записались на осмотр")
  const handleConfirmViewing = (apartmentId: string, date: string, time: string) => {
    const apt = apartments.find((a) => a.id === apartmentId);
    if (!apt) return;

    // 1. User message
    const userMsg: ChatMessage = {
      id: 'msg-confirm-' + Date.now(),
      sender: 'user',
      text: `Здравствуйте! Я подтверждаю бронирование осмотра квартиры на ${date} в ${time}.\nМои контактные данные: ${userProfile.name || 'Клиент'} (${userProfile.phone || '+995 599 00-00-00'}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 2. Bot message
    const botMsg: ChatMessage = {
      id: 'bot-confirmed-' + Date.now(),
      sender: 'bot',
      text: `✅ Отлично! Осмотр забронирован на ${date} в ${time}.\nЗаявка передана в отдел аренды. Ждём вас по адресу: ${apt.address}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAction: true,
      actionType: 'viewing_scheduled',
    };

    setChats((prev) => {
      const existing = prev[apartmentId];
      return {
        ...prev,
        [apartmentId]: {
          ...existing,
          messages: [...(existing?.messages || []), userMsg, botMsg],
          viewingConfirmed: true,
          viewingSlot: { date, time },
        },
      };
    });

    // 3. Sync to CRM Kanban Column "Записались на осмотр"
    setCrmLeads((prev) => {
      const existingLeadIndex = prev.findIndex(
        (l) => l.clientPhone === userProfile.phone && userProfile.phone !== ''
      );

      const updatedLead: CrmLead = {
        id: 'crm-viewing-' + Date.now(),
        clientName: userProfile.name || 'Новый арендатор',
        clientPhone: userProfile.phone || '+995 599 00-00-00',
        clientTelegram: userProfile.telegramUsername,
        stage: 'viewing_scheduled',
        apartmentId: apt.id,
        apartmentTitle: apt.title,
        apartmentDistrict: apt.district,
        apartmentPriceUsd: apt.priceUsd,
        viewingSlot: { date, time },
        registeredAt: 'Только что',
        notes: `Запись через приложение Rentch на осмотр объекта ${apt.title}`,
      };

      if (existingLeadIndex >= 0) {
        const next = [...prev];
        next[existingLeadIndex] = updatedLead;
        return next;
      }
      return [updatedLead, ...prev];
    });

    // Notification
    const newNotif: NotificationItem = {
      id: 'notif-viewing-' + Date.now(),
      title: 'Осмотр забронирован!',
      message: `Осмотр квартиры «${apt.title}» зафиксирован на ${date} в ${time}.`,
      timestamp: 'только что',
      apartmentId: apt.id,
      read: false,
      type: 'viewing_confirmed',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Simulated friendly landlord follow up
    setTimeout(() => {
      const landlordGreeting: ChatMessage = {
        id: 'landlord-welcome-' + Date.now(),
        sender: 'landlord',
        text: `Добрый день, ${userProfile.name || ''}! Осмотр на ${date} в ${time} подтверждён. Квартира на ${apt.address} готова к показу. До встречи!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChats((prev) => {
        const chat = prev[apartmentId];
        if (!chat) return prev;
        return {
          ...prev,
          [apartmentId]: {
            ...chat,
            messages: [...chat.messages, landlordGreeting],
          },
        };
      });
    }, 1500);
  };

  // Questionnaire completion & CRM sync (Column "Зарегистрировались в сервисе")
  const handleQuestionnaireComplete = (profile: UserProfile, answers: QuestionnaireAnswers) => {
    setUserProfile(profile);
    setIsQuestionnaireOpen(false);

    // Sync to CRM Kanban Column "Зарегистрировались в сервисе"
    const newCrmLead: CrmLead = {
      id: 'crm-registered-' + Date.now(),
      clientName: profile.name || 'Пользователь сервиса',
      clientPhone: profile.phone || '+995 599 00-00-00',
      clientTelegram: profile.telegramUsername,
      stage: 'registered',
      registeredAt: 'Только что',
      questionnaireSummary: {
        period: answers.period === 'month' ? 'на месяц' : answers.period === 'month_to_year' ? 'от 1 до 12 мес' : 'от года',
        peopleCount: answers.peopleCount,
        pets: answers.hasPets === 'none' ? 'Нет' : answers.hasPets === 'dog' ? 'Собака' : answers.hasPets === 'cat' ? 'Кошка' : 'Другие',
        district: answers.preferredDistrict === 'all' ? 'Все районы' : answers.preferredDistrict,
      },
      notes: 'Успешно прошёл регистрацию и заполнил анкету арендатора в приложении Rentch.',
    };

    setCrmLeads((prev) => [newCrmLead, ...prev]);

    // If pending viewing, complete it
    if (pendingApartmentForViewing) {
      handleConfirmViewing(pendingApartmentForViewing.id, 'Завтра (14 сентября)', '18:00');
      setPendingApartmentForViewing(null);
    }
  };

  // Property addition handlers for Admin
  const handleAddApartment = (newApt: Apartment) => {
    setApartments((prev) => [newApt, ...prev]);
  };

  const handleDeleteApartment = (id: string) => {
    setApartments((prev) => prev.filter((a) => a.id !== id));
  };

  const hasActiveFilters = 
    filters.minPrice > 350 || 
    filters.maxPrice < 2000 || 
    filters.furniture !== 'any' || 
    filters.district !== 'all' || 
    filters.period !== 'any' || 
    filters.petFriendlyOnly;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-rose-500 selection:text-white font-sans text-stone-900">
      {/* Top minimal header with official Rentch logo */}
      <TopBar
        notifications={notifications}
        onOpenNotifications={() => setActiveTab('dialogues')}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col">
        {/* Real-time Toast notification */}
        <RealTimeNotificationToast
          notification={activeToast}
          onDismiss={() => setActiveToast(null)}
          onClick={(notif) => {
            setActiveToast(null);
            const apt = apartments.find((a) => a.id === notif.apartmentId);
            if (apt) {
              if (notif.type === 'match' || notif.type === 'viewing_confirmed') {
                handleOpenChat(apt);
              } else {
                setDetailsModalApartment(apt);
              }
            }
          }}
        />

        {/* 1. Tinder Swipe View */}
        {activeTab === 'swipe' && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full pb-20">
            {/* Note: "Осталось вариантов" line has been completely removed per requirement #10 */}
            
            {/* Swipe Deck Container */}
            <div 
              id="swipe-deck-container"
              className="relative w-full h-[580px] sm:h-[620px] max-h-[78vh]"
            >
              {remainingCards.length > 0 ? (
                <>
                  {/* Underneath Card */}
                  {nextCard && (
                    <div className="absolute inset-0 w-full h-full scale-[0.96] translate-y-2 opacity-60 pointer-events-none">
                      <SwipeCard
                        apartment={nextCard}
                        onSwipe={() => {}}
                        onInfoClick={() => {}}
                        isTopCard={false}
                      />
                    </div>
                  )}

                  {/* Active Top Card */}
                  {currentCard && (
                    <SwipeCard
                      key={currentCard.id}
                      apartment={currentCard}
                      onSwipe={(dir) => {
                        if (dir === 'right') handleSwipeRight(currentCard);
                        else handleSwipeLeft(currentCard);
                      }}
                      onInfoClick={(apt) => setDetailsModalApartment(apt)}
                      isTopCard={true}
                    />
                  )}
                </>
              ) : (
                /* Empty deck state */
                <div 
                  id="empty-deck-card"
                  className="w-full h-full rounded-3xl border-2 border-dashed border-stone-200 bg-white p-8 flex flex-col items-center justify-center text-center shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Вы просмотрели все варианты</h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-xs leading-relaxed">
                    Вы можете начать свайпать заново или скорректировать параметры в фильтрах.
                  </p>

                  <div className="flex flex-col gap-2.5 mt-6 w-full max-w-xs">
                    <button
                      type="button"
                      id="reset-swipes-btn"
                      onClick={handleResetDeck}
                      className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Начать свайпать заново</span>
                    </button>

                    <button
                      type="button"
                      id="open-filters-empty-btn"
                      onClick={() => setIsFilterDrawerOpen(true)}
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-3 px-5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Изменить фильтры</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Swipe Controller Buttons */}
            {currentCard && (
              <div 
                id="swipe-controls-bar"
                className="flex items-center justify-center gap-4 mt-5 select-none"
              >
                {/* 1. Undo */}
                <button
                  type="button"
                  id="ctrl-undo-btn"
                  onClick={handleUndoSwipe}
                  disabled={swipeHistory.length === 0}
                  className="w-12 h-12 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:text-amber-500 text-stone-400 disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:text-stone-400 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                  title="Отменить последний свайп"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* 2. Dislike (Swipe Left) */}
                <button
                  type="button"
                  id="ctrl-dislike-btn"
                  onClick={() => handleSwipeLeft(currentCard)}
                  className="w-16 h-16 rounded-3xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-500 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  title="Пропустить квартиру (Свайп влево)"
                >
                  <X className="w-8 h-8 stroke-[2.5]" />
                </button>

                {/* 3. Info / Details */}
                <button
                  type="button"
                  id="ctrl-info-btn"
                  onClick={() => setDetailsModalApartment(currentCard)}
                  className="w-12 h-12 rounded-2xl bg-white border border-stone-200 hover:border-sky-400 hover:text-sky-500 text-stone-500 shadow-sm flex items-center justify-center transition-all cursor-pointer"
                  title="Подробная информация о квартире"
                >
                  <Info className="w-5 h-5" />
                </button>

                {/* 4. Like / Rentch Match (Swipe Right) */}
                <button
                  type="button"
                  id="ctrl-like-btn"
                  onClick={() => handleSwipeRight(currentCard)}
                  className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                  title="Нравится! Мэтч Rentch (Свайп вправо)"
                >
                  <Heart className="w-8 h-8 fill-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Tbilisi City Map View */}
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col pb-20">
            <TbilisiMap
              apartments={filteredApartments}
              onSelectApartment={(apt) => setDetailsModalApartment(apt)}
              onLikeApartment={(apt) => handleSwipeRight(apt)}
              onOpenDetails={(apt) => setDetailsModalApartment(apt)}
              likedIds={likedIds}
            />
          </div>
        )}

        {/* 3. Separate Section: Мэтчи */}
        {activeTab === 'matches' && (
          <MatchesSection
            matchedApartments={matchedApartments}
            chats={chats}
            onOpenChat={(apt) => handleOpenChat(apt)}
            onOpenDetails={(apt) => setDetailsModalApartment(apt)}
            onExploreMore={() => setActiveTab('swipe')}
          />
        )}

        {/* 4. Separate Section: Диалоги */}
        {activeTab === 'dialogues' && (
          <DialoguesSection
            matchedApartments={matchedApartments}
            chats={chats}
            onOpenChat={(apt) => handleOpenChat(apt)}
            onExploreMore={() => setActiveTab('swipe')}
          />
        )}

        {/* 5. Separate Section: Admin CRM & Property Upload Panel */}
        {activeTab === 'admin' && (
          <AdminPanel
            leads={crmLeads}
            onUpdateLeads={setCrmLeads}
            apartments={apartments}
            onAddApartment={handleAddApartment}
            onDeleteApartment={handleDeleteApartment}
            onClose={() => setActiveTab('swipe')}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar (all buttons on one screen on phone) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchesCount={matchedApartments.length}
        dialoguesCount={dialoguesCount}
        onOpenFilters={() => setIsFilterDrawerOpen(true)}
        onOpenProfile={() => setIsQuestionnaireOpen(true)}
        hasActiveFilters={hasActiveFilters}
        isRegistered={userProfile.isRegistered}
      />

      {/* Modal 1: The "Rentch!" Celebration Match Modal */}
      <RentchMatchModal
        apartment={matchModalApartment}
        isOpen={!!matchModalApartment}
        onClose={() => setMatchModalApartment(null)}
        onOpenChat={(apt) => handleOpenChat(apt)}
      />

      {/* Modal 2: Chat with Landlord & Bot */}
      <ChatModal
        apartment={chatModalApartment}
        isOpen={!!chatModalApartment}
        onClose={() => setChatModalApartment(null)}
        userProfile={userProfile}
        chats={chats}
        onSendMessage={handleSendMessage}
        onRequestRegistration={handleRequestRegistration}
        onConfirmViewing={(apartmentId, date, time) =>
          handleConfirmViewing(apartmentId, date, time)
        }
      />

      {/* Modal 3: Questionnaire & Registration */}
      <QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        onComplete={handleQuestionnaireComplete}
        pendingApartmentTitle={pendingApartmentForViewing?.title}
        initialAnswers={userProfile.questionnaire}
      />

      {/* Modal 4: Filters Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onResetFilters={() =>
          setFilters({
            minPrice: 350,
            maxPrice: 2000,
            furniture: 'any',
            district: 'all',
            period: 'any',
            petFriendlyOnly: false,
          })
        }
        matchingCount={filteredApartments.length}
      />

      {/* Modal 5: Apartment Details */}
      <ApartmentDetailsModal
        apartment={detailsModalApartment}
        isOpen={!!detailsModalApartment}
        onClose={() => setDetailsModalApartment(null)}
        onLike={(apt) => handleSwipeRight(apt)}
        onDislike={(apt) => handleSwipeLeft(apt)}
        isLiked={detailsModalApartment ? likedIds.includes(detailsModalApartment.id) : false}
      />
    </div>
  );
}
