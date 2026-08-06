import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

import iconLv1    from "@assets/team_1_1786039393584.png";
import iconLv2    from "@assets/team_2_1786039393656.png";
import iconLv3    from "@assets/team_3_1786039393719.png";
import iconLink   from "@assets/link_1786039393680.png";
import inviteBg   from "@assets/invite_bg_1786039393701.png";

/* ── Palette ─────────────────────────────────── */
const PAGE_BG    = "#2d3816";
const HDR_FROM   = "#3d5020";
const HDR_TO     = "#1e2e0a";
const COPY_BTN   = "#5a7228";

const LV1 = { bg: "#f0d566", label: "Leve1", icon: iconLv1, rate_label: "Remise Niveau 1" };
const LV2 = { bg: "#c0cce8", label: "Leve2", icon: iconLv2, rate_label: "Remise Niveau 2" };
const LV3 = { bg: "#f0b8b0", label: "Leve3", icon: iconLv3, rate_label: "Remise Niveau 3" };

interface TeamStats {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCommission: number;
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  level1Invested: number;
  level2Invested: number;
  level3Invested: number;
  level1Recharged: number;
  teamTotalDeposits: number;
  teamTotalWithdrawals: number;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [, navigate] = useLocation();

  const { data: stats } = useQuery<TeamStats>({ queryKey: ["/api/team/stats"] });
  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency    = countryInfo?.currency || "USDT";
  const referralLink = `${window.location.origin}/#/register?invite_code=${user.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: t.teamLinkCopied });
  };

  const lv1Rate = settings?.level1Commission || "35";
  const lv2Rate = settings?.level2Commission || "2";
  const lv3Rate = settings?.level3Commission || "1";

  const levels = [
    {
      ...LV1,
      rate:  `${lv1Rate}%`,
      total: stats?.level1Count    || 0,
      actif: stats?.level1Invested || 0,
    },
    {
      ...LV2,
      rate:  `${lv2Rate}%`,
      total: stats?.level2Count    || 0,
      actif: stats?.level2Invested || 0,
    },
    {
      ...LV3,
      rate:  `${lv3Rate}%`,
      total: stats?.level3Count    || 0,
      actif: stats?.level3Invested || 0,
    },
  ];

  return (
    <div className="flex flex-col min-h-full pb-20" style={{ background: PAGE_BG }}>

      {/* ══ Header ══ */}
      <div
        className="relative flex items-center justify-center px-4 pt-5 pb-4"
        style={{ background: `linear-gradient(135deg, ${HDR_FROM}, ${HDR_TO})` }}
      >
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.18)" }}
          data-testid="button-back"
        >
          <ChevronRight className="w-5 h-5 text-white rotate-180" />
        </button>
        <h1 className="text-white font-bold text-lg tracking-wide">{t.teamTitle || "équipe"}</h1>
      </div>

      <div className="px-3 pt-4 space-y-4">

        {/* ══ Lien d'invitation ══ */}
        <div className="rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3" style={{ background: "#4a5e22" }}>
          {/* Illustration */}
          <img src={inviteBg} alt="" className="w-14 h-14 object-contain shrink-0" />

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-white text-sm mb-0.5">{t.teamInviteLink || "Lien d'invitation"}</p>
            <p
              className="text-xs truncate"
              style={{ color: "rgba(255,255,255,0.7)" }}
              data-testid="text-referral-link"
            >
              {referralLink}
            </p>
          </div>

          {/* Bouton copier */}
          <button
            onClick={copyLink}
            className="shrink-0 px-4 py-1.5 rounded-full text-white text-xs font-bold shadow active:scale-95 transition-transform"
            style={{ background: COPY_BTN }}
            data-testid="button-copy-link"
          >
            {t.teamCopy || "Copier"}
          </button>
        </div>

        {/* ══ Niveau d'équipe ══ */}
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: "#4a5e22" }}>

          {/* En-tête section */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div>
              <p className="font-extrabold text-white text-base">{t.teamLevel1 ? "Niveau d'équipe" : "Niveau d'équipe"}</p>
              <p className="text-white/60 text-xs mt-0.5">
                1 Récompense d'activation :&nbsp;
                <span className="font-bold text-white">{currency} 0</span>
              </p>
            </div>
            <button
              onClick={() => navigate("/members")}
              className="flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: "rgba(255,255,255,0.7)" }}
              data-testid="button-team-details"
            >
              Détails de l'équipe <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards niveau */}
          <div className="px-3 pb-4 space-y-3">
            {levels.map((lvl, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ background: lvl.bg }}
                data-testid={`level-card-${idx + 1}`}
              >
                {/* Titre + médaille */}
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <p className="font-extrabold text-white text-base italic">{lvl.label}</p>
                  <img src={lvl.icon} alt={lvl.label} className="w-10 h-10 object-contain" />
                </div>

                {/* 3 stats */}
                <div className="grid grid-cols-3 pb-4 pt-1">
                  <div className="flex flex-col items-center px-2">
                    <p className="font-extrabold text-white text-xl leading-tight">{lvl.rate}</p>
                    <p className="text-white/80 text-[10px] text-center leading-snug mt-0.5">{lvl.rate_label}</p>
                  </div>
                  <div className="flex flex-col items-center px-2 border-x border-black/10">
                    <p className="font-extrabold text-white text-xl leading-tight">{lvl.total}</p>
                    <p className="text-white/80 text-[10px] text-center leading-snug mt-0.5">Total des invités</p>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <p className="font-extrabold text-white text-xl leading-tight">{lvl.actif}</p>
                    <p className="text-white/80 text-[10px] text-center leading-snug mt-0.5">Actif</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
