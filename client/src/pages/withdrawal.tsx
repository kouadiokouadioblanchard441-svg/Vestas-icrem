import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import landscapeImg from "@assets/portable-charger-power-banks_480x480_d6b67d82-6118-4295-be02-e_1784966597898.jpg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
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

const WITHDRAWAL_METHOD = "USDT BEP20";

export default function WithdrawalPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number | "">("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [, navigate] = useLocation();

  const currency = "USDT";

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

  const minWithdrawal = withdrawalSettings?.minWithdrawal ?? 1500;
  const withdrawalEnabled = withdrawalSettings?.withdrawalEnabled ?? true;
  const withdrawalFee = withdrawalSettings?.withdrawalFees ?? 18;
  const withdrawalStartHour = withdrawalSettings?.withdrawalStartHour ?? 9;
  const withdrawalEndHour = withdrawalSettings?.withdrawalEndHour ?? 17;

  const withdrawalCtaButton = getContent(allSettings, "content_withdrawal_ctaButton", "立即提现");
  const withdrawalInstructionsTitle = getContent(allSettings, "content_withdrawal_instructionsTitle", "提现说明");
  const withdrawalInstruction1 = getContent(allSettings, "content_withdrawal_instruction1", `1. 最低提现金额为 ${minWithdrawal.toLocaleString()} ${currency}。`);
  const withdrawalInstruction2 = getContent(allSettings, "content_withdrawal_instruction2", "2. 每天最多可提现三次，没有时间限制。");
  const withdrawalInstruction3 = getContent(allSettings, "content_withdrawal_instruction3", `3. 每笔提现将收取 ${withdrawalFee}% 的处理费。`);
  const withdrawalInstruction4 = getContent(allSettings, "content_withdrawal_instruction4", "4. 提现通常在2小时内到账，特殊情况下可能需要24小时。");
  const withdrawalInstruction5 = getContent(allSettings, "content_withdrawal_instruction5", "5. 如果提现失败，请确认 USDT BEP20 地址正确后重新提交。");
  const withdrawalInstruction6 = getContent(allSettings, "content_withdrawal_instruction6", "6. 提交前请查看平台显示的提现条件。");
  const withdrawalWarningNoHours = getContent(allSettings, "content_withdrawal_warningNoHours", `提现时间：${withdrawalStartHour}:00 – ${withdrawalEndHour}:00（当前已关闭）`);
  const withdrawalWarningNoProduct = getContent(allSettings, "content_withdrawal_warningNoProduct", "您需要拥有有效产品才能提现。");

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
      toast({ title: t.invalidAmount, description: `${t.minAmountPrefix} ${minWithdrawal} USDT`, variant: "destructive" });
      return;
    }
    if (!selectedWallet) {
      toast({ title: t.addressRequired, description: t.selectUsdtWallet, variant: "destructive" });
      return;
    }
    withdrawMutation.mutate({ amount: Number(amount), walletId: selectedWallet.id });
  };

  if (walletsLoading) return null;

  if (!user) return null;

  const balance = parseFloat(user?.totalEarnings || "0");
  const hasWallets = wallets.length > 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
        <Link href="/account">
          <button className="flex items-center gap-1 text-gray-800" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold text-base">{t.withdrawTitle}</span>
          </button>
        </Link>
        <div className="w-9 h-9" />
      </header>

      {/* ── Banner with balance ── */}
      <div className="relative w-full" style={{ height: "180px" }}>
        <img
          src="/poweradd/poweradd-energycell-banner.jpg"
          alt=""
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
            {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-white/80 text-xs mt-0.5">{t.withdrawalEarningsBalance}</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-10 space-y-5">

        {/* ── Wallet selector ── */}
        <div>
            <p className="text-white font-semibold text-sm mb-2">{t.withdrawalAddressLabel}</p>
          <button
            onClick={() => {
              if (!hasWallets) {
                navigate("/wallet");
              } else {
                navigate("/wallet?from=withdrawal");
              }
            }}
            className="w-full bg-white flex items-center justify-between px-5"
            style={{ height: 54, borderRadius: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", border: "none" }}
            data-testid="button-select-wallet"
          >
            <span className="text-sm text-gray-500 truncate">
              {selectedWallet
                ? `${selectedWallet.accountName} · ${selectedWallet.accountNumber} · ${WITHDRAWAL_METHOD}`
                : hasWallets
                    ? t.withdrawalSelectBep20
                  : (
                    <span className="flex items-center gap-2 text-[#E8192C]">
                      <Plus className="w-4 h-4" /> {t.withdrawalAddWallet}
                    </span>
                  )
              }
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          </button>
        </div>

        {/* ── Amount section ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-semibold text-sm">{t.withdrawAmountLabel}</p>
            <p className="text-white/70 text-sm">{t.withdrawalFeeLabel} {withdrawalFee}%</p>
          </div>

          <div className="flex items-center overflow-hidden bg-white" style={{ height: 54, borderRadius: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <span className="px-5 text-gray-800 font-semibold text-sm border-r border-gray-200 shrink-0 h-full flex items-center">
              {currency}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder={t.withdrawalAmountPlaceholder}
              className="flex-1 px-4 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
              data-testid="input-withdrawal-amount"
            />
          </div>

          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-white/80 text-xs">
              {t.withdrawalNetAmountLabel}{" "}
              <span className="font-semibold">{currency} {amountAfterFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <p className="text-right text-xs mt-1 px-1" style={{ color: "#ff0000" }}>
            {t.withdrawalMinimumNote.replace("{0}", minWithdrawal.toLocaleString()).replace("{1}", currency)}
          </p>
        </div>

        {/* ── Warnings ── */}
        {!withdrawalEnabled && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium" style={{ color: "#ff0000" }}>
            {t.withdrawAdminDisabled}
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
          disabled={withdrawMutation.isPending || !withdrawalEnabled}
          className="w-full text-white font-bold text-base disabled:opacity-50 active:scale-95 transition-transform"
          style={{
            height: 54, borderRadius: 999,
            background: "linear-gradient(135deg, #E8192C 0%, #E8192C 50%, #B45309 100%)",
            boxShadow: "0 4px 16px rgba(232,25,44,0.4)",
          }}
          data-testid="button-submit-withdrawal"
        >
          {withdrawMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t.withdrawalSubmitting}
            </span>
          ) : (
            withdrawalCtaButton
          )}
        </button>

        {/* ── Instructions (texte existant conservé) ── */}
        <div className="pt-2 pb-6">
          <p className="font-bold text-[#E8192C] text-sm mb-3">{withdrawalInstructionsTitle}</p>
          <div className="space-y-2.5 text-sm text-black leading-relaxed">
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
