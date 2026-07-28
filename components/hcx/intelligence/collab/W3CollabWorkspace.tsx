export type W3CollabThreadModel = {
  threadId: string;
  title: string;
};

export type W3CollabMessageModel = {
  messageId: string;
  threadId: string;
  body: string;
  mentionUserIds: string[];
};

export type W3CollabNoteModel = {
  noteId: string;
  body: string;
  advisory: true;
};

export type W3CollabTaskModel = {
  taskId: string;
  title: string;
  status: string;
  assigneeUserId: string | null;
  isConfirm: false;
};

export type W3CollabPresenceModel = {
  userId: string;
  displayName: string | null;
};

export type W3CollabActivityModel = {
  activityId: string;
  kind: string;
  summary: string;
};

export type W3CollabWorkspaceProps = {
  enabled?: boolean;
  threads: W3CollabThreadModel[];
  messages: W3CollabMessageModel[];
  notes: W3CollabNoteModel[];
  tasks: W3CollabTaskModel[];
  presence: W3CollabPresenceModel[];
  activity: W3CollabActivityModel[];
  onCompleteTask?: (taskId: string) => void;
  message?: string | null;
};

/**
 * WP-07 Clinical Collaboration workspace.
 * Communication only — Ack/complete ≠ Confirm. No Emit / Ready.
 */
export function W3CollabWorkspace({
  enabled = true,
  threads,
  messages,
  notes,
  tasks,
  presence,
  activity,
  onCompleteTask,
  message,
}: W3CollabWorkspaceProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-collab-off">
        Clinical Collaboration (`w3.collab.tasks`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-collab-workspace"
      data-w3-flag="w3.collab.tasks"
      data-is-authority="false"
      data-may-confirm="false"
      data-communication-only="true"
    >
      <header>
        <h2>Clinical Collaboration (communication only)</h2>
        <p>
          Threads, mentions, advisory notes, tasks, and presence. Completing a
          task is never Confirm — HAB remains sole clinical authority.
        </p>
      </header>
      {message ? <p data-testid="w3-collab-message">{message}</p> : null}

      <div data-testid="w3-collab-presence">
        <h3>Presence</h3>
        <ul>
          {presence.map((p) => (
            <li key={p.userId} data-testid="w3-collab-presence-row">
              {p.displayName || p.userId}
            </li>
          ))}
        </ul>
      </div>

      <div data-testid="w3-collab-threads">
        <h3>Discussion threads</h3>
        <ul>
          {threads.map((t) => (
            <li key={t.threadId} data-testid="w3-collab-thread-row">
              {t.title}
              <ul>
                {messages
                  .filter((m) => m.threadId === t.threadId)
                  .map((m) => (
                    <li key={m.messageId} data-testid="w3-collab-message-row">
                      {m.body}
                      {m.mentionUserIds.length
                        ? ` · mentions: ${m.mentionUserIds.join(", ")}`
                        : ""}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div data-testid="w3-collab-notes">
        <h3>Shared advisory notes</h3>
        <ul>
          {notes.map((n) => (
            <li
              key={n.noteId}
              data-testid="w3-collab-note-row"
              data-advisory="true"
            >
              {n.body}
            </li>
          ))}
        </ul>
      </div>

      <div data-testid="w3-collab-tasks">
        <h3>Tasks (Ack ≠ Confirm)</h3>
        <ul>
          {tasks.map((t) => (
            <li
              key={t.taskId}
              data-testid="w3-collab-task-row"
              data-is-confirm="false"
              data-status={t.status}
            >
              <strong>{t.title}</strong> · {t.status}
              {t.assigneeUserId ? ` · assignee ${t.assigneeUserId}` : ""}
              {t.status !== "done" && t.status !== "cancelled" ? (
                <button
                  type="button"
                  onClick={() => onCompleteTask?.(t.taskId)}
                >
                  Mark done
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div data-testid="w3-collab-activity">
        <h3>Activity feed</h3>
        <ul>
          {activity.map((a) => (
            <li key={a.activityId} data-testid="w3-collab-activity-row">
              [{a.kind}] {a.summary}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
