import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Heart, 
  XCircle, 
  Home, 
  Dog, 
  Armchair, 
  Calendar, 
  Check, 
  ShieldCheck, 
  Phone, 
  Clock, 
  Sparkles,
  Train,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Apartment } from '../types';

interface ApartmentDetailsModalProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (apartment: Apartment) => void;
  onDislike: (apartment: Apartment) => void;
  isLiked?: boolean;
}

export const ApartmentDetailsModal: React.FC<ApartmentDetailsModalProps> = ({
  apartment,
  isOpen,
  onClose,
  onLike,
  onDislike,
  isLiked,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!isOpen || !apartment) return null;

  const gelPrice = Math.round(apartment.priceUsd * 2.72);

  const furnitureLabel = {
    full: 'Полностью меблирована (готова к заезду)',
    partial: 'Частично меблирована',
    none: 'Без мебели',
  }[apartment.furniture];

  const petLabel = {
    allowed: 'Разрешено с любыми домашними питомцами 🐾',
    cats_only: 'Разрешено только с кошками 🐱',
    dogs_only: 'Разрешено только с собаками 🐶',
    no_pets: 'Проживание без домашних животных',
  }[apartment.petPolicy];

  const periodLabel = {
    month: 'Краткосрочно (от 1 месяца)',
    month_to_year: 'Средний срок (от 1 до 12 месяцев)',
    year_plus: 'Долгосрочная аренда (от 1 года)',
  }[apartment.minPeriod];

  return (
    <AnimatePresence>
      <div 
        id="apartment-details-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          id="apartment-details-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-stone-100 flex flex-col max-h-[90vh]"
        >
          {/* Photos Header */}
          <div className="relative w-full h-72 sm:h-80 bg-stone-900 flex-shrink-0">
            <img
              src={apartment.images[photoIndex]}
              alt={apartment.title}
              className="w-full h-full object-cover"
            />

            <button
              id="close-details-btn"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {apartment.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPhotoIndex((p) => (p - 1 + apartment.images.length) % apartment.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoIndex((p) => (p + 1) % apartment.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo indicators */}
            <div className="absolute bottom-3 inset-x-4 flex justify-center gap-1.5 z-10">
              {apartment.images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === photoIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  {apartment.district}
                </span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-stone-900">${apartment.priceUsd}</span>
                  <span className="text-xs text-stone-500 ml-1">/ мес (~{gelPrice} ₾)</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-stone-900 mt-2">
                {apartment.title}
              </h2>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{apartment.address}</span>
                {apartment.metro && (
                  <span className="text-stone-700 ml-2 font-medium bg-stone-100 px-2 py-0.5 rounded">
                    {apartment.metro}
                  </span>
                )}
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-stone-500 text-[11px]">Комнат / Спален</div>
                <div className="font-bold text-stone-800 mt-0.5">{apartment.rooms} комн. ({apartment.bedrooms} спальни)</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-stone-500 text-[11px]">Площадь</div>
                <div className="font-bold text-stone-800 mt-0.5">{apartment.areaSqm} м² (этаж {apartment.floor}/{apartment.totalFloors})</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-stone-500 text-[11px]">Мебель</div>
                <div className="font-bold text-stone-800 mt-0.5">
                  {apartment.furniture === 'full' ? 'С мебелью' : apartment.furniture === 'partial' ? 'Частично' : 'Без мебели'}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-stone-500 text-[11px]">Питомцы</div>
                <div className="font-bold text-stone-800 mt-0.5">
                  {apartment.petPolicy === 'allowed' ? 'Разрешены' : apartment.petPolicy === 'cats_only' ? 'Кошки' : 'Запрещены'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Описание объекта
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed bg-stone-50/50 p-3.5 rounded-2xl border border-stone-100">
                {apartment.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Удобства и особенности
              </h4>
              <div className="flex flex-wrap gap-2">
                {apartment.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-medium"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Landlord profile block */}
            <div className="bg-stone-900 text-white rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={apartment.landlord.avatar}
                  alt={apartment.landlord.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">{apartment.landlord.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-stone-400">
                    Собственник жилья • Отвечает {apartment.landlord.responseTime}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-1 rounded-lg">
                  ★ {apartment.landlord.rating} рейтинг
                </span>
              </div>
            </div>
          </div>

          {/* Footer Swiping Actions */}
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
            <button
              type="button"
              id="details-dislike-btn"
              onClick={() => {
                onDislike(apartment);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl border border-stone-200 hover:border-stone-300 bg-white text-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-stone-400" />
              <span>Пропустить</span>
            </button>

            <button
              type="button"
              id="details-like-btn"
              onClick={() => {
                onLike(apartment);
                onClose();
              }}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{isLiked ? 'Открыть диалог Rentch' : 'Rentch! Нравится'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
