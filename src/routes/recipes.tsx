import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { RECIPES } from "@/lib/mock-data";
import { Plus, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/recipes")({
  head: () => ({ meta: [{ title: "Recipes — HIDE.OS" }] }),
  component: RecipesPage,
});

function RecipesPage() {
  return (
    <PageShell
      title="Recipe Master"
      subtitle="Standard recipes per article · deviations logged as exceptions"
      actions={
        <button className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> New recipe
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {RECIPES.map((r) => (
          <div key={r.id} className="border border-border bg-card p-4 hover:border-accent/40 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center bg-accent/15 text-accent-foreground">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-mono text-xs font-medium">{r.code}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">v{r.version}</div>
                </div>
              </div>
              {r.active && (
                <span className="inline-flex items-center rounded-sm bg-status-ok/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-status-ok">
                  Active
                </span>
              )}
            </div>
            <div className="mt-3 font-mono text-xs text-muted-foreground">{r.article}</div>
            <div className="mt-1 text-xs capitalize text-muted-foreground">{r.species}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stages</div>
                <div className="mt-0.5 text-lg font-semibold tabular">{r.stages}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Chemicals</div>
                <div className="mt-0.5 text-lg font-semibold tabular">{r.chemicals}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
