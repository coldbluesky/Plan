import Link from "next/link";
import { GoalForm } from "@/components/GoalForm";

export default function NewGoalPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <Link
          href="/goals"
          className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          ← 返回目标列表
        </Link>
        <h1 className="text-xl font-semibold">新建学习目标</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <GoalForm />
      </div>
    </div>
  );
}
