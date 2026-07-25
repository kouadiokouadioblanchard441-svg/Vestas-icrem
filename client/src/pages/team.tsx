import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getCountryByCode } from "@/lib/countries";
import { useLocation } from "wouter";
import { Copy, Users } from "lucide-react";
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

  // "Argent rechargé" per level: level1 comes direct from API, 2&3 back-computed from commission
  const lv1Recharged = (stats?.level1Recharged || 0).toFixed(0);
  const lv2Recharged = Number(lv2Rate) > 0
    ? ((stats?.level2Commission || 0) / (Number(lv2Rate) / 100)).toFixed(0)
    : "0";
  const lv3Recharged = Number(lv3Rate) > 0
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
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FEF3E2 50%, #FFF8F0 100%)" }}
    >
      {/* ── Header ── */}
      <div className="bg-white px-4 pt-5 pb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img
            src={teamIcon}
            alt="équipe"
            className="w-6 h-6 object-contain"
            style={{ filter: "brightness(0) saturate(100%) invert(55%) sepia(90%) saturate(500%) hue-rotate(5deg)" }}
          />
          <p className="text-gray-900 font-extrabold text-lg">Équipe</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/members")}
            className="px-4 py-1.5 rounded-full text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #F97316, #EA6A10)" }}
            data-testid="button-membres"
          >
            Membres
          </button>
          <button
            onClick={() => navigate("/salary-bonus")}
            className="px-4 py-1.5 rounded-full text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #87CEEB, #5BB8E8)" }}
            data-testid="button-centre-taches"
          >
            {taskCenterButton}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* ── Invitation ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Code row */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-gray-500 text-xs mb-1.5">Inviter :</p>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border"
                style={{ borderColor: "#F97316", background: "#FFF8F0" }}
              >
                <p className="text-gray-900 font-bold text-sm truncate" data-testid="text-referral-code">
                  {user.referralCode}
                </p>
              </div>
              <button
                onClick={copyCode}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #F97316, #EA6A10)" }}
                data-testid="button-copy-code"
              >
                Copier
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-4" />

          {/* Link row */}
          <div className="px-4 pt-3 pb-4">
            <p className="text-gray-500 text-xs mb-1.5">Inviter :</p>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border"
                style={{ borderColor: "#F97316", background: "#FFF8F0" }}
              >
                <p className="text-gray-700 text-xs truncate" data-testid="text-referral-link">
                  {referralLink}
                </p>
              </div>
              <button
                onClick={copyLink}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #F97316, #EA6A10)" }}
                data-testid="button-copy-link"
              >
                Copier
              </button>
            </div>
          </div>
        </div>

        {/* ── Wallets ── */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: "linear-gradient(135deg, #FFF8F0, #FEF0E0)", border: "1px solid #F9731630" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "#F97316" }}>
              Portefeuille de recharge
            </p>
            <p className="text-gray-900 font-extrabold text-base">
              {parseFloat(user.balance || "0").toFixed(0)}{" "}
              <span className="text-sm font-bold text-gray-500">{currency}</span>
            </p>
          </div>
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ background: "linear-gradient(135deg, #F0F9FF, #E0F4FE)", border: "1px solid #87CEEB50" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "#5BB8E8" }}>
              Portefeuille de retrait
            </p>
            <p className="text-gray-900 font-extrabold text-base">
              {parseFloat(user.totalEarnings || "0").toFixed(0)}{" "}
              <span className="text-sm font-bold text-gray-500">{currency}</span>
            </p>
          </div>
        </div>

        {/* ── Level cards ── */}
        {levels.map((lvl, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Card title */}
            <div className="px-4 py-3 text-center">
              <p className="text-gray-800 font-bold text-sm">{lvl.label}</p>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #F97316, transparent)" }} />

            {/* 3-column stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 px-0 py-3">
              <div className="flex flex-col items-center px-2">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-1.5">
                  Argent rechargé
                </p>
                <p className="text-gray-900 font-extrabold text-sm">
                  {Number(lvl.recharged).toLocaleString("fr-FR")}
                </p>
                <p className="text-gray-400 text-[10px]">{currency}</p>
              </div>
              <div className="flex flex-col items-center px-2">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-1.5">
                  Nombre total de personnes
                </p>
                <p className="text-gray-900 font-extrabold text-sm">
                  {lvl.invested}/{lvl.total}
                </p>
              </div>
              <div className="flex flex-col items-center px-2">
                <p className="text-gray-400 text-[10px] text-center leading-tight mb-1.5">
                  Taux de commission
                </p>
                <p className="font-extrabold text-sm" style={{ color: "#F97316" }}>
                  {lvl.rate}
                </p>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
