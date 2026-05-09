import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatusPill } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { type PieceRow } from "@/lib/mock-data";
import { Search, Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/pieces")({
  head: () => ({ meta: [{ title: "Pieces — HIDE.OS" }] }),
  component: PiecesPage,
});

const GRADES: PieceRow["grade"][] = ["A", "B", "C", "REJ"];

function PiecesPage() {
  const { pieces, gradePiece } = useStore();
  const [search, setSearch] = useState("");
  const [gradeTarget, setGradeTarget] = useState<PieceRow | null>(null);
  const [gradeVal, setGradeVal] = useState<PieceRow["grade"]>("A");
  const [sqft, setSqft] = useState("");
  const [thickness, setThickness] = useState("");
  const [defect, setDefect] = useState("");

  const visible = search.trim()
    ? pieces.filter(
        (p) =>
          p.piece_no.toLowerCase().includes(search.toLowerCase()) ||
          p.batch_no.toLowerCase().includes(search.toLowerCase())
      )
    : pieces;

  const totalSqft = visible.reduce((s, p) => s + p.sqft, 0);
  const aGrade = visible.filter((p) => p.grade === "A").length;

  const openGrade = (p: PieceRow) => {
    setGradeTarget(p);
    setGradeVal(p.grade);
    setSqft(String(p.sqft));
    setThickness(String(p.thickness_mm));
    setDefect(p.defect ?? "");
  };

  const submitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeTarget) return;
    if (!sqft || !thickness) {
      toast.error("Sq ft and thickness are required");
      return;
    }
    gradePiece(gradeTarget.id, gradeVal, Number(sqft), Number(thickness), defect || null);
    toast.success(`${gradeTarget.piece_no} graded ${gradeVal}`, {
      description: `${sqft} sq ft · ${thickness} mm`,
    });
    setGradeTarget(null);
  };

  return (
    <PageShell
      title="Pieces"
      subtitle="Per-piece traceability after splitting / shaving"
      actions={
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search piece # or batch"
            className="w-64 border border-border bg-background py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pieces tracked</div>
          <div className="mt-1 text-2xl font-semibold tabular">{visible.length}</div>
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
            {visible.length > 0
              ? (visible.reduce((s, p) => s + p.thickness_mm, 0) / visible.length).toFixed(2)
              : "—"}
            <span className="text-sm text-muted-foreground"> mm</span>
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
              <th className="px-4 py-2.5 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No pieces match your search.
                </td>
              </tr>
            ) : (
              visible.map((p) => (
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
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openGrade(p)}
                      className="inline-flex items-center gap-1 border border-border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-wider hover:bg-muted"
                    >
                      <Pencil className="h-2.5 w-2.5" /> Grade
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grade dialog */}
      <Dialog open={!!gradeTarget} onOpenChange={(o) => { if (!o) setGradeTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Grade piece</DialogTitle>
            <DialogDescription className="text-xs font-mono">
              {gradeTarget?.piece_no}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitGrade} className="grid grid-cols-2 gap-3 pt-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Grade</Label>
              <div className="flex gap-2">
                {GRADES.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGradeVal(g)}
                    className={`flex-1 border px-2 py-1.5 text-xs font-medium uppercase ${
                      gradeVal === g
                        ? g === "A" ? "border-status-ok bg-status-ok/10 text-status-ok"
                          : g === "B" ? "border-status-info bg-status-info/10 text-status-info"
                          : g === "C" ? "border-status-warn bg-status-warn/10 text-status-warn"
                          : "border-status-bad bg-status-bad/10 text-status-bad"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Sq ft</Label>
              <Input type="number" step="0.1" min={0} value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="22.5" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Thickness (mm)</Label>
              <Input type="number" step="0.01" min={0} value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="1.20" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Defect notes</Label>
              <Input value={defect} onChange={(e) => setDefect(e.target.value)} placeholder="scratch, stain, etc." maxLength={120} />
            </div>
            <DialogFooter className="col-span-2 mt-1">
              <button type="button" onClick={() => setGradeTarget(null)} className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Save grade</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
