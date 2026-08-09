import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, CheckCircle2, Loader2, ClipboardList } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

/* ── Stepper (steps 3–4) ─────────────────────────────────────────── */
function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Numéro de\ntéléphone" },
    { n: 2, label: "Informations de\nconfirmation" },
    { n: 3, label: "Paiement terminé" },
  ] as const;
  return (
    <div className="flex items-start mb-6">
      {steps.map((s, i) => (
        <div key={s.n} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            {/* left connector */}
            {i > 0 && (
              <div
                className="flex-1 h-px"
                style={{ background: active >= s.n ? "#3B82F6" : "#D1D5DB" }}
              />
            )}
            {/* circle */}
            <div
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                borderColor: active >= s.n ? "#3B82F6" : "#D1D5DB",
                color: active >= s.n ? "#3B82F6" : "#9CA3AF",
                background: "white",
              }}
            >
              {s.n}
            </div>
            {/* right connector */}
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px"
                style={{ background: active > s.n ? "#3B82F6" : "#D1D5DB" }}
              />
            )}
          </div>
          <p
            className="text-center mt-1 leading-tight whitespace-pre-line"
            style={{
              color: active >= s.n ? "#3B82F6" : "#9CA3AF",
              fontSize: 10,
            }}
          >
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function DepositPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number | "">("");
  const [selectedChannel, setSelectedChannel] = useState<PaymentNumber | null>(null);
  const [senderPhone, setSenderPhone] = useState("");

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const { data: paymentNumbers = [] } = useQuery<PaymentNumber[]>({
    queryKey: ["/api/payment-numbers"],
  });

  const minDeposit = parseInt(platformSettings?.minDeposit || "1000", 10);
  const presetAmounts = useMemo(
    () =>
      (
        platformSettings?.depositPresetAmounts ||
        "1000,3800,15000,30000,100000,150000,200000,300000"
      )
        .split(",")
        .map((v) => parseInt(v.trim(), 10))
        .filter((v) => Number.isFinite(v) && v > 0),
    [platformSettings?.depositPresetAmounts]
  );

  const operators = paymentNumbers.filter(
    (n) =>
      n.isActive &&
      (!user?.country ||
        n.country === user.country ||
        paymentNumbers.filter((x) => x.country === user?.country).length === 0)
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/deposits", {
        amount: Number(amount),
        accountName: senderPhone,
        accountNumber: senderPhone,
        paymentMethod: selectedChannel?.operatorName || "Mobile Money",
        country: user?.country || "CM",
        paymentNumberId: selectedChannel?.id || null,
        channelName: selectedChannel?.operatorName || "Mobile Money",
        reference: `${selectedChannel?.operatorName} — ${senderPhone}`,
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

  if (!user) return null;

  const isOlive = step === "amount";

  /* ── Background ── */
  const pageStyle: React.CSSProperties = isOlive
    ? { background: "#2d3816" }
    : {
        background:
          "linear-gradient(160deg, #7C3AED 0%, #4F46E5 45%, #2563EB 100%)",
      };

  return (
    <div className="flex flex-col min-h-screen" style={pageStyle}>

      {/* ══ HEADER ══ */}
      {isOlive ? (
        /* Olive header with centered title */
        <header className="flex items-center px-4 py-4">
          <Link href="/wallet">
            <button className="p-1" data-testid="button-back-account">
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          </Link>
          <h1 className="flex-1 text-center text-white font-bold text-lg pr-8">
            Recharger
          </h1>
        </header>
      ) : (
        /* Blue/purple header with amount */
        <header className="flex items-start px-4 pt-12 pb-5">
          <button
            className="p-1 mr-2 mt-1"
            onClick={() => {
              if (step === "operator") setStep("amount");
              else if (step === "confirm") setStep("operator");
              else if (step === "done") setStep("amount");
            }}
            data-testid="button-deposit-back"
          >
            <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
          <div>
            <p className="text-white/70 text-sm font-medium">Montant:</p>
            <p className="text-white font-black text-3xl leading-tight">
              {Number(amount).toLocaleString("fr-FR")}{" "}
              <span className="text-xl font-semibold">{CURRENCY}</span>
            </p>
          </div>
        </header>
      )}

      {/* ══ CONTENT ══ */}
      <div className={`flex-1 px-4 ${isOlive ? "pb-44" : "pb-8"}`}>

        {/* ─────────────────────────────────────────
            STEP 1 : Amount + mode de paiement (olive)
        ───────────────────────────────────────── */}
        {step === "amount" && (
          <div className="space-y-5">

            {/* Olive balance card */}
            <div
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background:
                  "linear-gradient(135deg, #5c7e24 0%, #3d5819 55%, #263a0e 100%)",
                boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                minHeight: 110,
              }}
            >
              {/* Decorative concentric circles with F */}
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    border: "1.5px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <span
                    className="font-black text-2xl italic select-none"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    F
                  </span>
                </div>
              </div>

              <p className="text-white/65 text-xs mb-0.5">mon solde</p>
              <p className="text-white font-black text-3xl mb-3">
                F{" "}
                {(user.balance || 0).toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <button className="flex items-center gap-1.5 text-white/55 text-xs hover:text-white/75 transition">
                <ClipboardList className="w-3.5 h-3.5" />
                enregistrer
              </button>
            </div>

            {/* Amount section */}
            <div>
              <p className="text-white font-bold text-[15px] mb-2">
                Montant de la recharge
              </p>

              {/* Text input */}
              <input
                type="number"
                value={amount}
                min={minDeposit}
                onChange={(e) =>
                  setAmount(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="Veuillez saisir le montant de la recharge"
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "white",
                }}
                data-testid="input-deposit-amount"
              />

              {/* Preset grid – 3 columns */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className="rounded-xl py-3.5 text-sm font-semibold text-white transition active:scale-95"
                    style={{
                      background:
                        amount === preset
                          ? "#1A56DB"
                          : "rgba(255,255,255,0.10)",
                    }}
                    data-testid={`button-preset-amount-${preset}`}
                  >
                    {preset.toLocaleString("fr-FR")}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment mode section */}
            {operators.length > 0 && (
              <div>
                <p className="text-white font-bold text-[15px] mb-2">
                  mode de paiement
                </p>
                <div className="flex flex-wrap gap-2">
                  {operators.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setSelectedChannel(op)}
                      className="rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition active:scale-95"
                      style={{
                        background:
                          selectedChannel?.id === op.id
                            ? "#1A56DB"
                            : "rgba(255,255,255,0.10)",
                        minWidth: 80,
                      }}
                      data-testid={`button-channel-${op.id}`}
                    >
                      {op.operatorName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────
            STEP 2 : Operator selection (blue/purple)
        ───────────────────────────────────────── */}
        {step === "operator" && (
          <div className="space-y-3">
            <p className="text-white/80 text-[15px] font-medium mb-4">
              Sélectionnez le mode de paiement :
            </p>

            {operators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/50 text-sm">
                  Aucun opérateur disponible pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {operators.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => {
                      setSelectedChannel(op);
                      setStep("confirm");
                    }}
                    className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm active:opacity-80 transition"
                    data-testid={`button-operator-${op.id}`}
                  >
                    <span className="font-bold text-gray-800 text-base tracking-wide">
                      {op.operatorName.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xl font-light">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────
            STEP 3 : Confirm – phone + method (blue/purple)
        ───────────────────────────────────────── */}
        {step === "confirm" && selectedChannel && (
          <div>
            <div
              className="bg-white rounded-3xl p-5 shadow-xl"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
            >
              <Stepper active={1} />

              {/* Warning banner */}
              <div
                className="rounded-xl px-4 py-3 mb-5 text-sm"
                style={{
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  color: "#92400E",
                }}
              >
                Veuillez sélectionner la même option que votre méthode de
                transfert.
              </div>

              {/* Phone input */}
              <p className="text-gray-700 text-sm mb-2">
                Veuillez entrer votre numéro de téléphone:
              </p>
              <div
                className="flex items-center rounded-xl mb-5 overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <span className="px-3 py-3.5 text-sm font-semibold text-blue-600 bg-gray-50 border-r border-gray-200 shrink-0">
                  +{user.country === "CI" ? "225" : user.country === "CM" ? "237" : user.country === "BF" ? "226" : user.country === "BJ" ? "229" : "225"}
                </span>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="XXXXXXXXXX"
                  className="flex-1 px-3 py-3.5 text-sm outline-none text-gray-800"
                  data-testid="input-sender-phone"
                />
              </div>

              {/* Method selection */}
              <p className="text-gray-700 text-sm mb-3">
                Choisissez la méthode de transfert:
              </p>
              <label className="flex items-center gap-2.5 cursor-pointer mb-6">
                <input
                  type="radio"
                  name="method"
                  checked
                  readOnly
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-gray-800 text-sm font-semibold">
                  {selectedChannel.operatorName}
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("operator")}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition active:opacity-80"
                  style={{
                    border: "1.5px solid #3B82F6",
                    color: "#3B82F6",
                    background: "white",
                  }}
                >
                  ‹ Retourner
                </button>
                <button
                  onClick={() => {
                    if (!senderPhone.trim()) {
                      toast({
                        title: "Numéro requis",
                        description: "Veuillez entrer votre numéro de téléphone",
                        variant: "destructive",
                      });
                      return;
                    }
                    submitMutation.mutate();
                  }}
                  disabled={submitMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition active:opacity-80 flex items-center justify-center gap-1.5"
                  style={{ background: "#3B82F6" }}
                  data-testid="button-deposit-completed"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "L'étape suivante ›"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────
            STEP 4 : Done (blue/purple)
        ───────────────────────────────────────── */}
        {step === "done" && (
          <div>
            <div
              className="bg-white rounded-3xl p-5 shadow-xl"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
            >
              <Stepper active={3} />

              <div className="flex flex-col items-center py-4">
                {/* Success circle */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{
                    border: "3px solid #86EFAC",
                    background: "rgba(134,239,172,0.12)",
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>

                <p className="font-black text-xl text-gray-900 mb-2">
                  Transfert terminé!
                </p>
                <p className="text-gray-500 text-sm text-center mb-7 leading-relaxed">
                  Le paiement a été effectué, veuillez revenir sur votre compte
                  pour confirmer.
                </p>

                <Link href="/wallet">
                  <button
                    className="px-10 py-3 rounded-xl font-semibold text-white text-sm transition active:opacity-80"
                    style={{ background: "#22C55E" }}
                  >
                    Confirm
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ FIXED BOTTOM BUTTON (step 1 only) ══ */}
      {step === "amount" && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
          style={{
            background:
              "linear-gradient(to top, #2d3816 70%, rgba(45,56,22,0))",
          }}
        >
          <button
            onClick={() => {
              if (!amount || Number(amount) < minDeposit) {
                toast({
                  title: "Montant invalide",
                  description: `Montant minimum : ${minDeposit.toLocaleString()} ${CURRENCY}`,
                  variant: "destructive",
                });
                return;
              }
              if (operators.length > 0 && !selectedChannel) {
                toast({
                  title: "Mode de paiement requis",
                  description: "Veuillez sélectionner un mode de paiement",
                  variant: "destructive",
                });
                return;
              }
              // If a channel is already selected skip the operator step
              if (selectedChannel) {
                setStep("confirm");
              } else {
                setStep("operator");
              }
            }}
            className="w-full py-4 rounded-full font-bold text-white text-base transition active:opacity-80"
            style={{
              background: "linear-gradient(90deg, #3B82F6 0%, #1A56DB 100%)",
            }}
            data-testid="button-recharge-now"
          >
            paiement
          </button>

          {/* Instructions */}
          <div className="mt-3 px-2">
            <p className="text-center font-bold text-sm" style={{ color: "#A855F7" }}>
              Instructions de charge
            </p>
            <p className="text-white/50 text-xs text-center mt-1 leading-5">
              Montant minimum de recharge {minDeposit.toLocaleString()} FAFC.
              Veuillez remplir complètement les informations selon les invites
              pour éviter une arrivée retardée ou une charge infructueuse.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
