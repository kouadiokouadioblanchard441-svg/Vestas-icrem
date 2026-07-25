import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { useLocation } from "wouter";
import { Copy, Users, ChevronRight, TrendingUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { getContent } from "@/lib/content";

import teamIcon from "@assets/1244758_1783246767217.png";
import profileCardBg from "@assets/portable-charger-power-banks_480x480_d6b67d82-6118-4295-be02-e_1784966597898.jpg";

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

const BLUE      = "#315aab";
const BLUE_DARK = "#254a91";
const RED       = "#E8192C";

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: stats } = useQuery<TeamStats>({
    queryKey: ["/api/team/stats"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  if (!user) return null;

  const countryInfo = getCountryByCode(user.country);
  const currency = countryInfo?.currency || "USDT";
  const referralLink = `${window.location.origin}/#/register?invite_code=${user.referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({ title: "Code copié !" });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Lien copié !" });
  };

  const lv1Rate = settings?.level1Commission || "27";
  const lv2Rate = settings?.level2Commission || "2";
  const lv3Rate = settings?.level3Commission || "1";

  const taskCenterButton = getContent(settings, "content_team_taskCenterButton", "Tâches");

  // Argent rechargé par niveau (back-computed depuis commission pour niveaux 2 & 3)
  const lv1Recharged = (stats?.level1Recharged || 0).toFixed(0);
  const lv2Recharged =
    Number(lv2Rate) > 0
      ? ((stats?.level2Commission || 0) / (Number(lv2Rate) / 100)).toFixed(0)
      : "0";
  const lv3Recharged =
    Number(lv3Rate) > 0
      ? ((stats?.level3Commission || 0) / (Number(lv3Rate) / 100)).toFixed(0)
      : "0";

  const levels = [
    {
      label: "Équipe niveau 1",
      recharged: lv1Recharged,
      invested: stats?.level1Invested || 0,
      total: stats?.level1Count || 0,
      rate: `${lv1Rate}%`,
    },
    {
      label: "Équipe niveau 2",
      recharged: lv2Recharged,
      invested: stats?.level2Invested || 0,
      total: stats?.level2Count || 0,
      rate: `${lv2Rate}%`,
    },
    {
      label: "Équipe niveau 3",
      recharged: lv3Recharged,
      invested: stats?.level3Invested || 0,
      total: stats?.level3Count || 0,
      rate: `${lv3Rate}%`,
    },
  ];

  const teamDeposits    = (stats?.teamTotalDeposits    || 0).toFixed(0);
  const teamWithdrawals = (stats?.teamTotalWithdrawals || 0).toFixed(0);

  return (
    <div className="flex flex-col min-h-full pb-20" style={{ background: BLUE }}>

      {/* ── Header ── */}
      <div
        className="px-4 pt-5 pb-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <Users size={16} className="text-white" />
          </div>
          <p className="text-white font-extrabold text-lg tracking-wide">Équipe</p>
        </div>
        <button
          onClick={() => navigate("/salary-bonus")}
          className="px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
          data-testid="button-centre-taches"
        >
          {taskCenterButton}
        </button>
      </div>

      <div className="px-3 pt-3 space-y-3">

        {/* ── Invitation ── */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(49,90,171,0.18)" }}>
          {/* En-tête avec bordure gauche rouge */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderLeft: `4px solid ${RED}` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${BLUE}15` }}>
              <img src={teamIcon} alt="" className="w-4 h-4 object-contain" style={{ filter: "brightness(0) saturate(100%) invert(25%) sepia(90%) saturate(500%) hue-rotate(200deg)" }} />
            </div>
            <div>
              <p className="font-extrabold text-sm" style={{ color: BLUE }}>Code &amp; Lien d'invitation</p>
              <p className="text-gray-400 text-[10px]">Partagez pour inviter vos filleuls</p>
            </div>
          </div>

          <div className="h-px" style={{ background: `linear-gradient(90deg, ${RED}, ${BLUE}40, transparent)` }} />

          <div className="px-4 py-4 space-y-3">
            {/* Code */}
            <div>
              <p className="text-[11px] font-semibold mb-1.5" style={{ color: BLUE }}>Code d'invitation</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-3 rounded-xl flex items-center gap-2"
                  style={{ background: `${BLUE}0d`, border: `1.5px solid ${BLUE}25` }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: BLUE }} />
                  <p className="font-bold text-sm truncate" style={{ color: BLUE }} data-testid="text-referral-code">
                    {user.referralCode}
                  </p>
                </div>
                <button onClick={copyCode}
                  className="px-4 py-3 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1.5"
                  style={{ background: `linear-gradient(135deg, ${RED}, #c0101e)`, boxShadow: `0 3px 10px ${RED}50` }}
                  data-testid="button-copy-code">
                  <Copy size={11} /> Copier
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Lien */}
            <div>
              <p className="text-[11px] font-semibold mb-1.5" style={{ color: BLUE }}>Lien d'invitation</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 px-3 py-3 rounded-xl"
                  style={{ background: `${BLUE}0d`, border: `1.5px solid ${BLUE}25` }}>
                  <p className="text-xs truncate" style={{ color: BLUE_DARK }} data-testid="text-referral-link">
                    {referralLink}
                  </p>
                </div>
                <button onClick={copyLink}
                  className="px-4 py-3 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1.5"
                  style={{ background: `linear-gradient(135deg, ${RED}, #c0101e)`, boxShadow: `0 3px 10px ${RED}50` }}
                  data-testid="button-copy-link">
                  <Copy size={11} /> Copier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Portefeuilles ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Recharge */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{ minHeight: 110 }}
          >
            <img
              src="/poweradd/poweradd-energycell-banner.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.28)" }} />
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <p className="text-white/90 text-[11px] font-semibold leading-tight drop-shadow">
                Portefeuille de recharge
              </p>
              <div className="mt-3">
                <p className="text-white font-extrabold text-xl leading-none drop-shadow">
                  {Number(teamDeposits).toLocaleString("fr-FR")}
                </p>
                <p className="text-white/80 text-xs mt-0.5 drop-shadow">{currency}</p>
              </div>
            </div>
          </div>

          {/* Retrait */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{ minHeight: 110 }}
          >
            <img
              src={profileCardBg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.28)" }} />
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <p className="text-white/90 text-[11px] font-semibold leading-tight drop-shadow">
                Portefeuille de retrait
              </p>
              <div className="mt-3">
                <p className="text-white font-extrabold text-xl leading-none drop-shadow">
                  {Number(teamWithdrawals).toLocaleString("fr-FR")}
                </p>
                <p className="text-white/80 text-xs mt-0.5 drop-shadow">{currency}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Niveaux ── */}
        {levels.map((lvl, idx) => (
          <div key={idx} className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 4px 20px rgba(49,90,171,0.14)" }}>

            {/* En-tête niveau */}
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${BLUE}08, ${BLUE}14)`, borderBottom: `1px solid ${BLUE}18` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs text-white"
                  style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})` }}>
                  {idx + 1}
                </div>
                <p className="font-extrabold text-sm" style={{ color: BLUE }}>{lvl.label}</p>
              </div>
              {/* Badge taux */}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold text-white"
                style={{ background: `linear-gradient(135deg, ${RED}, #c0101e)` }}>
                {lvl.rate}
              </span>
            </div>

            {/* 3 colonnes stats */}
            <div className="grid grid-cols-3 py-4 px-1">

              {/* Argent rechargé */}
              <div className="flex flex-col items-center gap-1.5 px-2"
                style={{ borderRight: `1px solid ${BLUE}18` }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: `${BLUE}12` }}>
                  <ArrowDownCircle size={14} style={{ color: BLUE }} />
                </div>
                <p className="text-gray-400 text-[10px] text-center leading-tight">Argent rechargé</p>
                <p className="font-extrabold text-sm" style={{ color: BLUE }}>
                  {Number(lvl.recharged).toLocaleString("fr-FR")}
                </p>
                <p className="text-gray-400 text-[10px]">{currency}</p>
              </div>

              {/* Membres */}
              <div className="flex flex-col items-center gap-1.5 px-2"
                style={{ borderRight: `1px solid ${BLUE}18` }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "#6b728012" }}>
                  <Users size={14} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-[10px] text-center leading-tight">Total personnes</p>
                <p className="font-extrabold text-sm text-gray-800">
                  {lvl.invested}/{lvl.total}
                </p>
                <p className="text-gray-400 text-[10px]">actifs/total</p>
              </div>

              {/* Commission */}
              <div className="flex flex-col items-center gap-1.5 px-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: `${RED}12` }}>
                  <TrendingUp size={14} style={{ color: RED }} />
                </div>
                <p className="text-gray-400 text-[10px] text-center leading-tight">Commission</p>
                <p className="font-extrabold text-sm" style={{ color: RED }}>
                  {lvl.rate}
                </p>
                <p className="text-gray-400 text-[10px]">par dépôt</p>
              </div>

            </div>
          </div>
        ))}

        {/* ── CTA ── */}
        <button
          onClick={() => navigate("/members")}
          className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm shadow-md"
          style={{ background: RED, color: "#fff" }}
        >
          <Users size={16} />
          Voir tous mes membres
          <ChevronRight size={16} />
        </button>

      </div>
    </div>
  );
}
