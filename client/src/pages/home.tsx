import { useAuth } from "@/lib/auth";
import { SiTelegram } from "react-icons/si";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { NEWS_ARTICLES } from "@/pages/news-detail";
import { getContent } from "@/lib/content";

const jollibeeLogo = "/spolarpv-logo.svg";
import heroImg from "@assets/Philippines-Exhibition-May-19-2026-2_1783947359298.webp";
import bellIcon from "@assets/d7d9f6f6-dddc-4071-8bc2-d6e7e589fbae_(1)_1783248684110.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";
import iconService from "@assets/3-1_1783245823860.png";

const DARK_ICON = { filter: "brightness(0) saturate(100%)" } as React.CSSProperties;

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  // Show popup on mount and every time home tab is clicked
  useEffect(() => {
    setShowPopup(true);
    const handler = () => setShowPopup(true);
    window.addEventListener("home-tab-clicked", handler);
    return () => window.removeEventListener("home-tab-clicked", handler);
  }, []);

  useEffect(() => {
    const w = window as any;
    if (w._installPrompt) { setInstallPrompt(w._installPrompt); w._installPrompt = null; }
    if (w._appInstalled) setInstalled(true);
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!user) return null;

  const signupBonus = settings?.signupBonus || "500";
  const level1Commission = settings?.level1Commission || "25";
  const telegramGroupLink = settings?.groupLink || "https://t.me/vestasgroup";
  const popupTitle = getContent(settings, "content_home_popupTitle", "NOTIFICATION");
  const popupLines = [
    getContent(settings, "content_home_popupLine1", `Prime d'inscription : ${parseInt(signupBonus).toLocaleString()} FCFA.`),
    getContent(settings, "content_home_popupLine2", "Récompense de connexion quotidienne : 50 FCFA."),
    getContent(settings, "content_home_popupLine3", `Invitez vos subordonnés à investir et recevez une récompense en espèces de ${level1Commission}% du montant de leur investissement.`),
    getContent(settings, "content_home_popupLine4", "Il n'y a aucune limite quant au temps de retrait ou au nombre de retraits. Vous pouvez retirer de l'argent à tout moment."),
    getContent(settings, "content_home_popupLine5", "SpolarPV attache une grande importance au marché."),
  ];

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#87CEEB" }}>

      {/* ── POPUP NOTIFICATION ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.82)" }}
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "#87CEEB" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Bell icon */}
            <div className="flex justify-center pt-7 pb-2">
              <img src={bellIcon} alt="Notification" className="w-24 h-24 object-contain" />
            </div>

            {/* Title */}
            <p className="text-gray-900 font-extrabold text-xl text-center tracking-widest mb-4">{popupTitle}</p>

            {/* Numbered list */}
            <div className="px-6 pb-2 space-y-2">
              {popupLines.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gray-700/70 text-xs font-bold mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-gray-800/90 text-xs leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="px-5 pt-5 pb-6 space-y-3">
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3.5 bg-white rounded-full font-extrabold text-base text-gray-900"
                data-testid="button-popup-agree"
              >
                OK
              </button>
              <a
                href={telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-bold text-sm text-white"
                style={{ background: "linear-gradient(90deg, #6d28d9, #7c3aed)" }}
                onClick={() => setShowPopup(false)}
              >
                <SiTelegram className="w-4 h-4" />
                Aller sur Telegram &gt;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white shadow-sm">
        <img src={jollibeeLogo} alt="SpolarPV" className="h-10 w-auto object-contain" />
        <button
          onClick={() => navigate("/service")}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
        >
          Support
        </button>
      </div>

      {/* ── Hero Banner ── */}
      <div className="mx-3 mt-2">
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 210 }}>
          <img src={heroImg} alt="SpolarPV" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm px-4 py-4">
        <div className="flex justify-around items-center">
          <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-2" data-testid="button-depot">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconRecharger} alt="Dépôt" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Recharger</span>
          </button>
          <button onClick={() => navigate("/withdrawal")} className="flex flex-col items-center gap-2" data-testid="button-retrait">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconRetraits} alt="Retrait" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Retirer</span>
          </button>
          <button onClick={() => navigate("/service")} className="flex flex-col items-center gap-2" data-testid="button-aide">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconService} alt="Aide" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Service Client</span>
          </button>
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div className="mx-3 mt-3 space-y-3">
        <p className="text-gray-700 font-bold text-sm px-1">Centre d'informations</p>
        {NEWS_ARTICLES.map((article) => (
          <button
            key={article.id}
            onClick={() => navigate(`/news/${article.id}`)}
            className="w-full bg-white rounded-2xl shadow-sm overflow-hidden flex flex-row items-stretch text-left"
            data-testid={`news-card-${article.id}`}
          >
            {/* Thumbnail */}
            <div className="shrink-0 w-24" style={{ minHeight: 90 }}>
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                style={{ minHeight: 90 }}
              />
            </div>
            {/* Text */}
            <div className="flex-1 px-3 py-3 flex flex-col justify-between">
              <p className="text-gray-900 font-bold text-xs leading-snug line-clamp-2 mb-1">
                {article.title}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                {article.summary}
              </p>
              <p className="text-xs font-semibold mt-1" style={{ color: "#F59E0B" }}>
                {article.date}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="pb-24" />
    </div>
  );
}
