import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { getCountryByCode } from "@/lib/countries";
import { getContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export default function SalaryBonusPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [, navigate] = useLocation();

  const { data: teamStats } = useQuery<any>({
    queryKey: ["/api/team/stats"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  if (!user) return null;

  const headerTitle = getContent(settings, "content_salarybonus_headerTitle", "任务中心");

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "USDT";
  const level1Count = teamStats?.level1Count || 0;
  const totalCommission = parseFloat(teamStats?.totalCommission || "0");
  const totalPeople = (teamStats?.level1Count || 0) + (teamStats?.level2Count || 0) + (teamStats?.level3Count || 0);

  const levels = [
    { lv: 1, required: 3,   reward: 1000  },
    { lv: 2, required: 10,  reward: 3000  },
    { lv: 3, required: 30,  reward: 5000  },
    { lv: 4, required: 50,  reward: 10000 },
    { lv: 5, required: 100, reward: 20000 },
    { lv: 6, required: 200, reward: 50000 },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#315aab" }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 bg-white shadow-sm">
        <button
          onClick={() => navigate("/account")}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <p className="flex-1 text-center text-gray-900 font-extrabold text-lg pr-9">
          {headerTitle}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-16 px-3 pt-3 space-y-2">

        {/* ── Stats card ── */}
        <div
          className="rounded-xl px-4 py-3 flex items-center relative overflow-hidden"
          style={{ background: "linear-gradient(120deg, #1a3a6b, #2a4f96)" }}
        >
          <div className="flex-1 text-center">
            <p className="text-white font-extrabold text-lg">{currency} {totalCommission.toFixed(0)}</p>
            <p className="text-white/70 text-[11px] mt-0.5">{t.salaryTotalRewards}</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="flex-1 text-center">
            <p className="text-white font-extrabold text-lg">{totalPeople}</p>
            <p className="text-white/70 text-[11px] mt-0.5">{t.salaryTotalPeople}</p>
          </div>
        </div>

        {/* ── Level cards ── */}
        {levels.map(({ lv, required, reward }) => {
          const current = level1Count;
          const reached = current >= required;
          const progress = Math.min(current, required);

          return (
            <div
              key={lv}
              className="rounded-xl overflow-hidden shadow-sm flex"
              style={{ background: "#fff" }}
              data-testid={`level-card-${lv}`}
            >
              {/* Left bar */}
              <div
                className="flex items-center justify-center px-3 py-3"
                style={{ background: "linear-gradient(160deg, #E8192C, #ff5a5a)", minWidth: 56 }}
              >
                <p className="text-white font-extrabold text-sm">Lv{lv}</p>
              </div>

              {/* Content */}
              <div className="flex-1 px-3 py-2.5">
                <p className="text-gray-700 text-[11px] text-center leading-snug mb-2">
                  {t.salaryInviteDesc.replace("{0}", String(required))}{" "}
                  <span className="font-bold" style={{ color: "#E8192C" }}>{currency} {reward.toLocaleString()}</span>
                </p>

                {/* Stats row */}
                <div className="flex justify-around mb-2">
                  <div className="text-center">
                    <p className="text-gray-900 font-extrabold text-sm">{current}</p>
                    <p className="text-gray-400 text-[10px]">{t.salaryCurrent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-900 font-extrabold text-sm">{required}</p>
                    <p className="text-gray-400 text-[10px]">{t.salaryTarget}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-900 font-extrabold text-sm">{progress}/{required}</p>
                    <p className="text-gray-400 text-[10px]">{t.salaryProgress}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 rounded-full bg-gray-100 mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(progress / required) * 100}%`,
                      background: "linear-gradient(90deg, #E8192C, #ff5a5a)",
                    }}
                  />
                </div>

                {/* Button */}
                <button
                  className="w-full py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={reached
                    ? { background: "linear-gradient(90deg, #E8192C, #ff5a5a)", color: "#fff" }
                    : { background: "#F3F4F6", color: "#6B7280" }
                  }
                  data-testid={`button-level-${lv}`}
                >
                  {reached ? t.salaryClaim : t.salaryInProgress}
                </button>
              </div>
            </div>
          );
        })}

      </div>
      <img src={solarPanelImg} alt="Powerade" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
