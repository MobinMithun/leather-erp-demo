import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatusPill } from "@/components/page-shell";
import { PIECES } from "@/lib/mock-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/pieces")({
  head: () => ({ meta: [{ title: "Pieces — HIDE.OS" }] }),
  component: PiecesPage,
});

function PiecesPage() {
  const totalSqft = PIECES.reduce((s, p) => s + p.sqft, 0);
  const aGrade = PIECES.filter((p) => p.grade === "A").length;
  return (
    <PageShell
      title="Pieces"
      subtitle="Per-piece traceability after splitting / shaving"
      actions={
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search piece # or batch"
            className="w-64 border border-border bg-background py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pieces tracked</div>
          <div className="mt-1 text-2xl font-semibold tabular">{PIECES.length}</div>
        </div>
        <div className="border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total sq ft</div>
          <div className="mt-1 text-2xl font-semibold tabular">{totalSqft.toFixed(1)}</div>
        </div>
        <div className="border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Grade A</div>
          <div className="mt-1 text-2xl font-semibold tabular text-status-ok">{aGrade}</div>
        </div>
        <div className="border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg thickness</div>
          <div className="mt-1 text-2xl font-semibold tabular">
            {(PIECES.reduce((s, p) => s + p.thickness_mm, 0) / PIECES.length).toFixed(2)}<span className="text-sm text-muted-foreground"> mm</span>
          </div>
        </div>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm tabular">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Piece #</th>
              <th className="px-4 py-2.5 text-left font-medium">Batch</th>
              <th className="px-4 py-2.5 text-left font-medium">Article</th>
              <th className="px-4 py-2.5 text-left font-medium">Layer</th>
              <th className="px-4 py-2.5 text-right font-medium">Sq ft</th>
              <th className="px-4 py-2.5 text-right font-medium">mm</th>
              <th className="px-4 py-2.5 text-left font-medium">Stage</th>
              <th className="px-4 py-2.5 text-left font-medium">Defect</th>
              <th className="px-4 py-2.5 text-left font-medium">Grade</th>
            </tr>
          </thead>
          <tbody>
            {PIECES.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-2 font-mono text-xs">{p.piece_no}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.batch_no}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.article}</td>
                <td className="px-4 py-2 text-xs uppercase">{p.layer}</td>
                <td className="px-4 py-2 text-right">{p.sqft.toFixed(1)}</td>
                <td className="px-4 py-2 text-right">{p.thickness_mm.toFixed(2)}</td>
                <td className="px-4 py-2"><StatusPill status={p.stage} /></td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{p.defect ?? "—"}</td>
                <td className="px-4 py-2"><StatusPill status={p.grade} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
