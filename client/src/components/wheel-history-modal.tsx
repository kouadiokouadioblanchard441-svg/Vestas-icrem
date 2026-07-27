import { ChevronLeft, Loader2, TrendingUp, RotateCcw, XCircle, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";

interface WheelHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string | Date) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${accent}33`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: accent }}>{icon}</span>
        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
          {label}
        </p>
      </div>
      <p className="font-extrabold text-xl text-white">{value}</p>
      {sub && (
        <p className="text-xs" style={{ color: accent }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function HistoryRow({ tx, noGainLabel }: { tx: Transaction; noGainLabel: string }) {
  const amount = parseFloat(tx.amount);
  const won = amount > 0;
  const label = tx.description.replace(/^Gain roue\s*:\s*/i, "").trim() || "—";

  return (
    <div
      className="flex items-center gap-3 py-3 border-b"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: won
            ? "linear-gradient(135deg, #b8860b 0%, #ffd700 100%)"
            : "rgba(255,255,255,0.07)",
          border: won ? "none" : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {won ? (
          <img
            src="/trophy.jpg"
            alt="Trophée"
            className="w-full h-full rounded-full object-cover object-top"
          />
        ) : (
          <XCircle className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
        )}
      </div>

      {/* Label + date */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: won ? "#ffffff" : "rgba(255,255,255,0.38)" }}
        >
          {won ? label : noGainLabel}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          {formatDate(tx.createdAt)}
        </p>
      </div>

      {/* Amount badge */}
      {won ? (
        <div
          className="shrink-0 px-3 py-1 rounded-full text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,215,0,0.08))",
            border: "1px solid rgba(255,215,0,0.35)",
            color: "#ffd700",
          }}
        >
          +{amount.toFixed(2)} USDT
        </div>
      ) : (
        <div
          className="shrink-0 px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.22)",
          }}
        >
          — USDT
        </div>
      )}
    </div>
  );
}

export default function WheelHistoryModal({ open, onClose }: WheelHistoryModalProps) {
  const { t } = useI18n();

  const { data: history, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/spin-wheel/history"],
    enabled: open,
  });

  if (!open) return null;

  const totalWon = (history ?? []).reduce(
    (sum, tx) => sum + Math.max(0, parseFloat(tx.amount)),
    0,
  );
  const spinCount = history?.length ?? 0;
  const winCount = (history ?? []).filter((tx) => parseFloat(tx.amount) > 0).length;
  const winRate = spinCount > 0 ? Math.round((winCount / spinCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #cc1010 0%, #8b0000 40%, #5c0000 100%)",
      }}
    >
      {/* Gold rope */}
      <div
        style={{
          height: 5,
          background:
            "repeating-linear-gradient(90deg, #b8860b 0px, #ffd700 6px, #ffec6e 10px, #ffd700 14px, #b8860b 20px)",
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div
        className="flex items-center px-4 py-3 shrink-0"
        style={{
          background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,215,0,0.15)",
        }}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-full active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h1
            className="font-extrabold text-lg tracking-wide"
            style={{ color: "#ffd700", textShadow: "0 0 16px rgba(255,215,0,0.5)" }}
          >
            {t.wheelHistoryTitle}
          </h1>
        </div>
        <div className="w-11" />
      </div>

      {/* Stats strip */}
      {!isLoading && spinCount > 0 && (
        <div className="px-4 pt-4 pb-2 grid grid-cols-3 gap-2 shrink-0">
          <StatCard
            label="Total gagné"
            value={`${totalWon.toFixed(2)}`}
            sub="USDT"
            accent="#ffd700"
            icon={<Trophy className="w-4 h-4" />}
          />
          <StatCard
            label="Tirages"
            value={String(spinCount)}
            sub={`${winCount} gagnants`}
            accent="#a78bfa"
            icon={<RotateCcw className="w-4 h-4" />}
          />
          <StatCard
            label="Taux gain"
            value={`${winRate}%`}
            sub={winRate >= 50 ? "Bonne série !" : "Continuez !"}
            accent={winRate >= 50 ? "#4ade80" : "#fb923c"}
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Divider */}
      {!isLoading && spinCount > 0 && (
        <div className="mx-4 mt-2 mb-1 flex items-center gap-2 shrink-0">
          <div className="flex-1 h-px" style={{ background: "rgba(255,215,0,0.18)" }} />
          <p className="text-xs font-medium" style={{ color: "rgba(255,215,0,0.55)" }}>
            Historique des tirages
          </p>
          <div className="flex-1 h-px" style={{ background: "rgba(255,215,0,0.18)" }} />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#ffd700" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Chargement…
            </p>
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-4 text-center">
            <span className="text-6xl">🎡</span>
            <div>
              <p className="font-semibold text-white mb-1">{t.wheelHistoryEmpty}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Faites votre premier tirage pour voir vos résultats ici.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {history.map((tx) => (
              <HistoryRow key={tx.id} tx={tx} noGainLabel={t.wheelHistoryNoGain} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
