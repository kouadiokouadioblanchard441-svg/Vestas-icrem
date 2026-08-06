import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@shared/schema";

import productImgFallback from "@assets/vestas_112v_closeup_1783210181172.jpg";

/* ── Palette (identique à l'accueil) ─────────── */
const BG       = "#c8892a";   // fond ambré
const CARD_BG  = "#d9cfa8";   // carte gris chaud clair
const TAB_ACTIVE = "#c8892a"; // onglet actif (même que BG mais contrasté)
const TAB_BG   = "#d4a633";   // onglet inactif doré
const BUY_BG   = "#7a5215";   // bouton BUY brun foncé

const SERIES_TABS = ["TOUS", "SERIE A", "SERIE B"] as const;
type SeriesTab = typeof SERIES_TABS[number];

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  ownedCount?: number;
  series?: string;   // champ optionnel — ajouté par l'admin plus tard
}

export default function ProductsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<SeriesTab>("TOUS");

  const { data: products, isLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
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
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "USDT";

  const paidProducts = (products || []).filter(p => !p.isFree);

  const filtered = activeTab === "TOUS"
    ? paidProducts
    : paidProducts.filter(p => p.series === activeTab);

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

  return (
    <div className="flex flex-col min-h-full" style={{ background: BG }}>
      <div className="flex-1 overflow-y-auto pb-20 px-3 pt-4 space-y-4">

        {/* ── Titre ── */}
        <div className="flex justify-center">
          <div
            className="px-10 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            <p className="text-black font-extrabold text-xl tracking-widest">PRODUCTS</p>
          </div>
        </div>

        {/* ── Onglets série ── */}
        <div className="flex gap-3 flex-wrap">
          {SERIES_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full font-extrabold text-sm text-black tracking-wide active:scale-95 transition-transform shadow"
              style={{
                background: activeTab === tab
                  ? "rgba(255,255,255,0.55)"
                  : TAB_BG,
                border: activeTab === tab ? "2px solid rgba(0,0,0,0.25)" : "2px solid transparent",
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
            <p className="text-white/80 font-semibold text-sm">Aucun produit disponible</p>
          </div>
        ) : (
          filtered.map(product => {
            const img = product.imageUrl || productImgFallback;
            const isPending = purchaseMutation.isPending;
            const roi = Math.round(
              ((Number(product.totalReturn) - Number(product.price)) / Number(product.price)) * 100
            );
            return (
              <div
                key={product.id}
                className="rounded-2xl overflow-hidden shadow-lg"
                style={{ background: CARD_BG }}
                data-testid={`product-card-${product.id}`}
              >
                {/* ── Nom produit ── */}
                <div className="px-3 pt-3 pb-1">
                  <p className="font-extrabold italic text-black text-base">{product.name}</p>
                </div>

                {/* ── Image + Infos ── */}
                <div className="flex gap-3 px-3 pb-3">
                  {/* Image */}
                  <div className="shrink-0 rounded-xl overflow-hidden shadow" style={{ width: 120, height: 130 }}>
                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Infos + BUY */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <p className="text-black font-bold text-[11px] leading-snug">
                        PRIX : {Number(product.price).toLocaleString()} {currency}
                      </p>
                      <p className="text-black font-bold text-[11px] leading-snug">
                        REVENU JOURNALIER: {Number(product.dailyEarnings).toLocaleString()} {currency}
                      </p>
                      <p className="text-black font-bold text-[11px] leading-snug">
                        TOTAL DE RETOUR : {Number(product.totalReturn).toLocaleString()} {currency}
                      </p>
                      <p className="text-black font-bold text-[11px] leading-snug">
                        RETOUR: {roi}%
                      </p>
                      <p className="text-black font-bold text-[11px] leading-snug">
                        DURÉE: {product.cycleDays} JOURS
                      </p>
                    </div>

                    {/* BUY button */}
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={isPending}
                      className="mt-2 w-full py-2 rounded-full font-extrabold text-white text-sm tracking-widest shadow active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-1"
                      style={{ background: BUY_BG }}
                      data-testid={`button-purchase-${product.id}`}
                    >
                      {isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : "BUY"
                      }
                    </button>
                  </div>
                </div>

                {/* ── Barre de progression ── */}
                <div
                  className="mx-3 mb-3 rounded-full overflow-hidden flex items-center justify-center relative"
                  style={{ background: "white", height: 28 }}
                >
                  {/* Remplissage (0% pour produit non actif) */}
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-full"
                    style={{
                      width: product.isOwned ? "1%" : "0%",
                      background: BUY_BG,
                      transition: "width 0.5s ease",
                    }}
                  />
                  <span className="relative z-10 text-black font-bold text-sm">
                    {product.isOwned ? "En cours" : "0.00%"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
