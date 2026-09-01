import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Lock, Unlock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import type { User } from "@shared/schema";

type Debtor = User & {
  debtAmount: number;
};

export default function AdminDebtors() {
  const { toast } = useToast();
  const { data: debtors, isLoading } = useQuery<Debtor[]>({
    queryKey: ["/api/admin/debtors"],
    queryFn: async () => {
      const response = await fetch("/api/admin/debtors", { credentials: "include" });
      if (!response.ok) throw new Error("Impossible de charger les débiteurs");
      return response.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/toggle-withdrawal`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Impossible de modifier le retrait");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/debtors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Statut du retrait mis à jour" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const totalDebt = (debtors || []).reduce((sum, debtor) => sum + debtor.debtAmount, 0);

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300">Comptes débiteurs</p>
              <p className="text-sm text-red-700/80 dark:text-red-300/80">
                Ces comptes ont une balance négative. Leur retrait est bloqué jusqu'à décision de l'administration.
              </p>
              <p className="mt-1 text-sm font-bold text-red-700 dark:text-red-300">
                {debtors?.length || 0} compte{(debtors?.length || 0) > 1 ? "s" : ""} — dette totale :{" "}
                {formatCurrency(totalDebt, "CI")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">Chargement...</CardContent>
        </Card>
      ) : debtors && debtors.length > 0 ? (
        <div className="space-y-3">
          {debtors.map((debtor) => (
            <Card key={debtor.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{debtor.fullName}</p>
                      <Badge variant={debtor.isWithdrawalBlocked ? "destructive" : "secondary"}>
                        {debtor.isWithdrawalBlocked ? "Retrait bloqué" : "Débloqué par admin"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {debtor.phone} — {debtor.country}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Code : {debtor.referralCode}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={debtor.isWithdrawalBlocked ? "default" : "outline"}
                    onClick={() => toggleMutation.mutate(debtor.id)}
                    disabled={toggleMutation.isPending}
                  >
                    {toggleMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : debtor.isWithdrawalBlocked ? (
                      <Unlock className="mr-2 h-4 w-4" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    {debtor.isWithdrawalBlocked ? "Débloquer le retrait" : "Bloquer le retrait"}
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Dette</p>
                    <p className="font-bold text-red-600">
                      -{formatCurrency(debtor.debtAmount, debtor.country)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenus retirables</p>
                    <p className="font-medium">
                      {formatCurrency(parseFloat(debtor.totalEarnings || "0"), debtor.country)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Aucun compte débiteur.
          </CardContent>
        </Card>
      )}
    </div>
  );
}