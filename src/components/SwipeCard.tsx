import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { 
  Heart, 
  X, 
  MapPin, 
  Info, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Maximize2, 
  Dog, 
  Armchair, 
  Calendar, 
  CheckCircle2, 
  RotateCcw,
  Train
} from 'lucide-react';
import { Apartment } from '../types';

interface SwipeCardProps {
  apartment: Apartment;
  onSwipe: (direction: 'left' | 'right') => void;
  onInfoClick: (apartment: Apartment) => void;
  isTopCard: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  apartment,
  onSwipe,
  onInfoClick,
  isTopCard,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [15, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-15, -120], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % apartment.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + apartment.images.length) % apartment.images.length);
  };

  const gelPrice = apartment.priceGel || Math.round(apartment.priceUsd * 2.72);

  const furnitureText = {
    full: 'С мебелью',
    partial: 'Частично',
    none: 'Без мебели',
  }[apartment.furniture];

  const periodText = {
    month: 'От 1 месяца',
    month_to_year: 'От 1 до 12 мес',
    year_plus: 'От 1 года',
  }[apartment.minPeriod];

  return (
    <motion.div
      id={`swipe-card-${apartment.id}`}
      style={isTopCard ? { x, rotate } : {}}
      drag={isTopCard ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
      className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden bg-white shadow-2xl border border-stone-200 select-none ${
        isTopCard ? 'cursor-grab touch-none z-10' : 'pointer-events-none'
      }`}
    >
      {/* Photo carousel container */}
      <div className="relative w-full h-[62%] bg-stone-900 overflow-hidden">
        <img
          src={apartment.images[currentImageIndex]}
          alt={apartment.title}
          className="w-full h-full object-cover"
        />

        {/* Gradient shadow for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-900/30" />

        {/* Swipe visual stamps */}
        {isTopCard && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 right-8 rotate-12 border-4 border-emerald-400 bg-emerald-500/20 backdrop-blur-xs text-emerald-400 font-black text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl tracking-wider uppercase z-20 pointer-events-none"
            >
              RENTCH! ♥
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 left-8 -rotate-12 border-4 border-rose-500 bg-rose-500/20 backdrop-blur-xs text-rose-500 font-black text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl tracking-wider uppercase z-20 pointer-events-none"
            >
              ПРОПУСК ✕
            </motion.div>
          </>
        )}

        {/* Image pagination indicators */}
        <div className="absolute top-3 inset-x-3 flex gap-1.5 z-10">
          {apartment.images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx === currentImageIndex ? 'bg-white shadow' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Left / Right click zones for photos */}
        {apartment.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Badges on image */}
        <div className="absolute top-8 left-4 flex flex-wrap gap-1.5 z-10">
          {apartment.isNew && (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          )}
          <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
            {apartment.district}
          </span>
        </div>

        {/* Bottom overlay info on image */}
        <div className="absolute bottom-3 inset-x-4 text-white z-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">
                  {apartment.currency === 'GEL' ? `${gelPrice} ₾` : `$${apartment.priceUsd}`}
                </span>
                <span className="text-xs text-stone-300 font-medium">
                  {apartment.currency === 'GEL' ? `/ мес (~$${apartment.priceUsd})` : `/ мес (~${gelPrice} ₾)`}
                </span>
              </div>
              <p className="text-xs text-stone-200 mt-0.5 flex items-center gap-1 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>{apartment.address}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick(apartment);
              }}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
              title="Подробнее о квартире"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body details */}
      <div className="p-4 sm:p-5 h-[38%] flex flex-col justify-between bg-white">
        <div>
          <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1">
            {apartment.title}
          </h3>

          {/* Quick Specs Chips */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="bg-stone-100 rounded-xl p-2 flex items-center gap-2 text-stone-700">
              <Home className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div>
                <div className="font-semibold">{apartment.rooms} комн.</div>
                <div className="text-[10px] text-stone-500">{apartment.areaSqm} м²</div>
              </div>
            </div>

            <div className="bg-stone-100 rounded-xl p-2 flex items-center gap-2 text-stone-700">
              <Armchair className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <div className="font-semibold truncate">{furnitureText}</div>
                <div className="text-[10px] text-stone-500">{apartment.floor}/{apartment.totalFloors} этаж</div>
              </div>
            </div>

            <div className="bg-stone-100 rounded-xl p-2 flex items-center gap-2 text-stone-700">
              <Dog className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div>
                <div className="font-semibold truncate">
                  {apartment.petPolicy === 'allowed' ? 'Pets OK' : apartment.petPolicy === 'cats_only' ? 'Кошки OK' : 'Без животных'}
                </div>
                <div className="text-[10px] text-stone-500">{periodText}</div>
              </div>
            </div>
          </div>

          {apartment.metro && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-stone-600 bg-rose-50/70 px-2.5 py-1 rounded-lg border border-rose-100/80">
              <Train className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="font-medium text-stone-800">{apartment.metro}</span>
            </div>
          )}
        </div>

        {/* Quick Highlights bar */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 font-medium text-stone-700">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Готова к заселению</span>
          </div>
          <span className="text-[11px] text-stone-400">
            Тбилиси • {apartment.district.split(' ')[0]}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
