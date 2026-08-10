import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

// ── Types ────────────────────────────────────────────────────────────────────
interface HistoryItem {
  id: string;
  category: string;
  amount: string;
  status: string;
  description: string;
  createdAt: string;
  extra: {
    fees?: string | null;
    netAmount?: string | null;
    paymentMethod?: string | null;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatRef(id: string) {
  return `#${String(id).padStart(8, "0")}`;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  completed:   { label: "Complété",   color: "#16a34a", bg: "#dcfce7" },
  approved:    { label: "Arrivé",     color: "#16a34a", bg: "#dcfce7" },
  pending:     { label: "En attente", color: "#d97706", bg: "#fef9c3" },
  pending_2fa: { label: "2FA requis", color: "#d97706", bg: "#fef9c3" },
  processing:  { label: "En cours",  color: "#2563eb", bg: "#dbeafe" },
  rejected:    { label: "Rejeté",    color: "#dc2626", bg: "#fee2e2" },
  failed:      { label: "Échoué",    color: "#dc2626", bg: "#fee2e2" },
};

const CATEGORY_META: Record<string, { label: string; color: string; sign: "+" | "-"; emoji: string }> = {
  deposit:     { label: "Dépôt",              color: "#1d4ed8", sign: "+", emoji: "💳" },
  withdrawal:  { label: "Retrait",            color: "#dc2626", sign: "-", emoji: "🏧" },
  earning:     { label: "Gain produit",       color: "#16a34a", sign: "+", emoji: "📈" },
  commission:  { label: "Bonus parrainage",   color: "#16a34a", sign: "+", emoji: "🤝" },
  bonus:       { label: "Bonus",              color: "#16a34a", sign: "+", emoji: "🎁" },
  gift_code:   { label: "Code cadeau",        color: "#16a34a", sign: "+", emoji: "🎟️" },
  task_reward: { label: "Récompense tâche",   color: "#16a34a", sign: "+", emoji: "✅" },
  spin_reward: { label: "Récompense spin",    color: "#a21caf", sign: "+", emoji: "🎰" },
};

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? { label: category, color: "#6b7280", sign: "+" as const, emoji: "💰" };
}

// ── Receipt row ──────────────────────────────────────────────────────────────
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className={`text-xs ${bold ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"}`}>{value}</span>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { data: items = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/history/all"],
    staleTime: 0,
    refetchOnMount: true,
  });

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f3f4f6" }}>

      {/* Header */}
      <header className="flex items-center px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
          </button>
        </Link>
        <h1 className="flex-1 text-center font-extrabold text-gray-900 pr-8 text-lg tracking-wide">
          Historique
        </h1>
      </header>

      {/* List */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🧾</p>
            <p className="text-gray-400 text-sm font-semibold">Aucune transaction</p>
          </div>
        ) : (
          items.map((item) => {
            const cat  = getCategoryMeta(item.category);
            const st   = STATUS_MAP[item.status] ?? { label: item.status, color: "#6b7280", bg: "#f3f4f6" };
            const amt  = parseFloat(item.amount);
            const fees = item.extra.fees ? parseFloat(item.extra.fees) : null;
            const net  = item.extra.netAmount ? parseFloat(item.extra.netAmount) : null;

            return (
              <div
                key={item.id}
                data-testid={`history-item-${item.id}`}
                className="bg-white rounded-none shadow-sm"
                style={{
                  /* bord supérieur et inférieur plein, pas de radius pour l'effet ticket */
                  border: "1px solid #d1d5db",
                  borderRadius: 0,
                  position: "relative",
                  overflow: "visible",
                }}
              >
                {/* ─── En-tête du reçu ─────────────────────────────── */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid #e5e7eb", background: "#fafafa" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="font-extrabold text-sm text-gray-900 tracking-wide uppercase">
                      {cat.label}
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: st.bg, color: st.color }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* ─── Corps du reçu ───────────────────────────────── */}
                <div className="px-4 py-3 space-y-0.5">
                  <Row label="Référence" value={formatRef(item.id)} />
                  <Row label="Date" value={formatDate(item.createdAt)} />
                  {item.description && (
                    <Row label="Détail" value={item.description} />
                  )}
                  {item.extra.paymentMethod && (
                    <Row label="Méthode" value={item.extra.paymentMethod} />
                  )}
                </div>

                {/* ─── Séparateur perforé ───────────────────────────── */}
                <div
                  className="relative mx-0 my-0"
                  style={{
                    borderTop: "2px dashed #d1d5db",
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                >
                  {/* demi-cercles gauche et droite */}
                  <span
                    style={{
                      position: "absolute",
                      left: -9,
                      top: -9,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      display: "block",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: -9,
                      top: -9,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      display: "block",
                    }}
                  />
                </div>

                {/* ─── Montant (pied de reçu) ───────────────────────── */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Montant</span>
                    <span
                      className="font-black text-xl tracking-tight"
                      style={{ color: cat.sign === "+" ? "#16a34a" : "#dc2626" }}
                    >
                      {cat.sign}&nbsp;{amt.toLocaleString("fr-FR")}&nbsp;FCFA
                    </span>
                  </div>

                  {fees !== null && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">Frais</span>
                      <span className="text-xs font-semibold text-gray-600">−{fees.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  )}
                  {net !== null && fees !== null && (
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-400">Net reçu</span>
                      <span className="text-xs font-extrabold text-gray-900">{net.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
