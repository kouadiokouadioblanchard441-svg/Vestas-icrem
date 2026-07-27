import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";

interface FloatingWheelProps {
  bottomOffset?: number;
}

export function FloatingWheel({ bottomOffset = 24 }: FloatingWheelProps) {
  const [, navigate] = useLocation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  const [pos, setPos] = useState<{ right: number; bottom: number } | null>(null);

  useEffect(() => {
    // Position just above the support button (offset by 80px)
    setPos({ right: 18, bottom: bottomOffset + 120 });
  }, [bottomOffset]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!btnRef.current || pos === null) return;
    dragging.current = true;
    didDrag.current = false;
    btnRef.current.setPointerCapture(e.pointerId);
    startPos.current = { x: e.clientX, y: e.clientY };
    const rect = btnRef.current.getBoundingClientRect();
    startOffset.current = { x: rect.left, y: rect.top };
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || pos === null) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    const newLeft = startOffset.current.x + dx;
    const newTop = startOffset.current.y + dy;
    const btnSize = 64;
    const clampedLeft = Math.max(0, Math.min(window.innerWidth - btnSize, newLeft));
    const clampedTop = Math.max(0, Math.min(window.innerHeight - btnSize, newTop));
    setPos({
      right: window.innerWidth - clampedLeft - btnSize,
      bottom: window.innerHeight - clampedTop - btnSize,
    });
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (!didDrag.current) {
      navigate("/spin-wheel");
    }
  };

  if (pos === null) return null;

  return (
    <button
      ref={btnRef}
      aria-label="Roue de la fortune"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "fixed",
        right: pos.right,
        bottom: pos.bottom,
        zIndex: 200,
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "3px solid #ffd700",
        padding: 0,
        cursor: "grab",
        background: "radial-gradient(circle at 35% 35%, #cc1010, #8b0000)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.35), 0 0 12px rgba(255,215,0,0.4)",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Mini wheel SVG */}
      <svg width="34" height="34" viewBox="0 0 34 34" style={{ display: "block", flexShrink: 0 }}>
        {/* segments */}
        {[
          { color: "#315aab", start: 0 },
          { color: "#16a34a", start: 1 },
          { color: "#dc2626", start: 2 },
          { color: "#7c3aed", start: 3 },
          { color: "#ea580c", start: 4 },
          { color: "#ca8a04", start: 5 },
          { color: "#0891b2", start: 6 },
          { color: "#db2777", start: 7 },
        ].map(({ color, start }) => {
          const total = 8;
          const arc = (2 * Math.PI) / total;
          const a1 = start * arc - Math.PI / 2;
          const a2 = a1 + arc;
          const cx = 17, cy = 17, r = 14;
          const x1 = cx + Math.cos(a1) * r;
          const y1 = cy + Math.sin(a1) * r;
          const x2 = cx + Math.cos(a2) * r;
          const y2 = cy + Math.sin(a2) * r;
          return (
            <path
              key={start}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={color}
              stroke="#ffd700"
              strokeWidth="0.5"
            />
          );
        })}
        {/* gold outer ring */}
        <circle cx="17" cy="17" r="15" fill="none" stroke="#ffd700" strokeWidth="2" />
        {/* center */}
        <circle cx="17" cy="17" r="5" fill="#d946ef" stroke="#ffd700" strokeWidth="1" />
        <text x="17" y="20" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white">GO</text>
      </svg>
      <span style={{ fontSize: 9, color: "#ffd700", fontWeight: "bold", lineHeight: 1, letterSpacing: 0 }}>
        LOTERIE
      </span>
    </button>
  );
}
