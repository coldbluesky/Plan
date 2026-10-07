"use client";

import { useActionState } from "react";
import { addManualSession, type SessionFormState } from "@/app/actions/session";

const initialState: SessionFormState = {};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40";

type GoalOption = {
  id: number;
  title: string;
  metricType: "hours" | "lessons";
};

export function ManualSessionForm({
  goals,
  defaultGoalId,
}: {
  goals: GoalOption[];
  defaultGoalId?: number;
}) {
  const [state, formAction, pending] = useActionState(
    addManualSession,
    initialState,
  );
  const today = new Date().toISOString().slice(0, 10);
  const selected = goals.find((g) => g.id === defaultGoalId) ?? goals[0];

  if (goals.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        请先创建一个学习目标。
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          name="goalId"
          defaultValue={selected?.id}
          className={inputClass}
          aria-label="学习目标"
        >
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
        <input
          name="date"
          type="date"
          defaultValue={today}
          className={inputClass}
          aria-label="日期"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="durationMin"
          type="number"
          min="0"
          step="1"
          placeholder="时长（分钟）"
          className={inputClass}
          aria-label="时长（分钟）"
        />
        <input
          name="lessonsDelta"
          type="number"
          min="0"
          step="1"
          placeholder="课程数（按课程衡量才填）"
          className={inputClass}
          aria-label="课程数"
        />
      </div>

      <input
        name="note"
        placeholder="备注（可选）"
        className={inputClass}
        aria-label="备注"
      />

      {state.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : state.ok ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          已保存
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "保存中..." : "添加记录"}
      </button>
    </form>
  );
}
