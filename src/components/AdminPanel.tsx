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
  FileCheck,
  Smartphone,
  AlertTriangle,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight as ChevronRightIcon,
  Archive,
  FolderArchive,
  Layers,
  Check
} from 'lucide-react';
import { CrmLead, CrmStage, Apartment, TbilisiDistrict, FurnitureStatus, PetPolicy, LeasePeriod, Currency } from '../types';
import { TBILISI_DISTRICTS } from '../data/mockApartments';
import { RentchLogo } from './RentchLogo';
import { AdminPwaSection } from './AdminPwaSection';
import { parseApartmentPdf, ExtractedPdfApartment } from '../utils/pdfParser';
import { parseZipArchive, ExtractedZipResult } from '../utils/zipParser';

interface AdminPanelProps {
  leads: CrmLead[];
  onUpdateLeads: (leads: CrmLead[]) => void;
  apartments: Apartment[];
  onAddApartment: (apartment: Apartment) => void;
  onDeleteApartment: (id: string) => void;
  onClearAllApartments?: () => void;
  onClearAllLeads?: () => void;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onLogout?: () => void;
  onViewApartment?: (apartment: Apartment) => void;
  onSwitchToSwipe?: () => void;
  onUpdateApartment?: (apartment: Apartment) => void;
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
  onClearAllApartments,
  onClearAllLeads,
  onClose,
  onAuthSuccess,
  onLogout,
  onViewApartment,
  onSwitchToSwipe,
  onUpdateApartment,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rentch_admin_auth') === 'true';
  });
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin Section Navigation
  const [adminTab, setAdminTab] = useState<'crm' | 'upload_form' | 'upload_pdf' | 'catalog' | 'pwa'>('crm');

  // Deletion Confirmation Dialogs
  const [leadToDelete, setLeadToDelete] = useState<CrmLead | null>(null);
  const [isDeleteAllLeadsOpen, setIsDeleteAllLeadsOpen] = useState(false);
  const [aptToDelete, setAptToDelete] = useState<Apartment | null>(null);
  const [isDeleteAllAptsOpen, setIsDeleteAllAptsOpen] = useState(false);

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
  const [formCurrency, setFormCurrency] = useState<Currency>('USD');
  const [formPriceAmount, setFormPriceAmount] = useState<number>(750);
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
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [formNewImageUrl, setFormNewImageUrl] = useState('');
  const [isFormZipExtracting, setIsFormZipExtracting] = useState(false);
  const [formZipNotice, setFormZipNotice] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // PDF & ZIP Archive Upload & Extraction State
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [pdfProcessingStep, setPdfProcessingStep] = useState<string>('');
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [pdfExtractedData, setPdfExtractedData] = useState<ExtractedPdfApartment | null>(null);
  const [pdfSuccessApartment, setPdfSuccessApartment] = useState<Apartment | null>(null);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [catalogZipToast, setCatalogZipToast] = useState('');

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

  // Delete lead with reliable in-app modal confirmation
  const handleRequestDeleteLead = (lead: CrmLead) => {
    setLeadToDelete(lead);
  };

  const handleConfirmDeleteLead = () => {
    if (!leadToDelete) return;
    onUpdateLeads(leads.filter((l) => l.id !== leadToDelete.id));
    setLeadToDelete(null);
  };

  const handleConfirmClearAllLeads = () => {
    onUpdateLeads([]);
    onClearAllLeads?.();
    setIsDeleteAllLeadsOpen(false);
  };

  const handleRequestDeleteApartment = (apt: Apartment) => {
    setAptToDelete(apt);
  };

  const handleConfirmDeleteApartment = () => {
    if (!aptToDelete) return;
    onDeleteApartment(aptToDelete.id);
    setAptToDelete(null);
  };

  const handleConfirmClearAllApartments = () => {
    if (onClearAllApartments) {
      onClearAllApartments();
    } else {
      apartments.forEach((a) => onDeleteApartment(a.id));
    }
    setIsDeleteAllAptsOpen(false);
  };

  // Currency toggle handler with intelligent auto-conversion
  const handleFormCurrencyChange = (newCurrency: Currency) => {
    if (newCurrency === formCurrency) return;
    if (newCurrency === 'GEL') {
      setFormCurrency('GEL');
      if (formPriceAmount) {
        setFormPriceAmount(Math.round(formPriceAmount * 2.72));
      }
    } else {
      setFormCurrency('USD');
      if (formPriceAmount) {
        setFormPriceAmount(Math.round(formPriceAmount / 2.72));
      }
    }
  };

  // Handle Manual Property Form Upload
  const handleCreateApartmentFromForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAddress.trim()) return;

    const parsedAmount = Number(formPriceAmount) || (formCurrency === 'USD' ? 750 : 2040);
    const priceUsd = formCurrency === 'USD'
      ? Math.round(parsedAmount)
      : Math.round(parsedAmount / 2.72);

    const priceGel = formCurrency === 'GEL'
      ? Math.round(parsedAmount)
      : Math.round(parsedAmount * 2.72);

    const newApt: Apartment = {
      id: 'apt-custom-' + Date.now(),
      title: formTitle.trim(),
      district: formDistrict,
      address: formAddress.trim(),
      priceUsd,
      priceGel,
      currency: formCurrency,
      originalPrice: parsedAmount,
      rooms: Number(formRooms) || 2,
      bedrooms: Number(formBedrooms) || 1,
      areaSqm: Number(formAreaSqm) || 50,
      floor: Number(formFloor) || 3,
      totalFloors: Number(formTotalFloors) || 9,
      furniture: formFurniture,
      petPolicy: formPetPolicy,
      minPeriod: formMinPeriod,
      maxResidents: formRooms * 2,
      images: formImages.length > 0 
        ? formImages 
        : [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
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
    const priceDisplay = formCurrency === 'GEL'
      ? `${priceGel} ₾ / мес (~$${priceUsd})`
      : `$${priceUsd} / мес (~${priceGel} ₾)`;
    setFormSuccessMessage(`Объект «${newApt.title}» (${priceDisplay}, ${newApt.images.length} фото) успешно опубликован и доступен в свайпах и на карте!`);
    setFormTitle('');
    setFormAddress('');
    setFormDescription('');
    setFormImages([
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ]);
    setTimeout(() => setFormSuccessMessage(''), 5000);
  };

  // ZIP Archive upload handler for manual form
  const handleUploadFormZip = async (file: File) => {
    setIsFormZipExtracting(true);
    setFormZipNotice(`Распаковка архива «${file.name}»...`);
    try {
      const result = await parseZipArchive(file);
      if (result.imageUrls.length === 0) {
        setFormZipNotice(`В архиве «${file.name}» не обнаружено файлов изображений (.jpg, .png, .webp).`);
        return;
      }
      setFormImages(result.imageUrls);
      setFormZipNotice(`Успешно распаковано ${result.totalImagesCount} фото! Все фотографии прогружены в карточку по отдельности.`);
      if (result.extractedTextNotes && !formDescription) {
        setFormDescription(result.extractedTextNotes);
      }
      setTimeout(() => setFormZipNotice(''), 6000);
    } catch (err: any) {
      console.error('Error unpacking zip in form:', err);
      setFormZipNotice('Ошибка распаковки архива. Убедитесь, что файл является корректным .zip архивом.');
      setTimeout(() => setFormZipNotice(''), 4000);
    } finally {
      setIsFormZipExtracting(false);
    }
  };

  // Real PDF & ZIP Archive File Upload & Extraction Handler
  const handleProcessArchiveOrPdfFile = async (file: File) => {
    const isZip = file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    if (!isZip && !isPdf) {
      setPdfError('Пожалуйста, выберите файл в формате .ZIP (архив с фото) или .PDF (презентация объекта)');
      return;
    }

    setSelectedUploadFile(file);
    setIsPdfProcessing(true);
    setPdfSuccessMessage('');
    setPdfSuccessApartment(null);
    setPdfError('');

    if (isZip) {
      setPdfProcessingStep(`Распаковка ZIP-архива «${file.name}» и извлечение фотографий по отдельности...`);
      try {
        const zipResult = await parseZipArchive(file);
        if (zipResult.images.length === 0) {
          setPdfError(`В архиве «${file.name}» не найдено файлов фотографий (.jpg, .png, .webp). Проверьте содержимое архива.`);
          return;
        }

        let titleGuess = file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
        let districtGuess: TbilisiDistrict = 'Ваке (Vake)';
        let priceGuess = 850;

        const combinedText = (file.name + ' ' + (zipResult.extractedTextNotes || '')).toLowerCase();
        if (combinedText.includes('сабуртало') || combinedText.includes('saburtalo')) {
          districtGuess = 'Сабуртало (Saburtalo)';
        } else if (combinedText.includes('мтацминда') || combinedText.includes('mtatsminda')) {
          districtGuess = 'Мтацминда (Mtatsminda)';
        } else if (combinedText.includes('вера') || combinedText.includes('vera')) {
          districtGuess = 'Вера (Vera)';
        } else if (combinedText.includes('чугурети') || combinedText.includes('chugureti') || combinedText.includes('марджанишвили')) {
          districtGuess = 'Чугурети / Марджанишвили';
        } else if (combinedText.includes('багеби') || combinedText.includes('bagebi')) {
          districtGuess = 'Багеби (Bagebi)';
        } else if (combinedText.includes('дидубе') || combinedText.includes('didube')) {
          districtGuess = 'Дидубе (Didube)';
        } else if (combinedText.includes('исани') || combinedText.includes('isani')) {
          districtGuess = 'Исани (Isani)';
        }

        const priceMatch = (zipResult.extractedTextNotes || '').match(/\$?\s*(\d{3,4})\s*(?:\$|usd|долл|\/мес)?/i);
        if (priceMatch && priceMatch[1]) {
          const p = parseInt(priceMatch[1], 10);
          if (p >= 250 && p <= 10000) priceGuess = p;
        }

        setPdfExtractedData({
          title: titleGuess || `Квартира в Тбилиси (${districtGuess})`,
          district: districtGuess,
          address: `г. Тбилиси, район ${districtGuess.split(' ')[0]}`,
          priceUsd: priceGuess,
          rooms: 2,
          bedrooms: 1,
          areaSqm: 60,
          floor: 4,
          totalFloors: 10,
          furniture: 'full',
          petPolicy: 'allowed',
          description: zipResult.extractedTextNotes || `Светлая уютная квартира в Тбилиси. Все ${zipResult.totalImagesCount} фотографий извлечены по отдельности из архива «${file.name}» и готовы к показу клиентам. Качественный ремонт, полный комплект бытовой техники и мебели.`,
          amenities: ['Кондиционер', 'Стиральная машина', 'Wi-Fi', 'Центральное отопление', 'Балкон', 'Оборудованная кухня'],
          images: zipResult.imageUrls,
          extractedFile: file.name,
          rawTextPreview: `ZIP-архив: ${file.name}\nВсего извлечено фото: ${zipResult.totalImagesCount} шт.\n\nСписок файлов в архиве:\n` +
            zipResult.images.map((img, i) => `${i + 1}. ${img.name} (${Math.round(img.sizeBytes / 1024)} KB)`).join('\n') +
            (zipResult.extractedTextNotes ? `\n\nТекстовые заметки из архива:\n${zipResult.extractedTextNotes}` : ''),
          sourceType: 'zip',
          zipFileNames: zipResult.images.map((i) => i.name),
        });

        setPdfSuccessMessage(`Из архива «${file.name}» успешно извлечено ${zipResult.totalImagesCount} фото! Все фотографии прогружены в карточку по отдельности.`);
      } catch (err: any) {
        console.error('Error parsing zip file:', err);
        setPdfError('Не удалось распаковать ZIP-архив. Убедитесь, что файл является корректным .zip архивом.');
      } finally {
        setIsPdfProcessing(false);
        setPdfProcessingStep('');
      }
    } else {
      // PDF processing
      setPdfProcessingStep('Распознавание страниц PDF и извлечение фотографий...');
      try {
        const extracted = await parseApartmentPdf(file);
        setPdfExtractedData({
          ...extracted,
          sourceType: 'pdf',
        });
      } catch (err: any) {
        console.error('Error parsing PDF file:', err);
        setPdfError('Внимание: не все текстовые блоки удалось распознать автоматически (возможно, сканированный PDF). Базовые поля заполнены, проверьте и скорректируйте их перед публикацией.');
        setPdfExtractedData({
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ') || 'Квартира в Тбилиси',
          district: 'Ваке (Vake)',
          address: 'Тбилиси, район Ваке',
          priceUsd: 850,
          rooms: 2,
          bedrooms: 1,
          areaSqm: 55,
          floor: 4,
          totalFloors: 9,
          furniture: 'full',
          petPolicy: 'allowed',
          description: 'Уютная и светлая квартира со свежим ремонтом и мебелью по материалам PDF-презентации.',
          amenities: ['Кондиционер', 'Стиральная машина', 'Wi-Fi', 'Центральное отопление', 'Балкон'],
          images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
          extractedFile: file.name,
          rawTextPreview: 'Файл: ' + file.name,
          sourceType: 'pdf',
        });
      } finally {
        setIsPdfProcessing(false);
        setPdfProcessingStep('');
      }
    }
  };

  // Update existing apartment photos from ZIP archive in catalog
  const handleUpdateApartmentPhotosFromZip = async (apt: Apartment, file: File) => {
    setCatalogZipToast(`Распаковка архива «${file.name}» для объекта «${apt.title}»...`);
    try {
      const result = await parseZipArchive(file);
      if (result.imageUrls.length === 0) {
        setCatalogZipToast(`В архиве «${file.name}» не найдено файлов изображений.`);
        setTimeout(() => setCatalogZipToast(''), 4000);
        return;
      }
      const updatedApt: Apartment = {
        ...apt,
        images: result.imageUrls,
      };
      onUpdateApartment?.(updatedApt);
      setCatalogZipToast(`Успешно прогружено ${result.totalImagesCount} фото из архива в карточку «${apt.title}»!`);
      setTimeout(() => setCatalogZipToast(''), 6000);
    } catch (e) {
      console.error(e);
      setCatalogZipToast('Ошибка распаковки архива.');
      setTimeout(() => setCatalogZipToast(''), 4000);
    }
  };

  // Preset Sample PDF Handler (allows 1-click test with real photos and Tbilisi details)
  const handleSelectSamplePdf = (sampleData: ExtractedPdfApartment) => {
    setIsPdfProcessing(true);
    setPdfProcessingStep('Извлечение характеристик и фото из образца...');
    setPdfSuccessMessage('');
    setPdfSuccessApartment(null);
    setPdfError('');
    setTimeout(() => {
      setIsPdfProcessing(false);
      setPdfProcessingStep('');
      setPdfExtractedData(sampleData);
    }, 500);
  };

  // Publish PDF apartment to Rentch database and offer directly to clients in cards
  const handleImportPdfApartment = () => {
    if (!pdfExtractedData) return;

    // Approximate district coordinates in Tbilisi
    let lat = 41.7151;
    let lng = 44.7874;
    const districtLower = pdfExtractedData.district.toLowerCase();
    if (districtLower.includes('ваке') || districtLower.includes('vake')) {
      lat = 41.7118; lng = 44.7571;
    } else if (districtLower.includes('сабуртало') || districtLower.includes('saburtalo')) {
      lat = 41.7289; lng = 44.7645;
    } else if (districtLower.includes('вера') || districtLower.includes('vera')) {
      lat = 41.7082; lng = 44.7834;
    } else if (districtLower.includes('мтацминда') || districtLower.includes('mtatsminda')) {
      lat = 41.6961; lng = 44.7938;
    } else if (districtLower.includes('чугурети') || districtLower.includes('chugureti')) {
      lat = 41.7126; lng = 44.8015;
    } else if (districtLower.includes('дидубе') || districtLower.includes('didube')) {
      lat = 41.7456; lng = 44.7789;
    } else if (districtLower.includes('багеби') || districtLower.includes('bagebi')) {
      lat = 41.7089; lng = 44.7321;
    } else if (districtLower.includes('исани') || districtLower.includes('isani')) {
      lat = 41.6892; lng = 44.8398;
    }

    const newApt: Apartment = {
      id: (pdfExtractedData.sourceType === 'zip' ? 'apt-zip-' : 'apt-pdf-') + Date.now(),
      title: pdfExtractedData.title.trim() || 'Апартаменты в Тбилиси',
      district: (pdfExtractedData.district as TbilisiDistrict) || 'Ваке (Vake)',
      address: pdfExtractedData.address.trim() || 'Тбилиси',
      priceUsd: Number(pdfExtractedData.priceUsd) || 800,
      rooms: Number(pdfExtractedData.rooms) || 2,
      bedrooms: Number(pdfExtractedData.bedrooms) || Math.max(1, (Number(pdfExtractedData.rooms) || 2) - 1),
      areaSqm: Number(pdfExtractedData.areaSqm) || 50,
      floor: Number(pdfExtractedData.floor) || 4,
      totalFloors: Number(pdfExtractedData.totalFloors) || 9,
      furniture: pdfExtractedData.furniture || 'full',
      petPolicy: pdfExtractedData.petPolicy || 'allowed',
      minPeriod: 'month_to_year',
      maxResidents: (Number(pdfExtractedData.rooms) || 2) * 2,
      images: pdfExtractedData.images.length > 0 
        ? pdfExtractedData.images 
        : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
      description: pdfExtractedData.description.trim() || 'Уютная современная квартира в Тбилиси.',
      amenities: pdfExtractedData.amenities && pdfExtractedData.amenities.length > 0
        ? pdfExtractedData.amenities
        : ['Кондиционер', 'Стиральная машина', 'Wi-Fi', 'Центральное отопление', 'Балкон'],
      lat: lat + (Math.random() - 0.5) * 0.015,
      lng: lng + (Math.random() - 0.5) * 0.015,
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
    setPdfSuccessApartment(newApt);
    const srcType = pdfExtractedData.sourceType === 'zip' ? 'ZIP-архива' : 'PDF';
    setPdfSuccessMessage(`Объект из ${srcType} «${newApt.title}» успешно размещён в карточках Rentch! ${newApt.images.length} фото по отдельности, цена $${newApt.priceUsd} и описание загружены и предлагаются клиентам.`);
    setPdfExtractedData(null);
    setSelectedUploadFile(null);
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'upload_pdf'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Загрузка: ZIP / PDF</span>
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
            id="admin-tab-pwa-btn"
            onClick={() => setAdminTab('pwa')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'pwa'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA-приложение</span>
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
              {leads.length > 0 && (
                <button
                  type="button"
                  id="clear-all-leads-btn"
                  onClick={() => setIsDeleteAllLeadsOpen(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Удалить всех клиентов из CRM"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Очистить CRM ({leads.length})</span>
                </button>
              )}

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
                              id={`delete-lead-btn-${lead.id}`}
                              onClick={() => handleRequestDeleteLead(lead)}
                              className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg border border-transparent hover:border-rose-200 transition-all cursor-pointer flex-shrink-0"
                              title="Удалить клиента из CRM"
                            >
                              <Trash2 className="w-4 h-4" />
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Стоимость аренды в месяц *
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Курс: 1 $ ≈ 2.72 ₾
                  </span>
                </div>

                <div className="flex rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent transition-all">
                  {/* Currency selector toggle: USD or GEL */}
                  <div className="flex p-1 bg-stone-200/70 border-r border-stone-200 gap-1 items-center flex-shrink-0">
                    <button
                      type="button"
                      id="form-currency-usd-btn"
                      onClick={() => handleFormCurrencyChange('USD')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        formCurrency === 'USD'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                      title="Выбрать доллары США"
                    >
                      <span>$ USD</span>
                      <span className="text-[10px] font-normal opacity-90 hidden sm:inline">(Доллары)</span>
                    </button>
                    <button
                      type="button"
                      id="form-currency-gel-btn"
                      onClick={() => handleFormCurrencyChange('GEL')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        formCurrency === 'GEL'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                      title="Выбрать грузинские лари"
                    >
                      <span>₾ GEL</span>
                      <span className="text-[10px] font-normal opacity-90 hidden sm:inline">(Лари)</span>
                    </button>
                  </div>

                  {/* Input field */}
                  <div className="relative flex-1 flex items-center">
                    <span className="pl-3.5 pr-1 text-sm font-bold text-stone-400 select-none">
                      {formCurrency === 'USD' ? '$' : '₾'}
                    </span>
                    <input
                      type="number"
                      id="form-price-input"
                      value={formPriceAmount || ''}
                      onChange={(e) => setFormPriceAmount(Math.max(0, Number(e.target.value)))}
                      min={formCurrency === 'USD' ? 50 : 150}
                      max={formCurrency === 'USD' ? 20000 : 60000}
                      required
                      placeholder={formCurrency === 'USD' ? '750' : '2000'}
                      className="w-full bg-transparent py-2.5 pr-4 text-xs font-bold text-stone-900 focus:outline-none"
                    />
                    <span className="pr-3 text-[11px] font-semibold text-stone-400 select-none flex-shrink-0">
                      / месяц
                    </span>
                  </div>
                </div>

                {/* Conversion helper banner & presets */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] px-1 pt-0.5">
                  <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                    <span className="text-stone-400">Эквивалент:</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                      {formCurrency === 'USD'
                        ? `≈ ${Math.round(formPriceAmount * 2.72).toLocaleString('ru-RU')} ₾ (Лари)`
                        : `≈ $${Math.round(formPriceAmount / 2.72).toLocaleString('ru-RU')} USD (Доллары)`
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400 mr-0.5">Быстро:</span>
                    {formCurrency === 'USD' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(500)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          $500
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(750)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          $750
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(1000)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          $1000
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(1400)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          $1400
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(1400)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          1400 ₾
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(2000)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          2000 ₾
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(2700)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          2700 ₾
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPriceAmount(4000)}
                          className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-semibold cursor-pointer transition"
                        >
                          4000 ₾
                        </button>
                      </>
                    )}
                  </div>
                </div>
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

              <div className="sm:col-span-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Фотографии объекта ({formImages.length})
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Загрузите фото архивом ZIP (все фото распакуются по отдельности) или добавьте ссылки
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto">
                    <Archive className="w-4 h-4 text-rose-500" />
                    <span>Загрузить ZIP-архив с фото</span>
                    <input
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFormZip(file);
                      }}
                    />
                  </label>
                </div>

                {/* ZIP Extraction Notice */}
                {formZipNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    {isFormZipExtracting ? (
                      <Clock className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    <span>{formZipNotice}</span>
                  </div>
                )}

                {/* Photos thumbnails grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {formImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-4/3 bg-stone-900 border border-stone-200 group shadow-2xs">
                      <img
                        src={imgUrl}
                        alt={`Фото ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-stone-950/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {idx === 0 ? '★ Обложка' : `#${idx + 1}`}
                      </div>
                      <div className="absolute inset-0 bg-stone-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formImages];
                              const [moved] = updated.splice(idx, 1);
                              updated.unshift(moved);
                              setFormImages(updated);
                            }}
                            className="bg-white/90 hover:bg-white text-stone-900 text-[10px] font-bold px-1.5 py-1 rounded shadow cursor-pointer"
                            title="Сделать обложкой"
                          >
                            Обложка
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formImages.filter((_, i) => i !== idx);
                            setFormImages(updated);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded cursor-pointer"
                          title="Удалить фото"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add photo by URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formNewImageUrl}
                    onChange={(e) => setFormNewImageUrl(e.target.value)}
                    placeholder="Или вставьте ссылку на ещё одно фото (Unsplash / CDN)..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formNewImageUrl.trim()) {
                        setFormImages((prev) => [...prev, formNewImageUrl.trim()]);
                        setFormNewImageUrl('');
                      }
                    }}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Добавить
                  </button>
                </div>
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

      {/* SECTION 3: PROPERTY UPLOAD VIA ZIP ARCHIVE OR PDF FILE */}
      {adminTab === 'upload_pdf' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Загрузка объекта: ZIP-архив с фото или PDF</h3>
              <p className="text-xs text-stone-500">
                Загрузите архив с фотографиями (.zip) или презентацию (.pdf). Система распакует все фото по отдельности, прогрузит их в карточку объекта, извлечёт параметры и предложит клиентам в свайпах!
              </p>
            </div>
          </div>

          {pdfError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{pdfError}</span>
            </div>
          )}

          {pdfSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{pdfSuccessMessage}</span>
            </div>
          )}

          {/* Success State & Apartment Preview */}
          {pdfSuccessApartment && (
            <div className="p-6 rounded-3xl bg-emerald-50/90 border border-emerald-200 space-y-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-900">Объект успешно опубликован в Rentch!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Карточка с {pdfSuccessApartment.images.length} отдельными фотографиями, ценой и описанием размещена в общей базе и сразу доступна клиентам для свайпов и записи на просмотр.
                  </p>
                </div>
              </div>

              {/* Apartment Preview Card */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-stone-900 flex-shrink-0 relative">
                  <img
                    src={pdfSuccessApartment.images[0]}
                    alt={pdfSuccessApartment.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-stone-950/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-rose-400" />
                    <span>{pdfSuccessApartment.images.length} фото</span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-lg">
                    ${pdfSuccessApartment.priceUsd} / мес
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                    {pdfSuccessApartment.district}
                  </div>
                  <h5 className="font-bold text-sm text-stone-900 leading-snug">
                    {pdfSuccessApartment.title}
                  </h5>
                  <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                    <span className="font-semibold">{pdfSuccessApartment.rooms}-комн.</span>
                    <span>•</span>
                    <span>{pdfSuccessApartment.areaSqm} м²</span>
                    <span>•</span>
                    <span className="truncate">{pdfSuccessApartment.address}</span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {pdfSuccessApartment.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {onSwitchToSwipe && (
                  <button
                    type="button"
                    id="view-client-swipes-btn"
                    onClick={() => {
                      onSwitchToSwipe();
                      onClose();
                    }}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Посмотреть в свайпах (как видит клиент)</span>
                  </button>
                )}

                {onViewApartment && (
                  <button
                    type="button"
                    id="view-apartment-modal-btn"
                    onClick={() => {
                      onViewApartment(pdfSuccessApartment);
                    }}
                    className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-stone-500" />
                    <span>Открыть подробную карточку</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setPdfSuccessApartment(null);
                    setPdfExtractedData(null);
                    setSelectedUploadFile(null);
                    setPdfSuccessMessage('');
                  }}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Загрузить ещё объект
                </button>
              </div>
            </div>
          )}

          {/* Drag and Drop Zone for ZIP & PDF */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingPdf(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingPdf(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingPdf(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                handleProcessArchiveOrPdfFile(file);
              }
            }}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
              isDraggingPdf 
                ? 'border-rose-500 bg-rose-50/60 scale-[1.01]' 
                : 'border-stone-300 hover:border-rose-400 bg-stone-50/50'
            }`}
          >
            <div className="flex justify-center items-center gap-2 mb-3">
              <Archive className={`w-10 h-10 transition-colors ${isDraggingPdf ? 'text-rose-500' : 'text-amber-500'}`} />
              <FileText className={`w-10 h-10 transition-colors ${isDraggingPdf ? 'text-rose-500' : 'text-rose-400'}`} />
            </div>
            <h4 className="font-bold text-sm text-stone-800">
              {isDraggingPdf ? 'Отпустите архив или PDF для загрузки' : 'Перетащите ZIP-архив с фото или PDF-презентацию сюда'}
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Поддерживаются ZIP-архивы с фото комнат (.zip) и PDF-презентации (.pdf). Система автоматически распакует все фотографии по отдельности!
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <label className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs cursor-pointer transition-colors inline-flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <span>Выбрать ZIP-архив с фото (.zip)</span>
                <input
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessArchiveOrPdfFile(file);
                  }}
                />
              </label>

              <label className="bg-stone-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs cursor-pointer transition-colors inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Выбрать PDF-файл (.pdf)</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessArchiveOrPdfFile(file);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Preset Demo Archives & PDFs to test 1-click unpacking */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Или протестируйте готовые образцы ZIP-архивов и PDF:
              </span>
              <span className="text-[11px] text-stone-400">1 клик для теста</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleSelectSamplePdf({
                    title: 'Дизайнерский пентхаус на Аракишвили',
                    district: 'Ваке (Vake)',
                    address: 'ул. Аракишвили, 14',
                    priceUsd: 950,
                    rooms: 2,
                    bedrooms: 1,
                    areaSqm: 68,
                    floor: 5,
                    totalFloors: 10,
                    furniture: 'full',
                    petPolicy: 'allowed',
                    description: 'Новый дом премиум-класса на Аракишвили в Ваке. Просторная кухня-гостиная с выходом на открытый балкон, мастер-спальня с гардеробной, дизайнерская мебель и вид в тихий зелёный двор.',
                    amenities: ['Кондиционер', 'Стиральная машина', 'Посудомоечная машина', 'Wi-Fi', 'Центральное отопление', 'Балкон', 'Подземный паркинг'],
                    images: [
                      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1554995207-c18c20360250?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
                    ],
                    extractedFile: 'Фото_Ваке_Пентхаус_6_фото.zip',
                    rawTextPreview: 'ZIP-АРХИВ: Фото_Ваке_Пентхаус_6_фото.zip\nИзвлечено фото: 6 шт. по отдельности\nФайлы в архиве:\n1. 1_гостиная_панорама.jpg\n2. 2_спальня_мастер.jpg\n3. 3_кухня_остров.jpg\n4. 4_ванная_комната.jpg\n5. 5_балкон_вид.jpg\n6. 6_прихожая_холл.jpg',
                    sourceType: 'zip',
                    zipFileNames: ['1_гостиная_панорама.jpg', '2_спальня_мастер.jpg', '3_кухня_остров.jpg', '4_ванная_комната.jpg', '5_балкон_вид.jpg', '6_прихожая_холл.jpg'],
                  })
                }
                className="p-3.5 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100">
                  <Archive className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-rose-600 truncate">
                    Фото_Ваке_Пентхаус.zip
                  </div>
                  <div className="text-[11px] text-stone-500">6 отдельных фото • Ваке</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectSamplePdf({
                    title: 'Видовая студия с террасой на Казбеги',
                    district: 'Сабуртало (Saburtalo)',
                    address: 'пр. Казбеги, 24',
                    priceUsd: 700,
                    rooms: 1,
                    bedrooms: 1,
                    areaSqm: 54,
                    floor: 8,
                    totalFloors: 14,
                    furniture: 'full',
                    petPolicy: 'cats_only',
                    description: 'Свежий скандинавский ремонт, станция метро Делиси в 3 минутах пешком. Охраняемая территория, большая терраса с панорамным видом на Тбилиси и горы.',
                    amenities: ['Кондиционер', 'Стиральная машина', 'Wi-Fi', 'Центральное отопление', 'Панорамный вид', 'Балкон'],
                    images: [
                      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1554995207-c18c20360250?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
                    ],
                    extractedFile: 'Фото_Сабуртало_Сканди_5_фото.zip',
                    rawTextPreview: 'ZIP-АРХИВ: Фото_Сабуртало_Сканди_5_фото.zip\nИзвлечено фото: 5 шт. по отдельности\nФайлы в архиве:\n1. 1_зал_студия.jpg\n2. 2_спальная_зона.jpg\n3. 3_терраса_панорама.jpg\n4. 4_кухонный_гарнитур.jpg\n5. 5_санузел.jpg',
                    sourceType: 'zip',
                    zipFileNames: ['1_зал_студия.jpg', '2_спальная_зона.jpg', '3_терраса_панорама.jpg', '4_кухонный_гарнитур.jpg', '5_санузел.jpg'],
                  })
                }
                className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100">
                  <Archive className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-amber-600 truncate">
                    Фото_Сабуртало_Сканди.zip
                  </div>
                  <div className="text-[11px] text-stone-500">5 отдельных фото • Сабуртало</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectSamplePdf({
                    title: 'Атмосферный пентхаус с камином на Мтацминде',
                    district: 'Мтацминда (Mtatsminda)',
                    address: 'ул. Чонкадзе, 18',
                    priceUsd: 1400,
                    rooms: 3,
                    bedrooms: 2,
                    areaSqm: 110,
                    floor: 4,
                    totalFloors: 4,
                    furniture: 'full',
                    petPolicy: 'allowed',
                    description: 'Уникальный пентхаус в историческом сердце Тбилиси у подножия фуникулёра. Настоящий дровяной камин, просторная видовая терраса 25 м² с обзором на весь старый город и Нарикала.',
                    amenities: ['Камин', 'Панорамный вид', 'Кондиционер', 'Стиральная машина', 'Посудомоечная машина', 'Wi-Fi', 'Паркинг'],
                    images: [
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
                      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
                    ],
                    extractedFile: 'Презентация_Мтацминда.pdf',
                    rawTextPreview: 'ЭКСКЛЮЗИВНОЕ ПРЕДЛОЖЕНИЕ\nТбилиси, Мтацминда, ул. Чонкадзе 18\nПентхаус 110 кв.м, 3 комнаты, 2 спальни, каминный зал\nАренда: 1400 USD / мес. Разрешено проживание с питомцами.',
                    sourceType: 'pdf',
                  })
                }
                className="p-3.5 rounded-2xl border border-stone-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-purple-600 truncate">
                    Презентация_Мтацминда.pdf
                  </div>
                  <div className="text-[11px] text-stone-500">110 м² • $1400 • Мтацминда</div>
                </div>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isPdfProcessing && (
            <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <div className="text-sm font-bold text-stone-800">
                {pdfProcessingStep || 'Обработка и распаковка файла...'}
              </div>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Система распаковывает архив, извлекает все фотографии по отдельности, распознаёт параметры и формирует карточку объекта для клиентов.
              </p>
            </div>
          )}

          {/* Extracted Metadata Card & Individual Photos Gallery */}
          {pdfExtractedData && !isPdfProcessing && (
            <div className="bg-stone-50/70 rounded-3xl p-6 border border-stone-200 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-black text-sm text-stone-900">
                      {pdfExtractedData.sourceType === 'zip' ? '📦 Извлечено из ZIP-архива' : '📄 Извлечено из PDF-файла'}: {pdfExtractedData.extractedFile}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Все фотографии по отдельности прогружены в карточку. Проверьте или скорректируйте данные перед публикацией клиентам
                    </p>
                  </div>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{pdfExtractedData.images.length} фото готово</span>
                </span>
              </div>

              {/* Extracted Individual Photos Gallery */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-rose-500" />
                      <span>Фотографии объекта по отдельности ({pdfExtractedData.images.length})</span>
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Первое фото — обложка карточки. Клиенты смогут листать все эти фото в карусели свайпа.
                    </p>
                  </div>

                  {/* Add more photos from ZIP button */}
                  <label className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto">
                    <Archive className="w-3.5 h-3.5 text-rose-500" />
                    <span>Добавить фото из другого ZIP-архива</span>
                    <input
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const res = await parseZipArchive(file);
                            if (res.imageUrls.length > 0) {
                              setPdfExtractedData({
                                ...pdfExtractedData,
                                images: [...pdfExtractedData.images, ...res.imageUrls],
                                zipFileNames: [...(pdfExtractedData.zipFileNames || []), ...res.images.map((img) => img.name)],
                              });
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {pdfExtractedData.images.map((imgUrl, idx) => {
                    const fileName = pdfExtractedData.zipFileNames?.[idx];
                    return (
                      <div key={idx} className="relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-900 border border-stone-200 group shadow-2xs">
                        <img
                          src={imgUrl}
                          alt={`Фото ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Photo index / cover badge */}
                        <div className="absolute top-1.5 left-1.5 bg-stone-950/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          {idx === 0 ? (
                            <span className="text-amber-400 font-black">★ Обложка</span>
                          ) : (
                            <span>#{idx + 1}</span>
                          )}
                        </div>

                        {/* Filename caption if extracted from zip */}
                        {fileName && (
                          <div className="absolute bottom-0 inset-x-0 bg-stone-950/80 backdrop-blur-xs text-stone-200 text-[9px] px-2 py-1 truncate">
                            {fileName}
                          </div>
                        )}

                        {/* Hover action overlay */}
                        <div className="absolute inset-0 bg-stone-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...pdfExtractedData.images];
                                const [moved] = updated.splice(idx, 1);
                                updated.unshift(moved);
                                const updatedNames = pdfExtractedData.zipFileNames ? [...pdfExtractedData.zipFileNames] : undefined;
                                if (updatedNames) {
                                  const [movedName] = updatedNames.splice(idx, 1);
                                  updatedNames.unshift(movedName);
                                }
                                setPdfExtractedData({
                                  ...pdfExtractedData,
                                  images: updated,
                                  zipFileNames: updatedNames,
                                });
                              }}
                              className="bg-white/95 hover:bg-white text-stone-900 text-[10px] font-bold px-2 py-1 rounded-md shadow cursor-pointer transition"
                              title="Сделать главной обложкой карточки"
                            >
                              Сделать обложкой
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...pdfExtractedData.images];
                              updated.splice(idx, 1);
                              const updatedNames = pdfExtractedData.zipFileNames ? [...pdfExtractedData.zipFileNames] : undefined;
                              if (updatedNames) {
                                updatedNames.splice(idx, 1);
                              }
                              setPdfExtractedData({
                                ...pdfExtractedData,
                                images: updated.length > 0 ? updated : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
                                zipFileNames: updatedNames,
                              });
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-md cursor-pointer transition"
                            title="Удалить это фото"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add photo by URL */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Добавить ещё ссылку на фото (Unsplash, CDN)..."
                    value={newPhotoUrlInput}
                    onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoUrlInput.trim()) {
                        setPdfExtractedData({
                          ...pdfExtractedData,
                          images: [...pdfExtractedData.images, newPhotoUrlInput.trim()]
                        });
                        setNewPhotoUrlInput('');
                      }
                    }}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Добавить фото
                  </button>
                </div>
              </div>

              {/* Form fields for extracted details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Название объекта
                  </label>
                  <input
                    type="text"
                    value={pdfExtractedData.title}
                    onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, title: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Стоимость ($ / месяц)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={pdfExtractedData.priceUsd}
                      onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, priceUsd: Number(e.target.value) || 0 })}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-2 font-bold text-rose-600 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Район Тбилиси
                  </label>
                  <select
                    value={pdfExtractedData.district}
                    onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, district: e.target.value as TbilisiDistrict })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 font-medium text-stone-900"
                  >
                    {TBILISI_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Точный адрес
                  </label>
                  <input
                    type="text"
                    value={pdfExtractedData.address}
                    onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, address: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 font-medium text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Комнат
                    </label>
                    <input
                      type="number"
                      value={pdfExtractedData.rooms}
                      onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, rooms: Number(e.target.value) || 1 })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Площадь (м²)
                    </label>
                    <input
                      type="number"
                      value={pdfExtractedData.areaSqm}
                      onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, areaSqm: Number(e.target.value) || 20 })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Мебель
                    </label>
                    <select
                      value={pdfExtractedData.furniture}
                      onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, furniture: e.target.value as FurnitureStatus })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-900"
                    >
                      <option value="full">С мебелью</option>
                      <option value="partial">Частично</option>
                      <option value="none">Без мебели</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Питомцы
                    </label>
                    <select
                      value={pdfExtractedData.petPolicy}
                      onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, petPolicy: e.target.value as PetPolicy })}
                      className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-900"
                    >
                      <option value="allowed">Разрешены</option>
                      <option value="cats_only">Только кошки</option>
                      <option value="dogs_only">Только собаки</option>
                      <option value="no_pets">Без животных</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Описание объекта для клиентов (извлечено из PDF)
                  </label>
                  <textarea
                    rows={4}
                    value={pdfExtractedData.description}
                    onChange={(e) => setPdfExtractedData({ ...pdfExtractedData, description: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Описание преимуществ, ремонта, техники и инфраструктуры..."
                  />
                </div>
              </div>

              {/* Raw Extracted Text Viewer Toggle */}
              {pdfExtractedData.rawTextPreview && (
                <div className="border-t border-stone-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showRawText ? 'Скрыть исходный текст из PDF' : 'Показать распознанный исходный текст из PDF'}</span>
                    <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform ${showRawText ? 'rotate-90' : ''}`} />
                  </button>
                  {showRawText && (
                    <pre className="mt-2 p-3 bg-white rounded-xl border border-stone-200 text-[10px] text-stone-600 overflow-x-auto whitespace-pre-wrap max-h-40 font-mono">
                      {pdfExtractedData.rawTextPreview}
                    </pre>
                  )}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                id="import-pdf-to-rentch-btn"
                onClick={handleImportPdfApartment}
                className="w-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Разместить в карточки и предложить клиентам</span>
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
            {apartments.length > 0 && (
              <button
                type="button"
                id="clear-all-apartments-btn"
                onClick={() => setIsDeleteAllAptsOpen(true)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить все объекты</span>
              </button>
            )}
          </div>

          {/* Catalog Toast */}
          {catalogZipToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{catalogZipToast}</span>
            </div>
          )}

          {apartments.length === 0 ? (
            <div className="bg-stone-50 border border-dashed border-stone-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <Home className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-stone-800">Каталог пуст</h4>
              <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4">
                Все тестовые объекты удалены. Загрузите реальные квартиры через ZIP-архив с фото или PDF либо заполните анкету вручную.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTab('upload_pdf')}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Загрузить ZIP с фото / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('upload_form')}
                  className="bg-stone-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Заполнить анкету
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apartments.map((apt) => (
                <div key={apt.id} className="border border-stone-200 rounded-2xl overflow-hidden p-3 flex gap-3 bg-stone-50/50 hover:shadow-xs transition">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-900">
                    <img
                      src={apt.images[0]}
                      alt={apt.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-stone-950/80 text-white text-[9px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                      <ImageIcon className="w-2.5 h-2.5 text-rose-400" />
                      <span>{apt.images.length}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 truncate">{apt.title}</h4>
                      <p className="text-[11px] text-stone-500 truncate">{apt.district}</p>
                      <div className="text-xs font-black text-rose-600 mt-0.5">
                        {apt.currency === 'GEL' 
                          ? `${apt.priceGel || Math.round(apt.priceUsd * 2.72)} ₾ (~$${apt.priceUsd})/мес`
                          : `$${apt.priceUsd} (~${apt.priceGel || Math.round(apt.priceUsd * 2.72)} ₾)/мес`
                        }
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                      <span>{apt.rooms} комн. • {apt.areaSqm} м²</span>
                      <div className="flex items-center gap-1">
                        <label className="text-stone-600 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg cursor-pointer transition flex items-center gap-1 border border-stone-200 hover:border-rose-200 text-[10px] font-bold" title="Загрузить ZIP-архив с фото для этого объекта">
                          <Archive className="w-3 h-3 text-rose-500" />
                          <span>ZIP фото</span>
                          <input
                            type="file"
                            accept=".zip,application/zip,application/x-zip-compressed"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpdateApartmentPhotosFromZip(apt, file);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRequestDeleteApartment(apt)}
                          className="text-stone-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg cursor-pointer transition"
                          title="Удалить объект"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: PWA APPLICATION GENERATOR & SETTINGS */}
      {adminTab === 'pwa' && (
        <AdminPwaSection />
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

      {/* Confirmation Modal 1: Delete Single Lead */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">Удалить клиента из CRM?</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Вы действительно хотите удалить клиента <strong className="text-stone-800">{leadToDelete.clientName}</strong> ({leadToDelete.clientPhone}) из воронки?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLead}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 2: Clear All Leads */}
      {isDeleteAllLeadsOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Очистить всю базу клиентов?</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Все клиенты ({leads.length}) будут безвозвратно удалены из всех 4-х этапов воронки CRM.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllLeadsOpen(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllLeads}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                Удалить всех
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 3: Delete Single Apartment */}
      {aptToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Удалить объект?</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Квартира «<strong className="text-stone-800">{aptToDelete.title}</strong>» будет удалена из ленты свайпов, каталога и карты.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAptToDelete(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteApartment}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 4: Clear All Apartments */}
      {isDeleteAllAptsOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Удалить все объекты?</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Все {apartments.length} объектов будут удалены. База будет пуста, пока вы не загрузите новые объекты через PDF или анкету.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllAptsOpen(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllApartments}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                Удалить все
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
