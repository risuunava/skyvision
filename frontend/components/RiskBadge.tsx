import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'extreme';
  score?: number;
  className?: string;
}

const riskConfig = {
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: '🟢',
    label: 'Low Risk',
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: '🟡',
    label: 'Medium Risk',
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    icon: '🟠',
    label: 'High Risk',
  },
  extreme: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: '🔴',
    label: 'Extreme Risk',
  },
};

export default function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const config = riskConfig[level];

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-4 py-2 rounded-full border',
      config.bg, config.text, config.border,
      className
    )}>
      <span className="text-xl">{config.icon}</span>
      <div>
        <div className="font-semibold">{config.label}</div>
        {score !== undefined && (
          <div className="text-xs opacity-75">
            Score: {score.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}