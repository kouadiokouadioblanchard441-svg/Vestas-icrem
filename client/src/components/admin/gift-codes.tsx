import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Gift } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GiftCode {
  id: number;
  code: string;
  amount: string;
  minAmount?: string | null;
  maxAmount?: string | null;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminGiftCodes() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    mode: "fixed" as "fixed" | "random",
    amount: "",
    minAmount: "",
    maxAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const { data: giftCodes = [], isLoading } = useQuery<GiftCode[]>({
    queryKey: ["/api/admin/gift-codes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/admin/gift-codes", {
        code: data.code,
        amount: data.mode === "random" ? 1 : parseInt(data.amount, 10),
        minAmount: data.mode === "random" ? parseInt(data.minAmount, 10) : undefined,
        maxAmount: data.mode === "random" ? parseInt(data.maxAmount, 10) : undefined,
        maxUses: parseInt(data.maxUses),
        expiresAt: data.expiresAt,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-codes"] });
      setIsCreateOpen(false);
       setFormData({ code: "", mode: "fixed", amount: "", minAmount: "", maxAmount: "", maxUses: "", expiresAt: "" });
      toast({ title: "Succes", description: "Code cadeau cree avec succes" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Une erreur est survenue", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/gift-codes/${id}`);
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gift-codes"] });
      toast({ title: "Succes", description: "Code cadeau supprime" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Une erreur est survenue", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountFieldsMissing = formData.mode === "fixed"
      ? !formData.amount
      : !formData.minAmount || !formData.maxAmount;
    if (!formData.code || amountFieldsMissing || !formData.maxUses || !formData.expiresAt) {
      toast({ title: "Tous les champs sont requis", variant: "destructive" });
      return;
    }
    if (formData.mode === "random") {
      const min = Number(formData.minAmount);
      const max = Number(formData.maxAmount);
      if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max < min) {
        toast({ title: "Plage de montants invalide", description: "Utilisez deux montants entiers positifs, avec le minimum inférieur ou égal au maximum.", variant: "destructive" });
        return;
      }
    }
    createMutation.mutate(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt: string) => new Date() > new Date(expiresAt);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold" data-testid="text-section-title">Codes Cadeaux</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-gift-code">
              <Plus className="w-4 h-4 mr-2" />
              Creer un code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau Code Cadeau</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: BONUS2026"
                  data-testid="input-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-mode">Type de récompense</Label>
                <select
                  id="reward-mode"
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as "fixed" | "random" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="select-reward-mode"
                >
                  <option value="fixed">Montant fixe</option>
                  <option value="random">Montant aléatoire dans une plage</option>
                </select>
              </div>
              {formData.mode === "fixed" ? (
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant fixe (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Ex: 500"
                    data-testid="input-amount"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="min-amount">Minimum (FCFA)</Label>
                    <Input
                      id="min-amount"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      placeholder="Ex: 20"
                      data-testid="input-min-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-amount">Maximum (FCFA)</Label>
                    <Input
                      id="max-amount"
                      type="number"
                      min="1"
                      step="1"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                      placeholder="Ex: 50"
                      data-testid="input-max-amount"
                    />
                  </div>
                  <p className="col-span-2 text-xs text-muted-foreground">
                    Chaque utilisateur recevra un montant entier différent ou identique, tiré entre ces deux valeurs incluses.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="maxUses">Nombre d'utilisateurs max</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Ex: 100"
                  data-testid="input-max-uses"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Date et heure d'expiration</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  data-testid="input-expires-at"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Creer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {giftCodes.length === 0 ? (
        <Card data-testid="card-empty-state">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p data-testid="text-empty-message">Aucun code cadeau</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {giftCodes.map((giftCode) => (
            <Card key={giftCode.id} data-testid={`gift-code-item-${giftCode.id}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-mono">{giftCode.code}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => deleteMutation.mutate(giftCode.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${giftCode.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant</span>
                   <span className="font-semibold" data-testid={`text-amount-${giftCode.id}`}>
                     {giftCode.minAmount != null && giftCode.maxAmount != null
                       ? `${parseFloat(giftCode.minAmount).toLocaleString()} à ${parseFloat(giftCode.maxAmount).toLocaleString()} FCFA (aléatoire)`
                       : `${parseFloat(giftCode.amount).toLocaleString()} FCFA`}
                   </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilisations</span>
                  <span className="font-semibold" data-testid={`text-uses-${giftCode.id}`}>{giftCode.currentUses} / {giftCode.maxUses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expire le</span>
                  <span className={`font-semibold ${isExpired(giftCode.expiresAt) ? "text-red-500" : ""}`} data-testid={`text-expires-${giftCode.id}`}>
                    {formatDate(giftCode.expiresAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`font-semibold ${isExpired(giftCode.expiresAt) || !giftCode.isActive ? "text-red-500" : "text-green-500"}`} data-testid={`text-status-${giftCode.id}`}>
                    {isExpired(giftCode.expiresAt) ? "Expire" : giftCode.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
