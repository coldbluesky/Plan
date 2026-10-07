"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveTimerSession } from "@/app/actions/session";

function format(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function SessionTimer({ goalId }: { goalId: number }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const startedAtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  function toggle() {
    setMessage(null);
    if (!running && !startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
    }
    setRunning((v) => !v);
  }

  function finish() {
    const endedAt = new Date().toISOString();
    const startedAt = startedAtRef.current ?? endedAt;
    const durationSec = elapsed;
    setRunning(false);

    if (durationSec < 1) {
      setElapsed(0);
      startedAtRef.current = null;
      setMessage("时长过短，未记录");
      return;
    }

    startTransition(async () => {
      const res = await saveTimerSession({
        goalId,
        startedAt,
        endedAt,
        durationSec,
      });
      setMessage(
        res.ok
          ? `已记录 ${Math.max(1, Math.round(durationSec / 60))} 分钟`
          : "记录失败，请重试",
      );
      setElapsed(0);
      startedAtRef.current = null;
    });
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    startedAtRef.current = null;
    setMessage(null);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <span className="font-mono text-4xl font-semibold tabular-nums">
        {format(elapsed)}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggle}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
            running
              ? "bg-amber-500 hover:bg-amber-400"
              : "bg-emerald-600 hover:bg-emerald-500"
          }`}
        >
          {running ? "暂停" : elapsed > 0 ? "继续" : "开始计时"}
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={pending || elapsed === 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? "保存中..." : "结束并保存"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          重置
        </button>
      </div>

      {message ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      ) : null}
    </div>
  );
}
