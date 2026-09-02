// components/meeting/LanguageSelector.tsx
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
  size?: 'sm' | 'md';
}

export function LanguageSelector({ value, onChange, size = 'md' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = LANGUAGES.find(l => l.code === value) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] 
          rounded-lg border dark:border-[#333] transition-colors
          ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}
      >
        <Globe className={`${size === 'sm' ? 'size-3' : 'size-4'} text-gray-500`} />
        <span>{selected.flag}</span>
        <span className="text-gray-700 dark:text-gray-300">{selected.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl border dark:border-[#333] 
            shadow-lg z-50 overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#222] transition-colors
                  ${value === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {value === lang.code && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}