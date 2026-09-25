import React, { useState } from 'react';
import {
  MapPin,
  Search,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Trees,
  X,
  ArrowRight,
  Filter,
  ShieldCheck,
  Sparkles,
  UserRound,
  Map as MapIcon,
  Calculator as CalculatorIcon,
  QrCode,
} from 'lucide-react';
import { useT } from '../../i18n/useT';

interface GisMonitoringSectionProps {
  onNavigate?: (page: string, params?: any) => void;
}

// Region and Forestry data structures
interface ContourData {
  id: string;
  name: string;
  areaHa: number;
  waterArea: number;
  shelterArea: number;
  forestArea: number;
  status: 'occupied' | 'in_review' | 'vacant';
  center: [number, number]; // lat, lng
  polygonCoords: string; // SVG path
}

interface ForestryEnterprise {
  id: string;
  name: string;
  contours: ContourData[];
}

interface RegionData {
  id: string;
  name: string;
  enterprises: ForestryEnterprise[];
}

const REGION_CATALOG: RegionData[] = [
  {
    id: 'andijon',
    name: 'Андижон вилояти',
    enterprises: [
      {
        id: 'andijon-dux',
        name: 'Андижон ДЎХ',
        contours: [
          {
            id: '5',
            name: '№5',
            areaHa: 0.52,
            waterArea: 0.1,
            shelterArea: 0.42,
            forestArea: 0.42,
            status: 'occupied',
            center: [40.7821, 72.3442],
            polygonCoords: 'M 140,110 L 220,100 L 250,180 L 190,260 L 120,240 L 100,160 Z',
          },
          {
            id: '12',
            name: '№12',
            areaHa: 1.35,
            waterArea: 0.2,
            shelterArea: 0.85,
            forestArea: 1.15,
            status: 'occupied',
            center: [40.7915, 72.356],
            polygonCoords: 'M 260,110 L 330,120 L 360,190 L 300,240 L 250,190 Z',
          },
          {
            id: '24',
            name: '№24',
            areaHa: 3.1,
            waterArea: 0.5,
            shelterArea: 1.2,
            forestArea: 2.6,
            status: 'vacant',
            center: [40.775, 72.331],
            polygonCoords: 'M 80,240 L 150,250 L 170,320 L 90,330 L 60,280 Z',
          },
        ],
      },
      {
        id: 'xonobod-dux',
        name: 'Хонобод ДЎХ',
        contours: [
          {
            id: '3',
            name: '№3',
            areaHa: 2.15,
            waterArea: 0.3,
            shelterArea: 0.9,
            forestArea: 1.85,
            status: 'occupied',
            center: [40.801, 73.002],
            polygonCoords: 'M 130,130 L 210,120 L 230,200 L 170,250 L 110,210 Z',
          },
        ],
      },
    ],
  },
  {
    id: 'qashqadaryo',
    name: 'Қашқадарё вилояти',
    enterprises: [
      {
        id: 'kitob-dux',
        name: 'Китоб ДЎХ',
        contours: [
          {
            id: '2',
            name: '№2',
            areaHa: 2.0,
            waterArea: 0.15,
            shelterArea: 0.65,
            forestArea: 1.85,
            status: 'occupied',
            center: [39.123, 66.884],
            polygonCoords: 'M 130,90 L 240,110 L 220,240 L 140,230 L 110,150 Z',
          },
          {
            id: '7',
            name: '№7',
            areaHa: 4.8,
            waterArea: 0.4,
            shelterArea: 1.4,
            forestArea: 4.4,
            status: 'occupied',
            center: [39.135, 66.892],
            polygonCoords: 'M 230,130 L 310,140 L 340,230 L 240,250 Z',
          },
        ],
      },
      {
        id: 'shahrisabz-dux',
        name: 'Шаҳрисабз ДЎХ',
        contours: [
          {
            id: '15',
            name: '№15',
            areaHa: 1.9,
            waterArea: 0.2,
            shelterArea: 0.5,
            forestArea: 1.7,
            status: 'vacant',
            center: [39.05, 66.83],
            polygonCoords: 'M 150,140 L 220,130 L 240,210 L 160,220 Z',
          },
        ],
      },
    ],
  },
  {
    id: 'surxondaryo',
    name: 'Сурхондарё вилояти',
    enterprises: [
      {
        id: 'boysun-dux',
        name: 'Бойсун ДЎХ',
        contours: [
          {
            id: '8',
            name: '№8',
            areaHa: 3.4,
            waterArea: 0.25,
            shelterArea: 1.1,
            forestArea: 3.15,
            status: 'occupied',
            center: [38.2, 67.2],
            polygonCoords: 'M 160,110 L 240,120 L 250,230 L 150,220 Z',
          },
        ],
      },
    ],
  },
  {
    id: 'jizzax',
    name: 'Жиззах вилояти',
    enterprises: [
      {
        id: 'zomin-dux',
        name: 'Зомин ДЎХ',
        contours: [
          {
            id: '4',
            name: '№4',
            areaHa: 5.2,
            waterArea: 0.6,
            shelterArea: 1.8,
            forestArea: 4.6,
            status: 'occupied',
            center: [39.95, 68.4],
            polygonCoords: 'M 140,100 L 230,110 L 260,240 L 160,230 Z',
          },
        ],
      },
    ],
  },
  {
    id: 'toshkent',
    name: 'Тошкент вилояти',
    enterprises: [
      {
        id: 'bostonliq-dux',
        name: 'Бўстонлиқ ДЎХ',
        contours: [
          {
            id: '9',
            name: '№9',
            areaHa: 2.8,
            waterArea: 0.35,
            shelterArea: 0.95,
            forestArea: 2.45,
            status: 'occupied',
            center: [41.55, 70.0],
            polygonCoords: 'M 150,110 L 230,100 L 250,220 L 160,230 Z',
          },
        ],
      },
    ],
  },
];

export const GisMonitoringSection: React.FC<GisMonitoringSectionProps> = ({ onNavigate }) => {
  const t = useT();

  // Active top tab: 'check' (Arizam yoki ruxsatnoma hujjatini tekshirish) or 'explore' (O'rmon fondi yerlarini ko'rish)
  const [activeTab, setActiveTab] = useState<'check' | 'explore'>('check');

  // Check Mode Form State
  const [checkType, setCheckType] = useState<'permit' | 'application'>('permit');
  const [permitQuery, setPermitQuery] = useState('');
  const [appId, setAppId] = useState('');
  const [checkResult, setCheckResult] = useState<{
    found: boolean;
    type: 'permit' | 'application';
    id: string;
    status: string;
    statusCode: 'accepted' | 'review' | 'issued';
    areaHa: number;
    regionName: string;
    enterpriseName: string;
    contourName: string;
    coords: string;
    date: string;
  } | null>(null);

  // Explore Mode Form State
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>('');
  const [selectedContourId, setSelectedContourId] = useState<string>('');
  const [contourSearch, setContourSearch] = useState('');
  const [appliedContour, setAppliedContour] = useState<ContourData | null>(null);
  const [appliedInfo, setAppliedInfo] = useState<{
    regionName: string;
    enterpriseName: string;
  } | null>(null);

  // Map Controls State
  const [mapMode, setMapMode] = useState<'satellite' | 'topo' | 'street'>('satellite');
  const [showContourPopup, setShowContourPopup] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Current enterprise & contours list
  const currentRegion = REGION_CATALOG.find((r) => r.id === selectedRegionId);
  const currentEnterprises = currentRegion ? currentRegion.enterprises : [];
  const currentEnterprise = currentEnterprises.find((e) => e.id === selectedEnterpriseId);
  const currentContours = currentEnterprise ? currentEnterprise.contours : [];

  // Filter contours based on search
  const filteredContours = currentContours.filter((c) =>
    contourSearch ? c.name.toLowerCase().includes(contourSearch.toLowerCase()) : true,
  );

  // Handle checking application or permit
  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (checkType === 'permit') {
      const fullQuery = permitQuery.trim().toUpperCase() || 'AB 000123';

      // Trigger test/parent router integration
      if (onNavigate) {
        onNavigate('verify', { query: fullQuery });
      }

      // Display status card on screen as requested in the audio
      setCheckResult({
        found: true,
        type: 'permit',
        id: fullQuery,
        status: 'Ruxsatnoma rasmiylashtirilgan',
        statusCode: 'issued',
        areaHa: 0.52,
        regionName: 'Андижон вилояти',
        enterpriseName: 'Андижон ДЎХ',
        contourName: 'Kontur №5',
        coords: "40°46'55\"N 72°20'39\"E",
        date: '14.04.2026',
      });
      setAppliedContour(REGION_CATALOG[0].enterprises[0].contours[0]);
      setAppliedInfo({
        regionName: 'Андижон вилояти',
        enterpriseName: 'Андижон ДЎХ',
      });
      setShowContourPopup(true);
    } else {
      const trimmedAppId = appId.trim() || 'AR-2026-8491';
      setCheckResult({
        found: true,
        type: 'application',
        id: trimmedAppId,
        status: 'Ariza qabul qilingan',
        statusCode: 'accepted',
        areaHa: 1.35,
        regionName: 'Андижон вилояти',
        enterpriseName: 'Андижон ДЎХ',
        contourName: 'Kontur №12',
        coords: "40°47'29\"N 72°21'21\"E",
        date: '19.05.2026',
      });
      setAppliedContour(REGION_CATALOG[0].enterprises[0].contours[1]);
      setAppliedInfo({
        regionName: 'Андижон вилояти',
        enterpriseName: 'Андижон ДЎХ',
      });
      setShowContourPopup(true);
    }
  };

  const handleClearCheck = () => {
    setPermitQuery('');
    setAppId('');
    setCheckResult(null);
    setAppliedContour(null);
    setAppliedInfo(null);
    setShowContourPopup(false);
  };

  // Handle applying explore filter
  const handleApplyExplore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContourId || !currentEnterprise || !currentRegion) return;
    const found = currentEnterprise.contours.find((c) => c.id === selectedContourId);
    if (found) {
      setAppliedContour(found);
      setAppliedInfo({
        regionName: currentRegion.name,
        enterpriseName: currentEnterprise.name,
      });
      setShowContourPopup(true);
    }
  };

  const handleClearExplore = () => {
    setSelectedRegionId('');
    setSelectedEnterpriseId('');
    setSelectedContourId('');
    setContourSearch('');
    setAppliedContour(null);
    setAppliedInfo(null);
    setShowContourPopup(false);
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#D6E6DB] shadow-[0_16px_40px_rgba(18,53,34,0.08)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[280px] sm:min-h-[300px] lg:min-h-[300px]">
        {/* ── LEFT HALF: Dual Filters & Verification Details ── */}
        <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-white border-b lg:border-b-0 lg:border-r border-[#E8F0EA]">
          <div>
            {/* Top Navigation Tabs: Mode 1 vs Mode 2 */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F4F9F5] border border-[#D9EADF] rounded-xl mb-3 sm:mb-3.5">
              <button
                type="button"
                onClick={() => setActiveTab('check')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                  activeTab === 'check'
                    ? 'bg-white text-[#123522] shadow-xs border border-[#C5DEC9]'
                    : 'text-[#5A646D] hover:text-[#123522] hover:bg-white/60'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'check' ? 'text-[#2E7D4F]' : 'text-[#87968B]'}`} />
                <span className="truncate">Arizam yoki ruxsatnomamni tekshirish</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                  activeTab === 'explore'
                    ? 'bg-white text-[#123522] shadow-xs border border-[#C5DEC9]'
                    : 'text-[#5A646D] hover:text-[#123522] hover:bg-white/60'
                }`}
              >
                <Trees className={`w-4 h-4 ${activeTab === 'explore' ? 'text-[#2E7D4F]' : 'text-[#87968B]'}`} />
                <span className="truncate">Oʻrmon fondi yerlarini koʻrish</span>
              </button>
            </div>

            {/* ── TAB 1: CHECK APPLICATION OR PERMIT DOCUMENT ── */}
            {activeTab === 'check' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-bold text-[#123522]">
                    Qidiruv turini tanlang:
                  </div>
                  {/* Selector between Application vs Permit */}
                  <div className="inline-flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#1A1F24]">
                      <input
                        type="radio"
                        name="checkType"
                        checked={checkType === 'permit'}
                        onChange={() => setCheckType('permit')}
                        className="text-[#2E7D4F] focus:ring-[#2E7D4F]"
                      />
                      Ruxsatnoma
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#1A1F24]">
                      <input
                        type="radio"
                        name="checkType"
                        checked={checkType === 'application'}
                        onChange={() => setCheckType('application')}
                        className="text-[#2E7D4F] focus:ring-[#2E7D4F]"
                      />
                      Ariza
                    </label>
                  </div>
                </div>

                <form onSubmit={handleCheck} className="space-y-3">
                  {checkType === 'permit' ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5A646D] uppercase mb-1">
                          Seriya va hujjat raqami
                        </label>
                        <input
                          type="text"
                          value={permitQuery}
                          onChange={(e) => setPermitQuery(e.target.value.toUpperCase())}
                          placeholder="Masalan: AB 000123"
                          className="w-full h-10 px-3.5 rounded-xl border border-[#D6E6DB] bg-white text-sm font-medium text-[#123522] focus:border-[#2E7D4F] focus:ring-1 focus:ring-[#2E7D4F] uppercase outline-hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-[#5A646D] uppercase mb-1">
                        Ariza ID raqami
                      </label>
                      <input
                        type="text"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                        placeholder="Masalan: AR-2026-8491 yoki 8491"
                        className="w-full h-10 px-3.5 rounded-xl border border-[#D6E6DB] bg-white text-sm font-medium text-[#123522] focus:border-[#2E7D4F] focus:ring-1 focus:ring-[#2E7D4F] outline-hidden"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-[#2E7D4F] hover:bg-[#23653F] text-white text-xs sm:text-[13px] font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Tekshirish</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCheck}
                      className="h-10 px-3.5 rounded-xl border border-[#D6E6DB] text-[#5A646D] hover:text-[#123522] hover:bg-[#F4F9F5] text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Verification Result Card */}
                {checkResult && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-[#F6FAF7] border border-[#CDE5D4] text-xs space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#E1EDE4] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                        <span className="font-extrabold text-[#123522] text-[13px]">
                          {checkResult.id}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF7EE] text-[#1E5631] text-[10.5px] font-extrabold border border-[#BDE0C7]">
                        <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                        {checkResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[#4F5D54]">
                      <div>
                        <span className="text-[#87968B] block text-[10.5px]">Maydoni:</span>
                        <span className="font-bold text-[#123522] text-[12px]">{checkResult.areaHa} ga</span>
                      </div>
                      <div>
                        <span className="text-[#87968B] block text-[10.5px]">Hudud:</span>
                        <span className="font-bold text-[#123522] text-[12px]">{checkResult.enterpriseName}</span>
                      </div>
                      <div>
                        <span className="text-[#87968B] block text-[10.5px]">Kontur:</span>
                        <span className="font-bold text-[#123522] text-[12px]">{checkResult.contourName}</span>
                      </div>
                      <div>
                        <span className="text-[#87968B] block text-[10.5px]">Koordinatalar:</span>
                        <span className="font-bold font-mono text-[#123522] text-[11px]">{checkResult.coords}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#6B7B71] italic pt-1 border-t border-[#E1EDE4]">
                      * Shaxsga doir maʼlumotlar xavfsizligi maqsadida toʻliq ism-sharif koʻrsatilmaydi.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: EXPLORE FOREST FUND LANDS (Viloyat / Xo'jalik / Kontur) ── */}
            {activeTab === 'explore' && (
              <form onSubmit={handleApplyExplore} className="space-y-3">
                {/* Viloyat */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5A646D] uppercase mb-1">
                    Viloyat
                  </label>
                  <select
                    value={selectedRegionId}
                    onChange={(e) => {
                      const regId = e.target.value;
                      setSelectedRegionId(regId);
                      setSelectedEnterpriseId('');
                      setSelectedContourId('');
                    }}
                    className={`w-full h-10 px-3 rounded-xl border border-[#D6E6DB] bg-white text-xs sm:text-[13px] outline-hidden cursor-pointer ${
                      selectedRegionId ? 'font-semibold text-[#123522]' : 'text-gray-400 font-normal'
                    } focus:border-[#2E7D4F] focus:ring-1 focus:ring-[#2E7D4F]`}
                  >
                    <option value="" disabled hidden>
                      Viloyatni tanlang...
                    </option>
                    {REGION_CATALOG.map((reg) => (
                      <option key={reg.id} value={reg.id} className="text-[#123522] font-semibold">
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Xo'jalik */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5A646D] uppercase mb-1">
                    Xoʻjalik (DЎX)
                  </label>
                  <select
                    value={selectedEnterpriseId}
                    disabled={!selectedRegionId}
                    onChange={(e) => {
                      const entId = e.target.value;
                      setSelectedEnterpriseId(entId);
                      setSelectedContourId('');
                    }}
                    className={`w-full h-10 px-3 rounded-xl border border-[#D6E6DB] bg-white text-xs sm:text-[13px] outline-hidden cursor-pointer ${
                      selectedEnterpriseId ? 'font-semibold text-[#123522]' : 'text-gray-400 font-normal'
                    } ${!selectedRegionId ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''} focus:border-[#2E7D4F] focus:ring-1 focus:ring-[#2E7D4F]`}
                  >
                    <option value="" disabled hidden>
                      {selectedRegionId ? 'Xoʻjalikni tanlang...' : 'Avval viloyatni tanlang'}
                    </option>
                    {currentEnterprises.map((ent) => (
                      <option key={ent.id} value={ent.id} className="text-[#123522] font-semibold">
                        {ent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kontur */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5A646D] uppercase mb-1">
                    Kontur tanlash
                  </label>
                  <div className="relative">
                    <select
                      value={selectedContourId}
                      disabled={!selectedEnterpriseId}
                      onChange={(e) => setSelectedContourId(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border border-[#D6E6DB] bg-white text-xs sm:text-[13px] outline-hidden cursor-pointer ${
                        selectedContourId ? 'font-semibold text-[#123522]' : 'text-gray-400 font-normal'
                      } ${!selectedEnterpriseId ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''} focus:border-[#2E7D4F] focus:ring-1 focus:ring-[#2E7D4F]`}
                    >
                      <option value="" disabled hidden>
                        {selectedEnterpriseId ? 'Konturni tanlang...' : 'Avval xoʻjalikni tanlang'}
                      </option>
                      {filteredContours.map((c) => (
                        <option key={c.id} value={c.id} className="text-[#123522] font-semibold">
                          Kontur {c.name} — {c.areaHa} ga ({c.status === 'occupied' ? 'Band' : 'Boʻsh'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={!selectedContourId}
                    className={`flex-1 h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-[#2E7D4F] text-white text-xs sm:text-[13px] font-bold shadow-xs transition-all ${
                      selectedContourId ? 'hover:bg-[#23653F] hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span>Qoʻllash</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearExplore}
                    className="h-10 px-3.5 rounded-xl border border-[#D6E6DB] text-[#5A646D] hover:text-[#123522] hover:bg-[#F4F9F5] text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer"
                  >
                    <span>Tozalash</span>
                  </button>
                </div>

              </form>
            )}
          </div>


        </div>

        {/* ── RIGHT HALF: High-Performance Interactive GIS Map (50% width) ── */}
        <div className="relative bg-[#0D2417] min-h-[280px] sm:min-h-[300px] lg:min-h-[300px] overflow-hidden flex items-center justify-center">
          {/* Base Map Tile Embed */}
          <iframe
            key={mapMode}
            title={`GIS xaritasi — ${mapMode}`}
            src={
              mapMode === 'satellite'
                ? 'https://maps.google.com/maps?q=40.7821,72.3442&t=k&z=14&ie=UTF8&iwloc=&output=embed'
                : mapMode === 'topo'
                  ? 'https://www.openstreetmap.org/export/embed.html?bbox=72.30%2C40.75%2C72.40%2C40.82&layer=cyclemap'
                  : 'https://www.openstreetmap.org/export/embed.html?bbox=72.30%2C40.75%2C72.40%2C40.82&layer=mapnik'
            }
            className="w-full h-full min-h-[280px] sm:min-h-[300px] lg:min-h-[300px] border-0 pointer-events-auto filter brightness-[0.95]"
            loading="lazy"
          />

          {/* SVG Overlay: Vector Contour Boundaries */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <svg className="w-full h-full" viewBox="0 0 400 360" preserveAspectRatio="none">
              <defs>
                <linearGradient id="contourGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* Highlighted Selected Contour Polygon */}
              {appliedContour && (
                <path
                  d={appliedContour.polygonCoords}
                  fill="url(#contourGlow)"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="transition-all duration-700"
                />
              )}
            </svg>
          </div>



          {/* Top Right: Filter Button & Map Mode Switcher */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setFilterModalOpen(!filterModalOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E7D4F] hover:bg-[#23653F] text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xaritani filterlash</span>
            </button>

            {/* Layer switcher */}
            <div className="flex items-center gap-0.5 bg-[#0A1D13]/90 backdrop-blur-md p-0.5 rounded-xl border border-white/20 shadow-lg">
              {(
                [
                  { id: 'satellite', label: 'Sunʼiy yoʻldosh' },
                  { id: 'topo', label: 'Topo' },
                  { id: 'street', label: 'Koʻcha' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setMapMode(mode.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    mapMode === mode.id
                      ? 'bg-[#2E7D4F] text-white shadow-xs'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center Marker Pin with Radar Pulse */}
          {appliedContour && (
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
              style={{ left: '50%', top: '52%' }}
              onClick={() => setShowContourPopup(!showContourPopup)}
            >
              <div className="relative group">
                <span className="absolute -inset-2.5 rounded-full bg-[#10B981]/40 animate-ping pointer-events-none" />
                <div className="relative w-7 h-7 rounded-full bg-[#123522] border-2 border-[#34D399] flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <MapPin className="w-4 h-4 text-[#34D399]" />
                </div>
              </div>
            </div>
          )}

          {/* Floating Contour Details Popup (like in screenshot 2) */}
          {appliedContour && showContourPopup && (
            <div className="absolute left-4 sm:left-6 top-16 z-30 w-56 sm:w-64 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D6E6DB] shadow-2xl text-[#123522] animate-fadeIn pointer-events-auto">
              <div className="flex items-center justify-between border-b border-[#E8F0EA] pb-2 mb-2">
                <div>
                  <h4 className="font-black text-sm text-[#123522]">
                    Kontur {appliedContour.name}
                  </h4>
                  <span className="text-[10px] text-[#5A646D]">
                    {appliedInfo?.enterpriseName || ''} ({appliedInfo?.regionName || ''})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowContourPopup(false)}
                  className="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-[11px] text-[#4F5D54]">
                <div className="flex justify-between">
                  <span>Suv osti yerlari:</span>
                  <span className="font-semibold">{appliedContour.waterArea} ga</span>
                </div>
                <div className="flex justify-between">
                  <span>Ixota daraxtzorlar:</span>
                  <span className="font-semibold">{appliedContour.shelterArea} ga</span>
                </div>
                <div className="flex justify-between">
                  <span>Umumiy yer maydoni:</span>
                  <span className="font-bold text-[#123522]">{appliedContour.areaHa} ga</span>
                </div>
                <div className="flex justify-between">
                  <span>Oʻrmonzor jami yerlar:</span>
                  <span className="font-semibold">{appliedContour.forestArea} ga</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#E8F0EA] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  {appliedContour.status === 'occupied' ? 'Band qilingan' : 'Boʻsh yer'}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate?.('applicant_wizard')}
                  className="text-[10.5px] font-bold text-[#2E7D4F] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  Ariza berish
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Left: GIS Monitoring Badge */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-auto">
            <div className="px-3 py-1.5 rounded-xl bg-[#0D2417]/90 backdrop-blur-md border border-[#2E7D4F]/50 shadow-lg text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
              <div>
                <div className="text-[11px] font-black text-white leading-none">GIS Monitoring</div>
                <div className="text-[9.5px] text-[#A7F3D0] leading-tight">
                  Ijaraga berilgan oʻrmon yerlari xaritasi
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: Full map launcher */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[9.5px] text-[#A8D5B5] font-mono border border-white/10">
              <span>40°46'N 72°20'E</span>
              <span className="text-white/30">•</span>
              <span>1:50 000</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('map')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#123522]/90 hover:bg-[#123522] text-white text-[10.5px] font-bold backdrop-blur-md border border-white/20 shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-[#9CE3AE]" />
              <span>Toʻliq xarita</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[#E8F0EA] mx-5 sm:mx-6" />

      {/* ── 4 STEPS (bottom) ── */}
      <div className="p-4 sm:p-5 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#23653F] text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#2E7D4F]" />
              {t('home.steps.sectionTitle')}
            </span>
            <span className="text-[12px] text-[#5A646D] hidden sm:inline">
              • {t('home.steps.sectionSubtitle')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('applicant_wizard')}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#2E7D4F] hover:text-[#1B5E20] hover:underline cursor-pointer"
          >
            <span>Ariza yozish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { Icon: UserRound,      step: '01', bg: 'from-[#0F3822] to-[#1A5C37]', desc: t('home.steps.01.desc') },
            { Icon: MapIcon,        step: '02', bg: 'from-[#154A2B] to-[#206E3F]', desc: t('home.steps.02.desc') },
            { Icon: CalculatorIcon, step: '03', bg: 'from-[#1B5C35] to-[#28804D]', desc: t('home.steps.03.desc') },
            { Icon: QrCode,         step: '04', bg: 'from-[#237443] to-[#2EA862]', desc: t('home.steps.04.desc') },
          ].map(({ Icon, step, bg, desc }, idx) => (
            <div
              key={idx}
              className="relative group bg-[#F7FAF8] hover:bg-[#EFF6F1] border border-[#E0EBE2] hover:border-[#2E7D4F]/40 rounded-xl p-3.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center shrink-0 shadow-xs`}>
                      <Icon className="w-3.5 h-3.5 text-[#A7F3D0]" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#2E7D4F] uppercase tracking-wider">
                      {t('home.steps.stepPrefix')} {step}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-bold text-[#7D8A82] bg-white px-2 py-0.5 rounded-full border border-[#DCE7DF] shadow-xs">
                    {idx + 1}/4
                  </span>
                </div>
                <div className="text-[12.5px] font-bold text-[#123522] leading-snug">
                  {t(`home.steps.0${idx + 1}.title`)}
                </div>
                <p className="text-[11px] text-[#5A646D] leading-relaxed mt-1">{desc}</p>
              </div>
              {idx < 3 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full bg-white border border-[#D0E0D4] items-center justify-center text-[#2E7D4F] shadow-xs pointer-events-none group-hover:border-[#2E7D4F] transition-colors">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
