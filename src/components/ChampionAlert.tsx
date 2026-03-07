import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { t } from '../i18n';
import './ChampionAlert.css';

type Props = {
  winner: string | null;
};

export function ChampionAlert({ winner }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!winner || firedRef.current === winner) return;
    firedRef.current = winner;

    dialogRef.current?.showModal();

    if (canvasRef.current) {
      const fire = confetti.create(canvasRef.current, { resize: true });
      fire({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#d4a44a', '#f0c850', '#a07830', '#fff4d0'],
      });
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <dialog ref={dialogRef} className="champion-dialog" onClick={(e) => {
      if (e.target === e.currentTarget) e.currentTarget.close();
    }}>
      <canvas ref={canvasRef} className="champion-dialog-confetti" />
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
