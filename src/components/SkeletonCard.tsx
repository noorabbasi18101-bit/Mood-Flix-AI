import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-[#1e2020] border border-[#292a2a] rounded-2xl overflow-hidden shadow-md animate-pulse flex flex-col">
      <div className="aspect-[2/3] w-full bg-[#292a2a]" />
      <div className="p-3.5 space-y-3">
        <div className="h-4 bg-[#292a2a] rounded w-3/4" />
        <div className="h-3 bg-[#292a2a] rounded w-1/2" />
        <div className="h-8 bg-[#292a2a] rounded-xl w-full" />
      </div>
    </div>
  );
};
