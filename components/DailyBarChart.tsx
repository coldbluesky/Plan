import type { DailyPoint } from "@/lib/stats";

export function DailyBarChart({ data }: { data: DailyPoint[] }) {
  const max = Math.max(60, ...data.map((d) => d.minutes));

  return (
    <div className="flex h-44 items-end gap-1.5">
      {data.map((d) => {
        const height = (d.minutes / max) * 100;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-32 w-full items-end">
              <div
                className={`w-full rounded-t ${
                  d.minutes > 0 ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-800"
                }`}
                style={{ height: `${Math.max(height, d.minutes > 0 ? 4 : 0)}%` }}
                title={`${d.date} · ${d.minutes} 分钟`}
              />
            </div>
            <span className="text-[10px] text-slate-400">
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
