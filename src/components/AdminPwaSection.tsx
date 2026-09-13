import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  Share2, 
  Wifi, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  RefreshCw,
  Palette,
  Sliders,
  Monitor
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { RentchLogo } from './RentchLogo';

export const AdminPwaSection: React.FC = () => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install } = usePWAInstall();

  // Customizer State
  const [appName, setAppName] = useState(() => localStorage.getItem('rentch_pwa_name') || 'Rentch — Аренда квартир в Тбилиси');
  const [shortName, setShortName] = useState(() => localStorage.getItem('rentch_pwa_short_name') || 'Rentch');
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('rentch_pwa_theme_color') || '#f43f5e');
  const [bgColor, setBgColor] = useState(() => localStorage.getItem('rentch_pwa_bg_color') || '#fafaf9');
  const [displayMode, setDisplayMode] = useState<'standalone' | 'minimal-ui' | 'fullscreen'>('standalone');
  const [description, setDescription] = useState(
    'Сервис подбора и долгосрочной аренды проверенных квартир в Тбилиси в формате свайпов, прямого чата с ботом и онлайн-записи на просмотры.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'ios' | 'android' | 'desktop'>(isIOS ? 'ios' : 'android');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rentch.ge';

  const manifestObject = {
    name: appName,
    short_name: shortName,
    description: description,
    theme_color: themeColor,
    background_color: bgColor,
    display: displayMode,
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    id: '/',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Свайпы квартир',
        short_name: 'Свайпы',
        url: '/#swipe',
      },
      {
        name: 'Мои совпадения',
        short_name: 'Мэтчи',
        url: '/#matches',
      },
      {
        name: 'Панель администратора',
        short_name: 'CRM',
        url: '/#admin',
      },
    ],
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('rentch_pwa_name', appName);
    localStorage.setItem('rentch_pwa_short_name', shortName);
    localStorage.setItem('rentch_pwa_theme_color', themeColor);
    localStorage.setItem('rentch_pwa_bg_color', bgColor);

    // Dynamically update document title & meta tags
    document.title = appName;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', themeColor);

    const metaAppleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (metaAppleTitle) metaAppleTitle.setAttribute('content', shortName);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(manifestObject, null, 2));
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 3000);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([JSON.stringify(manifestObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.webmanifest';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clientShareMessage = `Здравствуйте! Вот ссылка на наш сервис аренды квартир в Тбилиси Rentch: ${originUrl} \n\nОткройте её на телефоне и нажмите «Добавить на экран “Домой”», чтобы пользоваться как удобным мобильным приложением!`;

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(clientShareMessage);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 3000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(originUrl);
    setCopiedAppUrl(true);
    setTimeout(() => setCopiedAppUrl(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-stone-900 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold mb-3">
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA (Progressive Web Application) Ready</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Управление и генерация PWA-приложения Rentch
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
            Превратите веб-сайт Rentch в полноценное мобильное приложение для арендаторов и администраторов. 
            Оно устанавливается на домашний экран iPhone и Android без App Store / Google Play, поддерживает быстрый запуск во весь экран и работу офлайн.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {isStandalone ? (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Приложение уже запущено в режиме PWA (Standalone)</span>
              </div>
            ) : (
              <button
                type="button"
                id="pwa-admin-install-now-btn"
                onClick={install}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Установить Rentch на это устройство прямо сейчас</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyShareText}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              {copiedShareText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShareText ? 'Сообщение скопировано!' : 'Скопировать ссылку для клиентов'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Service Worker */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Service Worker</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-sm font-black text-stone-900 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Активен & Подключен</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              Управляет кэшем и обеспечивает мгновенную загрузку без интернета.
            </p>
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-3 pt-2 border-t border-stone-100">
            sw.js (auto-update)
          </div>
        </div>

        {/* Card 2: Manifest */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Манифест</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-sm font-black text-stone-900 mt-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-600" />
              <span>/manifest.webmanifest</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              Содержит иконки (192, 512px), тему #{themeColor.replace('#', '')} и быстрые шорткаты.
            </p>
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-3 pt-2 border-t border-stone-100">
            display: {displayMode}
          </div>
        </div>

        {/* Card 3: Display Mode */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Режим экрана</span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                {isStandalone ? 'PWA' : 'Браузер'}
              </span>
            </div>
            <div className="text-sm font-black text-stone-900 mt-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>{isStandalone ? 'Полноэкранный (Standalone)' : 'Обычная вкладка'}</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              {isStandalone ? 'Приложение открыто без рамок браузера.' : 'При установке адресная строка скроется.'}
            </p>
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-3 pt-2 border-t border-stone-100">
            {isIOS ? 'Платформа: Apple iOS' : 'Платформа: Android / Chrome / Web'}
          </div>
        </div>

        {/* Card 4: Offline Workbox */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Офлайн-кэш</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-sm font-black text-stone-900 mt-2 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-amber-600" />
              <span>Workbox Precache</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 leading-snug">
              Кэшируются стили, шрифты, скрипты и загруженные фото квартир.
            </p>
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-3 pt-2 border-t border-stone-100">
            StaleWhileRevalidate + CacheFirst
          </div>
        </div>
      </div>

      {/* Main 2-Column: Configurator & Client Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: PWA Manifest Settings (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-stone-900">Конфигуратор настроек PWA</h3>
                <p className="text-xs text-stone-500">Настройте параметры манифеста для смартфонов клиентов</p>
              </div>
            </div>

            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Сохранено!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Название приложения (name)
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Короткое имя под иконкой (short_name)
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  maxLength={16}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Тематический цвет
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-stone-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Фон сплеш-скрина
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-stone-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Режим отображения
                </label>
                <select
                  value={displayMode}
                  onChange={(e) => setDisplayMode(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900"
                >
                  <option value="standalone">standalone (нативное)</option>
                  <option value="fullscreen">fullscreen (во весь экран)</option>
                  <option value="minimal-ui">minimal-ui (с навигацией)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Описание для магазинов и манифеста
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyManifest}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedManifest ? 'Скопировано!' : 'Копировать JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadManifest}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать манифест</span>
                </button>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Применить настройки PWA</span>
              </button>
            </div>
          </form>

          {/* JSON Preview accordion */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <details className="group">
              <summary className="text-xs font-bold text-stone-600 cursor-pointer hover:text-stone-900 select-none flex items-center justify-between">
                <span>Просмотреть сгенерированный manifest.webmanifest (JSON)</span>
                <span className="text-[10px] text-stone-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <pre className="mt-2.5 p-3.5 bg-stone-900 text-stone-200 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(manifestObject, null, 2)}
              </pre>
            </details>
          </div>
        </div>

        {/* Right Column: Share & Client Link (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Share with Clients Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-stone-900">Ссылка для клиентов</h3>
                <p className="text-xs text-stone-500">Отправьте арендаторам для быстрой установки на телефон</p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Прямой URL сервиса</div>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200">
                <span className="text-xs font-mono text-stone-800 truncate">{originUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-stone-400 hover:text-stone-800 p-1 cursor-pointer transition"
                  title="Скопировать ссылку"
                >
                  {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-stone-700">Готовый текст сообщения:</div>
              <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-2xl border border-stone-100 leading-relaxed italic">
                «Здравствуйте! Вот ссылка на наш сервис аренды квартир в Тбилиси Rentch. 
                Откройте её на телефоне и нажмите «Добавить на экран “Домой”», чтобы пользоваться как удобным мобильным приложением!»
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyShareText}
              className="w-full bg-stone-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              {copiedShareText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedShareText ? 'Сообщение скопировано в буфер!' : 'Скопировать текст для Telegram/WhatsApp'}</span>
            </button>
          </div>

          {/* Device Installation Guides */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
            <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Гид по установке по устройствам</span>
            </h3>

            {/* Platform Tab Buttons */}
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveGuideTab('ios')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'ios' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Apple iOS
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('android')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'android' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('desktop')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'desktop' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                ПК / Mac
              </button>
            </div>

            {/* iOS Guide */}
            {activeGuideTab === 'ios' && (
              <div className="space-y-2 pt-1 text-xs text-stone-600 animate-fade-in">
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">1</span>
                  <span>Откройте сайт Rentch в браузере <strong>Safari</strong> на iPhone или iPad.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">2</span>
                  <span>Нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх) в нижней панели Safari.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">3</span>
                  <span>Пролистайте меню и нажмите <strong>«На экран “Домой”»</strong> (Add to Home Screen).</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">4</span>
                  <span>Нажмите «Добавить» — иконка Rentch появится на рабочем столе рядом с другими приложениями!</span>
                </div>
              </div>
            )}

            {/* Android Guide */}
            {activeGuideTab === 'android' && (
              <div className="space-y-2 pt-1 text-xs text-stone-600 animate-fade-in">
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">1</span>
                  <span>Откройте сайт в <strong>Google Chrome</strong> или Яндекс Браузере.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">2</span>
                  <span>Нажмите кнопку <strong>«Установить приложение»</strong> внизу экрана или в меню браузера (3 точки).</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">3</span>
                  <span>Подтвердите установку. Приложение появится в списке приложений телефона.</span>
                </div>
              </div>
            )}

            {/* Desktop Guide */}
            {activeGuideTab === 'desktop' && (
              <div className="space-y-2 pt-1 text-xs text-stone-600 animate-fade-in">
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">1</span>
                  <span>В Google Chrome или Microsoft Edge обратите внимание на адресную строку справа.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">2</span>
                  <span>Нажмите значок <strong>«Установить приложение Rentch»</strong> (монитор со стрелкой).</span>
                </div>
                <div className="flex items-start gap-2.5 bg-stone-50 p-2.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">3</span>
                  <span>Rentch откроется в отдельном окне без адресной строки и панели вкладок!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
