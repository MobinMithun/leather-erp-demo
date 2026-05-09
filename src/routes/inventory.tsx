import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard } from "@/components/page-shell";
import { INVENTORY_POOLS, fmtBDT, fmtNum, type StockMove } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal } from "lucide-react";
import { StockMoveDialog } from "@/components/stock-move-dialog";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory — HIDE.OS" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { chemicals, rawSkins, stockMoves } = useStore();

  return (
    <PageShell title="Inventory" subtitle="Raw skins · chemicals · finished goods pools">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {INVENTORY_POOLS.map((p) => (
          <StatCard
            key={p.pool}
            label={`${p.pool} pool`}
            value={fmtNum(p.pieces) + " pcs"}
            sub={`${fmtNum(p.sqft)} sq ft · ${fmtBDT(p.value_bdt)}`}
          />
        ))}
      </div>

      <section>
        <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Raw skin lots · FIFO
        </h2>
        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm tabular">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Lot #</th>
                <th className="px-4 py-2.5 text-left font-medium">Species</th>
                <th className="px-4 py-2.5 text-left font-medium">Origin</th>
                <th className="px-4 py-2.5 text-right font-medium">Pieces</th>
                <th className="px-4 py-2.5 text-right font-medium">Total kg</th>
                <th className="px-4 py-2.5 text-right font-medium">Cost / pc</th>
                <th className="px-4 py-2.5 text-right font-medium">Lot value</th>
                <th className="px-4 py-2.5 text-left font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {rawSkins.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs">{r.lot_no}</td>
                  <td className="px-4 py-2.5 capitalize">{r.species}</td>
                  <td className="px-4 py-2.5">{r.origin}</td>
                  <td className="px-4 py-2.5 text-right">{fmtNum(r.pieces)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtNum(r.total_kg)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtBDT(r.unit_cost_bdt)}</td>
                  <td className="px-4 py-2.5 text-right">{fmtBDT(r.unit_cost_bdt * r.pieces)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.received}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Chemical lots
        </h2>
        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm tabular">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Chemical</th>
                <th className="px-4 py-2.5 text-left font-medium">Type</th>
                <th className="px-4 py-2.5 text-left font-medium">Lot #</th>
                <th className="px-4 py-2.5 text-left font-medium">Supplier</th>
                <th className="px-4 py-2.5 text-right font-medium">Qty kg</th>
                <th className="px-4 py-2.5 text-right font-medium">Reorder</th>
                <th className="px-4 py-2.5 text-right font-medium">Cost / kg</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {chemicals.map((c) => {
                const low = c.qty_kg < c.reorder_kg;
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5">{c.chemical}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{c.type}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{c.lot_no}</td>
                    <td className="px-4 py-2.5 text-xs">{c.supplier}</td>
                    <td className="px-4 py-2.5 text-right">{fmtNum(c.qty_kg)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtNum(c.reorder_kg)}</td>
                    <td className="px-4 py-2.5 text-right">{fmtBDT(c.unit_cost_bdt)}</td>
                    <td className="px-4 py-2.5">
                      {low ? (
                        <span className="inline-flex items-center rounded-sm bg-status-bad/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-status-bad">
                          Reorder
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-sm bg-status-ok/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-status-ok">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-end justify-between gap-3">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Stock moves · all
          </h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ArrowDownToLine className="h-3 w-3 text-status-ok" />In</span>
              <span className="inline-flex items-center gap-1"><ArrowUpFromLine className="h-3 w-3 text-status-bad" />Out</span>
              <span className="inline-flex items-center gap-1"><ArrowLeftRight className="h-3 w-3 text-status-info" />Transfer</span>
              <span className="inline-flex items-center gap-1"><SlidersHorizontal className="h-3 w-3 text-status-warn" />Adjust</span>
            </div>
            <StockMoveDialog />
          </div>
        </div>
        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm tabular">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Time</th>
                <th className="px-4 py-2.5 text-left font-medium">Type</th>
                <th className="px-4 py-2.5 text-left font-medium">Item</th>
                <th className="px-4 py-2.5 text-left font-medium">Lot</th>
                <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                <th className="px-4 py-2.5 text-left font-medium">From</th>
                <th className="px-4 py-2.5 text-left font-medium">To</th>
                <th className="px-4 py-2.5 text-left font-medium">Ref</th>
                <th className="px-4 py-2.5 text-left font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {stockMoves.map((m: StockMove) => {
                const tone =
                  m.type === "IN" ? "text-status-ok"
                    : m.type === "OUT" ? "text-status-bad"
                    : m.type === "TRANSFER" ? "text-status-info"
                    : "text-status-warn";
                const Icon =
                  m.type === "IN" ? ArrowDownToLine
                    : m.type === "OUT" ? ArrowUpFromLine
                    : m.type === "TRANSFER" ? ArrowLeftRight
                    : SlidersHorizontal;
                return (
                  <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{m.ts}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ${tone}`}>
                        <Icon className="h-3 w-3" /> {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{m.item}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{m.lot_no}</td>
                    <td className={`px-4 py-2.5 text-right font-medium ${m.qty < 0 ? "text-status-bad" : ""}`}>
                      {m.qty > 0 ? "+" : ""}{fmtNum(m.qty)} {m.unit}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{m.from}</td>
                    <td className="px-4 py-2.5 text-xs">{m.to}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{m.ref}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{m.user}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
