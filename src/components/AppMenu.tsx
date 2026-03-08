import { useState, useRef, useEffect } from 'react';
import { t } from '../i18n';
import './AppMenu.css';

type Props = {
  hasBackup?: boolean;
  backupUsed?: boolean;
  onInjurySub?: () => void;
  onResetNight1?: () => void;
  onResetNight2?: () => void;
  onResetNight3?: () => void;
};

export function AppMenu({ hasBackup, backupUsed, onInjurySub, onResetNight1, onResetNight2, onResetNight3 }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [open]);

  return (
    <div className="app-menu" ref={menuRef}>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label={t('menu')}
        aria-expanded={open}
      >
        <span className="menu-icon" />
      </button>

      {open && (
        <div className="menu-dropdown">
          {hasBackup && onInjurySub && (
            <button
              className={`menu-item ${backupUsed ? 'menu-item--disabled' : ''}`}
              disabled={backupUsed}
              onClick={() => { setOpen(false); onInjurySub(); }}
            >
              {t('injurySub')}{backupUsed ? ` (${t('used')})` : ''}
            </button>
          )}
          {onResetNight1 && (
            <button className="menu-item menu-item--danger" onClick={() => { setOpen(false); onResetNight1(); }}>
              {t('resetNight1')}
            </button>
          )}
          {onResetNight2 && (
            <button className="menu-item menu-item--danger" onClick={() => { setOpen(false); onResetNight2(); }}>
              {t('resetNight2')}
            </button>
          )}
          {onResetNight3 && (
            <button className="menu-item menu-item--danger" onClick={() => { setOpen(false); onResetNight3(); }}>
              {t('resetNight3')}
            </button>
          )}
          <hr className="menu-divider" />
          <a
            className="menu-item menu-item--link"
            href="https://github.com/leopic/wxw-16-carat-gold-2026"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('madeWith')}
          </a>
        </div>
      )}
    </div>
  );
}
