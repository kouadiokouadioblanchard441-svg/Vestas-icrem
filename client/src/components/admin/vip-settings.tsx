import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save } from "lucide-react";
import { DEFAULT_VIP_CONFIGS } from "@/lib/vip";

export default function AdminVipSettings() {
  const { toast } = useToast();
  const { data: settings = {}, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const val = (key: string, fallback: string) =>
    form[key] !== undefined ? form[key] : (settings[key] ?? fallback);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/settings", form);
      if (!res.ok) throw new Error("Erreur serveur");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setForm({});
      toast({ title: "✅ Paramètres VIP sauvegardés" });
    },
    onError: (e: any) => {
      toast({ title: e.message || "Erreur", variant: "destructive" });
    },
  });

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">⭐ Configuration des niveaux VIP</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personnalisez la description et les avantages affichés sur chaque carte VIP.
          </p>
        </div>
      </div>

      {DEFAULT_VIP_CONFIGS.map((cfg) => (
        <Card key={cfg.level}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              ★ {cfg.label}
              <span className="text-xs font-normal text-muted-foreground">
                {cfg.minTotalTeam
                  ? `— ${cfg.minTotalTeam.toLocaleString()} membres`
                  : cfg.minDirectA
                  ? `— ${cfg.minDirectA} filleuls directs`
                  : cfg.requiresInvestment
                  ? "— Premier investissement"
                  : "— Inscription"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Description du niveau
              </label>
              <textarea
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={cfg.description}
                value={val(`vip${cfg.level}Description`, cfg.description)}
                onChange={(e) => set(`vip${cfg.level}Description`, e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Avantages du niveau
              </label>
              <textarea
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={cfg.advantages}
                value={val(`vip${cfg.level}Advantages`, cfg.advantages)}
                onChange={(e) => set(`vip${cfg.level}Advantages`, e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        className="w-full"
        disabled={saveMutation.isPending || Object.keys(form).length === 0}
        onClick={() => saveMutation.mutate()}
      >
        {saveMutation.isPending
          ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
          : <Save className="w-4 h-4 mr-2" />}
        Enregistrer les niveaux VIP
      </Button>
    </div>
  );
}
