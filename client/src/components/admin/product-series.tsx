/**
 * AdminProductSeries — gérer les séries de produits (créer, renommer, réordonner, désactiver).
 */
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Loader2, Layers } from "lucide-react";
import type { ProductSeries } from "@shared/schema";

const seriesSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  sortOrder: z.string().optional(),
});
type SeriesForm = z.infer<typeof seriesSchema>;

export default function AdminProductSeries() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ProductSeries | null>(null);

  const { data: series = [], isLoading } = useQuery<ProductSeries[]>({
    queryKey: ["/api/admin/product-series"],
  });

  const createForm = useForm<SeriesForm>({
    resolver: zodResolver(seriesSchema),
    defaultValues: { name: "", sortOrder: "0" },
  });

  const editForm = useForm<SeriesForm>({
    resolver: zodResolver(seriesSchema),
    defaultValues: { name: "", sortOrder: "0" },
  });

  const inv = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/product-series"] });
    queryClient.invalidateQueries({ queryKey: ["/api/product-series"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/products/all"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: SeriesForm) => {
      const res = await apiRequest("POST", "/api/admin/product-series", {
        name: data.name,
        sortOrder: parseInt(data.sortOrder || "0") || 0,
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.message || "Erreur"); }
      return res.json();
    },
    onSuccess: () => { inv(); toast({ title: "✅ Série créée" }); setShowCreate(false); createForm.reset({ name: "", sortOrder: "0" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SeriesForm }) => {
      const res = await apiRequest("PATCH", `/api/admin/product-series/${id}`, {
        name: data.name,
        sortOrder: parseInt(data.sortOrder || "0") || 0,
      });
      if (!res.ok) { const r = await res.json(); throw new Error(r.message || "Erreur"); }
      return res.json();
    },
    onSuccess: () => { inv(); toast({ title: "✅ Série mise à jour" }); setEditing(null); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/product-series/${id}`, { isActive });
      if (!res.ok) { const r = await res.json(); throw new Error(r.message || "Erreur"); }
      return res.json();
    },
    onSuccess: () => inv(),
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/product-series/${id}`, {});
      if (!res.ok) { const r = await res.json(); throw new Error(r.message || "Erreur"); }
      return res.json();
    },
    onSuccess: () => { inv(); toast({ title: "Série supprimée" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const openEdit = (s: ProductSeries) => {
    setEditing(s);
    editForm.reset({ name: s.name, sortOrder: String(s.sortOrder) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Séries de produits
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Les séries apparaissent comme onglets sur la page produits. {series.length} série(s).
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowCreate(true); createForm.reset({ name: "", sortOrder: String(series.length + 1) }); }}>
          <Plus className="w-4 h-4 mr-1" />Nouvelle série
        </Button>
      </div>

      {isLoading ? (
        Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)
      ) : series.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
          Aucune série — créez votre première série ci-dessus.
        </div>
      ) : (
        series.map((s) => (
          <Card key={s.id} className="border-l-4" style={{ borderLeftColor: s.isActive ? "hsl(var(--primary))" : "#d1d5db" }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.name}</p>
                  <Badge variant={s.isActive ? "default" : "outline"} className="text-xs">
                    {s.isActive ? "Active" : "Masquée"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Ordre : {s.sortOrder}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Switch
                  checked={s.isActive}
                  onCheckedChange={(checked) => toggleMutation.mutate({ id: s.id, isActive: checked })}
                />
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon" variant="ghost" className="text-destructive"
                  onClick={() => { if (confirm(`Supprimer la série "${s.name}" ? Les produits de cette série seront détachés.`)) deleteMutation.mutate(s.id); }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { if (!o) setShowCreate(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nouvelle série</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <FormField control={createForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la série</FormLabel>
                  <FormControl><Input {...field} placeholder="Ex: Série C" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="sortOrder" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre d'affichage</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <p className="text-xs text-muted-foreground">Nombre faible = affiché en premier</p>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Modifier — {editing?.name}</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((d) => { if (editing) updateMutation.mutate({ id: editing.id, data: d }); })} className="space-y-4">
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la série</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="sortOrder" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre d'affichage</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
