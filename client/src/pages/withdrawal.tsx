import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import landscapeImg from "@assets/High-Efficiency-Cis-Solar-Panel-Monocrystalline-Solar-Module-_1783948797085.webp";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { getContent } from "@/lib/content";
import { Link, useLocation } from "wouter";
import { getCountryByCode } from "@/lib/countries";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [, navigate] = useLocation();

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "FCFA";

  const { data: withdrawalSettings } = useQuery<{
    withdrawalFees: number;
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

  const minWithdrawal = withdrawalSettings?.minWithdrawal ?? 1500;
  const withdrawalFee = withdrawalSettings?.withdrawalFees ?? 18;
  const withdrawalStartHour = withdrawalSettings?.withdrawalStartHour ?? 9;
  const withdrawalEndHour = withdrawalSettings?.withdrawalEndHour ?? 17;

  const withdrawalCtaButton = getContent(allSettings, "content_withdrawal_ctaButton", "Retirez votre argent maintenant");
  const withdrawalInstructionsTitle = getContent(allSettings, "content_withdrawal_instructionsTitle", "Instructions de retrait");
  const withdrawalInstruction1 = getContent(allSettings, "content_withdrawal_instruction1", `1. Le montant minimum de retrait est de ${minWithdrawal.toLocaleString()} ${currency}.`);
  const withdrawalInstruction2 = getContent(allSettings, "content_withdrawal_instruction2", "2. Il n'y a pas de limite de temps pour les retraits, mais une limite de trois retraits par jour est autorisée.");
  const withdrawalInstruction3 = getContent(allSettings, "content_withdrawal_instruction3", `3. Des frais de traitement de ${withdrawalFee}% seront appliqués sur chaque retrait.`);
  const withdrawalInstruction4 = getContent(allSettings, "content_withdrawal_instruction4", "4. Les retraits seront disponibles sous 2 heures, et exceptionnellement sous 24 heures.");
  const withdrawalInstruction5 = getContent(allSettings, "content_withdrawal_instruction5", "5. Si le retrait échoue, vérifiez que vos informations bancaires sont correctes, puis soumettez à nouveau la demande.");
  const withdrawalInstruction6 = getContent(allSettings, "content_withdrawal_instruction6", "6. Effectuez votre première recharge et achetez des produits SpolarPV pour activer la fonction de retrait.");
  const withdrawalWarningNoHours = getContent(allSettings, "content_withdrawal_warningNoHours", `Horaires de retrait : ${withdrawalStartHour}h00 – ${withdrawalEndHour}h00 (Fermé actuellement)`);
  const withdrawalWarningNoProduct = getContent(allSettings, "content_withdrawal_warningNoProduct", "Vous devez avoir un produit actif pour effectuer un retrait.");

  const amountAfterFees = amount ? Math.floor(Number(amount) * (1 - withdrawalFee / 100)) : 0;
  const currentHour = new Date().getHours();
  const isWithinWithdrawalHours = currentHour >= withdrawalStartHour && currentHour < withdrawalEndHour;

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
    onSuccess: () => {
      toast({ title: "Demande envoyée", description: "Votre demande de retrait a été envoyée." });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!isWithinWithdrawalHours) {
      toast({ title: "Horaires de retrait", description: `Les retraits sont disponibles de ${withdrawalStartHour}h à ${withdrawalEndHour}h`, variant: "destructive" });
      return;
    }
    if (!hasActiveProduct) {
      toast({ title: "Produit requis", description: "Vous devez avoir un produit actif pour effectuer un retrait", variant: "destructive" });
      return;
    }
    if (!amount || amount < minWithdrawal) {
      toast({ title: "Montant invalide", description: `Le montant minimum est de ${minWithdrawal} ${currency}`, variant: "destructive" });
      return;
    }
    if (!selectedWallet) {
      toast({ title: "Compte requis", description: "Veuillez sélectionner un compte bancaire", variant: "destructive" });
      return;
    }
    withdrawMutation.mutate({ amount: Number(amount), walletId: selectedWallet.id });
  };

  if (walletsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#87CEEB" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (!user) return null;

  const balance = parseFloat(user?.balance || "0");
  const hasWallets = wallets.length > 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#87CEEB" }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <Link href="/account">
          <button className="flex items-center gap-1 text-gray-800" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold text-base">Retrait</span>
          </button>
        </Link>
        <div className="w-9 h-9" />
      </header>

      {/* ── Banner with balance ── */}
      <div className="relative w-full" style={{ height: "180px" }}>
        <img
          src="/withdrawal-banner.png"
          alt="Retrait"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.1))" }}
        />
        {/* Balance text */}
        <div className="absolute bottom-4 left-4">
          <p className="text-white font-bold text-2xl" data-testid="text-balance">
            <span className="text-sm font-semibold mr-1">{currency}</span>
            {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-white/80 text-xs mt-0.5">Solde du compte</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-5">

        {/* ── Wallet selector ── */}
        <div>
          <p className="text-gray-900 font-semibold text-sm mb-2">Compte de retrait</p>
          <button
            onClick={() => {
              if (!hasWallets) {
                navigate("/wallet");
              } else {
                navigate("/wallet?from=withdrawal");
              }
            }}
            className="w-full border border-gray-300 rounded-md bg-white px-4 py-4 flex items-center justify-between"
            data-testid="button-select-wallet"
          >
            <span className="text-sm text-gray-500">
              {selectedWallet
                ? `${selectedWallet.accountName} · ${selectedWallet.accountNumber} · ${selectedWallet.paymentMethod}`
                : hasWallets
                  ? "Sélectionner un compte bancaire"
                  : (
                    <span className="flex items-center gap-2 text-[#F59E0B]">
                      <Plus className="w-4 h-4" /> Ajouter un portefeuille de retrait
                    </span>
                  )
              }
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        {/* ── Amount section ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-900 font-semibold text-sm">Montant du retrait</p>
            <p className="text-gray-500 text-sm">Impôt: {withdrawalFee}%</p>
          </div>

          <div className="border border-gray-300 rounded-md flex items-center overflow-hidden bg-white">
            <span className="px-4 py-4 text-gray-800 font-semibold text-sm border-r border-gray-300 bg-white">
              {currency}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Veuillez sélectionner le montant du retrait"
              className="flex-1 px-4 py-4 text-sm text-gray-400 outline-none bg-white placeholder:text-gray-400"
              data-testid="input-withdrawal-amount"
            />
          </div>

          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-gray-600 text-xs">
              Montant reçu:{" "}
              <span className="font-semibold">{currency} {amountAfterFees.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <p className="text-right text-xs mt-1 px-1" style={{ color: "#ff0000" }}>
            (Minimum {minWithdrawal.toLocaleString()} {currency})
          </p>
        </div>

        {/* ── Warnings ── */}
        {!isWithinWithdrawalHours && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium" style={{ color: "#ff0000" }}>
            {withdrawalWarningNoHours}
          </div>
        )}
        {!hasActiveProduct && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium" style={{ color: "#ff0000" }}>
            {withdrawalWarningNoProduct}
          </div>
        )}

        {/* ── CTA Button ── */}
        <button
          onClick={handleSubmit}
          disabled={withdrawMutation.isPending}
          className="w-full py-5 rounded-full text-white font-bold text-base shadow-lg disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
          }}
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            withdrawalCtaButton
          )}
        </button>

        {/* ── Instructions (texte existant conservé) ── */}
        <div className="pt-2 pb-6">
          <p className="font-bold text-[#F59E0B] text-sm mb-3">{withdrawalInstructionsTitle}</p>
          <div className="space-y-2.5 text-sm text-gray-600 leading-relaxed">
            <p>{withdrawalInstruction1}</p>
            <p>{withdrawalInstruction2}</p>
            <p>{withdrawalInstruction3}</p>
            <p>{withdrawalInstruction4}</p>
            <p>{withdrawalInstruction5}</p>
            <p>{withdrawalInstruction6}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
