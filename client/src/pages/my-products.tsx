import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getCountryByCode } from "@/lib/countries";
import { ChevronLeft, Loader2, Wind } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

import heroBanner from "@assets/portable-charger-power-banks_480x480_d6b67d82-6118-4295-be02-e_1784966597898.jpg";
import productImgFallback from "@assets/vestas_112v_closeup_1783210181172.jpg";
import iconWallet from "@assets/portefeuille-chaud-3d-icon-png-download-9878550_1783248791774.png";
import iconRevenu from "@assets/3309927_1783248791847.png";

export default function MyProductsPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const { data: userProducts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/user/products"],
  });

  if (!user) return null;

  const country = getCountryByCode(user.country);
  const currency = country?.currency || "USDT";

  const allProducts = userProducts || [];

  const totalEarned = allProducts.reduce((sum: number, p: any) => {
    return sum + parseFloat(p.totalEarned || "0");
  }, 0);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#315aab" }}>
      <div className="flex-1 overflow-y-auto pb-16">

        {/* Header */}
        <div className="flex items-center px-3 pt-4 pb-3">
          <Link href="/account">
            <button className="p-2 bg-white/20 rounded-full backdrop-blur-sm" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <p className="text-white text-xl font-black tracking-tight ml-3">{t.myProductsTitle}</p>
        </div>

        {/* Stats cards */}
        <div
          className="mx-3 mt-3 rounded-2xl shadow-md overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.60), rgba(0,0,0,0.40)), url(${heroBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="grid grid-cols-2 divide-x divide-white/20">
            <div className="px-4 py-4 flex items-center gap-3">
              <img src={iconWallet} alt="" className="w-10 h-10 object-contain shrink-0" />
              <div>
                <p className="text-white/80 text-xs mb-1">{t.myProductsDevice}</p>
                <p className="text-white font-black text-2xl">{allProducts.length}</p>
              </div>
            </div>
            <div className="px-4 py-4 flex items-center gap-3">
              <img src={iconRevenu} alt="" className="w-10 h-10 object-contain shrink-0" />
              <div>
                <p className="text-white/80 text-xs mb-1">{t.myProductsEarnings}</p>
                <p className="text-white font-black text-lg leading-tight">
                  {currency} {totalEarned.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 px-4 py-2.5 text-center">
            <p className="text-white/90 text-xs">{t.myProductsSettledEvery24h}</p>
          </div>
        </div>

        {/* Product cards */}
        <div className="px-3 mt-3 space-y-3">
          {isLoading ? null : allProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm flex flex-col items-center gap-3">
              <Wind className="w-12 h-12 text-gray-200" />
              <p className="text-gray-500 font-medium">{t.myProductsNone}</p>
              <p className="text-gray-400 text-sm">{t.myProductsNoneDesc}</p>
            </div>
          ) : (
            allProducts.map((up: any) => {
              const cycleDays = up.product?.cycleDays || 60;
              const daysRemaining = up.daysRemaining || 0;
              const daysCompleted = Math.max(0, cycleDays - daysRemaining);
              const dailyEarnings = Number(up.product?.dailyEarnings || 0);
              const earnedSoFar = parseFloat(up.totalEarned || "0");
              const progress = cycleDays > 0 ? Math.round((daysCompleted / cycleDays) * 100) : 0;

              return (
                <div
                  key={up.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  data-testid={`product-card-${up.id}`}
                >
                  {/* Top header */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
                  >
                    <p className="text-white font-bold text-sm">{up.product?.name || t.adminTabProducts}</p>
                    <span className="text-white/70 text-xs">{formatDateTime(up.purchasedAt)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={up.product?.imageUrl || productImgFallback}
                        alt={up.product?.name || t.adminTabProducts}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">{t.myProductsDailyRevenue}</span>
                        <span className="font-bold text-sm text-gray-900">
                          {currency} {dailyEarnings.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">{t.myProductsEarned}</span>
                        <span className="font-bold text-sm text-gray-900">
                          {currency} {earnedSoFar.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">{t.myProductsDuration}</span>
                        <span className="font-bold text-xs text-gray-700">
                          {daysCompleted}/{cycleDays} {t.myProductsDays}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 pb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-xs">{t.myProductsProgress}</span>
                      <span className="text-xs font-bold text-gray-900">{progress}%</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: "#e5e5e5" }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${progress}%`, background: "#00A651" }}
                      />
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div
                    className="px-4 py-2.5 text-center text-white text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, #06b6d4, #0e7490)" }}
                  >
                    {t.myProductsRevenueReceived} : {currency} {earnedSoFar.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
