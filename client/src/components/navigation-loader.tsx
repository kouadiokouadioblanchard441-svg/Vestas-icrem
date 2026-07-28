import { useEffect, useState, useRef } from "react";

export default function NavigationLoader() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleStart = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);

      setVisible(true);
      showTimerRef.current = setTimeout(() => setAnimating(true), 10);

      hideTimerRef.current = setTimeout(() => {
        setAnimating(false);
        setTimeout(() => setVisible(false), 250);
      }, 500);
    };

    window.addEventListener("hashchange", handleStart);
    return () => {
      window.removeEventListener("hashchange", handleStart);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{
        opacity: animating ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl bg-black/80"
        style={{ width: 80, height: 80 }}
      >
        {/* Spinner */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          style={{ animation: "nav-spin 0.75s linear infinite" }}
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
          />
          <path
            d="M20 4 A16 16 0 0 1 36 20"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <style>{`
        @keyframes nav-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
