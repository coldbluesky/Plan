"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { isAuthenticated } from "@/lib/auth";

async function assertAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export type GoalFormState = { error?: string };

export async function createGoal(
  _prev: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  await assertAuth();

  const title = String(formData.get("title") ?? "").trim();
  const metricType =
    String(formData.get("metricType") ?? "hours") === "lessons"
      ? "lessons"
      : "hours";
  const targetValue = Number(formData.get("targetValue"));
  const deadline = String(formData.get("deadline") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "#6366f1");

  if (!title) return { error: "请填写目标名称" };
  if (!Number.isFinite(targetValue) || targetValue <= 0) {
    return { error: "目标值必须是大于 0 的数字" };
  }

  db.insert(goals)
    .values({ title, metricType, targetValue, deadline, color })
    .run();

  revalidatePath("/");
  revalidatePath("/goals");
  redirect("/goals");
}

export async function updateGoalStatus(
  id: number,
  status: "active" | "done" | "archived",
) {
  await assertAuth();
  db.update(goals).set({ status }).where(eq(goals.id, id)).run();
  revalidatePath("/");
  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);
}

export async function deleteGoal(id: number) {
  await assertAuth();
  db.delete(goals).where(eq(goals.id, id)).run();
  revalidatePath("/");
  revalidatePath("/goals");
  redirect("/goals");
}
