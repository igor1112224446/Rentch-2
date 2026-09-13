import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  SlidersHorizontal, 
  DollarSign, 
  Armchair, 
  MapPin, 
  Calendar, 
  Dog, 
  RotateCcw,
  Check
} from 'lucide-react';
import { FilterState, FurnitureStatus, LeasePeriod, TbilisiDistrict } from '../types';
import { TBILISI_DISTRICTS } from '../data/mockApartments';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  matchingCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  matchingCount,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="filter-drawer-overlay"
        className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="filter-drawer-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-lg text-stone-900">Фильтры поиска</h3>
            </div>
            <button
              id="close-filters-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Options */}
          <div className="p-6 space-y-6 flex-1">
            {/* 1. Budget Filter */}
            <div id="filter-budget-group" className="space-y-3">
              <label className="flex items-center justify-between text-sm font-bold text-stone-900">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-rose-500" />
                  <span>Бюджет в месяц ($ USD)</span>
                </span>
                <span className="text-rose-600 font-extrabold text-sm">
                  ${localFilters.minPrice} — ${localFilters.maxPrice}
                </span>
              </label>

              {/* Slider controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-stone-500 font-medium">От (USD)</span>
                  <input
                    type="number"
                    min={200}
                    max={3000}
                    step={50}
                    id="filter-min-price-input"
                    value={localFilters.minPrice}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, minPrice: Number(e.target.value) })
                    }
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-900"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-medium">До (USD)</span>
                  <input
                    type="number"
                    min={200}
                    max={3000}
                    step={50}
                    id="filter-max-price-input"
                    value={localFilters.maxPrice}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) })
                    }
                    className="w-full mt-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-900"
                  />
                </div>
              </div>

              {/* Range slider for quick drag */}
              <input
                type="range"
                min={300}
                max={2000}
                step={50}
                value={localFilters.maxPrice}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>$300/мес</span>
                <span>$1000/мес</span>
                <span>$2000+/мес</span>
              </div>
            </div>

            {/* 2. Furniture Filter */}
            <div id="filter-furniture-group" className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
                <Armchair className="w-4 h-4 text-rose-500" />
                <span>Наличие мебели в квартире</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'any', label: 'Любая' },
                  { value: 'full', label: 'С мебелью' },
                  { value: 'partial', label: 'Частично' },
                  { value: 'none', label: 'Без мебели' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`furniture-filter-${opt.value}`}
                    onClick={() =>
                      setLocalFilters({ ...localFilters, furniture: opt.value as any })
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      localFilters.furniture === opt.value
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. District Filter */}
            <div id="filter-district-group" className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Район Тбилиси</span>
              </label>

              <select
                id="filter-district-select"
                value={localFilters.district}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, district: e.target.value as any })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 font-medium focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">Все районы города</option>
                {TBILISI_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Lease Duration */}
            <div id="filter-period-group" className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>Срок аренды</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'any', label: 'Любой срок' },
                  { value: 'month', label: 'На месяц' },
                  { value: 'month_to_year', label: '1 - 12 месяцев' },
                  { value: 'year_plus', label: 'От 1 года' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setLocalFilters({ ...localFilters, period: opt.value as any })
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      localFilters.period === opt.value
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Pet friendly toggle */}
            <div className="pt-2 border-t border-stone-100">
              <label className="flex items-center justify-between cursor-pointer py-2">
                <div className="flex items-center gap-2">
                  <Dog className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-semibold text-stone-800">
                    Только с животными (Pet-friendly)
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="pet-friendly-filter-checkbox"
                  checked={localFilters.petFriendlyOnly}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, petFriendlyOnly: e.target.checked })
                  }
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Footer with Apply / Reset */}
          <div className="p-6 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
            <button
              type="button"
              id="reset-filters-btn"
              onClick={handleReset}
              className="py-3 px-4 rounded-2xl border border-stone-200 hover:border-stone-300 bg-white text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить</span>
            </button>

            <button
              type="button"
              id="apply-filters-btn"
              onClick={handleApply}
              className="flex-1 py-3 px-5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Показать варианты ({matchingCount})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
