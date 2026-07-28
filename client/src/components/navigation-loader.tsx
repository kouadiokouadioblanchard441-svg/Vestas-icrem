import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function NavigationLoader() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleStart = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      setVisible(true);
      // Small delay before animating in
      timerRef.current = setTimeout(() => setAnimating(true), 10);

      // Auto-hide after 600ms (page is rendered by then)
      hideTimerRef.current = setTimeout(() => {
        setAnimating(false);
        setTimeout(() => setVisible(false), 300);
      }, 600);
    };

    window.addEventListener("hashchange", handleStart);
    return () => {
      window.removeEventListener("hashchange", handleStart);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 z-[9999] pointer-events-none"
      style={{
        transform: `translateX(-50%) translateY(${animating ? "0" : "12px"})`,
        opacity: animating ? 1 : 0,
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="flex items-center gap-2 bg-[#1a1a1a] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg">
        <Loader2 className="w-4 h-4 animate-spin text-white/80" />
        <span>Chargement…</span>
      </div>
    </div>
  );
}
