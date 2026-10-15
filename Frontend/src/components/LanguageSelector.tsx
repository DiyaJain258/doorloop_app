import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeLanguage = (lang: 'en' | 'es') => {
    if (lang === currentLang) {
      setIsOpen(false);
      return;
    }
    
    localStorage.setItem('app_language', lang);
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 h-9 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200"
        title="Change Language / Cambiar idioma"
      >
        <Languages className="w-4.5 h-4.5 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          {currentLang === 'en' ? 'EN' : 'ES'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-border bg-card p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50 text-foreground">
          <div className="px-2.5 py-1.5 border-b border-border/60 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Select Language
          </div>
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
              currentLang === 'en'
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm">🇺🇸</span>
              <span>English</span>
            </div>
            {currentLang === 'en' && <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => changeLanguage('es')}
            className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
              currentLang === 'es'
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm">🇪🇸</span>
              <span>Español</span>
            </div>
            {currentLang === 'es' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
