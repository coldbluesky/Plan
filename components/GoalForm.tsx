"use client";

import { useActionState, useState } from "react";
import { createGoal, type GoalFormState } from "@/app/actions/goal";

const initialState: GoalFormState = {};

const PRESET_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-900/40";

export function GoalForm() {
  const [state, formAction, pending] = useActionState(createGoal, initialState);
  const [metricType, setMetricType] = useState<"hours" | "lessons">("hours");

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="title">
          目标名称
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="例如：AWS 认证、读完 CSAPP"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">衡量方式</span>
        <div className="flex gap-3">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm has-checked:border-indigo-500 has-checked:bg-indigo-50 dark:border-slate-700 dark:has-checked:bg-indigo-950/40">
            <input
              type="radio"
              name="metricType"
              value="hours"
              defaultChecked
              onChange={() => setMetricType("hours")}
            />
            按小时数
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm has-checked:border-indigo-500 has-checked:bg-indigo-50 dark:border-slate-700 dark:has-checked:bg-indigo-950/40">
            <input
              type="radio"
              name="metricType"
              value="lessons"
              onChange={() => setMetricType("lessons")}
            />
            按课程数
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="targetValue">
            {metricType === "hours" ? "目标小时数" : "目标课程数"}
          </label>
          <input
            id="targetValue"
            name="targetValue"
            type="number"
            min="0.5"
            step="0.5"
            required
            placeholder={metricType === "hours" ? "100" : "30"}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="deadline">
            截止日期（可选）
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">颜色标记</span>
        <div className="flex gap-3">
          {PRESET_COLORS.map((color, index) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={index === 0}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-slate-400 dark:ring-offset-slate-900"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "创建中..." : "创建目标"}
      </button>
    </form>
  );
}
