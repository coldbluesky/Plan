import Link from "next/link";
import { notFound } from "next/navigation";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { SessionTimer } from "@/components/SessionTimer";
import { ManualSessionForm } from "@/components/ManualSessionForm";
import { DeleteSessionButton } from "@/components/DeleteSessionButton";
import {
  getGoalProgress,
  getGoalsWithProgress,
  getSessionsByGoal,
} from "@/lib/stats";
import { formatDateTime, formatMinutes, metricLabel } from "@/lib/format";

export default async function GoalDetailPage({
  params,
}: PageProps<"/goals/[id]">) {
  const { id } = await params;
  const goalId = Number(id);
  if (!Number.isFinite(goalId)) notFound();

  const goal = getGoalProgress(goalId);
  if (!goal) notFound();

  const sessions = getSessionsByGoal(goalId);
  const goalOptions = getGoalsWithProgress()
    .filter((g) => g.status !== "archived")
    .map((g) => ({ id: g.id, title: g.title, metricType: g.metricType }));

  const unit = metricLabel(goal.metricType);
  const progressValue =
    goal.metricType === "hours"
      ? goal.progressValue.toFixed(1)
      : String(goal.progressValue);

  return (
    <div className="space-y-6">
      <Link
        href="/goals"
        className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        ← 返回目标列表
      </Link>

      <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <GoalProgressRing
          percent={goal.percent}
          color={goal.color}
          size={128}
          strokeWidth={11}
        />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{goal.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {progressValue} / {goal.targetValue} {unit}
          </p>
          {goal.deadline ? (
            <p className="text-sm text-slate-400">截止日期：{goal.deadline}</p>
          ) : null}
          <p className="text-sm text-slate-400">共 {sessions.length} 条记录</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          计时器
        </h2>
        <SessionTimer goalId={goal.id} />
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          手动补录
        </h2>
        <ManualSessionForm goals={goalOptions} defaultGoalId={goal.id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          学习记录
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-500">还没有记录。</p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {session.durationMin > 0
                      ? formatMinutes(session.durationMin)
                      : `${session.lessonsDelta} 课`}
                    <span className="ml-2 text-xs text-slate-400">
                      {session.source === "timer" ? "计时" : "手动"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(session.startedAt)}
                    {session.note ? ` · ${session.note}` : ""}
                  </p>
                </div>
                <DeleteSessionButton id={session.id} goalId={goal.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
