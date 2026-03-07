import { useState, useRef, useEffect } from 'react';
import { t } from '../i18n';
import './AppMenu.css';

type Props = {
  hasBackup?: boolean;
  backupUsed?: boolean;
  onInjurySub?: () => void;
  onReset?: () => void;
};

export function AppMenu({ hasBackup, backupUsed, onInjurySub, onReset }: Props) {
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
          {onReset && (
            <button className="menu-item menu-item--danger" onClick={() => { setOpen(false); onReset(); }}>
              {t('reset')}
            </button>
          )}
          {(onReset || (hasBackup && onInjurySub)) && <hr className="menu-divider" />}
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
