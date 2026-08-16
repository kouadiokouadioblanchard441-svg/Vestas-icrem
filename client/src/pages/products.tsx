import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Product, ProductSeries } from "@shared/schema";

/* ── Palette ────────────────────────────────── */
const BG       = "#2d3816";
const CARD_BG  = "#4a5e22";
const TAB_ACTIVE_BG = "rgba(255,255,255,0.55)";
const TAB_BG   = "#5a7228";
const BUY_BG   = "#3d5818";

/* ── Arc-en-ciel pour la barre de progression ── */
// 0%→vert · 25%→jaune · 50%→orange · 75%→violet · 100%→rouge
const RAINBOW_STOPS: Array<[number, [number, number, number]]> = [
  [0,   [34,  197,  94]],   // vert
  [25,  [234, 179,   8]],   // jaune
  [50,  [249, 115,  22]],   // orange
  [75,  [139,  92, 246]],   // violet
  [100, [239,  68,  68]],   // rouge
];

function rainbowColor(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < RAINBOW_STOPS.length - 1; i++) {
    const [p0, c0] = RAINBOW_STOPS[i];
    const [p1, c1] = RAINBOW_STOPS[i + 1];
    if (clamped >= p0 && clamped <= p1) {
      const t = (clamped - p0) / (p1 - p0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
      return `rgb(${r},${g},${b})`;
    }
  }
  return "rgb(239,68,68)";
}

const ALL_TAB = "TOUS";

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  ownedCount?: number;
}

export default function ProductsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
  });

  const { data: series = [], isLoading: seriesLoading } = useQuery<ProductSeries[]>({
    queryKey: ["/api/product-series"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t.errorOccurred);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      toast({ title: t.purchaseSuccess, description: t.purchaseSuccessDescription });
    },
    onError: (error: any) => {
      toast({ title: error.message || t.errorOccurred, variant: "destructive" });
    },
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const currency = "FCFA";

  const paidProducts = (products || []).filter(p => !p.isFree);

  // Build tabs: ALL + active series
  const tabs: string[] = [ALL_TAB, ...series.filter(s => s.isActive).map(s => s.name)];
  // Series name→id map
  const seriesNameToId = new Map(series.map(s => [s.name, s.id]));

  const filtered = activeTab === ALL_TAB
    ? paidProducts
    : (() => {
        const sId = seriesNameToId.get(activeTab);
        return sId !== undefined ? paidProducts.filter(p => p.seriesId === sId) : [];
      })();

  const handleBuy = (product: ProductWithOwnership) => {
    if (balance < Number(product.price)) {
      const manque = formatCurrency(Number(product.price) - balance, user.country);
      toast({
        title: t.errorOccurred,
        description: t.productNeedMore.replace("{0}", manque),
        variant: "destructive",
      });
      return;
    }
    purchaseMutation.mutate(product.id);
  };

  const isLoading = productsLoading || seriesLoading;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>
      <div className="flex-1 overflow-y-auto pb-20 px-3 pt-4 space-y-4">

        {/* ── Titre ── */}
        <div className="flex justify-center">
          <div className="px-10 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.25)" }}>
            <p className="text-white font-extrabold text-xl tracking-widest">List of our products</p>
          </div>
        </div>

        {/* ── Onglets série (dynamiques) ── */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full font-extrabold text-sm text-white tracking-wide active:scale-95 transition-transform shadow"
              style={{
                background: activeTab === tab ? TAB_ACTIVE_BG : TAB_BG,
                border: activeTab === tab ? "2px solid rgba(0,0,0,0.25)" : "2px solid transparent",
                color: activeTab === tab ? "#2d3816" : "white",
              }}
              data-testid={`tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Liste produits ── */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/80 font-semibold text-sm">Aucun produit disponible dans cette série</p>
          </div>
        ) : (
          filtered.map(product => {
            const isPending = purchaseMutation.isPending && purchaseMutation.variables === product.id;
            const roi = Math.round(
              ((Number(product.totalReturn) - Number(product.price)) / Number(product.price)) * 100
            );
            const stock = Math.min(100, Math.max(0, Number(product.stockPercentage) || 0));
            const isSoldOut = stock >= 100;
            const barColor = rainbowColor(stock);
            return (
              <div
                key={product.id}
                className="rounded-2xl overflow-hidden shadow-lg relative"
                style={{ background: CARD_BG, opacity: isSoldOut ? 0.85 : 1 }}
                data-testid={`product-card-${product.id}`}
              >
                {/* ── Tampon FAKE 3D quand stock = 100% ── */}
                {isSoldOut && (
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                    style={{ transform: "rotate(-20deg)" }}
                  >
                    <span
                      className="font-black select-none"
                      style={{
                        fontSize: 72,
                        lineHeight: 1,
                        color: "#ff0000",
                        letterSpacing: "0.05em",
                        textShadow: "2px 2px 0 #aa0000, 4px 4px 0 #cc0000, 6px 6px 0 #dd0000, 8px 8px 14px rgba(0,0,0,0.7)",
                        WebkitTextStroke: "2px #990000",
                        opacity: 0.9,
                      }}
                    >
                      FAKE
                    </span>
                  </div>
                )}

                {/* ── Nom produit ── */}
                <div className="px-3 pt-3 pb-1">
                  <p className="font-extrabold italic text-white text-base">{product.name}</p>
                </div>

                {/* ── Image + Infos ── */}
                <div className="flex gap-3 px-3 pb-3">
                  <div className="shrink-0 rounded-xl overflow-hidden shadow" style={{ width: 120, height: 130 }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center px-2 text-center text-white/60 text-[10px]">
                        Image indisponible
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <p className="text-white font-bold text-[11px] leading-snug">
                        PRIX : {Number(product.price).toLocaleString()} {currency}
                      </p>
                      <p className="text-white font-bold text-[11px] leading-snug">
                        REVENU JOURNALIER: {Number(product.dailyEarnings).toLocaleString()} {currency}
                      </p>
                      <p className="text-white font-bold text-[11px] leading-snug">
                        TOTAL DE RETOUR : {Number(product.totalReturn).toLocaleString()} {currency}
                      </p>
                      <p className="text-white font-bold text-[11px] leading-snug">
                        RETOUR: {roi}%
                      </p>
                      <p className="text-white font-bold text-[11px] leading-snug">
                        DURÉE: {product.cycleDays} JOURS
                      </p>
                    </div>


                    {/* BUY button — désactivé si stock épuisé */}
                    <button
                      onClick={() => !isSoldOut && handleBuy(product)}
                      disabled={purchaseMutation.isPending || isSoldOut}
                      className="mt-2 w-full py-2 rounded-full font-extrabold text-white text-sm tracking-widest shadow active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-1"
                      style={{ background: isSoldOut ? "#6b7280" : BUY_BG }}
                      data-testid={`button-purchase-${product.id}`}
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isSoldOut ? "ÉPUISÉ" : "BUY"}
                    </button>
                  </div>
                </div>

                {/* ── Barre de progression arc-en-ciel ── */}
                <div
                  className="mx-3 mb-3 rounded-full overflow-hidden relative"
                  style={{ background: "rgba(255,255,255,0.25)", height: 28 }}
                >
                  {/* Remplissage coloré */}
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${stock}%`,
                      background: barColor,
                    }}
                  />
                  {/* Texte centré */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="relative z-10 text-white font-extrabold text-sm drop-shadow-md">
                      {stock}%
                    </span>
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
