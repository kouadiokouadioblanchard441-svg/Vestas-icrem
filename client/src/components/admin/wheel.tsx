import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save, Sparkles } from "lucide-react";
import {
  DEFAULT_SPIN_WHEEL_SEGMENTS,
  type SpinWheelSegment,
} from "@shared/spin-wheel";

export default function AdminWheel() {
  const { toast } = useToast();
  const [segments, setSegments] = useState<SpinWheelSegment[]>(DEFAULT_SPIN_WHEEL_SEGMENTS);

  const { data, isLoading } = useQuery<SpinWheelSegment[]>({
    queryKey: ["/api/admin/spin-wheel/config"],
  });

  useEffect(() => {
    if (data) setSegments(data);
  }, [data]);

  const updateSegment = (index: number, patch: Partial<SpinWheelSegment>) => {
    setSegments((current) => current.map((segment, segmentIndex) =>
      segmentIndex === index ? { ...segment, ...patch } : segment
    ));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", "/api/admin/spin-wheel/config", { segments });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/spin-wheel/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/spin-wheel/config"] });
      toast({ title: "Configuration de la roue enregistrée !" });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Impossible d'enregistrer la roue", variant: "destructive" });
    },
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Configuration de la roue
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Les 8 prix restent visibles sur la roue. Une case désactivée reste affichée,
            mais ne peut jamais être tirée comme gain.
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {segments.map((segment, index) => (
          <Card key={segment.id} className={!segment.canWin ? "opacity-75" : ""}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-7 w-7 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="font-semibold">Section {index + 1}</span>
                  <span className="text-xs text-muted-foreground">
                    {segment.canWin ? "Gagnable" : "Non gagnable"}
                  </span>
                </div>
                <Switch
                  checked={segment.canWin}
                  onCheckedChange={(canWin) => updateSegment(index, { canWin })}
                  aria-label={`Section ${index + 1} gagnable`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_140px_110px]">
                <label className="space-y-1">
                  <span className="text-xs font-medium">Nom affiché</span>
                  <Input
                    value={segment.label}
                    onChange={(event) => updateSegment(index, { label: event.target.value })}
                    placeholder="Ex. Petit gain"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium">Montant (USDT)</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={segment.amount}
                    onChange={(event) => updateSegment(index, { amount: Math.max(0, Number(event.target.value)) })}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium">Couleur</span>
                  <Input
                    type="color"
                    className="h-10 cursor-pointer p-1"
                    value={segment.color}
                    onChange={(event) => updateSegment(index, { color: event.target.value })}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!segments.some((segment) => segment.canWin) && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Activez au moins une section gagnable avant d’enregistrer.
        </p>
      )}

      <Button
        className="w-full"
        disabled={saveMutation.isPending || !segments.some((segment) => segment.canWin)}
        onClick={() => saveMutation.mutate()}
      >
        {saveMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Enregistrer la roue
      </Button>
    </div>
  );
}