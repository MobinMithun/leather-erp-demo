import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: Props) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            HIDE.OS / {title}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "default" | "ok" | "warn" | "bad" | "info";
}) {
  const toneClass =
    tone === "ok"
      ? "text-status-ok"
      : tone === "warn"
        ? "text-status-warn"
        : tone === "bad"
          ? "text-status-bad"
          : tone === "info"
            ? "text-status-info"
            : "text-foreground";
  return (
    <div className="border border-border bg-card p-4">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold tabular ${toneClass}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    confirmed: "bg-status-info/15 text-status-info",
    in_production: "bg-accent/20 text-accent-foreground",
    ready: "bg-status-ok/15 text-status-ok",
    dispatched: "bg-muted text-muted-foreground",
    queued: "bg-muted text-muted-foreground",
    soak: "bg-status-info/15 text-status-info",
    lime: "bg-status-info/15 text-status-info",
    tan: "bg-accent/20 text-accent-foreground",
    sammy: "bg-accent/20 text-accent-foreground",
    shave: "bg-accent/20 text-accent-foreground",
    dye: "bg-accent/20 text-accent-foreground",
    finish: "bg-accent/20 text-accent-foreground",
    qc: "bg-status-warn/15 text-status-warn",
    done: "bg-status-ok/15 text-status-ok",
    A: "bg-status-ok/15 text-status-ok",
    B: "bg-status-info/15 text-status-info",
    C: "bg-status-warn/15 text-status-warn",
    REJ: "bg-status-bad/15 text-status-bad",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
