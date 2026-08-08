import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, Shield, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

import { getUserAvatar } from "@/lib/avatar";
import iconRecords from "@assets/mine-mod-records-DgHXSKa1_1782689837747.png";
import iconGift from "@assets/téléchargement_(66)_1782689859239.png";
import iconAbout from "@assets/mine-mod-aboutus-xnaBhqOq_1782689895455.png";
import iconCS from "@assets/mine-mod-cs-DtBQ0Sp0_1782689895410.png";
import iconWithdraw from "@assets/withdraw-icon-DFsum39V_(1)_1782689895379.png";
import iconChangePwd from "@assets/mine-mod-change-pwd-D4tL_Aft_1782689895436.png";
import iconWallet from "@assets/portefeuille-chaud-3d-icon-png-download-9878550_1783248791774.png";
import iconRevenu from "@assets/3309927_1783248791847.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";
import iconRules from "@assets/mine-mod-records-DgHXSKa1_1782689837747.png";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [showPinModal, setShowPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const { data: products } = useQuery<any[]>({
    queryKey: ["/api/user-products"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || t.incorrectPin);
      }
      return res.json();
    },
    onSuccess: () => {
      setShowPinModal(false);
      setAdminPin("");
      navigate("/admin");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleAdminClick = () => {
    if (user?.isAdminPasswordRequired === false) {
      navigate("/admin");
      return;
    }
    setShowPinModal(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const totalEarnings = parseFloat(user.totalEarnings || "0");
  const country = getCountryByCode(user.country);
  const currency = "FCFA";

  // Niveau VIP calculé selon les produits achetés
  const productCount = products?.length ?? 0;
  const vipLevel = productCount >= 1 ? 1 : 0;

  const VIP_STYLES: Record<number, { label: string; bg: string; text: string; border: string }> = {
    0: { label: "VIP 0", bg: "rgba(255,255,255,0.15)", text: "#ffffff", border: "rgba(255,255,255,0.3)" },
    1: { label: "VIP 1", bg: "linear-gradient(90deg,#f5a800,#ff6b00)", text: "#fff", border: "transparent" },
  };
  const vipStyle = VIP_STYLES[vipLevel] ?? VIP_STYLES[0];
  const phonePrefix = country?.phonePrefix || "";

  // 3 boutons rapides
  const quickItems = [
    { icon: iconRecharger, label: t.deposit, href: "/deposit", white: true },
    { icon: iconRetraits, label: t.withdraw, href: "/withdrawal", white: true },
    { icon: iconRecords, label: t.history, href: "/history", white: false },
  ];

  // 8 options d'origine
  const gridItems = [
    { icon: iconRecharger, label: t.deposit, href: "/deposit", white: true },
    { icon: iconRetraits, label: t.withdraw, href: "/withdrawal", white: true },
    { icon: iconRecords, label: t.history, href: "/history", white: false },
    { icon: iconChangePwd, label: t.security, href: "/change-password", white: false },
    { icon: iconGift, label: t.redeem, href: "/gift-code", white: false },
    { icon: iconCS, label: t.customerService, href: "/service", white: false },
    { icon: iconAbout, label: t.about, href: "/about", white: false },
    { icon: iconWithdraw, label: t.wallet, href: "/wallet", white: false },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#2d3816" }}>
      <div className="flex-1 overflow-y-auto pb-16">

        {/* ── Profile top section ── */}
        <div style={{ background: "#2d3816" }}>
          <div className="flex items-center justify-between px-5 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 shrink-0">
                <img src={getUserAvatar(user.id)} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                {/* Badge VIP — au-dessus du numéro */}
                <div className="mb-1">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider border"
                    style={{
                      background: vipStyle.bg,
                      color: vipStyle.text,
                      borderColor: vipStyle.border,
                    }}
                  >
                    ★ {vipStyle.label}
                  </span>
                </div>

                <p className="text-white font-bold text-base leading-tight drop-shadow" data-testid="text-phone">
                  {phonePrefix}{user.phone}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-white/80 text-xs drop-shadow">ID : {user.referralCode}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.referralCode || "");
                      const el = document.getElementById("copy-id-feedback");
                      if (el) { el.style.opacity = "1"; setTimeout(() => { el.style.opacity = "0"; }, 1200); }
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold leading-none active:scale-95 transition-transform"
                    style={{ background: "rgba(255,255,255,0.25)", color: "white" }}
                  >
                    Copier
                  </button>
                  <span
                    id="copy-id-feedback"
                    className="text-[10px] font-bold transition-opacity duration-300"
                    style={{ color: "#86efac", opacity: 0 }}
                  >
                    ✓
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* ── 2 cartes balance d'origine ── */}
          <div className="px-4 pb-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl px-4 py-4" style={{ background: "#4a5e22" }}>
              <p className="text-white/70 text-xs font-semibold mb-2 uppercase tracking-wide">{t.accountBalanceLabel}</p>
              <p className="text-white font-black text-2xl leading-tight" data-testid="text-balance">
                {balance.toFixed(2)}
              </p>
              <p className="text-white/60 text-[11px] mt-1">{currency}</p>
            </div>
            <div className="rounded-2xl px-4 py-4" style={{ background: "#4a5e22" }}>
              <p className="text-white/70 text-xs font-semibold mb-2 uppercase tracking-wide">{t.revenueLabel}</p>
              <p className="text-white font-black text-2xl leading-tight" data-testid="text-earnings">
                {totalEarnings.toFixed(2)}
              </p>
              <p className="text-white/60 text-[11px] mt-1">{currency}</p>
            </div>
          </div>
        </div>

        {/* ── 3 boutons rapides ── */}
        <div className="mx-4 mb-5 grid grid-cols-3 gap-3">
          {quickItems.map((item, idx) => (
            <Link href={item.href} key={idx}>
              <button
                className="flex flex-col items-center gap-2 rounded-2xl py-4 w-full active:opacity-80"
                style={{ background: "rgba(0,0,0,0.45)" }}
                data-testid={`button-quick-${idx}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow"
                  style={{ background: "linear-gradient(135deg, #374151, #1F2937)" }}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-7 h-7 object-contain"
                    style={item.white ? undefined : { filter: "brightness(0) invert(1)" }}
                  />
                </div>
                <span className="text-white/90 text-[11px] font-medium text-center leading-tight px-1">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>


        {/* ── Section Service (liste en gras) ── */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ background: "rgba(0,0,0,0.45)" }}>
          {[
            { icon: iconCS,        label: t.customerService, href: "/service",         white: false },
            { icon: iconChangePwd, label: t.security,        href: "/change-password", white: false },
            { icon: iconGift,      label: t.redeem,          href: "/gift-code",       white: false },
            { icon: iconAbout,     label: t.about,           href: "/about",           white: false },
            { icon: iconRules,     label: t.companyLabel,    href: "/company",         white: false },
            { icon: iconWithdraw,  label: t.wallet,          href: "/wallet",          white: false },
          ].map((item, idx) => (
            <Link href={item.href} key={idx}>
              <button
                className="flex items-center gap-3 w-full px-4 py-4 active:opacity-70 border-b border-white/5 last:border-0"
                data-testid={`button-service-${idx}`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #374151, #1F2937)" }}>
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-5 h-5 object-contain"
                    style={item.white ? undefined : { filter: "brightness(0) invert(1)" }}
                  />
                </div>
                <span className="flex-1 text-white font-bold text-sm text-left">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
              </button>
            </Link>
          ))}
        </div>

        {/* ── Déconnexion ── */}
        <div className="mx-4 mt-3">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl text-sm font-bold border-2 border-red-600 text-red-600 bg-white active:bg-red-50"
            data-testid="button-logout"
          >
            {t.logout}
          </button>
        </div>

        {/* ── Admin button ── */}
        {user.isAdmin && (
          <div className="mx-4 mt-3 mb-4">
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #E8192C, #E8192C)" }}
              data-testid="button-admin"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">{t.adminPanel}</span>
            </button>
          </div>
        )}

      </div>

      {/* ── Admin PIN modal ── */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{t.adminAccessCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t.adminPinHint}
            </p>
            <Input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder={t.pinPlaceholder}
              className="text-center text-2xl tracking-widest"
              maxLength={8}
              data-testid="input-admin-pin"
            />
            <Button
              onClick={() => {
                if (adminPin.length < 4) {
                  toast({ title: t.pinMinLength, variant: "destructive" });
                  return;
                }
                verifyPinMutation.mutate(adminPin);
              }}
              disabled={verifyPinMutation.isPending || adminPin.length < 4}
              className="w-full"
              style={{ backgroundColor: "#E8192C" }}
              data-testid="button-verify-pin"
            >
              {verifyPinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
