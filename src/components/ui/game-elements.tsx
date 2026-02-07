import React from 'react';

export type Move = 'Rock' | 'Paper' | 'Scissors' | 'None';
export type Tier = 'A' | 'B' | 'C' | 'D' | 'E';

export const TierBadge = ({ tier }: { tier: Tier }) => {
  const colors = {
    A: 'bg-blue-500',
    B: 'bg-green-500',
    C: 'bg-yellow-500',
    D: 'bg-red-500',
    E: 'bg-purple-500',
  };

  return (
    <span className={`${colors[tier]} text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}>
      Tier {tier}
    </span>
  );
};
