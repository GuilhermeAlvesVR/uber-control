import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/60 rounded-xl ${className || ''}`} />;
}

export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, action }: { icon: any; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center border border-white/5">
        <Icon size={24} className="text-zinc-600" />
      </div>
      <p className="text-sm text-zinc-500">{title}</p>
      {action}
    </div>
  );
}
