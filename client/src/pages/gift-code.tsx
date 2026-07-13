import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Gift, Tag } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getContent } from "@/lib/content";

import jollibeeNight from "@assets/Philippines-Exhibition-May-19-2026-2_1783947359298.webp";
import landscapeImg from "@assets/High-Efficiency-Cis-Solar-Panel-Monocrystalline-Solar-Module-_1783948797085.webp";

export default function GiftCodePage() {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const headerTitle = getContent(settings, "content_giftcode_headerTitle", "Code Bonus");
  const infoLine1 = getContent(settings, "content_giftcode_infoLine1", "Entrez votre code bonus pour recevoir votre récompense instantanément");
  const infoLine2 = getContent(settings, "content_giftcode_infoLine2", "Les codes sont disponibles chaque soir à 17h GMT");
  const howToTitle = getContent(settings, "content_giftcode_howToTitle", "Comment obtenir des codes ?");
  const step1 = getContent(settings, "content_giftcode_step1", "Rejoignez notre canal Telegram officiel");
  const step2 = getContent(settings, "content_giftcode_step2", "Suivez les annonces chaque soir à 17h GMT");
  const step3 = getContent(settings, "content_giftcode_step3", "Copiez le code et collez-le ici avant expiration");

  const claimMutation = useMutation({
    mutationFn: async (giftCode: string) => {
      const response = await apiRequest("POST", "/api/gift-codes/claim", { code: giftCode });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: (data) => {
      refreshUser();
      setCode("");
      toast({
        title: "Félicitations !",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un code",
        variant: "destructive",
      });
      return;
    }
    claimMutation.mutate(code.trim());
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#87CEEB" }}>

      {/* Hero image with red overlay + header */}
      <div className="relative">
        <img
          src={jollibeeNight}
          alt="SpolarPV"
          className="w-full h-52 object-cover"
          data-testid="img-gift-banner"
        />
        {/* Red gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.70) 100%)" }}
        />

        {/* Header over image */}
        <div className="absolute top-0 left-0 right-0 flex items-center px-4 py-3">
          <Link href="/account">
            <button className="p-1.5 rounded-full bg-white/20" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <h1 className="flex-1 text-center text-base font-bold text-white pr-8">
            {headerTitle}
          </h1>
        </div>

        {/* Icon badge */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
          <Gift className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-10 pb-24 space-y-4">

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <p className="text-gray-700 text-sm font-medium">
            {infoLine1}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {infoLine2}
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4" style={{ color: "#F59E0B" }} />
            <span className="text-gray-800 font-semibold text-sm">Code cadeau</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Saisir le code ici"
              className="w-full px-4 py-3 rounded-xl border-2 text-center text-sm font-mono tracking-widest outline-none transition-colors"
              style={{
                borderColor: code ? "#F59E0B" : "#e5e7eb",
                color: "#1f2937",
              }}
              data-testid="input-gift-code"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={claimMutation.isPending}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
            data-testid="button-submit-code"
          >
            {claimMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Gift className="w-4 h-4" />
                Recevoir ma récompense
              </>
            )}
          </button>
        </div>

        {/* How to get codes */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-800 font-semibold text-sm mb-2">{howToTitle}</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white text-[10px] font-bold"
                style={{ backgroundColor: "#F59E0B" }}>1</div>
              <p className="text-gray-500 text-xs">{step1}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white text-[10px] font-bold"
                style={{ backgroundColor: "#F59E0B" }}>2</div>
              <p className="text-gray-500 text-xs">{step2}</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white text-[10px] font-bold"
                style={{ backgroundColor: "#F59E0B" }}>3</div>
              <p className="text-gray-500 text-xs">{step3}</p>
            </div>
          </div>
        </div>

      </div>
      <img src={landscapeImg} alt="SpolarPV" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
    </div>
  );
}
