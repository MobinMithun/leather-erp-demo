import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard } from "@/components/page-shell";
import { fmtNum } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/qc")({
  head: () => ({ meta: [{ title: "QC + Grading — HIDE.OS" }] }),
  component: QCPage,
});

function QCPage() {
  const { qcEntries, batches, addQCEntry } = useStore();
  const [open, setOpen] = useState(false);
  const [batchNo, setBatchNo] = useState("");
  const [article, setArticle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [inspected, setInspected] = useState("");
  const [gradeA, setGradeA] = useState("");
  const [gradeB, setGradeB] = useState("");
  const [gradeC, setGradeC] = useState("");
  const [rejects, setRejects] = useState("");

  const reset = () => {
    setBatchNo(""); setArticle(""); setDate(new Date().toISOString().slice(0, 10));
    setInspected(""); setGradeA(""); setGradeB(""); setGradeC(""); setRejects("");
  };

  const handleBatchSelect = (bn: string) => {
    setBatchNo(bn);
    const b = batches.find((b) => b.batch_no === bn);
    if (b) setArticle(b.article);
  };

  const totalInspected = qcEntries.reduce((s, q) => s + q.inspected, 0);
  const totalA = qcEntries.reduce((s, q) => s + q.grade_a, 0);
  const totalRej = qcEntries.reduce((s, q) => s + q.rejects, 0);
  const avgYield = qcEntries.length > 0
    ? qcEntries.reduce((s, q) => s + q.yield_pct, 0) / qcEntries.length
    : 0;

  const submitQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNo || !inspected) {
      toast.error("Batch and inspected count are required");
      return;
    }
    const ins = Number(inspected);
    const a = Number(gradeA) || 0;
    const b = Number(gradeB) || 0;
    const c = Number(gradeC) || 0;
    const r = Number(rejects) || 0;
    if (a + b + c + r > ins) {
      toast.error("Grade counts exceed inspected total");
      return;
    }
    const yield_pct = +((((ins - r) / ins) * 100).toFixed(1));
    addQCEntry({
      batch_no: batchNo,
      article: article || batchNo,
      inspected: ins,
      grade_a: a,
      grade_b: b,
      grade_c: c,
      rejects: r,
      yield_pct,
      date,
    });
    toast.success(`QC logged · ${batchNo} · yield ${yield_pct}%`);
    reset();
    setOpen(false);
  };

  return (
    <PageShell
      title="QC + Grading"
      subtitle="Per-batch grade distribution and yield"
      actions={
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Log QC
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Inspected (all)" value={fmtNum(totalInspected)} />
        <StatCard
          label="Grade A"
          value={fmtNum(totalA)}
          tone="ok"
          sub={totalInspected > 0 ? `${((totalA / totalInspected) * 100).toFixed(1)}%` : undefined}
        />
        <StatCard
          label="Rejects"
          value={fmtNum(totalRej)}
          tone="bad"
          sub={totalInspected > 0 ? `${((totalRej / totalInspected) * 100).toFixed(1)}%` : undefined}
        />
        <StatCard label="Avg yield" value={`${avgYield.toFixed(1)}%`} tone="ok" />
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm tabular">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Batch</th>
              <th className="px-4 py-2.5 text-left font-medium">Article</th>
              <th className="px-4 py-2.5 text-left font-medium">Date</th>
              <th className="px-4 py-2.5 text-right font-medium">Inspected</th>
              <th className="px-4 py-2.5 text-right font-medium">Grade A</th>
              <th className="px-4 py-2.5 text-right font-medium">Grade B</th>
              <th className="px-4 py-2.5 text-right font-medium">Grade C</th>
              <th className="px-4 py-2.5 text-right font-medium">Rejects</th>
              <th className="px-4 py-2.5 w-48 text-left font-medium">Distribution</th>
              <th className="px-4 py-2.5 text-right font-medium">Yield</th>
            </tr>
          </thead>
          <tbody>
            {qcEntries.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No QC records yet. Log one with the button above.
                </td>
              </tr>
            ) : (
              qcEntries.map((q, i) => {
                const a = (q.grade_a / q.inspected) * 100;
                const b = (q.grade_b / q.inspected) * 100;
                const c = (q.grade_c / q.inspected) * 100;
                const rej = (q.rejects / q.inspected) * 100;
                return (
                  <tr key={i} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{q.batch_no}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{q.article}</td>
                    <td className="px-4 py-2.5 text-xs">{q.date}</td>
                    <td className="px-4 py-2.5 text-right">{fmtNum(q.inspected)}</td>
                    <td className="px-4 py-2.5 text-right text-status-ok">{fmtNum(q.grade_a)}</td>
                    <td className="px-4 py-2.5 text-right">{fmtNum(q.grade_b)}</td>
                    <td className="px-4 py-2.5 text-right">{fmtNum(q.grade_c)}</td>
                    <td className="px-4 py-2.5 text-right text-status-bad">{fmtNum(q.rejects)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex h-2 w-full overflow-hidden">
                        <div className="bg-status-ok" style={{ width: `${a}%` }} />
                        <div className="bg-status-info" style={{ width: `${b}%` }} />
                        <div className="bg-status-warn" style={{ width: `${c}%` }} />
                        <div className="bg-status-bad" style={{ width: `${rej}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">{q.yield_pct}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Log QC dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log QC inspection</DialogTitle>
            <DialogDescription className="text-xs">
              Record grade distribution for a production batch.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitQC} className="grid grid-cols-2 gap-3 pt-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Batch</Label>
              <Select value={batchNo} onValueChange={handleBatchSelect}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.batch_no}>
                      <span className="font-mono text-xs">{b.batch_no}</span> · {b.article}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Inspected (total)</Label>
              <Input type="number" min={1} value={inspected} onChange={(e) => setInspected(e.target.value)} placeholder="800" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Grade A</Label>
              <Input type="number" min={0} value={gradeA} onChange={(e) => setGradeA(e.target.value)} placeholder="510" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Grade B</Label>
              <Input type="number" min={0} value={gradeB} onChange={(e) => setGradeB(e.target.value)} placeholder="200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Grade C</Label>
              <Input type="number" min={0} value={gradeC} onChange={(e) => setGradeC(e.target.value)} placeholder="70" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Rejects</Label>
              <Input type="number" min={0} value={rejects} onChange={(e) => setRejects(e.target.value)} placeholder="20" />
            </div>
            <DialogFooter className="col-span-2 mt-2">
              <button type="button" onClick={() => setOpen(false)} className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Log inspection</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
