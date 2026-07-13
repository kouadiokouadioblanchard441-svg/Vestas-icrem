import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getCountryByCode } from "@/lib/countries";
import { Loader2, Settings } from "lucide-react";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

const vestasLogo = "/spolarpv-logo.svg";
import serviceIcon from "@assets/20260311_214852_1773265973964.png";
import productImg1 from "@assets/vestas_112v_closeup_1783210181172.jpg";
import productImg2 from "@assets/vestas_112v_closeup_(1)_1783210181118.jpg";
import productImg3 from "@assets/vestas_112v_closeup_(2)_1783210180090.jpg";
import productImg4 from "@assets/images_(50)_1783210180466.jpeg";
import productImg5 from "@assets/images_(41)_1783210181134.jpeg";
import productImg6 from "@assets/images_(49)_1783210181155.jpeg";
import productImg7 from "@assets/images_(40)_1783210181193.jpeg";
import productImg8 from "@assets/images_(39)_1783210181215.jpeg";

const PRODUCT_IMAGES = [productImg1, productImg2, productImg3, productImg4, productImg5, productImg6, productImg7, productImg8];

interface ProductWithOwnership extends Product {
  isOwned: boolean;
  canClaimFree: boolean;
  ownedCount?: number;
}

export default function ProductsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: products, isLoading } = useQuery<ProductWithOwnership[]>({
    queryKey: ["/api/products"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`, {});
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      refreshUser();
      toast({ title: "Félicitations pour l'achat de votre produit", description: "Vous commencerez à recevoir des gains demain.", variant: "default" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  const balance = parseFloat(user.balance || "0");
  const country = getCountryByCode(user.country);
  const currency = country?.currency || "FCFA";
  const paidProducts = products?.filter(p => !p.isFree) || [];

  const handleBuy = (product: ProductWithOwnership) => {
    if (balance < Number(product.price)) {
      const manque = formatCurrency(Number(product.price) - balance, user.country);
      toast({
        title: "Solde insuffisant",
        description: `Il vous manque ${manque} pour acheter ce produit.`,
        variant: "destructive",
      });
      return;
    }
    purchaseMutation.mutate(product.id);
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#87CEEB" }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shadow-sm"
        style={{ background: "#87CEEB" }}
      >
        <img src={vestasLogo} alt="SpolarPV" className="h-8 w-auto object-contain" />
        <p className="text-gray-800 font-bold text-base">Nos Produits</p>
        <button onClick={() => navigate("/service")} className="flex items-center justify-center" data-testid="button-service">
          <img src={serviceIcon} alt="Service client" className="w-8 h-8 object-contain" />
        </button>
      </div>

      {/* Products list */}
      <div className="flex-1 overflow-y-auto pb-24 px-3 pt-3 space-y-3">
        {isLoading ? (
          <>
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </>
        ) : paidProducts.length > 0 ? (
          paidProducts.map((product, idx) => {
            const img = PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length];
            const isPending = purchaseMutation.isPending;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-row"
                data-testid={`product-card-${product.id}`}
              >
                {/* Image */}
                <div className="shrink-0 w-28" style={{ minHeight: 120 }}>
                  <img src={img} alt={product.name} className="w-full h-full object-cover" style={{ minHeight: 120 }} />
                </div>

                {/* Info */}
                <div className="flex-1 px-3 py-3 flex flex-col justify-between">
                  <div>
                    <p className="font-extrabold text-gray-800 text-sm mb-2">{product.name}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Prix</span>
                        <span className="font-bold text-xs text-gray-900">
                          {currency} {Number(product.price).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Rev./jour</span>
                        <span className="font-bold text-xs text-gray-900">
                          {currency} {Number(product.dailyEarnings).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Rev. total</span>
                        <span className="font-bold text-xs text-gray-900">
                          {currency} {Number(product.totalReturn).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">Durée</span>
                        <span className="font-bold text-xs text-gray-900">
                          {product.cycleDays} jours
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buy button */}
                  <button
                    onClick={() => handleBuy(product)}
                    disabled={isPending}
                    className="mt-2 w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #374151, #1F2937)" }}
                    data-testid={`button-purchase-${product.id}`}
                  >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Acheter"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">Aucun produit disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
