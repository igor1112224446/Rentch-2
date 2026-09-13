import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Heart, 
  Sparkles, 
  X,
  Bot
} from 'lucide-react';
import { Apartment } from '../types';

interface RentchMatchModalProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (apartment: Apartment) => void;
}

export const RentchMatchModal: React.FC<RentchMatchModalProps> = ({
  apartment,
  isOpen,
  onClose,
  onOpenChat,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      const end = Date.now() + 1500;
      const colors = ['#f43f5e', '#fb7185', '#f59e0b', '#10b981', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen]);

  if (!isOpen || !apartment) return null;

  return (
    <AnimatePresence>
      <div 
        id="rentch-match-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      >
        <motion.div
          id="rentch-match-card"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-stone-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 text-center p-6"
        >
          {/* Close button */}
          <button
            id="close-match-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebratory badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-widest mb-3"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Взаимный мэтч</span>
          </motion.div>

          {/* Brand "Rentch!" Title */}
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-5xl font-black italic tracking-tighter bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-sm mb-2"
          >
            Rentch!
          </motion.h1>

          <p className="text-stone-300 text-sm mb-6 max-w-xs mx-auto">
            Поздравляем с новым мэтчем! Наш виртуальный ассистент уже готов согласовать удобное время просмотра квартиры.
          </p>

          {/* Apartment Photo with Heart */}
          <div className="flex justify-center mb-6 relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: 'spring' }}
              className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-stone-800 shadow-2xl bg-stone-800 group"
            >
              <img
                src={apartment.images[0]}
                alt={apartment.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Floating pulsing Heart badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ delay: 0.4, repeat: Infinity, duration: 1.6 }}
                className="absolute bottom-3 right-3 w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 border-2 border-white flex items-center justify-center shadow-xl text-white"
              >
                <Heart className="w-6 h-6 fill-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Apartment Mini Details */}
          <div className="bg-stone-800/80 rounded-2xl p-4 border border-stone-700/60 mb-6 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white truncate max-w-[220px]">
                {apartment.title}
              </h3>
              <span className="text-rose-400 font-extrabold text-base">
                ${apartment.priceUsd}/мес
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="truncate">{apartment.address}</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-stone-700/60 text-xs text-stone-300">
              <span className="bg-stone-700/60 px-2 py-0.5 rounded text-[11px] font-medium text-stone-200">
                {apartment.district}
              </span>
              <span className="bg-stone-700/60 px-2 py-0.5 rounded text-[11px] font-medium text-stone-200">
                {apartment.rooms} комн. ({apartment.areaSqm} м²)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded text-[11px]">
                Готова к просмотру
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              id="open-match-chat-btn"
              onClick={() => onOpenChat(apartment)}
              className="w-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg hover:shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-5 h-5 text-amber-200" />
              <span>Записаться на просмотр квартиры</span>
            </button>

            <button
              id="continue-swiping-btn"
              onClick={onClose}
              className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium py-3 px-4 rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Продолжить свайпать квартиры
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
