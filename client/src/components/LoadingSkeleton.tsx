import React from "react";

const Block = ({ className = "" }: { className?: string }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function ProductSkeleton() {
  return <main className="min-h-screen bg-[var(--color-bg)] px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2"><Block className="aspect-square w-full" /><div className="space-y-5 py-2"><Block className="h-3 w-24" /><Block className="h-10 w-4/5" /><Block className="h-5 w-32" /><Block className="h-20 w-full" /><div className="flex gap-3"><Block className="h-10 w-20" /><Block className="h-10 w-20" /></div><Block className="h-12 w-full" /></div></div></main>;
}

export function ListingSkeleton() {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded border border-[var(--color-border)] bg-white"><Block className="aspect-[4/5] w-full" /><div className="space-y-3 p-4"><Block className="h-3 w-2/5" /><Block className="h-6 w-4/5" /><Block className="h-4 w-1/3" /></div></div>)}</div>;
}

export function PageSkeleton() {
  return <main className="min-h-screen bg-[var(--color-bg)] px-4 py-12 sm:px-6"><div className="mx-auto max-w-5xl space-y-6"><Block className="h-8 w-48" /><Block className="h-48 w-full" /><Block className="h-32 w-full" /></div></main>;
}
