import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { useLocation } from "wouter";
import { Copy, Users, ChevronRight } from "lucide-react";
import { getContent } from "@/lib/content";

import teamIcon from "@assets/1244758_1783246767217.png";

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
}

const BLUE = "#315aab";
const BLUE_DARK = "#254a91";
const RED = "#E8192C";

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

  // Argent rechargé par niveau
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

  return (
    <div
      className="flex flex-col min-h-full pb-20"
      style={{ background: BLUE }}
    >
      {/* ── Header ── */}
      <div
        className="px-4 pt-5 pb-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Users size={16} className="text-white" />
          </div>
          <p className="text-white font-extrabold text-lg tracking-wide">Équipe</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/members")}
            className="px-4 py-1.5 rounded-full text-white text-xs font-bold"
            style={{ background: RED }}
            data-testid="button-membres"
          >
            Membres
          </button>
          <button
            onClick={() => navigate("/salary-bonus")}
            className="px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
            data-testid="button-centre-taches"
          >
            {taskCenterButton}
          </button>
        </div>
      </div>

      <div className="px-3 pt-3 space-y-3">

        {/* ── Invitation ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Titre section */}
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
            {/* Code row */}
            <div>
              <p className="text-gray-400 text-[11px] mb-1.5 font-medium">Inviter :</p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl"
                  style={{ background: "#f0f4fb", border: `1.5px solid ${BLUE}30` }}
                >
                  <p
                    className="font-bold text-sm truncate"
                    style={{ color: BLUE }}
                    data-testid="text-referral-code"
                  >
                    {user.referralCode}
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  style={{ background: RED }}
                  data-testid="button-copy-code"
                >
                  <Copy size={12} />
                  Copier
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Lien row */}
            <div>
              <p className="text-gray-400 text-[11px] mb-1.5 font-medium">Inviter :</p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl"
                  style={{ background: "#f0f4fb", border: `1.5px solid ${BLUE}30` }}
                >
                  <p
                    className="text-xs truncate"
                    style={{ color: BLUE_DARK }}
                    data-testid="text-referral-link"
                  >
                    {referralLink}
                  </p>
                </div>
                <button
                  onClick={copyLink}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0 flex items-center gap-1"
                  style={{ background: RED }}
                  data-testid="button-copy-link"
                >
                  <Copy size={12} />
                  Copier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Portefeuilles ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Recharge */}
          <div
            className="rounded-2xl p-4 shadow-md"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            <p className="text-white/70 text-[11px] font-medium mb-2">
              Portefeuille de recharge
            </p>
            <p className="text-white font-extrabold text-lg leading-none">
              {parseFloat(user.balance || "0").toFixed(0)}
            </p>
            <p className="text-white/60 text-xs mt-0.5">{currency}</p>
          </div>

          {/* Retrait */}
          <div
            className="rounded-2xl p-4 shadow-md"
            style={{ background: "rgba(232,25,44,0.18)", border: "1px solid rgba(232,25,44,0.35)" }}
          >
            <p className="text-white/70 text-[11px] font-medium mb-2">
              Portefeuille de retrait
            </p>
            <p className="text-white font-extrabold text-lg leading-none">
              {parseFloat(user.totalEarnings || "0").toFixed(0)}
            </p>
            <p className="text-white/60 text-xs mt-0.5">{currency}</p>
          </div>
        </div>

        {/* ── Niveaux ── */}
        {levels.map((lvl, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            {/* Titre niveau */}
            <div className="px-4 py-3 text-center relative">
              <p className="text-gray-800 font-bold text-sm">{lvl.label}</p>
              {/* Trait décoratif rouge centré */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: 48, height: 2, background: RED }}
              />
            </div>

            {/* Séparateur */}
            <div className="h-px bg-gray-100" />

            {/* 3 colonnes */}
            <div className="grid grid-cols-3 py-4">
              {/* Argent rechargé */}
              <div className="flex flex-col items-center px-2 border-r border-gray-100">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-2">
                  Argent{"\n"}rechargé
                </p>
                <p className="font-extrabold text-sm" style={{ color: BLUE }}>
                  {Number(lvl.recharged).toLocaleString("fr-FR")}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5">{currency}</p>
              </div>

              {/* Nombre de personnes */}
              <div className="flex flex-col items-center px-2 border-r border-gray-100">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-2">
                  Nombre total{"\n"}de personnes
                </p>
                <p className="font-extrabold text-sm text-gray-900">
                  {lvl.invested}/{lvl.total}
                </p>
              </div>

              {/* Taux commission */}
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

        {/* ── Voir les membres ── */}
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
