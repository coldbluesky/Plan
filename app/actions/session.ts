"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";

async function assertAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

function revalidateAll(goalId?: number) {
  revalidatePath("/");
  revalidatePath("/goals");
  revalidatePath("/stats");
  if (goalId) revalidatePath(`/goals/${goalId}`);
}

export type SessionFormState = { error?: string; ok?: boolean };

export async function addManualSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await assertAuth();

  const goalId = Number(formData.get("goalId"));
  const dateStr = String(formData.get("date") ?? "").trim();
  const durationMin = Number(formData.get("durationMin") ?? 0);
  const lessonsDelta = Number(formData.get("lessonsDelta") ?? 0);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!Number.isFinite(goalId) || goalId <= 0) {
    return { error: "请选择学习目标" };
  }
  if (
    (!Number.isFinite(durationMin) || durationMin <= 0) &&
    (!Number.isFinite(lessonsDelta) || lessonsDelta <= 0)
  ) {
    return { error: "请填写时长或课程数" };
  }

  const startedAt = dateStr
    ? new Date(`${dateStr}T12:00:00`).toISOString()
    : new Date().toISOString();

  db.insert(sessions)
    .values({
      goalId,
      startedAt,
      endedAt: startedAt,
      durationMin: Number.isFinite(durationMin) && durationMin > 0 ? Math.round(durationMin) : 0,
      lessonsDelta:
        Number.isFinite(lessonsDelta) && lessonsDelta > 0 ? Math.round(lessonsDelta) : 0,
      note,
      source: "manual",
    })
    .run();

  revalidateAll(goalId);
  return { ok: true };
}

export type TimerPayload = {
  goalId: number;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  note?: string;
};

export async function saveTimerSession(
  payload: TimerPayload,
): Promise<{ ok: boolean }> {
  await assertAuth();

  const goalId = Number(payload.goalId);
  const durationMin = Math.max(1, Math.round((payload.durationSec ?? 0) / 60));

  if (!Number.isFinite(goalId) || goalId <= 0) return { ok: false };

  db.insert(sessions)
    .values({
      goalId,
      startedAt: payload.startedAt || new Date().toISOString(),
      endedAt: payload.endedAt || new Date().toISOString(),
      durationMin,
      lessonsDelta: 0,
      note: payload.note?.trim() || null,
      source: "timer",
    })
    .run();

  revalidateAll(goalId);
  return { ok: true };
}

export async function deleteSession(id: number, goalId: number) {
  await assertAuth();
  db.delete(sessions).where(eq(sessions.id, id)).run();
  revalidateAll(goalId);
}
