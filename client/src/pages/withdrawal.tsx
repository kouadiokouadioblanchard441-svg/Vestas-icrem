import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, CreditCard, ClipboardList, Loader2 } from "lucide-react";
import { getContent } from "@/lib/content";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";

interface WalletData {
  id: number;
  userId: number;
  accountName: string;
  accountNumber: string;
  paymentMethod: string;
  country: string;
  isDefault: boolean;
}

interface UserProduct {
  id: number;
  status: string;
}

export default function WithdrawalPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [, navigate] = useLocation();

  const currency = "FCFA";

  const { data: withdrawalSettings } = useQuery<{
    withdrawalFees: number;
    withdrawalEnabled: boolean;
    withdrawalStartHour: number;
    withdrawalEndHour: number;
    maxWithdrawalsPerDay: number;
    minWithdrawal: number;
  }>({
    queryKey: ["/api/settings/withdrawal"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: allSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const minWithdrawal = withdrawalSettings?.minWithdrawal ?? 2000;
  const withdrawalEnabled = withdrawalSettings?.withdrawalEnabled ?? true;
  const withdrawalFee = withdrawalSettings?.withdrawalFees ?? 18;
  const withdrawalStartHour = withdrawalSettings?.withdrawalStartHour ?? 0;
  const withdrawalEndHour = withdrawalSettings?.withdrawalEndHour ?? 24;

  const withdrawalWarningNoProduct = getContent(allSettings, "content_withdrawal_warningNoProduct", "Vous devez posséder un produit actif pour effectuer un retrait.");

  const amountAfterFees = amount ? Math.floor(Number(amount) * (1 - withdrawalFee / 100)) : 0;

  const { data: wallets = [], isLoading: walletsLoading } = useQuery<WalletData[]>({
    queryKey: ["/api/wallets"],
    refetchOnWindowFocus: true,
  });

  const { data: userProducts = [] } = useQuery<UserProduct[]>({
    queryKey: ["/api/user/products"],
  });

  const hasActiveProduct = userProducts.some((p) => p.status === "active");

  useEffect(() => {
    const savedWalletId = localStorage.getItem("selectedWalletId");
    if (savedWalletId && wallets.length > 0) {
      const wallet = wallets.find(w => w.id === parseInt(savedWalletId));
      if (wallet) setSelectedWallet(wallet);
      localStorage.removeItem("selectedWalletId");
    }
  }, [wallets]);

  useEffect(() => {
    if (!selectedWallet && wallets.length > 0) {
      const defaultWallet = wallets.find(w => w.isDefault);
      if (defaultWallet) setSelectedWallet(defaultWallet);
    }
  }, [wallets, selectedWallet]);

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; walletId: number }) => {
      const res = await apiRequest("POST", "/api/withdrawals", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data?.payoutRequiresVerification ? t.withdrawalCreated : t.withdrawalSubmitted,
        description: data?.payoutRequiresVerification
          ? t.withdrawalCreatedDesc
          : t.withdrawalSubmittedDesc,
      });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({ title: error.message || t.errorOccurred, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!withdrawalEnabled) {
      toast({ title: t.errorOccurred, variant: "destructive" });
      return;
    }
    if (!hasActiveProduct) {
      toast({ title: t.errorOccurred, variant: "destructive" });
      return;
    }
    if (!amount || amount < minWithdrawal) {
      toast({ title: t.invalidAmount, description: `${t.minAmountPrefix} ${minWithdrawal.toLocaleString()} ${currency}`, variant: "destructive" });
      return;
    }
    if (!selectedWallet) {
      toast({ title: "Sélectionnez un compte", description: "Veuillez lier un compte de retrait.", variant: "destructive" });
      return;
    }
    withdrawMutation.mutate({ amount: Number(amount), walletId: selectedWallet.id });
  };

  if (walletsLoading) return null;
  if (!user) return null;

  const balance = parseFloat(user?.balance || "0");

  const instructions = [
    `1. Le montant minimum de retrait est de ${minWithdrawal.toLocaleString()} ${currency}.`,
    `2. Les frais de retrait s'élèvent à ${withdrawalFee}\u00a0% du montant retiré.`,
    `3. Il n'y a pas de restriction horaire pour les retraits\u00a0; vous pouvez effectuer jusqu'à ${withdrawalSettings?.maxWithdrawalsPerDay ?? 1} retrait${(withdrawalSettings?.maxWithdrawalsPerDay ?? 1) > 1 ? "s" : ""} par jour.`,
    "4. Les retraits sont généralement crédités dans un délai de 4 heures, et au plus tard dans les 24 heures.",
    "5. Vous devez disposer d'au moins un appareil pour activer la fonction de retrait.",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 py-4"
        style={{ background: "#2d3816" }}
      >
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        </Link>
        <h1 className="text-white font-bold text-lg">Retrait</h1>
        <Link href="/withdrawal-history">
          <button className="p-1">
            <ClipboardList className="w-6 h-6 text-white" />
          </button>
        </Link>
      </header>

      {/* ── Balance card ── */}
      <div className="mx-4 mt-4 rounded-2xl p-5" style={{ background: "#2d3816" }}>
        <p className="text-white/70 text-sm mb-1">Mon solde</p>
        <p className="text-white font-black text-4xl tracking-tight" data-testid="text-balance">
          {currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* ── White content area ── */}
      <div className="flex-1 px-4 pt-5 pb-10 space-y-5">

        {/* Wallet selector section */}
        <div>
          <p className="text-gray-800 font-semibold text-sm mb-2">
            Veuillez selectionner votre carte bancaire
          </p>
          <button
            onClick={() => navigate(wallets.length > 0 ? "/wallet?from=withdrawal" : "/wallet?from=withdrawal")}
            className="w-full flex items-center gap-3 px-4 bg-white"
            style={{
              height: 54,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
            }}
            data-testid="button-select-wallet"
          >
            <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="flex-1 text-sm text-left truncate" style={{ color: selectedWallet ? "#111" : "#9ca3af" }}>
              {selectedWallet
                ? `${selectedWallet.paymentMethod} - ${selectedWallet.accountNumber}`
                : "-------  -  ---------------"}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>

        {/* Amount section */}
        <div>
          <p className="text-gray-800 font-semibold text-sm mb-2">
            Entrez le montant du retrait
          </p>
          <div
            className="w-full flex items-center bg-white overflow-hidden"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, height: 54 }}
          >
            <span className="px-4 text-gray-400 font-semibold text-sm border-r border-gray-200 h-full flex items-center shrink-0">
              {currency}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez saisir le montant du retrait"
              className="flex-1 px-3 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
              data-testid="input-withdrawal-amount"
            />
          </div>

          {/* Fee info row */}
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-gray-500 text-xs">
              Montant recu : {currency} {amountAfterFees.toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs">
              Taux de frais : {withdrawalFee}%
            </p>
          </div>
        </div>

        {/* Warnings */}
        {!withdrawalEnabled && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            Les retraits sont actuellement désactivés.
          </div>
        )}
        {!hasActiveProduct && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {withdrawalWarningNoProduct}
          </div>
        )}

        {/* CTA Button — olive pill */}
        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending || !withdrawalEnabled}
          className="font-bold text-lg text-white disabled:opacity-50 active:scale-95 transition-transform"
          style={{
            display: "block",
            width: "72%",
            margin: "0 auto",
            height: 56,
            borderRadius: 999,
            background: "#2d3816",
            boxShadow: "0 4px 16px rgba(45,56,22,0.35)",
          }}
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement…
            </span>
          ) : "Confirmer"}
        </button>

        {/* Instructions */}
        <div className="pt-1 pb-4 space-y-2">
          {instructions.map((line, i) => (
            <p key={i} className="text-gray-600 text-xs leading-relaxed">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
