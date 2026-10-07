"use client";

import { useTransition } from "react";
import { deleteSession } from "@/app/actions/session";

export function DeleteSessionButton({
  id,
  goalId,
}: {
  id: number;
  goalId: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void deleteSession(id, goalId);
        })
      }
      className="text-xs text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
    >
      {pending ? "删除中..." : "删除"}
    </button>
  );
}
