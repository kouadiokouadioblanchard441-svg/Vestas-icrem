import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";


import nodataImg from "@assets/nodata-da225bbb_(1)_1783249133513.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";
import landscapeImg from "@assets/High-Efficiency-Cis-Solar-Panel-Monocrystalline-Solar-Module-_1783948797085.webp";

interface Deposit {
  id: number;
  userId: number;
  amount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface Withdrawal {
  id: number;
  userId: number;
  amount: string;
  netAmount: string;
  status: string;
  createdAt: string;
}

const BG = "#87CEEB";

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");

  const countryInfo = user ? getCountryByCode(user.country) : null;
  const currency = countryInfo?.currency || "USDT";

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits/history"],
  });

  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals/history"],
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "SUCCÈS";
      case "rejected":
        return "REFUSÉ";
      case "processing":
        return "EN TRAITEMENT";
      case "pending":
        return "EN ATTENTE";
      default:
        return status.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "#16a34a";
      case "rejected":
        return "#dc2626";
      default:
        return "#f59e0b";
    }
  };

  const generateTxId = (id: number, createdAt: string) => {
    const d = new Date(createdAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const hexPart = ((id * 0x9e3779b9 + 0xdeadbeef) >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
    return `T${datePart}${hexPart}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  };

  const getReference = (deposit: Deposit) => {
    return `DEP${deposit.id.toString().padStart(10, "0")}`;
  };


  if (!user) return null;

  const isLoading = activeTab === "deposits" ? depositsLoading : withdrawalsLoading;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>

      {/* ── Header ── */}
      <div className="flex items-center px-4 pt-6 pb-4 gap-3">
        <Link href="/account">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/60"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <p className="flex-1 text-center text-gray-800 font-extrabold text-lg pr-9">Détails</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-end px-8 gap-6 mb-4">
        <button
          onClick={() => setActiveTab("deposits")}
          className="pb-2 font-semibold text-base transition-all"
          style={{
            color: activeTab === "deposits" ? "#1a1a1a" : "rgba(0,0,0,0.40)",
            borderBottom: activeTab === "deposits" ? "3px solid #1a1a1a" : "3px solid transparent",
          }}
          data-testid="tab-deposits"
        >
          Recharger
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className="pb-2 font-semibold text-base transition-all"
          style={{
            color: activeTab === "withdrawals" ? "#1a1a1a" : "rgba(0,0,0,0.40)",
            borderBottom: activeTab === "withdrawals" ? "3px solid #1a1a1a" : "3px solid transparent",
          }}
          data-testid="tab-withdrawals"
        >
          Retirer
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : (activeTab === "deposits" ? deposits : withdrawals).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <img src={nodataImg} alt="Aucune donnée" className="w-28 h-28 object-contain opacity-90" />
            <p className="text-gray-600 text-sm">Aucune transaction pour le moment</p>
          </div>
        ) : activeTab === "deposits" ? (
          deposits.map((deposit) => {
            const statusColor = getStatusColor(deposit.status);
            const txId = generateTxId(deposit.id, deposit.createdAt);
            return (
              <div
                key={deposit.id}
                className="bg-white rounded-2xl shadow-sm"
                style={{ borderLeft: "4px solid #16a34a" }}
                data-testid={`deposit-item-${deposit.id}`}
              >
                <div className="px-4 py-3.5">
                  {/* TX ID */}
                  <p className="text-gray-400 text-xs font-mono mb-1">{txId}</p>

                  {/* Row: label+amount | status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "#16a34a" }}>
                        DÉPÔT {currency} {parseFloat(deposit.amount).toLocaleString("fr-FR")}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{formatDate(deposit.createdAt)}</p>
                    </div>
                    <span className="font-bold text-sm shrink-0" style={{ color: statusColor }}>
                      {getStatusLabel(deposit.status)}
                    </span>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          withdrawals.map((withdrawal) => {
            const statusColor = getStatusColor(withdrawal.status);
            const txId = generateTxId(withdrawal.id, withdrawal.createdAt);
            const netNum = withdrawal.netAmount ? parseFloat(withdrawal.netAmount) : null;
            return (
              <div
                key={withdrawal.id}
                className="bg-white rounded-2xl shadow-sm"
                style={{ borderLeft: "4px solid #dc2626" }}
                data-testid={`withdrawal-item-${withdrawal.id}`}
              >
                <div className="px-4 py-3.5">
                  {/* TX ID */}
                  <p className="text-gray-400 text-xs font-mono mb-1">{txId}</p>

                  {/* Row: label+amount | status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "#dc2626" }}>
                        RETRAIT {currency} {parseFloat(withdrawal.amount).toLocaleString("fr-FR")}
                      </p>
                      {netNum !== null && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {currency} {netNum.toLocaleString("fr-FR")}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs mt-0.5">{formatDate(withdrawal.createdAt)}</p>
                    </div>
                    <span className="font-bold text-sm shrink-0" style={{ color: statusColor }}>
                      {getStatusLabel(withdrawal.status)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <img src={landscapeImg} alt="SpolarPV" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
