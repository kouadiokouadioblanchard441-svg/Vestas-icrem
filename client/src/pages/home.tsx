import { useAuth } from "@/lib/auth";
import { SiTelegram } from "react-icons/si";
import { useLocation } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { NEWS_ARTICLES } from "@/pages/news-detail";
import { getContent } from "@/lib/content";
import { ChevronLeft, ChevronRight } from "lucide-react";

const jollibeeLogo = "/spolarpv-logo.png";
import bellIcon from "@assets/d7d9f6f6-dddc-4071-8bc2-d6e7e589fbae_(1)_1783248684110.png";
import iconRecharger from "@assets/1-1_1783245823715.png";
import iconRetraits from "@assets/2-1_1783245823825.png";
import iconService from "@assets/3-1_1783245823860.png";

// 7 real SpolarPV exhibition photos (from spolarpv.com official)
const BANNER_SLIDES = [
  { src: "/banner/banner1.jpg", label: "SpolarPV — SNEC Shanghai 2024" },
  { src: "/banner/banner2.jpg", label: "SpolarPV — Thailand ASEW Expo" },
  { src: "/banner/banner4.jpg", label: "SpolarPV — Future Energy Africa" },
  { src: "/banner/banner5.jpg", label: "SpolarPV — Future Energy Show" },
  { src: "/banner/banner6.jpg", label: "SpolarPV — Future Energy Show" },
  { src: "/banner/banner7.jpg", label: "SpolarPV — International Meeting" },
  { src: "/banner/banner3.jpg", label: "SpolarPV — Elmia Solar Sweden" },
];

const DARK_ICON = { filter: "brightness(0) saturate(100%)" } as React.CSSProperties;

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = BANNER_SLIDES.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    touchStartX.current = null;
  };

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const resetTimer = (fn: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    fn();
    timerRef.current = setInterval(next, 4000);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-md"
      style={{ height: 210 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides — absolute stacking with opacity cross-fade */}
      {BANNER_SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img src={slide.src} alt={slide.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 55%)" }} />
          <p className="absolute bottom-8 left-3 right-10 text-white text-xs font-semibold drop-shadow leading-tight">
            {slide.label}
          </p>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={() => resetTimer(prev)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.35)", width: 28, height: 28 }}
        aria-label="Précédent"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={() => resetTimer(next)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.35)", width: 28, height: 28 }}
        aria-label="Suivant"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2 right-3 flex gap-1">
        {BANNER_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => resetTimer(() => setCurrent(i))}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 18 : 6,
              height: 6,
              background: i === current ? "#fff" : "rgba(255,255,255,0.45)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

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

  const signupBonus = settings?.signupBonus || "200";
  const level1Commission = settings?.level1Commission || "25";
  const telegramGroupLink = settings?.groupLink || "https://t.me/vestasgroup";
  const popupTitle = getContent(settings, "content_home_popupTitle", "NOTIFICATION");
  const popupLines = [
    getContent(settings, "content_home_popupLine1", `Prime d'inscription : ${parseInt(signupBonus).toLocaleString()} USDT.`),
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
      <div className="flex items-center px-4 py-2 bg-white shadow-sm">
        <img src={jollibeeLogo} alt="SpolarPV" className="h-10 w-auto object-contain" />
      </div>

      {/* ── Hero Banner (carrousel défilant) ── */}
      <div className="mx-3 mt-2">
        <HeroBanner />
      </div>

      {/* ── Quick Actions ── */}
      <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm px-4 py-4">
        <div className="flex justify-around items-center">
          <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-2" data-testid="button-depot">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconRecharger} alt="Deposit" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Deposit</span>
          </button>
          <button onClick={() => navigate("/withdrawal")} className="flex flex-col items-center gap-2" data-testid="button-retrait">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconRetraits} alt="Withdraw" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Withdraw</span>
          </button>
          <button onClick={() => navigate("/service")} className="flex flex-col items-center gap-2" data-testid="button-aide">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <img src={iconService} alt="Support" className="w-8 h-8 object-contain" style={DARK_ICON} />
            </div>
            <span className="text-gray-700 text-xs font-medium">Customer Service</span>
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

      <div className="pb-16" />
    </div>
  );
}
