import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useI18n } from "@/lib/i18n";

const CURRENCY = "FCFA";

type Step = "amount" | "operator" | "confirm" | "done";

interface PaymentNumber {
  id: number;
  ownerName: string;
  phone: string;
  operatorName: string;
  country: string;
  logoUrl?: string;
  isActive: boolean;
}

export default function DepositPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep]           = useState<Step>("amount");
  const [amount, setAmount]       = useState<number | "">("");
  const [selected, setSelected]   = useState<PaymentNumber | null>(null);
  const [senderName, setSenderName]   = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const { data: paymentNumbers = [] } = useQuery<PaymentNumber[]>({
    queryKey: ["/api/payment-numbers"],
  });

  const minDeposit = parseInt(platformSettings?.minDeposit || "3500", 10);
  const presetAmounts = useMemo(
    () => (platformSettings?.depositPresetAmounts || "3500,5000,7000,10000,15000,20000,50000,70000")
      .split(",")
      .map((v) => parseInt(v.trim(), 10))
      .filter((v) => Number.isFinite(v) && v > 0),
    [platformSettings?.depositPresetAmounts],
  );

  // Filter by user country or show all if none match
  const operators = paymentNumbers.filter(
    (n) => n.isActive && (!user?.country || n.country === user.country || paymentNumbers.filter(x => x.country === user?.country).length === 0)
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/deposits", {
        amount: Number(amount),
        accountName: senderName,
        accountNumber: senderPhone,
        paymentMethod: selected?.operatorName || "Mobile Money",
        country: user?.country || "CM",
        paymentNumberId: selected?.id || null,
        channelName: selected?.operatorName || "Mobile Money",
        reference: `${senderName} — ${senderPhone}`,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      setStep("done");
    },
    onError: (e: Error) => {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    },
  });

  const goToOperator = () => {
    if (!amount || Number(amount) < minDeposit) {
      toast({
        title: t.invalidAmount,
        description: `Montant minimum : ${minDeposit.toLocaleString()} ${CURRENCY}`,
        variant: "destructive",
      });
      return;
    }
    setStep("operator");
  };

  const goToConfirm = (op: PaymentNumber) => {
    setSelected(op);
    setStep("confirm");
  };

  const goBack = () => {
    if (step === "operator") setStep("amount");
    else if (step === "confirm") setStep("operator");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#2d3816" }}>

      {/* ── Header ── */}
      <header className="flex items-center px-4 py-4" style={{ background: "#1e2e0a" }}>
        {step === "amount" || step === "done" ? (
          <Link href="/wallet">
            <button className="p-1" data-testid="button-back-account">
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          </Link>
        ) : (
          <button className="p-1" onClick={goBack} data-testid="button-deposit-back">
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        )}
        <h1 className="flex-1 text-center text-white font-bold text-lg pr-8">
          {step === "operator" ? "Choisir l'opérateur" : step === "confirm" ? "Confirmer le dépôt" : "Recharger"}
        </h1>
      </header>

      <div className="flex-1 px-4 pt-5 pb-20">

        {/* ══ ÉTAPE 1 : Montant ══ */}
        {step === "amount" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: "#4a5e22" }}>
              <p className="text-white/80 text-sm font-semibold mb-1">Montant à déposer</p>
              <p className="text-white/60 text-xs mb-4">Minimum : {minDeposit.toLocaleString()} {CURRENCY}</p>

              {/* Input */}
              <div
                className="flex items-center overflow-hidden bg-white"
                style={{ borderRadius: 999, height: 52 }}
              >
                <span className="px-4 font-bold text-sm text-gray-700 border-r border-gray-200 h-full flex items-center shrink-0">
                  {CURRENCY}
                </span>
                <input
                  type="number"
                  value={amount}
                  min={minDeposit}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder={`Min. ${minDeposit.toLocaleString()}`}
                  className="flex-1 bg-transparent px-4 outline-none text-gray-800 text-sm placeholder:text-gray-400"
                  data-testid="input-deposit-amount"
                />
              </div>

              {/* Presets */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className="rounded-xl py-2.5 text-xs font-bold transition active:scale-95"
                    style={{
                      background: amount === preset ? "white" : "rgba(255,255,255,0.15)",
                      color: amount === preset ? "#2d3816" : "white",
                    }}
                    data-testid={`button-preset-amount-${preset}`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={goToOperator}
                className="mt-5 w-full flex items-center justify-center gap-2 font-bold text-sm rounded-full py-3.5 active:scale-95 transition"
                style={{ background: "white", color: "#2d3816" }}
                data-testid="button-recharge-now"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "#4a5e22" }}>
              <p className="text-white/70 text-xs leading-6">
                ℹ️ Envoyez exactement le montant indiqué via Mobile Money à l'opérateur sélectionné. Votre solde sera crédité après validation par notre équipe.
              </p>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 2 : Opérateur ══ */}
        {step === "operator" && (
          <div className="space-y-3">
            <div className="rounded-2xl px-4 py-3 mb-2" style={{ background: "#4a5e22" }}>
              <p className="text-white/80 text-xs">Montant sélectionné</p>
              <p className="text-white font-black text-2xl">{Number(amount).toLocaleString()} <span className="text-base font-semibold">{CURRENCY}</span></p>
            </div>

            <p className="text-white/70 text-sm font-semibold px-1">Sélectionnez l'opérateur</p>

            {operators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/50 text-sm">Aucun opérateur disponible pour le moment</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: "#4a5e22" }}>
                {operators.map((op, idx) => (
                  <button
                    key={op.id}
                    onClick={() => goToConfirm(op)}
                    className="w-full flex items-center gap-4 px-4 py-4 active:bg-white/10 transition"
                    style={{ borderBottom: idx < operators.length - 1 ? "1px solid rgba(255,255,255,0.1)" : undefined }}
                    data-testid={`button-operator-${op.id}`}
                  >
                    {op.logoUrl ? (
                      <img src={op.logoUrl} alt={op.operatorName} className="w-10 h-10 rounded-full object-contain bg-white p-1" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="text-white font-black text-sm">{op.operatorName.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-white font-bold text-sm">{op.operatorName}</p>
                      <p className="text-white/60 text-xs">{op.phone}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/50" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ÉTAPE 3 : Confirmation ══ */}
        {step === "confirm" && selected && (
          <div className="space-y-4">
            {/* Récapitulatif */}
            <div className="rounded-2xl p-4" style={{ background: "#4a5e22" }}>
              <p className="text-white/70 text-xs mb-2">Envoyez exactement ce montant à :</p>
              <div className="flex items-center gap-3 mb-3">
                {selected.logoUrl ? (
                  <img src={selected.logoUrl} alt={selected.operatorName} className="w-12 h-12 rounded-full object-contain bg-white p-1.5" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-white font-black">{selected.operatorName.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="text-white font-bold">{selected.operatorName}</p>
                  <p className="text-white/80 text-lg font-black">{selected.phone}</p>
                  <p className="text-white/60 text-xs">{selected.ownerName}</p>
                </div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                <p className="text-white/70 text-xs">Montant à envoyer</p>
                <p className="text-white font-black text-3xl">{Number(amount).toLocaleString()}</p>
                <p className="text-white/70 text-sm">{CURRENCY}</p>
              </div>
            </div>

            {/* Formulaire confirmation */}
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "#4a5e22" }}>
              <p className="text-white font-semibold text-sm">Vos informations d'envoi</p>

              <div>
                <p className="text-white/70 text-xs mb-1">Votre nom</p>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Nom complet"
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 outline-none"
                  style={{ background: "white" }}
                />
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Votre numéro d'envoi</p>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="Ex: 6XXXXXXXX"
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-900 outline-none"
                  style={{ background: "white" }}
                />
              </div>

              <button
                onClick={() => {
                  if (!senderName.trim() || !senderPhone.trim()) {
                    toast({ title: "Champs requis", description: "Veuillez remplir tous les champs", variant: "destructive" });
                    return;
                  }
                  submitMutation.mutate();
                }}
                disabled={submitMutation.isPending}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm rounded-full py-3.5 active:scale-95 transition disabled:opacity-60"
                style={{ background: "white", color: "#2d3816" }}
                data-testid="button-deposit-completed"
              >
                {submitMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : "J'ai effectué le paiement"
                }
              </button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 4 : Succès ══ */}
        {step === "done" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <CheckCircle2 className="w-20 h-20 text-green-400" />
            <p className="text-white font-black text-xl text-center">Dépôt soumis !</p>
            <p className="text-white/70 text-sm text-center px-6">
              Votre dépôt de <span className="font-bold text-white">{Number(amount).toLocaleString()} {CURRENCY}</span> est en cours de vérification. Votre solde sera crédité après validation.
            </p>
            <Link href="/wallet">
              <button
                className="mt-4 px-8 py-3 rounded-full font-bold text-sm active:scale-95 transition"
                style={{ background: "white", color: "#2d3816" }}
              >
                Retour au portefeuille
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
