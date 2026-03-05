import { useEffect } from 'react';
import confetti from 'canvas-confetti';

type Props = {
  winner: string;
};

export function ChampionBanner({ winner }: Props) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#d4a44a', '#f0c850', '#a07830', '#fff4d0'],
    });
  }, []);

  return <div className="champion-banner">{winner}</div>;
}
