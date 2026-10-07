import Link from "next/link";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { getGoalsWithProgress, type GoalProgress } from "@/lib/stats";
import { metricLabel } from "@/lib/format";

function progressText(goal: GoalProgress): string {
  const unit = metricLabel(goal.metricType);
  const value =
    goal.metricType === "hours"
      ? goal.progressValue.toFixed(1)
      : String(goal.progressValue);
  return `${value} / ${goal.targetValue} ${unit}`;
}

export default function GoalsPage() {
  const all = getGoalsWithProgress();
  const active = all.filter((g) => g.status === "active");
  const done = all.filter((g) => g.status === "done");
  const archived = all.filter((g) => g.status === "archived");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">学习目标</h1>
        <Link
          href="/goals/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          新建目标
        </Link>
      </div>

      {all.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700">
          还没有目标，先创建一个吧。
        </p>
      ) : null}

      <GoalGroup title="进行中" goals={active} />
      <GoalGroup title="已完成" goals={done} />
      <GoalGroup title="已归档" goals={archived} />
    </div>
  );
}

function GoalGroup({
  title,
  goals,
}: {
  title: string;
  goals: GoalProgress[];
}) {
  if (goals.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => (
          <Link
            key={goal.id}
            href={`/goals/${goal.id}`}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <GoalProgressRing
              percent={goal.percent}
              color={goal.color}
              size={84}
              strokeWidth={8}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{goal.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {progressText(goal)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
