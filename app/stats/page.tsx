import { DailyBarChart } from "@/components/DailyBarChart";
import { StudyHeatmap } from "@/components/StudyHeatmap";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { getDailyMinutes, getGoalsWithProgress, getHeatmap } from "@/lib/stats";
import { formatMinutes, metricLabel } from "@/lib/format";

export default function StatsPage() {
  const heatmap = getHeatmap(182);
  const daily = getDailyMinutes(14);
  const goals = getGoalsWithProgress().filter((g) => g.status !== "archived");

  const totalMinutes = heatmap.reduce((sum, cell) => sum + cell.minutes, 0);
  const activeDays = heatmap.filter((cell) => cell.minutes > 0).length;
  const weekMinutes = daily
    .slice(-7)
    .reduce((sum, point) => sum + point.minutes, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">统计</h1>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="累计学习" value={formatMinutes(totalMinutes)} />
        <StatCard label="近 7 天" value={formatMinutes(weekMinutes)} />
        <StatCard label="学习天数" value={`${activeDays} 天`} />
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          近半年学习热力图
        </h2>
        <StudyHeatmap cells={heatmap} />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>少</span>
          <span className="h-3 w-3 rounded-sm bg-slate-200/70 dark:bg-slate-800" />
          <span className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
          <span className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
          <span className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
          <span>多</span>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          近 14 天每日时长
        </h2>
        <DailyBarChart data={daily} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          各目标进度
        </h2>
        {goals.length === 0 ? (
          <p className="text-sm text-slate-500">暂无进行中的目标。</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <GoalProgressRing
                  percent={goal.percent}
                  color={goal.color}
                  size={96}
                />
                <p className="truncate text-sm font-medium">{goal.title}</p>
                <p className="text-xs text-slate-500">
                  {goal.metricType === "hours"
                    ? `${goal.progressValue.toFixed(1)} / ${goal.targetValue} ${metricLabel(goal.metricType)}`
                    : `${goal.progressValue} / ${goal.targetValue} ${metricLabel(goal.metricType)}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
