import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

// ── Types ────────────────────────────────────────────────────────────────────
interface HistoryItem {
  id: string;
  category: string;       // deposit | withdrawal | earning | commission | bonus | gift_code | task_reward | spin_reward | …
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
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed:   { label: "Complété",   color: "#16a34a" },
  approved:    { label: "Arrivé",     color: "#16a34a" },
  pending:     { label: "En attente", color: "#d97706" },
  pending_2fa: { label: "2FA requis", color: "#d97706" },
  processing:  { label: "En cours",  color: "#2563eb" },
  rejected:    { label: "Rejeté",    color: "#dc2626" },
  failed:      { label: "Échoué",    color: "#dc2626" },
};

const CATEGORY_META: Record<string, { label: string; color: string; sign: "+" | "-" }> = {
  deposit:     { label: "Dépôt",              color: "#111827", sign: "+" },
  withdrawal:  { label: "Retrait",            color: "#dc2626", sign: "-" },
  earning:     { label: "Gain produit",       color: "#16a34a", sign: "+" },
  commission:  { label: "Bonus parrainage",   color: "#16a34a", sign: "+" },
  bonus:       { label: "Bonus",              color: "#16a34a", sign: "+" },
  gift_code:   { label: "Code cadeau",        color: "#16a34a", sign: "+" },
  task_reward: { label: "Récompense tâche",   color: "#16a34a", sign: "+" },
  spin_reward: { label: "Récompense spin",    color: "#16a34a", sign: "+" },
};

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? { label: category, color: "#6b7280", sign: "+" as const };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { data: items = [], isLoading } = useQuery<HistoryItem[]>({
    queryKey: ["/api/history/all"],
    staleTime: 0,          // toujours refetch à chaque visite
    refetchOnMount: true,
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Header */}
      <header className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
        <Link href="/account">
          <button className="p-1" data-testid="button-back">
            <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
          </button>
        </Link>
        <h1
          className="flex-1 text-center font-bold text-gray-900 pr-8"
          style={{ fontSize: 20, fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Historique
        </h1>
      </header>

      {/* List */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">Aucune transaction</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const cat  = getCategoryMeta(item.category);
            const st   = STATUS_MAP[item.status] ?? { label: item.status, color: "#6b7280" };
            const amt  = parseFloat(item.amount);
            const fees = item.extra.fees ? parseFloat(item.extra.fees) : null;
            const net  = item.extra.netAmount ? parseFloat(item.extra.netAmount) : null;

            return (
              <div
                key={item.id}
                className="px-5 py-5"
                style={{
                  borderTop: idx === 0 ? "1px solid #e5e7eb" : undefined,
                  borderBottom: "1px solid #e5e7eb",
                }}
                data-testid={`history-item-${item.id}`}
              >
                {/* Row 1 : date + statut */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500" style={{ fontSize: 13, fontFamily: "monospace" }}>
                    {formatDate(item.createdAt)}
                  </span>
                  <span
                    className="px-3 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      border: `1.5px solid ${st.color}`,
                      color: st.color,
                      background: "transparent",
                    }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* Row 2 : type badge + montant */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: `${cat.color}18`, color: cat.color }}
                  >
                    {cat.label}
                  </span>
                  <span className="font-black text-gray-900" style={{ fontSize: 17 }}>
                    {cat.sign} FCFA {amt.toLocaleString("fr-FR")}
                  </span>
                </div>

                {/* Row 3 : description */}
                {item.description && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-xs">{item.description}</span>
                  </div>
                )}

                {/* Row 4 : frais / net (withdrawal only) */}
                {fees !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-400 text-xs">Frais :</span>
                    <span className="text-gray-600 text-xs font-semibold">FCFA {fees.toLocaleString("fr-FR")}</span>
                  </div>
                )}
                {net !== null && fees !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">Montant net :</span>
                    <span className="text-gray-800 text-xs font-bold">FCFA {net.toLocaleString("fr-FR")}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
