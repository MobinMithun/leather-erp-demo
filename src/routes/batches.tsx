import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatusPill } from "@/components/page-shell";
import { BATCHES, STAGES, fmtNum } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/batches")({
  head: () => ({ meta: [{ title: "Batches — HIDE.OS" }] }),
  component: BatchesPage,
});

function BatchesPage() {
  return (
    <PageShell
      title="Production Batches"
      subtitle="Batch-level tracking through wet ops; piece-level after shaving"
      actions={
        <button className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> New batch
        </button>
      }
    >
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm tabular">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Batch</th>
              <th className="px-4 py-2.5 text-left font-medium">Order</th>
              <th className="px-4 py-2.5 text-left font-medium">Article</th>
              <th className="px-4 py-2.5 text-left font-medium">Species</th>
              <th className="px-4 py-2.5 text-right font-medium">Raw kg</th>
              <th className="px-4 py-2.5 text-right font-medium">Pcs</th>
              <th className="px-4 py-2.5 text-left font-medium">Drum</th>
              <th className="px-4 py-2.5 text-left font-medium">Recipe</th>
              <th className="px-4 py-2.5 text-left font-medium">Exit</th>
              <th className="px-4 py-2.5 text-left font-medium">Stage</th>
              <th className="px-4 py-2.5 w-64 text-left font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {BATCHES.map((b) => {
              const stageIdx = STAGES.findIndex((s) => s.code === b.current_stage);
              const total = b.exit === "wet_blue" ? 7 : b.exit === "crust" ? 11 : 15;
              const pct = Math.min(100, Math.round(((stageIdx + 1) / total) * 100));
              return (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs">{b.batch_no}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{b.order_no}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{b.article}</td>
                  <td className="px-4 py-2.5 capitalize">{b.species}</td>
                  <td className="px-4 py-2.5 text-right">{fmtNum(b.raw_kg)}</td>
                  <td className="px-4 py-2.5 text-right">{b.pieces}</td>
                  <td className="px-4 py-2.5">{b.drum}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{b.recipe}</td>
                  <td className="px-4 py-2.5 text-xs uppercase">{b.exit.replace("_", "-")}</td>
                  <td className="px-4 py-2.5"><StatusPill status={b.status} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-muted">
                        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border border-border bg-card p-4">
        <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Process pipeline · 16 stages
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s, i) => (
            <div
              key={s.code}
              className={`flex items-center gap-1.5 border px-2 py-1 text-[10px] uppercase tracking-wider ${
                s.piece ? "border-accent/40 bg-accent/5 text-accent-foreground" : "border-border bg-muted text-muted-foreground"
              }`}
            >
              <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-muted border border-border" />Batch-level</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 bg-accent/30 border border-accent/40" />Piece-level</span>
        </div>
      </div>
    </PageShell>
  );
}
