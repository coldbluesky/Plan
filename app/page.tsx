import Link from "next/link";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import {
  getGoalsWithProgress,
  getRecentSessions,
  getStreak,
  getTodayStats,
  type GoalProgress,
} from "@/lib/stats";
import { formatDateTime, formatMinutes, metricLabel } from "@/lib/format";

function progressText(goal: GoalProgress): string {
  const unit = metricLabel(goal.metricType);
  const value =
    goal.metricType === "hours"
      ? goal.progressValue.toFixed(1)
      : String(goal.progressValue);
  return `${value} / ${goal.targetValue} ${unit}`;
}

export default function DashboardPage() {
  const goals = getGoalsWithProgress().filter((g) => g.status !== "archived");
  const today = getTodayStats();
  const streak = getStreak();
  const recent = getRecentSessions(8);
  const activeCount = goals.filter((g) => g.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">仪表盘</h1>
        <Link
          href="/goals/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          新建目标
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="今日学习"
          value={formatMinutes(today.totalMin)}
          hint={`${today.count} 次记录`}
        />
        <StatCard label="连续学习" value={`${streak} 天`} />
        <StatCard label="进行中目标" value={`${activeCount} 个`} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          目标进度
        </h2>
        {goals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700">
            还没有目标，点右上角「新建目标」开始吧。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <GoalProgressRing
                  percent={goal.percent}
                  color={goal.color}
                  size={88}
                  strokeWidth={8}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{goal.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {progressText(goal)}
                  </p>
                  {goal.deadline ? (
                    <p className="text-xs text-slate-400">
                      截止 {goal.deadline}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          最近记录
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">暂无记录。</p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {recent.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.goalColor }}
                  />
                  <span className="truncate font-medium">{row.goalTitle}</span>
                  {row.note ? (
                    <span className="truncate text-slate-400">
                      · {row.note}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-slate-500">
                  <span>
                    {row.durationMin > 0
                      ? formatMinutes(row.durationMin)
                      : `${row.lessonsDelta} 课`}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(row.startedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
