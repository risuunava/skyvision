import { cn } from '@/lib/utils';

export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  className?: string;
  compact?: boolean;
}

const riskConfig: Record<RiskLevel, { bg: string; text: string; border: string; icon: string; label: string }> = {
  low: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700',
    icon: '🟢',
    label: 'Rendah',
  },
  medium: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
    icon: '🟡',
    label: 'Sedang',
  },
  high: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-700',
    icon: '🟠',
    label: 'Tinggi',
  },
  extreme: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    icon: '🔴',
    label: 'Ekstrem',
  },
};

export default function RiskBadge({ level, score, className, compact = false }: RiskBadgeProps) {
  const safeLevel = (['low', 'medium', 'high', 'extreme'].includes(level as string) ? level : 'low') as RiskLevel;
  const config = riskConfig[safeLevel];

  if (compact) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold',
        config.bg, config.text, config.border, className
      )}>
        {config.icon} {config.label}
      </span>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border',
      config.bg, config.text, config.border, className
    )}>
      <span className="text-2xl leading-none">{config.icon}</span>
      <div>
        <div className="font-bold text-sm leading-none">Risiko {config.label}</div>
        {score !== undefined && (
          <div className="text-xs opacity-70 mt-0.5">Skor: {Number(score).toFixed(2)}</div>
        )}
      </div>
    </div>
  );
}