import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { useLocation } from "wouter";
import { Copy, Users, ChevronRight } from "lucide-react";
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div
            className="px-4 py-2.5 flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)` }}
          >
            <img
              src={teamIcon}
              alt=""
              className="w-4 h-4 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-white font-bold text-sm">Code &amp; Lien d'invitation</p>
          </div>

          <div className="px-4 py-4 space-y-3">
            {/* Code */}
            <div>
              <p className="text-gray-400 text-[11px] mb-1.5 font-medium">Inviter :</p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl"
                  style={{ background: "#eef2fa", border: `1.5px solid ${BLUE}30` }}
                >
                  <p className="font-bold text-sm truncate" style={{ color: BLUE }} data-testid="text-referral-code">
                    {user.referralCode}
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  style={{ background: RED }}
                  data-testid="button-copy-code"
                >
                  <Copy size={12} /> Copier
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Lien */}
            <div>
              <p className="text-gray-400 text-[11px] mb-1.5 font-medium">Inviter :</p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl"
                  style={{ background: "#eef2fa", border: `1.5px solid ${BLUE}30` }}
                >
                  <p className="text-xs truncate" style={{ color: BLUE_DARK }} data-testid="text-referral-link">
                    {referralLink}
                  </p>
                </div>
                <button
                  onClick={copyLink}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  style={{ background: RED }}
                  data-testid="button-copy-link"
                >
                  <Copy size={12} /> Copier
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
          <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Titre */}
            <div className="relative px-4 py-3 text-center">
              <p className="text-gray-800 font-bold text-sm">{lvl.label}</p>
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: 48, height: 2, background: RED }}
              />
            </div>

            <div className="h-px bg-gray-100" />

            {/* 3 colonnes */}
            <div className="grid grid-cols-3 py-4">
              <div className="flex flex-col items-center px-2 border-r border-gray-100">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-2">
                  Argent{"\n"}rechargé
                </p>
                <p className="font-extrabold text-sm" style={{ color: BLUE }}>
                  {Number(lvl.recharged).toLocaleString("fr-FR")}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5">{currency}</p>
              </div>

              <div className="flex flex-col items-center px-2 border-r border-gray-100">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-2">
                  Nombre total{"\n"}de personnes
                </p>
                <p className="font-extrabold text-sm text-gray-900">
                  {lvl.invested}/{lvl.total}
                </p>
              </div>

              <div className="flex flex-col items-center px-2">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-2">
                  Taux de{"\n"}commission
                </p>
                <p className="font-extrabold text-sm" style={{ color: RED }}>
                  {lvl.rate}
                </p>
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
