import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Heart, 
  X, 
  MapPin, 
  Home, 
  MessageCircle, 
  Maximize2, 
  Dog, 
  Armchair, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Apartment } from '../types';

interface TbilisiMapProps {
  apartments: Apartment[];
  onSelectApartment: (apartment: Apartment) => void;
  onLikeApartment: (apartment: Apartment) => void;
  onOpenDetails: (apartment: Apartment) => void;
  onMatchAndOpenChat?: (apartment: Apartment) => void;
  likedIds: string[];
}

export const TbilisiMap: React.FC<TbilisiMapProps> = ({
  apartments,
  onSelectApartment,
  onLikeApartment,
  onOpenDetails,
  onMatchAndOpenChat,
  likedIds,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(apartments[0] || null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on central Tbilisi (between Rustaveli, Vake, Sololaki)
    const map = L.map(mapContainerRef.current, {
      center: [41.7166, 44.7833],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when apartments change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    apartments.forEach((apt) => {
      const isLiked = likedIds.includes(apt.id);
      const isSelected = selectedApartment?.id === apt.id;

      // Custom HTML marker with price pill
      const customIcon = L.divIcon({
        className: 'custom-rentch-marker',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}">
            <div class="px-2.5 py-1 rounded-full text-xs font-black shadow-lg border-2 flex items-center gap-1 whitespace-nowrap ${
              isLiked 
                ? 'bg-emerald-500 border-white text-white' 
                : isSelected
                ? 'bg-stone-950 border-rose-500 text-white'
                : 'bg-white border-rose-500 text-stone-900'
            }">
              <span>$${apt.priceUsd}</span>
              ${isLiked ? '<span>♥</span>' : ''}
            </div>
            <div class="w-2 h-2 mx-auto rotate-45 -mt-1 ${
              isLiked 
                ? 'bg-emerald-500' 
                : isSelected 
                ? 'bg-stone-950' 
                : 'bg-white'
            }"></div>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 30],
      });

      const marker = L.marker([apt.lat, apt.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedApartment(apt);
        map.panTo([apt.lat, apt.lng], { animate: true, duration: 0.5 });
      });

      markersRef.current[apt.id] = marker;
    });
  }, [apartments, likedIds, selectedApartment?.id]);

  return (
    <div id="tbilisi-map-view" className="relative w-full h-[calc(100vh-140px)] rounded-3xl overflow-hidden shadow-lg border border-stone-200">
      {/* Map canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating map stats badge */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-stone-200 text-xs font-semibold text-stone-800 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-rose-500" />
        <span>Квартиры на карте Тбилиси: <strong className="text-rose-600 font-bold">{apartments.length}</strong></span>
      </div>

      {/* Selected Apartment Preview Bottom Card */}
      {selectedApartment && (
        <div 
          id="map-selected-apartment-card"
          className="absolute bottom-5 inset-x-4 sm:left-6 sm:right-auto sm:w-96 z-[400] bg-white rounded-3xl p-4 shadow-2xl border border-stone-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
        >
          <button
            type="button"
            onClick={() => setSelectedApartment(null)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3">
            <img
              src={selectedApartment.images[0]}
              alt={selectedApartment.title}
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold uppercase tracking-wide">
                <span>{selectedApartment.district}</span>
              </div>
              <h4 className="font-bold text-sm text-stone-900 truncate mt-0.5">
                {selectedApartment.title}
              </h4>
              <div className="text-base font-extrabold text-stone-900 mt-1">
                ${selectedApartment.priceUsd} <span className="text-xs text-stone-500 font-normal">/ мес</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                {selectedApartment.address}
              </p>
            </div>
          </div>

          {/* Quick tags */}
          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-stone-600">
            <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">
              {selectedApartment.rooms} комн. ({selectedApartment.areaSqm} м²)
            </span>
            <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">
              {selectedApartment.furniture === 'full' ? 'Мебель ✓' : 'Без мебели'}
            </span>
            <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">
              {selectedApartment.petPolicy === 'allowed' ? 'Pets 🐾' : 'Без питомцев'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              id="map-card-details-btn"
              onClick={() => {
                const targetApt = selectedApartment;
                setSelectedApartment(null);
                onOpenDetails(targetApt);
              }}
              className="flex-1 py-2 px-3 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-semibold text-center transition-colors cursor-pointer"
            >
              Подробнее
            </button>

            <button
              type="button"
              id="map-card-like-btn"
              onClick={() => {
                const targetApt = selectedApartment;
                setSelectedApartment(null);
                if (onMatchAndOpenChat) {
                  onMatchAndOpenChat(targetApt);
                } else {
                  onLikeApartment(targetApt);
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Мэтч</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
