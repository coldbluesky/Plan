import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { goals, sessions, type Goal } from "./db/schema";

export type GoalProgress = Goal & {
  /** 已累计值：小时模式下是「小时」，课程模式下是「课数」 */
  progressValue: number;
  /** 0 - 100 */
  percent: number;
};

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDayIso(d = new Date()): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

export function getGoalsWithProgress(): GoalProgress[] {
  const rows = db
    .select({
      goal: goals,
      totalMin: sql<number>`coalesce(sum(${sessions.durationMin}), 0)`,
      totalLessons: sql<number>`coalesce(sum(${sessions.lessonsDelta}), 0)`,
    })
    .from(goals)
    .leftJoin(sessions, eq(sessions.goalId, goals.id))
    .groupBy(goals.id)
    .all();

  return rows.map(({ goal, totalMin, totalLessons }) => {
    const progressValue =
      goal.metricType === "hours" ? totalMin / 60 : totalLessons;
    const percent =
      goal.targetValue > 0
        ? Math.min(100, (progressValue / goal.targetValue) * 100)
        : 0;
    return { ...goal, progressValue, percent };
  });
}

export function getGoalById(id: number) {
  return db.select().from(goals).where(eq(goals.id, id)).get();
}

export function getGoalProgress(id: number): GoalProgress | undefined {
  return getGoalsWithProgress().find((g) => g.id === id);
}

export function getSessionsByGoal(goalId: number) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.goalId, goalId))
    .orderBy(sql`${sessions.startedAt} desc`)
    .all();
}

export function getRecentSessions(limit = 10) {
  return db
    .select({
      id: sessions.id,
      goalId: sessions.goalId,
      startedAt: sessions.startedAt,
      durationMin: sessions.durationMin,
      lessonsDelta: sessions.lessonsDelta,
      note: sessions.note,
      source: sessions.source,
      goalTitle: goals.title,
      goalColor: goals.color,
    })
    .from(sessions)
    .innerJoin(goals, eq(sessions.goalId, goals.id))
    .orderBy(sql`${sessions.startedAt} desc`)
    .limit(limit)
    .all();
}

export function getTodayStats() {
  const row = db
    .select({
      totalMin: sql<number>`coalesce(sum(${sessions.durationMin}), 0)`,
      totalLessons: sql<number>`coalesce(sum(${sessions.lessonsDelta}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(sessions)
    .where(sql`${sessions.startedAt} >= ${startOfDayIso()}`)
    .get();
  return row ?? { totalMin: 0, totalLessons: 0, count: 0 };
}

export function getStreak(): number {
  const rows = db.select({ startedAt: sessions.startedAt }).from(sessions).all();
  const days = new Set(rows.map((r) => localDateKey(new Date(r.startedAt))));
  const cursor = new Date();
  if (!days.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(localDateKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type HeatmapCell = { date: string; minutes: number; count: number };

export function getHeatmap(days = 182): HeatmapCell[] {
  const rows = db
    .select({ startedAt: sessions.startedAt, durationMin: sessions.durationMin })
    .from(sessions)
    .all();

  const map = new Map<string, { minutes: number; count: number }>();
  for (const r of rows) {
    const key = localDateKey(new Date(r.startedAt));
    const cur = map.get(key) ?? { minutes: 0, count: 0 };
    cur.minutes += r.durationMin;
    cur.count += 1;
    map.set(key, cur);
  }

  const out: HeatmapCell[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateKey(d);
    const v = map.get(key);
    out.push({ date: key, minutes: v?.minutes ?? 0, count: v?.count ?? 0 });
  }
  return out;
}

export type DailyPoint = { date: string; minutes: number };

export function getDailyMinutes(days = 14): DailyPoint[] {
  const rows = db
    .select({ startedAt: sessions.startedAt, durationMin: sessions.durationMin })
    .from(sessions)
    .all();

  const map = new Map<string, number>();
  for (const r of rows) {
    const key = localDateKey(new Date(r.startedAt));
    map.set(key, (map.get(key) ?? 0) + r.durationMin);
  }

  const out: DailyPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateKey(d);
    out.push({ date: key, minutes: map.get(key) ?? 0 });
  }
  return out;
}
