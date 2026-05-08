import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard } from "@/components/page-shell";
import { CHEMICALS, RAW_SKINS, INVENTORY_POOLS, fmtBDT, fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory — HIDE.OS" }] }),
  component: InventoryPage,
});

function InventoryPage() {
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
              {RAW_SKINS.map((r) => (
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
              {CHEMICALS.map((c) => {
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
    </PageShell>
  );
}
