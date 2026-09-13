import { CrmLead } from '../types';

export const INITIAL_CRM_LEADS: CrmLead[] = [
  // 1. Зарегистрировались в сервисе
  {
    id: 'lead-1',
    clientName: 'Алексей Смирнов',
    clientPhone: '+995 599 12-34-56',
    clientTelegram: '@alex_smirnov_tbi',
    stage: 'registered',
    registeredAt: 'Сегодня, 10:25',
    questionnaireSummary: {
      period: 'от месяца до года',
      peopleCount: 2,
      pets: 'Кошка',
      district: 'Ваке (Vake)',
    },
    notes: 'Ищет квартиру с быстрым интернетом для удаленной работы',
  },
  {
    id: 'lead-2',
    clientName: 'Мария Власова',
    clientPhone: '+995 577 45-89-12',
    clientTelegram: '@maria_vlasova',
    stage: 'registered',
    registeredAt: 'Вчера, 18:40',
    questionnaireSummary: {
      period: 'от года',
      peopleCount: 1,
      pets: 'Нет',
      district: 'Сабуртало (Saburtalo)',
    },
    notes: 'Бюджет до $700, рассматривает метро Делиси или Технический университет',
  },

  // 2. Записались на осмотр
  {
    id: 'lead-3',
    clientName: 'Дмитрий Романов',
    clientPhone: '+995 591 88-99-00',
    clientTelegram: '@dmitry_rom',
    stage: 'viewing_scheduled',
    apartmentId: 'apt-1',
    apartmentTitle: 'Видовая студия с балконом в Ваке',
    apartmentDistrict: 'Ваке (Vake)',
    apartmentPriceUsd: 850,
    viewingSlot: {
      date: '14 сентября 2026',
      time: '18:00',
    },
    registeredAt: '12 сентября',
    notes: 'Забронировал осмотр через бота Rentch. Собственник предупрежден.',
  },
  {
    id: 'lead-4',
    clientName: 'Елена и Георгий',
    clientPhone: '+995 558 33-22-11',
    clientTelegram: '@elena_geo',
    stage: 'viewing_scheduled',
    apartmentId: 'apt-2',
    apartmentTitle: 'Просторная 2-комнатная у метро Делиси',
    apartmentDistrict: 'Сабуртало (Saburtalo)',
    apartmentPriceUsd: 650,
    viewingSlot: {
      date: '15 сентября 2026',
      time: '15:30',
    },
    registeredAt: '13 сентября',
    notes: 'Семья с ребенком. Важен лифт и парковка во дворе.',
  },

  // 3. Сделали осмотр, думают
  {
    id: 'lead-5',
    clientName: 'Константин Белов',
    clientPhone: '+995 593 11-44-77',
    clientTelegram: '@k_belov',
    stage: 'viewing_done_thinking',
    apartmentId: 'apt-3',
    apartmentTitle: 'Дизайнерский лофт с террасой на Вере',
    apartmentDistrict: 'Вера (Vera)',
    apartmentPriceUsd: 1100,
    viewingSlot: {
      date: '12 сентября 2026',
      time: '19:00',
    },
    registeredAt: '10 сентября',
    notes: 'Осмотр прошел успешно! Квартира очень понравилась. Обсуждают с собственником скидку $50 при оплате за 6 месяцев вперед.',
  },

  // 4. Оплатили
  {
    id: 'lead-6',
    clientName: 'Анна Кузнецова',
    clientPhone: '+995 595 77-88-99',
    clientTelegram: '@anna_kuzn',
    stage: 'paid',
    apartmentId: 'apt-4',
    apartmentTitle: 'Уютная квартира с камином в Сололаки',
    apartmentDistrict: 'Старый Тбилиси / Сололаки',
    apartmentPriceUsd: 900,
    paidAmountUsd: 1800, // первый месяц + депозит
    registeredAt: '8 сентября',
    notes: 'Договор аренды подписан на 1 год! Оплачен 1-й месяц ($900) + гарантийный депозит ($900). Заселение с 15 сентября.',
  },
];
