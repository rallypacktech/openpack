import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ExternalLink, ListChecks, Loader2 } from "lucide-react";
import { RED_CROSS_TASKS, RED_CROSS_SOURCE } from "@/lib/redCrossTasks";

const GROUPS = [
  { category: "preparedness", label: "Do it this month" },
  { category: "training", label: "Get trained" },
];

// Red Cross preparedness tasks and trainings, turned into a checklist the user
// owns. Completion is saved per task, so the list survives a reload.
export default function RecommendedTasks() {
  const [records, setRecords] = useState({});
  const [busyKey, setBusyKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await base44.entities.UserTask.list();
        const map = {};
        saved.forEach((row) => {
          map[row.task_key] = { id: row.id, completed: !!row.completed };
        });
        setRecords(map);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = async (task) => {
    const existing = records[task.key];
    setBusyKey(task.key);
    if (existing) {
      const next = !existing.completed;
      setRecords((prev) => ({ ...prev, [task.key]: { ...existing, completed: next } }));
      await base44.entities.UserTask.update(existing.id, {
        completed: next,
        completed_at: next ? new Date().toISOString() : null,
      });
    } else {
      const created = await base44.entities.UserTask.create({
        task_key: task.key,
        title: task.title,
        category: task.category,
        source: RED_CROSS_SOURCE,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      setRecords((prev) => ({ ...prev, [task.key]: { id: created.id, completed: true } }));
    }
    setBusyKey(null);
  };

  const done = RED_CROSS_TASKS.filter((t) => records[t.key]?.completed).length;
  const percent = Math.round((done / RED_CROSS_TASKS.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recommended Next Steps</CardTitle>
          <ListChecks className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Red Cross preparedness tasks and trainings, turned into things you can tick off.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" aria-label="Loading your next steps" />
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  {done} of {RED_CROSS_TASKS.length} done
                </span>
                <span>{percent}%</span>
              </div>
              <Progress value={percent} />
            </div>

            {GROUPS.map((group) => (
              <div key={group.category}>
                <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
                  {group.label}
                </h3>
                <div className="space-y-2">
                  {RED_CROSS_TASKS.filter((t) => t.category === group.category).map((task) => {
                    const isDone = !!records[task.key]?.completed;
                    return (
                      <div
                        key={task.key}
                        className={`rounded-lg border p-3 ${
                          isDone ? "bg-green-50 border-green-100" : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggle(task)}
                            disabled={busyKey === task.key}
                            aria-pressed={isDone}
                            aria-label={
                              isDone
                                ? `Mark "${task.title}" as not done`
                                : `Mark "${task.title}" as done`
                            }
                            className="mt-0.5 shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" aria-hidden="true" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                isDone ? "text-green-900 line-through" : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {task.why}
                            </p>
                            <a
                              href={task.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1.5"
                            >
                              {task.cta}
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <p className="text-xs text-muted-foreground pt-1">
              Tasks and trainings come from the {RED_CROSS_SOURCE}. RallyPack is not affiliated
              with the Red Cross.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}