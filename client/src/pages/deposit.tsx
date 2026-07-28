import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronLeft, Copy, Loader2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getContent } from "@/lib/content";
import type { ApiCountry } from "@/lib/countries";
import { COUNTRIES } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";

import tetherLogo from "@/assets/crypto/tether.png";
import usdcLogo from "@/assets/crypto/usd-coin.png";
import tronLogo from "@/assets/crypto/tron.png";
import bnbLogo from "@/assets/crypto/bnb.png";
import polygonLogo from "@/assets/crypto/polygon.png";
import ethereumLogo from "@/assets/crypto/ethereum.png";
import pyusdLogo from "@/assets/crypto/paypal-usd.png";

type Step = "amount" | "currency" | "address";

type CryptoOption = {
  code: string;
  label: string;
  network: string;
  logo: string;
};

type CryptoPayment = {
  depositId: number;
  paymentId: string;
  payAddress: string;
  payAmount: string | number;
  payCurrency: string;
  qrCode: string;
};

const CRYPTO_OPTIONS: CryptoOption[] = [
  { code: "usdtbsc",   label: "BEP20 — USDT",    network: "BNB Smart Chain", logo: tetherLogo   },
  { code: "usdtmatic", label: "POLYGON — USDT",   network: "Polygon",         logo: tetherLogo   },
  { code: "usdttrc20", label: "TRC20 — USDT",     network: "TRON",            logo: tetherLogo   },
  { code: "usdterc20", label: "ETH — USDT",       network: "Ethereum",        logo: tetherLogo   },
  { code: "usdcbsc",   label: "BEP20 — USDC",     network: "BNB Smart Chain", logo: usdcLogo     },
  { code: "usdcsol",   label: "SOLANA — USDC",    network: "Solana",          logo: usdcLogo     },
  { code: "trx",       label: "TRX",              network: "TRON",            logo: tronLogo     },
  { code: "bnbbsc",    label: "BNB",              network: "BNB Smart Chain", logo: bnbLogo      },
  { code: "usdcerc20", label: "ETH — USDC",       network: "Ethereum",        logo: usdcLogo     },
  { code: "eth",       label: "ETH",              network: "Ethereum",        logo: ethereumLogo },
  { code: "matic",     label: "POLYGON",          network: "Polygon",         logo: polygonLogo  },
  { code: "pyusd",     label: "ETH — PYUSD",      network: "Ethereum",        logo: pyusdLogo    },
];

function shortenAddress(address: string) {
  if (address.length <= 28) return address;
  return `${address.slice(0, 14)}…${address.slice(-10)}`;
}

export default function DepositPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number | "">("");
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoOption | null>(null);
  const [payment, setPayment] = useState<CryptoPayment | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: platformSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  const { data: apiCountries = [] } = useQuery<ApiCountry[]>({
    queryKey: ["/api/countries"],
  });

  const countryInfo = apiCountries.length > 0
    ? apiCountries.find((country) => country.code === user?.country && country.isActive)
    : COUNTRIES.find((country) => country.code === user?.country);
  const currency = countryInfo?.currency || "USDT";
  const minDeposit = parseInt(platformSettings?.minDeposit || "3500", 10);
  const presetAmounts = useMemo(
    () => (platformSettings?.depositPresetAmounts || "3500,5000,7000,10000,15000,20000,50000,70000")
      .split(",")
      .map((value) => parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value) && value > 0),
    [platformSettings?.depositPresetAmounts],
  );
  const helpText = getContent(
    platformSettings,
    "content_deposit_cryptoHelp",
    t.depositDefaultHelp,
  );

  const createPayment = useMutation({
    mutationFn: async (payCurrency: string) => {
      const response = await apiRequest("POST", "/api/crypto-deposits", {
        amount: Number(amount),
        payCurrency,
      });
      return response.json() as Promise<CryptoPayment>;
    },
    onSuccess: (data) => {
      setPayment(data);
      setStep("address");
      queryClient.invalidateQueries({ queryKey: ["/api/deposits/history"] });
    },
    onError: (error: Error) => {
      toast({ title: t.depositCreateFail, description: error.message, variant: "destructive" });
    },
  });

  const selectAmount = (value: number) => {
    setAmount(value);
    setStep("currency");
  };

  const continueWithAmount = () => {
    if (!amount || Number(amount) < minDeposit) {
      toast({
        title: t.invalidAmount,
        description: `${t.depositMinimum} ${minDeposit.toLocaleString()} ${currency}`,
        variant: "destructive",
      });
      return;
    }
    setStep("currency");
  };

  const selectCurrency = (option: CryptoOption) => {
    setSelectedCurrency(option);
    createPayment.mutate(option.code);
  };

  const copyAddress = async () => {
    if (!payment) return;
    try {
      await navigator.clipboard.writeText(payment.payAddress);
      setCopied(true);
      toast({ title: t.depositCopiedToast, description: t.depositCopiedDesc });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({ title: t.depositCopyFail, description: t.depositCopyFailDesc });
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#315aab] text-white">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#234781] px-4 shadow-lg">
        {step === "amount" ? (
          <Link href="/account" className="flex h-10 w-10 items-center justify-center" data-testid="button-back-account">
            <ChevronLeft className="h-7 w-7" />
          </Link>
        ) : (
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center"
            onClick={() => setStep(step === "address" ? "currency" : "amount")}
            data-testid="button-deposit-back"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}
        <h1 className="text-lg font-bold tracking-wide">
          {step === "currency" ? t.depositSelectNetwork : t.deposit}
        </h1>
        <div className="w-10" />
      </header>

      {step === "amount" && (
        <section className="mx-auto max-w-lg space-y-5 p-5">
          <div className="rounded-3xl border border-white/15 bg-[#234781] p-5 shadow-xl">
            <p className="mb-1 text-sm font-semibold text-white/75">{t.depositAmount}</p>
            <p className="mb-4 text-xs text-white/60">{t.depositMinimum} {minDeposit.toLocaleString()} {currency}</p>
            <div className="flex overflow-hidden rounded-2xl border border-white/15 bg-white text-[#173667]">
              <span className="flex items-center border-r border-[#315aab]/20 px-4 font-bold">{currency}</span>
              <input
                type="number"
                value={amount}
                min={minDeposit}
                onChange={(event) => setAmount(event.target.value ? Number(event.target.value) : "")}
                placeholder={`${t.depositMinimum} ${minDeposit.toLocaleString()}`}
                className="min-w-0 flex-1 bg-transparent px-4 py-4 outline-none placeholder:text-[#173667]/45"
                data-testid="input-deposit-amount"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`rounded-xl border py-3 text-sm font-bold transition ${
                    amount === preset ? "border-white bg-white text-[#315aab]" : "border-white/20 bg-white/10 text-white"
                  }`}
                  data-testid={`button-preset-amount-${preset}`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={continueWithAmount}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 font-bold text-[#315aab] shadow-lg transition hover:bg-white/90"
              data-testid="button-recharge-now"
            >
              {t.depositRechargeNow} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded-3xl border border-white/15 bg-[#234781] p-5 text-sm leading-7 text-white/85 shadow-xl">
            <p>{getContent(platformSettings, "content_deposit_infoText", t.depositNetworkTip)}</p>
            <p className="mt-3 text-white/65">{t.depositNetworkTip}</p>
          </div>
        </section>
      )}

      {step === "currency" && (
        <section className="mx-auto max-w-lg p-4">
          <p className="mb-3 px-1 text-sm font-semibold text-white/80">{t.depositSelectNetwork}</p>
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#234781] px-4 shadow-xl">
            {CRYPTO_OPTIONS.map((option, index) => (
              <button
                key={option.code}
                type="button"
                disabled={createPayment.isPending}
                onClick={() => selectCurrency(option)}
                className="flex w-full items-center gap-3 py-4 text-left transition hover:bg-white/10 disabled:opacity-60"
                data-testid={`button-currency-${option.code}`}
              >
                <img src={option.logo} alt="" className="h-10 w-10 rounded-full bg-white object-contain p-1 shadow-md" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-xs text-white/55">{option.network}</span>
                </span>
                <ArrowRight className="h-5 w-5 text-white/70" />
              </button>
            ))}
          </div>
          {createPayment.isPending && (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-white/80">
              <Loader2 className="h-5 w-5 animate-spin" /> {t.depositGenerating}
            </div>
          )}
        </section>
      )}

      {step === "address" && payment && selectedCurrency && (
        <section className="mx-auto max-w-lg space-y-4 p-4">
          <div className="rounded-3xl border border-white/15 bg-[#234781] p-5 text-center shadow-xl">
            <div className="mb-3 flex items-center justify-center gap-2">
              <img src={selectedCurrency.logo} alt="" className="h-10 w-10 rounded-full bg-white object-contain p-1" />
              <div className="text-left">
                <p className="font-bold">{selectedCurrency.label}</p>
                <p className="text-xs text-white/60">{selectedCurrency.network}</p>
              </div>
            </div>
            <p className="text-sm text-white/70">{t.depositExactAmount}</p>
            <p className="mt-1 text-2xl font-black">{payment.payAmount} <span className="text-base">{payment.payCurrency.toUpperCase()}</span></p>
            <div className="mx-auto my-5 w-fit rounded-2xl bg-white p-3 shadow-lg">
              <img src={payment.qrCode} alt="QR" className="h-56 w-56" data-testid="img-deposit-qr" />
            </div>
            <p className="mb-2 text-lg font-bold">{t.depositAddressTitle}</p>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#173667] p-2 pl-4">
              <span className="min-w-0 flex-1 truncate text-left font-mono text-xs text-white/75">{shortenAddress(payment.payAddress)}</span>
              <button
                type="button"
                onClick={copyAddress}
                className="flex shrink-0 items-center gap-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#315aab]"
                data-testid="button-copy-deposit-address"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t.depositCopied : t.depositCopy}
              </button>
            </div>
            <button
              type="button"
              onClick={() => toast({ title: t.depositDone, description: t.depositDoneDesc })}
              className="mt-5 w-full rounded-full bg-white py-4 font-bold text-[#315aab] shadow-lg"
              data-testid="button-deposit-completed"
            >
              {t.depositDone}
            </button>
          </div>
          <div className="rounded-3xl border border-white/15 bg-[#234781] p-5 text-sm leading-7 text-white/85 shadow-xl">
            <div className="mb-2 flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5" /> {t.depositSecurity}</div>
            <p>{t.depositSec1}</p>
            <p>2. {t.depositLabel} {selectedCurrency.label} — {selectedCurrency.network}.</p>
            <p>{t.depositSec3}</p>
            <p className="mt-2 text-white/65">{helpText}</p>
          </div>
        </section>
      )}
    </main>
  );
}
