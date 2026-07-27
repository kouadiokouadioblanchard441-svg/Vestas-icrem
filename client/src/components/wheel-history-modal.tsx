import { ChevronLeft, Trophy, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";

interface WheelHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string | Date) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function HistoryCard({ tx, noGainLabel }: { tx: Transaction; noGainLabel: string }) {
  const amount = parseFloat(tx.amount);
  const won = amount > 0;

  // Extract label from description "Gain roue : Label"
  const label = tx.description.replace(/^Gain roue\s*:\s*/i, "").trim() || "—";

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-2"
      style={{
        background: won
          ? "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.03))"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${won ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: won
            ? "linear-gradient(135deg, #b8860b, #ffd700)"
            : "rgba(255,255,255,0.08)",
        }}
      >
        {won ? (
          <Trophy className="w-5 h-5 text-white" />
        ) : (
          <span className="text-lg">🎡</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: won ? "#ffd700" : "rgba(255,255,255,0.5)" }}
        >
          {won ? label : noGainLabel}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {formatDate(tx.createdAt)}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p
          className="font-extrabold text-base"
          style={{
            color: won ? "#ffd700" : "rgba(255,255,255,0.25)",
            textShadow: won ? "0 0 10px rgba(255,215,0,0.4)" : "none",
          }}
        >
          {won ? `+${amount.toFixed(2)}` : "—"}
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>USDT</p>
      </div>
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

  const totalWon = (history ?? []).reduce((sum, tx) => sum + Math.max(0, parseFloat(tx.amount)), 0);
  const spinCount = history?.length ?? 0;

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
          height: 6,
          background:
            "repeating-linear-gradient(90deg, #b8860b 0px, #ffd700 6px, #ffec6e 10px, #ffd700 14px, #b8860b 20px)",
          flexShrink: 0,
        }}
      />

      {/* Header */}
      <div className="flex items-center px-4 py-4 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-full mr-3 active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h1
            className="font-extrabold text-xl tracking-wide"
            style={{ color: "#ffd700", textShadow: "0 0 16px rgba(255,215,0,0.5)" }}
          >
            {t.wheelHistoryTitle}
          </h1>
        </div>
        <div className="w-11" />
      </div>

      {/* Stats cards */}
      {!isLoading && spinCount > 0 && (
        <div className="px-4 mb-4 grid grid-cols-2 gap-3 shrink-0">
          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "linear-gradient(135deg, #1a0a6b, #2d0f9a)",
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            <p className="text-xs mb-1" style={{ color: "#a78bfa" }}>{t.wheelTotalRewardsLabel}</p>
            <p className="font-extrabold text-lg" style={{ color: "#ffd700" }}>
              {totalWon.toFixed(2)} USDT
            </p>
          </div>
          <div
            className="rounded-2xl p-3 text-center"
            style={{
              background: "linear-gradient(135deg, #1a0a6b, #2d0f9a)",
              border: "1px solid rgba(255,215,0,0.3)",
            }}
          >
            <p className="text-xs mb-1" style={{ color: "#a78bfa" }}>🎡 Tirages</p>
            <p className="font-extrabold text-lg" style={{ color: "#ffd700" }}>
              {spinCount}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#ffd700" }} />
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <span className="text-5xl">🎡</span>
            <p className="text-center font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t.wheelHistoryEmpty}
            </p>
          </div>
        ) : (
          history.map((tx) => (
            <HistoryCard key={tx.id} tx={tx} noGainLabel={t.wheelHistoryNoGain} />
          ))
        )}
      </div>
    </div>
  );
}
