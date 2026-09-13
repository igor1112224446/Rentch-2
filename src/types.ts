export type LeasePeriod = 'month' | 'month_to_year' | 'year_plus';

export type TbilisiDistrict =
  | 'Ваке (Vake)'
  | 'Сабуртало (Saburtalo)'
  | 'Вера (Vera)'
  | 'Мтацминда (Mtatsminda)'
  | 'Старый Тбилиси / Сололаки'
  | 'Чугурети / Марджанишвили'
  | 'Дидубе (Didube)'
  | 'Исани (Isani)'
  | 'Багеби (Bagebi)'
  | 'Диди Дигоми (Didi Dighomi)';

export type FurnitureStatus = 'full' | 'partial' | 'none';

export type PetPolicy = 'allowed' | 'cats_only' | 'dogs_only' | 'no_pets';

export interface Landlord {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  verified: boolean;
  responseTime: string;
  rating: number;
}

export interface Apartment {
  id: string;
  title: string;
  district: TbilisiDistrict;
  address: string;
  priceUsd: number;
  rooms: number;
  bedrooms: number;
  areaSqm: number;
  floor: number;
  totalFloors: number;
  furniture: FurnitureStatus;
  petPolicy: PetPolicy;
  minPeriod: LeasePeriod;
  maxResidents: number;
  images: string[];
  description: string;
  amenities: string[];
  lat: number;
  lng: number;
  landlord: Landlord;
  metro?: string;
  isNew?: boolean;
}

export interface QuestionnaireAnswers {
  period: LeasePeriod;
  peopleCount: number;
  hasPets: 'none' | 'dog' | 'cat' | 'other';
  preferredDistrict: TbilisiDistrict | 'all';
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegramUsername?: string;
  isRegistered: boolean;
  questionnaireCompleted: boolean;
  questionnaire?: QuestionnaireAnswers;
  telegramNotificationsEnabled: boolean;
  telegramChatId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'landlord' | 'user';
  text: string;
  timestamp: string;
  isAction?: boolean;
  actionType?: 'confirm_viewing' | 'registered' | 'viewing_scheduled';
  viewingData?: {
    date: string;
    time: string;
    status: 'pending' | 'confirmed';
  };
}

export interface ApartmentChat {
  apartmentId: string;
  messages: ChatMessage[];
  lastActivity: string;
  viewingConfirmed: boolean;
  viewingSlot?: {
    date: string;
    time: string;
  };
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  furniture: 'any' | FurnitureStatus;
  district: 'all' | TbilisiDistrict;
  period: 'any' | LeasePeriod;
  petFriendlyOnly: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  apartmentId: string;
  read: boolean;
  type: 'match' | 'new_listing' | 'viewing_confirmed';
}

export type CrmStage = 'registered' | 'viewing_scheduled' | 'viewing_done_thinking' | 'paid';

export interface CrmLead {
  id: string;
  clientName: string;
  clientPhone: string;
  clientTelegram?: string;
  stage: CrmStage;
  apartmentId?: string;
  apartmentTitle?: string;
  apartmentDistrict?: string;
  apartmentPriceUsd?: number;
  viewingSlot?: {
    date: string;
    time: string;
  };
  registeredAt: string;
  notes?: string;
  paidAmountUsd?: number;
  questionnaireSummary?: {
    period: string;
    peopleCount: number;
    pets: string;
    district: string;
  };
}
