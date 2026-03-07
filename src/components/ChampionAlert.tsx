import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { t } from '../i18n';
import './ChampionAlert.css';

type Props = {
  winner: string | null;
};

export function ChampionAlert({ winner }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!winner || firedRef.current === winner) return;
    firedRef.current = winner;

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#d4a44a', '#f0c850', '#a07830', '#fff4d0'],
    });

    dialogRef.current?.showModal();
  }, [winner]);

  if (!winner) return null;

  return (
    <dialog ref={dialogRef} className="champion-dialog" onClick={(e) => {
      if (e.target === e.currentTarget) e.currentTarget.close();
    }}>
      <div className="champion-dialog-content">
        <p className="champion-dialog-trophy">{t('championTrophy')}</p>
        <p className="champion-dialog-name">{winner}</p>
        <p className="champion-dialog-subtitle">
          {t('championAlert').replace('{name}', winner)}
        </p>
        <button className="champion-dialog-close" onClick={() => dialogRef.current?.close()}>
          {t('championDismiss')}
        </button>
      </div>
    </dialog>
  );
}
