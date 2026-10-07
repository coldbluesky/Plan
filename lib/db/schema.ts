import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * 学习目标：一个目标要么按「小时数」衡量，要么按「课程数」衡量。
 */
export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  metricType: text("metric_type", { enum: ["hours", "lessons"] })
    .notNull()
    .default("hours"),
  targetValue: real("target_value").notNull(),
  deadline: text("deadline"),
  status: text("status", { enum: ["active", "done", "archived"] })
    .notNull()
    .default("active"),
  color: text("color").notNull().default("#6366f1"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/**
 * 学习记录：一条 = 一次学习。计时器与手动补录统一存这里。
 */
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  goalId: integer("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationMin: integer("duration_min").notNull().default(0),
  lessonsDelta: integer("lessons_delta").notNull().default(0),
  note: text("note"),
  source: text("source", { enum: ["timer", "manual", "import"] })
    .notNull()
    .default("manual"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
