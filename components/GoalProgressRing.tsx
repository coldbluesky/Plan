type Props = {
  percent: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
};

export function GoalProgressRing({
  percent,
  color = "#6366f1",
  size = 104,
  strokeWidth = 9,
  label,
  sublabel,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold tabular-nums">
          {label ?? `${Math.round(clamped)}%`}
        </span>
        {sublabel ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
