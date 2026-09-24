import React, { useState, useEffect, useRef } from 'react';
import { Globe2, Search, Check, X, Sparkles } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isIndian?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  // Primary Indian Official Languages
  { code: 'en', name: 'English', nativeName: 'English', isIndian: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isIndian: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isIndian: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isIndian: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isIndian: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isIndian: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isIndian: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isIndian: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isIndian: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', isIndian: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isIndian: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isIndian: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', isIndian: true },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', isIndian: true },
  { code: 'sat', name: 'Santali', nativeName: 'संताली / ᱥᱟᱱᱛᱟᱲᱤ', isIndian: true },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', isIndian: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', isIndian: true },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', isIndian: true },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', isIndian: true },
  { code: 'mni-Mtei', name: 'Manipuri (Meitei)', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', isIndian: true },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', isIndian: true },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', isIndian: true },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', isIndian: true },

  // Global World Languages
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'la', name: 'Latin', nativeName: 'Latina' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'ms', name: 'Malay', nativeName: 'Melayu' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' }
];

interface LanguageSelectorProps {
  variant?: 'navbar-top' | 'mobile-drawer' | 'standalone';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar-top',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentLang, setCurrentLang] = useState('en');
  const [activeTab, setActiveTab] = useState<'indian' | 'all'>('indian');
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Read current language from cookie or localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vidya_vrtti_lang');
    if (saved) {
      setCurrentLang(saved);
      return;
    }
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  // Handle outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (code: string) => {
    // 1. Clear previous cookies for both domain and subdomains
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;

    if (code !== 'en') {
      // 2. Set new googtrans cookie
      document.cookie = `googtrans=/en/${code}; path=/;`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname};`;
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        document.cookie = `googtrans=/en/${code}; path=/; domain=.${domainParts.slice(-2).join('.')};`;
      }
    }

    localStorage.setItem('vidya_vrtti_lang', code);
    setCurrentLang(code);
    setIsOpen(false);

    // 3. Trigger Google Translate widget combo change
    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
    } else {
      // If combo not loaded yet, reload so the cookie takes effect on page boot
      window.location.reload();
    }
  };

  const activeLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return activeTab === 'indian' ? l.isIndian : true;
    }
    return (
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      {variant === 'navbar-top' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1.5 px-2 py-0.5 rounded-sm hover:bg-[#485645] text-amber-200 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold border border-transparent hover:border-amber-400/30"
          title="Change Language / भाषा बदलें"
          aria-label="Change Language"
        >
          <Globe2 className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
          <span className="truncate max-w-[90px]">{activeLanguageObj.nativeName}</span>
          <span className="text-[9px] text-slate-300">▾</span>
        </button>
      ) : variant === 'mobile-drawer' ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#5a6857] hover:bg-[#6c7c69] text-white text-xs font-semibold border border-navy-600 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-amber-300" />
            <span>Select Language / भाषा</span>
          </div>
          <span className="text-amber-300 font-bold bg-[#485645] px-2 py-0.5 rounded-md text-[11px]">
            {activeLanguageObj.nativeName} ({activeLanguageObj.name})
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white border border-[#c9b79c] text-xs font-bold text-slate-800 hover:border-slate-400 shadow-xs cursor-pointer"
        >
          <Globe2 className="w-4 h-4 text-amber-600" />
          <span>{activeLanguageObj.nativeName} ({activeLanguageObj.name})</span>
        </button>
      )}

      {/* Modal / Popover Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div
            ref={modalRef}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#c9b79c] text-slate-900 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#71816d] text-white flex items-center justify-between border-b border-[#5a6857]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                  <Globe2 className="w-5 h-5 text-navy-950" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base leading-tight text-white flex items-center gap-1.5">
                    Select Portal Language <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[11px] text-amber-200">
                    Real-time 100% accurate translation across 100+ languages
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#5a6857] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Pick - Popular Indian Languages */}
            <div className="px-5 pt-3 pb-2 bg-[#fdfbf7] border-b border-[#dfcdb1]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Quick Select • Most Popular Indian Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'bn', label: 'বাংলা' },
                  { code: 'te', label: 'తెలుగు' },
                  { code: 'mr', label: 'मराठी' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'gu', label: 'ગુજરાતી' },
                  { code: 'kn', label: 'ಕನ್ನಡ' },
                  { code: 'or', label: 'ଓଡ଼ିଆ' },
                  { code: 'ml', label: 'മലയാളം' },
                  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
                  { code: 'ur', label: 'اردو' }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => selectLanguage(item.code)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      currentLang === item.code
                        ? 'bg-[#71816d] text-white shadow-xs'
                        : 'bg-[#f1e0c5] hover:bg-[#dfcdb1] text-slate-800 border border-[#c9b79c]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Tabs Bar */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search any language (e.g., Hindi, Tamil, French, Spanish, Russian, Santali)..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#71816d] focus:ring-2 focus:ring-[#71816d]/20 transition-all bg-slate-50 focus:bg-white"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {!search && (
                <div className="flex border-b border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('indian')}
                    className={`pb-2 px-3 transition-colors border-b-2 cursor-pointer ${
                      activeTab === 'indian'
                        ? 'border-[#71816d] text-[#71816d]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Indian Languages ({SUPPORTED_LANGUAGES.filter((l) => l.isIndian).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-3 transition-colors border-b-2 cursor-pointer ${
                      activeTab === 'all'
                        ? 'border-[#71816d] text-[#71816d]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All World Languages ({SUPPORTED_LANGUAGES.length})
                  </button>
                </div>
              )}
            </div>

            {/* Language Grid */}
            <div className="p-4 overflow-y-auto max-h-[48vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-[#fdfbf7]">
              {filteredLanguages.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-500">
                  No languages matching "{search}".
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => selectLanguage(lang.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#71816d] text-white border-[#5a6857] shadow-xs'
                          : 'bg-white hover:bg-[#f1e0c5]/80 text-slate-800 border-[#dfcdb1] hover:border-[#c9b79c]'
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {lang.nativeName}
                        </p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-amber-200' : 'text-slate-500'}`}>
                          {lang.name}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 shrink-0 text-amber-300" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Powered by Google Neural Translation</span>
              <button
                type="button"
                onClick={() => selectLanguage('en')}
                className="text-orange-600 hover:text-orange-700 font-bold hover:underline cursor-pointer"
              >
                Reset to English
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
