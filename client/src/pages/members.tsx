import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronLeft, User, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { getCountryByCode } from "@/lib/countries";

interface TeamMember {
  id: number;
  fullName: string;
  phone: string;
  country: string;
  createdAt: string;
  totalInvested: number;
  vipLevel: number;
  bonusFromMember: number;
  hasActiveProduct: boolean;
}

interface TeamDetails {
  level1: TeamMember[];
  level2: TeamMember[];
  level3: TeamMember[];
}

function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  const start = phone.slice(0, 3);
  const end = phone.slice(-3);
  return `${start}*****${end}`;
}

const BLUE = "#315aab";
const BLUE_LIGHT = "#e8eef8";
const BLUE_MID = "#4a72c4";

const VIP_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "linear-gradient(135deg, #315aab 0%, #254a91 100%)", text: "#fff", label: "VIP 1" },
  2: { bg: "linear-gradient(135deg, #4a72c4 0%, #315aab 100%)", text: "#fff", label: "VIP 2" },
  3: { bg: "linear-gradient(135deg, #1a3a7a 0%, #0f2555 100%)", text: "#fff", label: "VIP 3" },
};

export default function MembersPage() {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: team, isLoading } = useQuery<TeamDetails>({
    queryKey: ["/api/team/details"],
  });

  const country = getCountryByCode(user?.country || "");
  const currency = country?.currency || "USDT";

  const levels = [
    { num: 1 as const, label: "Niveau 1", members: team?.level1 || [] },
    { num: 2 as const, label: "Niveau 2", members: team?.level2 || [] },
    { num: 3 as const, label: "Niveau 3", members: team?.level3 || [] },
  ];

  const activeMembers = levels[activeLevel - 1].members;
  const totalBonus = activeMembers.reduce((s, m) => s + (m.bonusFromMember || 0), 0);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f0f4fa" }}>

      {/* Header */}
      <div
        className="flex items-center px-4 py-4 shadow-md"
        style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #254a91 100%)` }}
      >
        <button
          onClick={() => navigate("/team")}
          className="p-1.5 rounded-full mr-2"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Users className="w-5 h-5 text-white/80" />
          <h1 className="text-white font-bold text-base">Mes Membres</h1>
        </div>
      </div>

      {/* Level tabs */}
      <div className="bg-white shadow-sm flex">
        {levels.map((level) => (
          <button
            key={level.num}
            onClick={() => setActiveLevel(level.num)}
            className="flex-1 py-3.5 text-sm font-semibold relative transition-colors"
            style={{ color: activeLevel === level.num ? BLUE : "#9ca3af" }}
          >
            {level.label}
            <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: activeLevel === level.num ? BLUE_LIGHT : "transparent",
                color: activeLevel === level.num ? BLUE : "#9ca3af",
              }}
            >
              {isLoading ? "—" : level.members.length}
            </span>
            {activeLevel === level.num && (
              <span
                className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                style={{ backgroundColor: BLUE }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Summary card */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm"
        style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #254a91 100%)` }}
      >
        <div className="flex divide-x divide-white/20">
          <div className="flex-1 px-5 py-4">
            <p className="text-white/70 text-xs font-medium mb-1">Total membres</p>
            <p className="text-white font-extrabold text-2xl">
              {isLoading ? "—" : activeMembers.length}
            </p>
          </div>
          <div className="flex-1 px-5 py-4">
            <p className="text-white/70 text-xs font-medium mb-1">Bonus reçus</p>
            <p className="text-red-300 font-extrabold text-2xl">
              {isLoading ? "—" : `${totalBonus.toFixed(0)} ${currency}`}
            </p>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="mx-4 mt-3 mb-8 space-y-2.5">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))
        ) : activeMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm text-center py-16 px-6 mt-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: BLUE_LIGHT }}
            >
              <User className="w-8 h-8" style={{ color: BLUE }} />
            </div>
            <p className="text-gray-700 text-sm font-semibold">
              Aucun membre au niveau {activeLevel}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Invitez des amis pour agrandir votre équipe
            </p>
          </div>
        ) : (
          activeMembers.map((member) => {
            const vip = VIP_COLORS[member.vipLevel] || VIP_COLORS[1];
            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Top strip */}
                <div
                  className="h-1 w-full"
                  style={{ background: vip.bg }}
                />

                <div className="flex items-center px-4 py-3.5 gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: BLUE_LIGHT }}
                  >
                    <User className="w-6 h-6" style={{ color: BLUE }} />
                  </div>

                  {/* Center info */}
                  <div className="flex-1 min-w-0">
                    {/* Phone */}
                    <p
                      className="font-bold text-base tracking-wider"
                      style={{ color: BLUE }}
                    >
                      {maskPhone(member.phone)}
                    </p>

                    {/* VIP badge */}
                    <span
                      className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: vip.bg, color: vip.text }}
                    >
                      {vip.label}
                    </span>
                  </div>

                  {/* Bonus */}
                  <div className="text-right shrink-0">
                    <p className="text-gray-400 text-xs font-medium mb-0.5">Bonus</p>
                    <p
                      className="font-extrabold text-base"
                      style={{ color: member.bonusFromMember > 0 ? BLUE : "#9ca3af" }}
                    >
                      {member.bonusFromMember.toFixed(0)}
                    </p>
                    <p className="text-gray-400 text-xs">{currency}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
