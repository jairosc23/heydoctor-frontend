"use client";

import { useState } from "react";
import { W3CollabWorkspace } from "@/components/hcx/intelligence/collab";
import { isW3CollabEnabled } from "@/lib/w3/flags";

export default function W3CollabDevPage() {
  const enabled = isW3CollabEnabled();
  const [message, setMessage] = useState<string | null>(null);
  const [tasks, setTasks] = useState([
    {
      taskId: "t1",
      title: "Review labs (demo)",
      status: "assigned",
      assigneeUserId: "u2",
      isConfirm: false as const,
    },
  ]);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-collab-disabled">
          Define <code>NEXT_PUBLIC_W3_COLLAB=true</code>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800 }}>
      <W3CollabWorkspace
        enabled
        message={message}
        threads={[{ threadId: "th1", title: "Handoff discussion (demo)" }]}
        messages={[
          {
            messageId: "m1",
            threadId: "th1",
            body: "Please review @nurse1 — advisory only",
            mentionUserIds: ["nurse1"],
          },
        ]}
        notes={[
          {
            noteId: "n1",
            body: "Shared advisory note — not clinical authority.",
            advisory: true,
          },
        ]}
        tasks={tasks}
        presence={[
          { userId: "u1", displayName: "Dr Demo" },
          { userId: "u2", displayName: "Nurse Demo" },
        ]}
        activity={[
          {
            activityId: "a1",
            kind: "task_created",
            summary: "Task created (not Confirm)",
          },
          {
            activityId: "a2",
            kind: "mention",
            summary: "Mentioned: @nurse1",
          },
        ]}
        onCompleteTask={(id) => {
          setTasks((prev) =>
            prev.map((t) =>
              t.taskId === id ? { ...t, status: "done", isConfirm: false } : t,
            ),
          );
          setMessage("Task marked done. Ack ≠ Confirm. HAB unchanged.");
        }}
      />
    </main>
  );
}
