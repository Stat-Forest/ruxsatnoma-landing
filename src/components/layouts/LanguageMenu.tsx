import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LANGUAGES } from '../../i18n/context';
import type { Language } from '../../i18n/context';

interface LanguageMenuProps {
  value: Language;
  /** Accessible name for the trigger — `action.language`, in the active language. */
  label: string;
  onSelect: (code: Language) => void;
}

/**
 * The public header's language picker — the adminka's `shell/LanguageMenu.tsx`
 * in this site's dark chrome: the trigger keeps the header's translucent black
 * pill, and the menu itself is the same white card the rest of the design
 * system uses, because a dark panel on a dark header reads as a shadow.
 */
export function LanguageMenu({ value, label, onSelect }: LanguageMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = LANGUAGES.find((language) => language.code === value) ?? LANGUAGES[1];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        data-testid="language-trigger"
        aria-label={`${label}: ${active.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className={`flex h-9 items-center gap-1.5 rounded-xl border border-[#E4E7EA] px-3 text-xs font-bold text-white transition-colors ${
          open
            ? 'bg-white/20'
            : 'bg-transparent hover:bg-white/20'
        }`}
      >
        <Globe className="h-4 w-4" />
        {active.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          data-testid="language-menu"
          aria-label={label}
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#E4E7EA] bg-white py-1 text-[#1A1F24] shadow-xl"
        >
          {LANGUAGES.map(({ code, label: short, title }) => {
            const selected = code === value;
            return (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setOpen(false);
                  if (!selected) onSelect(code);
                }}
                className={`flex h-11 w-full items-center justify-between gap-3 px-3 text-left text-sm transition-colors ${
                  selected ? 'bg-[#F0F7F1] font-semibold text-[#23653F]' : 'hover:bg-[#F8F9FA]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-7 shrink-0 text-xs font-bold ${
                      selected ? 'text-[#2E7D4F]' : 'text-[#9AA3AB]'
                    }`}
                  >
                    {short}
                  </span>
                  {title}
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-[#2E7D4F]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
