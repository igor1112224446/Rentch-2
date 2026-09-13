import { Apartment } from '../types';

export const TBILISI_DISTRICTS: Apartment['district'][] = [
  'Ваке (Vake)',
  'Сабуртало (Saburtalo)',
  'Вера (Vera)',
  'Мтацминда (Mtatsminda)',
  'Старый Тбилиси / Сололаки',
  'Чугурети / Марджанишвили',
  'Дидубе (Didube)',
  'Исани (Isani)',
  'Багеби (Bagebi)',
  'Диди Дигоми (Didi Dighomi)',
];

// База реальных объектов Тбилиси.
// Выдуманные тестовые объекты удалены по запросу.
// Реальные объекты загружаются через раздел CRM (PDF, ZIP-архив с фото или форма).
export const INITIAL_APARTMENTS: Apartment[] = [];

export const INCOMING_SIMULATED_LISTINGS: Apartment[] = [];
