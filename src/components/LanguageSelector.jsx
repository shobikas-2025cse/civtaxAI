import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil',   native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi',   native: 'हिन्दी' }
];

export default function LanguageSelector({ variant = 'default' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
          variant === 'login'
            ? 'bg-[#10121A] border-[#202533] text-gray-200 hover:border-[#FF8C00] hover:text-white'
            : 'bg-[#181C26] border-[#2A3040] text-gray-200 hover:border-[#E5B80B] hover:text-white'
        }`}
        title="Select Language / மொழி / भाषा"
      >
        <Globe className="w-3.5 h-3.5 text-[#E5B80B]" />
        <span>{currentLang.native}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#0D0F17] border border-[#262B3A] shadow-2xl shadow-black/80 py-1.5 z-50 animate-fade-in-up">
          {LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#E5B80B]/15 text-[#E5B80B]'
                    : 'text-gray-300 hover:bg-[#161924] hover:text-white'
                }`}
              >
                <span>{lang.native}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E5B80B]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
