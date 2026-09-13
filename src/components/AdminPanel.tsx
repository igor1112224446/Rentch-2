import React, { useState } from 'react';
import { 
  Briefcase, 
  Lock, 
  LogOut, 
  Plus, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Building2, 
  Sparkles, 
  User, 
  Phone, 
  Send, 
  Trash2, 
  Edit3, 
  Eye, 
  Home, 
  MapPin, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { CrmLead, CrmStage, Apartment, TbilisiDistrict, FurnitureStatus, PetPolicy, LeasePeriod } from '../types';
import { TBILISI_DISTRICTS } from '../data/mockApartments';
import { RentchLogo } from './RentchLogo';

interface AdminPanelProps {
  leads: CrmLead[];
  onUpdateLeads: (leads: CrmLead[]) => void;
  apartments: Apartment[];
  onAddApartment: (apartment: Apartment) => void;
  onDeleteApartment: (id: string) => void;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onLogout?: () => void;
}

const STAGES: { key: CrmStage; title: string; color: string; bg: string; border: string }[] = [
  {
    key: 'registered',
    title: 'Зарегистрировались в сервисе',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    key: 'viewing_scheduled',
    title: 'Записались на осмотр',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    key: 'viewing_done_thinking',
    title: 'Сделали осмотр, думают',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    key: 'paid',
    title: 'Оплатили',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  leads,
  onUpdateLeads,
  apartments,
  onAddApartment,
  onDeleteApartment,
  onClose,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rentch_admin_auth') === 'true';
  });
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin Section Navigation
  const [adminTab, setAdminTab] = useState<'crm' | 'upload_form' | 'upload_pdf' | 'catalog'>('crm');

  // Search & Filters in CRM
  const [searchQuery, setSearchQuery] = useState('');

  // New Lead Modal State
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadTelegram, setNewLeadTelegram] = useState('');
  const [newLeadStage, setNewLeadStage] = useState<CrmStage>('registered');
  const [newLeadNotes, setNewLeadNotes] = useState('');

  // Object Upload Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDistrict, setFormDistrict] = useState<TbilisiDistrict>('Ваке (Vake)');
  const [formAddress, setFormAddress] = useState('');
  const [formPriceUsd, setFormPriceUsd] = useState<number>(750);
  const [formRooms, setFormRooms] = useState<number>(2);
  const [formBedrooms, setFormBedrooms] = useState<number>(1);
  const [formAreaSqm, setFormAreaSqm] = useState<number>(55);
  const [formFloor, setFormFloor] = useState<number>(4);
  const [formTotalFloors, setFormTotalFloors] = useState<number>(9);
  const [formFurniture, setFormFurniture] = useState<FurnitureStatus>('full');
  const [formPetPolicy, setFormPetPolicy] = useState<PetPolicy>('allowed');
  const [formMinPeriod, setFormMinPeriod] = useState<LeasePeriod>('month_to_year');
  const [formMetro, setFormMetro] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // PDF Upload State
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [pdfExtractedData, setPdfExtractedData] = useState<{
    title: string;
    district: TbilisiDistrict;
    address: string;
    priceUsd: number;
    rooms: number;
    areaSqm: number;
    furniture: FurnitureStatus;
    petPolicy: PetPolicy;
    description: string;
    extractedFile: string;
  } | null>(null);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Verification credentials as requested:
    // логин - ai9292@mail.ru ; пароль - redmay1968!
    if (loginInput.trim() === 'ai9292@mail.ru' && passwordInput.trim() === 'redmay1968!') {
      setIsAuthenticated(true);
      sessionStorage.setItem('rentch_admin_auth', 'true');
      onAuthSuccess?.();
    } else {
      setAuthError('Неверный логин или пароль администратора');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('rentch_admin_auth');
    onLogout?.();
  };

  const handleAutofill = () => {
    setLoginInput('ai9292@mail.ru');
    setPasswordInput('redmay1968!');
    setAuthError('');
  };

  // Move lead forward or backward in CRM pipeline
  const handleMoveLead = (leadId: string, direction: 'forward' | 'backward') => {
    const stageOrder: CrmStage[] = ['registered', 'viewing_scheduled', 'viewing_done_thinking', 'paid'];
    onUpdateLeads(
      leads.map((lead) => {
        if (lead.id !== leadId) return lead;
        const currentIndex = stageOrder.indexOf(lead.stage);
        const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= stageOrder.length) return lead;
        return {
          ...lead,
          stage: stageOrder[targetIndex],
        };
      })
    );
  };

  // Add lead manually
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    const newLead: CrmLead = {
      id: 'lead-custom-' + Date.now(),
      clientName: newLeadName.trim(),
      clientPhone: newLeadPhone.trim(),
      clientTelegram: newLeadTelegram.trim() || undefined,
      stage: newLeadStage,
      registeredAt: 'Только что',
      notes: newLeadNotes.trim() || undefined,
    };

    onUpdateLeads([newLead, ...leads]);
    setIsAddLeadModalOpen(false);
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadTelegram('');
    setNewLeadNotes('');
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Удалить эту карточку из CRM?')) {
      onUpdateLeads(leads.filter((l) => l.id !== leadId));
    }
  };

  // Handle Manual Property Form Upload
  const handleCreateApartmentFromForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAddress.trim()) return;

    const newApt: Apartment = {
      id: 'apt-custom-' + Date.now(),
      title: formTitle.trim(),
      district: formDistrict,
      address: formAddress.trim(),
      priceUsd: Number(formPriceUsd) || 700,
      rooms: Number(formRooms) || 2,
      bedrooms: Number(formBedrooms) || 1,
      areaSqm: Number(formAreaSqm) || 50,
      floor: Number(formFloor) || 3,
      totalFloors: Number(formTotalFloors) || 9,
      furniture: formFurniture,
      petPolicy: formPetPolicy,
      minPeriod: formMinPeriod,
      maxResidents: formRooms * 2,
      images: [
        formImageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      ],
      description: formDescription.trim() || 'Светлая, уютная квартира со свежим ремонтом и всей необходимой бытовой техникой в Тбилиси.',
      amenities: ['Кондиционер', 'Стиральная машина', 'Wi-Fi', 'Отопление Karma/Центральное', 'Балкон'],
      lat: 41.7151 + (Math.random() - 0.5) * 0.04,
      lng: 44.7874 + (Math.random() - 0.5) * 0.04,
      metro: formMetro.trim() || undefined,
      isNew: true,
      landlord: {
        id: 'landlord-admin',
        name: 'Отдел аренды Rentch',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        phone: '+995 599 00-11-22',
        verified: true,
        responseTime: '~5 минут',
        rating: 4.9,
      },
    };

    onAddApartment(newApt);
    setFormSuccessMessage(`Объект «${newApt.title}» успешно опубликован и доступен в свайпах и на карте!`);
    setFormTitle('');
    setFormAddress('');
    setFormDescription('');
    setTimeout(() => setFormSuccessMessage(''), 5000);
  };

  // Simulate PDF Upload & Metadata extraction
  const handleSimulatePdfUpload = (filename: string, mockData: typeof pdfExtractedData) => {
    setIsPdfProcessing(true);
    setPdfSuccessMessage('');
    setTimeout(() => {
      setIsPdfProcessing(false);
      setPdfExtractedData(mockData);
    }, 1200);
  };

  const handleImportPdfApartment = () => {
    if (!pdfExtractedData) return;

    const newApt: Apartment = {
      id: 'apt-pdf-' + Date.now(),
      title: pdfExtractedData.title,
      district: pdfExtractedData.district,
      address: pdfExtractedData.address,
      priceUsd: pdfExtractedData.priceUsd,
      rooms: pdfExtractedData.rooms,
      bedrooms: Math.max(1, pdfExtractedData.rooms - 1),
      areaSqm: pdfExtractedData.areaSqm,
      floor: 5,
      totalFloors: 12,
      furniture: pdfExtractedData.furniture,
      petPolicy: pdfExtractedData.petPolicy,
      minPeriod: 'month_to_year',
      maxResidents: pdfExtractedData.rooms * 2,
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      ],
      description: pdfExtractedData.description,
      amenities: ['Панорамные окна', 'Центральное отопление', 'Кондиционер', 'Посудомоечная машина', 'Подземный паркинг'],
      lat: 41.7100 + (Math.random() - 0.5) * 0.03,
      lng: 44.7600 + (Math.random() - 0.5) * 0.03,
      isNew: true,
      landlord: {
        id: 'landlord-pdf',
        name: 'Rentch Verified Partner',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
        phone: '+995 599 44-55-66',
        verified: true,
        responseTime: '~3 минуты',
        rating: 5.0,
      },
    };

    onAddApartment(newApt);
    setPdfSuccessMessage(`Объект из PDF «${newApt.title}» успешно импортирован в общую ленту Rentch!`);
    setPdfExtractedData(null);
    setSelectedPdfFile(null);
    setTimeout(() => setPdfSuccessMessage(''), 5000);
  };

  // Unauthenticated Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-xl text-stone-900 pb-24">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <RentchLogo size="lg" showText={false} />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Панель администратора</h2>
          <p className="text-xs text-stone-500 mt-1">
            Вход в CRM-систему сервиса Rentch Тбилиси
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Логин (Email)
            </label>
            <input
              type="email"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="ai9292@mail.ru"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {authError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            id="admin-login-btn"
            className="w-full bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Войти в систему CRM</span>
          </button>

          <button
            type="button"
            onClick={handleAutofill}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer text-center"
          >
            Вставить реквизиты администратора (1 клик)
          </button>
        </form>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div id="admin-panel-container" className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-5 pb-28">
      {/* Top Admin Header Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500 flex items-center justify-center shadow-md">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Rentch CRM & Управление
              </h2>
              <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Вы вошли как: <strong className="text-stone-200">ai9292@mail.ru</strong>
            </p>
          </div>
        </div>

        {/* Navigation tabs inside admin */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-800/90 p-1.5 rounded-2xl border border-stone-700">
          <button
            type="button"
            id="admin-tab-crm-btn"
            onClick={() => setAdminTab('crm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'crm'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Канбан CRM ({leads.length})
          </button>

          <button
            type="button"
            id="admin-tab-form-btn"
            onClick={() => setAdminTab('upload_form')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'upload_form'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Загрузка: Анкета
          </button>

          <button
            type="button"
            id="admin-tab-pdf-btn"
            onClick={() => setAdminTab('upload_pdf')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'upload_pdf'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Загрузка: PDF-файл
          </button>

          <button
            type="button"
            id="admin-tab-catalog-btn"
            onClick={() => setAdminTab('catalog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              adminTab === 'catalog'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Каталог ({apartments.length})
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer ml-1"
            title="Выйти из панели"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 1: KANBAN CRM BOARD */}
      {adminTab === 'crm' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени клиента, телефону, объекту..."
                className="w-full text-xs text-stone-900 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="add-lead-btn"
                onClick={() => setIsAddLeadModalOpen(true)}
                className="bg-stone-900 hover:bg-black text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить лид вручную</span>
              </button>
            </div>
          </div>

          {/* Kanban 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {STAGES.map((col) => {
              const colLeads = leads.filter((l) => {
                if (l.stage !== col.key) return false;
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  l.clientName.toLowerCase().includes(q) ||
                  l.clientPhone.toLowerCase().includes(q) ||
                  (l.apartmentTitle && l.apartmentTitle.toLowerCase().includes(q)) ||
                  (l.notes && l.notes.toLowerCase().includes(q))
                );
              });

              return (
                <div
                  key={col.key}
                  id={`crm-col-${col.key}`}
                  className="bg-stone-100/90 rounded-3xl p-3.5 border border-stone-200/80 flex flex-col min-h-[480px]"
                >
                  {/* Column Header */}
                  <div className={`p-3 rounded-2xl ${col.bg} ${col.border} border mb-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        col.key === 'registered' ? 'bg-sky-500' :
                        col.key === 'viewing_scheduled' ? 'bg-amber-500' :
                        col.key === 'viewing_done_thinking' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`} />
                      <h3 className={`font-black text-xs uppercase tracking-wider ${col.color}`}>
                        {col.title}
                      </h3>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-white/90 shadow-2xs text-stone-800">
                      {colLeads.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colLeads.length === 0 ? (
                      <div className="py-12 text-center text-xs text-stone-400">
                        В этом этапе пока нет заявок
                      </div>
                    ) : (
                      colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          id={`lead-card-${lead.id}`}
                          className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
                        >
                          {/* Client Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-stone-900 leading-snug">
                                {lead.clientName}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                                <Phone className="w-3 h-3 text-stone-400" />
                                <a href={`tel:${lead.clientPhone}`} className="hover:text-rose-600 transition-colors">
                                  {lead.clientPhone}
                                </a>
                              </div>
                              {lead.clientTelegram && (
                                <div className="text-[10px] text-sky-600 font-medium mt-0.5">
                                  TG: {lead.clientTelegram}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-stone-300 hover:text-rose-500 transition-colors cursor-pointer p-1"
                              title="Удалить карточку"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Object / Viewing info */}
                          {lead.apartmentTitle && (
                            <div className="bg-stone-50 rounded-xl p-2 text-xs border border-stone-100">
                              <div className="font-semibold text-stone-800 truncate">
                                🏠 {lead.apartmentTitle}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                                <span>{lead.apartmentDistrict}</span>
                                {lead.apartmentPriceUsd && (
                                  <span className="font-bold text-rose-600">${lead.apartmentPriceUsd}/мес</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Questionnaire summary for registered stage */}
                          {lead.questionnaireSummary && (
                            <div className="text-[11px] text-stone-600 bg-sky-50/70 p-2 rounded-xl border border-sky-100/80 space-y-1">
                              <div><strong>Район:</strong> {lead.questionnaireSummary.district}</div>
                              <div><strong>Срок:</strong> {lead.questionnaireSummary.period}</div>
                              <div><strong>Человек:</strong> {lead.questionnaireSummary.peopleCount} • <strong>Питомцы:</strong> {lead.questionnaireSummary.pets}</div>
                            </div>
                          )}

                          {/* Viewing Date for scheduled/thinking */}
                          {lead.viewingSlot && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              <span>{lead.viewingSlot.date} в {lead.viewingSlot.time}</span>
                            </div>
                          )}

                          {/* Paid amount badge */}
                          {lead.paidAmountUsd && (
                            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Оплачено: ${lead.paidAmountUsd}</span>
                            </div>
                          )}

                          {/* Notes */}
                          {lead.notes && (
                            <p className="text-[11px] text-stone-500 italic bg-stone-50/80 p-2 rounded-lg leading-relaxed">
                              "{lead.notes}"
                            </p>
                          )}

                          {/* Stage Movement Buttons */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-stone-400">{lead.registeredAt}</span>

                            <div className="flex items-center gap-1">
                              {col.key !== 'registered' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveLead(lead.id, 'backward')}
                                  className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                                  title="Переместить назад"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {col.key !== 'paid' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveLead(lead.id, 'forward')}
                                  className="px-2 py-1 bg-stone-900 hover:bg-black text-white text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Переместить на следующий этап"
                                >
                                  <span>Далее</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: PROPERTY UPLOAD VIA FORM */}
      {adminTab === 'upload_form' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Загрузка объекта: Заполнение анкеты</h3>
              <p className="text-xs text-stone-500">
                Заполните параметры квартиры, чтобы она мгновенно появилась в свайп-ленте пользователей Rentch
              </p>
            </div>
          </div>

          {formSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateApartmentFromForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Название объявления *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Например: Стильная видовая евротрешка с панорамой"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Район Тбилиси *
                </label>
                <select
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value as TbilisiDistrict)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {TBILISI_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Адрес (улица, номер) *
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="пр. Чавчавадзе, 42"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Аренда в месяц ($ USD) *
                </label>
                <input
                  type="number"
                  value={formPriceUsd}
                  onChange={(e) => setFormPriceUsd(Number(e.target.value))}
                  min={100}
                  max={10000}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Метро / Ориентир
                </label>
                <input
                  type="text"
                  value={formMetro}
                  onChange={(e) => setFormMetro(e.target.value)}
                  placeholder="м. Руставели (5 мин пешком)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Комнат
                  </label>
                  <input
                    type="number"
                    value={formRooms}
                    onChange={(e) => setFormRooms(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Площадь (м²)
                  </label>
                  <input
                    type="number"
                    value={formAreaSqm}
                    onChange={(e) => setFormAreaSqm(Number(e.target.value))}
                    min={15}
                    max={500}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Мебель
                  </label>
                  <select
                    value={formFurniture}
                    onChange={(e) => setFormFurniture(e.target.value as FurnitureStatus)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 text-xs"
                  >
                    <option value="full">С мебелью</option>
                    <option value="partial">Частично</option>
                    <option value="none">Без мебели</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Питомцы
                  </label>
                  <select
                    value={formPetPolicy}
                    onChange={(e) => setFormPetPolicy(e.target.value as PetPolicy)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 text-xs"
                  >
                    <option value="allowed">Разрешены</option>
                    <option value="cats_only">Только кошки</option>
                    <option value="dogs_only">Только собаки</option>
                    <option value="no_pets">Без животных</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Ссылка на фото квартиры
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2 text-xs text-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Описание
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Особенности квартиры, вид из окна, техника..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-property-form-btn"
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Опубликовать объект в базу Rentch</span>
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: PROPERTY UPLOAD VIA PDF FILE */}
      {adminTab === 'upload_pdf' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Загрузка объекта: Импорт из PDF-файла</h3>
              <p className="text-xs text-stone-500">
                Загрузите презентацию или выписку по квартире в формате PDF. Система автоматически извлечёт характеристики объекта!
              </p>
            </div>
          </div>

          {pdfSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{pdfSuccessMessage}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-stone-300 hover:border-rose-500 rounded-3xl p-8 text-center transition-colors bg-stone-50/50">
            <UploadCloud className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-stone-800">Перетащите PDF-файл сюда</h4>
            <p className="text-xs text-stone-500 mt-1">Поддерживаются презентации объектов недвижимости в Тбилиси до 25 МБ</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <label className="bg-white border border-stone-200 hover:border-stone-300 text-stone-800 font-semibold px-4 py-2 rounded-xl text-xs shadow-2xs cursor-pointer transition-colors inline-block">
                <span>Выбрать файл с диска</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedPdfFile(file);
                      handleSimulatePdfUpload(file.name, {
                        title: 'Современные апартаменты в ЖК Axis Towers',
                        district: 'Ваке (Vake)',
                        address: 'пр. Чавчавадзе, 37М',
                        priceUsd: 1250,
                        rooms: 3,
                        areaSqm: 85,
                        furniture: 'full',
                        petPolicy: 'allowed',
                        description: 'Эксклюзивная квартира с консьерж-сервисом, бассейном в комплексе и панорамным видом на Тбилиси.',
                        extractedFile: file.name,
                      });
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Preset Demo PDFs to test 1-click parsing */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Или протестируйте готовые образцы PDF-файлов:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleSimulatePdfUpload('Презентация_Квартира_Ваке_Аракишвили.pdf', {
                    title: 'Дизайнерская 2-комнатная квартира на Аракишвили',
                    district: 'Ваке (Vake)',
                    address: 'ул. Аракишвили, 14',
                    priceUsd: 950,
                    rooms: 2,
                    areaSqm: 68,
                    furniture: 'full',
                    petPolicy: 'allowed',
                    description: 'Новый дом премиум-класса, просторная кухня-гостиная, мастер-спальня, гардеробная и балкон в тихий двор.',
                    extractedFile: 'Презентация_Квартира_Ваке_Аракишвили.pdf',
                  })
                }
                className="p-3 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <FileText className="w-8 h-8 text-rose-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-rose-600 truncate">
                    Презентация_Квартира_Ваке.pdf
                  </div>
                  <div className="text-[11px] text-stone-500">68 м² • $950 • Ваке</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSimulatePdfUpload('Брошюра_Сабуртало_Казбеги_Панорама.pdf', {
                    title: 'Видовая студия с террасой на Казбеги',
                    district: 'Сабуртало (Saburtalo)',
                    address: 'пр. Казбеги, 24',
                    priceUsd: 700,
                    rooms: 2,
                    areaSqm: 54,
                    furniture: 'full',
                    petPolicy: 'cats_only',
                    description: 'Свежий ремонт в стиле сканди, метро Делиси в 3 минутах, охраняемая территория.',
                    extractedFile: 'Брошюра_Сабуртало_Казбеги_Панорама.pdf',
                  })
                }
                className="p-3 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <FileText className="w-8 h-8 text-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-rose-600 truncate">
                    Брошюра_Сабуртало_Казбеги.pdf
                  </div>
                  <div className="text-[11px] text-stone-500">54 м² • $700 • Сабуртало</div>
                </div>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isPdfProcessing && (
            <div className="p-6 rounded-2xl bg-stone-100 text-center space-y-2 animate-pulse">
              <Clock className="w-6 h-6 text-rose-500 mx-auto animate-spin" />
              <div className="text-xs font-bold text-stone-800">Идёт распознавание и парсинг PDF-файла...</div>
              <p className="text-[11px] text-stone-500">Извлекаем характеристики объекта, адрес, стоимость и условия аренды</p>
            </div>
          )}

          {/* Extracted Metadata Card */}
          {pdfExtractedData && !isPdfProcessing && (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-stone-900">Данные успешно извлечены из PDF:</h4>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  100% готов к импорту
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-stone-200">
                <div><strong>Название:</strong> {pdfExtractedData.title}</div>
                <div><strong>Район:</strong> {pdfExtractedData.district}</div>
                <div><strong>Адрес:</strong> {pdfExtractedData.address}</div>
                <div><strong>Цена:</strong> <span className="text-rose-600 font-bold">${pdfExtractedData.priceUsd}/мес</span></div>
                <div><strong>Комнат:</strong> {pdfExtractedData.rooms}</div>
                <div><strong>Площадь:</strong> {pdfExtractedData.areaSqm} м²</div>
                <div><strong>Мебель:</strong> {pdfExtractedData.furniture === 'full' ? 'С мебелью' : 'Без мебели'}</div>
                <div><strong>Питомцы:</strong> {pdfExtractedData.petPolicy === 'allowed' ? 'Разрешены' : 'Только кошки'}</div>
              </div>

              <p className="text-xs text-stone-600 italic">
                "{pdfExtractedData.description}"
              </p>

              <button
                type="button"
                id="import-pdf-to-rentch-btn"
                onClick={handleImportPdfApartment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Импортировать объект в базу Rentch</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: CATALOG LIST */}
      {adminTab === 'catalog' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-stone-900">Каталог объектов в сервисе ({apartments.length})</h3>
              <p className="text-xs text-stone-500">Все активные квартиры, доступные клиентам в приложении</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.map((apt) => (
              <div key={apt.id} className="border border-stone-200 rounded-2xl overflow-hidden p-3 flex gap-3 bg-stone-50/50">
                <img
                  src={apt.images[0]}
                  alt={apt.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 truncate">{apt.title}</h4>
                    <p className="text-[11px] text-stone-500 truncate">{apt.district}</p>
                    <div className="text-xs font-black text-rose-600 mt-0.5">${apt.priceUsd}/мес</div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                    <span>{apt.rooms} комн. • {apt.areaSqm} м²</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Удалить объект «${apt.title}»?`)) {
                          onDeleteApartment(apt.id);
                        }
                      }}
                      className="text-stone-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for adding manual CRM lead */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-stone-900">Добавить клиента в CRM</h3>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Имя клиента *
                </label>
                <input
                  type="text"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="Иван Петров"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  placeholder="+995 599 00-00-00"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Telegram
                </label>
                <input
                  type="text"
                  value={newLeadTelegram}
                  onChange={(e) => setNewLeadTelegram(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Этап в канбане
                </label>
                <select
                  value={newLeadStage}
                  onChange={(e) => setNewLeadStage(e.target.value as CrmStage)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900"
                >
                  <option value="registered">Зарегистрировались в сервисе</option>
                  <option value="viewing_scheduled">Записались на осмотр</option>
                  <option value="viewing_done_thinking">Сделали осмотр, думают</option>
                  <option value="paid">Оплатили</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Заметка
                </label>
                <textarea
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  rows={2}
                  placeholder="Бюджет, предпочтения..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold"
                >
                  Создать лид
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
