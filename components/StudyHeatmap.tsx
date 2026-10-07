import type { HeatmapCell } from "@/lib/stats";

const LEVELS = [
  "bg-slate-200/70 dark:bg-slate-800",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-300 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-600 dark:bg-emerald-400",
];

function level(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

export function StudyHeatmap({ cells }: { cells: HeatmapCell[] }) {
  if (cells.length === 0) return null;

  const first = new Date(`${cells[0].date}T00:00:00`);
  const leading = first.getDay(); // 0 = 周日

  const padded: (HeatmapCell | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...cells,
  ];
  while (padded.length % 7 !== 0) padded.push(null);

  return (
    <div className="overflow-x-auto pb-1">
      <div
        className="grid grid-flow-col gap-1"
        style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
      >
        {padded.map((cell, index) =>
          cell ? (
            <div
              key={cell.date}
              title={`${cell.date} · ${cell.minutes} 分钟 · ${cell.count} 次`}
              className={`h-3 w-3 rounded-sm ${LEVELS[level(cell.minutes)]}`}
            />
          ) : (
            <div key={`empty-${index}`} className="h-3 w-3" />
          ),
        )}
      </div>
    </div>
  );
}
