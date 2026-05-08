import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard } from "@/components/page-shell";
import { QC, fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/qc")({
  head: () => ({ meta: [{ title: "QC + Grading — HIDE.OS" }] }),
  component: QCPage,
});

function QCPage() {
  const totalInspected = QC.reduce((s, q) => s + q.inspected, 0);
  const totalA = QC.reduce((s, q) => s + q.grade_a, 0);
  const totalRej = QC.reduce((s, q) => s + q.rejects, 0);

  return (
    <PageShell title="QC + Grading" subtitle="Per-batch grade distribution and yield">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Inspected (30d)" value={fmtNum(totalInspected)} />
        <StatCard label="Grade A" value={fmtNum(totalA)} tone="ok" sub={`${((totalA / totalInspected) * 100).toFixed(1)}%`} />
        <StatCard label="Rejects" value={fmtNum(totalRej)} tone="bad" sub={`${((totalRej / totalInspected) * 100).toFixed(1)}%`} />
        <StatCard label="Avg yield" value={`${(QC.reduce((s, q) => s + q.yield_pct, 0) / QC.length).toFixed(1)}%`} tone="ok" />
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
            {QC.map((q) => {
              const a = (q.grade_a / q.inspected) * 100;
              const b = (q.grade_b / q.inspected) * 100;
              const c = (q.grade_c / q.inspected) * 100;
              const rej = (q.rejects / q.inspected) * 100;
              return (
                <tr key={q.batch_no} className="border-t border-border hover:bg-muted/30">
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
                      <div className="bg-status-ok" style={{ width: `${a}%` }} title={`A ${a.toFixed(1)}%`} />
                      <div className="bg-status-info" style={{ width: `${b}%` }} title={`B ${b.toFixed(1)}%`} />
                      <div className="bg-status-warn" style={{ width: `${c}%` }} title={`C ${c.toFixed(1)}%`} />
                      <div className="bg-status-bad" style={{ width: `${rej}%` }} title={`REJ ${rej.toFixed(1)}%`} />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">{q.yield_pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
