import { useState, useRef } from "react";
import { getContent } from "@/lib/content";
import landscapeImg from "@assets/High-Efficiency-Cis-Solar-Panel-Monocrystalline-Solar-Module-_1783948797085.webp";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Copy, CheckCircle, Upload, Phone, Loader2, ImageIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { COUNTRIES, type ApiCountry } from "@/lib/countries";
import type { PaymentNumber } from "@shared/schema";

export default function DepositPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"amount" | "select" | "form">("amount");
  const [selectedNumber, setSelectedNumber] = useState<PaymentNumber | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [amount, setAmount] = useState<number | "">("");
  const [senderPhone, setSenderPhone] = useState(user?.phone || "");
  const [screenshot, setScreenshot] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [reference, setReference] = useState("");
  const [westpayLoading, setWestpayLoading] = useState(false);

  const country = user?.country || "";

  const { data: apiCountries = [] } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const countryInfo: ApiCountry | undefined = apiCountries.length > 0
    ? apiCountries.find(c => c.code === country && c.isActive)
    : COUNTRIES.find(c => c.code === country) as ApiCountry | undefined;
  const currency = countryInfo?.currency || "FCFA";

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const MIN_DEPOSIT = parseInt(platformSettings?.minDeposit || "4000");
  const westpayEnabled = platformSettings?.westpayEnabled === "true";
  const presetAmounts = (platformSettings?.depositPresetAmounts || "3500,5000,7000,10000,15000,20000,50000,70000")
    .split(",")
    .map((v) => parseInt(v.trim()))
    .filter((v) => !isNaN(v) && v > 0);

  const depositInfoText = getContent(platformSettings, "content_deposit_infoText", `Les services de dépôt sont disponibles 24h/24 et 7j/7. Le dépôt minimum est de ${MIN_DEPOSIT.toLocaleString()} francs CFA, sans limite maximale.`);
  const depositWarning1 = getContent(platformSettings, "content_deposit_warning1", "Remarque importante : Ne divulguez à personne les captures d'écran de vos dépôts ni vos identifiants de transaction, car cela pourrait entraîner le vol de vos fonds.");
  const depositWarning2 = getContent(platformSettings, "content_deposit_warning2", "Pour tout problème lié à vos dépôts, veuillez contacter immédiatement le service client de la plateforme.");
  const depositInstruction1 = getContent(platformSettings, "content_deposit_instruction1", `1. Le dépôt minimum est de ${MIN_DEPOSIT.toLocaleString()} francs CFA.`);
  const depositInstruction2 = getContent(platformSettings, "content_deposit_instruction2", "2. Veuillez vérifier attentivement les informations de votre compte avant d'effectuer un transfert afin d'éviter toute erreur de paiement.");

  const { data: paymentNumbersList = [], isLoading: numbersLoading } = useQuery<PaymentNumber[]>({
    queryKey: ["/api/payment-numbers", country],
    queryFn: async () => {
      const res = await fetch(`/api/payment-numbers?country=${country}`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    enabled: !!country,
  });

  const copyPhone = async (number: PaymentNumber) => {
    try {
      await navigator.clipboard.writeText(number.phone);
      setCopiedId(number.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({ title: "Numéro copié !", description: `${number.phone} copié dans le presse-papiers` });
    } catch {
      toast({ title: "Numéro: " + number.phone, description: "Copiez ce numéro manuellement" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fichier trop grand", description: "Maximum 5 Mo", variant: "destructive" });
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!selectedNumber) throw new Error("Aucun numéro sélectionné");
      const res = await apiRequest("POST", "/api/deposits", {
        amount: Number(amount),
        accountName: user?.fullName || "",
        accountNumber: senderPhone,
        paymentMethod: selectedNumber.operatorName,
        country,
        paymentNumberId: selectedNumber.id,
        channelName: `${selectedNumber.operatorName} - ${selectedNumber.phone}`,
        screenshot: screenshot || null,
        paymentMessage: paymentMessage || null,
        reference: reference || null,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Demande envoyée !", description: "Votre dépôt est en attente de validation par l'administrateur" });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
      refreshUser();
      setStep("amount");
      setSelectedNumber(null);
      setAmount("");
      setSenderPhone(user?.phone || "");
      setScreenshot("");
      setScreenshotName("");
      setPaymentMessage("");
      setReference("");
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const handleWestpay = async () => {
    if (!amount || Number(amount) < MIN_DEPOSIT) {
      toast({
        title: "Montant invalide",
        description: `Le minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`,
        variant: "destructive",
      });
      return;
    }
    setWestpayLoading(true);
    try {
      const res = await fetch("/api/deposits/westpay/initiate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur WestPay");
      // Redirect user to WestPay hosted payment page
      window.location.href = data.westpayUrl;
    } catch (e: any) {
      toast({ title: "Erreur WestPay", description: e.message, variant: "destructive" });
      setWestpayLoading(false);
    }
  };

  // Paiement automatique WestPay = activé globalement ET pour le pays de l'utilisateur (géré dans Admin > Pays)
  const isWestpayEligible = westpayEnabled && !!countryInfo?.autoPaymentEnabled;

  const handleAmountNext = () => {
    if (!amount || Number(amount) < MIN_DEPOSIT) {
      toast({
        title: "Montant invalide",
        description: `Le minimum est de ${MIN_DEPOSIT.toLocaleString()} ${currency}`,
        variant: "destructive",
      });
      return;
    }
    // Pays en paiement automatique (WestPay activé pour ce pays) → redirection directe sans passer par le step "select"
    if (isWestpayEligible) {
      handleWestpay();
      return;
    }
    setStep("select");
  };

  const handleSubmit = () => {
    if (!senderPhone.trim()) {
      toast({ title: "Numéro requis", description: "Entrez le numéro depuis lequel vous avez payé", variant: "destructive" });
      return;
    }
    if (!screenshot) {
      toast({ title: "Capture requise", description: "Veuillez joindre la capture d'écran du paiement", variant: "destructive" });
      return;
    }
    depositMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#87CEEB" }}>

      {/* ── STEP 1 : Saisir le montant ── */}
      {step === "amount" && (
        <>
          {/* Header — même style que la page d'ajout de carte */}
          <div className="flex items-center justify-between px-4 pt-10 pb-4">
            <Link href="/account">
              <button className="w-9 h-9 flex items-center justify-center text-gray-700" data-testid="button-back">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </Link>
            <h1 className="flex-1 text-center text-gray-800 font-bold text-base">Recharger</h1>
            <div className="w-9 h-9" />
          </div>

          <div className="px-4 pt-2 pb-6 space-y-4">
            {/* Label */}
            <div>
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">
                Montant de la recharge{" "}
                <span className="font-normal">
                  (Minimum {MIN_DEPOSIT.toLocaleString()} {currency})
                </span>
              </p>

              {/* Input — carte blanche translucide comme sur la page d'ajout de carte */}
              <div
                className="rounded-2xl shadow-sm flex items-center overflow-hidden"
                style={{ background: "rgba(255,255,255,0.90)" }}
              >
                <span className="px-4 py-4 text-gray-800 font-semibold text-sm border-r border-black/10">
                  {currency}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Veuillez saisir le montant de la recharge"
                  className="flex-1 px-4 py-4 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                  data-testid="input-deposit-amount"
                />
              </div>

              {/* Montants rapides */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors ${
                      amount === preset
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                    style={{
                      background:
                        amount === preset
                          ? "linear-gradient(135deg, #F59E0B, #D97706)"
                          : "rgba(255,255,255,0.90)",
                    }}
                    data-testid={`button-preset-amount-${preset}`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleAmountNext}
              disabled={westpayLoading}
              className="w-full py-4 rounded-full text-white font-bold text-base shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
              data-testid="button-recharge-now"
            >
              {westpayLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirection vers WestPay…</>
                : "Rechargez maintenant"}
            </button>

            {/* Info blocks */}
            <div
              className="rounded-2xl shadow-sm p-4 space-y-4 mt-2"
              style={{ background: "rgba(255,255,255,0.90)" }}
            >
              <p className="text-gray-700 text-sm leading-relaxed">
                {depositInfoText}
              </p>

              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p>{depositWarning1}</p>
                <p>{depositWarning2}</p>
                <p>{depositInstruction1}</p>
                <p>{depositInstruction2}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── STEP 2 : Choisir un numéro ── */}
      {step === "select" && (
        <>
          <div className="flex items-center justify-between px-4 pt-10 pb-4">
            <button
              className="w-9 h-9 flex items-center justify-center text-gray-700"
              onClick={() => setStep("amount")}
              data-testid="button-back-to-amount"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center text-gray-800 font-bold text-base">Choisir un opérateur</h1>
            <Link href="/deposit-history">
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-700"
                style={{ background: "rgba(255,255,255,0.5)" }}
                data-testid="button-history"
              >
                Hist.
              </button>
            </Link>
          </div>

          {/* Amount recap */}
          <div
            className="mx-4 rounded-2xl shadow-sm p-4 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.90)" }}
          >
            <div>
              <p className="text-xs text-gray-500">Montant à déposer</p>
              <p className="text-xl font-bold text-[#F59E0B]">
                {Number(amount).toLocaleString()} {currency}
              </p>
            </div>
            <button
              onClick={() => setStep("amount")}
              className="text-xs text-[#F59E0B] underline"
              data-testid="button-change-amount"
            >
              Modifier
            </button>
          </div>

          <div className="p-4 space-y-3 pb-10">

            <p className="text-sm font-semibold text-gray-800 mb-2">
              Sélectionnez un numéro de paiement
            </p>

            {numbersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
              </div>
            ) : paymentNumbersList.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun numéro disponible pour votre pays</p>
                <p className="text-xs mt-1">Contactez le support</p>
              </div>
            ) : (
              paymentNumbersList.map((num) => (
                <div
                  key={num.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  data-testid={`card-payment-number-${num.id}`}
                >
                  <div className="p-4 flex items-center gap-3">
                    {num.logoUrl ? (
                      <img src={num.logoUrl} alt={num.operatorName} className="w-12 h-12 rounded-xl object-contain border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-[#F59E0B]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{num.operatorName}</p>
                      <p className="text-[#F59E0B] font-mono font-bold text-lg">{num.phone}</p>
                      <p className="text-gray-500 text-xs">{num.ownerName}</p>
                    </div>
                    <button
                      onClick={() => copyPhone(num)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      data-testid={`button-copy-${num.id}`}
                    >
                      {copiedId === num.id
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <Copy className="w-5 h-5 text-[#F59E0B]" />}
                    </button>
                  </div>
                  <button
                    onClick={() => { setSelectedNumber(num); setStep("form"); }}
                    className="w-full py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
                    data-testid={`button-select-${num.id}`}
                  >
                    J'ai envoyé l'argent sur ce numéro <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── STEP 3 : Formulaire de confirmation ── */}
      {step === "form" && selectedNumber && (
        <>
          <div className="flex items-center px-4 pt-10 pb-4">
            <button
              className="w-9 h-9 flex items-center justify-center text-gray-700"
              onClick={() => setStep("select")}
              data-testid="button-back-to-select"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center text-gray-800 font-bold text-base mr-9">Confirmer le paiement</h1>
          </div>

          <div className="p-4 space-y-4 pb-10">
            {/* Recap */}
            <div
              className="rounded-2xl shadow-sm p-4 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.90)" }}
            >
              {selectedNumber.logoUrl ? (
                <img src={selectedNumber.logoUrl} alt={selectedNumber.operatorName} className="w-10 h-10 rounded-lg object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#F59E0B]" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs text-gray-500">Numéro destinataire</p>
                <p className="font-bold text-[#F59E0B] text-sm">{selectedNumber.operatorName} — {selectedNumber.phone}</p>
                <p className="text-xs text-gray-500">{selectedNumber.ownerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Montant</p>
                <p className="font-bold text-gray-800">{Number(amount).toLocaleString()} {currency}</p>
              </div>
            </div>

            {/* Sender phone */}
            <div>
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">Votre numéro payeur</p>
              <div
                className="rounded-2xl shadow-sm flex items-center overflow-hidden"
                style={{ background: "rgba(255,255,255,0.90)" }}
              >
                <Phone className="w-4 h-4 text-gray-400 ml-4" />
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="Numéro depuis lequel vous avez payé"
                  className="flex-1 px-3 py-4 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                  data-testid="input-sender-phone"
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">
                Référence / ID transaction{" "}
                <span className="font-normal normal-case text-gray-400">(optionnel)</span>
              </p>
              <div
                className="rounded-2xl shadow-sm"
                style={{ background: "rgba(255,255,255,0.90)" }}
              >
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Numéro de référence de la transaction"
                  className="w-full px-4 py-4 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
                  data-testid="input-reference"
                />
              </div>
            </div>

            {/* Payment message */}
            <div>
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">
                Message reçu après paiement{" "}
                <span className="font-normal normal-case text-gray-400">(optionnel)</span>
              </p>
              <textarea
                value={paymentMessage}
                onChange={(e) => setPaymentMessage(e.target.value)}
                placeholder="Collez ici le SMS ou message de confirmation reçu..."
                rows={3}
                className="w-full rounded-2xl shadow-sm px-4 py-3 text-sm text-gray-700 outline-none resize-none placeholder:text-gray-400"
                style={{ background: "rgba(255,255,255,0.90)" }}
                data-testid="input-payment-message"
              />
            </div>

            {/* Screenshot upload */}
            <div>
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1.5 ml-1">
                Capture d'écran du paiement <span className="text-red-500">*</span>
              </p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" data-testid="input-screenshot" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl shadow-sm py-7 flex flex-col items-center gap-2 transition-colors"
                style={{ background: screenshot ? "rgba(220,252,231,0.95)" : "rgba(255,255,255,0.90)" }}
                data-testid="button-upload-screenshot"
              >
                {screenshot ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <p className="text-sm font-medium text-green-600">{screenshotName}</p>
                    <p className="text-xs text-gray-400">Appuyez pour changer</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Appuyez pour ajouter la capture</p>
                    <p className="text-xs text-gray-400">JPG, PNG — max 5 Mo</p>
                  </>
                )}
              </button>
              {screenshot && (
                <div className="mt-3 rounded-xl overflow-hidden shadow-sm">
                  <img src={screenshot} alt="Capture" className="w-full max-h-52 object-contain bg-white/90" />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={depositMutation.isPending}
              className="w-full py-4 rounded-full text-white font-bold text-base shadow-md disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
              data-testid="button-submit-deposit"
            >
              {depositMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" /> Soumettre ma demande
                </span>
              )}
            </button>
          </div>
        </>
      )}

      {/* Paysage en bas — même que la page d'ajout de carte */}
      <div className="mt-auto">
        <img
          src={landscapeImg}
          alt="SpolarPV"
          className="w-full object-cover object-top"
          style={{ maxHeight: 300 }}
        />
      </div>
    </div>
  );
}
