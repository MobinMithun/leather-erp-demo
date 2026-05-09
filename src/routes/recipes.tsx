import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useStore } from "@/lib/store";
import { Plus, FlaskConical } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/recipes")({
  head: () => ({ meta: [{ title: "Recipes — HIDE.OS" }] }),
  component: RecipesPage,
});

function RecipesPage() {
  const { recipes, addRecipe } = useStore();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [article, setArticle] = useState("");
  const [species, setSpecies] = useState<"cow" | "goat">("cow");
  const [version, setVersion] = useState("1");
  const [stages, setStages] = useState("");
  const [chemicals, setChemicals] = useState("");

  const reset = () => {
    setCode(""); setArticle(""); setSpecies("cow"); setVersion("1"); setStages(""); setChemicals("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !article || !stages || !chemicals) {
      toast.error("All fields are required");
      return;
    }
    addRecipe({
      code,
      article,
      species,
      version: Number(version),
      stages: Number(stages),
      chemicals: Number(chemicals),
      active: true,
    });
    toast.success(`Recipe ${code} created`);
    reset();
    setOpen(false);
  };

  return (
    <PageShell
      title="Recipe Master"
      subtitle="Standard recipes per article · deviations logged as exceptions"
      actions={
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New recipe
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recipes.map((r) => (
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

      {/* New recipe dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New recipe</DialogTitle>
            <DialogDescription className="text-xs">
              Create a standard recipe for an article. Link it to batches during production planning.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Recipe code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="R-COW-CR-v4" maxLength={40} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Version</Label>
              <Input type="number" min={1} value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Article code</Label>
              <Input value={article} onChange={(e) => setArticle(e.target.value)} placeholder="COW-CR-1.2-BLK" maxLength={60} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Species</Label>
              <Select value={species} onValueChange={(v) => setSpecies(v as "cow" | "goat")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cow">Cow</SelectItem>
                  <SelectItem value="goat">Goat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">No. of stages</Label>
              <Input type="number" min={1} value={stages} onChange={(e) => setStages(e.target.value)} placeholder="11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">No. of chemicals</Label>
              <Input type="number" min={1} value={chemicals} onChange={(e) => setChemicals(e.target.value)} placeholder="24" />
            </div>
            <DialogFooter className="col-span-2 mt-2">
              <button type="button" onClick={() => setOpen(false)} className="border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">Create recipe</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
