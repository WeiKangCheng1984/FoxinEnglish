"use client";

import { useEffect, useState } from "react";
import { getCompletedDays, toggleCompletedDay } from "@/lib/storage";

export function CompleteDayButton({ day }: { day: number }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(getCompletedDays().includes(day));
  }, [day]);

  return (
    <button
      type="button"
      onClick={() => setDone(toggleCompletedDay(day).includes(day))}
      className={`rounded-full px-4 py-2 text-sm ${
        done ? "bg-forest text-white" : "bg-ink text-sand hover:bg-copper"
      }`}
    >
      {done ? "今天已完成（再點可取消）" : "標記這天完成"}
    </button>
  );
}
